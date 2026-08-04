import { useState, useEffect } from 'react'
import { BookOpen, Clock, Award, CheckCircle2, HelpCircle, Save } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { Subject, Chapter, Topic, StudySession, StudyType } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

interface LogStudyModalProps {
  isOpen: boolean
  onClose: () => void
  initialSubjectId?: string
  initialChapterId?: string
  initialTopicId?: string
  onSaved?: () => void
}

export function LogStudyModal({
  isOpen,
  onClose,
  initialSubjectId,
  initialChapterId,
  initialTopicId,
  onSaved,
}: LogStudyModalProps) {
  const toast = useToast()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [topics, setTopics] = useState<Topic[]>([])

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])

  const [hours, setHours] = useState<string>('0')
  const [minutes, setMinutes] = useState<string>('30')
  const [studyType, setStudyType] = useState<StudyType>('CONCEPT_LEARNING')

  const [questionsAttempted, setQuestionsAttempted] = useState<string>('')
  const [questionsCorrect, setQuestionsCorrect] = useState<string>('')
  const [confidenceRating, setConfidenceRating] = useState<number>(4)
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // 1. Initial Load: Fetch Subjects
  useEffect(() => {
    if (!isOpen) return
    const subs = studyERPStorage.getSubjects().filter(s => s.enabled !== false)
    setSubjects(subs)

    const targetSubId = initialSubjectId || (subs.length > 0 ? subs[0].id : '')
    setSelectedSubjectId(targetSubId)
  }, [isOpen, initialSubjectId])

  // 2. Dependent Effect: Subject -> Chapters
  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([])
      setSelectedChapterId('')
      return
    }

    const chs = studyERPStorage.getChapters(selectedSubjectId)
    setChapters(chs)

    if (initialChapterId && chs.some(c => c.id === initialChapterId)) {
      setSelectedChapterId(initialChapterId)
    } else if (chs.length > 0) {
      setSelectedChapterId(chs[0].id)
    } else {
      setSelectedChapterId('')
    }
  }, [selectedSubjectId, initialChapterId])

  // 3. Dependent Effect: Chapter -> Topics
  useEffect(() => {
    if (!selectedChapterId) {
      setTopics([])
      setSelectedTopicIds([])
      return
    }

    const tps = studyERPStorage.getTopics(selectedChapterId)
    setTopics(tps)

    if (initialTopicId && tps.some(t => t.id === initialTopicId)) {
      setSelectedTopicIds([initialTopicId])
    } else {
      setSelectedTopicIds([])
    }
  }, [selectedChapterId, initialTopicId])

  const toggleTopicSelection = (tId: string) => {
    setSelectedTopicIds(prev =>
      prev.includes(tId) ? prev.filter(id => id !== tId) : [...prev, tId]
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSubjectId) {
      toast.error('Please select a subject.')
      return
    }
    if (!selectedChapterId) {
      toast.error('Please select a chapter.')
      return
    }

    const hNum = Number(hours) || 0
    const mNum = Number(minutes) || 0
    const totalMins = hNum * 60 + mNum

    if (totalMins <= 0) {
      toast.error('Please enter a valid study duration greater than 0 minutes.')
      return
    }

    let attNum: number | undefined
    let corrNum: number | undefined

    if (questionsAttempted.trim()) {
      attNum = Number(questionsAttempted)
      if (isNaN(attNum) || attNum < 0) {
        toast.error('Questions attempted must be a valid non-negative number.')
        return
      }
    }

    if (questionsCorrect.trim()) {
      corrNum = Number(questionsCorrect)
      if (isNaN(corrNum) || corrNum < 0) {
        toast.error('Questions correct must be a valid non-negative number.')
        return
      }
    }

    if (attNum !== undefined && corrNum !== undefined && corrNum > attNum) {
      toast.error('Questions correct cannot be greater than total questions attempted.')
      return
    }

    setIsSubmitting(true)

    try {
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const startTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

      const newSession: StudySession = {
        id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
        topicId: selectedTopicIds[0] || undefined,
        topicIds: selectedTopicIds,
        date: dateStr,
        startTime: startTimeStr,
        endTime: startTimeStr,
        durationMinutes: totalMins,
        studyMethod: studyType === 'CONCEPT_LEARNING' ? 'Reading' : studyType === 'PROBLEM_SOLVING' ? 'Practice' : 'Other',
        studyType,
        source: 'MANUAL',
        focusRating: confidenceRating,
        understandingPercentage: confidenceRating * 20,
        questionsSolved: attNum,
        correctAnswers: corrNum,
        wrongAnswers: attNum !== undefined && corrNum !== undefined ? attNum - corrNum : undefined,
        notes: notes.trim() || undefined,
      }

      studyERPStorage.addSession(newSession)

      // Auto-progress selected topics from NOT_STARTED to LEARNING
      selectedTopicIds.forEach(tId => {
        const top = topics.find(t => t.id === tId)
        if (top && top.status === 'not_started') {
          studyERPStorage.updateTopicStatus(tId, 'learning', confidenceRating * 20)
        }
      })

      // Update chapter study time & completed hours
      const chapter = chapters.find(c => c.id === selectedChapterId)
      if (chapter) {
        const addedHours = Number((totalMins / 60).toFixed(2))
        const updatedCompleted = Number((chapter.completedHours + addedHours).toFixed(2))
        studyERPStorage.saveChapters([
          { ...chapter, completedHours: updatedCompleted, updatedAt: new Date().toISOString() }
        ])
      }

      toast.success(`Logged ${totalMins} minutes of study!`)
      onSaved?.()
      onClose()
    } catch (err) {
      console.error('[LogStudyModal] Error saving session:', err)
      toast.error('Failed to log study session.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Study Session"
      subtitle="Manually record study time, topics covered, and practice metrics"
      size="md"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Subject Select */}
        <div>
          <label className="block font-medium text-[var(--text)] mb-1">Subject *</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)] font-medium"
            required
          >
            <option value="" disabled>Select Subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Chapter Select */}
        <div>
          <label className="block font-medium text-[var(--text)] mb-1">Chapter *</label>
          <select
            value={selectedChapterId}
            onChange={e => setSelectedChapterId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)] font-medium"
            required
            disabled={!selectedSubjectId || chapters.length === 0}
          >
            <option value="" disabled>
              {!selectedSubjectId ? 'Select subject first' : chapters.length === 0 ? 'No chapters found' : 'Select Chapter'}
            </option>
            {chapters.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Topics Selector (Optional) */}
        {topics.length > 0 && (
          <div>
            <label className="block font-medium text-[var(--text)] mb-1">
              Topics Covered (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
              {topics.map(t => {
                const isSelected = selectedTopicIds.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopicSelection(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-2)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Duration Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Hours"
            type="number"
            min="0"
            max="24"
            value={hours}
            onChange={e => setHours(e.target.value)}
          />
          <Input
            label="Minutes"
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
          />
        </div>

        {/* Preset Duration Quick Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase">Presets:</span>
          {[15, 25, 45, 60, 90].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setHours(Math.floor(m / 60).toString())
                setMinutes((m % 60).toString())
              }}
              className="px-2 py-0.5 rounded text-[10px] bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-2)] font-medium"
            >
              {m}m
            </button>
          ))}
        </div>

        {/* Study Type */}
        <div>
          <label className="block font-medium text-[var(--text)] mb-1">Study Type *</label>
          <select
            value={studyType}
            onChange={e => setStudyType(e.target.value as StudyType)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)] font-medium"
          >
            <option value="CONCEPT_LEARNING">📖 Concept Learning</option>
            <option value="PROBLEM_SOLVING">🧩 Problem Solving</option>
            <option value="REVISION">🔄 Revision</option>
            <option value="PYQ_PRACTICE">📝 PYQ Practice</option>
            <option value="LECTURE">🎓 Lecture / Class</option>
            <option value="MOCK_ANALYSIS">📊 Mock Test Analysis</option>
            <option value="SELF_STUDY">💻 Self Study</option>
            <option value="OTHER">⚡ Other</option>
          </select>
        </div>

        {/* Practice Metrics (Optional) */}
        <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl space-y-2">
          <span className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider block">
            Practice Performance (Optional)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Questions Attempted"
              type="number"
              min="0"
              placeholder="e.g. 20"
              value={questionsAttempted}
              onChange={e => setQuestionsAttempted(e.target.value)}
            />
            <Input
              label="Questions Correct"
              type="number"
              min="0"
              placeholder="e.g. 16"
              value={questionsCorrect}
              onChange={e => setQuestionsCorrect(e.target.value)}
            />
          </div>
        </div>

        {/* Confidence Rating (1-5) */}
        <div>
          <label className="block font-medium text-[var(--text)] mb-1">
            Understanding / Confidence (1–5 Scale)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setConfidenceRating(star)}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  confidenceRating === star
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                    : 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text)]'
                }`}
              >
                {star} ★
              </button>
            ))}
          </div>
        </div>

        {/* Session Notes */}
        <Textarea
          label="Session Notes (Optional)"
          placeholder="Key formulas derived, doubts noted, or summary..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
            <Save size={13} className="mr-1" /> Save Study Session
          </Button>
        </div>
      </form>
    </Modal>
  )
}
