import { supabase, isSupabaseConfigured } from '../supabase/supabase'
import { idb, STORES } from '../storage/IndexedDB'
import { memoryStore } from '../storage/MemoryStore'

export type SyncStatusType = 'offline' | 'online' | 'syncing' | 'synced' | 'failed' | 'pending'

class SyncEngine {
  status: SyncStatusType = 'offline'
  lastSyncTime: string | null = null
  pendingCount = 0
  private listeners: Set<(status: SyncStatusType, pendingCount: number) => void> = new Set()
  private syncInProgress = false

  // Settings
  autoSync = true
  syncWifiOnly = false
  backgroundSync = true

  constructor() {
    this.status = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
    this.lastSyncTime = localStorage.getItem('ihsanos_last_sync_time')
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange(true))
      window.addEventListener('offline', () => this.handleConnectionChange(false))
    }

    // Periodically count pending records and trigger background sync
    setInterval(() => {
      this.updatePendingCount()
      if (this.autoSync && this.status === 'online' && !this.syncInProgress) {
        this.sync()
      }
    }, 15000)
    
    // Initial check
    setTimeout(() => {
      this.updatePendingCount()
    }, 2000)
  }

  subscribe(callback: (status: SyncStatusType, pendingCount: number) => void) {
    this.listeners.add(callback)
    callback(this.status, this.pendingCount)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.status, this.pendingCount))
  }

  private handleConnectionChange(isOnline: boolean) {
    this.status = isOnline ? 'online' : 'offline'
    this.notify()
    if (isOnline && this.autoSync) {
      this.sync()
    }
  }

  async updatePendingCount(): Promise<number> {
    let count = 0
    try {
      const stores = Object.values(STORES)
      for (const storeName of stores) {
        const records = await idb.getAll<any>(storeName)
        count += records.filter(r => r.pendingSync === true).length
      }
      this.pendingCount = count
      this.notify()
    } catch (err) {
      console.error('[SyncEngine] Failed to count pending records:', err)
    }
    return count
  }

  // Convert CamelCase to SnakeCase helper
  private toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(v => this.toSnakeCase(v))
    } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
        result[snakeKey] = this.toSnakeCase(obj[key])
        return result
      }, {} as any)
    }
    return obj
  }

  // Convert SnakeCase to CamelCase helper
  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(v => this.toCamelCase(v))
    } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
        result[camelKey] = this.toCamelCase(obj[key])
        return result
      }, {} as any)
    }
    return obj
  }

  async sync(): Promise<void> {
    if (this.syncInProgress) return
    if (!navigator.onLine) {
      this.status = 'offline'
      this.notify()
      return
    }

    if (!isSupabaseConfigured()) {
      // Supabase is still placeholder, silently keep offline
      this.status = 'online'
      this.notify()
      return
    }

    this.syncInProgress = true
    this.status = 'syncing'
    this.notify()

    try {
      const stores = Object.entries(STORES)

      for (const [storeKey, storeName] of stores) {
        const allRecords = await idb.getAll<any>(storeName)
        const pending = allRecords.filter(r => r.pendingSync === true)

        if (pending.length === 0) continue

        // Database table name in Supabase is lowercase storeKey/storeName
        const tableName = storeName

        for (const record of pending) {
          if (record.deleted) {
            // Soft-deleted record -> Delete from Cloud, then hard delete locally
            const { error } = await supabase.from(tableName).delete().eq('id', record.id)
            if (!error) {
              await idb.delete(storeName, record.id)
              // Update in-memory lists
              const memKey = storeName as keyof typeof memoryStore
              if (Array.isArray(memoryStore[memKey])) {
                (memoryStore[memKey] as any) = (memoryStore[memKey] as any).filter((item: any) => item.id !== record.id)
              }
            } else {
              throw error
            }
          } else {
            // New or modified record -> Upload/Upsert to Supabase
            // Map payload keys to match database schema
            const snakeRecord = this.toSnakeCase(record)
            
            // Delete frontend-only pendingSync flag from payload
            delete snakeRecord.pending_sync

            const { error } = await supabase.from(tableName).upsert(snakeRecord)
            if (!error) {
              // Update sync markers locally
              record.pendingSync = false
              record.lastSyncedAt = new Date().toISOString()
              await idb.put(storeName, record)
              
              // Sync to in-memory list
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
            } else {
              throw error
            }
          }
        }
      }

      this.lastSyncTime = new Date().toISOString()
      localStorage.setItem('ihsanos_last_sync_time', this.lastSyncTime)
      
      await this.updatePendingCount()
      this.status = this.pendingCount > 0 ? 'pending' : 'synced'
    } catch (err) {
      console.error('[SyncEngine] Sync failed:', err)
      this.status = 'failed'
    } finally {
      this.syncInProgress = false
      this.notify()
    }
  }

  // Wipes all cloud data by deleting records from all Supabase tables
  async wipeCloudData(): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.')
    }
    const tables = Object.values(STORES)
    for (const table of tables) {
      // Deletes all rows since no filter defaults to rejecting, we eq standard columns
      const { error } = await supabase.from(table).delete().neq('id', 'non-existent-id')
      if (error) {
        console.error(`[SyncEngine] Failed to delete table ${table}:`, error)
      }
    }
  }
}

export const syncEngine = new SyncEngine()
