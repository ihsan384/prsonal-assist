import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, CheckCircle, ArrowLeft, Settings, Play, Clock, Target, Award, BookOpen, Layers } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { LogStudyModal } from '@/components/study/LogStudyModal'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { testAnalyticsService } from '@/services/study/testAnalytics.service'
import type { Chapter, Topic, Subject, StudySession, TopicStatus } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function ChapterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([])

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicNotes, setNewTopicNotes] = useState('')

  // Chapter editing states
  const [isEditingChapter, setIsEditingChapter] = useState(false)
  const [editConfidence, setEditConfidence] = useState('')
  const [editStatus, setEditStatus] = useState<Chapter['status']>('not_started')
  const [editCompletedHours, setEditCompletedHours] = useState('')

  const loadData = () => {
    const chs = studyERPStorage.getChapters()
    const match = chs.find(c => c.id === id)
    if (match) {
      setChapter(match)
      setEditConfidence(String(match.confidencePercentage || 60))
      setEditStatus(match.status)
      setEditCompletedHours(String(match.completedHours || 0))

      const subs = studyERPStorage.getSubjects()
      const sMatch = subs.find(s => s.id === match.subjectId)
      if (sMatch) setSubject(sMatch)

      const tps = studyERPStorage.getTopics(id)
      setTopics(tps)

      const sess = studyERPStorage.getSessions().filter(s => s.chapterId === id)
      sess.sort((a, b) => new Date(b.date + ' ' + (b.startTime || '00:00')).getTime() - new Date(a.date + ' ' + (a.startTime || '00:00')).getTime())
      setRecentSessions(sess)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (!chapter) {
    return (
      <PageWrapper>
        <div className="text-center py-12 text-sm text-[var(--text-3)]">
          Chapter not found.
        </div>
      </PageWrapper>
    )
  }

  // Multi-dimensional metrics calculation
  const totalTopics = topics.length
  const coveredTopicsCount = topics.filter(t => t.status === 'practicing' || t.status === 'mastered').length
  const masteredTopicsCount = topics.filter(t => t.status === 'mastered').length

  const coveragePct = totalTopics > 0
    ? Math.round((coveredTopicsCount / totalTopics) * 100)
    : chapter.status === 'completed' ? 100 : chapter.status === 'in_progress' ? 50 : 0

  const totalSessionMins = recentSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
  const studyHoursFmt = `${Math.floor(totalSessionMins / 60)}h ${totalSessionMins % 60}m`

  const totalAttempted = recentSessions.reduce((acc, s) => acc + (s.questionsSolved || 0), 0)
  const totalCorrect = recentSessions.reduce((acc, s) => acc + (s.correctAnswers || 0), 0)
  const accuracyPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  const confidencePct = chapter.confidencePercentage || 60

  const handleUpdateChapterInfo = (e: React.FormEvent) => {
    e.preventDefault()
    const allCh = studyERPStorage.getChapters()
    const updated = allCh.map(ch => {
      if (ch.id === chapter.id) {
        return {
          ...ch,
          status: editStatus,
          completedHours: Number(editCompletedHours) || 0,
          confidencePercentage: Number(editConfidence) || 0
        }
      }
      return ch
    })
    studyERPStorage.saveChapters(updated)
    setChapter({
      ...chapter,
      status: editStatus,
      completedHours: Number(editCompletedHours) || 0,
      confidencePercentage: Number(editConfidence) || 0
    })

    setIsEditingChapter(false)
    toast.success('Chapter updated successfully.')
  }

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopicName.trim()) {
      toast.error('Please enter a topic name.')
      return
    }

    const tp: Topic = {
      id: `tp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      chapterId: chapter.id,
      name: newTopicName.trim(),
      status: 'not_started',
      understandingPercentage: 50,
      questionsSolved: 0,
      mistakes: 0,
      revisionNeeded: false,
      notes: newTopicNotes.trim(),
      isCustom: true
    }

    studyERPStorage.addTopic(tp)
    setTopics(studyERPStorage.getTopics(chapter.id))
    
    setNewTopicName('')
    setNewTopicNotes('')
    setIsModalOpen(false)
    toast.success('Custom topic added.')
  }

  const handleTopicStatusChange = (topicId: string, nextStatus: TopicStatus) => {
    const conf = nextStatus === 'mastered' ? 100 : nextStatus === 'practicing' ? 80 : nextStatus === 'learning' ? 50 : 20
    studyERPStorage.updateTopicStatus(topicId, nextStatus, conf)
    setTopics(studyERPStorage.getTopics(chapter.id))
    toast.info(`Topic status updated to ${nextStatus.replace('_', ' ').toUpperCase()}`)
  }

  const getTopicStatusBadge = (status: TopicStatus) => {
    switch (status) {
      case 'mastered':
        return <Badge variant="success" size="sm">✓ MASTERED</Badge>
      case 'practicing':
        return <Badge variant="violet" size="sm">◐ PRACTICING</Badge>
      case 'learning':
        return <Badge variant="info" size="sm">📖 LEARNING</Badge>
      case 'not_started':
      default:
        return <Badge variant="default" size="sm">○ NOT STARTED</Badge>
    }
  }

  return (
    <PageWrapper>
      {/* Back to Subject Details */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<ArrowLeft size={13} />} 
          onClick={() => navigate(`/study/subjects/${chapter.subjectId}`)}
          className="-ml-2 text-[var(--text-3)]"
        >
          {subject ? `${subject.name} Syllabus` : 'Back to Syllabus'}
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
            onClick={() => navigate(`/study/pomodoro?subjectId=${subject?.id || chapter.subjectId}&chapterId=${chapter.id}`)}
          >
            Start Study
          </Button>
        </div>
      </div>

      {/* Main Chapter Summary card */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-[var(--text-3)] uppercase font-semibold">
              {subject ? `${subject.name} • ` : ''}Chapter Syllabus
            </span>
            <h1 className="text-lg font-bold text-[var(--text)] mt-0.5">{chapter.name}</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Settings size={12} />} 
            onClick={() => setIsEditingChapter(true)}
          >
            Edit Settings
          </Button>
        </div>

        {/* Multi-Dimensional Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-[var(--border)] text-xs">
          <div className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Coverage</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{coveragePct}%</span>
            <span className="text-[10px] text-[var(--text-4)] block mt-0.5">{coveredTopicsCount}/{totalTopics} topics covered</span>
          </div>

          <div className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Confidence</span>
            <span className="font-bold text-indigo-400 text-sm block mt-0.5">{confidencePct}%</span>
            <span className="text-[10px] text-[var(--text-4)] block mt-0.5">{confidencePct >= 80 ? 'Strong' : confidencePct >= 50 ? 'Moderate' : 'Needs Review'}</span>
          </div>

          <div className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Study Time</span>
            <span className="font-bold text-[var(--accent)] text-sm block mt-0.5">{studyHoursFmt}</span>
            <span className="text-[10px] text-[var(--text-4)] block mt-0.5">{recentSessions.length} total sessions</span>
          </div>

          <div className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Practice Questions</span>
            <span className="font-bold text-emerald-400 text-sm block mt-0.5">{totalAttempted}</span>
            <span className="text-[10px] text-[var(--text-4)] block mt-0.5">{accuracyPct}% accuracy</span>
          </div>

          <div className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Mastered Topics</span>
            <span className="font-bold text-[var(--success)] text-sm block mt-0.5">{masteredTopicsCount} Done</span>
            <span className="text-[10px] text-[var(--text-4)] block mt-0.5">Priority: {chapter.priority.toUpperCase()}</span>
          </div>
        </div>

        {/* Chapter Test Performance Section */}
        {(() => {
          const allTests = studyERPStorage.getTests()
          const chAnalytics = testAnalyticsService.getChapterAnalytics(allTests, chapter.id)
          return (
            <div className="mt-4 pt-3 border-t border-[var(--border)] text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-[var(--text-3)] uppercase font-bold">Chapter Test Performance</span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/study/tests')}>
                  View Tests
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px]">
                  <span className="text-[10px] text-[var(--text-3)] block font-medium">Tests Evaluated</span>
                  <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{chAnalytics.testsCount}</span>
                </div>
                <div className="p-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px]">
                  <span className="text-[10px] text-[var(--text-3)] block font-medium">Average Score</span>
                  <span className="font-bold text-[var(--accent)] text-sm block mt-0.5">{chAnalytics.avgScore}%</span>
                </div>
                <div className="p-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px]">
                  <span className="text-[10px] text-[var(--text-3)] block font-medium">Question Accuracy</span>
                  <span className="font-bold text-[var(--success)] text-sm block mt-0.5">{chAnalytics.accuracy}%</span>
                </div>
                <div className="p-2 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px]">
                  <span className="text-[10px] text-[var(--text-3)] block font-medium">Best Score</span>
                  <span className="font-bold text-[var(--text-2)] text-sm block mt-0.5">{chAnalytics.bestScore}%</span>
                </div>
              </div>
            </div>
          )
        })()}

        {chapter.notes && (
          <div className="mt-4 p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl text-xs">
            <span className="text-[var(--text-3)] block font-semibold text-[10px] uppercase">Special Chapter Notes</span>
            <p className="text-[var(--text-2)] mt-1 leading-relaxed">{chapter.notes}</p>
          </div>
        )}
      </Card>

      {/* Topics & Sub-concepts List */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <SectionHeader 
            title="Topics & Sub-concepts" 
            subtitle={totalTopics > 0 ? `${totalTopics} curriculum concepts mapped` : 'No detailed topics mapped yet'} 
            compact 
          />
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Plus size={12} />} 
            onClick={() => setIsModalOpen(true)}
          >
            Add Topic
          </Button>
        </div>

        {topics.length === 0 ? (
          <Card className="text-center py-10">
            <BookOpen className="mx-auto text-[var(--text-4)] mb-3" size={24} />
            <p className="text-sm font-semibold text-[var(--text-2)]">No detailed topics mapped yet</p>
            <p className="text-xs text-[var(--text-3)] mt-1 mb-4">
              You can still track overall chapter study time, sessions, and status.
            </p>
            <div className="flex justify-center gap-2">
              <Button 
                variant="primary" 
                size="sm" 
                icon={<Play size={12} fill="white" />}
                onClick={() => navigate(`/study/pomodoro?subjectId=${subject?.id || chapter.subjectId}&chapterId=${chapter.id}`)}
              >
                Start Chapter Study
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
                Add Custom Topic
              </Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {topics.map(tp => (
              <div 
                key={tp.id}
                className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => {
                      const next: TopicStatus = tp.status === 'mastered' ? 'practicing' : tp.status === 'practicing' ? 'learning' : tp.status === 'learning' ? 'mastered' : 'learning'
                      handleTopicStatusChange(tp.id, next)
                    }}
                    className="mt-0.5 shrink-0 cursor-pointer"
                  >
                    {tp.status === 'mastered' ? (
                      <CheckCircle size={20} className="text-[var(--success)] fill-[var(--success-bg)]" />
                    ) : tp.status === 'practicing' ? (
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-400 bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                        ◐
                      </div>
                    ) : tp.status === 'learning' ? (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-400 bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                        📖
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--border-strong)]" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold ${tp.status === 'mastered' ? 'text-[var(--text-3)] line-through' : 'text-[var(--text)]'}`}>
                        {tp.name}
                      </h4>
                      {getTopicStatusBadge(tp.status)}
                    </div>
                    {tp.notes && (
                      <p className="text-[10px] text-[var(--text-3)] mt-1 leading-relaxed max-w-md">
                        {tp.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Toggle & Start Study */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <select
                    value={tp.status}
                    onChange={e => handleTopicStatusChange(tp.id, e.target.value as TopicStatus)}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-[11px] font-medium text-[var(--text)]"
                  >
                    <option value="not_started">○ Not Started</option>
                    <option value="learning">📖 Learning</option>
                    <option value="practicing">◐ Practicing</option>
                    <option value="mastered">✓ Mastered</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Play size={11} />}
                    onClick={() => navigate(`/study/pomodoro?subjectId=${subject?.id || chapter.subjectId}&chapterId=${chapter.id}&topicId=${tp.id}`)}
                  >
                    Study
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Study Activity */}
      {recentSessions.length > 0 && (
        <div className="space-y-3 pt-2">
          <SectionHeader title="Recent Study Activity" subtitle={`${recentSessions.length} sessions logged for this chapter`} compact />
          <div className="flex flex-col gap-2">
            {recentSessions.slice(0, 5).map(sess => (
              <div key={sess.id} className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-[var(--accent)] shrink-0" />
                  <div>
                    <span className="font-bold text-[var(--text)] block">{sess.studyType?.replace('_', ' ') || sess.studyMethod}</span>
                    <span className="text-[10px] text-[var(--text-3)]">{sess.date} • {sess.durationMinutes} min ({sess.source || 'Session'})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  {sess.questionsSolved !== undefined && (
                    <span className="font-semibold text-emerald-400">
                      {sess.correctAnswers ?? sess.questionsSolved}/{sess.questionsSolved} Correct
                    </span>
                  )}
                  {sess.focusRating && (
                    <Badge variant="warning" size="sm">{sess.focusRating} ★</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Study Modal */}
      <LogStudyModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        initialSubjectId={subject?.id || chapter.subjectId}
        initialChapterId={chapter.id}
        onSaved={loadData}
      />

      {/* Edit Chapter Settings Modal */}
      <Modal
        isOpen={isEditingChapter}
        onClose={() => setIsEditingChapter(false)}
        title="Chapter Preparation Settings"
        subtitle="Maintain confidence, study status, and estimated preparation times."
      >
        <form onSubmit={handleUpdateChapterInfo} className="flex flex-col gap-4">
          <Select
            label="Chapter Status"
            options={[
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed & Done' }
            ]}
            value={editStatus}
            onChange={e => setEditStatus(e.target.value as any)}
          />
          <Input
            label="Completed Hours Log"
            type="number"
            value={editCompletedHours}
            onChange={e => setEditCompletedHours(e.target.value)}
          />
          <Input
            label="Confidence level % (0-100)"
            type="number"
            min="0"
            max="100"
            value={editConfidence}
            onChange={e => setEditConfidence(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditingChapter(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Configuration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Topic"
        subtitle="Add a sub-concept checklist item under this chapter."
      >
        <form onSubmit={handleAddTopic} className="flex flex-col gap-4">
          <Input
            label="Topic Name"
            placeholder="e.g. Electric flux equations, Ampere loop proofs"
            value={newTopicName}
            onChange={e => setNewTopicName(e.target.value)}
          />
          <Textarea
            label="Topic notes / revision rules"
            placeholder="Enter syllabus details or conceptual notes..."
            value={newTopicNotes}
            onChange={e => setNewTopicNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Custom Topic
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
