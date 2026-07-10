import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Clock, BarChart4, Brain, Activity, RefreshCw, Target, Wallet,
  BookOpen, CheckCircle2, Dumbbell, Book, Flame, AlertCircle
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { taskStorage, habitStorage, fitnessStorage, knowledgeStorage } from '@/services/storage'

export default function AnalyticsPage() {
  const [studySessions, setStudySessions] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [habits, setHabits] = useState<any[]>([])
  const [workouts, setWorkouts] = useState<any[]>([])
  const [library, setLibrary] = useState<any[]>([])

  useEffect(() => {
    setStudySessions(studyERPStorage.getSessions())
    setTasks(taskStorage.getAll())
    setHabits(habitStorage.getAll())
    setWorkouts(fitnessStorage.getWorkouts())
    setLibrary(knowledgeStorage.getAll())
  }, [])

  // Calculations
  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
  const totalStudyHoursStr = `${(totalStudyMinutes / 60).toFixed(0)}h`

  const tasksCompletedCount = tasks.filter(t => t.status === 'done').length

  const habitCheckins = habits.reduce((sum, h) => sum + (h.streak || 0), 0)
  const activeStreakStr = habits.length > 0 
    ? `${Math.max(...habits.map(h => h.streak || 0), 0)}d` 
    : '0d'

  const workoutsCount = workouts.length
  
  const booksReadCount = library.filter(i => i.type === 'book' && i.status === 'completed').length

  const placeholders = [
    { title: 'Productivity Score', description: 'AI-powered daily productivity analysis across all modules', icon: BarChart4, color: 'var(--accent)', status: 'Phase 2' },
    { title: 'Study Analytics', description: 'Deep dive into study patterns, peak performance hours, and subject correlations', icon: Brain, color: '#0284c7', status: 'Phase 2' },
    { title: 'Health Insights', description: 'Correlation analysis between sleep, nutrition, and workout performance', icon: Activity, color: '#16a34a', status: 'Phase 2' },
    { title: 'Habit Patterns', description: 'Behavioral pattern detection and streak prediction models', icon: RefreshCw, color: '#d97706', status: 'Phase 2' },
    { title: 'Goal Forecasting', description: 'AI-predicted goal completion timelines based on your progress velocity', icon: Target, color: '#ea580c', status: 'Phase 2' },
    { title: 'Financial Trends', description: 'Spending pattern analysis and budget optimization recommendations', icon: Wallet, color: '#16a34a', status: 'Phase 2' },
  ]

  const statsAvailable = studySessions.length > 0 || tasks.length > 0 || habits.length > 0 || workouts.length > 0 || library.length > 0

  return (
    <PageWrapper>
      {/* Coming Soon Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="rounded-2xl p-5 bg-[var(--accent-bg)] border border-[var(--accent-border)] text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[var(--accent-border)] flex items-center justify-center">
              <Sparkles size={20} className="text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text)]">Analytics & AI Insights</p>
              <Badge variant="violet" size="sm" dot>Coming in Phase 2</Badge>
            </div>
          </div>
          <p className="text-xs text-[var(--text-3)] leading-relaxed">
            Phase 2 will bring powerful AI-driven analytics across all your life modules. 
            Pattern detection, goal forecasting, health correlations, and personalized insights 
            — all powered by your local data.
          </p>
        </div>
      </motion.div>

      {/* Teaser Cards */}
      <SectionHeader title="Planned Features" subtitle="Phase 2 roadmap" />
      <div className="flex flex-col gap-3">
        {placeholders.map((item, i) => {
          const TeaserIcon = item.icon
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="relative overflow-hidden">
                {/* Blur overlay to indicate locked */}
                <div className="absolute inset-0 backdrop-blur-[1px] bg-white/60 rounded-2xl z-10 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[var(--border)] shadow-sm">
                    <Clock size={12} className="text-[var(--text-3)]" />
                    <span className="text-xs font-semibold text-[var(--text-2)]">{item.status}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-subtle)] border border-[var(--border)]" style={{ color: item.color }}>
                    <TeaserIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                    <p className="text-xs text-[var(--text-3)] mt-0.5">{item.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Current Basic Stats */}
      <div className="mt-6">
        <SectionHeader title="Available Now" subtitle="Basic overview stats" />
        <Card>
          {!statsAvailable ? (
            <div className="py-8 text-center text-xs text-[var(--text-3)] flex items-center justify-center gap-1.5">
              <AlertCircle size={14} />
              No data available to calculate analytics. Start using the app to see metrics here.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-left">
              {[
                { label: 'Total Study Hours', value: totalStudyHoursStr, icon: BookOpen, color: 'var(--accent)' },
                { label: 'Tasks Completed', value: tasksCompletedCount.toString(), icon: CheckCircle2, color: '#16a34a' },
                { label: 'Habit Check-ins', value: habitCheckins.toString(), icon: RefreshCw, color: '#d97706' },
                { label: 'Workouts Done', value: workoutsCount.toString(), icon: Dumbbell, color: '#ea580c' },
                { label: 'Books Read', value: booksReadCount.toString(), icon: Book, color: '#0284c7' },
                { label: 'Active Streak', value: activeStreakStr, icon: Flame, color: '#dc2626' },
              ].map(stat => {
                const StatIcon = stat.icon
                return (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center" style={{ color: stat.color }}>
                      <StatIcon size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text)]">{stat.value}</p>
                      <p className="text-[10px] text-[var(--text-3)] font-medium">{stat.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}
