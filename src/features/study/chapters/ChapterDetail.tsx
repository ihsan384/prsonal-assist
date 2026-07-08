import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, CheckCircle, HelpCircle, ArrowLeft, Settings } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { Chapter, Topic, Subject } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function ChapterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])

  // Modal to add topic
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicUnderstanding, setNewTopicUnderstanding] = useState('50')
  const [newTopicNotes, setNewTopicNotes] = useState('')

  // Chapter editing states
  const [isEditingChapter, setIsEditingChapter] = useState(false)
  const [editConfidence, setEditConfidence] = useState('')
  const [editStatus, setEditStatus] = useState<Chapter['status']>('not_started')
  const [editCompletedHours, setEditCompletedHours] = useState('')

  useEffect(() => {
    const chs = studyERPStorage.getChapters()
    const match = chs.find(c => c.id === id)
    if (match) {
      setChapter(match)
      setEditConfidence(String(match.confidencePercentage))
      setEditStatus(match.status)
      setEditCompletedHours(String(match.completedHours))

      const subs = studyERPStorage.getSubjects()
      const sMatch = subs.find(s => s.id === match.subjectId)
      if (sMatch) setSubject(sMatch)

      const tps = studyERPStorage.getTopics().filter(t => t.chapterId === id)
      setTopics(tps)
    }
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

    // Also update parent subject calculations
    const allSubs = studyERPStorage.getSubjects()
    const subMatch = allSubs.find(s => s.id === chapter.subjectId)
    if (subMatch) {
      const matchChapters = updated.filter(c => c.subjectId === chapter.subjectId)
      subMatch.completedChapters = matchChapters.filter(c => c.status === 'completed').length
      subMatch.pendingChapters = matchChapters.filter(c => c.status !== 'completed').length
      // recalculate percentage
      const totalCh = matchChapters.length || 1
      subMatch.completionPercentage = Math.round((subMatch.completedChapters / totalCh) * 100)
      studyERPStorage.saveSubjects(allSubs)
      if (subject) setSubject(subMatch)
    }

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
      id: `tp-${Date.now()}`,
      chapterId: chapter.id,
      name: newTopicName.trim(),
      status: 'in_progress',
      understandingPercentage: Number(newTopicUnderstanding) || 50,
      questionsSolved: 0,
      mistakes: 0,
      revisionNeeded: false,
      notes: newTopicNotes.trim()
    }

    studyERPStorage.addTopic(tp)
    setTopics(studyERPStorage.getTopics().filter(t => t.chapterId === chapter.id))
    
    setNewTopicName('')
    setNewTopicNotes('')
    setIsModalOpen(false)
    toast.success('Topic mapped under chapter.')
  }

  const toggleTopicMastery = (topicId: string) => {
    const allTopics = studyERPStorage.getTopics()
    const updated = allTopics.map(t => {
      if (t.id === topicId) {
        const newStatus = t.status === 'mastered' ? 'in_progress' : 'mastered'
        return {
          ...t,
          status: newStatus as any,
          understandingPercentage: newStatus === 'mastered' ? 100 : 70
        }
      }
      return t
    })
    studyERPStorage.saveTopics(updated)
    setTopics(updated.filter(t => t.chapterId === chapter.id))
    toast.info('Topic mastery toggled.')
  }

  return (
    <PageWrapper>
      {/* Back to Subject Details */}
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<ArrowLeft size={13} />} 
          onClick={() => navigate(`/study/subjects/${chapter.subjectId}`)}
          className="-ml-2 text-[var(--text-3)]"
        >
          {subject ? `${subject.name} Syllabus` : 'Back'}
        </Button>
      </div>

      {/* Main Chapter Summary card */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-[var(--text-3)] uppercase font-semibold">Chapter Syllabus</span>
            <h1 className="text-lg font-bold text-[var(--text)] mt-1">{chapter.name}</h1>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Settings size={12} />} 
            onClick={() => setIsEditingChapter(true)}
          >
            Edit Settings
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-[var(--border)] text-xs">
          <div>
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Priority</span>
            <span className="font-semibold block mt-0.5 text-[var(--text)] uppercase">{chapter.priority}</span>
          </div>
          <div>
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Confidence</span>
            <span className="font-semibold block mt-0.5 text-[var(--text)]">{chapter.confidencePercentage}%</span>
          </div>
          <div>
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Hours Logged</span>
            <span className="font-semibold block mt-0.5 text-[var(--text)]">{chapter.completedHours}h / {chapter.estimatedHours}h</span>
          </div>
        </div>

        {chapter.notes && (
          <div className="mt-4 p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-xs">
            <span className="text-[var(--text-3)] block font-semibold">Special Chapter Notes</span>
            <p className="text-[var(--text-2)] mt-1 leading-relaxed">{chapter.notes}</p>
          </div>
        )}
      </Card>

      {/* Topics list */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <SectionHeader title="Mapped Topics & Sub-concepts" subtitle="Mark concepts you have fully mastered" compact />
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
            <HelpCircle className="mx-auto text-[var(--text-4)] mb-3" size={24} />
            <p className="text-sm font-semibold text-[var(--text-2)]">No topics listed</p>
            <p className="text-xs text-[var(--text-3)] mt-1 mb-4">Break down this chapter into clear, measurable concepts.</p>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
              Map First Topic
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {topics.map(tp => (
              <div 
                key={tp.id}
                className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-[12px] flex items-center justify-between gap-3 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => toggleTopicMastery(tp.id)}
                    className="mt-0.5 text-[var(--text-4)] hover:text-[var(--accent)] shrink-0 cursor-pointer"
                  >
                    {tp.status === 'mastered' ? (
                      <CheckCircle size={18} className="text-[var(--success)] fill-[var(--success-bg)]" />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-[var(--border-strong)]" />
                    )}
                  </button>
                  <div>
                    <h4 className={`text-xs font-bold ${tp.status === 'mastered' ? 'line-through text-[var(--text-3)]' : 'text-[var(--text)]'}`}>
                      {tp.name}
                    </h4>
                    {tp.notes && (
                      <p className="text-[10px] text-[var(--text-3)] mt-1 leading-relaxed max-w-md">
                        {tp.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-semibold text-[var(--text-3)]">Understanding: {tp.understandingPercentage}%</span>
                      {tp.revisionNeeded && <Badge variant="warning" size="sm">Revision Scheduled</Badge>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 text-[10px] text-[var(--text-3)]">
                  <span className="block font-semibold">Questions: {tp.questionsSolved}</span>
                  {tp.mistakes > 0 && <span className="block text-[var(--error)] font-semibold mt-0.5">{tp.mistakes} mistakes</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Chapter Modal */}
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
        title="Map New Topic"
        subtitle="Add a new sub-concept checklist item under this chapter."
      >
        <form onSubmit={handleAddTopic} className="flex flex-col gap-4">
          <Input
            label="Topic Name"
            placeholder="e.g. Electric flux equations, Ampere loop proofs"
            value={newTopicName}
            onChange={e => setNewTopicName(e.target.value)}
          />
          <Input
            label="Initial Understanding %"
            type="number"
            min="0"
            max="100"
            value={newTopicUnderstanding}
            onChange={e => setNewTopicUnderstanding(e.target.value)}
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
              Map Topic
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
