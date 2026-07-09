import { supabase, isSupabaseConfigured } from '../supabase/supabase'
import { idb, STORES } from '../storage/IndexedDB'
import { memoryStore } from '../storage/MemoryStore'

export type SyncStatusType = 'offline' | 'online' | 'syncing' | 'synced' | 'failed' | 'pending'

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

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange(true))
      window.addEventListener('offline', () => this.handleConnectionChange(false))
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

      const { error } = await supabase.from(tableName).delete().eq('id', record.id)
      if (!error) {
        // Hard-delete locally after cloud confirms
        await idb.delete(storeName, record.id)
        this.retryQueue.delete(retryKey)

        // Remove from memory arrays
        this.removeFromMemory(storeName, record.id)
      } else {
        console.error(`[SyncEngine] Delete failed for ${tableName}:${record.id}`, error)
        this.addToRetryQueue(storeName, record.id, attempts)
      }
    }

    // ── Handle batch upserts ───────────────────────────────────────────
    // Process in chunks of BATCH_SIZE
    for (let i = 0; i < toUpsert.length; i += BATCH_SIZE) {
      const batch = toUpsert.slice(i, i + BATCH_SIZE)

      // Build snake_case payloads, stripping frontend-only fields
      const payloads = batch.map(record => {
        const snake = this.toSnakeCase({ ...record })
        // Remove frontend-only fields not in Supabase schema
        delete snake.pending_sync
        delete snake.last_synced_at
        return snake
      })

      const { data: returnedData, error } = await supabase
        .from(tableName)
        .upsert(payloads, { onConflict: 'id' })
        .select('id, sync_version, updated_at')

      if (!error) {
        // Build a lookup of server-returned versions for conflict detection
        const serverVersionMap = new Map<string, number>(
          (returnedData ?? []).map((row: any) => [row.id, row.sync_version ?? 0])
        )

        const now = new Date().toISOString()
        const updatedRecords: any[] = []

        for (const record of batch) {
          const serverVersion = serverVersionMap.get(record.id)
          const retryKey = `${storeName}:${record.id}`

          // Conflict detection: if server version is ahead, server wins
          if (serverVersion !== undefined && serverVersion > (record.syncVersion ?? 1)) {
            console.warn(`[SyncEngine] Conflict detected for ${tableName}:${record.id} — server wins (v${serverVersion} > local v${record.syncVersion})`)
            // Keep local record but mark synced — server version takes precedence on next full pull
          }

          // Mark as synced locally
          const updated = {
            ...record,
            pendingSync: false,
            lastSyncedAt: now,
          }
          updatedRecords.push(updated)
          this.retryQueue.delete(retryKey)

          // Update memory store
          this.updateInMemory(storeName, updated)
        }

        // Batch write back to IndexedDB
        await idb.putBatch(storeName, updatedRecords)
      } else {
        console.error(`[SyncEngine] Batch upsert failed for ${tableName}:`, error)

        // Add each failed record to retry queue individually
        for (const record of batch) {
          const retryKey = `${storeName}:${record.id}`
          const retryEntry = this.retryQueue.get(retryKey)
          this.addToRetryQueue(storeName, record.id, retryEntry?.attempts ?? 0)
        }

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

  // ─── Wipe Cloud Data ───────────────────────────────────────────────────

  /**
   * Delete all records from every Supabase table.
   * Uses sync_version >= 0 filter which works with RLS.
   */
  async wipeCloudData(): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.')
    }

    const tables = Object.values(STORES).filter(t => t !== STORES.SYNC_QUEUE)

    for (const table of tables) {
      // Deletes all rows that have a sync_version column (all our tables do)
      const { error } = await supabase
        .from(table)
        .delete()
        .gte('sync_version', 0)

      if (error) {
        // Some tables may not exist yet in cloud — log but continue
        console.warn(`[SyncEngine] Could not wipe table "${table}":`, error.message)
      }
    }
  }
}

export const syncEngine = new SyncEngine()
