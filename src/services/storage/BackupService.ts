import { idb, STORES } from './IndexedDB'
import { memoryStore } from './MemoryStore'
import { musicStorage } from './music.storage'
import { generateId } from '@/utils/format'
import { Capacitor } from '@capacitor/core'

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

    // Reflection & Motivation
    reflectionEntries?: any[]
    motivationQuotes?: any[]
    motivationNotes?: any[]
    motivationCollections?: any[]
    customMotivationCategories?: any[]

    // Integrations & Health Connect
    integrationSettings?: any[]
    integrationLogs?: any[]
    notebooks?: any[]
    healthRecords?: any[]

    // Android Productivity Features
    attachments?: any[]
    notificationSchedules?: any[]
    notificationHistory?: any[]

    // Custom Songs
    customSongs?: any[]
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
   * Reads fresh from MemoryStore and storage services to guarantee a complete export.
   */
  async exportBackup(): Promise<string> {
    await memoryStore.init()

    const backup: BackupData = {
      version: CURRENT_BACKUP_VERSION,
      appName: 'Ihsan OS',
      timestamp: new Date().toISOString(),
      data: {
        tasks: memoryStore.tasks || [],
        habits: memoryStore.habits || [],
        goals: memoryStore.goals || [],
        workouts: memoryStore.workouts || [],
        meals: memoryStore.meals || [],
        sleepLogs: memoryStore.sleepLogs || [],
        knowledge: memoryStore.knowledge || [],
        transactions: memoryStore.transactions || [],
        budgets: memoryStore.budgets || [],
        waterLogs: memoryStore.waterLogs || {},
        settings: memoryStore.settings || {},
        profile: memoryStore.profile || {},
        nutritionGoals: memoryStore.nutritionGoals || {},
        studySessions: memoryStore.studySessions || [],

        subjects: memoryStore.subjects || [],
        chapters: memoryStore.chapters || [],
        topics: memoryStore.topics || [],
        sessions: memoryStore.sessions || [],
        revisions: memoryStore.revisions || [],
        questions: memoryStore.questions || [],
        tests: memoryStore.tests || [],
        mistakes: memoryStore.mistakes || [],
        formulas: memoryStore.formulas || [],
        notes: memoryStore.notes || [],

        reflectionEntries: memoryStore.reflectionEntries || [],
        motivationQuotes: memoryStore.motivationQuotes || [],
        motivationNotes: memoryStore.motivationNotes || [],
        motivationCollections: memoryStore.motivationCollections || [],
        customMotivationCategories: memoryStore.customMotivationCategories || [],

        integrationSettings: memoryStore.integrationSettings || [],
        integrationLogs: memoryStore.integrationLogs || [],
        notebooks: memoryStore.notebooks || [],
        healthRecords: memoryStore.healthRecords || [],

        attachments: memoryStore.attachments || [],
        notificationSchedules: memoryStore.notificationSchedules || [],
        notificationHistory: memoryStore.notificationHistory || [],

        customSongs: musicStorage.getAll() || [],
      },
    }

    return JSON.stringify(backup, null, 2)
  },

  // ── Backup History ──────────────────────────────────────────────────────

  async createAndSaveBackup(label?: string): Promise<{ json: string; entry: BackupHistoryEntry }> {
    const json = await this.exportBackup()
    const sizeBytes = new Blob([json]).size

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

  async getBackupHistory(): Promise<BackupHistoryEntry[]> {
    try {
      const all = await idb.getAll<BackupHistoryEntry>(STORES.BACKUP_HISTORY)
      return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } catch {
      return []
    }
  },

  async deleteBackupEntry(id: string): Promise<void> {
    await idb.delete(STORES.BACKUP_HISTORY, id)
  },

  // ── Auto-backup Check ───────────────────────────────────────────────────

  async runAutoBackupIfDue(): Promise<void> {
    if (!this.autoBackup) return

    const last = this.lastBackupTime
    if (!last) {
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

  // ── Import & Restore ───────────────────────────────────────────────────

  /**
   * Import data from JSON backup string and restore into memory/IndexedDB.
   * Flexible parser that accepts full v1/v2 backups, raw data objects, or text.
   */
  async importBackup(jsonString: string): Promise<void> {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new Error('Import failed: Empty or invalid file content.')
    }

    // Sanitize string (strip UTF-8 BOM, trim whitespace)
    let cleanString = jsonString.trim().replace(/^\uFEFF/, '')

    let raw: any
    try {
      raw = JSON.parse(cleanString)
    } catch (err: any) {
      throw new Error(`JSON syntax error: Unable to parse backup file. (${err.message})`)
    }

    // Flexible data extraction
    const data: BackupData['data'] = raw.data ? raw.data : (raw.tasks || raw.habits || raw.subjects ? raw : null)

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid backup structure: No valid ERP collections found in file.')
    }

    const now = new Date().toISOString()

    // Helper to format & validate records before storage
    function prepareRecord(record: any): any {
      if (!record || typeof record !== 'object') return null
      const id = record.id ?? generateId()
      return {
        ...record,
        id,
        pendingSync: true,
        lastSyncedAt: null,
        updatedAt: record.updatedAt ?? now,
        createdAt: record.createdAt ?? now,
        deleted: record.deleted ?? false,
        syncVersion: (record.syncVersion ?? 1) + 1,
      }
    }

    // Clear existing database and memory cache
    await idb.clearAll()
    memoryStore.clearMemory()

    // Restore Singular Settings / Profile
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

    // Restore All Collection Arrays
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

      { memKey: 'reflectionEntries', store: STORES.REFLECTION_ENTRIES, list: data.reflectionEntries ?? [] },
      { memKey: 'motivationQuotes', store: STORES.MOTIVATION_QUOTES, list: data.motivationQuotes ?? [] },
      { memKey: 'motivationNotes', store: STORES.MOTIVATION_NOTES, list: data.motivationNotes ?? [] },
      { memKey: 'motivationCollections', store: STORES.MOTIVATION_COLLECTIONS, list: data.motivationCollections ?? [] },
      { memKey: 'customMotivationCategories', store: STORES.CUSTOM_MOTIVATION_CATEGORIES, list: data.customMotivationCategories ?? [] },

      { memKey: 'integrationSettings', store: STORES.INTEGRATION_SETTINGS, list: data.integrationSettings ?? [] },
      { memKey: 'integrationLogs', store: STORES.INTEGRATION_LOGS, list: data.integrationLogs ?? [] },
      { memKey: 'notebooks', store: STORES.NOTEBOOKS, list: data.notebooks ?? [] },
      { memKey: 'healthRecords', store: STORES.HEALTH_RECORDS, list: data.healthRecords ?? [] },

      { memKey: 'attachments', store: STORES.ATTACHMENTS, list: data.attachments ?? [] },
      { memKey: 'notificationSchedules', store: STORES.NOTIFICATION_SCHEDULES, list: data.notificationSchedules ?? [] },
      { memKey: 'notificationHistory', store: STORES.NOTIFICATION_HISTORY, list: data.notificationHistory ?? [] },
    ]

    for (const { memKey, store, list } of arrayRestores) {
      if (!Array.isArray(list) || list.length === 0) continue
      const preparedList = list.map(prepareRecord).filter(Boolean)
      ;(memoryStore as any)[memKey] = preparedList
      await idb.putBatch(store, preparedList)
    }

    // Restore Water Logs
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

    // Restore Custom Songs if present
    if (Array.isArray(data.customSongs) && data.customSongs.length > 0) {
      const preparedSongs = data.customSongs.map(prepareRecord).filter(Boolean)
      try {
        localStorage.setItem('ihsanos_custom_music_library', JSON.stringify(preparedSongs))
      } catch { /* ignore */ }
    }

    // Force re-initialize MemoryStore
    await memoryStore.init()
  },

  // ── Universal Cross-Platform File Downloader ───────────────────────────

  /**
   * Universal downloader for JSON & CSV files. Works on Web & Capacitor Native.
   */
  async downloadFile(content: string, filename: string, mimeType: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
        const { Share } = await import('@capacitor/share')

        // Write file to native cache
        const result = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        })

        // Prompt native share dialog to save/export file
        await Share.share({
          title: `Export ${filename}`,
          url: result.uri,
          dialogTitle: 'Save or Share Backup File',
        })
        return
      } catch (err) {
        console.warn('[BackupService] Native file export fallback to web blob:', err)
      }
    }

    // Standard Web Browser Download
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },

  // ── CSV Export ──────────────────────────────────────────────────────────

  exportCSV(_module: keyof BackupData['data'], data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) return ''

    const skipKeys = new Set(['pendingSync', 'lastSyncedAt', 'deleted', 'syncVersion'])
    const allKeys = Array.from(
      data.reduce((set, row) => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach(k => { if (!skipKeys.has(k)) set.add(k) })
        }
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

  getBackupTimestamp(jsonString: string): string | null {
    try {
      const partial = JSON.parse(jsonString) as Partial<BackupData>
      return partial.timestamp ?? null
    } catch {
      return null
    }
  },
}
