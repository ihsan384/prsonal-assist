import { supabase, isSupabaseConfigured } from '../supabase/supabase'
import { idb, STORES } from '../storage/IndexedDB'
import { memoryStore } from '../storage/MemoryStore'
import { generateId } from '@/utils/format'
import { Network } from '@capacitor/network'
import { Capacitor } from '@capacitor/core'

export type SyncStatusType = 'offline' | 'online' | 'syncing' | 'synced' | 'failed' | 'pending'

// ─── Sync Log Entry ────────────────────────────────────────────────────────

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

// ─── Retry Queue Entry ─────────────────────────────────────────────────────

interface RetryEntry {
  storeName: string
  recordId: string
  attempts: number
  nextRetryAt: number // epoch ms
}

// ─── Sync Settings Keys ────────────────────────────────────────────────────

const LS_AUTO_SYNC = 'ihsanos_sync_auto'
const LS_WIFI_ONLY = 'ihsanos_sync_wifi_only'
const LS_BG_SYNC = 'ihsanos_sync_background'
const LS_LAST_SYNC = 'ihsanos_last_sync_time'

// ─── Batch Size ────────────────────────────────────────────────────────────

const BATCH_SIZE = 50
const MAX_RETRY_ATTEMPTS = 3
const RETRY_BACKOFF_BASE_MS = 2000 // 2s, 4s, 8s

class SyncEngine {
  status: SyncStatusType = 'offline'
  lastSyncTime: string | null = null
  pendingCount = 0

  private listeners: Set<(status: SyncStatusType, pendingCount: number) => void> = new Set()
  private syncInProgress = false
  private retryQueue: Map<string, RetryEntry> = new Map() // key = `${storeName}:${recordId}`
  private retryTimer: ReturnType<typeof setTimeout> | null = null

  // ─── Persisted Settings ────────────────────────────────────────────────
  get autoSync(): boolean {
    return localStorage.getItem(LS_AUTO_SYNC) !== 'false'
  }
  set autoSync(value: boolean) {
    localStorage.setItem(LS_AUTO_SYNC, String(value))
  }

  get syncWifiOnly(): boolean {
    return localStorage.getItem(LS_WIFI_ONLY) === 'true'
  }
  set syncWifiOnly(value: boolean) {
    localStorage.setItem(LS_WIFI_ONLY, String(value))
  }

  get backgroundSync(): boolean {
    return localStorage.getItem(LS_BG_SYNC) !== 'false'
  }
  set backgroundSync(value: boolean) {
    localStorage.setItem(LS_BG_SYNC, String(value))
  }

  constructor() {
    this.status = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
    this.lastSyncTime = localStorage.getItem(LS_LAST_SYNC)

    if (Capacitor.isNativePlatform()) {
      Network.getStatus().then(status => {
        this.handleConnectionChange(status.connected)
      })
      Network.addListener('networkStatusChange', status => {
        this.handleConnectionChange(status.connected)
      })
    } else {
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => this.handleConnectionChange(true))
        window.addEventListener('offline', () => this.handleConnectionChange(false))
      }
    }

    // Background sync every 15s — only count pending and sync if due
    setInterval(() => {
      this.updatePendingCount()
      if (this.autoSync && this.backgroundSync && this.status === 'online' && !this.syncInProgress) {
        this.sync()
      }
    }, 15_000)

    // Initial pending count after DB is ready
    setTimeout(() => this.updatePendingCount(), 2000)
  }

  // ─── Subscription ──────────────────────────────────────────────────────

  subscribe(callback: (status: SyncStatusType, pendingCount: number) => void): () => void {
    this.listeners.add(callback)
    callback(this.status, this.pendingCount)
    return () => { this.listeners.delete(callback) }
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.status, this.pendingCount))
  }

  // ─── Connection Events ─────────────────────────────────────────────────

  private handleConnectionChange(isOnline: boolean) {
    this.status = isOnline ? 'online' : 'offline'
    this.notify()
    if (isOnline && this.autoSync) {
      // Small delay to let the network stabilize
      setTimeout(() => this.sync(), 1000)
    }
  }

  // ─── Pending Count ─────────────────────────────────────────────────────

  async updatePendingCount(): Promise<number> {
    try {
      const count = await idb.countAllPending()
      this.pendingCount = count
      if (this.status !== 'syncing' && this.status !== 'offline') {
        this.status = count > 0 ? 'pending' : 'synced'
      }
      this.notify()
      return count
    } catch (err) {
      console.error('[SyncEngine] Failed to count pending records:', err)
      return 0
    }
  }

  // ─── Key/Case Conversion ───────────────────────────────────────────────

  /** CamelCase → snake_case deep conversion */
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

  /** snake_case → camelCase deep conversion */
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

  // ─── Retry Queue ───────────────────────────────────────────────────────

  private addToRetryQueue(storeName: string, recordId: string, currentAttempts: number) {
    const key = `${storeName}:${recordId}`
    const attempts = currentAttempts + 1
    if (attempts > MAX_RETRY_ATTEMPTS) {
      // Give up — keep record locally as pending
      this.retryQueue.delete(key)
      console.warn(`[SyncEngine] Max retries reached for ${key}. Record stays pending.`)
      return
    }

    const delay = RETRY_BACKOFF_BASE_MS * Math.pow(2, currentAttempts) // 2s, 4s, 8s
    const nextRetryAt = Date.now() + delay

    this.retryQueue.set(key, { storeName, recordId, attempts, nextRetryAt })
    console.log(`[SyncEngine] Scheduled retry ${attempts}/${MAX_RETRY_ATTEMPTS} for ${key} in ${delay}ms`)

    // Schedule retry timer (reset if already set)
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = setTimeout(() => this.processRetryQueue(), delay + 100)
  }

  private async processRetryQueue() {
    if (!navigator.onLine || this.syncInProgress || !isSupabaseConfigured()) return

    const now = Date.now()
    const due = [...this.retryQueue.values()].filter(e => e.nextRetryAt <= now)
    if (due.length === 0) return

    console.log(`[SyncEngine] Processing ${due.length} retry entries`)
    await this.sync()
  }

  // ─── Main Sync ─────────────────────────────────────────────────────────

  async sync(): Promise<void> {
    if (this.syncInProgress) return
    if (!navigator.onLine) {
      this.status = 'offline'
      this.notify()
      return
    }

    if (!isSupabaseConfigured()) {
      // Supabase not configured — stay in online/pending state but don't error
      if (this.status !== 'offline') {
        this.status = this.pendingCount > 0 ? 'pending' : 'online'
        this.notify()
      }
      return
    }

    this.syncInProgress = true
    this.status = 'syncing'
    this.notify()

    let hadError = false

    try {
      // Skip settings/profile/sync_queue from data sync loop
      const skipStores = new Set([STORES.SYNC_QUEUE])
      const storeEntries = Object.entries(STORES).filter(([, v]) => !skipStores.has(v as any))

      for (const [, storeName] of storeEntries) {
        try {
          await this.syncStore(storeName as any)
        } catch (err) {
          console.error(`[SyncEngine] Failed to sync store "${storeName}":`, err)
          hadError = true
        }
      }

      this.lastSyncTime = new Date().toISOString()
      localStorage.setItem(LS_LAST_SYNC, this.lastSyncTime)

      await this.updatePendingCount()
      this.status = hadError ? 'failed' : (this.pendingCount > 0 ? 'pending' : 'synced')
    } catch (err) {
      console.error('[SyncEngine] Sync failed:', err)
      this.status = 'failed'
      hadError = true
    } finally {
      this.syncInProgress = false
      this.notify()
    }
  }

  /**
   * Sync a single store: batch upsert new/modified, delete soft-deleted records
   */
  private async syncStore(storeName: typeof STORES[keyof typeof STORES]): Promise<void> {
    const startMs = Date.now()

    // Use efficient index-based query if available
    let pending: any[]
    try {
      pending = await idb.getPendingSync<any>(storeName)
    } catch {
      const all = await idb.getAll<any>(storeName)
      pending = all.filter(r => r.pendingSync === true)
    }

    if (pending.length === 0) return

    const tableName = storeName

    // ── Separate deletes and upserts ───────────────────────────────────
    const toDelete = pending.filter(r => r.deleted === true)
    const toUpsert = pending.filter(r => !r.deleted)

    // ── Handle deletes ─────────────────────────────────────────────────
    for (const record of toDelete) {
      const retryKey = `${storeName}:${record.id}`
      const retryEntry = this.retryQueue.get(retryKey)
      const attempts = retryEntry?.attempts ?? 0

      const { error } = await supabase.from(tableName as any).delete().eq('id', record.id)
      if (!error) {
        await idb.delete(storeName, record.id)
        this.retryQueue.delete(retryKey)
        this.removeFromMemory(storeName, record.id)
        void this.writeSyncLog({ timestamp: new Date().toISOString(), store: storeName, operation: 'delete', status: 'success', recordCount: 1, durationMs: Date.now() - startMs, retryCount: attempts })
      } else {
        console.error(`[SyncEngine] Delete failed for ${tableName}:${record.id}`, error)
        this.addToRetryQueue(storeName, record.id, attempts)
        void this.writeSyncLog({ timestamp: new Date().toISOString(), store: storeName, operation: 'delete', status: 'failed', recordCount: 1, durationMs: Date.now() - startMs, retryCount: attempts + 1, errorMessage: error.message })
      }
    }

    // ── Handle batch upserts ───────────────────────────────────────────
    for (let i = 0; i < toUpsert.length; i += BATCH_SIZE) {
      const batch = toUpsert.slice(i, i + BATCH_SIZE)
      const batchStart = Date.now()

      // Build snake_case payloads, stripping frontend-only fields
      const payloads = batch.map(record => {
        const snake = this.toSnakeCase({ ...record })
        delete snake.pending_sync
        delete snake.last_synced_at
        if (storeName === STORES.HABITS) {
          if (snake.completed_today === undefined) snake.completed_today = false
          if (snake.week_days === undefined) snake.week_days = [true, true, true, true, true, true, true]
        }
        return snake
      })

      const { data: returnedData, error } = await supabase
        .from(tableName as any)
        .upsert(payloads, { onConflict: 'id' })
        .select('id, sync_version, updated_at')

      if (!error) {
        const serverVersionMap = new Map<string, number>(
          (returnedData ?? []).map((row: any) => [row.id, row.sync_version ?? 0])
        )

        const now = new Date().toISOString()
        const updatedRecords: any[] = []

        for (const record of batch) {
          const serverVersion = serverVersionMap.get(record.id)
          const retryKey = `${storeName}:${record.id}`

          if (serverVersion !== undefined && serverVersion > (record.syncVersion ?? 1)) {
            console.warn(`[SyncEngine] Conflict detected for ${tableName}:${record.id} — server wins (v${serverVersion} > local v${record.syncVersion})`)
          }

          const updated = { ...record, pendingSync: false, lastSyncedAt: now }
          updatedRecords.push(updated)
          this.retryQueue.delete(retryKey)
          this.updateInMemory(storeName, updated)
        }

        await idb.putBatch(storeName, updatedRecords)
        void this.writeSyncLog({ timestamp: new Date().toISOString(), store: storeName, operation: 'upload', status: 'success', recordCount: batch.length, durationMs: Date.now() - batchStart, retryCount: 0 })
      } else {
        console.error(`[SyncEngine] Batch upsert failed for ${tableName}:`, error)

        for (const record of batch) {
          const retryKey = `${storeName}:${record.id}`
          const retryEntry = this.retryQueue.get(retryKey)
          this.addToRetryQueue(storeName, record.id, retryEntry?.attempts ?? 0)
        }

        void this.writeSyncLog({ timestamp: new Date().toISOString(), store: storeName, operation: 'upload', status: 'failed', recordCount: batch.length, durationMs: Date.now() - batchStart, retryCount: 1, errorMessage: (error as any).message ?? 'Unknown error' })
        throw error
      }
    }
  }

  // ─── Memory Store Helpers ──────────────────────────────────────────────

  private removeFromMemory(storeName: string, id: string) {
    const memKey = storeName as keyof typeof memoryStore
    if (Array.isArray(memoryStore[memKey])) {
      (memoryStore[memKey] as any) = (memoryStore[memKey] as any[]).filter((item: any) => item.id !== id)
    }
  }

  private updateInMemory(storeName: string, record: any) {
    const memKey = storeName as keyof typeof memoryStore
    if (Array.isArray(memoryStore[memKey])) {
      const list = memoryStore[memKey] as any[]
      const idx = list.findIndex(i => i.id === record.id)
      if (idx >= 0) list[idx] = record
    } else if (storeName === STORES.SETTINGS) {
      memoryStore.settings = record
    } else if (storeName === STORES.PROFILE) {
      memoryStore.profile = record
    } else if (storeName === STORES.NUTRITION_GOALS) {
      memoryStore.nutritionGoals = record
    }
  }

  // ─── Sync Log ──────────────────────────────────────────────────────────

  private async writeSyncLog(entry: Omit<SyncLogEntry, 'id'>): Promise<void> {
    try {
      const record: SyncLogEntry = { id: generateId(), ...entry }
      await idb.put(STORES.SYNC_LOG, record)
    } catch {
      // Non-critical — never block sync on log failure
    }
  }

  /**
   * Retrieve the most recent sync log entries (newest first)
   */
  async getSyncLog(limit = 100): Promise<SyncLogEntry[]> {
    try {
      const all = await idb.getAll<SyncLogEntry>(STORES.SYNC_LOG)
      return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit)
    } catch {
      return []
    }
  }

  /**
   * Clear all sync log entries
   */
  async clearSyncLog(): Promise<void> {
    await idb.clearStore(STORES.SYNC_LOG)
  }

  // ─── Retry Failed ──────────────────────────────────────────────────────

  /**
   * Immediately retry all entries currently in the retry queue or pending in IndexedDB
   */
  async retryFailed(): Promise<void> {
    if (this.retryQueue.size === 0 && this.pendingCount === 0) {
      console.log('[SyncEngine] No failed entries in retry queue.')
      return
    }
    console.log(`[SyncEngine] Retrying ${this.retryQueue.size} failed entries and ${this.pendingCount} pending records...`)
    this.retryQueue.clear() // Clear retry attempt counters so records get fresh retry attempts
    await this.sync()
  }

  // ─── Wipe Cloud Data ───────────────────────────────────────────────────

  /**
   * Delete all records from every Supabase table.
   * Uses sync_version >= 0 filter which works with RLS.
   */
  async wipeCloudData(): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.')
    }

    const cloudTables = Object.values(STORES).filter(
      t => t !== STORES.SYNC_QUEUE && t !== STORES.BACKUP_HISTORY && t !== STORES.SYNC_LOG && t !== STORES.ACTIVITY_LOG
    )

    for (const table of cloudTables) {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .gte('sync_version', 0)

      if (error) {
        console.warn(`[SyncEngine] Could not wipe table "${table}":`, error.message)
      }
    }
  }

  // ─── Factory Reset ─────────────────────────────────────────────────────

  /**
   * Completely wipe all local data: IndexedDB, localStorage, sessionStorage,
   * and all service worker caches. Then reload the app.
   */
  async factoryReset(): Promise<void> {
    try {
      // 1. Clear all IDB object stores
      await idb.clearAll()
      // 2. Clear Web Storage
      localStorage.clear()
      sessionStorage.clear()
      // 3. Clear Service Worker caches
      if ('caches' in window) {
        const cacheKeys = await caches.keys()
        await Promise.all(cacheKeys.map(key => caches.delete(key)))
      }
      // 4. Reset in-memory state
      memoryStore.clearMemory()
      memoryStore.isLoaded = false
      ;(memoryStore as any).loadPromise = null
    } catch (err) {
      console.error('[SyncEngine] Factory reset error:', err)
      throw err
    }
  }
}

export const syncEngine = new SyncEngine()
