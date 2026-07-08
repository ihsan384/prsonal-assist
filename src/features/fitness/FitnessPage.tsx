import { motion } from 'framer-motion'
import { Dumbbell, Flame, Clock, Plus, Zap } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'

const workouts = [
  { id: '1', name: 'Upper Body Push', type: 'Strength', duration: 55, calories: 380, date: 'Today', exercises: 7, rating: 4 },
  { id: '2', name: 'Morning Run', type: 'Cardio', duration: 35, calories: 290, date: 'Yesterday', exercises: 1, rating: 5 },
  { id: '3', name: 'Full Body HIIT', type: 'HIIT', duration: 40, calories: 420, date: '2 days ago', exercises: 12, rating: 4 },
  { id: '4', name: 'Lower Body', type: 'Strength', duration: 50, calories: 310, date: '3 days ago', exercises: 6, rating: 3 },
]

const weeklyGoal = { workouts: 5, done: 3, calories: 2000, burned: 1390 }

const muscleGroups = [
  { name: 'Chest', trained: 3, color: '#7c6aff' },
  { name: 'Back', trained: 2, color: '#10b981' },
  { name: 'Legs', trained: 2, color: '#f59e0b' },
  { name: 'Shoulders', trained: 3, color: '#06b6d4' },
  { name: 'Arms', trained: 4, color: '#f97316' },
  { name: 'Core', trained: 5, color: '#8b5cf6' },
]

const typeColors: Record<string, string> = {
  Strength: '#7c6aff',
  Cardio: '#10b981',
  HIIT: '#f43f5e',
  Flexibility: '#06b6d4',
}

export default function FitnessPage() {
  return (
    <PageWrapper>
      {/* Weekly Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#f0f0f5]">This Week</p>
              <p className="text-xs text-[#55556a]">{weeklyGoal.done} of {weeklyGoal.workouts} workouts</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={16} className="text-[#f97316]" />
              <span className="text-lg font-bold text-[#f0f0f5]">{weeklyGoal.calories - weeklyGoal.burned}</span>
              <span className="text-xs text-[#55556a]">kcal left</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#55556a]">Workouts</span>
                <span className="text-[#f0f0f5] font-medium">{weeklyGoal.done}/{weeklyGoal.workouts}</span>
              </div>
              <ProgressBar value={weeklyGoal.done} max={weeklyGoal.workouts} color="#7c6aff" height={5} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#55556a]">Calories</span>
                <span className="text-[#f0f0f5] font-medium">{weeklyGoal.burned}/{weeklyGoal.calories}</span>
              </div>
              <ProgressBar value={weeklyGoal.burned} max={weeklyGoal.calories} color="#f97316" height={5} />
            </div>
          </div>

          <div className="flex gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-8 rounded-lg flex items-center justify-center ${i < 3 ? 'bg-[#7c6aff]' : i === 3 ? 'bg-[rgba(124,106,255,0.3)]' : 'bg-[rgba(255,255,255,0.04)]'}`}>
                  {i < 3 && <Zap size={10} className="text-white" />}
                </div>
                <span className="text-[9px] text-[#55556a]">{d}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Total Workouts', value: '28', icon: Dumbbell, color: '#7c6aff' },
          { label: 'Avg Duration', value: '45m', icon: Clock, color: '#f59e0b' },
          { label: 'Calories/wk', value: '1.39k', icon: Flame, color: '#f97316' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.06)]">
            <stat.icon size={16} style={{ color: stat.color }} />
            <p className="text-base font-bold text-[#f0f0f5]">{stat.value}</p>
            <p className="text-[10px] text-[#55556a] leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Muscle Groups */}
      <div className="mb-5">
        <SectionHeader title="Muscle Focus This Week" />
        <Card>
          <div className="grid grid-cols-3 gap-2">
            {muscleGroups.map(mg => (
              <div key={mg.name} className="flex flex-col items-center gap-1.5 p-2 rounded-xl" style={{ backgroundColor: `${mg.color}10` }}>
                <span className="text-xs font-medium" style={{ color: mg.color }}>{mg.name}</span>
                <span className="text-[10px] text-[#55556a]">{mg.trained}x</span>
                <div className="w-full h-1 rounded-full bg-[rgba(255,255,255,0.06)]">
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
          <Button variant="ghost" size="sm" icon={<Plus size={12} />}>Log</Button>
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${typeColors[workout.type] ?? '#7c6aff'}15`, color: typeColors[workout.type] ?? '#7c6aff' }}>
                    <Dumbbell size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f0f0f5]">{workout.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="violet" size="sm">{workout.type}</Badge>
                      <span className="text-[10px] text-[#55556a]">{workout.duration}min · {workout.calories}kcal</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#55556a]">{workout.date}</p>
                    <div className="flex mt-0.5 justify-end">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={`text-[10px] ${j < workout.rating ? 'text-[#f59e0b]' : 'text-[#252530]'}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <FAB onClick={() => {}} label="Log Workout" extended />
    </PageWrapper>
  )
}
