import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Clock, Star, TrendingUp, Plus, Smartphone, Coffee, Thermometer, Activity } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'

interface SleepLog {
  id: string
  date: string
  bed: string
  wake: string
  hours: number
  quality: string
  rating: number
  factors: string[]
}

const DEFAULT_SLEEP_LOGS: SleepLog[] = [
  { id: '1', date: 'Last night', bed: '10:45 PM', wake: '6:00 AM', hours: 7.25, quality: 'Good', rating: 4, factors: ['Exercise'] },
  { id: '2', date: 'Tue', bed: '11:30 PM', wake: '7:00 AM', hours: 7.5, quality: 'Good', rating: 4, factors: [] },
  { id: '3', date: 'Mon', bed: '10:00 PM', wake: '6:00 AM', hours: 8.0, quality: 'Excellent', rating: 5, factors: ['Meditation'] },
  { id: '4', date: 'Sun', bed: '12:00 AM', wake: '8:00 AM', hours: 8.0, quality: 'Fair', rating: 3, factors: ['Screen', 'Caffeine'] },
  { id: '5', date: 'Sat', bed: '1:00 AM', wake: '9:00 AM', hours: 8.0, quality: 'Poor', rating: 2, factors: ['Late Meal', 'Stress'] },
]

const sleepGoal = 8

const qualityColors: Record<string, string> = {
  Excellent: '#16a34a',
  Good: 'var(--accent)',
  Fair: '#d97706',
  Poor: '#dc2626',
}

const sleepTips = [
  { icon: Smartphone, tip: 'Avoid screens 1h before bed' },
  { icon: Coffee, tip: 'No caffeine after 2 PM' },
  { icon: Thermometer, tip: 'Keep room temperature cool' },
  { icon: Activity, tip: 'Try 4-7-8 breathing exercise' },
]

export default function SleepPage() {
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem('ihsanos_sleep')
    return saved ? JSON.parse(saved) : DEFAULT_SLEEP_LOGS
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bedTime, setBedTime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [hours, setHours] = useState('')
  const [quality, setQuality] = useState('Good')
  const [rating, setRating] = useState('4')
  const [factors, setFactors] = useState('')

  const persistSleepLogs = (updated: SleepLog[]) => {
    setSleepLogs(updated)
    localStorage.setItem('ihsanos_sleep', JSON.stringify(updated))
  }

  const handleAddSleepLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bedTime || !wakeTime || !hours) return

    const newLog: SleepLog = {
      id: Date.now().toString(),
      date: 'Just logged',
      bed: bedTime,
      wake: wakeTime,
      hours: Number(hours) || 7.5,
      quality,
      rating: Number(rating) || 4,
      factors: factors ? factors.split(',').map(f => f.trim()).filter(Boolean) : [],
    }

    persistSleepLogs([newLog, ...sleepLogs])
    setIsModalOpen(false)

    // Reset Form
    setBedTime('')
    setWakeTime('')
    setHours('')
    setQuality('Good')
    setRating('4')
    setFactors('')
  }

  const weekData = sleepLogs.map(l => l.hours)
  const avgSleep = weekData.length > 0 ? weekData.reduce((a, b) => a + b, 0) / weekData.length : 0

  const lastNightHours = sleepLogs[0]?.hours || 0
  const lastNightBed = sleepLogs[0]?.bed || '--'
  const lastNightWake = sleepLogs[0]?.wake || '--'
  const lastNightQuality = sleepLogs[0]?.quality || '--'

  return (
    <PageWrapper>
      {/* Last Night Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing value={lastNightHours} max={sleepGoal} size={88} strokeWidth={7} color="var(--accent)">
              <div className="flex flex-col items-center">
                <Moon size={18} className="text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--text)]">{lastNightHours}h</span>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text)] mb-2">Last Night</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Moon size={12} className="text-[var(--text-3)]" />
                  <span className="text-xs text-[var(--text-2)]">Bed: {lastNightBed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun size={12} className="text-[#d97706]" />
                  <span className="text-xs text-[var(--text-2)]">Wake: {lastNightWake}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={12} className="text-[var(--accent)]" />
                  <Badge variant="violet" size="sm">{lastNightQuality} Quality</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Avg Sleep', value: `${avgSleep.toFixed(1)}h`, icon: Clock, color: 'var(--accent)' },
          { label: 'This Week', value: `${sleepLogs.length} days`, icon: Moon, color: '#ea580c' },
          { label: 'Best Night', value: '8.0h', icon: TrendingUp, color: '#16a34a' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-sm">
            <stat.icon size={16} style={{ color: stat.color }} />
            <p className="text-base font-bold text-[var(--text)]">{stat.value}</p>
            <p className="text-[10px] text-[var(--text-3)] font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="mb-5">
        <SectionHeader title="This Week" subtitle={`Avg ${avgSleep.toFixed(1)}h per night`} />
        <Card>
          <div className="flex items-end gap-2 h-24 pt-4">
            {[...sleepLogs].slice().reverse().map((log, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-lg transition-all"
                  style={{
                    height: `${(log.hours / sleepGoal) * 60}px`,
                    backgroundColor: qualityColors[log.quality] ?? 'var(--accent)',
                    opacity: 0.7 + (i === sleepLogs.length - 1 ? 0.3 : 0),
                    minHeight: 8,
                  }}
                />
                <span className="text-[9px] text-[var(--text-3)] font-semibold uppercase">{log.date.slice(0, 3)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-3 text-[10px]">
            {Object.entries(qualityColors).map(([q, c]) => (
              <div key={q} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-[var(--text-3)] font-medium">{q}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sleep Log History */}
      <div className="mb-5">
        <SectionHeader title="Sleep History" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => setIsModalOpen(true)}>Log Sleep</Button>
        } />
        <div className="flex flex-col gap-3">
          {sleepLogs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card hover>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                    <Moon size={18} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--text)]">{log.hours}h sleep</p>
                      <Badge size="sm" style={{ backgroundColor: `${qualityColors[log.quality]}15`, color: qualityColors[log.quality] }}>
                        {log.quality}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-3)] mt-0.5">{log.bed} → {log.wake}</p>
                    {log.factors.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {log.factors.map(f => <Badge key={f} variant="default" size="sm">{f}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--text-3)] font-medium">{log.date}</p>
                    <div className="flex justify-end mt-0.5 font-bold">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={`text-[10px] ${j < log.rating ? 'text-[#d97706]' : 'text-[var(--border-strong)]'}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sleep Tips */}
      <div className="mb-5">
        <SectionHeader title="Sleep Tips" />
        <Card>
          <div className="flex flex-col gap-3">
            {sleepTips.map((t, i) => {
              const TipIcon = t.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center">
                    <TipIcon size={16} className="text-[var(--text-3)]" />
                  </div>
                  <p className="text-xs text-[var(--text-2)] font-medium">{t.tip}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <FAB onClick={() => setIsModalOpen(true)} label="Log Sleep" extended />

      {/* Log Sleep Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Sleep">
        <form onSubmit={handleAddSleepLog} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Bed Time"
              placeholder="e.g. 10:45 PM"
              value={bedTime}
              onChange={e => setBedTime(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Wake Time"
              placeholder="e.g. 6:30 AM"
              value={wakeTime}
              onChange={e => setWakeTime(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sleep Hours"
              placeholder="e.g. 7.75"
              type="number"
              step="0.05"
              value={hours}
              onChange={e => setHours(e.target.value)}
              required
            />
            <Select
              label="Rating"
              value={rating}
              onChange={e => setRating(e.target.value)}
              options={[
                { value: '5', label: '5 Stars - Excellent' },
                { value: '4', label: '4 Stars - Good' },
                { value: '3', label: '3 Stars - Fair' },
                { value: '2', label: '2 Stars - Poor' },
                { value: '1', label: '1 Star - Terrible' },
              ]}
            />
          </div>
          <Select
            label="Sleep Quality"
            value={quality}
            onChange={e => setQuality(e.target.value)}
            options={[
              { value: 'Excellent', label: 'Excellent' },
              { value: 'Good', label: 'Good' },
              { value: 'Fair', label: 'Fair' },
              { value: 'Poor', label: 'Poor' },
            ]}
          />
          <Input
            label="Factors (comma separated)"
            placeholder="e.g. Exercise, Screen, Late Meal, Caffeine"
            value={factors}
            onChange={e => setFactors(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Log Sleep
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
