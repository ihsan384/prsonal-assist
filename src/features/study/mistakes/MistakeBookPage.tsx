import { useState, useEffect } from 'react'
import { Plus, AlertOctagon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { Mistake, Subject, Chapter } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function MistakeBookPage() {
  const toast = useToast()
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState('')
  const [selectedCh, setSelectedCh] = useState('')
  const [question, setQuestion] = useState('')
  const [solution, setSolution] = useState('')
  const [reason, setReason] = useState('')
  const [category, setCategory] = useState<Mistake['category']>('Conceptual Gap')

  const [activeTab, setActiveTab] = useState<'all' | 'review_needed' | 'reviewed' | 'resolved'>('all')

  useEffect(() => {
    setMistakes(studyERPStorage.getMistakes().reverse())
    setSubjects(studyERPStorage.getSubjects())
    setChapters(studyERPStorage.getChapters())
  }, [])

  // Sync chapters
  const filteredChapters = chapters.filter(c => c.subjectId === selectedSub)

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSub || !question.trim()) {
      toast.error('Please complete all required fields.')
      return
    }

    const mistake: Mistake = {
      id: `mst-${Date.now()}`,
      subjectId: selectedSub,
      chapterId: selectedCh || undefined,
      question: question.trim(),
      correctSolution: solution.trim(),
      reason: reason.trim(),
      category,
      revisionStatus: 'review_needed',
      dateAdded: new Date().toISOString().split('T')[0]
    }

    studyERPStorage.addMistake(mistake)
    setMistakes(studyERPStorage.getMistakes().reverse())

    setIsModalOpen(false)
    setQuestion('')
    setSolution('')
    setReason('')
    toast.success('Mistake registered in Mistake Book.')
  }

  const changeStatus = (id: string, newStatus: Mistake['revisionStatus']) => {
    const list = studyERPStorage.getMistakes()
    const updated = list.map(m => {
      if (m.id === id) {
        return { ...m, revisionStatus: newStatus }
      }
      return m
    })
    studyERPStorage.saveMistakes(updated)
    setMistakes(updated.reverse())
    toast.info(`Mistake status updated to ${newStatus}.`)
  }

  const getSubName = (id: string) => subjects.find(s => s.id === id)?.name ?? 'Syllabus'
  const getChName = (id?: string) => chapters.find(c => c.id === id)?.name ?? 'General topic'

  const filteredMistakes = mistakes.filter(m => {
    if (activeTab === 'all') return true
    return m.revisionStatus === activeTab
  })

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Mistake Book Log" subtitle="Track calculation errors and conceptual gaps to optimize accuracy" compact />
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={12} />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Mistake
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'all', label: 'All Mistakes' },
          { id: 'review_needed', label: 'Review Needed' },
          { id: 'reviewed', label: 'Reviewed' },
          { id: 'resolved', label: 'Resolved' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' 
                : 'text-[var(--text-3)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mistakes List */}
      <div>
        {filteredMistakes.length === 0 ? (
          <Card className="text-center py-12">
            <AlertOctagon className="mx-auto text-[var(--text-4)] mb-3" size={24} />
            <p className="text-sm font-semibold text-[var(--text-2)]">No mistakes listed</p>
            <p className="text-xs text-[var(--text-3)] mt-1">Filter another view or register your mistakes to track resolution.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredMistakes.map(m => (
              <Card key={m.id} className="p-4">
                <div className="flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-[var(--text-3)] font-semibold">{getSubName(m.subjectId)}</span>
                        {m.chapterId && <Badge variant="default" size="sm">{getChName(m.chapterId)}</Badge>}
                        <Badge variant="warning" size="sm">{m.category}</Badge>
                      </div>
                      <p className="text-xs text-[var(--text-4)] mt-1">Logged on {m.dateAdded}</p>
                    </div>

                    {/* Action toggles */}
                    <div className="flex gap-1.5 shrink-0">
                      {m.revisionStatus !== 'resolved' ? (
                        <>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => changeStatus(m.id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                          {m.revisionStatus === 'review_needed' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => changeStatus(m.id, 'reviewed')}
                            >
                              Mark Reviewed
                            </Button>
                          )}
                        </>
                      ) : (
                        <Badge variant="success" size="sm">Resolved ✓</Badge>
                      )}
                    </div>
                  </div>

                  {/* Question description */}
                  <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-xs">
                    <span className="text-[10px] text-[var(--text-3)] uppercase font-semibold">Question details</span>
                    <p className="font-semibold text-[var(--text)] mt-1 whitespace-pre-wrap">{m.question}</p>
                  </div>

                  {/* Correct Solution */}
                  {m.correctSolution && (
                    <div className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-xs">
                      <span className="text-[10px] text-[var(--success)] uppercase font-semibold">Correct Solution / Method</span>
                      <p className="text-[var(--text-2)] mt-1 font-mono whitespace-pre-wrap">{m.correctSolution}</p>
                    </div>
                  )}

                  {/* Reason details */}
                  {m.reason && (
                    <div className="text-xs text-[var(--text-3)] leading-relaxed">
                      <span className="font-semibold text-[var(--text-2)]">Mistake reason:</span> {m.reason}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Mistake Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Mistake Entry"
        subtitle="Log mistakes to optimize preparation accuracy."
      >
        <form onSubmit={handleAddMistake} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Subject *"
              options={subjects.map(s => ({ value: s.id, label: s.name }))}
              value={selectedSub}
              onChange={e => setSelectedSub(e.target.value)}
              placeholder="Select Subject"
            />
            <Select
              label="Chapter (optional)"
              options={filteredChapters.map(c => ({ value: c.id, label: c.name }))}
              value={selectedCh}
              onChange={e => setSelectedCh(e.target.value)}
              placeholder="Select Chapter"
              disabled={!selectedSub}
            />
          </div>

          <Select
            label="Category"
            options={[
              { value: 'Silly Error', label: 'Silly/Calculation Error' },
              { value: 'Conceptual Gap', label: 'Conceptual Gap' },
              { value: 'Time Pressure', label: 'Time Pressure' },
              { value: 'Calculation Error', label: 'Calculation Error' },
              { value: 'Other', label: 'Other Error' }
            ]}
            value={category}
            onChange={e => setCategory(e.target.value as any)}
          />

          <Textarea
            label="Question detail *"
            placeholder="Write question description or copy latex..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />

          <Textarea
            label="Correct Solution"
            placeholder="Describe step by step correct solution..."
            value={solution}
            onChange={e => setSolution(e.target.value)}
          />

          <Input
            label="Reason description"
            placeholder="e.g. didn't multiply integration factor"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Mistake
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
