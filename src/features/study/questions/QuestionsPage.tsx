import { useState, useEffect } from 'react'
import { Plus, BarChart } from 'lucide-react'
import { Card, MetricCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { QuestionLog, Subject } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function QuestionsPage() {
  const toast = useToast()
  const [logs, setLogs] = useState<QuestionLog[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState('')
  const [solved, setSolved] = useState('20')
  const [correct, setCorrect] = useState('15')
  const [wrong, setWrong] = useState('4')
  const [skipped, setSkipped] = useState('1')
  const [timeTaken, setTimeTaken] = useState('30')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setLogs(studyERPStorage.getQuestions().reverse())
    setSubjects(studyERPStorage.getSubjects())
  }, [])

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSub) {
      toast.error('Please select a subject.')
      return
    }

    const totalSolved = Number(solved) || 0
    const correctCount = Number(correct) || 0
    const wrongCount = Number(wrong) || 0
    const skippedCount = Number(skipped) || 0

    const accuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0

    const log: QuestionLog = {
      id: `qlog-${Date.now()}`,
      subjectId: selectedSub,
      date: new Date().toISOString().split('T')[0],
      questionsSolved: totalSolved,
      correct: correctCount,
      wrong: wrongCount,
      skipped: skippedCount,
      accuracyPercentage: accuracy,
      timeTakenMinutes: Number(timeTaken) || 30,
      difficulty,
      notes: notes.trim() || undefined
    }

    studyERPStorage.addQuestion(log)
    setLogs(studyERPStorage.getQuestions().reverse())
    
    // Auto increment questions count in topic/subject if applicable
    const allSubs = studyERPStorage.getSubjects()
    const match = allSubs.find(s => s.id === selectedSub)
    if (match) {
      studyERPStorage.saveSubjects(allSubs)
    }

    setIsModalOpen(false)
    setNotes('')
    toast.success('Question practice logged.')
  }

  const getSubName = (id: string) => subjects.find(s => s.id === id)?.name ?? 'General'

  // Summary Metrics
  const totalSolvedCount = logs.reduce((sum, l) => sum + l.questionsSolved, 0)
  const totalCorrect = logs.reduce((sum, l) => sum + l.correct, 0)
  const overallAccuracy = totalSolvedCount > 0 ? Math.round((totalCorrect / totalSolvedCount) * 100) : 0
  const totalMinutes = logs.reduce((sum, l) => sum + l.timeTakenMinutes, 0)

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Question Practice Logs" subtitle="Log daily problem solving metrics and evaluate accuracy" compact />
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={12} />}
          onClick={() => setIsModalOpen(true)}
        >
          Log Practice
        </Button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          label="Total Questions Solved"
          value={totalSolvedCount}
          change={{ value: totalCorrect, label: 'correct answers' }}
        />
        <MetricCard
          label="Overall Accuracy"
          value={`${overallAccuracy}%`}
          change={{ value: 0, label: 'target: 80% accuracy' }}
        />
        <MetricCard
          label="Time Spent Practice"
          value={`${(totalMinutes / 60).toFixed(1)}h`}
          change={{ value: totalMinutes, label: 'total mins' }}
        />
      </div>

      {/* Practice sessions grid list */}
      <div>
        <SectionHeader title="Logged Practice History" />

        {logs.length === 0 ? (
          <Card className="text-center py-12">
            <BarChart className="mx-auto text-[var(--text-4)] mb-3" size={24} />
            <p className="text-sm font-semibold text-[var(--text-2)]">No practice logged yet</p>
            <p className="text-xs text-[var(--text-3)] mt-1 mb-4">Start recording correct, wrong, and skipped question metrics.</p>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Log First Set
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map(log => (
              <Card key={log.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[var(--text)]">{getSubName(log.subjectId)}</h4>
                      <Badge variant="default" size="sm">{log.date}</Badge>
                      <Badge variant={log.difficulty === 'hard' ? 'error' : log.difficulty === 'medium' ? 'info' : 'success'} size="sm">
                        {log.difficulty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Solved</span>
                        <span className="font-semibold text-[var(--text)] block mt-0.5">{log.questionsSolved}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Correct</span>
                        <span className="font-semibold text-[var(--success)] block mt-0.5">{log.correct}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Wrong</span>
                        <span className="font-semibold text-[var(--error)] block mt-0.5">{log.wrong}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-3)] block text-[10px] uppercase font-semibold">Accuracy</span>
                        <span className="font-semibold text-[var(--text)] block mt-0.5">{log.accuracyPercentage}%</span>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="text-[11px] text-[var(--text-3)] mt-3 leading-relaxed border-t border-[var(--border)] pt-2.5">
                        {log.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[var(--text-3)] font-semibold block">Time Spent</span>
                    <span className="font-semibold text-[var(--text)] text-xs block mt-0.5">{log.timeTakenMinutes} mins</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Log Practice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Question Practice Set"
        subtitle="Log correct/wrong ratios to build confidence trends."
      >
        <form onSubmit={handleAddLog} className="flex flex-col gap-4">
          <Select
            label="Subject *"
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
            value={selectedSub}
            onChange={e => setSelectedSub(e.target.value)}
            placeholder="Select Subject"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Questions Solved"
              type="number"
              value={solved}
              onChange={e => setSolved(e.target.value)}
            />
            <Input
              label="Correct Answers"
              type="number"
              value={correct}
              onChange={e => setCorrect(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Wrong Answers"
              type="number"
              value={wrong}
              onChange={e => setWrong(e.target.value)}
            />
            <Input
              label="Skipped Questions"
              type="number"
              value={skipped}
              onChange={e => setSkipped(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Time Taken (minutes)"
              type="number"
              value={timeTaken}
              onChange={e => setTimeTaken(e.target.value)}
            />
            <Select
              label="Difficulty level"
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' }
              ]}
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as any)}
            />
          </div>

          <Textarea
            label="Notes / Focus chapters"
            placeholder="Describe questions topic details..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Session
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
