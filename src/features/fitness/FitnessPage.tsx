import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Flame, Clock, Plus, Zap, Trash2, Heart, Activity, ShieldAlert, Award } from 'lucide-react'
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
import { fitnessStorage, healthRecordStorage } from '@/services/storage'
import { healthConnectService } from '@/services/health/HealthConnectService'


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

  const [activeSubTab, setActiveSubTab] = useState<'workouts' | 'health'>('workouts')
  
  // Health Connect & Records
  const [hcSupported, setHcSupported] = useState(() => healthConnectService.isSupported())
  const [hcStatus, setHcStatus] = useState<string>('denied')
  const [hcLastSync, setHcLastSync] = useState<string | null>(null)
  const [healthRecords, setHealthRecords] = useState<any[]>(() => healthRecordStorage.getAll())

  // Manual Health Entry
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false)
  const [healthType, setHealthType] = useState('steps')
  const [healthValue, setHealthValue] = useState('')

  useEffect(() => {
    healthConnectService.getStatus().then(status => setHcStatus(status))
    setHcLastSync(localStorage.getItem('health_connect_last_sync'))
    setHealthRecords(healthRecordStorage.getAll())
  }, [])

  const reloadHealth = () => {
    setHealthRecords(healthRecordStorage.getAll())
  }


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

  const handleAddManualHealth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!healthValue.trim()) return

    const val = Number(healthValue)
    if (isNaN(val)) return

    let unit = 'count'
    if (healthType === 'distance') unit = 'km'
    else if (healthType === 'calories_burned') unit = 'kcal'
    else if (healthType === 'active_minutes') unit = 'minutes'
    else if (healthType === 'heart_rate') unit = 'bpm'
    else if (healthType === 'sleep_hours') unit = 'hours'
    else if (healthType === 'weight') unit = 'kg'
    else if (healthType === 'bmi') unit = 'ratio'

    healthConnectService.saveManualRecord(healthType, val, unit)
    reloadHealth()
    setIsHealthModalOpen(false)
    setHealthValue('')
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

  // Health Metrics View
  const renderHealthMetrics = () => {
    const today = new Date().toDateString()
    const todayRecs = healthRecords.filter(r => new Date(r.timestamp).toDateString() === today)
    
    const getMetric = (type: string, defVal = '0', unitStr = '') => {
      const rec = todayRecs.find(r => r.type === type)
      return rec ? `${rec.value} ${rec.unit || unitStr}` : `${defVal} ${unitStr}`
    }

    const handleSync = async () => {
      const success = await healthConnectService.syncHealthConnect()
      if (success) {
        setHcLastSync(new Date().toLocaleString())
        localStorage.setItem('health_connect_last_sync', new Date().toLocaleString())
        setHealthRecords(healthRecordStorage.getAll())
      }
    }

    const metrics = [
      { label: 'Today\'s Steps', value: getMetric('steps', '0', 'steps'), icon: Activity, color: 'var(--accent)' },
      { label: 'Sleep Last Night', value: getMetric('sleep_hours', '0.0', 'hours'), icon: Clock, color: '#7c3aed' },
      { label: 'Calories Burned', value: getMetric('calories_burned', '0', 'kcal'), icon: Flame, color: '#ea580c' },
      { label: 'Distance', value: getMetric('distance', '0.0', 'km'), icon: Zap, color: '#16a34a' },
      { label: 'Active Minutes', value: getMetric('active_minutes', '0', 'minutes'), icon: Clock, color: '#d97706' },
      { label: 'Heart Rate', value: getMetric('heart_rate', '--', 'bpm'), icon: Heart, color: '#dc2626' },
      { label: 'Weight', value: getMetric('weight', '--', 'kg'), icon: Dumbbell, color: '#0284c7' },
      { label: 'BMI', value: getMetric('bmi', '--', ''), icon: Award, color: '#db2777' },
    ]

    return (
      <div className="flex flex-col gap-5 text-left animate-fade-in">
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 shrink-0">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Google Health Connect</h3>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  {!hcSupported ? 'Health Connect is not available on this device.' : `Native Sync status: ${hcStatus}`}
                </p>
                <p className="text-[10px] text-[var(--text-4)] mt-1.5 font-medium">
                  Last Sync: {hcLastSync || 'Never'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {hcSupported && hcStatus === 'granted' && (
                <Button variant="primary" size="sm" onClick={handleSync}>
                  Sync Now
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setIsHealthModalOpen(true)}>
                Add Manual Log
              </Button>
            </div>
          </div>
        </Card>

        <div>
          <SectionHeader title="Today's Health Metrics" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {metrics.map(m => (
              <div key={m.label} className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl flex flex-col gap-1.5 hover:border-[var(--border-strong)] transition-all">
                <m.icon size={16} style={{ color: m.color }} />
                <p className="text-sm font-bold text-[var(--text)] truncate">{m.value}</p>
                <p className="text-[10px] text-[var(--text-3)] font-semibold uppercase tracking-wider">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {todayRecs.length > 0 && (
          <div>
            <SectionHeader title="Today's Log Entries" />
            <Card padding="none">
              <div className="divide-y divide-[var(--border)] text-xs">
                {todayRecs.map(rec => (
                  <div key={rec.id} className="flex justify-between items-center p-3">
                    <span className="font-semibold text-[var(--text)] capitalize">
                      {rec.type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--text-3)] font-medium">
                        {rec.value} {rec.unit}
                      </span>
                      <Badge variant={rec.source === 'health_connect' ? 'violet' : 'default'} size="sm">
                        {rec.source}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <PageWrapper>
      {/* Sub tabs switcher */}
      <div className="flex gap-1 bg-[var(--bg-subtle)] rounded-xl p-1 mb-5 border border-[var(--border)]">
        <button
          onClick={() => setActiveSubTab('workouts')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'workouts'
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Dumbbell size={14} /> Workouts Log
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('health')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'health'
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Heart size={14} /> Health Metrics
          </div>
        </button>
      </div>

      {activeSubTab === 'health' ? renderHealthMetrics() : (
        <div className="animate-fade-in">
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
      </div>
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

      {/* Manual Health Entry Modal */}
      <Modal isOpen={isHealthModalOpen} onClose={() => setIsHealthModalOpen(false)} title="Log Health Metric">
        <form onSubmit={handleAddManualHealth} className="flex flex-col gap-4 text-left">
          <div>
            <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">Metric Type</label>
            <Select
              value={healthType}
              onChange={e => setHealthType(e.target.value)}
              options={[
                { value: 'steps', label: 'Steps (count)' },
                { value: 'sleep_hours', label: 'Sleep Hours (hours)' },
                { value: 'calories_burned', label: 'Calories Burned (kcal)' },
                { value: 'distance', label: 'Distance (km)' },
                { value: 'active_minutes', label: 'Active Minutes (minutes)' },
                { value: 'heart_rate', label: 'Heart Rate (bpm)' },
                { value: 'weight', label: 'Weight (kg)' },
                { value: 'bmi', label: 'BMI' }
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-3)] mb-1 block">Value</label>
            <Input
              type="number"
              step="any"
              value={healthValue}
              onChange={e => setHealthValue(e.target.value)}
              placeholder="e.g. 7500 or 7.5"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsHealthModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Metric
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

