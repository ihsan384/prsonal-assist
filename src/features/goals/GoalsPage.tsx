import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Calendar } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressRing, ProgressBar } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'

interface Goal {
  id: string
  title: string
  description: string
  category: string
  timeframe: string
  current: number
  target: number
  unit: string
  color: string
}

const goals: Goal[] = [
  { id: '1', title: 'Complete Calculus Preparation', description: 'Study limits, continuity, derivative formulas and solve matrix exercises', category: 'Study', timeframe: 'Q3 2026', current: 75, target: 100, unit: '%', color: '#7c6aff' },
  { id: '2', title: 'Build gym app portfolio', description: 'React native dashboard and backend integrations', category: 'Work', timeframe: 'Q3 2026', current: 40, target: 100, unit: '%', color: '#06b6d4' },
  { id: '3', title: 'Reduce body fat percentage', description: 'Target 12% body fat through clean diet and lifting program', category: 'Fitness', timeframe: 'Dec 2026', current: 15, target: 12, unit: '%', color: '#10b981' },
]

const categoryColors: Record<string, string> = {
  Study: '#7c6aff',
  Work: '#06b6d4',
  Fitness: '#10b981',
  Finance: '#f59e0b',
  Personal: '#f97316',
  Spiritual: '#8b5cf6',
}

export default function GoalsPage() {
  const activeGoals = goals.filter(g => g.current < g.target)
  const avgProgress = Math.round(goals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / goals.length)

  return (
    <PageWrapper>
      {/* Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <ProgressRing value={avgProgress} size={72} strokeWidth={6} color="var(--accent)">
              <span className="text-sm font-bold text-[var(--text)]">{avgProgress}%</span>
            </ProgressRing>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Overall Progress</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">{activeGoals.length} active goals</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="default" size="sm" dot>{goals.length} Total</Badge>
                <Badge variant="success" size="sm">0 Completed</Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Goal list */}
      <SectionHeader title="Active Goals" action={
        <Button variant="ghost" size="sm" icon={<Plus size={12} />}>Add Goal</Button>
      } />

      <div className="flex flex-col gap-3">
        {goals.map((goal, idx) => {
          const pct = Math.round((goal.current / goal.target) * 100)
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">{goal.title}</h3>
                    <p className="text-xs text-[var(--text-3)] mt-0.5">{goal.description}</p>
                  </div>
                  <Badge variant="default" size="sm">{goal.timeframe}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1">
                    <ProgressBar value={goal.current} max={goal.target} height={5} color={categoryColors[goal.category] ?? 'var(--accent)'} />
                  </div>
                  <span className="text-xs text-[var(--text-2)] font-semibold shrink-0">
                    {goal.current}/{goal.target} {goal.unit} ({pct}%)
                  </span>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <FAB onClick={() => {}} label="Add Goal" extended />
    </PageWrapper>
  )
}
