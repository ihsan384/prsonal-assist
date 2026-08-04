import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, CheckSquare, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { RevisionEntry, Topic } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function RevisionPage() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [revisions, setRevisions] = useState<RevisionEntry[]>([])
  const [topics, setTopics] = useState<Topic[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [revisionNumber, setRevisionNumber] = useState('1')
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    setRevisions(studyERPStorage.getRevisions())
    const allTopics = studyERPStorage.getTopics()
    setTopics(allTopics)

    const subjectId = searchParams.get('subjectId')
    const chapterId = searchParams.get('chapterId')

    if (chapterId || subjectId) {
      const matchTopic = allTopics.find(t => t.chapterId === chapterId) || (subjectId ? allTopics[0] : null)
      if (matchTopic) {
        setSelectedTopic(matchTopic.id)
      }
      setIsModalOpen(true)
    }
  }, [searchParams])

  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTopic) {
      toast.error('Please select a topic.')
      return
    }

    const tMatch = topics.find(t => t.id === selectedTopic)
    const chs = studyERPStorage.getChapters()
    const chMatch = chs.find(c => c.id === tMatch?.chapterId)
    const subs = studyERPStorage.getSubjects()
    const subMatch = subs.find(s => s.id === chMatch?.subjectId)

    const rev: RevisionEntry = {
      id: `rev-${Date.now()}`,
      topicId: selectedTopic,
      topicName: tMatch?.name ?? 'Topic',
      subjectName: subMatch?.name ?? 'Study',
      revisionNumber: Number(revisionNumber) || 1,
      scheduledDate,
      completed: false,
      confidence: 3
    }

    studyERPStorage.addRevision(rev)
    
    // Auto-update topic state to mark revision needed
    const allTopics = studyERPStorage.getTopics()
    const updatedTopics = allTopics.map(t => {
      if (t.id === selectedTopic) {
        return { ...t, revisionNeeded: true }
      }
      return t
    })
    studyERPStorage.saveTopics(updatedTopics)

    setRevisions(studyERPStorage.getRevisions())
    setSelectedTopic('')
    setIsModalOpen(false)
    toast.success('Revision mapped to calendar.')
  }

  const markCompleted = (revId: string) => {
    const list = studyERPStorage.getRevisions()
    const updated = list.map(r => {
      if (r.id === revId) {
        return {
          ...r,
          completed: true,
          completedDate: new Date().toISOString().split('T')[0]
        }
      }
      return r
    })
    studyERPStorage.saveRevisions(updated)
    setRevisions(updated)
    toast.success('Revision complete. Keep it up!')
  }

  const pending = revisions.filter(r => !r.completed)
  const completed = revisions.filter(r => r.completed)

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Spaced Repetition & Revision" subtitle="Review core concepts periodically to maximize recall" compact />
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={12} />}
          onClick={() => setIsModalOpen(true)}
        >
          Schedule Revision
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Revisions Checklist */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <SectionHeader title="Active Revision Schedule" />

          {pending.length === 0 ? (
            <Card className="text-center py-10">
              <CheckSquare className="mx-auto text-[var(--text-4)] mb-3" size={24} />
              <p className="text-sm font-semibold text-[var(--text-2)]">All revisions finished</p>
              <p className="text-xs text-[var(--text-3)] mt-1">No pending concepts scheduled for review.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map(rev => (
                <Card key={rev.id} className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-3)] font-semibold">{rev.subjectName}</span>
                        <Badge variant="accent" size="sm">Revision {rev.revisionNumber}</Badge>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text)] mt-1">{rev.topicName}</h4>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[var(--text-3)]">
                        <Calendar size={11} />
                        <span>Due: {rev.scheduledDate}</span>
                      </div>
                    </div>

                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => markCompleted(rev.id)}
                    >
                      Mark Done
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Finished logs */}
        <div className="flex flex-col gap-4">
          <SectionHeader title="Completed Reviews" />
          
          {completed.length === 0 ? (
            <Card className="text-center py-6 text-xs text-[var(--text-3)]">
              No finished revisions logged yet.
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {completed.map(rev => (
                <div 
                  key={rev.id}
                  className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-semibold text-[var(--text)]">{rev.topicName}</h5>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">Rev {rev.revisionNumber} · Done: {rev.completedDate}</p>
                  </div>
                  <div className="flex gap-0.5 text-[var(--warning)] text-xs">
                    {Array.from({ length: rev.confidence }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Schedule Revision Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Concept Revision"
        subtitle="Spaced repetition parameters for topic."
      >
        <form onSubmit={handleCreateRevision} className="flex flex-col gap-4">
          <Select
            label="Topic checklist"
            options={topics.map(t => ({ value: t.id, label: t.name }))}
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            placeholder="Select Topic"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Revision Number"
              options={[
                { value: '1', label: '1st Revision (1 Day)' },
                { value: '2', label: '2nd Revision (3 Days)' },
                { value: '3', label: '3rd Revision (7 Days)' },
                { value: '4', label: '4th Revision (14 Days)' },
                { value: '5', label: '5th Revision (30 Days)' }
              ]}
              value={revisionNumber}
              onChange={e => setRevisionNumber(e.target.value)}
            />
            <Input
              label="Scheduled Date"
              type="date"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Schedule Revision
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
