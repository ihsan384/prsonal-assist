import { idb, STORES } from './IndexedDB'
import type { Task, Habit, Goal, Workout, Meal, SleepLog, KnowledgeItem, Transaction, Budget, AppSettings, UserProfile, NutritionGoal, StudySession as GeneralStudySession } from '@/types'
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
    const INITIAL_SUBJECTS: Subject[] = [
      { id: 'sub-phy', name: 'Physics', studyHours: 24, targetHours: 50, completedChapters: 4, pendingChapters: 6, completionPercentage: 40, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'sub-che', name: 'Chemistry', studyHours: 18, targetHours: 45, completedChapters: 3, pendingChapters: 7, completionPercentage: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'sub-mat', name: 'Mathematics', studyHours: 35, targetHours: 60, completedChapters: 6, pendingChapters: 4, completionPercentage: 60, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'sub-eng', name: 'English', studyHours: 8, targetHours: 20, completedChapters: 2, pendingChapters: 3, completionPercentage: 40, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'sub-cs', name: 'Computer Science', studyHours: 15, targetHours: 35, completedChapters: 3, pendingChapters: 5, completionPercentage: 37, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true }
    ]

    const INITIAL_CHAPTERS: Chapter[] = [
      { id: 'ch-phy-1', subjectId: 'sub-phy', name: 'Electromagnetism', priority: 'high', difficulty: 'hard', status: 'in_progress', estimatedHours: 12, completedHours: 8, notes: 'Revise Biot-Savart Law and Ampere Law equations before mock exam.', revisionCount: 2, confidencePercentage: 70, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'ch-phy-2', subjectId: 'sub-phy', name: 'Optics', priority: 'medium', difficulty: 'medium', status: 'not_started', estimatedHours: 10, completedHours: 0, notes: '', revisionCount: 0, confidencePercentage: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'ch-che-1', subjectId: 'sub-che', name: 'Organic Chemistry', priority: 'high', difficulty: 'hard', status: 'in_progress', estimatedHours: 15, completedHours: 6, notes: 'Focus on SN1/SN2 nucleophilic substitution mechanisms.', revisionCount: 1, confidencePercentage: 55, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'ch-mat-1', subjectId: 'sub-mat', name: 'Calculus', priority: 'urgent', difficulty: 'hard', status: 'in_progress', estimatedHours: 18, completedHours: 12, notes: 'Practice integration by parts and trigonometric substitutions.', revisionCount: 3, confidencePercentage: 80, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'ch-mat-2', subjectId: 'sub-mat', name: 'Matrices', priority: 'medium', difficulty: 'easy', status: 'completed', estimatedHours: 6, completedHours: 6, notes: 'Covered Cramers rule and determinants.', revisionCount: 2, confidencePercentage: 95, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true }
    ]

    const INITIAL_TOPICS: Topic[] = [
      { id: 'tp-phy-1-1', chapterId: 'ch-phy-1', name: 'Biot-Savart Law', status: 'in_progress', understandingPercentage: 75, questionsSolved: 15, mistakes: 2, revisionNeeded: true, notes: 'Magnetic field due to a straight wire segment.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'tp-phy-1-2', chapterId: 'ch-phy-1', name: 'Ampere Circuital Law', status: 'mastered', understandingPercentage: 90, questionsSolved: 10, mistakes: 0, revisionNeeded: false, notes: 'Highly symmetrical configurations.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'tp-mat-1-1', chapterId: 'ch-mat-1', name: 'Limits and Continuity', status: 'mastered', understandingPercentage: 95, questionsSolved: 30, mistakes: 1, revisionNeeded: false, notes: 'L Hospital rule is extremely useful.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true },
      { id: 'tp-mat-1-2', chapterId: 'ch-mat-1', name: 'Integration by Parts', status: 'in_progress', understandingPercentage: 70, questionsSolved: 25, mistakes: 4, revisionNeeded: true, notes: 'Remember ILATE rule for function priority.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncVersion: 1, pendingSync: true }
    ]

    this.subjects = INITIAL_SUBJECTS
    this.chapters = INITIAL_CHAPTERS
    this.topics = INITIAL_TOPICS

    await Promise.all([
      ...INITIAL_SUBJECTS.map(s => idb.put(STORES.SUBJECTS, s)),
      ...INITIAL_CHAPTERS.map(c => idb.put(STORES.CHAPTERS, c)),
      ...INITIAL_TOPICS.map(t => idb.put(STORES.TOPICS, t))
    ])
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
  }
}

export const memoryStore = new MemoryStoreService()
// Kick off initialization immediately
memoryStore.init()
