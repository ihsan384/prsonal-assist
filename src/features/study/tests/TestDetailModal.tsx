import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { TestRecord } from '@/types/study.types'
import { TEST_TYPE_LABELS } from '@/types/study.types'
import { Award, Clock, BookOpen, AlertOctagon, CheckCircle2, XCircle, HelpCircle, Edit3, ArrowRight } from 'lucide-react'

interface TestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  test: TestRecord | null
  onEdit: (test: TestRecord) => void
  onLogMistake: (test: TestRecord) => void
}

export function TestDetailModal({ isOpen, onClose, test, onEdit, onLogMistake }: TestDetailModalProps) {
  const navigate = useNavigate()

  if (!test) return null

  const subjects = studyERPStorage.getSubjects()
  const chapters = studyERPStorage.getChapters()

  const correct = test.correct || 0
  const wrong = test.wrong || 0
  const attempted = test.attempted || (correct + wrong)
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : test.percentage

  const handleReviseWeakAreas = () => {
    onClose()
    const firstSubId = test.subjectResults && test.subjectResults.length > 0 ? test.subjectResults[0].subjectId : undefined
    if (firstSubId) {
      navigate(`/study/revision?subjectId=${firstSubId}`)
    } else {
      navigate('/study/revision')
    }
  }

  const handlePracticeWeakAreas = () => {
    onClose()
    const firstSubId = test.subjectResults && test.subjectResults.length > 0 ? test.subjectResults[0].subjectId : undefined
    if (firstSubId) {
      navigate(`/study/questions?subjectId=${firstSubId}`)
    } else {
      navigate('/study/questions')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={test.testName}
      subtitle={`Recorded on ${test.testDate} · ${test.durationMinutes || 0} mins duration`}
    >
      <div className="flex flex-col gap-4 text-left">
        {/* Header tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="accent">{TEST_TYPE_LABELS[test.testType] || test.testType}</Badge>
          {test.examSource && <Badge variant="default">Source: {test.examSource}</Badge>}
          {test.examName && <Badge variant="info">{test.examName}</Badge>}
          {test.rank && <Badge variant="success">Rank: #{test.rank}</Badge>}
          {test.percentile && <Badge variant="warning">{test.percentile} Percentile</Badge>}
        </div>

        {/* Overall score card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--bg-subtle)] p-3.5 rounded-[12px] border border-[var(--border)]">
          <div>
            <span className="text-[10px] text-[var(--text-3)] font-semibold block uppercase">Total Score</span>
            <span className="text-base font-bold text-[var(--text)] mt-0.5 block">
              {test.score} / {test.maxScore}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-3)] font-semibold block uppercase">Percentage</span>
            <span className="text-base font-bold text-[var(--accent)] mt-0.5 block">
              {test.percentage}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-3)] font-semibold block uppercase">Question Accuracy</span>
            <span className="text-base font-bold text-[var(--success)] mt-0.5 block">
              {accuracy}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-3)] font-semibold block uppercase">Total Attempted</span>
            <span className="text-base font-bold text-[var(--text-2)] mt-0.5 block">
              {attempted} Qs
            </span>
          </div>
        </div>

        {/* Subject-wise breakdown */}
        {test.subjectResults && test.subjectResults.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-[var(--text)]">Subject-wise Breakdown</h4>
            <div className="flex flex-col gap-2">
              {test.subjectResults.map(sr => {
                const sub = subjects.find(s => s.id === sr.subjectId)
                const pct = sr.maxScore > 0 ? Math.round((sr.score / sr.maxScore) * 100) : 0
                return (
                  <div key={sr.id} className="flex items-center justify-between p-2.5 bg-[var(--bg-card)] rounded-[8px] border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub?.color || '#3b82f6' }} />
                      <span className="text-xs font-bold text-[var(--text)]">{sub?.name || 'Subject'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[var(--text-2)]">{sr.score} / {sr.maxScore}</span>
                      <Badge variant={pct >= 75 ? 'success' : pct >= 60 ? 'warning' : 'error'}>
                        {pct}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Chapter-wise breakdown */}
        {test.chapterResults && test.chapterResults.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-[var(--text)]">Chapter-wise Performance</h4>
            <div className="flex flex-col gap-2">
              {test.chapterResults.map(cr => {
                const ch = chapters.find(c => c.id === cr.chapterId)
                const maxS = cr.maxScore || 100
                const scoreS = cr.score || 0
                const pct = maxS > 0 ? Math.round((scoreS / maxS) * 100) : 0
                return (
                  <div key={cr.id} className="flex items-center justify-between p-2.5 bg-[var(--bg-card)] rounded-[8px] border border-[var(--border)]">
                    <span className="text-xs font-semibold text-[var(--text)]">{ch?.name || 'Chapter'}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-3)]">{cr.correct || 0} Correct · {cr.wrong || 0} Wrong</span>
                      <Badge variant={pct >= 75 ? 'success' : pct >= 60 ? 'warning' : 'error'}>
                        {pct}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Question counts detail */}
        {(test.correct !== undefined || test.wrong !== undefined || test.unattempted !== undefined) && (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-[var(--text)]">Question Metrics</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-[8px] bg-[var(--bg-subtle)] border border-[var(--border)]">
                <CheckCircle2 size={14} className="text-[var(--success)] shrink-0" />
                <div>
                  <span className="text-[10px] text-[var(--text-3)] block">Correct</span>
                  <span className="text-xs font-bold text-[var(--text)]">{test.correct || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-[8px] bg-[var(--bg-subtle)] border border-[var(--border)]">
                <XCircle size={14} className="text-[var(--error)] shrink-0" />
                <div>
                  <span className="text-[10px] text-[var(--text-3)] block">Wrong</span>
                  <span className="text-xs font-bold text-[var(--text)]">{test.wrong || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-[8px] bg-[var(--bg-subtle)] border border-[var(--border)]">
                <HelpCircle size={14} className="text-[var(--text-3)] shrink-0" />
                <div>
                  <span className="text-[10px] text-[var(--text-3)] block">Unattempted</span>
                  <span className="text-xs font-bold text-[var(--text)]">{test.unattempted || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {test.notes && (
          <div className="flex flex-col gap-1 border-t border-[var(--border)] pt-3">
            <span className="text-[10px] font-bold text-[var(--text-3)] uppercase">Analysis Notes</span>
            <p className="text-xs text-[var(--text-2)] bg-[var(--bg-subtle)] p-2.5 rounded-[8px] border border-[var(--border)]">
              {test.notes}
            </p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-t border-[var(--border)] pt-4 mt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Edit3 size={12} />} onClick={() => { onClose(); onEdit(test) }}>
              Edit
            </Button>
            <Button variant="secondary" size="sm" icon={<AlertOctagon size={12} />} onClick={() => { onClose(); onLogMistake(test) }}>
              Log Mistake
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReviseWeakAreas}>
              Revise
            </Button>
            <Button variant="primary" size="sm" icon={<ArrowRight size={12} />} onClick={handlePracticeWeakAreas}>
              Practice Weak Areas
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
