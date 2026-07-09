import { idb, STORES } from './IndexedDB'
import { memoryStore } from './MemoryStore'

export interface BackupData {
  version: string
  timestamp: string
  appName: string
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

const CURRENT_BACKUP_VERSION = '2.0.0'
const SUPPORTED_VERSIONS = ['1.0.0', '2.0.0']

export const backupService = {
  /**
   * Export all data as a backup JSON string.
   * Reads fresh from IndexedDB to guarantee the export is complete.
   */
  async exportBackup(): Promise<string> {
    await memoryStore.init()

    const backup: BackupData = {
      version: CURRENT_BACKUP_VERSION,
      appName: 'Ihsan OS',
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
        notes: memoryStore.notes,
      },
    }

    return JSON.stringify(backup, null, 2)
  },

  /**
   * Import data from JSON backup string and restore into memory/IndexedDB.
   * All restored records are marked pendingSync = true so they get pushed to
   * Supabase on next connection.
   */
  async importBackup(jsonString: string): Promise<void> {
    const raw = JSON.parse(jsonString)

    // Version validation
    if (!raw.version || !raw.data) {
      throw new Error('Invalid backup file format: missing version or data fields.')
    }

    if (!SUPPORTED_VERSIONS.includes(raw.version)) {
      throw new Error(`Unsupported backup version "${raw.version}". Supported: ${SUPPORTED_VERSIONS.join(', ')}`)
    }

    const backup = raw as BackupData
    const { data } = backup
    const now = new Date().toISOString()

    // 1. Wipe current database and in-memory state
    await idb.clearAll()
    memoryStore.clearMemory()

    // ─── Helper to restore a record with correct sync fields ───────────
    function prepareRecord(record: any): any {
      return {
        ...record,
        pendingSync: true,       // mark for upload to Supabase
        lastSyncedAt: null,      // hasn't been synced since restore
        updatedAt: record.updatedAt ?? now,
        createdAt: record.createdAt ?? now,
        deleted: record.deleted ?? false,
        syncVersion: (record.syncVersion ?? 1) + 1, // bump version on restore
      }
    }

    // 2. Restore settings, profile, nutrition goals (singular items)
    if (data.settings) {
      const settings = prepareRecord({ id: 'app_settings', ...data.settings })
      memoryStore.settings = settings
      await idb.put(STORES.SETTINGS, settings)
    }

    if (data.profile) {
      const profile = prepareRecord({ id: 'user_profile', ...data.profile })
      memoryStore.profile = profile
      await idb.put(STORES.PROFILE, profile)
    }

    if (data.nutritionGoals) {
      const nutrGoals = prepareRecord({ id: 'default', ...data.nutritionGoals })
      memoryStore.nutritionGoals = nutrGoals
      await idb.put(STORES.NUTRITION_GOALS, nutrGoals)
    }

    // 3. Restore array stores
    const arrayRestores: Array<{ memKey: keyof typeof memoryStore; store: typeof STORES[keyof typeof STORES]; list: any[] }> = [
      { memKey: 'tasks', store: STORES.TASKS, list: data.tasks ?? [] },
      { memKey: 'habits', store: STORES.HABITS, list: data.habits ?? [] },
      { memKey: 'goals', store: STORES.GOALS, list: data.goals ?? [] },
      { memKey: 'workouts', store: STORES.WORKOUTS, list: data.workouts ?? [] },
      { memKey: 'meals', store: STORES.MEALS, list: data.meals ?? [] },
      { memKey: 'sleepLogs', store: STORES.SLEEP_LOGS, list: data.sleepLogs ?? [] },
      { memKey: 'knowledge', store: STORES.KNOWLEDGE, list: data.knowledge ?? [] },
      { memKey: 'transactions', store: STORES.TRANSACTIONS, list: data.transactions ?? [] },
      { memKey: 'budgets', store: STORES.BUDGETS, list: data.budgets ?? [] },
      { memKey: 'studySessions', store: STORES.STUDY_SESSIONS, list: data.studySessions ?? [] },
      { memKey: 'subjects', store: STORES.SUBJECTS, list: data.subjects ?? [] },
      { memKey: 'chapters', store: STORES.CHAPTERS, list: data.chapters ?? [] },
      { memKey: 'topics', store: STORES.TOPICS, list: data.topics ?? [] },
      { memKey: 'sessions', store: STORES.SESSIONS, list: data.sessions ?? [] },
      { memKey: 'revisions', store: STORES.REVISIONS, list: data.revisions ?? [] },
      { memKey: 'questions', store: STORES.QUESTIONS, list: data.questions ?? [] },
      { memKey: 'tests', store: STORES.TESTS, list: data.tests ?? [] },
      { memKey: 'mistakes', store: STORES.MISTAKES, list: data.mistakes ?? [] },
      { memKey: 'formulas', store: STORES.FORMULAS, list: data.formulas ?? [] },
      { memKey: 'notes', store: STORES.NOTES, list: data.notes ?? [] },
    ]

    for (const { memKey, store, list } of arrayRestores) {
      if (!Array.isArray(list)) continue

      const preparedList = list.map(prepareRecord)
      ;(memoryStore as any)[memKey] = preparedList

      // Batch write to IndexedDB for performance
      await idb.putBatch(store, preparedList)
    }

    // 4. Restore water logs
    if (data.waterLogs && typeof data.waterLogs === 'object') {
      memoryStore.waterLogs = data.waterLogs
      const waterEntries = Object.entries(data.waterLogs).map(([date, ml]) => ({
        id: date,
        amount_ml: ml as number,
        pendingSync: true,
        lastSyncedAt: null,
        updatedAt: now,
        createdAt: now,
        deleted: false,
        syncVersion: 1,
      }))
      await idb.putBatch(STORES.WATER_LOGS, waterEntries)
    }
  },

  /**
   * Returns the formatted backup timestamp from a JSON string without parsing the whole file
   */
  getBackupTimestamp(jsonString: string): string | null {
    try {
      const partial = JSON.parse(jsonString) as Partial<BackupData>
      return partial.timestamp ?? null
    } catch {
      return null
    }
  },
}
