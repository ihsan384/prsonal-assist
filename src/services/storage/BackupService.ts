import { idb, STORES } from './IndexedDB'
import { memoryStore } from './MemoryStore'
import { generateId } from '@/utils/format'

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

export interface BackupHistoryEntry {
  id: string
  createdAt: string
  sizeBytes: number
  version: string
  label: string
  recordCount: number
}

const CURRENT_BACKUP_VERSION = '2.0.0'
const SUPPORTED_VERSIONS = ['1.0.0', '2.0.0']
const LS_LAST_BACKUP = 'ihsanos_last_backup'
const LS_AUTO_BACKUP = 'ihsanos_auto_backup'
const LS_BACKUP_FREQ = 'ihsanos_backup_freq'

export const backupService = {
  // ── Settings ────────────────────────────────────────────────────────────

  get autoBackup(): boolean {
    return localStorage.getItem(LS_AUTO_BACKUP) !== 'false'
  },
  set autoBackup(v: boolean) {
    localStorage.setItem(LS_AUTO_BACKUP, String(v))
  },

  get backupFrequency(): 'daily' | 'weekly' | 'monthly' {
    return (localStorage.getItem(LS_BACKUP_FREQ) as any) ?? 'daily'
  },
  set backupFrequency(v: 'daily' | 'weekly' | 'monthly') {
    localStorage.setItem(LS_BACKUP_FREQ, v)
  },

  get lastBackupTime(): string | null {
    return localStorage.getItem(LS_LAST_BACKUP)
  },

  // ── Core Export ─────────────────────────────────────────────────────────

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

  // ── Backup History ──────────────────────────────────────────────────────

  /**
   * Save a backup and persist its metadata to the BACKUP_HISTORY store.
   * Returns the JSON string and the history entry.
   */
  async createAndSaveBackup(label?: string): Promise<{ json: string; entry: BackupHistoryEntry }> {
    const json = await this.exportBackup()
    const sizeBytes = new Blob([json]).size

    // Count total records
    let recordCount = 0
    try {
      const parsed = JSON.parse(json) as BackupData
      recordCount = Object.values(parsed.data).reduce((total, val) => {
        if (Array.isArray(val)) return total + val.length
        return total
      }, 0)
    } catch { /* ignore */ }

    const entry: BackupHistoryEntry = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      sizeBytes,
      version: CURRENT_BACKUP_VERSION,
      label: label ?? `Backup ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      recordCount,
    }

    await idb.put(STORES.BACKUP_HISTORY, entry)
    localStorage.setItem(LS_LAST_BACKUP, entry.createdAt)
    return { json, entry }
  },

  /**
   * Retrieve all backup history entries, newest first.
   */
  async getBackupHistory(): Promise<BackupHistoryEntry[]> {
    try {
      const all = await idb.getAll<BackupHistoryEntry>(STORES.BACKUP_HISTORY)
      return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } catch {
      return []
    }
  },

  /**
   * Delete a single backup history entry by ID.
   */
  async deleteBackupEntry(id: string): Promise<void> {
    await idb.delete(STORES.BACKUP_HISTORY, id)
  },

  // ── Auto-backup Check ───────────────────────────────────────────────────

  /**
   * Run auto-backup if enabled and the frequency interval has elapsed.
   * Safe to call on app startup.
   */
  async runAutoBackupIfDue(): Promise<void> {
    if (!this.autoBackup) return

    const last = this.lastBackupTime
    if (!last) {
      // No backup ever taken — take one now
      await this.createAndSaveBackup('Auto Backup (First Run)')
      return
    }

    const diffMs = Date.now() - new Date(last).getTime()
    const thresholds = { daily: 86_400_000, weekly: 604_800_000, monthly: 2_592_000_000 }
    const threshold = thresholds[this.backupFrequency] ?? thresholds.daily

    if (diffMs >= threshold) {
      await this.createAndSaveBackup(`Auto Backup (${this.backupFrequency})`)
    }
  },

  // ── Import ──────────────────────────────────────────────────────────────

  /**
   * Import data from JSON backup string and restore into memory/IndexedDB.
   * All restored records are marked pendingSync = true so they get pushed to
   * Supabase on next connection.
   */
  async importBackup(jsonString: string): Promise<void> {
    const raw = JSON.parse(jsonString)

    if (!raw.version || !raw.data) {
      throw new Error('Invalid backup file format: missing version or data fields.')
    }

    if (!SUPPORTED_VERSIONS.includes(raw.version)) {
      throw new Error(`Unsupported backup version "${raw.version}". Supported: ${SUPPORTED_VERSIONS.join(', ')}`)
    }

    const backup = raw as BackupData
    const { data } = backup
    const now = new Date().toISOString()

    await idb.clearAll()
    memoryStore.clearMemory()

    function prepareRecord(record: any): any {
      return {
        ...record,
        pendingSync: true,
        lastSyncedAt: null,
        updatedAt: record.updatedAt ?? now,
        createdAt: record.createdAt ?? now,
        deleted: record.deleted ?? false,
        syncVersion: (record.syncVersion ?? 1) + 1,
      }
    }

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
      await idb.putBatch(store, preparedList)
    }

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

  // ── CSV Export ──────────────────────────────────────────────────────────

  /**
   * Export a specific data module as CSV.
   * Returns a CSV string.
   */
  exportCSV(module: keyof BackupData['data'], data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) return ''

    // Collect all unique keys across all records (omitting sync metadata)
    const skipKeys = new Set(['pendingSync', 'lastSyncedAt', 'deleted', 'syncVersion'])
    const allKeys = Array.from(
      data.reduce((set, row) => {
        Object.keys(row).forEach(k => { if (!skipKeys.has(k)) set.add(k) })
        return set
      }, new Set<string>())
    ) as string[]

    const escape = (val: unknown): string => {
      if (val === null || val === undefined) return ''
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }

    const header = allKeys.join(',')
    const rows = data.map(row => allKeys.map(k => escape(row[k])).join(','))
    return [header, ...rows].join('\n')
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
