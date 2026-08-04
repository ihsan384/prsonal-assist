import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { curriculumService } from '@/services/curriculum/curriculumService'
import { useToast } from '@/hooks/useToast'
import type { 
  TestType, TestRecord, TestSubjectResult, TestChapterResult, 
  Subject, Chapter 
} from '@/types/study.types'
import { TEST_TYPE_LABELS } from '@/types/study.types'
import { Check, ChevronRight, Award, Plus, Trash2 } from 'lucide-react'

interface LogTestModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  initialTest?: TestRecord | null
}

const EXAM_SOURCES = [
  'School',
  'Coaching',
  'Self Mock',
  'Previous Year Paper',
  'Online Platform',
  'Other'
]

const SCHOOL_EXAM_NAMES = [
  'Unit Test',
  'Class Test',
  'Monthly Test',
  'Mid-Term',
  'Terminal Exam',
  'Christmas Exam',
  'Model Exam',
  'Final Exam',
  'Other'
]

export function LogTestModal({ isOpen, onClose, onSaved, initialTest }: LogTestModalProps) {
  const toast = useToast()

  // Step state: 1 = Type selection, 2 = Details & Selection, 3 = Score & Breakdown
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [testType, setTestType] = useState<TestType>('CHAPTER_TEST')

  // Academic data
  const [activeSubjects, setActiveSubjects] = useState<Subject[]>([])
  const [allChapters, setAllChapters] = useState<Chapter[]>([])

  // Basic Details
  const [testName, setTestName] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [examSource, setExamSource] = useState('School')
  const [examName, setExamName] = useState('Unit Test')

  // Subject / Chapter selections
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [selectedMultiSubjectIds, setSelectedMultiSubjectIds] = useState<string[]>([])

  // Overall Score Mode
  const [isJeeScoring, setIsJeeScoring] = useState(false)
  const [scoreInput, setScoreInput] = useState('42')
  const [maxScoreInput, setMaxScoreInput] = useState('50')

  // Questions breakdown
  const [totalQuestions, setTotalQuestions] = useState('20')
  const [attempted, setAttempted] = useState('18')
  const [correct, setCorrect] = useState('15')
  const [wrong, setWrong] = useState('3')
  const [unattempted, setUnattempted] = useState('2')
  const [positiveMarks, setPositiveMarks] = useState('4')
  const [negativeMarks, setNegativeMarks] = useState('1')

  // Multi-subject Breakdown scores
  const [subjectScores, setSubjectScores] = useState<Record<string, { score: string; maxScore: string; correct?: string; wrong?: string }>>({})

  // Chapter Breakdown scores (for chapter level accuracy)
  const [chapterBreakdown, setChapterBreakdown] = useState<Array<{ chapterId: string; totalQuestions: string; correct: string; wrong: string }>>([])

  // Advanced metadata
  const [rank, setRank] = useState('')
  const [totalCandidates, setTotalCandidates] = useState('')
  const [percentile, setPercentile] = useState('')
  const [notes, setNotes] = useState('')

  // Load active curriculum subjects & chapters
  useEffect(() => {
    if (!isOpen) return

    const subs = studyERPStorage.getSubjects().filter(s => s.enabled !== false)
    setActiveSubjects(subs)
    const chs = studyERPStorage.getChapters()
    setAllChapters(chs)

    if (initialTest) {
      setTestType(initialTest.testType || 'CHAPTER_TEST')
      setTestName(initialTest.testName)
      setTestDate(initialTest.testDate)
      setDurationMinutes(String(initialTest.durationMinutes || 60))
      setExamSource(initialTest.examSource || 'School')
      setExamName(initialTest.examName || '')
      setScoreInput(String(initialTest.score))
      setMaxScoreInput(String(initialTest.maxScore))
      setTotalQuestions(String(initialTest.totalQuestions || ''))
      setAttempted(String(initialTest.attempted || ''))
      setCorrect(String(initialTest.correct || ''))
      setWrong(String(initialTest.wrong || ''))
      setUnattempted(String(initialTest.unattempted || ''))
      setRank(initialTest.rank ? String(initialTest.rank) : '')
      setTotalCandidates(initialTest.totalCandidates ? String(initialTest.totalCandidates) : '')
      setPercentile(initialTest.percentile ? String(initialTest.percentile) : '')
      setNotes(initialTest.notes || '')
      setStep(2)

      if (initialTest.subjectResults && initialTest.subjectResults.length > 0) {
        setSelectedMultiSubjectIds(initialTest.subjectResults.map(sr => sr.subjectId))
        const scoresMap: Record<string, { score: string; maxScore: string; correct?: string; wrong?: string }> = {}
        initialTest.subjectResults.forEach(sr => {
          scoresMap[sr.subjectId] = {
            score: String(sr.score),
            maxScore: String(sr.maxScore),
            correct: String(sr.correct || 0),
            wrong: String(sr.wrong || 0)
          }
        })
        setSubjectScores(scoresMap)
      }

      if (initialTest.chapterResults && initialTest.chapterResults.length > 0) {
        setSelectedSubjectId(initialTest.chapterResults[0].subjectId)
        setSelectedChapterIds(initialTest.chapterResults.map(cr => cr.chapterId))
        setChapterBreakdown(initialTest.chapterResults.map(cr => ({
          chapterId: cr.chapterId,
          totalQuestions: String(cr.totalQuestions || 0),
          correct: String(cr.correct || 0),
          wrong: String(cr.wrong || 0)
        })))
      }
    } else {
      // Reset form
      setStep(1)
      setTestName('')
      setScoreInput('42')
      setMaxScoreInput('50')
      setRank('')
      setTotalCandidates('')
      setPercentile('')
      setNotes('')
      setChapterBreakdown([])
      if (subs.length > 0) {
        setSelectedSubjectId(subs[0].id)
        setSelectedMultiSubjectIds(subs.map(s => s.id))
      }
    }
  }, [isOpen, initialTest])

  // Subject change handler
  const availableChapters = allChapters.filter(c => c.subjectId === selectedSubjectId)

  // Auto-name generation helper
  const handleTypeSelect = (type: TestType) => {
    setTestType(type)
    if (activeSubjects.length > 0) {
      if (type === 'CHAPTER_TEST') {
        setSelectedSubjectId(activeSubjects[0].id)
        const subChs = allChapters.filter(c => c.subjectId === activeSubjects[0].id)
        if (subChs.length > 0) {
          setSelectedChapterIds([subChs[0].id])
          setTestName(`${subChs[0].name.replace(/^\d+\.\s*/, '')} Chapter Test`)
        } else {
          setTestName(`${activeSubjects[0].name} Chapter Test`)
        }
      } else if (type === 'MULTI_CHAPTER_TEST') {
        setSelectedSubjectId(activeSubjects[0].id)
        setTestName(`${activeSubjects[0].name} Multi-Chapter Test`)
      } else if (type === 'SUBJECT_TEST') {
        setSelectedSubjectId(activeSubjects[0].id)
        setTestName(`${activeSubjects[0].name} Full Subject Test`)
      } else if (type === 'COMBINED_TEST') {
        setSelectedMultiSubjectIds(activeSubjects.map(s => s.id))
        setTestName(`Combined Stream Test`)
      } else if (type === 'MOCK_EXAM') {
        setSelectedMultiSubjectIds(activeSubjects.map(s => s.id))
        setTestName(`Full Mock Exam`)
      } else if (type === 'MODEL_EXAM') {
        setSelectedMultiSubjectIds(activeSubjects.map(s => s.id))
        setTestName(`Model Exam`)
      } else if (type === 'SCHOOL_EXAM') {
        setSelectedSubjectId(activeSubjects[0].id)
        setTestName(`Terminal Exam`)
      } else {
        setTestName(`Custom Test`)
      }
    }
    setStep(2)
  }

  // JEE Auto Score Calculator
  useEffect(() => {
    if (isJeeScoring) {
      const cCount = Number(correct) || 0
      const wCount = Number(wrong) || 0
      const pos = Number(positiveMarks) || 4
      const neg = Number(negativeMarks) || 1
      const calculatedScore = (cCount * pos) - (wCount * neg)
      setScoreInput(String(calculatedScore))
    }
  }, [correct, wrong, positiveMarks, negativeMarks, isJeeScoring])

  // Multi-subject breakdown sum calculator
  const isMultiSubject = ['COMBINED_TEST', 'MOCK_EXAM', 'MODEL_EXAM'].includes(testType)

  useEffect(() => {
    if (isMultiSubject && Object.keys(subjectScores).length > 0) {
      let sumObt = 0
      let sumMax = 0
      let sumCorr = 0
      let sumWrng = 0

      selectedMultiSubjectIds.forEach(subId => {
        const sc = subjectScores[subId]
        if (sc) {
          sumObt += Number(sc.score) || 0
          sumMax += Number(sc.maxScore) || 0
          sumCorr += Number(sc.correct) || 0
          sumWrng += Number(sc.wrong) || 0
        }
      })

      if (sumMax > 0) {
        setScoreInput(String(sumObt))
        setMaxScoreInput(String(sumMax))
        if (sumCorr > 0 || sumWrng > 0) {
          setCorrect(String(sumCorr))
          setWrong(String(sumWrng))
        }
      }
    }
  }, [subjectScores, selectedMultiSubjectIds, isMultiSubject])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!testName.trim()) {
      toast.error('Please enter a test name.')
      return
    }

    const score = Number(scoreInput) || 0
    const maxScore = Number(maxScoreInput) || 100

    if (maxScore <= 0) {
      toast.error('Maximum marks must be greater than 0.')
      return
    }

    if (!isJeeScoring && score > maxScore) {
      toast.error('Score obtained cannot exceed maximum marks.')
      return
    }

    const percentage = Math.round((score / maxScore) * 100)

    const newTest: TestRecord = {
      id: initialTest?.id || `test-${Date.now()}`,
      testType,
      testName: testName.trim(),
      testDate,
      durationMinutes: Number(durationMinutes) || 0,
      examSource,
      examName: testType === 'SCHOOL_EXAM' ? examName : undefined,
      score,
      maxScore,
      percentage,
      totalQuestions: totalQuestions ? Number(totalQuestions) : undefined,
      attempted: attempted ? Number(attempted) : undefined,
      correct: correct ? Number(correct) : undefined,
      wrong: wrong ? Number(wrong) : undefined,
      unattempted: unattempted ? Number(unattempted) : undefined,
      positiveMarksPerCorrect: isJeeScoring ? Number(positiveMarks) : undefined,
      negativeMarksPerWrong: isJeeScoring ? Number(negativeMarks) : undefined,
      rank: rank.trim() || undefined,
      totalCandidates: totalCandidates ? Number(totalCandidates) : undefined,
      percentile: percentile ? Number(percentile) : undefined,
      notes: notes.trim() || undefined,

      // Legacy fallback mapping
      marksObtained: score,
      totalMarks: maxScore,
      timeTakenMinutes: Number(durationMinutes) || 0
    }

    // Build subject breakdown records
    const subjectResults: TestSubjectResult[] = []
    if (isMultiSubject && selectedMultiSubjectIds.length > 0) {
      selectedMultiSubjectIds.forEach(subId => {
        const sc = subjectScores[subId] || { score: String(Math.round(score / selectedMultiSubjectIds.length)), maxScore: String(Math.round(maxScore / selectedMultiSubjectIds.length)) }
        subjectResults.push({
          id: `tsr-${newTest.id}-${subId}`,
          testId: newTest.id,
          subjectId: subId,
          score: Number(sc.score) || 0,
          maxScore: Number(sc.maxScore) || 100,
          correct: sc.correct ? Number(sc.correct) : undefined,
          wrong: sc.wrong ? Number(sc.wrong) : undefined
        })
      })
    } else if (selectedSubjectId) {
      subjectResults.push({
        id: `tsr-${newTest.id}-${selectedSubjectId}`,
        testId: newTest.id,
        subjectId: selectedSubjectId,
        score,
        maxScore,
        correct: correct ? Number(correct) : undefined,
        wrong: wrong ? Number(wrong) : undefined
      })
    }

    // Build chapter breakdown records
    const chapterResults: TestChapterResult[] = []
    if (testType === 'CHAPTER_TEST' || testType === 'MULTI_CHAPTER_TEST') {
      const activeChIds = testType === 'CHAPTER_TEST' ? selectedChapterIds.slice(0, 1) : selectedChapterIds
      activeChIds.forEach(chId => {
        const cb = chapterBreakdown.find(c => c.chapterId === chId)
        const chMax = Math.round(maxScore / (activeChIds.length || 1))
        const chScore = Math.round(score / (activeChIds.length || 1))
        chapterResults.push({
          id: `tcr-${newTest.id}-${chId}`,
          testId: newTest.id,
          subjectId: selectedSubjectId,
          chapterId: chId,
          score: chScore,
          maxScore: chMax,
          totalQuestions: cb?.totalQuestions ? Number(cb.totalQuestions) : (totalQuestions ? Math.round(Number(totalQuestions) / activeChIds.length) : undefined),
          correct: cb?.correct ? Number(cb.correct) : (correct ? Math.round(Number(correct) / activeChIds.length) : undefined),
          wrong: cb?.wrong ? Number(cb.wrong) : (wrong ? Math.round(Number(wrong) / activeChIds.length) : undefined)
        })
      })
    }

    if (initialTest) {
      studyERPStorage.updateTest(initialTest.id, newTest, subjectResults, chapterResults)
      toast.success('Test record updated.')
    } else {
      studyERPStorage.addTest(newTest, subjectResults, chapterResults)
      toast.success('Test performance logged.')
    }

    onSaved()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTest ? 'Edit Test Record' : 'Log Test & Exam'}
      subtitle={step === 1 ? 'Step 1 of 3: Select Test Category' : step === 2 ? 'Step 2 of 3: Test Details & Curriculum Selection' : 'Step 3 of 3: Performance Analysis & Breakdown'}
    >
      {/* STEP 1: TEST TYPE SELECTION */}
      {step === 1 && (
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xs text-[var(--text-3)] font-medium">Select the category of academic test you want to record:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(TEST_TYPE_LABELS) as TestType[]).map(typeKey => (
              <button
                key={typeKey}
                type="button"
                onClick={() => handleTypeSelect(typeKey)}
                className="flex items-center justify-between p-3 rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]/10 transition-all text-left group"
              >
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)]">
                    {TEST_TYPE_LABELS[typeKey]}
                  </h4>
                  <p className="text-[10px] text-[var(--text-3)] mt-0.5">
                    {typeKey === 'CHAPTER_TEST' && 'Single chapter score and accuracy'}
                    {typeKey === 'MULTI_CHAPTER_TEST' && 'Module/coaching multi-chapter test'}
                    {typeKey === 'SUBJECT_TEST' && 'Full single-subject syllabus exam'}
                    {typeKey === 'COMBINED_TEST' && 'Stream combined test (PCM / PCMB / Commerce)'}
                    {typeKey === 'MOCK_EXAM' && 'Full entrance / competitive mock test'}
                    {typeKey === 'MODEL_EXAM' && 'Official state or school model exam'}
                    {typeKey === 'SCHOOL_EXAM' && 'Unit tests, terminal exams & finals'}
                    {typeKey === 'CUSTOM_TEST' && 'Custom practice test log'}
                  </p>
                </div>
                <ChevronRight size={14} className="text-[var(--text-4)] group-hover:text-[var(--accent)] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 & 3: FORM */}
      {step > 1 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center bg-[var(--bg-subtle)] p-2.5 rounded-[8px] border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Badge variant="accent">{TEST_TYPE_LABELS[testType]}</Badge>
              <span className="text-xs font-semibold text-[var(--text-2)]">Category Selected</span>
            </div>
            <Button variant="ghost" size="sm" type="button" onClick={() => setStep(1)}>
              Change Category
            </Button>
          </div>

          {step === 2 && (
            <>
              {/* Test Name & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Test Name"
                  placeholder="e.g. Trigonometric Functions Chapter Test"
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                  required
                  autoFocus
                />
                <Input
                  label="Test Date"
                  type="date"
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                  required
                />
              </div>

              {/* Source & School Exam Name */}
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Exam Source"
                  value={examSource}
                  onChange={e => setExamSource(e.target.value)}
                  options={EXAM_SOURCES.map(src => ({ value: src, label: src }))}
                />
                <Input
                  label="Duration (mins)"
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                />
              </div>

              {testType === 'SCHOOL_EXAM' && (
                <Select
                  label="School Exam Name"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  options={SCHOOL_EXAM_NAMES.map(name => ({ value: name, label: name }))}
                />
              )}

              {/* Single Subject vs Multi Subject Selection */}
              {!isMultiSubject ? (
                <div>
                  <Select
                    label="Subject (Active Curriculum)"
                    value={selectedSubjectId}
                    onChange={e => {
                      setSelectedSubjectId(e.target.value)
                      const subChs = allChapters.filter(c => c.subjectId === e.target.value)
                      if (subChs.length > 0) setSelectedChapterIds([subChs[0].id])
                    }}
                    options={activeSubjects.map(sub => ({ value: sub.id, label: sub.name }))}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text)]">Select Combined Stream Subjects</label>
                  <div className="flex items-center gap-2 flex-wrap bg-[var(--bg-subtle)] p-2.5 rounded-[8px] border border-[var(--border)]">
                    {activeSubjects.map(sub => {
                      const isChecked = selectedMultiSubjectIds.includes(sub.id)
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              if (selectedMultiSubjectIds.length > 1) {
                                setSelectedMultiSubjectIds(selectedMultiSubjectIds.filter(id => id !== sub.id))
                              }
                            } else {
                              setSelectedMultiSubjectIds([...selectedMultiSubjectIds, sub.id])
                            }
                          }}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                            isChecked 
                              ? 'bg-[var(--accent)] text-white' 
                              : 'bg-[var(--bg-card)] text-[var(--text-3)] border border-[var(--border)]'
                          }`}
                        >
                          {isChecked ? '✓ ' : ''}{sub.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Chapter selection for Chapter / Multi-chapter test */}
              {(testType === 'CHAPTER_TEST' || testType === 'MULTI_CHAPTER_TEST') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    {testType === 'CHAPTER_TEST' ? 'Select Chapter' : 'Select Multiple Chapters'}
                  </label>
                  {availableChapters.length === 0 ? (
                    <p className="text-xs text-[var(--text-3)] italic">No curriculum chapters available for this subject.</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto flex flex-col gap-1 border border-[var(--border)] rounded-[8px] p-2 bg-[var(--bg-subtle)]">
                      {availableChapters.map(ch => {
                        const isSelected = selectedChapterIds.includes(ch.id)
                        return (
                          <label key={ch.id} className="flex items-center gap-2 text-xs text-[var(--text)] p-1.5 rounded hover:bg-[var(--bg-card)] cursor-pointer">
                            <input
                              type={testType === 'CHAPTER_TEST' ? 'radio' : 'checkbox'}
                              name="chapterSelect"
                              checked={isSelected}
                              onChange={() => {
                                if (testType === 'CHAPTER_TEST') {
                                  setSelectedChapterIds([ch.id])
                                  setTestName(`${ch.name.replace(/^\d+\.\s*/, '')} Chapter Test`)
                                } else {
                                  if (isSelected) {
                                    setSelectedChapterIds(selectedChapterIds.filter(id => id !== ch.id))
                                  } else {
                                    setSelectedChapterIds([...selectedChapterIds, ch.id])
                                  }
                                }
                              }}
                              className="accent-[var(--accent)]"
                            />
                            <span>{ch.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Score / Marks Input */}
              <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[var(--text)]">Overall Score & Marks</h4>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--text-3)] cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isJeeScoring} 
                      onChange={e => setIsJeeScoring(e.target.checked)}
                      className="accent-[var(--accent)]"
                    />
                    <span>JEE +4/-1 Marking Scheme</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Score Obtained"
                    type="number"
                    value={scoreInput}
                    onChange={e => setScoreInput(e.target.value)}
                    required
                    readOnly={isMultiSubject && Object.keys(subjectScores).length > 0}
                  />
                  <Input
                    label="Maximum Marks"
                    type="number"
                    value={maxScoreInput}
                    onChange={e => setMaxScoreInput(e.target.value)}
                    required
                    readOnly={isMultiSubject && Object.keys(subjectScores).length > 0}
                  />
                </div>

                {/* Score Preview Badge */}
                <div className="flex items-center justify-between bg-[var(--bg-subtle)] p-2 rounded-[8px] text-xs">
                  <span className="text-[var(--text-3)]">Calculated Percentage:</span>
                  <span className="font-bold text-[var(--accent)]">
                    {Number(maxScoreInput) > 0 ? Math.round((Number(scoreInput) / Number(maxScoreInput)) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="primary" size="sm" type="button" onClick={() => setStep(3)}>
                  Next: Add Detailed Analysis
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Multi-subject score breakdown */}
              {isMultiSubject && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-[var(--text)]">Subject-wise Marks Breakdown</h4>
                  <div className="flex flex-col gap-2 border border-[var(--border)] p-2.5 rounded-[8px] bg-[var(--bg-subtle)]">
                    {selectedMultiSubjectIds.map(subId => {
                      const sub = activeSubjects.find(s => s.id === subId)
                      const current = subjectScores[subId] || { score: '40', maxScore: '60' }
                      return (
                        <div key={subId} className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-semibold text-[var(--text)] w-28 shrink-0">{sub?.name || 'Subject'}</span>
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <Input
                              placeholder="Score"
                              type="number"
                              value={current.score}
                              onChange={e => setSubjectScores({
                                ...subjectScores,
                                [subId]: { ...current, score: e.target.value }
                              })}
                            />
                            <Input
                              placeholder="Max Marks"
                              type="number"
                              value={current.maxScore}
                              onChange={e => setSubjectScores({
                                ...subjectScores,
                                [subId]: { ...current, maxScore: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Questions counts breakdown */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-[var(--text)]">Questions & Accuracy Details (Optional)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Input
                    label="Total Questions"
                    type="number"
                    value={totalQuestions}
                    onChange={e => setTotalQuestions(e.target.value)}
                  />
                  <Input
                    label="Attempted"
                    type="number"
                    value={attempted}
                    onChange={e => setAttempted(e.target.value)}
                  />
                  <Input
                    label="Correct Answers"
                    type="number"
                    value={correct}
                    onChange={e => setCorrect(e.target.value)}
                  />
                  <Input
                    label="Wrong Answers"
                    type="number"
                    value={wrong}
                    onChange={e => setWrong(e.target.value)}
                  />
                </div>
              </div>

              {/* Advanced metrics: Rank, Candidates, Percentile */}
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Rank (Optional)"
                  placeholder="e.g. 142"
                  value={rank}
                  onChange={e => setRank(e.target.value)}
                />
                <Input
                  label="Total Candidates"
                  type="number"
                  placeholder="e.g. 20000"
                  value={totalCandidates}
                  onChange={e => setTotalCandidates(e.target.value)}
                />
                <Input
                  label="Percentile"
                  type="number"
                  placeholder="e.g. 94.5"
                  value={percentile}
                  onChange={e => setPercentile(e.target.value)}
                />
              </div>

              {/* Exam notes */}
              <Textarea
                label="Exam Analysis Notes"
                placeholder="Record weak topics, formula errors, or exam day strategy..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <div className="flex justify-between items-center mt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Test Performance
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </Modal>
  )
}
