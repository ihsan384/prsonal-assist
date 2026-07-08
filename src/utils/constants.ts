/**
 * App-wide constants
 */

export const APP_NAME = 'Ihsan OS'
export const USER_NAME = 'Ihsan'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', path: '/', icon: 'LayoutDashboard' },
  { id: 'study', label: 'Study', path: '/study', icon: 'BookOpen' },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: 'BarChart2' },
  { id: 'profile', label: 'Profile', path: '/profile', icon: 'User' },
] as const

export const SIDEBAR_ITEMS = [
  { group: 'Main', items: [
    { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { id: 'study', label: 'Study', path: '/study', icon: 'BookOpen' },
    { id: 'tasks', label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
    { id: 'habits', label: 'Habits', path: '/habits', icon: 'Repeat' },
  ]},
  { group: 'Health', items: [
    { id: 'fitness', label: 'Fitness', path: '/fitness', icon: 'Dumbbell' },
    { id: 'nutrition', label: 'Nutrition', path: '/nutrition', icon: 'UtensilsCrossed' },
    { id: 'sleep', label: 'Sleep', path: '/sleep', icon: 'Moon' },
  ]},
  { group: 'Life', items: [
    { id: 'goals', label: 'Goals', path: '/goals', icon: 'Target' },
    { id: 'knowledge', label: 'Knowledge', path: '/knowledge', icon: 'Brain' },
    { id: 'finance', label: 'Finance', path: '/finance', icon: 'Wallet' },
  ]},
  { group: 'System', items: [
    { id: 'analytics', label: 'Analytics', path: '/analytics', icon: 'BarChart2' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: 'Settings' },
    { id: 'profile', label: 'Profile', path: '/profile', icon: 'User' },
  ]},
] as const

export const COLORS = {
  accent: '#7c6aff',
  violet: '#8b5cf6',
  indigo: '#6366f1',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  orange: '#f97316',
  rose: '#f43f5e',
  pink: '#ec4899',
} as const

export const STORAGE_KEYS = {
  TASKS: 'ihsanos_tasks',
  HABITS: 'ihsanos_habits',
  STUDY_SESSIONS: 'ihsanos_study_sessions',
  GOALS: 'ihsanos_goals',
  WORKOUTS: 'ihsanos_workouts',
  MEALS: 'ihsanos_meals',
  SLEEP_LOGS: 'ihsanos_sleep_logs',
  KNOWLEDGE: 'ihsanos_knowledge',
  FINANCE: 'ihsanos_finance',
  SETTINGS: 'ihsanos_settings',
  PROFILE: 'ihsanos_profile',
} as const

export const ANIMATION_VARIANTS = {
  PAGE: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  CARD: {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.98 },
  },
  FADE: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
  },
  SLIDE_LEFT: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
  },
} as const
