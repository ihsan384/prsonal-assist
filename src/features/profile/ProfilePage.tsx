import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Flame, BookOpen, Dumbbell, Target, ChevronRight, Star, Calendar,
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressRing'

const achievements = [
  { id: '1', title: '14-Day Streak', description: 'Habits logged for 14 consecutive days', icon: '🔥', earned: true, color: '#f97316' },
  { id: '2', title: 'Study Champion', description: 'Studied 100+ hours this month', icon: '📚', earned: true, color: '#7c6aff' },
  { id: '3', title: 'Fitness Warrior', description: 'Completed 20+ workouts', icon: '💪', earned: true, color: '#f59e0b' },
  { id: '4', title: 'Saver Pro', description: 'Saved 30%+ of income', icon: '💰', earned: false, color: '#10b981' },
  { id: '5', title: 'Deep Reader', description: 'Read 10 books', icon: '🎓', earned: false, color: '#06b6d4' },
  { id: '6', title: 'Goal Crusher', description: 'Complete 5 goals', icon: '🎯', earned: false, color: '#8b5cf6' },
]

const yearInReview = [
  { label: 'Study Hours', value: 847, unit: 'h', color: '#7c6aff', icon: BookOpen },
  { label: 'Workouts', value: 143, unit: '', color: '#f59e0b', icon: Dumbbell },
  { label: 'Goals Set', value: 12, unit: '', color: '#10b981', icon: Target },
  { label: 'Best Streak', value: 21, unit: 'd', color: '#f97316', icon: Flame },
]

export default function ProfilePage() {
  const navigate = useNavigate()

  const joinDate = new Date(2026, 0, 1)
  const daysActive = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <PageWrapper>
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                I
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10b981] border-2 border-[#111118]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f0f0f5]">Ihsan</h2>
              <p className="text-sm text-[#55556a]">Personal OS · v1.0</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="violet" size="sm" dot>Active</Badge>
                <Badge variant="default" size="sm">
                  <Calendar size={10} className="mr-0.5" /> {daysActive} days
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/settings')}>
              Edit Profile
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Year in Review */}
      <div className="mb-5">
        <SectionHeader title="2026 In Review" />
        <div className="grid grid-cols-2 gap-3">
          {yearInReview.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.06)]"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={16} />
              </div>
              <div>
                <p className="text-base font-bold text-[#f0f0f5]">{stat.value}{stat.unit}</p>
                <p className="text-[10px] text-[#55556a]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Stats */}
      <div className="mb-5">
        <SectionHeader title="Current Status" />
        <Card>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Study Progress (Monthly)', value: 58, color: '#7c6aff' },
              { label: 'Fitness Goal', value: 40, color: '#f59e0b' },
              { label: 'Savings Goal', value: 72, color: '#10b981' },
              { label: 'Habit Consistency', value: 86, color: '#06b6d4' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#8888a0]">{item.label}</span>
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
        <SectionHeader title="Achievements" subtitle={`${achievements.filter(a => a.earned).length} / ${achievements.length} earned`} />
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                achievement.earned
                  ? 'bg-[#111118] border-[rgba(255,255,255,0.08)]'
                  : 'bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.04)] opacity-40'
              }`}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <p className="text-[9px] font-semibold text-[#f0f0f5] leading-tight">{achievement.title}</p>
              {achievement.earned && (
                <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center">
                  <Star size={8} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-5">
        <SectionHeader title="Quick Links" />
        <Card>
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.04)]">
            {[
              { label: 'Settings', path: '/settings', icon: '⚙️' },
              { label: 'All Goals', path: '/goals', icon: '🎯' },
              { label: 'Analytics', path: '/analytics', icon: '📊' },
              { label: 'Knowledge Library', path: '/knowledge', icon: '📚' },
            ].map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="flex items-center gap-3 py-3 w-full hover:opacity-80 transition-opacity"
              >
                <span className="text-lg">{link.icon}</span>
                <span className="flex-1 text-sm text-[#f0f0f5] text-left">{link.label}</span>
                <ChevronRight size={16} className="text-[#55556a]" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
