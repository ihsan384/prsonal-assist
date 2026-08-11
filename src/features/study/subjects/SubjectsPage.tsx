import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Book, ChevronRight, Settings, GraduationCap, CheckCircle2,
  AlertCircle, RefreshCw, Sparkles, Layers, BookOpen, Atom, FlaskConical,
  Calculator, Code, Dna, Receipt, Briefcase, TrendingUp, Laptop, Landmark,
  Building2, Users, Archive
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { curriculumService } from '@/services/curriculum/curriculumService'
import { useAuth } from '@/contexts/AuthContext'
import type { Subject, Board, AcademicStream, SubjectCombination, MasterSubject } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'
import { useMemoryStoreUpdate } from '@/hooks/useMemoryStoreUpdate'
import { LogStudyModal } from '@/components/study/LogStudyModal'

export default function SubjectsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, profile, refreshProfile } = useAuth()

  const [subjects, setSubjects] = useState<any[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  // Custom Subject state
  const [newSubName, setNewSubName] = useState('')
  const [newSubTarget, setNewSubTarget] = useState('40')

  // Academic Change Stream Dependent State
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<string>('')
  const [classLevel, setClassLevel] = useState<string>('Plus One')
  const [streams, setStreams] = useState<AcademicStream[]>([])
  const [selectedStreamId, setSelectedStreamId] = useState<string>('')
  const [combinations, setCombinations] = useState<SubjectCombination[]>([])
  const [selectedCombinationId, setSelectedCombinationId] = useState<string>('')
  const [academicGoal, setAcademicGoal] = useState<string>('Boards')
  const [previewSubjects, setPreviewSubjects] = useState<MasterSubject[]>([])
  const [isUpdatingStream, setIsUpdatingStream] = useState(false)

  const loadData = () => {
    const all = studyERPStorage.getSubjects()
    const computed = all.map(sub => {
      const chapters = studyERPStorage.getChapters(sub.id)
      const totalChapters = chapters.length

      const coveredChapters = chapters.filter(c => {
        const topics = studyERPStorage.getTopics(c.id)
        if (topics.length > 0) {
          const coveredCount = topics.filter(t => t.status === 'practicing' || t.status === 'mastered').length
          return (coveredCount / topics.length) >= 0.8
        }
        return c.status === 'completed'
      }).length

      const masteredChapters = chapters.filter(c => {
        const topics = studyERPStorage.getTopics(c.id)
        if (topics.length > 0) {
          return topics.every(t => t.status === 'mastered')
        }
        return c.status === 'completed'
      }).length

      const sessions = studyERPStorage.getSessions().filter(s => s.subjectId === sub.id)
      const totalMins = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
      const studyTimeFmt = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`

      const totalAttempted = sessions.reduce((acc, s) => acc + (s.questionsSolved || 0), 0)
      const totalCorrect = sessions.reduce((acc, s) => acc + (s.correctAnswers || 0), 0)
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

      const coveragePct = totalChapters > 0 ? Math.round((coveredChapters / totalChapters) * 100) : 0

      return {
        ...sub,
        completedChapters: coveredChapters,
        pendingChapters: totalChapters - coveredChapters,
        masteredChapters,
        totalChapters,
        studyTimeFmt,
        totalAttempted,
        accuracy,
        completionPercentage: coveragePct
      }
    })
    setSubjects(computed)
  }

  useMemoryStoreUpdate()

  useEffect(() => {
    loadData()
  }, [])

  // Populate Change Stream modal selectors
  useEffect(() => {
    curriculumService.getBoards().then(bList => {
      setBoards(bList)
      if (profile?.board_id) {
        setSelectedBoardId(profile.board_id)
      } else if (bList.length > 0) {
        setSelectedBoardId(bList[0].id)
      }
    })

    if (profile?.class_level) setClassLevel(profile.class_level)
    if (profile?.academic_goal) setAcademicGoal(profile.academic_goal)
  }, [profile])

  // Dependent Effect: Board & Class -> Streams
  useEffect(() => {
    if (!selectedBoardId) return
    curriculumService.getStreams(selectedBoardId, classLevel).then(sList => {
      setStreams(sList)
      if (profile?.stream_id && sList.some(s => s.id === profile.stream_id)) {
        setSelectedStreamId(profile.stream_id)
      } else if (sList.length > 0) {
        setSelectedStreamId(sList[0].id)
      } else {
        setSelectedStreamId('')
      }
    })
  }, [selectedBoardId, classLevel, profile])

  // Dependent Effect: Stream -> Combinations
  useEffect(() => {
    if (!selectedStreamId) return
    curriculumService.getCombinations(selectedStreamId).then(cList => {
      setCombinations(cList)
      if (profile?.subject_combination_id && cList.some(c => c.id === profile.subject_combination_id)) {
        setSelectedCombinationId(profile.subject_combination_id)
      } else if (cList.length > 0) {
        setSelectedCombinationId(cList[0].id)
      } else {
        setSelectedCombinationId('')
      }
    })
  }, [selectedStreamId, profile])

  // Dependent Effect: Combination -> Preview Subjects
  useEffect(() => {
    if (!selectedCombinationId) {
      setPreviewSubjects([])
      return
    }
    curriculumService.getCombinationSubjects(selectedCombinationId).then(subs => {
      setPreviewSubjects(subs)
    })
  }, [selectedCombinationId])

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubName.trim()) {
      toast.error('Please enter a subject name.')
      return
    }

    const sub: Subject = {
      id: `sub-custom-${Date.now()}`,
      name: newSubName.trim(),
      studyHours: 0,
      targetHours: Number(newSubTarget) || 40,
      completedChapters: 0,
      pendingChapters: 0,
      completionPercentage: 0,
      enabled: true,
    }

    studyERPStorage.addSubject(sub)
    loadData()
    setNewSubName('')
    setIsAddModalOpen(false)
    toast.success('Custom subject added.')
  }

  const handleApplyStreamChange = async () => {
    if (!selectedBoardId || !selectedStreamId || !selectedCombinationId) {
      toast.error('Please complete all academic choices.')
      return
    }

    setIsUpdatingStream(true)
    toast.info('Updating curriculum...')

    try {
      const userId = user?.id || profile?.id || 'guest'

      const result = await curriculumService.applyAcademicSetup({
        userId,
        boardId: selectedBoardId,
        classLevel,
        streamId: selectedStreamId,
        combinationId: selectedCombinationId,
        academicGoal
      })

      await refreshProfile()
      loadData()
      setIsStreamModalOpen(false)
      toast.success(`Stream updated! (${result.addedCount} new subjects added, progress preserved)`)
    } catch (err) {
      console.error('[SubjectsPage] Failed to change stream:', err)
      toast.error('Failed to change stream. Please try again.')
    } finally {
      setIsUpdatingStream(false)
    }
  }

  // Active vs Inactive Filter
  const activeSubjects = subjects.filter(s => s.enabled !== false)
  const archivedSubjects = subjects.filter(s => s.enabled === false)

  const boardObj = boards.find(b => b.id === (profile?.board_id || selectedBoardId))
  const streamObj = streams.find(s => s.id === (profile?.stream_id || selectedStreamId))
  const combObj = combinations.find(c => c.id === (profile?.subject_combination_id || selectedCombinationId))

  return (
    <PageWrapper>
      {/* Header Banner */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SectionHeader
            title="Syllabus & Core Subjects"
            subtitle="Automatically configured academic curriculum & progress tracking"
            compact
          />

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsLogModalOpen(true)}
            >
              + Log Study
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Settings size={13} />}
              onClick={() => setIsStreamModalOpen(true)}
            >
              Change Stream
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Custom
            </Button>
          </div>
        </div>

        {/* Academic Profile Info Badge */}
        <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <GraduationCap size={16} />
            </div>
            <div>
              <span className="font-bold text-[var(--text)] block">
                {boardObj?.name || 'Academic Board'}
              </span>
              <span className="text-[11px] text-[var(--text-3)]">
                {profile?.class_level || classLevel} • {streamObj?.name || 'Science'} ({combObj?.name || 'Core'})
              </span>
            </div>
          </div>
          {profile?.academic_goal && (
            <Badge variant="violet" className="self-start sm:self-auto">
              Goal: {profile.academic_goal}
            </Badge>
          )}
        </div>
      </div>

      {/* Grid of Active Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeSubjects.map(sub => (
          <Card
            key={sub.id}
            hover
            className="flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: sub.color || '#4f46e5' }}
                  >
                    <Book size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">{sub.name}</h3>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">
                      {sub.code ? `${sub.code} • Syllabus Item` : 'Syllabus Item'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[var(--accent)] block">{sub.completionPercentage}%</span>
                  <span className="text-[9px] text-[var(--text-4)] block font-medium">Coverage</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <ProgressBar value={sub.completionPercentage} max={100} height={6} />
              </div>

              {/* Multi-Dimensional Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[var(--border)] text-center text-xs">
                <div>
                  <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Study Time</span>
                  <span className="font-semibold text-[var(--accent)] block mt-0.5">{sub.studyTimeFmt}</span>
                </div>
                <div>
                  <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Chapters</span>
                  <span className="font-semibold text-[var(--text)] block mt-0.5">{sub.completedChapters}/{sub.totalChapters}</span>
                </div>
                <div>
                  <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Mastered</span>
                  <span className="font-semibold text-[var(--success)] block mt-0.5">{sub.masteredChapters}</span>
                </div>
                <div>
                  <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Accuracy</span>
                  <span className="font-semibold text-emerald-400 block mt-0.5">{sub.totalAttempted > 0 ? `${sub.accuracy}%` : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/study/pomodoro?subjectId=${sub.id}`)
                }}
              >
                Continue Studying
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/study/subjects/${sub.id}`)}
              >
                <span>View Subject</span>
                <ChevronRight size={13} className="ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Log Study Modal */}
      <LogStudyModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaved={loadData}
      />

      {/* Archived / Inactive Subjects (if stream changed previously) */}
      {archivedSubjects.length > 0 && (
        <div className="mt-8 space-y-3">
          <SectionHeader
            title={`Archived Subjects (${archivedSubjects.length})`}
            subtitle="Previous stream subjects (progress, notes, and study sessions preserved)"
            compact
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-75">
            {archivedSubjects.map(sub => (
              <Card
                key={sub.id}
                onClick={() => navigate(`/study/subjects/${sub.id}`)}
                className="flex items-center justify-between p-3.5 border-dashed border-[var(--border)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-3)] flex items-center justify-center">
                    <Archive size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text)]">{sub.name}</h4>
                    <p className="text-[10px] text-[var(--text-3)]">
                      Archived • {sub.classLevel || 'Previous Class'} • {sub.completedChapters} Chapters Done
                    </p>
                  </div>
                </div>
                <Badge variant="warning">History Saved</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Change Stream & Academic Settings */}
      <Modal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        title="Change Academic Stream"
        subtitle="Update board, class level, or subject combination with full data preservation."
      >
        <div className="space-y-4 text-left">
          {/* Board Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-2)]">Board</label>
            <select
              value={selectedBoardId}
              onChange={e => setSelectedBoardId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)]"
            >
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Class Level Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-2)]">Class / Grade Level</label>
            <div className="grid grid-cols-2 gap-2">
              {['Plus One', 'Plus Two', 'Class 11', 'Class 12'].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setClassLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    classLevel === lvl
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-bold'
                      : 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-3)]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Stream Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-2)]">Academic Stream</label>
            <select
              value={selectedStreamId}
              onChange={e => setSelectedStreamId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)]"
            >
              {streams.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* Combination Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-2)]">Subject Combination</label>
            <select
              value={selectedCombinationId}
              onChange={e => setSelectedCombinationId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)]"
            >
              {combinations.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Live Subject Preview Breakdown */}
          {(() => {
            const previewIds = new Set(previewSubjects.map(s => s.id))
            const currentActiveIds = new Set(activeSubjects.map(s => s.subjectId || s.id))

            const retained = previewSubjects.filter(s => currentActiveIds.has(s.id))
            const added = previewSubjects.filter(s => !currentActiveIds.has(s.id))
            const toArchive = activeSubjects.filter(s => !previewIds.has(s.subjectId || s.id))

            return (
              <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl space-y-2 text-xs">
                <span className="text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wider block">
                  Stream Change Preview ({previewSubjects.length} Target Subjects)
                </span>

                {retained.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-emerald-400 block">Retained Subjects ({retained.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {retained.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          ✓ {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {added.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-indigo-400 block">New Subjects Added ({added.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {added.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                          + {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {toArchive.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-amber-400 block">Archived (Progress Preserved) ({toArchive.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {toArchive.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          🔒 {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStreamModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyStreamChange}
              disabled={isUpdatingStream}
            >
              Apply & Update Stream
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Add Custom Subject */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Custom Subject"
        subtitle="Introduce an extra custom syllabus target to track."
      >
        <form onSubmit={handleAddCustomSubject} className="flex flex-col gap-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Environmental Science, General Knowledge"
            value={newSubName}
            onChange={e => setNewSubName(e.target.value)}
          />
          <Input
            label="Target Hours Goal"
            type="number"
            placeholder="e.g. 40"
            value={newSubTarget}
            onChange={e => setNewSubTarget(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Custom Subject
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
