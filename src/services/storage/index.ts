import { generateId } from '@/utils/format'
import { getTodayString } from '@/utils/date'
import { memoryStore } from './MemoryStore'
import { STORES } from './IndexedDB'
import type { Task, Habit, Goal, Workout, Meal, SleepLog, KnowledgeItem, Transaction, Budget, AppSettings, UserProfile, NutritionGoal } from '@/types'
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
