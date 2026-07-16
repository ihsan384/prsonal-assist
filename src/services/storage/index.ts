import { generateId } from '@/utils/format'
import { getTodayString } from '@/utils/date'
import { memoryStore } from './MemoryStore'
import { STORES, idb } from './IndexedDB'
import type { Task, Habit, Goal, Workout, Meal, SleepLog, KnowledgeItem, Transaction, Budget, AppSettings, UserProfile, NutritionGoal, ReflectionEntry, MotivationQuote, MotivationNote, MotivationCollection, CustomMotivationCategory } from '@/types'
import type { StudySession } from '@/types/study.types'

function isToday(dateStr: string) {
  try {
    return new Date(dateStr).toDateString() === new Date().toDateString()
  } catch {
    return false
  }
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export const taskStorage = {
  getAll: () => memoryStore.tasks.filter(t => !t.deleted),
  getById: (id: string) => memoryStore.tasks.find(t => t.id === id && !t.deleted),
  add: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: Task = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.TASKS, memoryStore.tasks, record)
    return memoryStore.tasks.filter(t => !t.deleted)
  },
  update: (id: string, partial: Partial<Task>) => {
    const current = memoryStore.tasks.find(t => t.id === id)
    if (!current) return memoryStore.tasks.filter(t => !t.deleted)
    const record: Task = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.TASKS, memoryStore.tasks, record)
    return memoryStore.tasks.filter(t => !t.deleted)
  },
  remove: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.TASKS, memoryStore.tasks, id)
    return memoryStore.tasks.filter(t => !t.deleted)
  },
  getByStatus: (status: Task['status']) => memoryStore.tasks.filter(t => t.status === status && !t.deleted),
  getToday: () => {
    const today = getTodayString()
    return memoryStore.tasks.filter(t => !t.deleted && (t.dueDate === today || isToday(t.createdAt)))
  },
}

// ─── Habits ────────────────────────────────────────────────────────────────

export const habitStorage = {
  getAll: () => memoryStore.habits.filter(h => !h.deleted),
  getById: (id: string) => memoryStore.habits.find(h => h.id === id && !h.deleted),
  add: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: Habit = {
      ...habit,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.HABITS, memoryStore.habits, record)
    return memoryStore.habits.filter(h => !h.deleted)
  },
  update: (id: string, partial: Partial<Habit>) => {
    const current = memoryStore.habits.find(h => h.id === id)
    if (!current) return memoryStore.habits.filter(h => !h.deleted)
    const record: Habit = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.HABITS, memoryStore.habits, record)
    return memoryStore.habits.filter(h => !h.deleted)
  },
  remove: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.HABITS, memoryStore.habits, id)
    return memoryStore.habits.filter(h => !h.deleted)
  },
  getActive: () => memoryStore.habits.filter(h => h.isActive && !h.deleted),
}

// ─── Study ─────────────────────────────────────────────────────────────────

export const studyStorage = {
  getSessions: () => memoryStore.sessions.filter(s => !s.deleted),
  addSession: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: StudySession = {
      ...session,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.SESSIONS, memoryStore.sessions, record)
    return memoryStore.sessions.filter(s => !s.deleted)
  },
  updateSession: (id: string, partial: Partial<StudySession>) => {
    const current = memoryStore.sessions.find(s => s.id === id)
    if (!current) return memoryStore.sessions.filter(s => !s.deleted)
    const record: StudySession = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.SESSIONS, memoryStore.sessions, record)
    return memoryStore.sessions.filter(s => !s.deleted)
  },
  removeSession: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.SESSIONS, memoryStore.sessions, id)
    return memoryStore.sessions.filter(s => !s.deleted)
  },
  getTodayMinutes: () => {
    const today = getTodayString()
    return memoryStore.sessions
      .filter(s => !s.deleted && s.startTime.startsWith(today))
      .reduce((sum, s) => sum + s.durationMinutes, 0)
  },
}

// ─── Goals ─────────────────────────────────────────────────────────────────

export const goalStorage = {
  getAll: () => memoryStore.goals.filter(g => !g.deleted),
  getById: (id: string) => memoryStore.goals.find(g => g.id === id && !g.deleted),
  add: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: Goal = {
      ...goal,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.GOALS, memoryStore.goals, record)
    return memoryStore.goals.filter(g => !g.deleted)
  },
  update: (id: string, partial: Partial<Goal>) => {
    const current = memoryStore.goals.find(g => g.id === id)
    if (!current) return memoryStore.goals.filter(g => !g.deleted)
    const record: Goal = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.GOALS, memoryStore.goals, record)
    return memoryStore.goals.filter(g => !g.deleted)
  },
  remove: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.GOALS, memoryStore.goals, id)
    return memoryStore.goals.filter(g => !g.deleted)
  },
  getActive: () => memoryStore.goals.filter(g => g.status === 'active' && !g.deleted),
}

// ─── Fitness ───────────────────────────────────────────────────────────────

export const fitnessStorage = {
  getWorkouts: () => memoryStore.workouts.filter(w => !w.deleted),
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: Workout = {
      ...workout,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.WORKOUTS, memoryStore.workouts, record)
    return memoryStore.workouts.filter(w => !w.deleted)
  },
  updateWorkout: (id: string, partial: Partial<Workout>) => {
    const current = memoryStore.workouts.find(w => w.id === id)
    if (!current) return memoryStore.workouts.filter(w => !w.deleted)
    const record: Workout = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.WORKOUTS, memoryStore.workouts, record)
    return memoryStore.workouts.filter(w => !w.deleted)
  },
  removeWorkout: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.WORKOUTS, memoryStore.workouts, id)
    return memoryStore.workouts.filter(w => !w.deleted)
  },
  getTodayWorkout: () => {
    const today = getTodayString()
    return memoryStore.workouts.find(w => !w.deleted && w.date === today)
  },
}

// ─── Nutrition ─────────────────────────────────────────────────────────────

export const nutritionStorage = {
  getMeals: () => memoryStore.meals.filter(m => !m.deleted),
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: Meal = {
      ...meal,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.MEALS, memoryStore.meals, record)
    return memoryStore.meals.filter(m => !m.deleted)
  },
  updateMeal: (id: string, partial: Partial<Meal>) => {
    const current = memoryStore.meals.find(m => m.id === id)
    if (!current) return memoryStore.meals.filter(m => !m.deleted)
    const record: Meal = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.MEALS, memoryStore.meals, record)
    return memoryStore.meals.filter(m => !m.deleted)
  },
  removeMeal: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.MEALS, memoryStore.meals, id)
    return memoryStore.meals.filter(m => !m.deleted)
  },
  getTodayMeals: () => {
    const today = getTodayString()
    return memoryStore.meals.filter(m => !m.deleted && m.date === today)
  },
  getGoals: (): NutritionGoal => memoryStore.nutritionGoals,
  setGoals: (goals: NutritionGoal) => {
    memoryStore.nutritionGoals = goals
    memoryStore.saveToStore(STORES.NUTRITION_GOALS, [], { id: 'default', ...goals })
  },
  getWaterToday: (): number => {
    const today = getTodayString()
    return memoryStore.waterLogs[today] ?? 0
  },
  setWaterToday: (ml: number) => {
    const today = getTodayString()
    memoryStore.waterLogs[today] = ml
    memoryStore.saveToStore(STORES.WATER_LOGS, [], { id: today, amount_ml: ml })
  },
}

// ─── Sleep ─────────────────────────────────────────────────────────────────

export const sleepStorage = {
  getLogs: () => memoryStore.sleepLogs.filter(s => !s.deleted),
  addLog: (log: Omit<SleepLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: SleepLog = {
      ...log,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.SLEEP_LOGS, memoryStore.sleepLogs, record)
    return memoryStore.sleepLogs.filter(s => !s.deleted)
  },
  updateLog: (id: string, partial: Partial<SleepLog>) => {
    const current = memoryStore.sleepLogs.find(s => s.id === id)
    if (!current) return memoryStore.sleepLogs.filter(s => !s.deleted)
    const record: SleepLog = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.SLEEP_LOGS, memoryStore.sleepLogs, record)
    return memoryStore.sleepLogs.filter(s => !s.deleted)
  },
  removeLog: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.SLEEP_LOGS, memoryStore.sleepLogs, id)
    return memoryStore.sleepLogs.filter(s => !s.deleted)
  },
  getLastNight: () => {
    const today = getTodayString()
    return memoryStore.sleepLogs.find(s => !s.deleted && s.date === today)
  },
}

// ─── Knowledge ─────────────────────────────────────────────────────────────

export const knowledgeStorage = {
  getAll: () => memoryStore.knowledge.filter(k => !k.deleted),
  getById: (id: string) => memoryStore.knowledge.find(k => k.id === id && !k.deleted),
  add: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: KnowledgeItem = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.KNOWLEDGE, memoryStore.knowledge, record)
    return memoryStore.knowledge.filter(k => !k.deleted)
  },
  update: (id: string, partial: Partial<KnowledgeItem>) => {
    const current = memoryStore.knowledge.find(k => k.id === id)
    if (!current) return memoryStore.knowledge.filter(k => !k.deleted)
    const record: KnowledgeItem = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.KNOWLEDGE, memoryStore.knowledge, record)
    return memoryStore.knowledge.filter(k => !k.deleted)
  },
  remove: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.KNOWLEDGE, memoryStore.knowledge, id)
    return memoryStore.knowledge.filter(k => !k.deleted)
  },
}

// ─── Finance ───────────────────────────────────────────────────────────────

export const financeStorage = {
  getTransactions: () => memoryStore.transactions.filter(t => !t.deleted),
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: Transaction = {
      ...tx,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.TRANSACTIONS, memoryStore.transactions, record)
    return memoryStore.transactions.filter(t => !t.deleted)
  },
  updateTransaction: (id: string, partial: Partial<Transaction>) => {
    const current = memoryStore.transactions.find(t => t.id === id)
    if (!current) return memoryStore.transactions.filter(t => !t.deleted)
    const record: Transaction = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.TRANSACTIONS, memoryStore.transactions, record)
    return memoryStore.transactions.filter(t => !t.deleted)
  },
  removeTransaction: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.TRANSACTIONS, memoryStore.transactions, id)
    return memoryStore.transactions.filter(t => !t.deleted)
  },
  getBudgets: () => memoryStore.budgets.filter(b => !b.deleted),
  setBudgets: (budgets: Budget[]) => {
    // Delete any old budgets not in new list
    const incomingIds = budgets.map(b => b.id)
    memoryStore.budgets.forEach(b => {
      if (!incomingIds.includes(b.id)) {
        memoryStore.softDeleteFromStore(STORES.BUDGETS, memoryStore.budgets, b.id)
      }
    })
    
    // Save new/updated budgets
    budgets.forEach(b => {
      const record: Budget = {
        ...b,
        deleted: false,
        updatedAt: new Date().toISOString()
      }
      memoryStore.saveToStore(STORES.BUDGETS, memoryStore.budgets, record)
    })
  },
}

// ─── Settings ──────────────────────────────────────────────────────────────

export const settingsStorage = {
  get: (): AppSettings => memoryStore.settings,
  set: (settings: Partial<AppSettings>) => {
    const current = memoryStore.settings
    const updated = { ...current, ...settings }
    memoryStore.settings = updated
    memoryStore.saveToStore(STORES.SETTINGS, [], { id: 'app_settings', ...updated })
  },
}

// ─── Profile ───────────────────────────────────────────────────────────────

export const profileStorage = {
  get: (): UserProfile => memoryStore.profile,
  set: (profile: Partial<UserProfile>) => {
    const current = memoryStore.profile
    const updated = { ...current, ...profile }
    memoryStore.profile = updated
    memoryStore.saveToStore(STORES.PROFILE, [], { id: 'user_profile', ...updated })
  },
}

// ─── Reflection (Diary) ────────────────────────────────────────────────────

export const reflectionStorage = {
  getAll: () => memoryStore.reflectionEntries.filter(e => !e.deleted),
  getById: (id: string) => memoryStore.reflectionEntries.find(e => e.id === id && !e.deleted),
  getByDate: (date: string) => memoryStore.reflectionEntries.find(e => !e.deleted && e.date === date),
  add: (entry: Omit<ReflectionEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const id = entry.id || generateId()
    const now = new Date().toISOString()
    const record: ReflectionEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.REFLECTION_ENTRIES, memoryStore.reflectionEntries, record)
    return memoryStore.reflectionEntries.filter(e => !e.deleted)
  },
  update: (id: string, partial: Partial<ReflectionEntry>) => {
    const current = memoryStore.reflectionEntries.find(e => e.id === id)
    if (!current) return memoryStore.reflectionEntries.filter(e => !e.deleted)
    const record: ReflectionEntry = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.REFLECTION_ENTRIES, memoryStore.reflectionEntries, record)
    return memoryStore.reflectionEntries.filter(e => !e.deleted)
  },
  remove: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.REFLECTION_ENTRIES, memoryStore.reflectionEntries, id)
    return memoryStore.reflectionEntries.filter(e => !e.deleted)
  },
  getToday: () => {
    const today = getTodayString()
    return memoryStore.reflectionEntries.find(e => !e.deleted && e.date === today)
  },
  getStreak: () => {
    const entries = memoryStore.reflectionEntries
      .filter(e => !e.deleted)
      .sort((a, b) => b.date.localeCompare(a.date))
    if (entries.length === 0) return 0
    let streak = 0
    const today = new Date()
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date)
      const diff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === i || diff === i + 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  },
}

// ─── Motivation ────────────────────────────────────────────────────────────

export const motivationStorage = {
  // Quotes
  getQuotes: () => memoryStore.motivationQuotes.filter(q => !q.deleted),
  getQuoteById: (id: string) => memoryStore.motivationQuotes.find(q => q.id === id && !q.deleted),
  addQuote: (quote: Omit<MotivationQuote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: MotivationQuote = {
      ...quote,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.MOTIVATION_QUOTES, memoryStore.motivationQuotes, record)
    return memoryStore.motivationQuotes.filter(q => !q.deleted)
  },
  updateQuote: (id: string, partial: Partial<MotivationQuote>) => {
    const current = memoryStore.motivationQuotes.find(q => q.id === id)
    if (!current) return memoryStore.motivationQuotes.filter(q => !q.deleted)
    const record: MotivationQuote = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.MOTIVATION_QUOTES, memoryStore.motivationQuotes, record)
    return memoryStore.motivationQuotes.filter(q => !q.deleted)
  },
  removeQuote: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.MOTIVATION_QUOTES, memoryStore.motivationQuotes, id)
    return memoryStore.motivationQuotes.filter(q => !q.deleted)
  },
  getRandomQuote: () => {
    const quotes = memoryStore.motivationQuotes.filter(q => !q.deleted)
    if (quotes.length === 0) return null
    return quotes[Math.floor(Math.random() * quotes.length)]
  },

  // Notes
  getNotes: () => memoryStore.motivationNotes.filter(n => !n.deleted),
  getNoteById: (id: string) => memoryStore.motivationNotes.find(n => n.id === id && !n.deleted),
  addNote: (note: Omit<MotivationNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: MotivationNote = {
      ...note,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.MOTIVATION_NOTES, memoryStore.motivationNotes, record)
    return memoryStore.motivationNotes.filter(n => !n.deleted)
  },
  updateNote: (id: string, partial: Partial<MotivationNote>) => {
    const current = memoryStore.motivationNotes.find(n => n.id === id)
    if (!current) return memoryStore.motivationNotes.filter(n => !n.deleted)
    const record: MotivationNote = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.MOTIVATION_NOTES, memoryStore.motivationNotes, record)
    return memoryStore.motivationNotes.filter(n => !n.deleted)
  },
  removeNote: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.MOTIVATION_NOTES, memoryStore.motivationNotes, id)
    return memoryStore.motivationNotes.filter(n => !n.deleted)
  },

  // Collections
  getCollections: () => memoryStore.motivationCollections.filter(c => !c.deleted),
  addCollection: (collection: Omit<MotivationCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: MotivationCollection = {
      ...collection,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.MOTIVATION_COLLECTIONS, memoryStore.motivationCollections, record)
    return memoryStore.motivationCollections.filter(c => !c.deleted)
  },
  updateCollection: (id: string, partial: Partial<MotivationCollection>) => {
    const current = memoryStore.motivationCollections.find(c => c.id === id)
    if (!current) return memoryStore.motivationCollections.filter(c => !c.deleted)
    const record: MotivationCollection = { ...current, ...partial, updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.MOTIVATION_COLLECTIONS, memoryStore.motivationCollections, record)
    return memoryStore.motivationCollections.filter(c => !c.deleted)
  },
  removeCollection: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.MOTIVATION_COLLECTIONS, memoryStore.motivationCollections, id)
    return memoryStore.motivationCollections.filter(c => !c.deleted)
  },

  // Custom Categories
  getCustomCategories: () => memoryStore.customMotivationCategories.filter(c => !c.deleted),
  addCustomCategory: (cat: Omit<CustomMotivationCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record: CustomMotivationCategory = {
      ...cat,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
    }
    memoryStore.saveToStore(STORES.CUSTOM_MOTIVATION_CATEGORIES, memoryStore.customMotivationCategories, record)
    return memoryStore.customMotivationCategories.filter(c => !c.deleted)
  },
  removeCustomCategory: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.CUSTOM_MOTIVATION_CATEGORIES, memoryStore.customMotivationCategories, id)
    return memoryStore.customMotivationCategories.filter(c => !c.deleted)
  },

  // Export helpers
  exportQuotesJSON: () => JSON.stringify(memoryStore.motivationQuotes.filter(q => !q.deleted), null, 2),
  exportNotesJSON: () => JSON.stringify(memoryStore.motivationNotes.filter(n => !n.deleted), null, 2),
  importQuotesJSON: async (json: string): Promise<number> => {
    const quotes = JSON.parse(json)
    if (!Array.isArray(quotes)) {
      throw new Error('Import data must be a JSON array')
    }
    const generateUUID = () => {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }
    
    for (const q of quotes) {
      const newId = generateUUID()
      const record: MotivationQuote = {
        id: newId,
        quote: q.quote || '',
        author: q.author,
        source: q.source,
        category: q.category || 'motivation',
        tags: Array.isArray(q.tags) ? q.tags : [],
        isFavourite: q.isFavourite || false,
        isPinned: q.isPinned || false,
        collectionIds: Array.isArray(q.collectionIds) ? q.collectionIds : [],
        createdAt: q.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
        pendingSync: true,
        syncVersion: 1,
      }
      await memoryStore.saveToStore(STORES.MOTIVATION_QUOTES, memoryStore.motivationQuotes, record)
    }
    return quotes.length
  },
}

// ─── Integrations ──────────────────────────────────────────────────────────

export const integrationSettingsStorage = {
  getAll: () => memoryStore.integrationSettings.filter(s => !s.deleted),
  getById: (id: string) => memoryStore.integrationSettings.find(s => s.id === id && !s.deleted),
  save: (setting: { id: string; status: string; lastSync?: string; metadata?: any; encryptedTokens?: string; syncStatus?: string; retryCount?: number; lastRetry?: string; lastError?: string }) => {
    const existing = memoryStore.integrationSettings.find(s => s.id === setting.id)
    const record = {
      ...existing,
      ...setting,
      id: setting.id,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
      pendingSync: true,
      syncVersion: (existing?.syncVersion || 0) + 1,
      syncStatus: setting.syncStatus || 'pending',
      retryCount: setting.retryCount || 0,
      lastRetry: setting.lastRetry,
      lastError: setting.lastError
    }
    memoryStore.saveToStore(STORES.INTEGRATION_SETTINGS, memoryStore.integrationSettings, record)
    return record
  }
}

export const integrationLogsStorage = {
  getAll: () => memoryStore.integrationLogs.filter(l => !l.deleted),
  add: (log: { provider: string; action: string; status: string; duration: number; timestamp: string; device?: string; retryCount?: number; errorMessage?: string }) => {
    const id = generateId()
    const record = {
      ...log,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
      syncStatus: 'pending',
      retryCount: log.retryCount || 0,
      lastRetry: undefined,
      lastError: log.errorMessage
    }
    memoryStore.saveToStore(STORES.INTEGRATION_LOGS, memoryStore.integrationLogs, record)
    return record
  }
}

export const notebookStorage = {
  getAll: () => memoryStore.notebooks.filter(n => !n.deleted),
  getById: (id: string) => memoryStore.notebooks.find(n => n.id === id && !n.deleted),
  add: (notebook: { name: string; url: string; description?: string; category?: string; tags?: string[]; lastOpened?: string; lastModified?: string; estimatedReadingTime?: string; isFavourite?: boolean; isArchived?: boolean; isPinned?: boolean; collections?: string[] }) => {
    const id = generateId()
    const now = new Date().toISOString()
    const record = {
      ...notebook,
      id,
      createdAt: now,
      updatedAt: now,
      dateAdded: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
      syncStatus: 'pending',
      retryCount: 0,
      lastRetry: undefined,
      lastError: undefined
    }
    memoryStore.saveToStore(STORES.NOTEBOOKS, memoryStore.notebooks, record)
    return record
  },
  update: (id: string, partial: Partial<any>) => {
    const current = memoryStore.notebooks.find(n => n.id === id)
    if (!current) return null
    const record = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
      pendingSync: true,
      syncVersion: (current.syncVersion || 0) + 1,
      syncStatus: 'pending'
    }
    memoryStore.saveToStore(STORES.NOTEBOOKS, memoryStore.notebooks, record)
    return record
  },
  remove: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.NOTEBOOKS, memoryStore.notebooks, id)
  }
}

export const healthRecordStorage = {
  getAll: () => memoryStore.healthRecords.filter(r => !r.deleted),
  getToday: () => {
    const today = new Date().toDateString()
    return memoryStore.healthRecords.filter(r => !r.deleted && new Date(r.timestamp).toDateString() === today)
  },
  add: (record: { type: string; value: number; unit: string; source: string; timestamp: string }) => {
    const id = generateId()
    const now = new Date().toISOString()
    const dataRecord = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: 1,
      syncStatus: 'pending',
      retryCount: 0,
      lastRetry: undefined,
      lastError: undefined
    }
    memoryStore.saveToStore(STORES.HEALTH_RECORDS, memoryStore.healthRecords, dataRecord)
    return dataRecord
  },
  remove: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.HEALTH_RECORDS, memoryStore.healthRecords, id)
  }
}

// ─── Attachments, Conflicts, & Notifications ───────────────────────────────

export const attachmentStorage = {
  getAll: () => memoryStore.attachments.filter(a => !a.deleted),
  getById: (id: string) => memoryStore.attachments.find(a => a.id === id && !a.deleted),
  getByParent: (parentType: string, parentId: string) => 
    memoryStore.attachments.filter(a => a.parentType === parentType && a.parentId === parentId && !a.deleted),
  getByChecksum: (checksum: string) =>
    memoryStore.attachments.find(a => a.checksum === checksum && !a.deleted),
  save: (attachment: any) => {
    const existing = memoryStore.attachments.find(a => a.id === attachment.id)
    const now = new Date().toISOString()
    const record = {
      ...existing,
      ...attachment,
      id: attachment.id || existing?.id || generateId(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      deleted: false,
      pendingSync: true,
      syncVersion: (existing?.syncVersion || 0) + 1,
      syncStatus: attachment.syncStatus || 'pending'
    }
    memoryStore.saveToStore(STORES.ATTACHMENTS, memoryStore.attachments, record)
    return record
  },
  remove: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.ATTACHMENTS, memoryStore.attachments, id)
  }
}

export const conflictStorage = {
  getAll: () => memoryStore.conflicts,
  getById: (id: string) => memoryStore.conflicts.find(c => c.id === id),
  save: (conflict: { id: string; table: string; localData: any; serverData: any; resolved: boolean }) => {
    const existing = memoryStore.conflicts.find(c => c.id === conflict.id)
    const record = {
      ...existing,
      ...conflict
    }
    memoryStore.saveToStore(STORES.CONFLICT_QUEUE, memoryStore.conflicts, record)
    return record
  },
  remove: (id: string) => {
    memoryStore.removeFromStore(STORES.CONFLICT_QUEUE, memoryStore.conflicts, id)
  }
}

export const notificationScheduleStorage = {
  getAll: () => memoryStore.notificationSchedules,
  save: (schedule: { id: string; title: string; body: string; scheduledAt: string; category: string; repeats?: string; enabled: boolean }) => {
    const existing = memoryStore.notificationSchedules.find(s => s.id === schedule.id)
    const record = {
      ...existing,
      ...schedule
    }
    memoryStore.saveToStore(STORES.NOTIFICATION_SCHEDULES, memoryStore.notificationSchedules, record)
    return record
  },
  remove: (id: string) => {
    memoryStore.removeFromStore(STORES.NOTIFICATION_SCHEDULES, memoryStore.notificationSchedules, id)
  }
}

export const notificationHistoryStorage = {
  getAll: () => memoryStore.notificationHistory,
  add: (log: { title: string; body: string; category: string; firedAt: string; status: 'delivered' | 'clicked' | 'snoozed' | 'dismissed' }) => {
    const id = generateId()
    const record = {
      id,
      ...log
    }
    memoryStore.saveToStore(STORES.NOTIFICATION_HISTORY, memoryStore.notificationHistory, record)
    return record
  },
  clear: () => {
    idb.clearStore(STORES.NOTIFICATION_HISTORY).then(() => {
      memoryStore.notificationHistory = []
    })
  }
}


