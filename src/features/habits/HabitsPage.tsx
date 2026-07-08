import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Flame, Plus, Trophy } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FAB } from '@/components/ui/FAB'

interface Habit {
  id: string
  name: string
  icon: string
  color: string
  streak: number
  completedToday: boolean
  weekDays: boolean[]
  category: string
}

const HABITS: Habit[] = [
  { id: '1', name: 'Morning Workout', icon: '🏋️', color: '#f59e0b', streak: 14, completedToday: true, weekDays: [true, true, true, true, true, false, false], category: 'Health' },
  { id: '2', name: 'Read 30 pages', icon: '📚', color: '#7c6aff', streak: 7, completedToday: true, weekDays: [true, true, true, true, false, true, false], category: 'Learning' },
  { id: '3', name: 'Meditate 10min', icon: '🧘', color: '#10b981', streak: 21, completedToday: false, weekDays: [true, true, true, false, true, false, false], category: 'Mindfulness' },
  { id: '4', name: 'Drink 3L Water', icon: '💧', color: '#06b6d4', streak: 5, completedToday: false, weekDays: [true, true, false, true, true, false, false], category: 'Health' },
  { id: '5', name: 'Journal Writing', icon: '✍️', color: '#f97316', streak: 3, completedToday: false, weekDays: [false, true, false, true, false, true, false], category: 'Personal' },
  { id: '6', name: 'No Social Media before 10am', icon: '📵', color: '#8b5cf6', streak: 9, completedToday: true, weekDays: [true, true, true, true, true, false, false], category: 'Digital' },
]

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const today = new Date().getDay()

export default function HabitsPage() {
  const [habits, setHabits] = useState(HABITS)

  const completedCount = habits.filter(h => h.completedToday).length
  const completionRate = Math.round((completedCount / habits.length) * 100)

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? h.streak - 1 : h.streak + 1 } : h))
  }

  return (
    <PageWrapper>
      {/* Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#f0f0f5]">{completedCount} / {habits.length} completed</p>
              <p className="text-xs text-[#55556a]">Monday, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-[#f97316]" />
              <div className="text-right">
                <p className="text-lg font-bold text-[#f0f0f5]">21d</p>
                <p className="text-[10px] text-[#55556a]">best streak</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            {habits.map(h => (
              <div key={h.id} className="flex-1 h-2 rounded-full" style={{ backgroundColor: h.completedToday ? h.color : 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
          <p className="text-xs text-[#55556a]">{completionRate}% completion rate today</p>
        </Card>
      </motion.div>

      {/* Week View */}
      <div className="mb-5">
        <SectionHeader title="This Week" />
        <Card>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-[#55556a]">{day}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium transition-all ${
                  i === today - 1 ? 'bg-[#7c6aff] text-white' :
                  i < today - 1 ? 'bg-[rgba(124,106,255,0.2)] text-[#7c6aff]' :
                  'bg-[rgba(255,255,255,0.04)] text-[#55556a]'
                }`}>
                  {i < today - 1 ? '✓' : i === today - 1 ? '→' : '·'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Habits List */}
      <div className="mb-5">
        <SectionHeader title="My Habits" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />}>Add</Button>
        } />
        <div className="flex flex-col gap-3">
          {habits.map((habit, i) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card hover>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="flex-shrink-0"
                  >
                    {habit.completedToday
                      ? <CheckCircle2 size={26} style={{ color: habit.color }} />
                      : <Circle size={26} className="text-[rgba(255,255,255,0.12)]" />
                    }
                  </button>

                  <span className="text-xl">{habit.icon}</span>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${habit.completedToday ? 'text-[#f0f0f5]' : 'text-[#8888a0]'}`}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="default" size="sm">{habit.category}</Badge>
                      <span className="flex items-center gap-0.5 text-[10px] text-[#55556a]">
                        <Flame size={10} className="text-[#f97316]" />
                        {habit.streak}d streak
                      </span>
                    </div>
                  </div>

                  {habit.streak >= 21 && <Trophy size={16} className="text-[#f59e0b] flex-shrink-0" />}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Streaks Hall */}
      <div className="mb-5">
        <SectionHeader title="Top Streaks" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {habits.sort((a, b) => b.streak - a.streak).slice(0, 4).map(h => (
            <div
              key={h.id}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.06)] min-w-[90px]"
            >
              <span className="text-2xl">{h.icon}</span>
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: h.color }}>{h.streak}</p>
                <p className="text-[9px] text-[#55556a] leading-tight">{h.name}</p>
              </div>
              <Flame size={12} className="text-[#f97316]" />
            </div>
          ))}
        </div>
      </div>

      <FAB onClick={() => {}} />
    </PageWrapper>
  )
}
