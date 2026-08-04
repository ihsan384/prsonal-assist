import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Play, Clock, BookOpen, Target, CheckCircle2, Award } from 'lucide-react'
import { Card, MetricCard } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { LogStudyModal } from '@/components/study/LogStudyModal'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { testAnalyticsService } from '@/services/study/testAnalytics.service'
import type { Subject, Chapter, Topic, StudySession } from '@/types/study.types'
import { useMemoryStoreUpdate } from '@/hooks/useMemoryStoreUpdate'

export default function StudyOverview() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [lastStudied, setLastStudied] = useState<{
    subject?: Subject
    chapter?: Chapter
    topic?: Topic
    lastDate?: string
  } | null>(null)

  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  const loadData = () => {
    const subs = studyERPStorage.getSubjects().filter(s => s.enabled !== false)
    setSubjects(subs)

    const allSessions = studyERPStorage.getSessions()
    allSessions.sort((a, b) => new Date(b.date + ' ' + (b.startTime || '00:00')).getTime() - new Date(a.date + ' ' + (a.startTime || '00:00')).getTime())
    setSessions(allSessions.slice(0, 5))

    // Derive "Continue Studying" targets
    if (allSessions.length > 0) {
      const last = allSessions[0]
      const sub = subs.find(s => s.id === last.subjectId)
      const chs = studyERPStorage.getChapters()
      const ch = chs.find(c => c.id === last.chapterId)
      const tps = studyERPStorage.getTopics()
      const tp = tps.find(t => t.id === last.topicId)

      setLastStudied({
        subject: sub,
        chapter: ch,
        topic: tp,
        lastDate: last.date
      })
    } else if (subs.length > 0) {
      const chs = studyERPStorage.getChapters(subs[0].id)
      setLastStudied({
        subject: subs[0],
        chapter: chs[0],
        lastDate: 'Not started yet'
      })
    }
  }

  useMemoryStoreUpdate()

  useEffect(() => {
    loadData()
  })

  // Multi-dimensional metrics calculation
  const allSessions = studyERPStorage.getSessions()
  const totalMins = allSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
  const totalStudyTimeFmt = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`

  const totalAttempted = allSessions.reduce((acc, s) => acc + (s.questionsSolved || 0), 0)
  const totalCorrect = allSessions.reduce((acc, s) => acc + (s.correctAnswers || 0), 0)
  const accuracyPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  const activeRevisionsCount = studyERPStorage.getRevisions().filter(r => !r.completed).length
  const totalMistakesCount = studyERPStorage.getMistakes().length

  // Overall Coverage %
  const allChapters = studyERPStorage.getChapters()
  const coveredChaptersCount = allChapters.filter(c => {
    const topics = studyERPStorage.getTopics(c.id)
    if (topics.length > 0) {
      const covered = topics.filter(t => t.status === 'practicing' || t.status === 'mastered').length
      return (covered / topics.length) >= 0.8
    }
    return c.status === 'completed'
  }).length

  const overallCoveragePct = allChapters.length > 0 ? Math.round((coveredChaptersCount / allChapters.length) * 100) : 0

  return (
    <PageWrapper>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[var(--bg-subtle)] border border-[var(--border)] p-4 rounded-2xl gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Study ERP Dashboard</h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">Stream curriculum, topic progress, focus sessions, and practice engine.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLogModalOpen(true)}
          >
            + Log Study
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Play size={12} fill="white" />} 
            onClick={() => navigate('/study/pomodoro')}
          >
            Start Focus
          </Button>
        </div>
      </div>

      {/* "Continue Studying" Quick Action Widget */}
      {lastStudied?.subject && (
        <Card padding="md" className="border-[var(--accent)]/30 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold shrink-0">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider block">
                  Continue Studying
                </span>
                <h3 className="text-sm font-bold text-[var(--text)] mt-0.5">
                  {lastStudied.subject.name}
                  {lastStudied.chapter ? ` • ${lastStudied.chapter.name}` : ''}
                </h3>
                <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                  {lastStudied.topic ? `Topic: ${lastStudied.topic.name}` : 'Next chapter topic ready for focus'}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Play size={13} fill="white" />}
              onClick={() => {
                const url = `/study/pomodoro?subjectId=${lastStudied.subject?.id}&chapterId=${lastStudied.chapter?.id || ''}&topicId=${lastStudied.topic?.id || ''}`
                navigate(url)
              }}
              className="shrink-0"
            >
              Resume Session
            </Button>
          </div>
        </Card>
      )}

      {/* Multi-Dimensional Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Total Study Time"
          value={totalStudyTimeFmt}
          unit="logged"
          change={{ value: allSessions.length, label: 'total focus sessions' }}
        />
        <MetricCard
          label="Syllabus Coverage"
          value={`${overallCoveragePct}%`}
          change={{ value: coveredChaptersCount, label: `of ${allChapters.length} chapters covered` }}
        />
        <MetricCard
          label="Practice Accuracy"
          value={totalAttempted > 0 ? `${accuracyPct}%` : 'N/A'}
          change={{ value: totalAttempted, label: 'questions attempted' }}
        />
        <MetricCard
          label="Scheduled Revisions"
          value={activeRevisionsCount}
          change={{ value: totalMistakesCount, label: 'mistakes logged' }}
        />
      </div>

      {/* Layout Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Core subjects progress */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <SectionHeader title="Active Stream Subjects" compact />
            <Button variant="ghost" size="sm" onClick={() => navigate('/study/subjects')}>
              View all
            </Button>
          </div>
          <Card>
            <div className="flex flex-col gap-4">
              {subjects.map(sub => {
                const subChapters = studyERPStorage.getChapters(sub.id)
                const covered = subChapters.filter(c => {
                  const tps = studyERPStorage.getTopics(c.id)
                  if (tps.length > 0) return (tps.filter(t => t.status === 'practicing' || t.status === 'mastered').length / tps.length) >= 0.8
                  return c.status === 'completed'
                }).length
                const covPct = subChapters.length > 0 ? Math.round((covered / subChapters.length) * 100) : 0

                return (
                  <div key={sub.id} className="flex flex-col gap-1.5 cursor-pointer" onClick={() => navigate(`/study/subjects/${sub.id}`)}>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--text)]">{sub.name}</span>
                      <span className="text-[var(--text-3)]">{covPct}% Coverage · {covered}/{subChapters.length} Chapters</span>
                    </div>
                    <ProgressBar value={covPct} max={100} height={6} />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Side panels */}
        <div className="flex flex-col gap-5 text-left">
          {/* Recent Test Summary Card */}
          {(() => {
            const allTests = studyERPStorage.getTests()
            if (allTests.length === 0) return null
            const latestTest = allTests.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())[0]
            return (
              <div>
                <SectionHeader title="Recent Test Performance" compact />
                <Card padding="md" className="mt-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[var(--text)]">{latestTest.testName}</span>
                    <Badge variant={latestTest.percentage >= 75 ? 'success' : latestTest.percentage >= 60 ? 'warning' : 'error'}>
                      {latestTest.percentage}%
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[var(--text-3)]">
                    Score: <strong className="text-[var(--text)]">{latestTest.score}/{latestTest.maxScore}</strong> · {latestTest.testDate}
                  </p>
                  <Button variant="ghost" size="sm" className="self-end mt-1 text-[11px]" onClick={() => navigate('/study/tests')}>
                    View Test Analytics →
                  </Button>
                </Card>
              </div>
            )
          })()}

          <SectionHeader title="Quick Links" compact />
          <Card padding="none">
            <div className="divide-y divide-[var(--border)] text-xs">
              {[
                { label: 'Mistake Book Log', path: '/study/mistakes', desc: 'Silly & Conceptual mistakes' },
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
                      className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[var(--text)]">{sub}</p>
                        <p className="text-[10px] text-[var(--text-3)] mt-0.5">{sess.date} · {sess.durationMinutes} min ({sess.source || 'Session'})</p>
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

      {/* Log Study Modal */}
      <LogStudyModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaved={loadData}
      />
    </PageWrapper>
  )
}
