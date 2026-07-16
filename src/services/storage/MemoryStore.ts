import { idb, STORES } from './IndexedDB'
import type { Task, Habit, Goal, Workout, Meal, SleepLog, KnowledgeItem, Transaction, Budget, AppSettings, UserProfile, NutritionGoal, StudySession as GeneralStudySession, ReflectionEntry, MotivationQuote, MotivationNote, MotivationCollection, CustomMotivationCategory } from '@/types'
import type { Subject, Chapter, Topic, StudySession, RevisionEntry, QuestionLog, MockTest, Mistake, Formula, StudyNote } from '@/types/study.types'

class MemoryStoreService {
  // Flag indicating if the database loading is finished
  isLoaded = false
  private loadPromise: Promise<void> | null = null

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



  async init(): Promise<void> {
    if (this.isLoaded) return
    if (this.loadPromise) return this.loadPromise

    this.loadPromise = new Promise<void>(async (resolve) => {
      try {
        await idb.getDB() // Ensure database is initialized

        // 1. Load basic entities
        this.tasks = await idb.getAll<Task>(STORES.TASKS)
        this.habits = await idb.getAll<Habit>(STORES.HABITS)
        this.goals = await idb.getAll<Goal>(STORES.GOALS)
        this.workouts = await idb.getAll<Workout>(STORES.WORKOUTS)
        this.meals = await idb.getAll<Meal>(STORES.MEALS)
        this.sleepLogs = await idb.getAll<SleepLog>(STORES.SLEEP_LOGS)
        this.knowledge = await idb.getAll<KnowledgeItem>(STORES.KNOWLEDGE)
        this.transactions = await idb.getAll<Transaction>(STORES.TRANSACTIONS)
        this.budgets = await idb.getAll<Budget>(STORES.BUDGETS)
        this.studySessions = await idb.getAll<GeneralStudySession>(STORES.STUDY_SESSIONS)

        // 2. Load settings, profile, nutrition goals (singular items)
        const settingsArr = await idb.getAll<AppSettings & { id: string }>(STORES.SETTINGS)
        if (settingsArr.length > 0) {
          this.settings = settingsArr[0]
        } else {
          await idb.put(STORES.SETTINGS, { id: 'app_settings', ...this.settings })
        }

        const profileArr = await idb.getAll<UserProfile & { id: string }>(STORES.PROFILE)
        if (profileArr.length > 0) {
          this.profile = profileArr[0]
        } else {
          await idb.put(STORES.PROFILE, { id: 'user_profile', ...this.profile })
        }

        const nutrGoalsArr = await idb.getAll<NutritionGoal & { id: string }>(STORES.NUTRITION_GOALS)
        if (nutrGoalsArr.length > 0) {
          this.nutritionGoals = nutrGoalsArr[0]
        } else {
          await idb.put(STORES.NUTRITION_GOALS, { id: 'default', ...this.nutritionGoals })
        }

        // 3. Load Water Logs
        const waterArr = await idb.getAll<{ id: string; amount_ml: number }>(STORES.WATER_LOGS)
        waterArr.forEach(log => {
          this.waterLogs[log.id] = log.amount_ml
        })

        // 4. Load Study ERP collections
        this.subjects = await idb.getAll<Subject>(STORES.SUBJECTS)
        this.chapters = await idb.getAll<Chapter>(STORES.CHAPTERS)
        this.topics = await idb.getAll<Topic>(STORES.TOPICS)
        this.sessions = await idb.getAll<StudySession>(STORES.SESSIONS)
        this.revisions = await idb.getAll<RevisionEntry>(STORES.REVISIONS)
        this.questions = await idb.getAll<QuestionLog>(STORES.QUESTIONS)
        this.tests = await idb.getAll<MockTest>(STORES.TESTS)
        this.mistakes = await idb.getAll<Mistake>(STORES.MISTAKES)
        this.formulas = await idb.getAll<Formula>(STORES.FORMULAS)
        this.notes = await idb.getAll<StudyNote>(STORES.NOTES)

        // 5. Load Reflection & Motivation
        this.reflectionEntries = await idb.getAll<ReflectionEntry>(STORES.REFLECTION_ENTRIES)
        this.motivationQuotes = await idb.getAll<MotivationQuote>(STORES.MOTIVATION_QUOTES)
        this.motivationNotes = await idb.getAll<MotivationNote>(STORES.MOTIVATION_NOTES)
        this.motivationCollections = await idb.getAll<MotivationCollection>(STORES.MOTIVATION_COLLECTIONS)
        this.customMotivationCategories = await idb.getAll<CustomMotivationCategory>(STORES.CUSTOM_MOTIVATION_CATEGORIES)
        
        // 6. Load Integrations & Health Connect
        this.integrationSettings = await idb.getAll<any>(STORES.INTEGRATION_SETTINGS)
        this.integrationLogs = await idb.getAll<any>(STORES.INTEGRATION_LOGS)
        this.notebooks = await idb.getAll<any>(STORES.NOTEBOOKS)
        this.healthRecords = await idb.getAll<any>(STORES.HEALTH_RECORDS)

        // 7. Load Attachments & Notifications
        this.attachments = await idb.getAll<any>(STORES.ATTACHMENTS)
        this.conflicts = await idb.getAll<any>(STORES.CONFLICT_QUEUE)
        this.notificationSchedules = await idb.getAll<any>(STORES.NOTIFICATION_SCHEDULES)
        this.notificationHistory = await idb.getAll<any>(STORES.NOTIFICATION_HISTORY)



        // Populate initial data if completely clean install
        if (this.subjects.length === 0) {
          await this.populateInitialData()
        }

        this.isLoaded = true
        resolve()
      } catch (err) {
        console.error('[MemoryStore] Failed to initialize database cache:', err)
        resolve() // Fallback to memory defaults
      }
    })

    return this.loadPromise
  }

  private async populateInitialData() {
    // Start with empty database for production use
  }

  // Generic in-memory helper with IndexedDB async write
  async saveToStore<T extends { id: string; updatedAt?: string; pendingSync?: boolean; syncVersion?: number }>(
    storeName: any,
    localArray: T[],
    record: T
  ): Promise<void> {
    record.updatedAt = new Date().toISOString()
    record.pendingSync = true
    record.syncVersion = (record.syncVersion || 0) + 1

    const index = localArray.findIndex(item => item.id === record.id)
    if (index >= 0) {
      localArray[index] = record
    } else {
      localArray.push(record)
    }

    // Write to IDB asynchronously
    await idb.put(storeName, record)
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
      record.pendingSync = true
      record.syncVersion = (record.syncVersion || 0) + 1
      
      // Update local storage representation
      localArray[index] = record
      await idb.put(storeName, record)
    }
  }

  // Hard delete helper
  async removeFromStore<T extends { id: string }>(
    storeName: any,
    localArray: T[],
    id: string
  ): Promise<void> {
    const index = localArray.findIndex(item => item.id === id)
    if (index >= 0) {
      localArray.splice(index, 1)
      await idb.delete(storeName, id)
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
