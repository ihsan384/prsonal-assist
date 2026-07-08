import { useState, useEffect } from 'react'
import { Card, MetricCard } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { Subject, StudySession, QuestionLog, RevisionEntry } from '@/types/study.types'

export default function StatsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [questions, setQuestions] = useState<QuestionLog[]>([])
  const [revisions, setRevisions] = useState<RevisionEntry[]>([])

  useEffect(() => {
    setSubjects(studyERPStorage.getSubjects())
    setSessions(studyERPStorage.getSessions())
    setQuestions(studyERPStorage.getQuestions())
    setRevisions(studyERPStorage.getRevisions())
  }, [])

  // Aggregate stats
  const totalStudyMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1)

  const totalQuestionsSolved = questions.reduce((sum, q) => sum + q.questionsSolved, 0)
  const totalCorrect = questions.reduce((sum, q) => sum + q.correct, 0)
  const avgAccuracy = totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0

  const finishedRevisionsCount = revisions.filter(r => r.completed).length

  // Derived progress values
  const subjectsCount = subjects.length || 1
  const avgSyllabusCompletion = Math.round(
    subjects.reduce((sum, s) => sum + s.completionPercentage, 0) / subjectsCount
  )

  // Chart data mocks for visual graphs (Linear design - clean borders, no neon)
  const dailyData = [
    { label: 'Mon', value: 3.5 },
    { label: 'Tue', value: 4.2 },
    { label: 'Wed', value: 2.0 },
    { label: 'Thu', value: 5.1 },
    { label: 'Fri', value: 3.8 },
    { label: 'Sat', value: 1.5 },
    { label: 'Sun', value: 0 }
  ]

  const weeklyData = [
    { label: 'Week 1', value: 18 },
    { label: 'Week 2', value: 24 },
    { label: 'Week 3', value: 28 },
    { label: 'Week 4', value: 32 }
  ]

  const maxDaily = Math.max(...dailyData.map(d => d.value)) || 1
  const maxWeekly = Math.max(...weeklyData.map(w => w.value)) || 1

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Study Stats & Analytics" subtitle="Aggregate performance metrics across all subjects and exams" compact />
      </div>

      {/* Row stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Syllabus Completion"
          value={`${avgSyllabusCompletion}%`}
          change={{ value: 2, label: 'completed chapters this week' }}
        />
        <MetricCard
          label="Study Hours"
          value={`${totalStudyHours}h`}
          change={{ value: sessions.length, label: 'sessions logged' }}
        />
        <MetricCard
          label="Practice Accuracy"
          value={`${avgAccuracy}%`}
          change={{ value: totalQuestionsSolved, label: 'questions solved' }}
        />
        <MetricCard
          label="Revisions Done"
          value={finishedRevisionsCount}
          change={{ value: revisions.filter(r => !r.completed).length, label: 'remaining revisions' }}
        />
      </div>

      {/* Visual Charts splits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Daily Study chart */}
        <Card>
          <SectionHeader title="Daily Focus Hours" subtitle="Study hours logged over the last 7 days" compact />
          <div className="flex items-end justify-between gap-1 h-32 pt-4">
            {dailyData.map(day => {
              const heightPct = Math.round((day.value / maxDaily) * 100)
              return (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div 
                    className="w-full max-w-[20px] bg-[var(--accent)] rounded-t-[4px] transition-all"
                    style={{ height: `${heightPct || 4}%`, opacity: day.value > 0 ? 1 : 0.2 }}
                  />
                  <span className="text-[10px] text-[var(--text-3)] font-semibold">{day.label}</span>
                  <span className="text-[9px] text-[var(--text-4)] tabular-nums">{day.value}h</span>
                </div>
              )}
            )}
          </div>
        </Card>

        {/* Weekly Study hours */}
        <Card>
          <SectionHeader title="Weekly Hours Trend" subtitle="Hours log aggregated per week" compact />
          <div className="flex items-end justify-between gap-1 h-32 pt-4">
            {weeklyData.map(wk => {
              const heightPct = Math.round((wk.value / maxWeekly) * 100)
              return (
                <div key={wk.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div 
                    className="w-full max-w-[32px] bg-[var(--info)] rounded-t-[4px] transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-[var(--text-3)] font-semibold">{wk.label}</span>
                  <span className="text-[9px] text-[var(--text-4)] tabular-nums">{wk.value}h</span>
                </div>
              )}
            )}
          </div>
        </Card>

        {/* Chapter Syllabus Progress */}
        <Card className="md:col-span-2">
          <SectionHeader title="Syllabus Subject Breakdown" subtitle="Detailed hours and completion percentage per topic category" compact />
          <div className="flex flex-col gap-3.5">
            {subjects.map(sub => (
              <div key={sub.id}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-[var(--text-2)]">{sub.name}</span>
                  <span className="text-[var(--text-3)]">{sub.completionPercentage}% Complete · {sub.studyHours}h logged</span>
                </div>
                <ProgressBar value={sub.completionPercentage} max={100} height={5} />
              </div>
            ))}
          </div>
        </Card>

      </div>
    </PageWrapper>
  )
}
