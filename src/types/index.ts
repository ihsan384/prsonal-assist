/**
 * All TypeScript type definitions for Ihsan OS
 */

// ─── Common ────────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'active' | 'inactive' | 'archived' | 'completed'

// ─── Profile ───────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string
  avatar?: string
  bio?: string
  timezone: string
  theme: 'dark' | 'light' | 'system'
  accentColor: string
  dateOfBirth?: string
  joinedAt: string
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskCategory = 'work' | 'study' | 'personal' | 'health' | 'finance' | 'other'

export interface Task extends BaseEntity {
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  category: TaskCategory
  dueDate?: string
  completedAt?: string
  tags: string[]
  subtasks: Subtask[]
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

// ─── Habits ────────────────────────────────────────────────────────────────

export type HabitFrequency = 'daily' | 'weekly' | 'monthly'

export interface Habit extends BaseEntity {
  name: string
  description?: string
  icon: string
  color: string
  frequency: HabitFrequency
  targetDays: number[]
  streak: number
  longestStreak: number
  completions: HabitCompletion[]
  isActive: boolean
}

export interface HabitCompletion {
  date: string
  completed: boolean
  note?: string
}

// ─── Study ─────────────────────────────────────────────────────────────────

export type StudySessionType = 'pomodoro' | 'deep_work' | 'review' | 'reading'

export interface StudySession extends BaseEntity {
  subject: string
  topic?: string
  type: StudySessionType
  durationMinutes: number
  startTime: string
  endTime?: string
  notes?: string
  rating?: 1 | 2 | 3 | 4 | 5
  tags: string[]
}

export interface Subject {
  id: string
  name: string
  color: string
  icon: string
  totalMinutes: number
  weeklyGoalMinutes: number
}

// ─── Fitness ───────────────────────────────────────────────────────────────

export type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'sports' | 'other'

export interface Workout extends BaseEntity {
  name: string
  type: WorkoutType
  durationMinutes: number
  date: string
  exercises: Exercise[]
  caloriesBurned?: number
  notes?: string
  rating?: 1 | 2 | 3 | 4 | 5
}

export interface Exercise {
  id: string
  name: string
  sets?: ExerciseSet[]
  durationMinutes?: number
  distanceKm?: number
  notes?: string
}

export interface ExerciseSet {
  reps?: number
  weight?: number
  durationSeconds?: number
  restSeconds?: number
}

// ─── Nutrition ─────────────────────────────────────────────────────────────

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout'

export interface Meal extends BaseEntity {
  name: string
  type: MealType
  date: string
  time: string
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  notes?: string
}

export interface FoodItem {
  id: string
  name: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface NutritionGoal {
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

// ─── Sleep ─────────────────────────────────────────────────────────────────

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent'

export interface SleepLog extends BaseEntity {
  date: string
  bedTime: string
  wakeTime: string
  durationHours: number
  quality: SleepQuality
  rating?: 1 | 2 | 3 | 4 | 5
  notes?: string
  factors: SleepFactor[]
}

export type SleepFactor = 'screen_before_bed' | 'caffeine' | 'stress' | 'exercise' | 'meditation' | 'alcohol' | 'late_meal'

// ─── Goals ─────────────────────────────────────────────────────────────────

export type GoalCategory = 'health' | 'finance' | 'career' | 'education' | 'personal' | 'relationships' | 'spiritual'
export type GoalTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'long_term'

export interface Goal extends BaseEntity {
  title: string
  description?: string
  category: GoalCategory
  timeframe: GoalTimeframe
  targetDate?: string
  currentValue: number
  targetValue: number
  unit: string
  status: Status
  milestones: Milestone[]
  color: string
}

export interface Milestone {
  id: string
  title: string
  targetValue: number
  completedAt?: string
}

// ─── Knowledge ─────────────────────────────────────────────────────────────

export type KnowledgeType = 'note' | 'book' | 'article' | 'video' | 'course' | 'podcast'
export type ReadStatus = 'want_to_read' | 'reading' | 'completed' | 'paused'

export interface KnowledgeItem extends BaseEntity {
  title: string
  type: KnowledgeType
  author?: string
  url?: string
  tags: string[]
  status: ReadStatus
  rating?: 1 | 2 | 3 | 4 | 5
  notes?: string
  progress?: number
  totalPages?: number
  currentPage?: number
}

// ─── Finance ───────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense'
export type TransactionCategory = 'food' | 'transport' | 'education' | 'health' | 'entertainment' | 'utilities' | 'savings' | 'investment' | 'shopping' | 'other'

export interface Transaction extends BaseEntity {
  title: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date: string
  notes?: string
  tags: string[]
}

export interface Budget {
  category: TransactionCategory
  monthlyLimit: number
  spent: number
  color: string
}

// ─── Settings ──────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'dark' | 'light' | 'system'
  accentColor: string
  notifications: boolean
  soundEnabled: boolean
  hapticEnabled: boolean
  compactMode: boolean
  language: string
  weekStartsOn: 0 | 1
  timeFormat: '12h' | '24h'
  studyTimerDefault: number
  waterGoal: number
  sleepGoal: number
  calorieGoal: number
}

// ─── Toast ─────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}
