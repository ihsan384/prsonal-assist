import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressRing, ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { goalStorage } from '@/services/storage'
import type { GoalCategory, GoalTimeframe } from '@/types'

const categoryColors: Record<string, string> = {
  Study: 'var(--accent)',
  Work: '#0284c7',
  Fitness: '#16a34a',
  Finance: '#d97706',
  Personal: '#ea580c',
  Spiritual: '#7c3aed',
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>(() => goalStorage.getAll())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Study')
  const [timeframe, setTimeframe] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [unit, setUnit] = useState('%')

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)

  const reloadGoals = () => {
    setGoals(goalStorage.getAll())
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !target) return

    const catMap: Record<string, string> = {
      Study: 'education',
      Work: 'career',
      Fitness: 'health',
      Finance: 'finance',
      Personal: 'personal',
      Spiritual: 'spiritual',
    }
    goalStorage.add({
      title: title.trim(),
      description: description.trim(),
      category: (catMap[category] || 'personal') as GoalCategory,
      timeframe: (timeframe || 'monthly') as any as GoalTimeframe,
      currentValue: Number(current) || 0,
      targetValue: Number(target),
      unit: unit || '%',
      status: 'active' as any,
      milestones: [],
      color: categoryColors[category] || 'var(--accent)',
    })

    reloadGoals()
    setIsModalOpen(false)

    // Reset Form
    setTitle('')
    setDescription('')
    setCategory('Study')
    setTimeframe('')
    setTarget('')
    setCurrent('')
    setUnit('%')
  }

  const handleDeleteClick = (id: string) => {
    setGoalToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (goalToDelete) {
      goalStorage.remove(goalToDelete)
      reloadGoals()
    }
    setIsDeleteOpen(false)
    setGoalToDelete(null)
  }

  const activeGoals = goals.filter(g => g.currentValue < g.targetValue)
  const completedGoals = goals.filter(g => g.currentValue >= g.targetValue)
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) / goals.length)
    : 0

  return (
    <PageWrapper>
      {/* Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing value={avgProgress} size={72} strokeWidth={6} color="var(--accent)">
              <span className="text-sm font-bold text-[var(--text)]">{avgProgress}%</span>
            </ProgressRing>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--text)]">Overall Progress</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">{activeGoals.length} active goals</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="default" size="sm" dot>{goals.length} Total</Badge>
                <Badge variant="success" size="sm">{completedGoals.length} Completed</Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target size={24} />}
          title="No goals set yet"
          description="Define clear targets. Create your first goal to track progress and timeframe deadlines."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Create your first goal
            </Button>
          }
        />
      ) : (
        <>
          {/* Goal list */}
          <SectionHeader title="Active Goals" action={
            <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => setIsModalOpen(true)}>Add Goal</Button>
          } />

          <div className="flex flex-col gap-3">
            {goals.map((goal, idx) => {
              const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card hover>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-left">
                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: categoryColors[goal.category] || 'var(--accent)' }}>
                          {goal.category}
                        </span>
                        <h3 className="text-sm font-bold text-[var(--text)] mt-0.5">{goal.title}</h3>
                        <p className="text-xs text-[var(--text-3)] mt-0.5">{goal.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="default" size="sm">{goal.timeframe}</Badge>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(goal.id) }}
                          className="text-[var(--text-4)] hover:text-[var(--error)] p-1 transition-colors"
                          title="Delete Goal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex-1">
                        <ProgressBar value={goal.currentValue} max={goal.targetValue} height={5} color={categoryColors[goal.category] ?? 'var(--accent)'} />
                      </div>
                      <span className="text-xs text-[var(--text-2)] font-semibold shrink-0">
                        {goal.currentValue}/{goal.targetValue} {goal.unit} ({pct}%)
                      </span>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      <FAB onClick={() => setIsModalOpen(true)} label="Add Goal" extended />

      {/* Add Goal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Goal">
        <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Complete Spaced Repetition Logic"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Description"
            placeholder="e.g. Implement card logic, test with physics formulas"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={[
                { value: 'Study', label: 'Study' },
                { value: 'Work', label: 'Work' },
                { value: 'Fitness', label: 'Fitness' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Personal', label: 'Personal' },
                { value: 'Spiritual', label: 'Spiritual' },
              ]}
            />
            <Input
              label="Timeframe"
              placeholder="e.g. Q3 2026, Dec 2026"
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Current Value"
              placeholder="e.g. 0"
              type="number"
              value={current}
              onChange={e => setCurrent(e.target.value)}
            />
            <Input
              label="Target Value"
              placeholder="e.g. 100"
              type="number"
              value={target}
              onChange={e => setTarget(e.target.value)}
              required
            />
            <Input
              label="Unit"
              placeholder="e.g. %, h, reps"
              value={unit}
              onChange={e => setUnit(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Goal Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setGoalToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Goal"
        description="This will permanently delete this goal and lose all tracked progress. This action is dangerous."
        requireText="DELETE"
      />
    </PageWrapper>
  )
}
