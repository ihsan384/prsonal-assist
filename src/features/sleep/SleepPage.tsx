import { motion } from 'framer-motion'
import { Moon, Sun, Clock, Star, TrendingUp, Plus } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'

const sleepLogs = [
  { id: '1', date: 'Last night', bed: '10:45 PM', wake: '6:00 AM', hours: 7.25, quality: 'Good', rating: 4, factors: ['Exercise'] },
  { id: '2', date: 'Tue', bed: '11:30 PM', wake: '7:00 AM', hours: 7.5, quality: 'Good', rating: 4, factors: [] },
  { id: '3', date: 'Mon', bed: '10:00 PM', wake: '6:00 AM', hours: 8.0, quality: 'Excellent', rating: 5, factors: ['Meditation'] },
  { id: '4', date: 'Sun', bed: '12:00 AM', wake: '8:00 AM', hours: 8.0, quality: 'Fair', rating: 3, factors: ['Screen', 'Caffeine'] },
  { id: '5', date: 'Sat', bed: '1:00 AM', wake: '9:00 AM', hours: 8.0, quality: 'Poor', rating: 2, factors: ['Late Meal', 'Stress'] },
]

const weekData = sleepLogs.map(l => l.hours)
const avgSleep = weekData.reduce((a, b) => a + b, 0) / weekData.length
const sleepGoal = 8

const qualityColors: Record<string, string> = {
  Excellent: '#10b981',
  Good: '#7c6aff',
  Fair: '#f59e0b',
  Poor: '#f43f5e',
}

export default function SleepPage() {
  return (
    <PageWrapper>
      {/* Last Night Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing value={7.25} max={sleepGoal} size={88} strokeWidth={7} color="#8b5cf6">
              <div className="flex flex-col items-center">
                <Moon size={18} className="text-[#8b5cf6]" />
                <span className="text-xs font-bold text-[#f0f0f5]">7.25h</span>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#f0f0f5] mb-2">Last Night</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Moon size={12} className="text-[#55556a]" />
                  <span className="text-xs text-[#8888a0]">Bed: 10:45 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun size={12} className="text-[#f59e0b]" />
                  <span className="text-xs text-[#8888a0]">Wake: 6:00 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={12} className="text-[#7c6aff]" />
                  <Badge variant="violet" size="sm">Good quality</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Avg Sleep', value: `${avgSleep.toFixed(1)}h`, icon: Clock, color: '#8b5cf6' },
          { label: 'This Week', value: '5/7d', icon: Moon, color: '#7c6aff' },
          { label: 'Best Night', value: '8h', icon: TrendingUp, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.06)]">
            <stat.icon size={16} style={{ color: stat.color }} />
            <p className="text-base font-bold text-[#f0f0f5]">{stat.value}</p>
            <p className="text-[10px] text-[#55556a]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="mb-5">
        <SectionHeader title="This Week" subtitle={`Avg ${avgSleep.toFixed(1)}h per night`} />
        <Card>
          <div className="flex items-end gap-2 h-24">
            {sleepLogs.slice().reverse().map((log, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-lg transition-all"
                  style={{
                    height: `${(log.hours / sleepGoal) * 80}px`,
                    backgroundColor: qualityColors[log.quality] ?? '#7c6aff',
                    opacity: 0.7 + (i === sleepLogs.length - 1 ? 0.3 : 0),
                    minHeight: 8,
                  }}
                />
                <span className="text-[9px] text-[#55556a]">{log.date.slice(0, 3)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-3 text-[10px]">
            {Object.entries(qualityColors).map(([q, c]) => (
              <div key={q} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                <span className="text-[#55556a]">{q}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sleep Log History */}
      <div className="mb-5">
        <SectionHeader title="Sleep History" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />}>Log Sleep</Button>
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
                  <div className="w-10 h-10 rounded-xl bg-[rgba(139,92,246,0.15)] flex items-center justify-center flex-shrink-0">
                    <Moon size={18} className="text-[#8b5cf6]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#f0f0f5]">{log.hours}h sleep</p>
                      <Badge size="sm" style={{ backgroundColor: `${qualityColors[log.quality]}15`, color: qualityColors[log.quality] }}>
                        {log.quality}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#55556a] mt-0.5">{log.bed} → {log.wake}</p>
                    {log.factors.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {log.factors.map(f => <Badge key={f} variant="default" size="sm">{f}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#55556a]">{log.date}</p>
                    <div className="flex justify-end mt-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={`text-[10px] ${j < log.rating ? 'text-[#f59e0b]' : 'text-[#252530]'}`}>★</span>
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
            {[
              { icon: '📵', tip: 'Avoid screens 1h before bed' },
              { icon: '☕', tip: 'No caffeine after 2 PM' },
              { icon: '🌡️', tip: 'Keep room temperature cool' },
              { icon: '🧘', tip: 'Try 4-7-8 breathing exercise' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{t.icon}</span>
                <p className="text-xs text-[#8888a0]">{t.tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <FAB onClick={() => {}} />
    </PageWrapper>
  )
}
