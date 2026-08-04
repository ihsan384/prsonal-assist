import { supabase, isSupabaseConfigured } from '../supabase/supabase'
import { idb, STORES } from '../storage/IndexedDB'
import { memoryStore } from '../storage/MemoryStore'
import { Network } from '@capacitor/network'
import { Capacitor } from '@capacitor/core'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type SyncStatusType = 'offline' | 'online' | 'syncing' | 'synced' | 'failed'

export interface SyncLogEntry {
  id: string
  timestamp: string
  store: string
  operation: 'upload' | 'download' | 'delete'
  status: 'success' | 'failed' | 'skipped'
  recordCount: number
  durationMs: number
  retryCount: number
  errorMessage?: string
}

class RealtimeSyncEngine {
  status: SyncStatusType = 'offline'
  lastSyncTime: string | null = null
  pendingCount = 0

  private listeners: Set<(status: SyncStatusType, count: number) => void> = new Set()
  private realtimeChannel: RealtimeChannel | null = null
  private currentUserId: string | null = null
  private syncInProgress = false

  // Stub properties for settings compatibility
  get autoSync(): boolean { return true }
  set autoSync(_val: boolean) {}
  get syncWifiOnly(): boolean { return false }
  set syncWifiOnly(_val: boolean) {}
  get backgroundSync(): boolean { return true }
  set backgroundSync(_val: boolean) {}

  constructor() {
    this.status = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
    this.lastSyncTime = localStorage.getItem('ihsanos_last_sync_time')

    if (Capacitor.isNativePlatform()) {
      Network.getStatus().then(status => this.handleConnectionChange(status.connected))
      Network.addListener('networkStatusChange', status => this.handleConnectionChange(status.connected))
    } else if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange(true))
      window.addEventListener('offline', () => this.handleConnectionChange(false))
    }

    // Auto initialize realtime session
    setTimeout(() => {
      this.initRealtimeSession()
    }, 1000)
  }

  // ─── Subscription ──────────────────────────────────────────────────────

  subscribe(callback: (status: SyncStatusType, count: number) => void): () => void {
    this.listeners.add(callback)
    callback(this.status, 0)
    return () => { this.listeners.delete(callback) }
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.status, 0))
  }

  private handleConnectionChange(isOnline: boolean) {
    if (!isOnline) {
      this.status = 'offline'
      this.notify()
    } else {
      this.status = 'online'
      this.notify()
      this.initRealtimeSession()
    }
  }

  // ─── Realtime Session Initialization ─────────────────────────────────────

  async initRealtimeSession(): Promise<void> {
    if (!isSupabaseConfigured() || !navigator.onLine) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      if (!userId) {
        this.status = 'online'
        this.notify()
        return
      }

      if (this.currentUserId !== userId || !this.realtimeChannel) {
        this.currentUserId = userId
        // 1. Initial download sync
        await this.sync()
        // 2. Setup WebSocket channel subscription
        await this.setupRealtimeSubscription(userId)
      }
    } catch (err) {
      console.error('[RealtimeSyncEngine] Initialization error:', err)
      this.status = 'failed'
      this.notify()
    }
  }

  /** Subscribe to Supabase Realtime Postgres Changes */
  private async setupRealtimeSubscription(userId: string): Promise<void> {
    if (this.realtimeChannel) {
      await supabase.removeChannel(this.realtimeChannel)
      this.realtimeChannel = null
    }

    console.log('[RealtimeSyncEngine] Subscribing to Supabase Realtime for user:', userId)

    this.realtimeChannel = supabase
      .channel(`public_realtime_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          this.handleRealtimePayload(payload, userId)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[RealtimeSyncEngine] WebSocket connected — Realtime active!')
          this.status = 'synced'
          this.notify()
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('[RealtimeSyncEngine] Realtime connection state:', status)
          if (status === 'CHANNEL_ERROR') {
            this.status = 'failed'
            this.notify()
          }
        }
      })
  }

  /** Process incoming Supabase Realtime event payload from other logged-in devices */
  private handleRealtimePayload(payload: any, currentUserId: string) {
    const table = payload.table
    const eventType = payload.eventType

    if (!table) return

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const rawRecord = payload.new
      if (!rawRecord || (rawRecord.user_id && rawRecord.user_id !== currentUserId)) return
      
      const camelRecord = this.toCamelCase(rawRecord)
      memoryStore.applyRemoteRealtimeChange(table, camelRecord, false)
    } else if (eventType === 'DELETE') {
      const rawRecord = payload.old
      if (!rawRecord?.id) return
      
      memoryStore.applyRemoteRealtimeChange(table, { id: rawRecord.id }, true)
    }
  }

  /** Instantly push local user edits to Supabase (broadcasts to all other devices) */
  async pushLocalChange(storeName: string, record: any): Promise<void> {
    if (!isSupabaseConfigured() || !navigator.onLine) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) return

      const snakeRecord = this.toSnakeCase({
        ...record,
        userId,
        updatedAt: new Date().toISOString()
      })

      if (record.deleted) {
        await (supabase.from(storeName as any) as any)
          .delete()
          .eq('id', record.id)
          .eq('user_id', userId)
      } else {
        await (supabase.from(storeName as any) as any)
          .upsert(snakeRecord)
      }
      console.log(`[RealtimeSyncEngine] Instant pushed local edit to ${storeName}:`, record.id)
    } catch (err) {
      console.error(`[RealtimeSyncEngine] Push local change failed for ${storeName}:`, err)
    }
  }

  // ─── Initial Full Sync / Download ────────────────────────────────────────

  async sync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine || !isSupabaseConfigured()) return

    this.syncInProgress = true
    this.status = 'syncing'
    this.notify()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id
      if (!currentUserId) {
        this.status = 'online'
        this.notify()
        return
      }

      const skipStores = new Set([
        STORES.SYNC_QUEUE, STORES.BACKUP_HISTORY, STORES.SYNC_LOG, 
        STORES.ACTIVITY_LOG, STORES.CONFLICT_QUEUE, STORES.INTEGRATION_LOGS,
        STORES.NOTIFICATION_HISTORY, STORES.NOTIFICATION_SCHEDULES
      ])
      const storeEntries = Object.entries(STORES).filter(([, v]) => !skipStores.has(v as any))

      for (const [, storeName] of storeEntries) {
        try {
          // Download latest records from server
          const { data: serverRecords, error } = await (supabase.from(storeName as any) as any)
            .select('*')
            .eq('user_id', currentUserId)

          if (!error && serverRecords) {
            for (const rawRecord of serverRecords) {
              const camelRecord = this.toCamelCase(rawRecord)
              memoryStore.applyRemoteRealtimeChange(storeName as any, camelRecord, false)
            }
          }
        } catch (err) {
          console.error(`[RealtimeSyncEngine] Sync error on ${storeName}:`, err)
        }
      }

      this.lastSyncTime = new Date().toISOString()
      localStorage.setItem('ihsanos_last_sync_time', this.lastSyncTime)
      this.status = 'synced'
    } catch (err) {
      console.error('[RealtimeSyncEngine] Sync failed:', err)
      this.status = 'failed'
    } finally {
      this.syncInProgress = false
      this.notify()
    }
  }

  resetOnUserSwitch() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel)
      this.realtimeChannel = null
    }
    this.currentUserId = null
  }

  // ─── Diagnostics & Legacy Compatibility Methods ─────────────────────────────

  async updatePendingCount(): Promise<number> { return 0 }
  async getUploadQueue(): Promise<any[]> { return [] }
  async getConflictQueue(): Promise<any[]> { return [] }
  getRetryQueue(): any[] { return [] }
  async getFailedQueue(): Promise<any[]> { return [] }
  async getSyncLog(_limit?: number | string): Promise<SyncLogEntry[]> { return [] }
  async clearSyncLog(): Promise<void> {}
  async retryFailed(): Promise<void> {}
  async wipeCloudData(): Promise<void> {
    if (!isSupabaseConfigured()) return
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) return

    const skipStores = new Set([
      STORES.SYNC_QUEUE, STORES.BACKUP_HISTORY, STORES.SYNC_LOG, 
      STORES.ACTIVITY_LOG, STORES.CONFLICT_QUEUE, STORES.INTEGRATION_LOGS
    ])
    const storeEntries = Object.entries(STORES).filter(([, v]) => !skipStores.has(v as any))

    for (const [, storeName] of storeEntries) {
      try {
        await (supabase.from(storeName as any) as any).delete().eq('user_id', userId)
      } catch (err) {}
    }
  }
  async factoryReset(): Promise<void> {
    await this.wipeCloudData()
    memoryStore.clearMemory()
  }

  // ─── Key/Case Conversion Helpers ────────────────────────────────────────

  private toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) return obj.map(v => this.toSnakeCase(v))
    if (obj !== null && obj !== undefined && obj.constructor === Object) {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        acc[snakeKey] = this.toSnakeCase(obj[key])
        return acc
      }, {} as any)
    }
    return obj
  }

  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) return obj.map(v => this.toCamelCase(v))
    if (obj !== null && obj !== undefined && obj.constructor === Object) {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
        acc[camelKey] = this.toCamelCase(obj[key])
        return acc
      }, {} as any)
    }
    return obj
  }
}

export const syncEngine = new RealtimeSyncEngine()
