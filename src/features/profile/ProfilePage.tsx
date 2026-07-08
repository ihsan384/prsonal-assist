import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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

const achievements = [
  { id: '1', title: '14-Day Streak', description: 'Habits logged for 14 consecutive days', icon: Flame, earned: true, color: '#f97316' },
  { id: '2', title: 'Study Champion', description: 'Studied 100+ hours this month', icon: BookOpen, earned: true, color: '#7c6aff' },
  { id: '3', title: 'Fitness Warrior', description: 'Completed 20+ workouts', icon: Dumbbell, earned: true, color: '#f59e0b' },
  { id: '4', title: 'Saver Pro', description: 'Saved 30%+ of income', icon: Wallet, earned: false, color: '#10b981' },
  { id: '5', title: 'Deep Reader', description: 'Read 10 books', icon: Library, earned: false, color: '#06b6d4' },
  { id: '6', title: 'Goal Crusher', description: 'Complete 5 goals', icon: Target, earned: false, color: '#8b5cf6' },
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                I
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10b981] border-2 border-[var(--bg)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">Ihsan</h2>
              <p className="text-sm text-[var(--text-3)]">Personal OS · v1.0</p>
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
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-[var(--shadow-sm)]"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={16} />
              </div>
              <div>
                <p className="text-base font-bold text-[var(--text)]">{stat.value}{stat.unit}</p>
                <p className="text-[10px] text-[var(--text-3)]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Status */}
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
        <SectionHeader title="Achievements" subtitle={`${achievements.filter(a => a.earned).length} / ${achievements.length} earned`} />
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((achievement, i) => {
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
