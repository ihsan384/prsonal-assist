import { idb, STORES } from './IndexedDB'
import { memoryStore } from './MemoryStore'

export interface BackupData {
  version: string
  timestamp: string
  data: {
    tasks: any[]
    habits: any[]
    goals: any[]
    workouts: any[]
    meals: any[]
    sleepLogs: any[]
    knowledge: any[]
    transactions: any[]
    budgets: any[]
    waterLogs: Record<string, number>
    settings: any
    profile: any
    nutritionGoals: any
    studySessions: any[]
    
    // Study ERP
    subjects: any[]
    chapters: any[]
    topics: any[]
    sessions: any[]
    revisions: any[]
    questions: any[]
    tests: any[]
    mistakes: any[]
    formulas: any[]
    notes: any[]
  }
}

export const backupService = {
  /**
   * Export all data as a backup JSON string
   */
  async exportBackup(): Promise<string> {
    // Make sure we have latest from IndexedDB before export
    await memoryStore.init()

    const backup: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        tasks: memoryStore.tasks,
        habits: memoryStore.habits,
        goals: memoryStore.goals,
        workouts: memoryStore.workouts,
        meals: memoryStore.meals,
        sleepLogs: memoryStore.sleepLogs,
        knowledge: memoryStore.knowledge,
        transactions: memoryStore.transactions,
        budgets: memoryStore.budgets,
        waterLogs: memoryStore.waterLogs,
        settings: memoryStore.settings,
        profile: memoryStore.profile,
        nutritionGoals: memoryStore.nutritionGoals,
        studySessions: memoryStore.studySessions,
        
        subjects: memoryStore.subjects,
        chapters: memoryStore.chapters,
        topics: memoryStore.topics,
        sessions: memoryStore.sessions,
        revisions: memoryStore.revisions,
        questions: memoryStore.questions,
        tests: memoryStore.tests,
        mistakes: memoryStore.mistakes,
        formulas: memoryStore.formulas,
        notes: memoryStore.notes
      }
    }

    return JSON.stringify(backup, null, 2)
  },

  /**
   * Import data from JSON backup string and restore into memory/IndexedDB
   */
  async importBackup(jsonString: string): Promise<void> {
    const backup = JSON.parse(jsonString) as BackupData
    
    if (!backup.version || !backup.data) {
      throw new Error('Invalid backup file format')
    }

    const { data } = backup

    // 1. Wipe current database
    await idb.clearAll()
    memoryStore.clearMemory()

    // 2. Restore settings, profile, nutrition goals
    if (data.settings) {
      memoryStore.settings = data.settings
      await idb.put(STORES.SETTINGS, { id: 'app_settings', ...data.settings })
    }
    if (data.profile) {
      memoryStore.profile = data.profile
      await idb.put(STORES.PROFILE, { id: 'user_profile', ...data.profile })
    }
    if (data.nutritionGoals) {
      memoryStore.nutritionGoals = data.nutritionGoals
      await idb.put(STORES.NUTRITION_GOALS, { id: 'default', ...data.nutritionGoals })
    }

    // 3. Restore arrays
    const arrayRestores = [
      { key: 'tasks', store: STORES.TASKS, list: data.tasks },
      { key: 'habits', store: STORES.HABITS, list: data.habits },
      { key: 'goals', store: STORES.GOALS, list: data.goals },
      { key: 'workouts', store: STORES.WORKOUTS, list: data.workouts },
      { key: 'meals', store: STORES.MEALS, list: data.meals },
      { key: 'sleepLogs', store: STORES.SLEEP_LOGS, list: data.sleepLogs },
      { key: 'knowledge', store: STORES.KNOWLEDGE, list: data.knowledge },
      { key: 'transactions', store: STORES.TRANSACTIONS, list: data.transactions },
      { key: 'budgets', store: STORES.BUDGETS, list: data.budgets },
      { key: 'studySessions', store: STORES.STUDY_SESSIONS, list: data.studySessions },
      
      { key: 'subjects', store: STORES.SUBJECTS, list: data.subjects },
      { key: 'chapters', store: STORES.CHAPTERS, list: data.chapters },
      { key: 'topics', store: STORES.TOPICS, list: data.topics },
      { key: 'sessions', store: STORES.SESSIONS, list: data.sessions },
      { key: 'revisions', store: STORES.REVISIONS, list: data.revisions },
      { key: 'questions', store: STORES.QUESTIONS, list: data.questions },
      { key: 'tests', store: STORES.TESTS, list: data.tests },
      { key: 'mistakes', store: STORES.MISTAKES, list: data.mistakes },
      { key: 'formulas', store: STORES.FORMULAS, list: data.formulas },
      { key: 'notes', store: STORES.NOTES, list: data.notes }
    ]

    for (const item of arrayRestores) {
      if (Array.isArray(item.list)) {
        // Set memory store list
        (memoryStore as any)[item.key] = item.list
        // Put in IndexedDB
        for (const record of item.list) {
          // Force pendingSync status so it gets backed up to Supabase if config changes
          record.pendingSync = true
          await idb.put(item.store, record)
        }
      }
    }

    // 4. Restore water logs
    if (data.waterLogs) {
      memoryStore.waterLogs = data.waterLogs
      for (const [date, ml] of Object.entries(data.waterLogs)) {
        await idb.put(STORES.WATER_LOGS, { id: date, amount_ml: ml, pendingSync: true })
      }
    }
  }
}
