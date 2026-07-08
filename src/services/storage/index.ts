import { storage } from './storageService'
import { generateId } from '@/utils/format'
import { getTodayString } from '@/utils/date'
import type { Task, Habit, StudySession, Goal, Workout, Meal, SleepLog, KnowledgeItem, Transaction, Budget, AppSettings, UserProfile, NutritionGoal } from '@/types'

// ─── Keys ──────────────────────────────────────────────────────────────────

const KEYS = {
  TASKS: 'tasks',
  HABITS: 'habits',
  STUDY_SESSIONS: 'study_sessions',
  SUBJECTS: 'subjects',
  GOALS: 'goals',
  WORKOUTS: 'workouts',
  MEALS: 'meals',
  SLEEP_LOGS: 'sleep_logs',
  KNOWLEDGE: 'knowledge',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  NUTRITION_GOALS: 'nutrition_goals',
  WATER_LOGS: 'water_logs',
} as const

// ─── Tasks ─────────────────────────────────────────────────────────────────

export const taskStorage = {
  getAll: () => storage.getList<Task>(KEYS.TASKS),
  getById: (id: string) => storage.findInList<Task>(KEYS.TASKS, id),
  add: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<Task>(KEYS.TASKS, { ...task, id: generateId(), createdAt: now, updatedAt: now })
  },
  update: (id: string, partial: Partial<Task>) => storage.updateInList<Task>(KEYS.TASKS, id, partial),
  remove: (id: string) => storage.removeFromList<Task>(KEYS.TASKS, id),
  getByStatus: (status: Task['status']) => storage.getList<Task>(KEYS.TASKS).filter(t => t.status === status),
  getToday: () => {
    const today = getTodayString()
    return storage.getList<Task>(KEYS.TASKS).filter(t => t.dueDate === today || isToday(t.createdAt))
  },
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

// ─── Habits ────────────────────────────────────────────────────────────────

export const habitStorage = {
  getAll: () => storage.getList<Habit>(KEYS.HABITS),
  getById: (id: string) => storage.findInList<Habit>(KEYS.HABITS, id),
  add: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<Habit>(KEYS.HABITS, { ...habit, id: generateId(), createdAt: now, updatedAt: now })
  },
  update: (id: string, partial: Partial<Habit>) => storage.updateInList<Habit>(KEYS.HABITS, id, partial),
  remove: (id: string) => storage.removeFromList<Habit>(KEYS.HABITS, id),
  getActive: () => storage.getList<Habit>(KEYS.HABITS).filter(h => h.isActive),
}

// ─── Study ─────────────────────────────────────────────────────────────────

export const studyStorage = {
  getSessions: () => storage.getList<StudySession>(KEYS.STUDY_SESSIONS),
  addSession: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<StudySession>(KEYS.STUDY_SESSIONS, { ...session, id: generateId(), createdAt: now, updatedAt: now })
  },
  updateSession: (id: string, partial: Partial<StudySession>) => storage.updateInList<StudySession>(KEYS.STUDY_SESSIONS, id, partial),
  removeSession: (id: string) => storage.removeFromList<StudySession>(KEYS.STUDY_SESSIONS, id),
  getTodayMinutes: () => {
    const today = getTodayString()
    return storage.getList<StudySession>(KEYS.STUDY_SESSIONS)
      .filter(s => s.startTime.startsWith(today))
      .reduce((sum, s) => sum + s.durationMinutes, 0)
  },
}

// ─── Goals ─────────────────────────────────────────────────────────────────

export const goalStorage = {
  getAll: () => storage.getList<Goal>(KEYS.GOALS),
  getById: (id: string) => storage.findInList<Goal>(KEYS.GOALS, id),
  add: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<Goal>(KEYS.GOALS, { ...goal, id: generateId(), createdAt: now, updatedAt: now })
  },
  update: (id: string, partial: Partial<Goal>) => storage.updateInList<Goal>(KEYS.GOALS, id, partial),
  remove: (id: string) => storage.removeFromList<Goal>(KEYS.GOALS, id),
  getActive: () => storage.getList<Goal>(KEYS.GOALS).filter(g => g.status === 'active'),
}

// ─── Fitness ───────────────────────────────────────────────────────────────

export const fitnessStorage = {
  getWorkouts: () => storage.getList<Workout>(KEYS.WORKOUTS),
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<Workout>(KEYS.WORKOUTS, { ...workout, id: generateId(), createdAt: now, updatedAt: now })
  },
  updateWorkout: (id: string, partial: Partial<Workout>) => storage.updateInList<Workout>(KEYS.WORKOUTS, id, partial),
  removeWorkout: (id: string) => storage.removeFromList<Workout>(KEYS.WORKOUTS, id),
  getTodayWorkout: () => {
    const today = getTodayString()
    return storage.getList<Workout>(KEYS.WORKOUTS).find(w => w.date === today)
  },
}

// ─── Nutrition ─────────────────────────────────────────────────────────────

export const nutritionStorage = {
  getMeals: () => storage.getList<Meal>(KEYS.MEALS),
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<Meal>(KEYS.MEALS, { ...meal, id: generateId(), createdAt: now, updatedAt: now })
  },
  updateMeal: (id: string, partial: Partial<Meal>) => storage.updateInList<Meal>(KEYS.MEALS, id, partial),
  removeMeal: (id: string) => storage.removeFromList<Meal>(KEYS.MEALS, id),
  getTodayMeals: () => {
    const today = getTodayString()
    return storage.getList<Meal>(KEYS.MEALS).filter(m => m.date === today)
  },
  getGoals: (): NutritionGoal => storage.getOrDefault<NutritionGoal>(KEYS.NUTRITION_GOALS, {
    calories: 2200, protein: 160, carbs: 250, fat: 65, water: 3000,
  }),
  setGoals: (goals: NutritionGoal) => storage.set(KEYS.NUTRITION_GOALS, goals),
  getWaterToday: (): number => {
    const today = getTodayString()
    const logs = storage.getOrDefault<Record<string, number>>(KEYS.WATER_LOGS, {})
    return logs[today] ?? 0
  },
  setWaterToday: (ml: number) => {
    const today = getTodayString()
    const logs = storage.getOrDefault<Record<string, number>>(KEYS.WATER_LOGS, {})
    storage.set(KEYS.WATER_LOGS, { ...logs, [today]: ml })
  },
}

// ─── Sleep ─────────────────────────────────────────────────────────────────

export const sleepStorage = {
  getLogs: () => storage.getList<SleepLog>(KEYS.SLEEP_LOGS),
  addLog: (log: Omit<SleepLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<SleepLog>(KEYS.SLEEP_LOGS, { ...log, id: generateId(), createdAt: now, updatedAt: now })
  },
  updateLog: (id: string, partial: Partial<SleepLog>) => storage.updateInList<SleepLog>(KEYS.SLEEP_LOGS, id, partial),
  removeLog: (id: string) => storage.removeFromList<SleepLog>(KEYS.SLEEP_LOGS, id),
  getLastNight: () => {
    const today = getTodayString()
    return storage.getList<SleepLog>(KEYS.SLEEP_LOGS).find(s => s.date === today)
  },
}

// ─── Knowledge ─────────────────────────────────────────────────────────────

export const knowledgeStorage = {
  getAll: () => storage.getList<KnowledgeItem>(KEYS.KNOWLEDGE),
  getById: (id: string) => storage.findInList<KnowledgeItem>(KEYS.KNOWLEDGE, id),
  add: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<KnowledgeItem>(KEYS.KNOWLEDGE, { ...item, id: generateId(), createdAt: now, updatedAt: now })
  },
  update: (id: string, partial: Partial<KnowledgeItem>) => storage.updateInList<KnowledgeItem>(KEYS.KNOWLEDGE, id, partial),
  remove: (id: string) => storage.removeFromList<KnowledgeItem>(KEYS.KNOWLEDGE, id),
}

// ─── Finance ───────────────────────────────────────────────────────────────

export const financeStorage = {
  getTransactions: () => storage.getList<Transaction>(KEYS.TRANSACTIONS),
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    return storage.addToList<Transaction>(KEYS.TRANSACTIONS, { ...tx, id: generateId(), createdAt: now, updatedAt: now })
  },
  updateTransaction: (id: string, partial: Partial<Transaction>) => storage.updateInList<Transaction>(KEYS.TRANSACTIONS, id, partial),
  removeTransaction: (id: string) => storage.removeFromList<Transaction>(KEYS.TRANSACTIONS, id),
  getBudgets: () => storage.getOrDefault<Budget[]>(KEYS.BUDGETS, []),
  setBudgets: (budgets: Budget[]) => storage.set(KEYS.BUDGETS, budgets),
}

// ─── Settings ──────────────────────────────────────────────────────────────

export const settingsStorage = {
  get: (): AppSettings => storage.getOrDefault<AppSettings>(KEYS.SETTINGS, {
    theme: 'dark',
    accentColor: '#7c6aff',
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
  }),
  set: (settings: Partial<AppSettings>) => {
    const current = settingsStorage.get()
    storage.set(KEYS.SETTINGS, { ...current, ...settings })
  },
}

// ─── Profile ───────────────────────────────────────────────────────────────

export const profileStorage = {
  get: (): UserProfile => storage.getOrDefault<UserProfile>(KEYS.PROFILE, {
    name: 'Ihsan',
    timezone: 'Asia/Kolkata',
    theme: 'dark',
    accentColor: '#7c6aff',
    joinedAt: new Date().toISOString(),
  }),
  set: (profile: Partial<UserProfile>) => {
    const current = profileStorage.get()
    storage.set(KEYS.PROFILE, { ...current, ...profile })
  },
}
