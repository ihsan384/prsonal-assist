import type { 
  Subject, Chapter, Topic, StudySession, RevisionEntry, 
  QuestionLog, MockTest, Mistake, Formula, StudyNote 
} from '@/types/study.types'

const KEYS = {
  SUBJECTS: 'ihsanos_subjects',
  CHAPTERS: 'ihsanos_chapters',
  TOPICS: 'ihsanos_topics',
  SESSIONS: 'ihsanos_sessions',
  REVISIONS: 'ihsanos_revisions',
  QUESTIONS: 'ihsanos_questions',
  TESTS: 'ihsanos_tests',
  MISTAKES: 'ihsanos_mistakes',
  FORMULAS: 'ihsanos_formulas',
  NOTES: 'ihsanos_notes'
}

// Initial Data Population
const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-phy', name: 'Physics', studyHours: 24, targetHours: 50, completedChapters: 4, pendingChapters: 6, completionPercentage: 40 },
  { id: 'sub-che', name: 'Chemistry', studyHours: 18, targetHours: 45, completedChapters: 3, pendingChapters: 7, completionPercentage: 30 },
  { id: 'sub-mat', name: 'Mathematics', studyHours: 35, targetHours: 60, completedChapters: 6, pendingChapters: 4, completionPercentage: 60 },
  { id: 'sub-eng', name: 'English', studyHours: 8, targetHours: 20, completedChapters: 2, pendingChapters: 3, completionPercentage: 40 },
  { id: 'sub-cs', name: 'Computer Science', studyHours: 15, targetHours: 35, completedChapters: 3, pendingChapters: 5, completionPercentage: 37 }
]

const INITIAL_CHAPTERS: Chapter[] = [
  { id: 'ch-phy-1', subjectId: 'sub-phy', name: 'Electromagnetism', priority: 'high', difficulty: 'hard', status: 'in_progress', estimatedHours: 12, completedHours: 8, notes: 'Revise Biot-Savart Law and Ampere Law equations before mock exam.', revisionCount: 2, confidencePercentage: 70 },
  { id: 'ch-phy-2', subjectId: 'sub-phy', name: 'Optics', priority: 'medium', difficulty: 'medium', status: 'not_started', estimatedHours: 10, completedHours: 0, notes: '', revisionCount: 0, confidencePercentage: 0 },
  
  { id: 'ch-che-1', subjectId: 'sub-che', name: 'Organic Chemistry', priority: 'high', difficulty: 'hard', status: 'in_progress', estimatedHours: 15, completedHours: 6, notes: 'Focus on SN1/SN2 nucleophilic substitution mechanisms.', revisionCount: 1, confidencePercentage: 55 },
  
  { id: 'ch-mat-1', subjectId: 'sub-mat', name: 'Calculus', priority: 'urgent', difficulty: 'hard', status: 'in_progress', estimatedHours: 18, completedHours: 12, notes: 'Practice integration by parts and trigonometric substitutions.', revisionCount: 3, confidencePercentage: 80 },
  { id: 'ch-mat-2', subjectId: 'sub-mat', name: 'Matrices', priority: 'medium', difficulty: 'easy', status: 'completed', estimatedHours: 6, completedHours: 6, notes: 'Covered Cramers rule and determinants.', revisionCount: 2, confidencePercentage: 95 }
]

const INITIAL_TOPICS: Topic[] = [
  { id: 'tp-phy-1-1', chapterId: 'ch-phy-1', name: 'Biot-Savart Law', status: 'in_progress', understandingPercentage: 75, questionsSolved: 15, mistakes: 2, revisionNeeded: true, notes: 'Magnetic field due to a straight wire segment.' },
  { id: 'tp-phy-1-2', chapterId: 'ch-phy-1', name: 'Ampere Circuital Law', status: 'mastered', understandingPercentage: 90, questionsSolved: 10, mistakes: 0, revisionNeeded: false, notes: 'Highly symmetrical configurations.' },
  
  { id: 'tp-mat-1-1', chapterId: 'ch-mat-1', name: 'Limits and Continuity', status: 'mastered', understandingPercentage: 95, questionsSolved: 30, mistakes: 1, revisionNeeded: false, notes: 'L Hospital rule is extremely useful.' },
  { id: 'tp-mat-1-2', chapterId: 'ch-mat-1', name: 'Integration by Parts', status: 'in_progress', understandingPercentage: 70, questionsSolved: 25, mistakes: 4, revisionNeeded: true, notes: 'Remember ILATE rule for function priority.' }
]

const INITIAL_SESSIONS: StudySession[] = [
  { id: 'sess-1', subjectId: 'sub-mat', chapterId: 'ch-mat-1', topicId: 'tp-mat-1-2', date: '2026-07-08', startTime: '10:00', endTime: '11:00', durationMinutes: 60, studyMethod: 'Practice', focusRating: 4, understandingPercentage: 75, questionsSolved: 15, correctAnswers: 11, wrongAnswers: 4, notes: 'Worked on integration by parts problems.' },
  { id: 'sess-2', subjectId: 'sub-phy', chapterId: 'ch-phy-1', topicId: 'tp-phy-1-1', date: '2026-07-08', startTime: '14:30', endTime: '15:15', durationMinutes: 45, studyMethod: 'Pomodoro', focusRating: 5, understandingPercentage: 80, questionsSolved: 8, correctAnswers: 6, wrongAnswers: 2, notes: 'Did active recall on Biot Savart Law applications.' }
]

const INITIAL_REVISIONS: RevisionEntry[] = [
  { id: 'rev-1', topicId: 'tp-phy-1-1', topicName: 'Biot-Savart Law', subjectName: 'Physics', revisionNumber: 1, scheduledDate: '2026-07-10', completed: false, confidence: 3 },
  { id: 'rev-2', topicId: 'tp-mat-1-2', topicName: 'Integration by Parts', subjectName: 'Mathematics', revisionNumber: 2, scheduledDate: '2026-07-09', completed: false, confidence: 4 }
]

const INITIAL_QUESTIONS: QuestionLog[] = [
  { id: 'qlog-1', subjectId: 'sub-mat', chapterId: 'ch-mat-1', date: '2026-07-08', questionsSolved: 25, correct: 20, wrong: 4, skipped: 1, accuracyPercentage: 80, timeTakenMinutes: 45, difficulty: 'medium', notes: 'Mainly integration by parts.' }
]

const INITIAL_TESTS: MockTest[] = [
  { id: 'test-1', examName: 'Midterm Calculus Evaluation', date: '2026-07-05', marksObtained: 85, totalMarks: 100, percentage: 85, timeTakenMinutes: 90, rank: '3rd', mistakesCount: 4, weakAreas: ['Trigonometric substitution', 'Continuity proofs'], notes: 'Solid performance. Need to work on speed for difficult integration proofs.' }
]

const INITIAL_MISTAKES: Mistake[] = [
  { id: 'mst-1', subjectId: 'sub-mat', chapterId: 'ch-mat-1', question: 'Evaluate Integral of x * ln(x) dx.', correctSolution: '(x^2 / 2) * ln(x) - x^2 / 4 + C', reason: 'Forgot to integrate the second part correctly, subtracted x^2/2 instead of x^2/4.', category: 'Silly Error', revisionStatus: 'review_needed', dateAdded: '2026-07-08' }
]

const INITIAL_FORMULAS: Formula[] = [
  { id: 'form-1', subjectId: 'sub-mat', chapterId: 'ch-mat-1', name: 'Integration by Parts', expression: '∫ u dv = u v - ∫ v du', description: 'Used to integrate the product of two functions.', example: '∫ x e^x dx = x e^x - e^x + C', isFavourite: true },
  { id: 'form-2', subjectId: 'sub-phy', chapterId: 'ch-phy-1', name: 'Biot-Savart Law', expression: 'dB = (μ₀ / 4π) * (I dl sinθ / r²)', description: 'Calculates magnetic field due to current element.', example: 'Field at the center of circular current loop.', isFavourite: false }
]

const INITIAL_NOTES: StudyNote[] = [
  { id: 'note-1', title: 'Calculus Trigonometric Integrals Guide', content: '### Key Trigonometric Integrals\n\n1. `∫ sin^n(x) cos^m(x) dx`\n   - If power of sine is odd, save one sine factor and convert remaining to cosines.\n   - If power of cosine is odd, save one cosine factor.\n\n2. **Trigonometric Substitution**\n   - For `√(a^2 - x^2)`: use `x = a sin(θ)`\n   - For `√(a^2 + x^2)`: use `x = a tan(θ)`\n   - For `√(x^2 - a^2)`: use `x = a sec(θ)`', isPinned: true, tags: ['Calculus', 'Maths'], dateCreated: '2026-07-06T12:00:00Z', dateUpdated: '2026-07-06T12:00:00Z' }
]

function getStoredOrInit<T>(key: string, initial: T[]): T[] {
  const data = localStorage.getItem(key)
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(data)
}

function setStored<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export const studyERPStorage = {
  // Subjects
  getSubjects: (): Subject[] => getStoredOrInit(KEYS.SUBJECTS, INITIAL_SUBJECTS),
  saveSubjects: (data: Subject[]) => setStored(KEYS.SUBJECTS, data),
  addSubject: (sub: Subject) => {
    const subs = studyERPStorage.getSubjects()
    subs.push(sub)
    studyERPStorage.saveSubjects(subs)
  },

  // Chapters
  getChapters: (): Chapter[] => getStoredOrInit(KEYS.CHAPTERS, INITIAL_CHAPTERS),
  saveChapters: (data: Chapter[]) => setStored(KEYS.CHAPTERS, data),
  addChapter: (ch: Chapter) => {
    const chs = studyERPStorage.getChapters()
    chs.push(ch)
    studyERPStorage.saveChapters(chs)
  },

  // Topics
  getTopics: (): Topic[] => getStoredOrInit(KEYS.TOPICS, INITIAL_TOPICS),
  saveTopics: (data: Topic[]) => setStored(KEYS.TOPICS, data),
  addTopic: (tp: Topic) => {
    const tps = studyERPStorage.getTopics()
    tps.push(tp)
    studyERPStorage.saveTopics(tps)
  },

  // Sessions
  getSessions: (): StudySession[] => getStoredOrInit(KEYS.SESSIONS, INITIAL_SESSIONS),
  saveSessions: (data: StudySession[]) => setStored(KEYS.SESSIONS, data),
  addSession: (sess: StudySession) => {
    const list = studyERPStorage.getSessions()
    list.push(sess)
    studyERPStorage.saveSessions(list)
    
    // Auto update studyHours of corresponding subject
    const subs = studyERPStorage.getSubjects()
    const match = subs.find(s => s.id === sess.subjectId)
    if (match) {
      match.studyHours = Number((match.studyHours + sess.durationMinutes / 60).toFixed(1))
      studyERPStorage.saveSubjects(subs)
    }
  },

  // Revisions
  getRevisions: (): RevisionEntry[] => getStoredOrInit(KEYS.REVISIONS, INITIAL_REVISIONS),
  saveRevisions: (data: RevisionEntry[]) => setStored(KEYS.REVISIONS, data),
  addRevision: (rev: RevisionEntry) => {
    const list = studyERPStorage.getRevisions()
    list.push(rev)
    studyERPStorage.saveRevisions(list)
  },

  // Questions
  getQuestions: (): QuestionLog[] => getStoredOrInit(KEYS.QUESTIONS, INITIAL_QUESTIONS),
  saveQuestions: (data: QuestionLog[]) => setStored(KEYS.QUESTIONS, data),
  addQuestion: (q: QuestionLog) => {
    const list = studyERPStorage.getQuestions()
    list.push(q)
    studyERPStorage.saveQuestions(list)
  },

  // Tests
  getTests: (): MockTest[] => getStoredOrInit(KEYS.TESTS, INITIAL_TESTS),
  saveTests: (data: MockTest[]) => setStored(KEYS.TESTS, data),
  addTest: (t: MockTest) => {
    const list = studyERPStorage.getTests()
    list.push(t)
    studyERPStorage.saveTests(list)
  },

  // Mistakes
  getMistakes: (): Mistake[] => getStoredOrInit(KEYS.MISTAKES, INITIAL_MISTAKES),
  saveMistakes: (data: Mistake[]) => setStored(KEYS.MISTAKES, data),
  addMistake: (m: Mistake) => {
    const list = studyERPStorage.getMistakes()
    list.push(m)
    studyERPStorage.saveMistakes(list)
  },

  // Formulas
  getFormulas: (): Formula[] => getStoredOrInit(KEYS.FORMULAS, INITIAL_FORMULAS),
  saveFormulas: (data: Formula[]) => setStored(KEYS.FORMULAS, data),
  addFormula: (f: Formula) => {
    const list = studyERPStorage.getFormulas()
    list.push(f)
    studyERPStorage.saveFormulas(list)
  },

  // Notes
  getNotes: (): StudyNote[] => getStoredOrInit(KEYS.NOTES, INITIAL_NOTES),
  saveNotes: (data: StudyNote[]) => setStored(KEYS.NOTES, data),
  addNote: (n: StudyNote) => {
    const list = studyERPStorage.getNotes()
    list.push(n)
    studyERPStorage.saveNotes(list)
  }
}
