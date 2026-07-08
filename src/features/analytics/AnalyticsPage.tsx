import { motion } from 'framer-motion'
import {
  Sparkles, Clock, BarChart4, Brain, Activity, RefreshCw, Target, Wallet,
  BookOpen, CheckCircle2, Dumbbell, Book, Flame
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function AnalyticsPage() {
  const placeholders = [
    { title: 'Productivity Score', description: 'AI-powered daily productivity analysis across all modules', icon: BarChart4, color: 'var(--accent)', status: 'Phase 2' },
    { title: 'Study Analytics', description: 'Deep dive into study patterns, peak performance hours, and subject correlations', icon: Brain, color: '#0284c7', status: 'Phase 2' },
    { title: 'Health Insights', description: 'Correlation analysis between sleep, nutrition, and workout performance', icon: Activity, color: '#16a34a', status: 'Phase 2' },
    { title: 'Habit Patterns', description: 'Behavioral pattern detection and streak prediction models', icon: RefreshCw, color: '#d97706', status: 'Phase 2' },
    { title: 'Goal Forecasting', description: 'AI-predicted goal completion timelines based on your progress velocity', icon: Target, color: '#ea580c', status: 'Phase 2' },
    { title: 'Financial Trends', description: 'Spending pattern analysis and budget optimization recommendations', icon: Wallet, color: '#16a34a', status: 'Phase 2' },
  ]

  return (
    <PageWrapper>
      {/* Coming Soon Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="rounded-2xl p-5 bg-[var(--accent-bg)] border border-[var(--accent-border)]">
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
                <div className="flex items-start gap-3">
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
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Study Hours', value: '127h', icon: BookOpen, color: 'var(--accent)' },
              { label: 'Tasks Completed', value: '284', icon: CheckCircle2, color: '#16a34a' },
              { label: 'Habit Check-ins', value: '168', icon: RefreshCw, color: '#d97706' },
              { label: 'Workouts Done', value: '28', icon: Dumbbell, color: '#ea580c' },
              { label: 'Books Read', value: '3', icon: Book, color: '#0284c7' },
              { label: 'Active Streak', value: '14d', icon: Flame, color: '#dc2626' },
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
        </Card>
      </div>
    </PageWrapper>
  )
}
