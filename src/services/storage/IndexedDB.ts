/**
 * Standard HTML5 IndexedDB Service
 * Reusable zero-dependency async wrapper for local browser database
 */

const DB_NAME = 'ihsanos_db'
const DB_VERSION = 1

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
  NOTES: 'notes'
} as const

type StoreName = typeof STORES[keyof typeof STORES]

export class IndexedDBService {
  private db: IDBDatabase | null = null

  private initPromise: Promise<IDBDatabase> | null = null

  async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        Object.values(STORES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' })
          }
        })
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
    const db = await this.getDB()
    const stores = Object.values(STORES)
    await Promise.all(
      stores.map((storeName) => this.clearStore(storeName))
    )
  }

  async deleteDatabase(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const idb = new IndexedDBService()
