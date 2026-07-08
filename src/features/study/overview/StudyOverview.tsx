import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Play } from 'lucide-react'
import { Card, MetricCard } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { Subject, StudySession } from '@/types/study.types'

export default function StudyOverview() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])

  useEffect(() => {
    setSubjects(studyERPStorage.getSubjects())
    setSessions(studyERPStorage.getSessions().slice(-4).reverse())
  }, [])

  const totalHours = subjects.reduce((sum, s) => sum + s.studyHours, 0)
  const totalTarget = subjects.reduce((sum, s) => sum + s.targetHours, 0)
  const totalCompletion = Math.round(
    subjects.reduce((sum, s) => sum + s.completionPercentage, 0) / (subjects.length || 1)
  )

  const activeRevisionsCount = studyERPStorage.getRevisions().filter(r => !r.completed).length
  const totalMistakesCount = studyERPStorage.getMistakes().length

  return (
    <PageWrapper>
      {/* Welcome Banner */}
      <div className="flex justify-between items-center bg-[var(--bg-subtle)] border border-[var(--border)] p-4 rounded-[12px]">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Study ERP Dashboard</h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">Track, plan, and analyze your academic preparation.</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          icon={<Play size={12} />} 
          onClick={() => navigate('/study/sessions/new')}
        >
          Start Timer
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Total Study Hours"
          value={totalHours}
          unit="hrs"
          change={{ value: totalTarget - totalHours, label: 'to reach syllabus target' }}
        />
        <MetricCard
          label="Overall Progress"
          value={`${totalCompletion}%`}
          change={{ value: 2, label: 'increase this week' }}
        />
        <MetricCard
          label="Pending Revisions"
          value={activeRevisionsCount}
          change={{ value: 0, label: 'scheduled today' }}
        />
        <MetricCard
          label="Mistakes Book"
          value={totalMistakesCount}
          change={{ value: 0, label: 'unresolved mistakes' }}
        />
      </div>

      {/* Layout Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Core subjects progress */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <SectionHeader title="Syllabus Completion" compact />
            <Button variant="ghost" size="sm" onClick={() => navigate('/study/subjects')}>
              View all
            </Button>
          </div>
          <Card>
            <div className="flex flex-col gap-4">
              {subjects.map(sub => (
                <div key={sub.id} className="flex flex-col gap-1 cursor-pointer" onClick={() => navigate(`/study/subjects/${sub.id}`)}>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text)]">{sub.name}</span>
                    <span className="text-[var(--text-3)]">{sub.completionPercentage}% Done · {sub.studyHours}/{sub.targetHours}h</span>
                  </div>
                  <ProgressBar value={sub.completionPercentage} max={100} height={6} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Side panels */}
        <div className="flex flex-col gap-5">
          <SectionHeader title="Quick Links" compact />
          <Card padding="none">
            <div className="divide-y divide-[var(--border)] text-xs">
              {[
                { label: 'Mistake Book Log', path: '/study/mistakes', desc: 'Silly/Conceptual mistakes' },
                { label: 'Formula Book Directory', path: '/study/formulas', desc: 'Saved theorems & equations' },
                { label: 'Mock Test Analytics', path: '/study/tests', desc: 'Log mock exams & ranks' },
                { label: 'Question Practice tracker', path: '/study/questions', desc: 'Daily log of solved questions' },
              ].map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(link.path)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--bg-subtle)] transition-all cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-[var(--text)]">{link.label}</p>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowUpRight size={13} className="text-[var(--text-3)]" />
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Session Log */}
          <div>
            <SectionHeader title="Recent Sessions" compact />
            {sessions.length === 0 ? (
              <Card className="text-center py-6 text-xs text-[var(--text-3)]">
                No focus sessions logged yet.
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {sessions.map(sess => {
                  const sub = subjects.find(s => s.id === sess.subjectId)?.name ?? 'Study'
                  return (
                    <div 
                      key={sess.id}
                      className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[var(--text)]">{sub}</p>
                        <p className="text-[10px] text-[var(--text-3)] mt-0.5">{sess.date} · {sess.startTime} · {sess.studyMethod}</p>
                      </div>
                      <Badge variant="accent">{sess.durationMinutes}m</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
