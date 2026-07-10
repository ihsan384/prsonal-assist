import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Flame, Clock, Plus, Zap, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { fitnessStorage } from '@/services/storage'

const typeColors: Record<string, string> = {
  Strength: 'var(--accent)',
  Cardio: '#16a34a',
  HIIT: '#dc2626',
  Flexibility: '#0284c7',
}

const getWorkoutsThisWeek = (list: any[]) => {
  const now = new Date()
  const currentDay = now.getDay()
  const distanceToMon = currentDay === 0 ? 6 : currentDay - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - distanceToMon)
  monday.setHours(0, 0, 0, 0)
  
  return list.filter(w => {
    try {
      const d = new Date(w.date)
      return d.getTime() >= monday.getTime()
    } catch {
      return false
    }
  })
}

const getWorkoutDays = (workoutsWeek: any[]) => {
  const activeDays = new Array(7).fill(false)
  workoutsWeek.forEach(w => {
    try {
      const date = new Date(w.date)
      const day = date.getDay() // 0 = Sun, 1 = Mon, etc.
      const idx = day === 0 ? 6 : day - 1
      activeDays[idx] = true
    } catch {}
  })
  return activeDays
}

const calculateMuscleFocus = (list: any[]) => {
  const groups = [
    { name: 'Chest', keywords: ['chest', 'push', 'bench', 'pectoral'], trained: 0, color: 'var(--accent)' },
    { name: 'Back', keywords: ['back', 'pull', 'row', 'lat', 'deadlift'], trained: 0, color: '#16a34a' },
    { name: 'Legs', keywords: ['leg', 'squat', 'quad', 'hamstring', 'calf', 'lower'], trained: 0, color: '#d97706' },
    { name: 'Shoulders', keywords: ['shoulder', 'press', 'deltoid', 'overhead'], trained: 0, color: '#0284c7' },
    { name: 'Arms', keywords: ['arm', 'bicep', 'tricep', 'curl'], trained: 0, color: '#ea580c' },
    { name: 'Core', keywords: ['core', 'abs', 'crunch', 'plank'], trained: 0, color: '#7c3aed' },
  ]
  
  list.forEach(w => {
    const nameLower = w.name.toLowerCase()
    groups.forEach(g => {
      if (g.keywords.some(k => nameLower.includes(k))) {
        g.trained++
      }
    })
  })
  
  return groups
}

const formatWorkoutDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const todayStr = new Date().toDateString()
    if (d.toDateString() === todayStr) return 'Today'
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    
    const diffTime = Math.abs(new Date().getTime() - d.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function FitnessPage() {
  const [workouts, setWorkouts] = useState<any[]>(() => fitnessStorage.getWorkouts())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('Strength')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [rating, setRating] = useState('4')

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null)

  const reloadWorkouts = () => {
    setWorkouts(fitnessStorage.getWorkouts())
  }

  // Calculate dynamic weekly stats
  const workoutsWeek = getWorkoutsThisWeek(workouts)
  const activeDays = getWorkoutDays(workoutsWeek)
  const muscleGroups = calculateMuscleFocus(workouts)
  
  const targetWorkouts = 5
  const targetCalories = 2000
  const caloriesBurnedThisWeek = workoutsWeek.reduce((sum, w) => sum + (w.calories || w.caloriesBurned || 0), 0)

  const avgDuration = workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + (w.duration || w.durationMinutes || 0), 0) / workouts.length) : 0
  const avgDurationStr = `${avgDuration}m`
  
  const kcalPerWeekStr = caloriesBurnedThisWeek >= 1000 ? `${(caloriesBurnedThisWeek / 1000).toFixed(1)}k` : `${caloriesBurnedThisWeek}`

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    fitnessStorage.addWorkout({
      name: name.trim(),
      type: type.toLowerCase() as any,
      durationMinutes: Number(duration) || 30,
      caloriesBurned: Number(calories) || 200,
      date: new Date().toISOString(),
      exercises: [],
      rating: Number(rating) as any,
    })

    reloadWorkouts()
    setIsModalOpen(false)

    // Reset Form
    setName('')
    setType('Strength')
    setDuration('')
    setCalories('')
    setRating('4')
  }

  const handleDeleteClick = (id: string) => {
    setWorkoutToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (workoutToDelete) {
      fitnessStorage.removeWorkout(workoutToDelete)
      reloadWorkouts()
    }
    setIsDeleteOpen(false)
    setWorkoutToDelete(null)
  }

  return (
    <PageWrapper>
      {/* Weekly Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">This Week</p>
              <p className="text-xs text-[var(--text-3)]">{workoutsWeek.length} of {targetWorkouts} workouts</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--accent-bg)] px-3 py-1 rounded-xl border border-[var(--accent-border)]">
              <Flame size={16} className="text-[var(--accent)]" />
              <span className="text-sm font-bold text-[var(--accent-text)]">
                {Math.max(0, targetCalories - caloriesBurnedThisWeek)}
              </span>
              <span className="text-xs text-[var(--accent-text)]">kcal left</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-3)]">Workouts</span>
                <span className="text-[var(--text)] font-semibold">{workoutsWeek.length}/{targetWorkouts}</span>
              </div>
              <ProgressBar value={workoutsWeek.length} max={targetWorkouts} color="var(--accent)" height={5} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-3)]">Calories Burned</span>
                <span className="text-[var(--text)] font-semibold">{caloriesBurnedThisWeek}/{targetCalories}</span>
              </div>
              <ProgressBar value={caloriesBurnedThisWeek} max={targetCalories} color="#ea580c" height={5} />
            </div>
          </div>

          <div className="flex gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-8 rounded-lg flex items-center justify-center border transition-all ${
                  activeDays[i] 
                    ? 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]' 
                    : 'bg-transparent border-[var(--border)] text-[var(--text-4)]'
                }`}>
                  {activeDays[i] && <Zap size={10} className="fill-current animate-pulse" />}
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
          { label: 'Avg Duration', value: avgDurationStr, icon: Clock, color: '#d97706' },
          { label: 'Calories/wk', value: kcalPerWeekStr, icon: Flame, color: '#ea580c' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm">
            <stat.icon size={16} style={{ color: stat.color }} />
            <p className="text-base font-bold text-[var(--text)]">{stat.value}</p>
            <p className="text-[10px] text-[var(--text-3)] font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={24} />}
          title="No workouts recorded"
          description="Build strength and endurance. Log your first workout to track burns and exercise stats."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Log your first workout
            </Button>
          }
        />
      ) : (
        <>
          {/* Muscle Focus */}
          <div className="mb-5">
            <SectionHeader title="Muscle Focus Analysis" />
            <Card>
              <div className="grid grid-cols-3 gap-2">
                {muscleGroups.map(mg => (
                  <div key={mg.name} className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-[var(--border)]" style={{ backgroundColor: `${mg.color}08` }}>
                    <span className="text-xs font-semibold" style={{ color: mg.color }}>{mg.name}</span>
                    <span className="text-[10px] text-[var(--text-3)] font-medium">{mg.trained}x</span>
                    <div className="w-full h-1 rounded-full bg-[var(--border)]">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (mg.trained / Math.max(1, workouts.length)) * 100)}%`, backgroundColor: mg.color }} />
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
              {workouts.map((workout, i) => {
                const wCalories = workout.calories || workout.caloriesBurned || 0
                const wDuration = workout.duration || workout.durationMinutes || 0
                const wType = workout.type.charAt(0).toUpperCase() + workout.type.slice(1)
                
                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card hover>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${typeColors[wType] ?? 'var(--accent)'}15`, color: typeColors[wType] ?? 'var(--accent)' }}>
                            <Dumbbell size={18} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-[var(--text)] truncate">{workout.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge variant="violet" size="sm">{wType}</Badge>
                              <span className="text-[10px] text-[var(--text-3)] font-medium">{wDuration}min · {wCalories}kcal</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 text-right">
                          <div>
                            <p className="text-xs text-[var(--text-3)]">{formatWorkoutDate(workout.date)}</p>
                            <div className="flex mt-0.5 justify-end">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <span key={j} className={`text-[10px] ${j < (workout.rating || 4) ? 'text-[#d97706]' : 'text-[var(--border-strong)]'}`}>★</span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(workout.id) }}
                            className="text-[var(--text-4)] hover:text-[var(--error)] p-1 transition-colors"
                            title="Delete Workout"
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
        </>
      )}

      <FAB onClick={() => setIsModalOpen(true)} label="Log Workout" extended />

      {/* Log Workout Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Workout">
        <form onSubmit={handleAddWorkout} className="flex flex-col gap-4">
          <Input
            label="Workout Name"
            placeholder="e.g. Chest and Shoulders"
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

      {/* Delete Workout Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setWorkoutToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Workout"
        description="Are you sure you want to permanently delete this workout log?"
      />
    </PageWrapper>
  )
}
