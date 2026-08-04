import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, BookOpen, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { curriculumService } from '@/services/curriculum/curriculumService'
import type { Subject, Chapter } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function SubjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  
  // Chapter creation modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newChName, setNewChName] = useState('')
  const [newChPriority, setNewChPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [newChDifficulty, setNewChDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [newChEstHours, setNewChEstHours] = useState('10')
  const [newChNotes, setNewChNotes] = useState('')

  useEffect(() => {
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

            match.pendingChapters = newChapters.length
            match.completedChapters = 0
            studyERPStorage.updateSubject(match.id, { pendingChapters: newChapters.length, completedChapters: 0 })
            setSubject({ ...match })
          } else {
            setChapters([])
          }
        })
      } else {
        setChapters(chs)
      }
    }
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

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChName.trim()) {
      toast.error('Please enter a chapter name.')
      return
    }

    const ch: Chapter = {
      id: `ch-${Date.now()}`,
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
    
    // Update local state
    const allCh = studyERPStorage.getChapters().filter(c => c.subjectId === subject.id)
    setChapters(allCh)
    
    // Update subject chapters counts in storage
    const allSubs = studyERPStorage.getSubjects()
    const subMatch = allSubs.find(s => s.id === subject.id)
    if (subMatch) {
      subMatch.pendingChapters = allCh.filter(c => c.status !== 'completed').length
      subMatch.completedChapters = allCh.filter(c => c.status === 'completed').length
      studyERPStorage.saveSubjects(allSubs)
      setSubject(subMatch)
    }

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
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<ArrowLeft size={13} />} 
          onClick={() => navigate('/study/subjects')}
          className="-ml-2 text-[var(--text-3)]"
        >
          Syllabus Subjects
        </Button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">{subject.name}</h1>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Syllabus details, chapters and milestones</p>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={12} />} 
            onClick={() => setIsModalOpen(true)}
          >
            Add Chapter
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px]">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Logged Study</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{subject.studyHours}h / {subject.targetHours}h</span>
          </div>
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px]">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Completion %</span>
            <span className="font-bold text-[var(--text)] text-sm block mt-0.5">{subject.completionPercentage}%</span>
          </div>
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px]">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Completed Chapters</span>
            <span className="font-bold text-[var(--success)] text-sm block mt-0.5">{subject.completedChapters} Done</span>
          </div>
          <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px]">
            <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Remaining</span>
            <span className="font-bold text-[var(--warning)] text-sm block mt-0.5">{subject.pendingChapters} Pending</span>
          </div>
        </div>
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
            // Group chapters by sectionName or bookPart
            const groups: { [key: string]: Chapter[] } = {}
            chapters.forEach(ch => {
              const sec = ch.sectionName || ch.bookPart || 'General Syllabus'
              if (!groups[sec]) groups[sec] = []
              groups[sec].push(ch)
            })

            const groupEntries = Object.entries(groups)

            return (
              <div className="flex flex-col gap-6">
                {groupEntries.map(([sectionTitle, groupChs]) => (
                  <div key={sectionTitle} className="space-y-3">
                    {groupEntries.length > 1 && (
                      <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
                        <Badge variant="violet" size="sm">{sectionTitle}</Badge>
                        <span className="text-[11px] text-[var(--text-3)] font-medium">
                          ({groupChs.filter(c => c.status === 'completed').length}/{groupChs.length} Completed)
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {groupChs.map(ch => (
                        <Card 
                          key={ch.id} 
                          hover 
                          onClick={() => navigate(`/study/chapters/${ch.id}`)}
                          className="p-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-bold text-[var(--text)]">{ch.name}</h3>
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                {priorityBadge(ch.priority)}
                                {difficultyBadge(ch.difficulty)}
                                <Badge variant={ch.status === 'completed' ? 'success' : ch.status === 'in_progress' ? 'info' : 'default'} size="sm">
                                  {ch.status === 'completed' ? 'Completed' : ch.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                </Badge>
                                <span className="text-[10px] text-[var(--text-3)] font-medium">
                                  {ch.completedHours}/{ch.estimatedHours} hrs logged
                                </span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-end gap-2 sm:gap-1 shrink-0 text-right">
                              <span className="text-xs font-semibold text-[var(--text)]">Confidence: {ch.confidencePercentage}%</span>
                              <div className="w-24 mt-0.5">
                                <ProgressBar value={ch.confidencePercentage} max={100} height={4} />
                              </div>
                            </div>
                          </div>
                          {ch.notes && (
                            <p className="text-xs text-[var(--text-3)] border-t border-[var(--border)] pt-2.5 mt-3 leading-relaxed">
                              {ch.notes}
                            </p>
                          )}
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
