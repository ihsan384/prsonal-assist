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

    // Sync on startup (after small delay for network stability)
    setTimeout(() => {
      this.updatePendingCount()
      if (this.autoSync && this.status === 'online') {
        this.sync()
      }
    }, 3000)

    // Check for daily sync on window focus
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.updatePendingCount()
        if (this.autoSync && this.status === 'online' && !this.syncInProgress) {
          const lastSync = this.lastSyncTime ? new Date(this.lastSyncTime).getTime() : 0
          const oneDayMs = 24 * 60 * 60 * 1000
          if (Date.now() - lastSync > oneDayMs) {
            console.log('[SyncEngine] Daily sync triggered on focus')
            this.sync()
          }
        }
      })
    }

    // Periodically count pending records offline (every 60s) with no network request
    setInterval(() => {
      this.updatePendingCount()
    }, 60_000)
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

    let delay = 30000 // 30s
    if (attempts === 2) delay = 120000 // 2m
    else if (attempts >= 3) delay = 600000 // 10m
    
    const nextRetryAt = Date.now() + delay

    this.retryQueue.set(key, { storeName, recordId, attempts, nextRetryAt })
    console.log(`[SyncEngine] Scheduled retry ${attempts}/${MAX_RETRY_ATTEMPTS} for ${key} in ${delay}ms`)

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

    // Check Wi-Fi Only setting
    if (this.syncWifiOnly) {
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus()
        if (status.connectionType !== 'wifi') {
          console.log('[SyncEngine] Wifi-only mode active. Skipping sync on cellular/ethernet.')
          return
        }
      }
    }

    if (!isSupabaseConfigured()) {
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
      // Skip local management tables from cloud sync
      const skipStores = new Set([
        STORES.SYNC_QUEUE, 
        STORES.BACKUP_HISTORY, 
        STORES.SYNC_LOG, 
        STORES.ACTIVITY_LOG, 
        STORES.CONFLICT_QUEUE,
        STORES.INTEGRATION_LOGS,
        STORES.NOTIFICATION_HISTORY,
        STORES.NOTIFICATION_SCHEDULES
      ])
      const storeEntries = Object.entries(STORES).filter(([, v]) => !skipStores.has(v as any))

      for (const [, storeName] of storeEntries) {
        try {
          // 1. Download server modifications
          await this.downloadStore(storeName as any)

          // 2. Upload pending modifications
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

      // Auto update native widget payload on completion
      import('@/services/native/WidgetRepository').then(({ widgetRepository }) => {
        widgetRepository.updateWidgetPayload().catch(e => console.error(e))
      })
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
   * Two-way Download Sync: Fetch server modifications and detect conflicts
   */
  private async downloadStore(storeName: typeof STORES[keyof typeof STORES]): Promise<void> {
    const tableName = storeName
    const lastSync = this.lastSyncTime || '1970-01-01T00:00:00.000Z'

    const { data: serverRecords, error } = await supabase
      .from(tableName as any)
      .select('*')
      .gt('updated_at', lastSync)

    if (error) {
      console.error(`[SyncEngine] Download failed for ${tableName}:`, error)
      throw error
    }

    if (!serverRecords || serverRecords.length === 0) return

    console.log(`[SyncEngine] Downloaded ${serverRecords.length} records for ${tableName}`)

    const nowStr = new Date().toISOString()
    const updatedLocally: any[] = []

    for (const sRaw of serverRecords) {
      const serverRecord = this.toCamelCase(sRaw)
      const localRecord = await idb.get<any>(storeName, serverRecord.id)

      if (!localRecord) {
        const newRecord = { ...serverRecord, pendingSync: false, lastSyncedAt: nowStr }
        updatedLocally.push(newRecord)
        this.updateInMemory(storeName, newRecord)
        continue
      }

      if (localRecord.pendingSync) {
        if (serverRecord.syncVersion !== localRecord.syncVersion) {
          console.warn(`[SyncEngine] Conflict detected in ${tableName}:${localRecord.id}`)
          
          await idb.put(STORES.CONFLICT_QUEUE, {
            id: localRecord.id,
            table: storeName,
            localData: localRecord,
            serverData: serverRecord,
            resolved: false,
            timestamp: nowStr
          })
          
          const conflictedLocal = { ...localRecord, syncStatus: 'conflict' }
          updatedLocally.push(conflictedLocal)
          this.updateInMemory(storeName, conflictedLocal)
        }
      } else {
        const updated = { ...serverRecord, pendingSync: false, lastSyncedAt: nowStr }
        updatedLocally.push(updated)
        this.updateInMemory(storeName, updated)
      }
    }

    if (updatedLocally.length > 0) {
      await idb.putBatch(storeName, updatedLocally)
    }
  }


  /**
   * Sync a single store: batch upsert new/modified, delete soft-deleted records
   */
  private async syncStore(storeName: typeof STORES[keyof typeof STORES]): Promise<void> {
    const startMs = Date.now()

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
      const attempts = (retryEntry?.attempts ?? 0) + 1

      const { error } = await supabase.from(tableName as any).delete().eq('id', record.id)
      if (!error) {
        await idb.delete(storeName, record.id)
        this.retryQueue.delete(retryKey)
        this.removeFromMemory(storeName, record.id)
        void this.writeSyncLog({ timestamp: new Date().toISOString(), store: storeName, operation: 'delete', status: 'success', recordCount: 1, durationMs: Date.now() - startMs, retryCount: attempts - 1 })
      } else {
        console.error(`[SyncEngine] Delete failed for ${tableName}:${record.id}`, error)
        this.addToRetryQueue(storeName, record.id, attempts - 1)
        
        const nowStr = new Date().toISOString()
        const updated = {
          ...record,
          syncStatus: 'failed',
          retryCount: attempts,
          lastRetry: nowStr,
          lastError: error.message
        }
        await idb.put(storeName, updated)
        this.updateInMemory(storeName, updated)
        
        void this.writeSyncLog({ timestamp: new Date().toISOString(), store: storeName, operation: 'delete', status: 'failed', recordCount: 1, durationMs: Date.now() - startMs, retryCount: attempts, errorMessage: error.message })
      }
    }

    // ── Handle batch upserts ───────────────────────────────────────────
    for (let i = 0; i < toUpsert.length; i += BATCH_SIZE) {
      const batch = toUpsert.slice(i, i + BATCH_SIZE)
      const batchStart = Date.now()

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

          const updated = { 
            ...record, 
            pendingSync: false, 
            lastSyncedAt: now,
            syncStatus: 'success',
            retryCount: 0,
            lastRetry: now,
            lastError: null
          }
          updatedRecords.push(updated)
          this.retryQueue.delete(retryKey)
          this.updateInMemory(storeName, updated)
        }

        await idb.putBatch(storeName, updatedRecords)
        void this.writeSyncLog({ timestamp: new Date().toISOString(), store: storeName, operation: 'upload', status: 'success', recordCount: batch.length, durationMs: Date.now() - batchStart, retryCount: 0 })
      } else {
        console.error(`[SyncEngine] Batch upsert failed for ${tableName}:`, error)

        const nowStr = new Date().toISOString()
        const failedRecords: any[] = []
        for (const record of batch) {
          const retryKey = `${storeName}:${record.id}`
          const retryEntry = this.retryQueue.get(retryKey)
          const attempts = (retryEntry?.attempts ?? 0) + 1
          this.addToRetryQueue(storeName, record.id, retryEntry?.attempts ?? 0)

          const updated = {
            ...record,
            syncStatus: 'failed',
            retryCount: attempts,
            lastRetry: nowStr,
            lastError: (error as any).message ?? 'Unknown error'
          }
          failedRecords.push(updated)
          this.updateInMemory(storeName, updated)
        }

        await idb.putBatch(storeName, failedRecords)
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

  // ─── Queue Getters ────────────────────────────────────────────────────

  async getUploadQueue(): Promise<any[]> {
    const list: any[] = []
    const skipStores = new Set<string>([
      STORES.SYNC_QUEUE, STORES.BACKUP_HISTORY, STORES.SYNC_LOG, STORES.ACTIVITY_LOG,
      STORES.CONFLICT_QUEUE, STORES.INTEGRATION_LOGS, STORES.NOTIFICATION_HISTORY, STORES.NOTIFICATION_SCHEDULES
    ])
    for (const storeName of Object.values(STORES)) {
      if (skipStores.has(storeName)) continue
      try {
        const pending = await idb.getAll<any>(storeName as any)
        const filtered = pending.filter(r => r.pendingSync === true && r.syncStatus !== 'conflict' && r.syncStatus !== 'failed')
        filtered.forEach(r => list.push({ id: r.id, table: storeName, name: r.name || r.title || r.question || r.id, status: r.syncStatus || 'pending' }))
      } catch {}
    }
    return list
  }

  async getFailedQueue(): Promise<any[]> {
    const list: any[] = []
    const skipStores = new Set<string>([
      STORES.SYNC_QUEUE, STORES.BACKUP_HISTORY, STORES.SYNC_LOG, STORES.ACTIVITY_LOG,
      STORES.CONFLICT_QUEUE, STORES.INTEGRATION_LOGS, STORES.NOTIFICATION_HISTORY, STORES.NOTIFICATION_SCHEDULES
    ])
    for (const storeName of Object.values(STORES)) {
      if (skipStores.has(storeName)) continue
      try {
        const pending = await idb.getAll<any>(storeName as any)
        const filtered = pending.filter(r => r.syncStatus === 'failed')
        filtered.forEach(r => list.push({ id: r.id, table: storeName, name: r.name || r.title || r.question || r.id, error: r.lastError || 'Upload failed' }))
      } catch {}
    }
    return list
  }

  async getConflictQueue(): Promise<any[]> {
    try {
      return await idb.getAll<any>(STORES.CONFLICT_QUEUE)
    } catch {
      return []
    }
  }

  getRetryQueue(): any[] {
    const list: any[] = []
    this.retryQueue.forEach((val) => {
      list.push({
        id: val.recordId,
        table: val.storeName,
        attempts: val.attempts,
        nextRetryAt: new Date(val.nextRetryAt).toLocaleTimeString()
      })
    })
    return list
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
