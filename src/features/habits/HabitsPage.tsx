import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Circle, Flame, Plus, Trophy,
  Dumbbell, Book, Activity, Droplet, PenTool, Smartphone,
  Brain, Coffee, Sparkles, Smile
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'

const HABIT_ICONS: Record<string, React.ComponentType<any>> = {
  dumbbell: Dumbbell,
  book: Book,
  activity: Activity,
  droplet: Droplet,
  pen: PenTool,
  smartphone: Smartphone,
  brain: Brain,
  coffee: Coffee,
  sparkles: Sparkles,
  smile: Smile,
}

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

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Morning Workout', icon: 'dumbbell', color: '#d97706', streak: 14, completedToday: true, weekDays: [true, true, true, true, true, false, false], category: 'Health' },
  { id: '2', name: 'Read 30 pages', icon: 'book', color: 'var(--accent)', streak: 7, completedToday: true, weekDays: [true, true, true, true, false, true, false], category: 'Learning' },
  { id: '3', name: 'Meditate 10min', icon: 'brain', color: '#16a34a', streak: 21, completedToday: false, weekDays: [true, true, true, false, true, false, false], category: 'Mindfulness' },
  { id: '4', name: 'Drink 3L Water', icon: 'droplet', color: '#2563eb', streak: 5, completedToday: false, weekDays: [true, true, false, true, true, false, false], category: 'Health' },
  { id: '5', name: 'Journal Writing', icon: 'pen', color: '#ea580c', streak: 3, completedToday: false, weekDays: [false, true, false, true, false, true, false], category: 'Personal' },
  { id: '6', name: 'No Social Media before 10am', icon: 'smartphone', color: '#7c3aed', streak: 9, completedToday: true, weekDays: [true, true, true, true, true, false, false], category: 'Digital' },
]

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const today = new Date().getDay()

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('ihsanos_habits')
    return saved ? JSON.parse(saved) : DEFAULT_HABITS
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('Health')
  const [newIcon, setNewIcon] = useState('activity')
  const [newColor, setNewColor] = useState('var(--accent)')

  const completedCount = habits.filter(h => h.completedToday).length
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0

  const persistHabits = (updated: Habit[]) => {
    setHabits(updated)
    localStorage.setItem('ihsanos_habits', JSON.stringify(updated))
  }

  const toggleHabit = (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const nextCompleted = !h.completedToday
        return {
          ...h,
          completedToday: nextCompleted,
          streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
        }
      }
      return h
    })
    persistHabits(updated)
  }

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      icon: newIcon,
      color: newColor,
      streak: 0,
      completedToday: false,
      weekDays: [true, true, true, true, true, true, true],
    }

    persistHabits([...habits, newHabit])
    setIsModalOpen(false)

    // Reset Form
    setNewName('')
    setNewCategory('Health')
    setNewIcon('activity')
    setNewColor('var(--accent)')
  }

  return (
    <PageWrapper>
      {/* Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{completedCount} / {habits.length} completed</p>
              <p className="text-xs text-[var(--text-3)]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[var(--accent-bg)] px-3 py-1.5 rounded-xl border border-[var(--accent-border)]">
              <Flame size={18} className="text-[var(--accent)]" />
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--accent-text)]">21d</p>
                <p className="text-[9px] text-[var(--accent-text)] font-semibold uppercase tracking-wider">best streak</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            {habits.map(h => (
              <div key={h.id} className="flex-1 h-2 rounded-full transition-all" style={{ backgroundColor: h.completedToday ? h.color : 'var(--bg-hover)' }} />
            ))}
          </div>
          <p className="text-xs text-[var(--text-3)]">{completionRate}% completion rate today</p>
        </Card>
      </motion.div>

      {/* Week View */}
      <div className="mb-5">
        <SectionHeader title="This Week" />
        <Card>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day, i) => {
              const isActiveDay = i === today - 1
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-wider">{day}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
                    isActiveDay ? 'bg-[var(--accent)] text-white' :
                    i < today - 1 ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]' :
                    'bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-3)]'
                  }`}>
                    {i < today - 1 ? '✓' : isActiveDay ? '→' : '·'}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Habits List */}
      <div className="mb-5">
        <SectionHeader title="My Habits" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => setIsModalOpen(true)}>Add</Button>
        } />
        <div className="flex flex-col gap-3">
          {habits.map((habit, i) => {
            const IconComponent = HABIT_ICONS[habit.icon] || Activity
            return (
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
                      className="flex-shrink-0 focus:outline-none transition-transform active:scale-95"
                    >
                      {habit.completedToday
                        ? <CheckCircle2 size={26} style={{ color: habit.color }} />
                        : <Circle size={26} className="text-[var(--border-strong)]" />
                      }
                    </button>

                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${habit.color}15`, color: habit.color }}>
                      <IconComponent size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${habit.completedToday ? 'text-[var(--text-3)] line-through' : 'text-[var(--text)]'}`}>
                        {habit.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="default" size="sm">{habit.category}</Badge>
                        <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-3)] font-medium">
                          <Flame size={10} className="text-[#ea580c]" />
                          {habit.streak}d streak
                        </span>
                      </div>
                    </div>

                    {habit.streak >= 21 && <Trophy size={16} className="text-[#d97706] flex-shrink-0 animate-bounce" />}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Streaks Hall */}
      <div className="mb-5">
        <SectionHeader title="Top Streaks" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[...habits].sort((a, b) => b.streak - a.streak).slice(0, 4).map(h => {
            const IconComponent = HABIT_ICONS[h.icon] || Activity
            return (
              <div
                key={h.id}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm min-w-[90px]"
              >
                <IconComponent size={20} className="text-[var(--text-3)]" />
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: h.color }}>{h.streak}</p>
                  <p className="text-[9px] text-[var(--text-3)] font-semibold uppercase tracking-wider leading-tight truncate max-w-[80px]">{h.name}</p>
                </div>
                <Flame size={12} className="text-[#ea580c]" />
              </div>
            )
          })}
        </div>
      </div>

      <FAB onClick={() => setIsModalOpen(true)} />

      {/* Add Habit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Habit">
        <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
          <Input
            label="Habit Name"
            placeholder="e.g. Read physical book"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              options={[
                { value: 'Health', label: 'Health' },
                { value: 'Learning', label: 'Learning' },
                { value: 'Mindfulness', label: 'Mindfulness' },
                { value: 'Personal', label: 'Personal' },
                { value: 'Digital', label: 'Digital' },
              ]}
            />
            <Select
              label="Icon"
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
              options={Object.keys(HABIT_ICONS).map(k => ({ value: k, label: k.charAt(0).toUpperCase() + k.slice(1) }))}
            />
          </div>
          <Select
            label="Theme Color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            options={[
              { value: 'var(--accent)', label: 'Default Theme Blue' },
              { value: '#ea580c', label: 'Orange' },
              { value: '#d97706', label: 'Amber' },
              { value: '#16a34a', label: 'Green' },
              { value: '#2563eb', label: 'Blue' },
              { value: '#7c3aed', label: 'Purple' },
            ]}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Habit
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
