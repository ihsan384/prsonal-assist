import { motion } from 'framer-motion'
import { Sparkles, Clock } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function AnalyticsPage() {
  const placeholders = [
    { title: 'Productivity Score', description: 'AI-powered daily productivity analysis across all modules', icon: '📊', color: '#7c6aff', status: 'Phase 2' },
    { title: 'Study Analytics', description: 'Deep dive into study patterns, peak performance hours, and subject correlations', icon: '🧠', color: '#06b6d4', status: 'Phase 2' },
    { title: 'Health Insights', description: 'Correlation analysis between sleep, nutrition, and workout performance', icon: '💪', color: '#10b981', status: 'Phase 2' },
    { title: 'Habit Patterns', description: 'Behavioral pattern detection and streak prediction models', icon: '🔄', color: '#f59e0b', status: 'Phase 2' },
    { title: 'Goal Forecasting', description: 'AI-predicted goal completion timelines based on your progress velocity', icon: '🎯', color: '#f97316', status: 'Phase 2' },
    { title: 'Financial Trends', description: 'Spending pattern analysis and budget optimization recommendations', icon: '💰', color: '#10b981', status: 'Phase 2' },
  ]

  return (
    <PageWrapper>
      {/* Coming Soon Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#7c6aff]/10 to-[#a855f7]/10 border border-[rgba(124,106,255,0.2)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(124,106,255,0.2)] flex items-center justify-center">
              <Sparkles size={20} className="text-[#7c6aff]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#f0f0f5]">Analytics & AI Insights</p>
              <Badge variant="violet" size="sm" dot>Coming in Phase 2</Badge>
            </div>
          </div>
          <p className="text-xs text-[#8888a0] leading-relaxed">
            Phase 2 will bring powerful AI-driven analytics across all your life modules. 
            Pattern detection, goal forecasting, health correlations, and personalized insights 
            — all powered by your local data.
          </p>
        </div>
      </motion.div>

      {/* Teaser Cards */}
      <SectionHeader title="Planned Features" subtitle="Phase 2 roadmap" />
      <div className="flex flex-col gap-3">
        {placeholders.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="relative overflow-hidden">
              {/* Blur overlay to indicate locked */}
              <div className="absolute inset-0 backdrop-blur-[2px] bg-[#0a0a0f]/40 rounded-2xl z-10 flex items-center justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(124,106,255,0.15)] border border-[rgba(124,106,255,0.3)]">
                  <Clock size={12} className="text-[#7c6aff]" />
                  <span className="text-xs font-semibold text-[#7c6aff]">{item.status}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#f0f0f5]">{item.title}</p>
                  <p className="text-xs text-[#55556a] mt-0.5">{item.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Current Basic Stats */}
      <div className="mt-6">
        <SectionHeader title="Available Now" subtitle="Basic overview stats" />
        <Card>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Study Hours', value: '127h', icon: '📚', color: '#7c6aff' },
              { label: 'Tasks Completed', value: '284', icon: '✅', color: '#10b981' },
              { label: 'Habit Check-ins', value: '168', icon: '🔄', color: '#f59e0b' },
              { label: 'Workouts Done', value: '28', icon: '💪', color: '#f97316' },
              { label: 'Books Read', value: '3', icon: '📖', color: '#06b6d4' },
              { label: 'Active Streak', value: '14d', icon: '🔥', color: '#f43f5e' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-lg">{stat.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[#f0f0f5]">{stat.value}</p>
                  <p className="text-[10px] text-[#55556a]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
