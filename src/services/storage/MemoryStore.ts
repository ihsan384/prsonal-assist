import { idb, STORES } from './IndexedDB'
import { supabase, isSupabaseConfigured } from '../supabase/supabase'
import type { Task, Habit, Goal, Workout, Meal, SleepLog, KnowledgeItem, Transaction, Budget, AppSettings, UserProfile, NutritionGoal, StudySession as GeneralStudySession, ReflectionEntry, MotivationQuote, MotivationNote, MotivationCollection, CustomMotivationCategory } from '@/types'
import type { Subject, Chapter, Topic, StudySession, RevisionEntry, QuestionLog, MockTest, TestRecord, TestSubjectResult, TestChapterResult, Mistake, Formula, StudyNote } from '@/types/study.types'

class MemoryStoreService {
  // Flag indicating if the database loading is finished
  isLoaded = false
  private loadPromise: Promise<void> | null = null

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

  // In-memory collections
  tasks: Task[] = []
  habits: Habit[] = []
  goals: Goal[] = []
  workouts: Workout[] = []
  meals: Meal[] = []
  sleepLogs: SleepLog[] = []
  knowledge: KnowledgeItem[] = []
  transactions: Transaction[] = []
  budgets: Budget[] = []
  studySessions: GeneralStudySession[] = []
  settings: AppSettings = {
    theme: 'light',
    accentColor: '#2563eb',
    notifications: true,
    soundEnabled: true,
    hapticEnabled: true,
    compactMode: false,
    language: 'en',
    weekStartsOn: 1,
    timeFormat: '12h',
    studyTimerDefault: 25,
    waterGoal: 3000,
    sleepGoal: 8,
    calorieGoal: 2200,
  }
  profile: UserProfile = {
    id: 'user_profile',
    email: null,
    full_name: 'Ihsan',
    avatar_url: null,
    phone: null,
    role: 'client',
    is_disabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Ihsan',
    timezone: 'Asia/Kolkata',
    theme: 'light',
    accentColor: '#2563eb',
    joinedAt: new Date().toISOString(),
  }
  nutritionGoals: NutritionGoal = {
    calories: 2200,
    protein: 160,
    carbs: 250,
    fat: 65,
    water: 3000,
  }
  waterLogs: Record<string, number> = {}

  // Study ERP collections
  subjects: Subject[] = []
  chapters: Chapter[] = []
  topics: Topic[] = []
  sessions: StudySession[] = []
  revisions: RevisionEntry[] = []
  questions: QuestionLog[] = []
  tests: MockTest[] = []
  testSubjectResults: TestSubjectResult[] = []
  testChapterResults: TestChapterResult[] = []
  mistakes: Mistake[] = []
  formulas: Formula[] = []
  notes: StudyNote[] = []

  // Reflection & Motivation collections
  reflectionEntries: ReflectionEntry[] = []
  motivationQuotes: MotivationQuote[] = []
  motivationNotes: MotivationNote[] = []
  motivationCollections: MotivationCollection[] = []
  customMotivationCategories: CustomMotivationCategory[] = []
  
  // Integrations collections
  integrationSettings: any[] = []
  integrationLogs: any[] = []
  notebooks: any[] = []
  healthRecords: any[] = []

  // Android Productivity Feature collections
  attachments: any[] = []
  conflicts: any[] = []
  notificationSchedules: any[] = []
  notificationHistory: any[] = []

  private listeners: Set<(userId: string | null) => void> = new Set()

  subscribe(callback: (userId: string | null) => void): () => void {
    this.listeners.add(callback)
    return () => { this.listeners.delete(callback) }
  }

  private notifyListeners(userId: string | null) {
    this.listeners.forEach(cb => cb(userId))
  }

  async switchUser(userId: string | null): Promise<void> {
    this.isLoaded = false
    this.loadPromise = null

    // Reset all memory collections & sync engine retry queues
    this.clearMemory()
    import('../sync/SyncService').then(({ syncEngine }) => {
      syncEngine.resetOnUserSwitch()
    }).catch(() => {})

    await idb.switchUser(userId)
    await this.init()
    this.notifyListeners(userId)
  }

  async init(): Promise<void> {
    if (this.isLoaded) return
    if (this.loadPromise) return this.loadPromise

    this.loadPromise = new Promise<void>(async (resolve) => {
      try {
        let activeUserId: string | null = null
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession()
          activeUserId = session?.user?.id || null
        }

        if (activeUserId) {
          // Load all collections directly from Supabase Cloud
          await Promise.allSettled([
            this.loadFromCloud(STORES.TASKS, activeUserId, (d) => { this.tasks = d }),
            this.loadFromCloud(STORES.HABITS, activeUserId, (d) => { this.habits = d }),
            this.loadFromCloud(STORES.GOALS, activeUserId, (d) => { this.goals = d }),
            this.loadFromCloud(STORES.WORKOUTS, activeUserId, (d) => { this.workouts = d }),
            this.loadFromCloud(STORES.MEALS, activeUserId, (d) => { this.meals = d }),
            this.loadFromCloud(STORES.SLEEP_LOGS, activeUserId, (d) => { this.sleepLogs = d }),
            this.loadFromCloud(STORES.KNOWLEDGE, activeUserId, (d) => { this.knowledge = d }),
            this.loadFromCloud(STORES.TRANSACTIONS, activeUserId, (d) => { this.transactions = d }),
            this.loadFromCloud(STORES.BUDGETS, activeUserId, (d) => { this.budgets = d }),
            this.loadFromCloud(STORES.STUDY_SESSIONS, activeUserId, (d) => { this.studySessions = d }),
            this.loadFromCloud(STORES.SUBJECTS, activeUserId, (d) => { this.subjects = d }),
            this.loadFromCloud(STORES.CHAPTERS, activeUserId, (d) => { this.chapters = d }),
            this.loadFromCloud(STORES.TOPICS, activeUserId, (d) => { this.topics = d }),
            this.loadFromCloud(STORES.SESSIONS, activeUserId, (d) => { this.sessions = d }),
            this.loadFromCloud(STORES.REVISIONS, activeUserId, (d) => { this.revisions = d }),
            this.loadFromCloud(STORES.QUESTIONS, activeUserId, (d) => { this.questions = d }),
            this.loadFromCloud(STORES.TESTS, activeUserId, (d) => { this.tests = d }),
            this.loadFromCloud(STORES.TEST_SUBJECT_RESULTS, activeUserId, (d) => { this.testSubjectResults = d }),
            this.loadFromCloud(STORES.TEST_CHAPTER_RESULTS, activeUserId, (d) => { this.testChapterResults = d }),
            this.loadFromCloud(STORES.MISTAKES, activeUserId, (d) => { this.mistakes = d }),
            this.loadFromCloud(STORES.FORMULAS, activeUserId, (d) => { this.formulas = d }),
            this.loadFromCloud(STORES.NOTES, activeUserId, (d) => { this.notes = d }),
            this.loadFromCloud(STORES.REFLECTION_ENTRIES, activeUserId, (d) => { this.reflectionEntries = d }),
            this.loadFromCloud(STORES.MOTIVATION_QUOTES, activeUserId, (d) => { this.motivationQuotes = d }),
            this.loadFromCloud(STORES.MOTIVATION_NOTES, activeUserId, (d) => { this.motivationNotes = d }),
            this.loadFromCloud(STORES.MOTIVATION_COLLECTIONS, activeUserId, (d) => { this.motivationCollections = d }),
            this.loadFromCloud(STORES.CUSTOM_MOTIVATION_CATEGORIES, activeUserId, (d) => { this.customMotivationCategories = d }),
            this.loadFromCloud(STORES.INTEGRATION_SETTINGS, activeUserId, (d) => { this.integrationSettings = d }),
            this.loadFromCloud(STORES.NOTEBOOKS, activeUserId, (d) => { this.notebooks = d }),
            this.loadFromCloud(STORES.HEALTH_RECORDS, activeUserId, (d) => { this.healthRecords = d }),
            this.loadFromCloud(STORES.ATTACHMENTS, activeUserId, (d) => { this.attachments = d }),
          ])

          // Set up Realtime subscription for cross-device live updates
          this.setupRealtimeSubscription(activeUserId)
        } else {
          // Fallback: Load all stores from local IndexedDB
          await this.loadAllFromLocalIDB()
        }

        // Auto-seed default curriculum subjects & chapters if subjects list is empty or missing chapters
        try {
          const { curriculumService } = await import('../curriculum/curriculumService')
          await curriculumService.ensureDefaultSubjectsAndChapters()
        } catch (e) {
          console.warn('[MemoryStore] ensureDefaultSubjectsAndChapters error:', e)
        }

        this.isLoaded = true
        this.notifyListeners(activeUserId || 'guest')
        resolve()
      } catch (err) {
        console.error('[MemoryStore] Failed to initialize store:', err)
        this.isLoaded = true
        this.notifyListeners('guest')
        resolve()
      }
    })

    return this.loadPromise
  }

  private async loadAllFromLocalIDB() {
    try {
      const getLocal = async (store: any): Promise<any[]> => (await idb.getAll<any>(store).catch(() => [])).filter((r: any) => !r.deleted)
      this.tasks = await getLocal(STORES.TASKS)
      this.habits = await getLocal(STORES.HABITS)
      this.goals = await getLocal(STORES.GOALS)
      this.workouts = await getLocal(STORES.WORKOUTS)
      this.meals = await getLocal(STORES.MEALS)
      this.sleepLogs = await getLocal(STORES.SLEEP_LOGS)
      this.knowledge = await getLocal(STORES.KNOWLEDGE)
      this.transactions = await getLocal(STORES.TRANSACTIONS)
      this.budgets = await getLocal(STORES.BUDGETS)
      this.studySessions = await getLocal(STORES.STUDY_SESSIONS)
      this.subjects = await getLocal(STORES.SUBJECTS)
      this.chapters = await getLocal(STORES.CHAPTERS)
      this.topics = await getLocal(STORES.TOPICS)
      this.sessions = await getLocal(STORES.SESSIONS)
      this.revisions = await getLocal(STORES.REVISIONS)
      this.questions = await getLocal(STORES.QUESTIONS)
      this.tests = await getLocal(STORES.TESTS)
      this.testSubjectResults = await getLocal(STORES.TEST_SUBJECT_RESULTS)
      this.testChapterResults = await getLocal(STORES.TEST_CHAPTER_RESULTS)
      this.mistakes = await getLocal(STORES.MISTAKES)
      this.formulas = await getLocal(STORES.FORMULAS)
      this.notes = await getLocal(STORES.NOTES)
    } catch (err) {
      console.warn('[MemoryStore] Error loading local IDB collections:', err)
    }
  }

  private realtimeChannel: any = null

  private setupRealtimeSubscription(userId: string) {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel)
    }

    this.realtimeChannel = supabase
      .channel(`memstore_realtime_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload: any) => {
        const table = payload.table
        const eventType = payload.eventType

        if (!table) return

        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const raw = payload.new
          if (!raw || (raw.user_id && raw.user_id !== userId)) return
          const camel = this.toCamelCase(raw)
          this.applyRemoteRealtimeChange(table, camel, false)
        } else if (eventType === 'DELETE') {
          const raw = payload.old
          if (!raw?.id) return
          this.applyRemoteRealtimeChange(table, { id: raw.id }, true)
        }
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('[MemoryStore] Realtime cross-device sync active')
        }
      })
  }

  private async loadFromCloud(storeName: string, userId: string, setter: (data: any[]) => void) {
    try {
      const { data, error } = await (supabase.from(storeName as any) as any)
        .select('*')
        .eq('user_id', userId)
        .neq('deleted', true)
        .order('created_at', { ascending: true })

      if (error) {
        console.warn(`[MemoryStore] loadFromCloud error on "${storeName}":`, error.message)
      }
      if (data && data.length > 0) {
        setter(data.map((r: any) => this.toCamelCase(r)))
        return
      }
    } catch (e) {
      console.warn(`[MemoryStore] loadFromCloud exception on "${storeName}":`, e)
    }

    // Fallback to IndexedDB if cloud returned 0 rows or errored out
    try {
      const localData = await idb.getAll(storeName as any)
      if (localData && localData.length > 0) {
        setter(localData.filter((r: any) => !r.deleted).map((r: any) => this.toCamelCase(r)))
      }
    } catch (err) {
      console.warn(`[MemoryStore] IDB fallback read failed on "${storeName}":`, err)
    }
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

  private async populateInitialData() {
    // Start with empty database for production use
  }

  private async triggerCloudSave(storeName?: string, record?: any) {
    if (!storeName || !record || !isSupabaseConfigured()) {
      console.warn('[MemoryStore] triggerCloudSave skipped — not configured or missing args')
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) {
        console.warn('[MemoryStore] triggerCloudSave skipped — no authenticated user')
        return
      }

      const snakeRecord = this.toSnakeCase({
        ...record,
        userId,
        updatedAt: new Date().toISOString()
      })

      // Remove client-side-only fields that don't exist as DB columns.
      // PostgREST rejects the entire upsert if any unknown column is present.
      delete snakeRecord.pending_sync
      delete snakeRecord.last_synced_at
      delete snakeRecord.sync_version

      console.log(`[MemoryStore] Saving to Supabase table "${storeName}", id=${record.id}`)

      if (record.deleted) {
        const { error } = await (supabase.from(storeName as any) as any)
          .delete()
          .eq('id', record.id)
          .eq('user_id', userId)
        if (error) console.error(`[MemoryStore] DELETE error on "${storeName}": `, error.message)
      } else {
        const { error } = await (supabase.from(storeName as any) as any)
          .upsert(snakeRecord, { onConflict: 'id' })
        if (error) console.error(`[MemoryStore] UPSERT error on "${storeName}": `, error.message, '| record keys:', Object.keys(snakeRecord))
        else console.log(`[MemoryStore] ✅ Saved to "${storeName}" successfully`)
      }
    } catch (err) {
      console.error('[MemoryStore] triggerCloudSave exception:', err)
    }
  }

  // Store name to memory array mapping for Realtime updates
  private storeToCollectionMap: Record<string, string> = {
    tasks: 'tasks',
    habits: 'habits',
    goals: 'goals',
    workouts: 'workouts',
    meals: 'meals',
    sleep_logs: 'sleepLogs',
    knowledge: 'knowledge',
    transactions: 'transactions',
    budgets: 'budgets',
    study_sessions: 'studySessions',
    subjects: 'subjects',
    chapters: 'chapters',
    topics: 'topics',
    sessions: 'sessions',
    revisions: 'revisions',
    questions: 'questions',
    tests: 'tests',
    test_subject_results: 'testSubjectResults',
    test_chapter_results: 'testChapterResults',
    mistakes: 'mistakes',
    formulas: 'formulas',
    notes: 'notes',
    reflection_entries: 'reflectionEntries',
    motivation_quotes: 'motivationQuotes',
    motivation_notes: 'motivationNotes',
    motivation_collections: 'motivationCollections',
    custom_motivation_categories: 'customMotivationCategories',
    integration_settings: 'integrationSettings',
    notebooks: 'notebooks',
    health_records: 'healthRecords',
    attachments: 'attachments',
  }

  /** Apply incoming Realtime Postgres change from Supabase */
  applyRemoteRealtimeChange(storeName: string, record: any, isDelete: boolean) {
    if (!record || !record.id) return

    const key = this.storeToCollectionMap[storeName]
    if (key && Array.isArray((this as any)[key])) {
      const arr = (this as any)[key] as any[]
      const idx = arr.findIndex(item => item.id === record.id)

      if (isDelete || record.deleted) {
        if (idx >= 0) {
          arr.splice(idx, 1)
        }
        idb.delete(storeName as any, record.id).catch(() => {})
      } else {
        if (idx >= 0) {
          arr[idx] = { ...arr[idx], ...record }
        } else {
          arr.push(record)
        }
        idb.put(storeName as any, record).catch(() => {})
      }

      this.notifyListeners(null)
    }
  }

  // Generic in-memory helper with direct Supabase Cloud write
  async saveToStore<T extends { id: string; updatedAt?: string; pendingSync?: boolean; syncVersion?: number }>(
    storeName: any,
    localArray: T[],
    record: T
  ): Promise<void> {
    record.updatedAt = new Date().toISOString()
    record.pendingSync = false
    record.syncVersion = (record.syncVersion || 0) + 1

    const index = localArray.findIndex(item => item.id === record.id)
    if (index >= 0) {
      localArray[index] = record
    } else {
      localArray.push(record)
    }

    // Save to local IndexedDB for reliable offline storage
    try {
      await idb.put(storeName as any, record)
    } catch (e) {
      console.warn(`[MemoryStore] IndexedDB put failed for "${storeName}":`, e)
    }

    // Write to Supabase Cloud if configured
    await this.triggerCloudSave(storeName, record)

    // Notify listeners so UI updates reactively
    this.notifyListeners(null)
  }

  // Soft delete helper
  async softDeleteFromStore<T extends { id: string; deleted?: boolean; updatedAt?: string; pendingSync?: boolean; syncVersion?: number }>(
    storeName: any,
    localArray: T[],
    id: string
  ): Promise<void> {
    const index = localArray.findIndex(item => item.id === id)
    if (index >= 0) {
      const record = localArray[index]
      record.deleted = true
      record.updatedAt = new Date().toISOString()
      record.pendingSync = false
      record.syncVersion = (record.syncVersion || 0) + 1
      localArray[index] = record

      try {
        await idb.put(storeName as any, record)
      } catch (e) {
        console.warn(`[MemoryStore] IndexedDB softDelete failed for "${storeName}":`, e)
      }

      await this.triggerCloudSave(storeName, record)
      this.notifyListeners(null)
    }
  }

  // Hard delete helper
  async removeFromStore<T extends { id: string; deleted?: boolean }>(
    storeName: any,
    localArray: T[],
    id: string
  ): Promise<void> {
    const index = localArray.findIndex(item => item.id === id)
    if (index >= 0) {
      const record = { ...localArray[index], deleted: true }
      localArray.splice(index, 1)

      try {
        await idb.delete(storeName as any, id)
      } catch (e) {
        console.warn(`[MemoryStore] IndexedDB delete failed for "${storeName}":`, e)
      }

      await this.triggerCloudSave(storeName, record)
      this.notifyListeners(null)
    }
  }

  // Clear memory state (useful for wiping data)
  clearMemory() {
    this.tasks = []
    this.habits = []
    this.goals = []
    this.workouts = []
    this.meals = []
    this.sleepLogs = []
    this.knowledge = []
    this.transactions = []
    this.budgets = []
    this.studySessions = []
    this.waterLogs = {}
    this.subjects = []
    this.chapters = []
    this.topics = []
    this.sessions = []
    this.revisions = []
    this.questions = []
    this.tests = []
    this.testSubjectResults = []
    this.testChapterResults = []
    this.mistakes = []
    this.formulas = []
    this.notes = []
    this.reflectionEntries = []
    this.motivationQuotes = []
    this.motivationNotes = []
    this.motivationCollections = []
    this.customMotivationCategories = []
    this.integrationSettings = []
    this.integrationLogs = []
    this.notebooks = []
    this.healthRecords = []
    
    this.attachments = []
    this.conflicts = []
    this.notificationSchedules = []
    this.notificationHistory = []
  }

}

export const memoryStore = new MemoryStoreService()
// Kick off initialization immediately
memoryStore.init()
