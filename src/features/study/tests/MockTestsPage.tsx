import { useState, useEffect } from 'react'
import { Plus, Award, Trash2 } from 'lucide-react'
import { Card, MetricCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { MockTest } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'

export default function MockTestsPage() {
  const toast = useToast()
  const [tests, setTests] = useState<MockTest[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [examName, setExamName] = useState('')
  const [marks, setMarks] = useState('80')
  const [totalMarks, setTotalMarks] = useState('100')
  const [timeTaken, setTimeTaken] = useState('180')
  const [rank, setRank] = useState('')
  const [mistakes, setMistakes] = useState('5')
  const [weakAreasInput, setWeakAreasInput] = useState('')
  const [notes, setNotes] = useState('')

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<string | null>(null)

  const reloadTests = () => {
    setTests(studyERPStorage.getTests().reverse())
  }

  useEffect(() => {
    reloadTests()
  }, [])

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!examName.trim()) {
      toast.error('Please enter exam name.')
      return
    }

    const marksObt = Number(marks) || 0
    const totMarks = Number(totalMarks) || 100
    const pct = Math.round((marksObt / totMarks) * 100)

    const newTest: MockTest = {
      id: `test-${Date.now()}`,
      examName: examName.trim(),
      date: new Date().toISOString().split('T')[0],
      marksObtained: marksObt,
      totalMarks: totMarks,
      percentage: pct,
      timeTakenMinutes: Number(timeTaken) || 180,
      rank: rank.trim() || undefined,
      mistakesCount: Number(mistakes) || 0,
      weakAreas: weakAreasInput.split(',').map(s => s.trim()).filter(Boolean),
      notes: notes.trim() || undefined
    }

    studyERPStorage.addTest(newTest)
    reloadTests()

    setIsModalOpen(false)
    setExamName('')
    setRank('')
    setWeakAreasInput('')
    setNotes('')
    toast.success('Mock Test performance logged.')
  }

  const handleDeleteClick = (id: string) => {
    setTestToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (testToDelete) {
      studyERPStorage.removeTest(testToDelete)
      reloadTests()
      toast.success('Mock Test log deleted.')
    }
    setIsDeleteOpen(false)
    setTestToDelete(null)
  }

  // Averages
  const avgPct = tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length) : 0
  const maxPct = tests.length > 0 ? Math.max(...tests.map(t => t.percentage)) : 0

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Mock Exam Tracker" subtitle="Log performance metrics, target goals, and weak chapter areas" compact />
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={12} />}
          onClick={() => setIsModalOpen(true)}
        >
          Log Mock Test
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <MetricCard
          label="Mock Exams Attempted"
          value={tests.length}
          change={{ value: 0, label: 'completed mock exams' }}
        />
        <MetricCard
          label="Average Score"
          value={`${avgPct}%`}
          change={{ value: 80, label: 'target: 80% marks' }}
        />
        <MetricCard
          label="Highest Score attained"
          value={`${maxPct}%`}
          change={{ value: 0, label: 'personal record' }}
        />
      </div>

      {/* Logs List */}
      <div>
        <SectionHeader title="Exam History logs" />

        {tests.length === 0 ? (
          <EmptyState
            icon={<Award size={24} />}
            title="No exams logged yet"
            description="Log your Mock Test marks, percentages, ranks, and weak areas to optimize prep performance."
            action={
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                Record first exam score
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {tests.map(test => (
              <Card key={test.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[var(--text)]">{test.examName}</h4>
                      <Badge variant="accent" size="sm">{test.date}</Badge>
                      {test.rank && <Badge variant="success" size="sm">Rank: {test.rank}</Badge>}
                    </div>

                    <p className="text-xs text-[var(--text-2)] mt-2">
                      Marks: <span className="font-semibold text-[var(--text)]">{test.marksObtained}/{test.totalMarks}</span> ({test.percentage}%) · Time: {test.timeTakenMinutes} mins
                    </p>

                    {test.weakAreas && test.weakAreas.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-3">
                        <span className="text-[10px] text-[var(--text-3)] font-semibold">Weak Areas:</span>
                        {test.weakAreas.map(area => (
                          <Badge key={area} variant="warning" size="sm">{area}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right justify-between sm:justify-end">
                    <div>
                      <span className="text-[10px] text-[var(--text-3)] font-semibold block">Mistakes count</span>
                      <span className="text-sm font-bold text-[var(--error)] block mt-0.5">{test.mistakesCount} errors</span>
                    </div>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(test.id) }}
                      className="text-[var(--text-4)] hover:text-[var(--error)] p-1.5 transition-colors"
                      title="Delete Mock Test Log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {test.notes && (
                  <p className="text-xs text-[var(--text-3)] leading-relaxed border-t border-[var(--border)] pt-2.5 mt-3 text-left">
                    {test.notes}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Log Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Mock Exam Score"
        subtitle="Submit your details to populate your syllabus stats."
      >
        <form onSubmit={handleAddTest} className="flex flex-col gap-4 text-left">
          <Input
            label="Exam Name"
            placeholder="e.g. JEE Main Mock Test 14"
            value={examName}
            onChange={e => setExamName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marks Obtained"
              type="number"
              value={marks}
              onChange={e => setMarks(e.target.value)}
              required
            />
            <Input
              label="Total Marks"
              type="number"
              value={totalMarks}
              onChange={e => setTotalMarks(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Time Taken (mins)"
              type="number"
              value={timeTaken}
              onChange={e => setTimeTaken(e.target.value)}
              required
            />
            <Input
              label="Rank / Percentile"
              placeholder="e.g. 14th"
              value={rank}
              onChange={e => setRank(e.target.value)}
            />
            <Input
              label="Mistakes Count"
              type="number"
              value={mistakes}
              onChange={e => setMistakes(e.target.value)}
              required
            />
          </div>

          <Input
            label="Weak Areas (comma separated)"
            placeholder="e.g. Trigonometry, Organic reagents"
            value={weakAreasInput}
            onChange={e => setWeakAreasInput(e.target.value)}
          />

          <Textarea
            label="Exam analysis notes"
            placeholder="Describe mistakes or exam day strategy..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Exam
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setTestToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Mock Test Log"
        description="Are you sure you want to permanently delete this mock exam log?"
      />
    </PageWrapper>
  )
}
