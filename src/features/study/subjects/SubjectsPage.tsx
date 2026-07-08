import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Book, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { Subject } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function SubjectsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const [newSubTarget, setNewSubTarget] = useState('40')

  useEffect(() => {
    setSubjects(studyERPStorage.getSubjects())
  }, [])

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubName.trim()) {
      toast.error('Please enter a subject name.')
      return
    }

    const sub: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      studyHours: 0,
      targetHours: Number(newSubTarget) || 40,
      completedChapters: 0,
      pendingChapters: 0,
      completionPercentage: 0
    }

    studyERPStorage.addSubject(sub)
    setSubjects(studyERPStorage.getSubjects())
    setNewSubName('')
    setIsModalOpen(false)
    toast.success('Subject added successfully.')
  }

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Syllabus & Core Subjects" subtitle="Track hours and completion across all syllabus items" compact />
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={12} />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map(sub => (
          <Card 
            key={sub.id} 
            hover 
            onClick={() => navigate(`/study/subjects/${sub.id}`)}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[8px] bg-[var(--accent-bg)] text-[var(--accent)] flex items-center justify-center">
                    <Book size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">{sub.name}</h3>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">Syllabus Item</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[var(--text)]">{sub.completionPercentage}% Done</span>
              </div>

              {/* Progress bars */}
              <div className="mt-4">
                <ProgressBar value={sub.completionPercentage} max={100} height={5} />
              </div>

              {/* Detail list grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[var(--border)] text-center text-xs">
                <div>
                  <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Study Hours</span>
                  <span className="font-semibold text-[var(--text)] block mt-0.5">{sub.studyHours}h / {sub.targetHours}h</span>
                </div>
                <div>
                  <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Done Chapters</span>
                  <span className="font-semibold text-[var(--success)] block mt-0.5">{sub.completedChapters}</span>
                </div>
                <div>
                  <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Pending</span>
                  <span className="font-semibold text-[var(--warning)] block mt-0.5">{sub.pendingChapters}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end text-xs font-semibold text-[var(--accent)] mt-4">
              <span>View Syllabus Detail</span>
              <ChevronRight size={13} />
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for adding custom subjects */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Subject"
        subtitle="Introduce a new syllabus target to track."
      >
        <form onSubmit={handleAddSubject} className="flex flex-col gap-4">
          <Input
            label="Subject Name"
            placeholder="e.g. History, Economics"
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
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Subject
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
