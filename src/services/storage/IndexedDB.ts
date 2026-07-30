/**
 * Standard HTML5 IndexedDB Service
 * Reusable zero-dependency async wrapper for local browser database
 * Version 3: adds BACKUP_HISTORY, SYNC_LOG, ACTIVITY_LOG stores
 */

const DB_VERSION = 6

export const STORES = {
  TASKS: 'tasks',
  HABITS: 'habits',
  GOALS: 'goals',
  WORKOUTS: 'workouts',
  MEALS: 'meals',
  SLEEP_LOGS: 'sleep_logs',
  KNOWLEDGE: 'knowledge',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  WATER_LOGS: 'water_logs',
  NUTRITION_GOALS: 'nutrition_goals',
  STUDY_SESSIONS: 'study_sessions',

  // Study ERP stores
  SUBJECTS: 'subjects',
  CHAPTERS: 'chapters',
  TOPICS: 'topics',
  SESSIONS: 'sessions',
  REVISIONS: 'revisions',
  QUESTIONS: 'questions',
  TESTS: 'tests',
  MISTAKES: 'mistakes',
  FORMULAS: 'formulas',
  NOTES: 'notes',

  // Reflection & Motivation stores
  REFLECTION_ENTRIES: 'reflection_entries',
  MOTIVATION_QUOTES: 'motivation_quotes',
  MOTIVATION_NOTES: 'motivation_notes',
  MOTIVATION_COLLECTIONS: 'motivation_collections',
  CUSTOM_MOTIVATION_CATEGORIES: 'custom_motivation_categories',

  // Sync & management stores
  SYNC_QUEUE: 'sync_queue',
  BACKUP_HISTORY: 'backup_history',
  SYNC_LOG: 'sync_log',
  ACTIVITY_LOG: 'activity_log',

  // Integrations & Health Connect
  INTEGRATION_SETTINGS: 'integration_settings',
  INTEGRATION_LOGS: 'integration_logs',
  NOTEBOOKS: 'notebooks',
  HEALTH_RECORDS: 'health_records',

  // Android Productivity Features
  ATTACHMENTS: 'attachments',
  ATTACHMENTS_DATA: 'attachments_data',
  CONFLICT_QUEUE: 'conflict_queue',
  NOTIFICATION_SCHEDULES: 'notification_schedules',
  NOTIFICATION_HISTORY: 'notification_history',
} as const

// Stores that should NOT get sync metadata indexes
const META_STORES = new Set([
  'settings', 'profile', 'sync_queue', 'backup_history', 'sync_log', 'activity_log',
  'conflict_queue', 'notification_schedules', 'notification_history', 'attachments_data',
])

type StoreName = typeof STORES[keyof typeof STORES]

export class IndexedDBService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<IDBDatabase> | null = null
  private userId: string = 'guest'

  getDatabaseName(): string {
    const safeId = (this.userId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_')
    return `ihsanos_db_${safeId}`
  }

  async switchUser(userId: string | null): Promise<IDBDatabase> {
    const newUserId = userId || 'guest'
    if (this.userId === newUserId && this.db) {
      return this.db
    }
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.initPromise = null
    this.userId = newUserId
    return this.getDB()
  }

  async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db
    if (this.initPromise) return this.initPromise

    const dbName = this.getDatabaseName()

    this.initPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const oldVersion = event.oldVersion
        const transaction = (event.target as IDBOpenDBRequest).transaction

        // Create all stores (for fresh installs or any missing stores)
        Object.values(STORES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' })

            // Add pendingSync indexes only to data stores (not management stores)
            if (!META_STORES.has(storeName)) {
              store.createIndex('pendingSync', 'pendingSync', { unique: false })
              store.createIndex('updatedAt', 'updatedAt', { unique: false })
              store.createIndex('deleted', 'deleted', { unique: false })
            }

            // SYNC_LOG: index by timestamp and status for efficient filtering
            if (storeName === STORES.SYNC_LOG) {
              store.createIndex('timestamp', 'timestamp', { unique: false })
              store.createIndex('status', 'status', { unique: false })
            }

            // BACKUP_HISTORY: index by createdAt
            if (storeName === STORES.BACKUP_HISTORY) {
              store.createIndex('createdAt', 'createdAt', { unique: false })
            }
          }
        })

        // v1 → v2 / v2 → v3 migration: add indexes to any existing data stores missing them
        if (oldVersion < 3 && transaction) {
          Object.values(STORES).forEach((storeName) => {
            if (
              db.objectStoreNames.contains(storeName) &&
              !META_STORES.has(storeName)
            ) {
              const store = transaction.objectStore(storeName)
              if (!store.indexNames.contains('pendingSync')) {
                store.createIndex('pendingSync', 'pendingSync', { unique: false })
              }
              if (!store.indexNames.contains('updatedAt')) {
                store.createIndex('updatedAt', 'updatedAt', { unique: false })
              }
              if (!store.indexNames.contains('deleted')) {
                store.createIndex('deleted', 'deleted', { unique: false })
              }
            }
          })
        }
      }

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        this.db = db
        resolve(db)
      }

      request.onerror = (event) => {
        reject(new Error(`IndexedDB failed to open: ${(event.target as IDBOpenDBRequest).error?.message}`))
      }
    })

    return this.initPromise
  }

  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.getDB()
    return new Promise<T[]>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.getAll()

        request.onsuccess = () => resolve(request.result as T[])
        request.onerror = () => reject(request.error)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Efficiently retrieve only pending-sync records for a store (uses index if available)
   */
  async getPendingSync<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.getDB()
    return new Promise<T[]>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)

        // Use index if available, otherwise fall back to full scan + filter
        if (store.indexNames.contains('pendingSync')) {
          const index = store.index('pendingSync')
          const request = index.getAll(IDBKeyRange.only(true))
          request.onsuccess = () => resolve(request.result as T[])
          request.onerror = () => reject(request.error)
        } else {
          const request = store.getAll()
          request.onsuccess = () => resolve((request.result as any[]).filter(r => r.pendingSync === true) as T[])
          request.onerror = () => reject(request.error)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  async get<T>(storeName: StoreName, id: string): Promise<T | null> {
    const db = await this.getDB()
    return new Promise<T | null>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.get(id)

        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      } catch (err) {
        reject(err)
      }
    })
  }

  async put<T extends { id: string }>(storeName: StoreName, value: T): Promise<void> {
    const db = await this.getDB()
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.put(value)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Batch put multiple records in a single transaction for performance
   */
  async putBatch<T extends { id: string }>(storeName: StoreName, records: T[]): Promise<void> {
    if (!records || records.length === 0) return
    const db = await this.getDB()
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)

        for (const record of records) {
          if (!record || typeof record !== 'object') continue
          if (!record.id) {
            (record as any).id = `id_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
          }
          store.put(record)
        }

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error || new Error(`Transaction aborted on store ${storeName}`))
      } catch (err) {
        reject(err)
      }
    })
  }

  async delete(storeName: StoreName, id: string): Promise<void> {
    const db = await this.getDB()
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      } catch (err) {
        reject(err)
      }
    })
  }

  async clearStore(storeName: StoreName): Promise<void> {
    const db = await this.getDB()
    return new Promise<void>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      } catch (err) {
        reject(err)
      }
    })
  }

  async clearAll(): Promise<void> {
    const stores = Object.values(STORES)
    await Promise.all(
      stores.map((storeName) => this.clearStore(storeName))
    )
  }

  async deleteDatabase(): Promise<void> {
    const dbName = this.getDatabaseName()
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName)
      request.onblocked = () => {
        console.warn('Database delete blocked by open connections. Falling back to clearing all stores.')
        this.clearAll().then(resolve, reject)
      }
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Count all pending-sync records across all data stores
   */
  async countAllPending(): Promise<number> {
    let total = 0
    const dataStores = Object.values(STORES).filter(s => !META_STORES.has(s))
    for (const storeName of dataStores) {
      try {
        const pending = await this.getPendingSync<any>(storeName)
        total += pending.length
      } catch {
        // Skip unavailable stores
      }
    }
    return total
  }

  /**
   * Count all records in a store (including deleted)
   */
  async countAll(storeName: StoreName): Promise<number> {
    const db = await this.getDB()
    return new Promise<number>((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * Get storage estimate from the browser Storage API
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
    if (!navigator.storage?.estimate) return null
    try {
      const estimate = await navigator.storage.estimate()
      return { usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 }
    } catch {
      return null
    }
  }
}

export const idb = new IndexedDBService()
