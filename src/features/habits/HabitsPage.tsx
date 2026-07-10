import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Circle, Flame, Plus, Trophy, Trash2,
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
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { habitStorage } from '@/services/storage'
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

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const today = new Date().getDay()

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>(() => habitStorage.getAll())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('Health')
  const [newIcon, setNewIcon] = useState('activity')
  const [newColor, setNewColor] = useState('var(--accent)')

  // Delete Confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  const reloadHabits = () => {
    setHabits(habitStorage.getAll())
  }

  const completedCount = habits.filter(h => h.completedToday).length
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0), 0) : 0

  const toggleHabit = (id: string) => {
    const current = habits.find(h => h.id === id)
    if (!current) return
    const nextCompleted = !current.completedToday
    const nextStreak = nextCompleted ? (current.streak || 0) + 1 : Math.max(0, (current.streak || 0) - 1)
    
    habitStorage.update(id, {
      completedToday: nextCompleted,
      streak: nextStreak,
    } as any)
    reloadHabits()
  }

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    habitStorage.add({
      name: newName.trim(),
      category: newCategory,
      icon: newIcon,
      color: newColor,
      streak: 0,
      completedToday: false,
      weekDays: [true, true, true, true, true, true, true],
      isActive: true,
      frequency: 'daily',
      targetDays: [1, 2, 3, 4, 5, 6, 7],
      longestStreak: 0,
      completions: [],
    } as any)

    reloadHabits()
    setIsModalOpen(false)

    // Reset Form
    setNewName('')
    setNewCategory('Health')
    setNewIcon('activity')
    setNewColor('var(--accent)')
  }

  const handleDeleteClick = (id: string) => {
    setHabitToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (habitToDelete) {
      habitStorage.remove(habitToDelete)
      reloadHabits()
    }
    setIsDeleteOpen(false)
    setHabitToDelete(null)
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
                <p className="text-sm font-bold text-[var(--accent-text)]">{bestStreak}d</p>
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

      {habits.length === 0 ? (
        <EmptyState
          icon={<Flame size={24} />}
          title="No habits tracked yet"
          description="Build daily discipline. Add a habit to start tracking streaks and completions."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Add your first habit
            </Button>
          }
        />
      ) : (
        <>
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
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => toggleHabit(habit.id)}
                            className="flex-shrink-0 focus:outline-none transition-transform active:scale-95 text-left"
                          >
                            {habit.completedToday
                              ? <CheckCircle2 size={26} style={{ color: habit.color }} />
                              : <Circle size={26} className="text-[var(--border-strong)]" />
                            }
                          </button>

                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${habit.color}15`, color: habit.color }}>
                            <IconComponent size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${habit.completedToday ? 'text-[var(--text-3)] line-through' : 'text-[var(--text)]'}`}>
                              {habit.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="default" size="sm">{habit.category}</Badge>
                              <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-3)] font-medium">
                                <Flame size={10} className="text-[#ea580c]" />
                                {habit.streak || 0}d streak
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {(habit.streak || 0) >= 21 && <Trophy size={16} className="text-[#d97706] animate-bounce" />}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(habit.id) }}
                            className="text-[var(--text-4)] hover:text-[var(--error)] p-1 transition-colors"
                            title="Delete Habit"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
              {[...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 4).map(h => {
                const IconComponent = HABIT_ICONS[h.icon] || Activity
                return (
                  <div
                    key={h.id}
                    className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm min-w-[90px]"
                  >
                    <IconComponent size={20} className="text-[var(--text-3)]" />
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: h.color }}>{h.streak || 0}</p>
                      <p className="text-[9px] text-[var(--text-3)] font-semibold uppercase tracking-wider leading-tight truncate max-w-[80px]">{h.name}</p>
                    </div>
                    <Flame size={12} className="text-[#ea580c]" />
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

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

      {/* Delete Habit Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setHabitToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Habit"
        description="Are you sure you want to permanently delete this habit and reset its streak?"
      />
    </PageWrapper>
  )
}
