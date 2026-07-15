import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Play } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { Subject, Chapter, Topic, StudySession } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function NewSessionPage() {
  const navigate = useNavigate()
  const toast = useToast()

  // Data selections
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [topics, setTopics] = useState<Topic[]>([])

  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')

  // Form inputs
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [studyMethod, setStudyMethod] = useState<'Pomodoro' | 'Active Recall' | 'Feynman' | 'Practice' | 'Reading' | 'Other'>('Pomodoro')
  const [focusRating, setFocusRating] = useState(4)
  const [understanding, setUnderstanding] = useState('75')
  const [questionsSolved, setQuestionsSolved] = useState('0')
  const [correctAnswers, setCorrectAnswers] = useState('0')
  const [wrongAnswers, setWrongAnswers] = useState('0')
  const [notes, setNotes] = useState('')



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject) {
      toast.error('Please select a subject.')
      return
    }

    const sess: StudySession = {
      id: `sess-${Date.now()}`,
      subjectId: selectedSubject,
      chapterId: selectedChapter || undefined,
      topicId: selectedTopic || undefined,
      date,
      startTime,
      endTime: endTime || startTime,
      durationMinutes: Number(duration) || 30,
      studyMethod,
      focusRating,
      understandingPercentage: Number(understanding) || 70,
      questionsSolved: Number(questionsSolved) ? Number(questionsSolved) : undefined,
      correctAnswers: Number(correctAnswers) ? Number(correctAnswers) : undefined,
      wrongAnswers: Number(wrongAnswers) ? Number(wrongAnswers) : undefined,
      notes: notes.trim() || undefined
    }

    studyERPStorage.addSession(sess)

    // Auto-update chapter progress hours if chapter matches
    if (selectedChapter) {
      const allCh = studyERPStorage.getChapters()
      const updated = allCh.map(ch => {
        if (ch.id === selectedChapter) {
          return {
            ...ch,
            completedHours: ch.completedHours + (sess.durationMinutes / 60)
          }
        }
        return ch
      })
      studyERPStorage.saveChapters(updated)
    }

    toast.success('Study session logged successfully.')
    navigate('/study/sessions')
  }

  useEffect(() => {
    setSubjects(studyERPStorage.getSubjects())
    
    // Prefill start time
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    setStartTime(`${hh}:${mm}`)
  }, [])

  // Sync chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const filteredCh = studyERPStorage.getChapters().filter(c => c.subjectId === selectedSubject)
      setChapters(filteredCh)
      setSelectedChapter('')
      setTopics([])
      setSelectedTopic('')
    } else {
      setChapters([])
      setTopics([])
    }
  }, [selectedSubject])

  // Sync topics when chapter changes
  useEffect(() => {
    if (selectedChapter) {
      const filteredTp = studyERPStorage.getTopics().filter(t => t.chapterId === selectedChapter)
      setTopics(filteredTp)
      setSelectedTopic('')
    } else {
      setTopics([])
    }
  }, [selectedChapter])

  return (
    <PageWrapper>
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<ArrowLeft size={13} />} 
          onClick={() => navigate('/study/sessions')}
          className="-ml-2 text-[var(--text-3)]"
        >
          Session Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pomodoro Timer Launch Card */}
        <div className="flex flex-col gap-4">
          <SectionHeader title="Live Focus Timer" />
          <Card className="text-center py-8 flex flex-col items-center justify-center gap-4 bg-[var(--accent-bg)] border-[var(--accent-border)]">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md">
              <Play size={22} fill="white" className="ml-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--accent-text)]">Pomodoro Focus System</h3>
              <p className="text-xs text-[var(--accent)] mt-1 max-w-[200px] mx-auto">
                Launch the dedicated Pomodoro Timer with auto-logging, break reminders, and cycle tracking.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/study/pomodoro')}
              className="mt-2"
            >
              Launch Pomodoro Timer
            </Button>
          </Card>
        </div>

        {/* Form section */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <SectionHeader title="Log Completed Study Session" />
          <Card>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Subject *"
                  options={subjects.map(s => ({ value: s.id, label: s.name }))}
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  placeholder="Select Subject"
                />
                <Select
                  label="Chapter (optional)"
                  options={chapters.map(c => ({ value: c.id, label: c.name }))}
                  value={selectedChapter}
                  onChange={e => setSelectedChapter(e.target.value)}
                  placeholder="Select Chapter"
                  disabled={!selectedSubject}
                />
                <Select
                  label="Topic (optional)"
                  options={topics.map(t => ({ value: t.id, label: t.name }))}
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  placeholder="Select Topic"
                  disabled={!selectedChapter}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
                <Input
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
                <Input
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
                <Input
                  label="Duration (minutes)"
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Study Method"
                  options={[
                    { value: 'Pomodoro', label: 'Pomodoro' },
                    { value: 'Active Recall', label: 'Active Recall' },
                    { value: 'Feynman', label: 'Feynman Technique' },
                    { value: 'Practice', label: 'Practice Problems' },
                    { value: 'Reading', label: 'Reading / Research' },
                    { value: 'Other', label: 'Other Method' }
                  ]}
                  value={studyMethod}
                  onChange={e => setStudyMethod(e.target.value as any)}
                />
                <Input
                  label="Understanding % (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={understanding}
                  onChange={e => setUnderstanding(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--text-2)]">Focus Rating</label>
                  <div className="flex items-center gap-1.5 h-9">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFocusRating(num)}
                        className={`text-base leading-none cursor-pointer transition-all ${num <= focusRating ? 'text-[var(--warning)]' : 'text-[var(--text-4)]'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[var(--border)] pt-3">
                <Input
                  label="Questions Solved"
                  type="number"
                  value={questionsSolved}
                  onChange={e => setQuestionsSolved(e.target.value)}
                />
                <Input
                  label="Correct Answers"
                  type="number"
                  value={correctAnswers}
                  onChange={e => setCorrectAnswers(e.target.value)}
                />
                <Input
                  label="Wrong Answers"
                  type="number"
                  value={wrongAnswers}
                  onChange={e => setWrongAnswers(e.target.value)}
                />
              </div>

              <Textarea
                label="Study Notes / Key Summary Concepts"
                placeholder="Write equations, theorems, or takeaways..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-3">
                <Button variant="ghost" size="sm" type="button" onClick={() => navigate('/study/sessions')}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Log Study Session
                </Button>
              </div>
            </form>
          </Card>
        </div>

      </div>
    </PageWrapper>
  )
}
