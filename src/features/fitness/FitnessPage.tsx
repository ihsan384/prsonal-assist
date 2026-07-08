import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Flame, Clock, Plus, Zap } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'

interface Workout {
  id: string
  name: string
  type: string
  duration: number
  calories: number
  date: string
  exercises: number
  rating: number
}

const DEFAULT_WORKOUTS: Workout[] = [
  { id: '1', name: 'Upper Body Push', type: 'Strength', duration: 55, calories: 380, date: 'Today', exercises: 7, rating: 4 },
  { id: '2', name: 'Morning Run', type: 'Cardio', duration: 35, calories: 290, date: 'Yesterday', exercises: 1, rating: 5 },
  { id: '3', name: 'Full Body HIIT', type: 'HIIT', duration: 40, calories: 420, date: '2 days ago', exercises: 12, rating: 4 },
  { id: '4', name: 'Lower Body', type: 'Strength', duration: 50, calories: 310, date: '3 days ago', exercises: 6, rating: 3 },
]

const weeklyGoal = { workouts: 5, done: 3, calories: 2000, burned: 1390 }

const muscleGroups = [
  { name: 'Chest', trained: 3, color: 'var(--accent)' },
  { name: 'Back', trained: 2, color: '#16a34a' },
  { name: 'Legs', trained: 2, color: '#d97706' },
  { name: 'Shoulders', trained: 3, color: '#0284c7' },
  { name: 'Arms', trained: 4, color: '#ea580c' },
  { name: 'Core', trained: 5, color: '#7c3aed' },
]

const typeColors: Record<string, string> = {
  Strength: 'var(--accent)',
  Cardio: '#16a34a',
  HIIT: '#dc2626',
  Flexibility: '#0284c7',
}

export default function FitnessPage() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('ihsanos_workouts')
    return saved ? JSON.parse(saved) : DEFAULT_WORKOUTS
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('Strength')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [rating, setRating] = useState('4')

  const persistWorkouts = (updated: Workout[]) => {
    setWorkouts(updated)
    localStorage.setItem('ihsanos_workouts', JSON.stringify(updated))
  }

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      duration: Number(duration) || 30,
      calories: Number(calories) || 200,
      date: 'Just now',
      exercises: type === 'Strength' ? 5 : 1,
      rating: Number(rating) || 4,
    }

    persistWorkouts([newWorkout, ...workouts])
    setIsModalOpen(false)

    // Reset Form
    setName('')
    setType('Strength')
    setDuration('')
    setCalories('')
    setRating('4')
  }

  return (
    <PageWrapper>
      {/* Weekly Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">This Week</p>
              <p className="text-xs text-[var(--text-3)]">{weeklyGoal.done} of {weeklyGoal.workouts} workouts</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--accent-bg)] px-3 py-1 rounded-xl border border-[var(--accent-border)]">
              <Flame size={16} className="text-[var(--accent)]" />
              <span className="text-sm font-bold text-[var(--accent-text)]">{weeklyGoal.calories - weeklyGoal.burned}</span>
              <span className="text-xs text-[var(--accent-text)]">kcal left</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-3)]">Workouts</span>
                <span className="text-[var(--text)] font-semibold">{weeklyGoal.done}/{weeklyGoal.workouts}</span>
              </div>
              <ProgressBar value={weeklyGoal.done} max={weeklyGoal.workouts} color="var(--accent)" height={5} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-3)]">Calories</span>
                <span className="text-[var(--text)] font-semibold">{weeklyGoal.burned}/{weeklyGoal.calories}</span>
              </div>
              <ProgressBar value={weeklyGoal.burned} max={weeklyGoal.calories} color="#ea580c" height={5} />
            </div>
          </div>

          <div className="flex gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-8 rounded-lg flex items-center justify-center border transition-all ${i < 3 ? 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]' : i === 3 ? 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-4)]' : 'bg-transparent border-[var(--border)] text-[var(--text-4)]'}`}>
                  {i < 3 && <Zap size={10} className="fill-current" />}
                </div>
                <span className="text-[9px] text-[var(--text-3)] font-medium">{d}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Total Workouts', value: workouts.length, icon: Dumbbell, color: 'var(--accent)' },
          { label: 'Avg Duration', value: '45m', icon: Clock, color: '#d97706' },
          { label: 'Calories/wk', value: '1.39k', icon: Flame, color: '#ea580c' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm">
            <stat.icon size={16} style={{ color: stat.color }} />
            <p className="text-base font-bold text-[var(--text)]">{stat.value}</p>
            <p className="text-[10px] text-[var(--text-3)] font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Muscle Groups */}
      <div className="mb-5">
        <SectionHeader title="Muscle Focus This Week" />
        <Card>
          <div className="grid grid-cols-3 gap-2">
            {muscleGroups.map(mg => (
              <div key={mg.name} className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-[var(--border)]" style={{ backgroundColor: `${mg.color}08` }}>
                <span className="text-xs font-semibold" style={{ color: mg.color }}>{mg.name}</span>
                <span className="text-[10px] text-[var(--text-3)] font-medium">{mg.trained}x</span>
                <div className="w-full h-1 rounded-full bg-[var(--border)]">
                  <div className="h-full rounded-full" style={{ width: `${(mg.trained / 7) * 100}%`, backgroundColor: mg.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div className="mb-5">
        <SectionHeader title="Recent Workouts" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => setIsModalOpen(true)}>Log</Button>
        } />
        <div className="flex flex-col gap-3">
          {workouts.map((workout, i) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card hover>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${typeColors[workout.type] ?? 'var(--accent)'}15`, color: typeColors[workout.type] ?? 'var(--accent)' }}>
                    <Dumbbell size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)]">{workout.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="violet" size="sm">{workout.type}</Badge>
                      <span className="text-[10px] text-[var(--text-3)] font-medium">{workout.duration}min · {workout.calories}kcal</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--text-3)]">{workout.date}</p>
                    <div className="flex mt-0.5 justify-end">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={`text-[10px] ${j < workout.rating ? 'text-[#d97706]' : 'text-[var(--border-strong)]'}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <FAB onClick={() => setIsModalOpen(true)} label="Log Workout" extended />

      {/* Log Workout Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Workout">
        <form onSubmit={handleAddWorkout} className="flex flex-col gap-4">
          <Input
            label="Workout Name"
            placeholder="e.g. Upper Body Strength"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              value={type}
              onChange={e => setType(e.target.value)}
              options={[
                { value: 'Strength', label: 'Strength' },
                { value: 'Cardio', label: 'Cardio' },
                { value: 'HIIT', label: 'HIIT' },
                { value: 'Flexibility', label: 'Flexibility' },
              ]}
            />
            <Select
              label="Rating"
              value={rating}
              onChange={e => setRating(e.target.value)}
              options={[
                { value: '5', label: '5 Stars - Excellent' },
                { value: '4', label: '4 Stars - Good' },
                { value: '3', label: '3 Stars - Average' },
                { value: '2', label: '2 Stars - Poor' },
                { value: '1', label: '1 Star - Bad' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (minutes)"
              placeholder="e.g. 45"
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              required
            />
            <Input
              label="Calories Burned (kcal)"
              placeholder="e.g. 350"
              type="number"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Log Workout
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
