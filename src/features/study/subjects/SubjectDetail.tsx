import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, BookOpen, ArrowLeft, Play, Clock, Target, CheckCircle2, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { LogStudyModal } from '@/components/study/LogStudyModal'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { testAnalyticsService } from '@/services/study/testAnalytics.service'
import { curriculumService } from '@/services/curriculum/curriculumService'
import type { Subject, Chapter, StudySession } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function SubjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newChName, setNewChName] = useState('')
  const [newChPriority, setNewChPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [newChDifficulty, setNewChDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [newChEstHours, setNewChEstHours] = useState('10')
  const [newChNotes, setNewChNotes] = useState('')

  const loadData = () => {
    const subs = studyERPStorage.getSubjects()
    const match = subs.find(s => s.id === id)
    if (match) {
      setSubject(match)
      const chs = studyERPStorage.getChapters(match.id)
      
      if (chs.length === 0) {
        const masterSubId = match.subjectId || match.code?.toLowerCase() || match.id
        const targetClass = match.classLevel || 'Plus One'
        const targetBoard = match.boardId || 'board-plus-one'

        curriculumService.getMasterChapters(masterSubId, targetBoard, targetClass).then(mChs => {
          if (mChs.length > 0) {
            const newChapters: Chapter[] = mChs.map(mCh => ({
              id: `ch-${match.id}-${mCh.chapterNumber}-${Math.random().toString(36).substring(2, 8)}`,
              subjectId: match.id,
              name: `${mCh.chapterNumber}. ${mCh.chapterName}`,
              chapterNumber: mCh.chapterNumber,
              sectionName: mCh.sectionName,
              bookPart: mCh.bookPart,
              sortOrder: mCh.sortOrder || mCh.chapterNumber,
              priority: 'medium',
              difficulty: 'medium',
              status: 'not_started',
              estimatedHours: mCh.estimatedHours || 6,
              completedHours: 0,
              notes: '',
              revisionCount: 0,
              confidencePercentage: 0,
            }))
            studyERPStorage.saveChapters(newChapters)
            setChapters(newChapters)
          } else {
            setChapters([])
          }
        })
      } else {
        setChapters(chs)
      }

      const sess = studyERPStorage.getSessions().filter(s => s.subjectId === match.id)
      setSessions(sess)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (!subject) {
    return (
      <PageWrapper>
        <div className="text-center py-12 text-sm text-[var(--text-3)]">
          Subject not found.
        </div>
      </PageWrapper>
    )
  }

  // Multi-dimensional metrics calculation
  const totalChapters = chapters.length

  const chapterMetrics = chapters.map(ch => {
    const topics = studyERPStorage.getTopics(ch.id)
    const totalT = topics.length
    const coveredT = topics.filter(t => t.status === 'practicing' || t.status === 'mastered').length
    const masteredT = topics.filter(t => t.status === 'mastered').length
    const isMastered = totalT > 0 ? masteredT === totalT : ch.status === 'completed'
    const isCovered = totalT > 0 ? (coveredT / totalT) >= 0.8 : ch.status === 'completed'
    const covPct = totalT > 0 ? Math.round((coveredT / totalT) * 100) : ch.status === 'completed' ? 100 : ch.status === 'in_progress' ? 50 : 0

    return {
      chapter: ch,
      totalTopics: totalT,
      coveredTopics: coveredT,
      masteredTopics: masteredT,
      isCovered,
      isMastered,
      coveragePct: covPct
    }
  })

  const coveredChaptersCount = chapterMetrics.filter(m => m.isCovered).length
  const masteredChaptersCount = chapterMetrics.filter(m => m.isMastered).length

  const totalSessionMins = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
  const studyHoursFmt = totalSessionMins >= 60 ? `${Math.floor(totalSessionMins / 60)}h ${totalSessionMins % 60}m` : `${totalSessionMins}m`

  const totalAttempted = sessions.reduce((acc, s) => acc + (s.questionsSolved || 0), 0)
  const totalCorrect = sessions.reduce((acc, s) => acc + (s.correctAnswers || 0), 0)
  const accuracyPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  const overallCoveragePct = totalChapters > 0
    ? Math.round(chapterMetrics.reduce((acc, m) => acc + m.coveragePct, 0) / totalChapters)
    : 0

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChName.trim()) {
      toast.error('Please enter a chapter name.')
      return
    }

    const ch: Chapter = {
      id: `ch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subjectId: subject.id,
      name: newChName.trim(),
      priority: newChPriority,
      difficulty: newChDifficulty,
      status: 'not_started',
      estimatedHours: Number(newChEstHours) || 8,
      completedHours: 0,
      notes: newChNotes.trim(),
      revisionCount: 0,
      confidencePercentage: 0
    }

    studyERPStorage.addChapter(ch)
    loadData()
    setNewChName('')
    setNewChNotes('')
    setIsModalOpen(false)
    toast.success('Chapter added to syllabus.')
  }

  const priorityBadge = (pri: Chapter['priority']) => {
    switch (pri) {
      case 'low': return <Badge variant="default" size="sm">Low</Badge>
      case 'medium': return <Badge variant="info" size="sm">Medium</Badge>
      case 'high': return <Badge variant="warning" size="sm">High</Badge>
      case 'urgent': return <Badge variant="error" size="sm">Urgent</Badge>
    }
  }

  const difficultyBadge = (diff: Chapter['difficulty']) => {
    switch (diff) {
      case 'easy': return <Badge variant="success" size="sm">Easy</Badge>
      case 'medium': return <Badge variant="info" size="sm">Medium</Badge>
      case 'hard': return <Badge variant="error" size="sm">Hard</Badge>
    }
  }

  return (
    <PageWrapper>
      {/* Back to Subjects */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<ArrowLeft size={13} />} 
          onClick={() => navigate('/study/subjects')}
          className="-ml-2 text-[var(--text-3)]"
        >
          Syllabus Subjects
        </Button>

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
            onClick={() => navigate(`/study/pomodoro?subjectId=${subject.id}`)}
          >
            Start Study
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">{subject.name}</h1>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Syllabus breakdown, topic progress & practice accuracy</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Plus size={12} />} 
            onClick={() => setIsModalOpen(true)}
          >
            Add Chapter
          </Button>
        </div>

        {/* Multi-Dimensional Subject Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Coverage %</span>
            <span className="font-bold text-[var(--accent)] text-sm block mt-0.5">{overallCoveragePct}%</span>
          </div>
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Study Time</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{studyHoursFmt}</span>
          </div>
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Covered Chapters</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{coveredChaptersCount}/{totalChapters}</span>
          </div>
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Mastered Chapters</span>
            <span className="font-bold text-[var(--success)] text-sm block mt-0.5">{masteredChaptersCount} Done</span>
          </div>
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Practice Accuracy</span>
            <span className="font-bold text-emerald-400 text-sm block mt-0.5">{totalAttempted > 0 ? `${accuracyPct}%` : 'N/A'}</span>
          </div>
        </div>

        {/* Test Performance Section */}
        {(() => {
          const allTests = studyERPStorage.getTests()
          const subAnalytics = testAnalyticsService.getSubjectAnalytics(allTests, subject.id)
          return (
            <div className="mt-4 text-left">
              <div className="flex justify-between items-center mb-2">
                <SectionHeader title="Test Performance" compact />
                <Button variant="ghost" size="sm" onClick={() => navigate('/study/tests')}>
                  View All Tests
                </Button>
              </div>

              <Card className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase block">Tests Taken</span>
                    <span className="text-sm font-bold text-[var(--text)] mt-0.5 block">{subAnalytics.testsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase block">Average Score</span>
                    <span className="text-sm font-bold text-[var(--accent)] mt-0.5 block">{subAnalytics.avgScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase block">Best Score</span>
                    <span className="text-sm font-bold text-[var(--success)] mt-0.5 block">{subAnalytics.bestScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-3)] font-semibold uppercase block">Recent Score</span>
                    <span className="text-sm font-bold text-[var(--text-2)] mt-0.5 block">{subAnalytics.recentScore}%</span>
                  </div>
                </div>

                {subAnalytics.recentTests.length > 0 && (
                  <div className="border-t border-[var(--border)] pt-3 mt-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--text-3)] uppercase">Recent Subject Tests:</span>
                    <div className="flex flex-col gap-1.5">
                      {subAnalytics.recentTests.map(rt => (
                        <div key={rt.id} className="flex justify-between items-center text-xs p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border)]">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--text)]">{rt.testName}</span>
                            <span className="text-[10px] text-[var(--text-3)]">{rt.testDate}</span>
                          </div>
                          <Badge variant={rt.percentage >= 75 ? 'success' : rt.percentage >= 60 ? 'warning' : 'error'}>
                            {rt.percentage}% ({rt.score}/{rt.maxScore})
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )
        })()}
      </div>

      {/* Chapters list grouped by section / book part */}
      <div>
        <SectionHeader title="Syllabus Chapters" subtitle={`${chapters.length} chapters mapped`} />
        
        {chapters.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="mx-auto text-[var(--text-4)] mb-3" size={24} />
            <p className="text-sm font-semibold text-[var(--text-2)]">No chapters listed yet</p>
            <p className="text-xs text-[var(--text-3)] mt-1 mb-4">Introduce chapters to break down your preparation syllabus.</p>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
              Create First Chapter
            </Button>
          </Card>
        ) : (
          (() => {
            const groups: { [key: string]: typeof chapterMetrics } = {}
            chapterMetrics.forEach(m => {
              const sec = m.chapter.sectionName || m.chapter.bookPart || 'General Syllabus'
              if (!groups[sec]) groups[sec] = []
              groups[sec].push(m)
            })

            const groupEntries = Object.entries(groups)

            return (
              <div className="flex flex-col gap-6">
                {groupEntries.map(([sectionTitle, groupMetrics]) => (
                  <div key={sectionTitle} className="space-y-3">
                    {groupEntries.length > 1 && (
                      <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
                        <Badge variant="violet" size="sm">{sectionTitle}</Badge>
                        <span className="text-[11px] text-[var(--text-3)] font-medium">
                          ({groupMetrics.filter(m => m.isCovered).length}/{groupMetrics.length} Covered)
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {groupMetrics.map(({ chapter: ch, totalTopics, coveredTopics, masteredTopics, coveragePct, isCovered, isMastered }) => (
                        <Card 
                          key={ch.id} 
                          hover 
                          onClick={() => navigate(`/study/chapters/${ch.id}`)}
                          className="p-4 cursor-pointer"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-[var(--text)]">{ch.name}</h3>
                                {isMastered && <Badge variant="success" size="sm">✓ MASTERED</Badge>}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                {priorityBadge(ch.priority)}
                                {difficultyBadge(ch.difficulty)}
                                <Badge variant={isCovered ? 'info' : 'default'} size="sm">
                                  {totalTopics > 0 ? `${coveredTopics}/${totalTopics} Topics` : ch.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                              <div className="text-right">
                                <span className="text-xs font-bold text-[var(--accent)] block">{coveragePct}% Coverage</span>
                                <div className="w-20 mt-1">
                                  <ProgressBar value={coveragePct} max={100} height={4} />
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Play size={11} />}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/study/pomodoro?subjectId=${subject.id}&chapterId=${ch.id}`)
                                }}
                              >
                                Study
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()
        )}
      </div>

      {/* Log Study Modal */}
      <LogStudyModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        initialSubjectId={subject.id}
        onSaved={loadData}
      />

      {/* Add Chapter Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Chapter"
        subtitle="Map a new chapter to the current subject syllabus."
      >
        <form onSubmit={handleAddChapter} className="flex flex-col gap-4">
          <Input
            label="Chapter Name"
            placeholder="e.g. Differentiation, Magnetism basics"
            value={newChName}
            onChange={e => setNewChName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
              value={newChPriority}
              onChange={e => setNewChPriority(e.target.value as any)}
            />
            <Select
              label="Difficulty"
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' }
              ]}
              value={newChDifficulty}
              onChange={e => setNewChDifficulty(e.target.value as any)}
            />
          </div>
          <Input
            label="Estimated Hours"
            type="number"
            value={newChEstHours}
            onChange={e => setNewChEstHours(e.target.value)}
          />
          <Textarea
            label="Chapter Notes / Syllabus guidelines"
            placeholder="Enter special details or equations..."
            value={newChNotes}
            onChange={e => setNewChNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Chapter
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
