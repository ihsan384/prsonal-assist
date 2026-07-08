import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Clock, Zap, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { StudySession, Subject } from '@/types/study.types'

export default function SessionsPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  useEffect(() => {
    setSessions(studyERPStorage.getSessions().reverse())
    setSubjects(studyERPStorage.getSubjects())
  }, [])

  const getSubjectName = (subId: string) => {
    return subjects.find(s => s.id === subId)?.name ?? 'General Study'
  }

  const totalMin = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalHrs = (totalMin / 60).toFixed(1)

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Study Session Logs" subtitle="Verify historical focus periods and logged sessions" compact />
        <Button 
          variant="primary" 
          size="sm" 
          icon={<Plus size={12} />} 
          onClick={() => navigate('/study/sessions/new')}
        >
          New Session
        </Button>
      </div>

      {/* Overview widget cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] flex items-center gap-3">
          <BookOpen size={16} className="text-[var(--accent)]" />
          <div>
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Total Sessions</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{sessions.length} sessions</span>
          </div>
        </div>
        <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] flex items-center gap-3">
          <Clock size={16} className="text-[var(--success)]" />
          <div>
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Focus Hours</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{totalHrs} hrs</span>
          </div>
        </div>
        <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] flex items-center gap-3">
          <Zap size={16} className="text-[var(--warning)]" />
          <div>
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Avg Duration</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">
              {sessions.length > 0 ? Math.round(totalMin / sessions.length) : 0} mins
            </span>
          </div>
        </div>
      </div>

      {/* History table list */}
      <div>
        <SectionHeader title="Log History" />
        
        {sessions.length === 0 ? (
          <Card className="text-center py-10">
            <BookOpen className="mx-auto text-[var(--text-4)] mb-3" size={24} />
            <p className="text-sm font-semibold text-[var(--text-2)]">No sessions logged yet</p>
            <p className="text-xs text-[var(--text-3)] mt-1 mb-4">Start a focus timer to log your first academic session.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/study/sessions/new')}>
              Start Live Timer
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map(sess => (
              <Card key={sess.id}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[var(--text)]">{getSubjectName(sess.subjectId)}</h4>
                      <Badge variant="accent" size="sm">{sess.studyMethod}</Badge>
                    </div>
                    <p className="text-[10px] text-[var(--text-3)] mt-1">{sess.date} · {sess.startTime} to {sess.endTime} ({sess.durationMinutes} mins)</p>
                    {sess.notes && (
                      <p className="text-xs text-[var(--text-2)] mt-2 bg-[var(--bg-subtle)] p-2 rounded-[8px] border border-[var(--border)] max-w-xl">
                        {sess.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[var(--text-3)] font-semibold block">Focus Rating</span>
                    <div className="flex items-center justify-end gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={9} 
                          className={i < sess.focusRating ? 'text-[var(--warning)] fill-[var(--warning)]' : 'text-[var(--text-4)]'} 
                        />
                      ))}
                    </div>
                    {sess.questionsSolved !== undefined && sess.questionsSolved > 0 && (
                      <span className="text-[9px] text-[var(--text-3)] block mt-1.5 font-semibold">
                        Solved: {sess.correctAnswers}/{sess.questionsSolved} Correct
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
