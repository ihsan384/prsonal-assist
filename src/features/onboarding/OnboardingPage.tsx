import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, BookOpen, CheckCircle2, ArrowRight, ArrowLeft,
  Sparkles, Layers, Award, User, Book, Check, ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { curriculumService } from '@/services/curriculum/curriculumService'
import type { Board, AcademicStream, SubjectCombination, MasterSubject } from '@/types/study.types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, profile, userFirstName, refreshProfile } = useAuth()
  const toast = useToast()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [fullName, setFullName] = useState(profile?.full_name || userFirstName || '')
  
  // Academic Dependent State
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<string>('')
  
  const [classLevel, setClassLevel] = useState<string>('Plus One')
  
  const [streams, setStreams] = useState<AcademicStream[]>([])
  const [selectedStreamId, setSelectedStreamId] = useState<string>('')
  
  const [combinations, setCombinations] = useState<SubjectCombination[]>([])
  const [selectedCombinationId, setSelectedCombinationId] = useState<string>('')
  
  const [academicGoal, setAcademicGoal] = useState<string>('Boards')
  const [previewSubjects, setPreviewSubjects] = useState<MasterSubject[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Initial Load: Fetch Boards
  useEffect(() => {
    curriculumService.getBoards().then(bList => {
      setBoards(bList)
      if (bList.length > 0) {
        setSelectedBoardId(bList[0].id)
      }
    })
  }, [])

  // 2. Dependent Effect: Board & Class -> Streams
  useEffect(() => {
    if (!selectedBoardId) return
    curriculumService.getStreams(selectedBoardId, classLevel).then(sList => {
      setStreams(sList)
      if (sList.length > 0) {
        setSelectedStreamId(sList[0].id)
      } else {
        setSelectedStreamId('')
        setCombinations([])
        setSelectedCombinationId('')
      }
    })
  }, [selectedBoardId, classLevel])

  // 3. Dependent Effect: Stream -> Combinations
  useEffect(() => {
    if (!selectedStreamId) return
    curriculumService.getCombinations(selectedStreamId).then(cList => {
      setCombinations(cList)
      if (cList.length > 0) {
        setSelectedCombinationId(cList[0].id)
      } else {
        setSelectedCombinationId('')
      }
    })
  }, [selectedStreamId])

  // 4. Dependent Effect: Combination -> Preview Subjects
  useEffect(() => {
    if (!selectedCombinationId) {
      setPreviewSubjects([])
      return
    }
    curriculumService.getCombinationSubjects(selectedCombinationId).then(subs => {
      setPreviewSubjects(subs)
    })
  }, [selectedCombinationId])

  // Pre-fill existing user profile values if returning
  useEffect(() => {
    if (profile?.board_id) setSelectedBoardId(profile.board_id)
    if (profile?.class_level) setClassLevel(profile.class_level)
    if (profile?.stream_id) setSelectedStreamId(profile.stream_id)
    if (profile?.subject_combination_id) setSelectedCombinationId(profile.subject_combination_id)
    if (profile?.academic_goal) setAcademicGoal(profile.academic_goal)
  }, [profile])

  const handleNextStep1 = () => {
    if (!fullName.trim()) {
      toast.error('Please enter your name to proceed.')
      return
    }
    setStep(2)
  }

  const handleNextStep2 = () => {
    if (!selectedBoardId || !selectedStreamId || !selectedCombinationId) {
      toast.error('Please complete all academic selectors.')
      return
    }
    setStep(3)
  }

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true)
    setStep(4)
    toast.info('Building your personalized academic syllabus...')

    try {
      const userId = user?.id || profile?.id || 'guest'

      await curriculumService.applyAcademicSetup({
        userId,
        fullName,
        boardId: selectedBoardId,
        classLevel,
        streamId: selectedStreamId,
        combinationId: selectedCombinationId,
        academicGoal
      })

      await refreshProfile()

      setTimeout(() => {
        toast.success('Curriculum generated! Welcome to Study ERP.')
        navigate('/', { replace: true })
      }, 1500)

    } catch (err) {
      console.error('[Onboarding] Failed to setup curriculum:', err)
      toast.error('Failed to setup curriculum. Please try again.')
      setStep(3)
      setIsSubmitting(false)
    }
  }

  const selectedBoardObj = boards.find(b => b.id === selectedBoardId)
  const selectedStreamObj = streams.find(s => s.id === selectedStreamId)
  const selectedCombObj = combinations.find(c => c.id === selectedCombinationId)

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">Study ERP</h1>
            <p className="text-[10px] text-gray-400">Academic Onboarding</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-300">
          <span className="font-semibold text-indigo-400">Step {step}</span> of 4
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full my-4">
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-400"
            initial={{ width: '25%' }}
            animate={{ width: `${step * 25}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full my-auto py-4">
        <AnimatePresence mode="wait">
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Badge variant="violet" className="mx-auto">Welcome Aboard</Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Let's set up your profile</h2>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  We need a few details to customize your academic dashboard and syllabus tracking.
                </p>
              </div>

              <Card className="bg-[#121623]/80 border-white/10 p-6 space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <User size={14} className="text-indigo-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    Your curriculum and study progress will be locked to your account with full offline support.
                  </p>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleNextStep1}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  Continue to Academic Setup <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Academic Setup */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Academic Details</h2>
                <p className="text-xs text-gray-400">Select your education board, class level, and stream combination.</p>
              </div>

              <Card className="bg-[#121623]/80 border-white/10 p-6 space-y-5 text-left">
                {/* 1. Board Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">1. Education Board</label>
                  <select
                    value={selectedBoardId}
                    onChange={e => setSelectedBoardId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {boards.map(b => (
                      <option key={b.id} value={b.id} className="bg-[#121623] text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Class / Grade Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">2. Class / Grade Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Plus One', 'Plus Two', 'Class 11', 'Class 12'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setClassLevel(lvl)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          classLevel === lvl
                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                            : 'bg-black/20 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Stream Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">3. Academic Stream</label>
                  <select
                    value={selectedStreamId}
                    onChange={e => setSelectedStreamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {streams.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#121623] text-white">
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Subject Combination Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">4. Subject Combination</label>
                  <select
                    value={selectedCombinationId}
                    onChange={e => setSelectedCombinationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {combinations.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#121623] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Target Academic Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                    <Award size={13} className="text-amber-400" /> Target Goal / Exam (Optional)
                  </label>
                  <select
                    value={academicGoal}
                    onChange={e => setAcademicGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="Boards" className="bg-[#121623]">Board Exam Focus (Higher Secondary)</option>
                    <option value="JEE Main & Advanced" className="bg-[#121623]">JEE Main & Advanced (Engineering)</option>
                    <option value="NEET UG" className="bg-[#121623]">NEET UG (Medical Entrance)</option>
                    <option value="KEAM / State CET" className="bg-[#121623]">KEAM / State Entrance</option>
                    <option value="CUET / Foundation" className="bg-[#121623]">CUET / CA Foundation</option>
                  </select>
                </div>
              </Card>

              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-gray-400 hover:text-white text-xs">
                  <ArrowLeft size={14} className="mr-1" /> Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNextStep2}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  Review Subjects <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Confirm Subjects Preview */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <Badge variant="success" className="mx-auto">Auto-Curriculum Ready</Badge>
                <h2 className="text-2xl font-bold tracking-tight">Confirm Your Syllabus</h2>
                <p className="text-xs text-gray-400">
                  The following subjects and chapters will be automatically generated for your ERP dashboard.
                </p>
              </div>

              <Card className="bg-[#121623]/80 border-white/10 p-5 space-y-4 text-left">
                {/* Summary Info */}
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-indigo-400 font-bold block">{selectedBoardObj?.name}</span>
                    <span className="text-gray-300 text-[11px]">{classLevel} • {selectedStreamObj?.name}</span>
                  </div>
                  <Badge variant="violet">{selectedCombObj?.code}</Badge>
                </div>

                {/* Subject List Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Assigned Subjects ({previewSubjects.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {previewSubjects.map(s => (
                      <div
                        key={s.id}
                        className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: s.color || '#6366f1' }}
                          >
                            <Book size={14} />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block">{s.name}</span>
                            <span className="text-[10px] text-gray-400">Full NCERT Syllabus</span>
                          </div>
                        </div>
                        <CheckCircle2 size={15} className="text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setStep(2)} className="text-gray-400 hover:text-white text-xs">
                  <ArrowLeft size={14} className="mr-1" /> Adjust Setup
                </Button>

                <Button
                  variant="primary"
                  onClick={handleCompleteOnboarding}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/25"
                >
                  <Sparkles size={15} /> Confirm & Generate Curriculum
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Finalizing & Loading */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
              <h2 className="text-xl font-bold text-white">Generating Academic Syllabus...</h2>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Setting up subjects, chapters, tracking targets, and personalizing your study workspace.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer info */}
      <div className="max-w-2xl mx-auto w-full text-center text-[10px] text-gray-500 py-2">
        Study ERP • Offline-first curriculum architecture
      </div>
    </div>
  )
}
