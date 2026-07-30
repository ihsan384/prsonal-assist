import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame, BookOpen, Dumbbell, Target, ChevronRight, Star, Calendar,
  Wallet, Library, Settings, BarChart2
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { habitStorage, fitnessStorage, knowledgeStorage, financeStorage, goalStorage } from '@/services/storage'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, userFirstName, osName } = useAuth()
  const displayName = profile?.full_name || userFirstName
  const [daysActive, setDaysActive] = useState(1)

  // Database stats states
  const [studySessions, setStudySessions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])

  const [workouts, setWorkouts] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [habits, setHabits] = useState<any[]>([])
  const [library, setLibrary] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    // Dynamic Join Date initialization
    let joined = localStorage.getItem('ihsanos_joined_date')
    if (!joined) {
      joined = new Date().toISOString()
      localStorage.setItem('ihsanos_joined_date', joined)
    }
    const days = Math.max(1, Math.ceil((Date.now() - new Date(joined).getTime()) / (1000 * 60 * 60 * 24)))
    setDaysActive(days)

    // Load data
    setStudySessions(studyERPStorage.getSessions())
    setSubjects(studyERPStorage.getSubjects())

    setWorkouts(fitnessStorage.getWorkouts())
    setGoals(goalStorage.getAll())
    setHabits(habitStorage.getAll())
    setLibrary(knowledgeStorage.getAll())
    setTransactions(financeStorage.getTransactions())
  }, [])

  // Calculations
  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
  const totalStudyHours = Math.round(totalStudyMinutes / 60)

  const workoutsCount = workouts.length
  const goalsCount = goals.length
  const completedGoalsCount = goals.filter(g => g.currentValue >= g.targetValue).length
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0), 0) : 0

  // Goals
  const subjectsCount = subjects.length || 1
  const syllabusProgress = Math.round(
    subjects.reduce((sum, s) => sum + (s.completionPercentage || 0), 0) / subjectsCount
  )

  const now = new Date()
  const currentDay = now.getDay()
  const distanceToMon = currentDay === 0 ? 6 : currentDay - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - distanceToMon)
  monday.setHours(0, 0, 0, 0)
  const workoutsThisWeek = workouts.filter(w => {
    try {
      return new Date(w.date).getTime() >= monday.getTime()
    } catch {
      return false
    }
  }).length
  const fitnessGoalProgress = Math.min(100, Math.round((workoutsThisWeek / 5) * 100))

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  const habitsCompletedToday = habits.filter(h => h.completedToday).length
  const habitConsistency = habits.length > 0 ? Math.round((habitsCompletedToday / habits.length) * 100) : 0

  const completedBooksCount = library.filter(i => i.type === 'book' && i.status === 'completed').length

  // Achievements rules
  const achievementList = [
    { id: '1', title: '3-Day Streak', description: 'Maintain a habit streak of 3+ days', icon: Flame, earned: bestStreak >= 3, color: '#f97316' },
    { id: '2', title: 'Study Champion', description: 'Log 5+ hours of total study focus', icon: BookOpen, earned: totalStudyHours >= 5, color: '#7c6aff' },
    { id: '3', title: 'Fitness Warrior', description: 'Record 5+ workouts in the gym log', icon: Dumbbell, earned: workoutsCount >= 5, color: '#f59e0b' },
    { id: '4', title: 'Saver Pro', description: 'Achieve a savings rate of 30%+', icon: Wallet, earned: savingsRate >= 30, color: '#10b981' },
    { id: '5', title: 'Deep Reader', description: 'Complete at least 1 library book', icon: Library, earned: completedBooksCount >= 1, color: '#06b6d4' },
    { id: '6', title: 'Goal Crusher', description: 'Achieve your first completed goal', icon: Target, earned: completedGoalsCount >= 1, color: '#8b5cf6' },
  ]

  const yearInReview = [
    { label: 'Study Hours', value: totalStudyHours, unit: 'h', color: '#7c6aff', icon: BookOpen },
    { label: 'Workouts', value: workoutsCount, unit: '', color: '#f59e0b', icon: Dumbbell },
    { label: 'Goals Set', value: goalsCount, unit: '', color: '#10b981', icon: Target },
    { label: 'Best Streak', value: bestStreak, unit: 'd', color: '#f97316', icon: Flame },
  ]

  const earnedAchievements = achievementList.filter(a => a.earned).length

  return (
    <PageWrapper>
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10b981] border-2 border-[var(--bg)]" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-[var(--text)]">{displayName}</h2>
              <p className="text-sm text-[var(--text-3)]">{osName} · v1.3.0</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="violet" size="sm" dot>Active</Badge>
                <Badge variant="default" size="sm">
                  <Calendar size={10} className="mr-0.5" /> {daysActive} days active
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/settings')}>
              Edit Settings
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Year in Review */}
      <div className="mb-5">
        <SectionHeader title="Analytics In Review" />
        <div className="grid grid-cols-2 gap-3">
          {yearInReview.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-[var(--shadow-sm)]"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={16} />
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-[var(--text)]">{stat.value}{stat.unit}</p>
                <p className="text-[10px] text-[var(--text-3)]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-5">
        <SectionHeader title="Current Status Overview" />
        <Card>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Syllabus Progress', value: syllabusProgress, color: '#7c6aff' },
              { label: 'Fitness Goal (Workouts/Wk)', value: fitnessGoalProgress, color: '#f59e0b' },
              { label: 'Savings Rate Status', value: Math.max(0, savingsRate), color: '#10b981' },
              { label: 'Habit Consistency Today', value: habitConsistency, color: '#06b6d4' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5 text-left">
                  <span className="text-[var(--text-3)]">{item.label}</span>
                  <span style={{ color: item.color }} className="font-semibold">{item.value}%</span>
                </div>
                <ProgressBar value={item.value} color={item.color} height={4} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <div className="mb-5">
        <SectionHeader title="Achievements Unlocked" subtitle={`${earnedAchievements} / ${achievementList.length} earned`} />
        <div className="grid grid-cols-3 gap-2">
          {achievementList.map((achievement, i) => {
            const IconComp = achievement.icon
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                  achievement.earned
                    ? 'bg-[var(--bg)] border-[var(--border)] shadow-[var(--shadow-sm)]'
                    : 'bg-[var(--bg-subtle)] border-[var(--border)] opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-subtle)]" style={{ color: achievement.color }}>
                  <IconComp size={16} />
                </div>
                <p className="text-[9px] font-semibold text-[var(--text)] leading-tight">{achievement.title}</p>
                {achievement.earned && (
                  <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center">
                    <Star size={8} className="text-white" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-5">
        <SectionHeader title="Quick Links" />
        <Card>
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {[
              { label: 'Settings', path: '/settings', icon: Settings },
              { label: 'All Goals', path: '/goals', icon: Target },
              { label: 'Analytics', path: '/analytics', icon: BarChart2 },
              { label: 'Knowledge Library', path: '/knowledge', icon: Library },
            ].map(link => {
              const LinkIcon = link.icon
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="flex items-center gap-3 py-3 w-full hover:opacity-80 transition-opacity"
                >
                  <LinkIcon size={16} className="text-[var(--text-3)]" />
                  <span className="flex-1 text-sm text-[var(--text)] text-left">{link.label}</span>
                  <ChevronRight size={16} className="text-[var(--text-3)]" />
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}

