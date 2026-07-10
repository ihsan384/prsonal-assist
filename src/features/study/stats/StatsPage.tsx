import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
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

  // Dynamic daily stats
  const getDailyStats = (sessionList: StudySession[]) => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toLocaleDateString('en-US', { weekday: 'short' })
      const isoString = date.toDateString()
      const daySessions = sessionList.filter(s => {
        try {
          return new Date(s.date).toDateString() === isoString
        } catch {
          return false
        }
      })
      const hrs = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60
      data.push({
        label: dateString,
        value: Number(hrs.toFixed(1))
      })
    }
    return data
  }

  // Dynamic weekly stats
  const getWeeklyStats = (sessionList: StudySession[]) => {
    const data = []
    const now = new Date()
    for (let w = 3; w >= 0; w--) {
      const start = new Date(now)
      start.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) - (w * 7))
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(start.getDate() + 7)

      const weekSessions = sessionList.filter(s => {
        try {
          const t = new Date(s.date).getTime()
          return t >= start.getTime() && t < end.getTime()
        } catch {
          return false
        }
      })
      const hrs = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60
      data.push({
        label: w === 0 ? 'This Wk' : `${w} wk${w > 1 ? 's' : ''} ago`,
        value: Math.round(hrs)
      })
    }
    return data
  }

  const dailyData = getDailyStats(sessions)
  const weeklyData = getWeeklyStats(sessions)

  const maxDaily = Math.max(...dailyData.map(d => d.value)) || 1
  const maxWeekly = Math.max(...weeklyData.map(w => w.value)) || 1

  const hasData = subjects.length > 0 || sessions.length > 0 || questions.length > 0 || revisions.length > 0

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Study Stats & Analytics" subtitle="Aggregate performance metrics across all subjects and exams" compact />
      </div>

      {/* Row stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
        <MetricCard
          label="Syllabus Completion"
          value={`${avgSyllabusCompletion}%`}
          change={subjects.length > 0 ? { value: subjects.length, label: 'syllabus subjects mapped' } : undefined}
        />
        <MetricCard
          label="Study Hours"
          value={`${totalStudyHours}h`}
          change={sessions.length > 0 ? { value: sessions.length, label: 'sessions logged' } : undefined}
        />
        <MetricCard
          label="Practice Accuracy"
          value={`${avgAccuracy}%`}
          change={totalQuestionsSolved > 0 ? { value: totalQuestionsSolved, label: 'questions solved' } : undefined}
        />
        <MetricCard
          label="Revisions Done"
          value={finishedRevisionsCount}
          change={revisions.filter(r => !r.completed).length > 0 ? { value: revisions.filter(r => !r.completed).length, label: 'remaining revisions' } : undefined}
        />
      </div>

      {!hasData ? (
        <Card className="text-center py-10 mt-5">
          <AlertCircle className="mx-auto text-[var(--text-4)] mb-3 animate-pulse" size={24} />
          <p className="text-sm font-semibold text-[var(--text-2)]">No study data available</p>
          <p className="text-xs text-[var(--text-3)] mt-1">Start mapping syllabus subjects or logging focus sessions to view analysis.</p>
        </Card>
      ) : (
        /* Visual Charts splits */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          
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
                      style={{ height: `${heightPct || 4}%`, opacity: wk.value > 0 ? 1 : 0.2 }}
                    />
                    <span className="text-[10px] text-[var(--text-3)] font-semibold">{wk.label}</span>
                    <span className="text-[9px] text-[var(--text-4)] tabular-nums">{wk.value}h</span>
                  </div>
                )}
              )}
            </div>
          </Card>

          {/* Chapter Syllabus Progress */}
          {subjects.length > 0 && (
            <Card className="md:col-span-2 text-left">
              <SectionHeader title="Syllabus Subject Breakdown" subtitle="Detailed hours and completion percentage per topic category" compact />
              <div className="flex flex-col gap-3.5 mt-2">
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
          )}

        </div>
      )}
    </PageWrapper>
  )
}
