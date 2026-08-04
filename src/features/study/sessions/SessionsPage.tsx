import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Clock, Zap, Star, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { StudySession, Subject } from '@/types/study.types'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'

import { LogStudyModal } from '@/components/study/LogStudyModal'

export default function SessionsPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)

  const reloadSessions = () => {
    setSessions(studyERPStorage.getSessions().reverse())
  }

  useEffect(() => {
    reloadSessions()
    setSubjects(studyERPStorage.getSubjects())
  }, [])

  const getSubjectName = (subId: string) => {
    return subjects.find(s => s.id === subId)?.name ?? 'General Study'
  }

  const handleDeleteClick = (id: string) => {
    setSessionToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      studyERPStorage.removeSession(sessionToDelete)
      reloadSessions()
    }
    setIsDeleteOpen(false)
    setSessionToDelete(null)
  }

  const totalMin = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalHrs = (totalMin / 60).toFixed(1)

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Study Session Logs" subtitle="Verify historical focus periods and logged sessions" compact />
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
            icon={<Plus size={12} />} 
            onClick={() => navigate('/study/sessions/new')}
          >
            New Session
          </Button>
        </div>
      </div>

      <LogStudyModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaved={reloadSessions}
      />

      {/* Overview widget cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] flex items-center gap-3">
          <BookOpen size={16} className="text-[var(--accent)]" />
          <div className="text-left">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Total Sessions</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{sessions.length} sessions</span>
          </div>
        </div>
        <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] flex items-center gap-3">
          <Clock size={16} className="text-[var(--success)]" />
          <div className="text-left">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Focus Hours</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{totalHrs} hrs</span>
          </div>
        </div>
        <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] flex items-center gap-3">
          <Zap size={16} className="text-[var(--warning)]" />
          <div className="text-left">
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
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[var(--text)]">{getSubjectName(sess.subjectId)}</h4>
                      <Badge variant="accent" size="sm">{sess.studyMethod}</Badge>
                    </div>
                    <p className="text-[10px] text-[var(--text-3)] mt-1">{sess.date} · {sess.startTime} to {sess.endTime} ({sess.durationMinutes} mins)</p>
                    {sess.notes && (
                      <p className="text-xs text-[var(--text-2)] mt-2 bg-[var(--bg-subtle)] p-2 rounded-[8px] border border-[var(--border)] max-w-xl break-words">
                        {sess.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0 text-right">
                    <div>
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
                    </div>
                    {sess.questionsSolved !== undefined && sess.questionsSolved > 0 && (
                      <span className="text-[9px] text-[var(--text-3)] block mt-0.5 font-semibold">
                        Solved: {sess.correctAnswers}/{sess.questionsSolved} Correct
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(sess.id) }}
                      className="text-[var(--text-4)] hover:text-[var(--error)] p-1 transition-colors mt-1"
                      title="Delete Session"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSessionToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Study Session"
        description="Are you sure you want to permanently delete this study focus session log?"
      />
    </PageWrapper>
  )
}
