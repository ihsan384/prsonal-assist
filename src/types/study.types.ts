export interface SyncMetadata {
  createdAt?: string
  updatedAt?: string
  pendingSync?: boolean
  lastSyncedAt?: string | null
  deleted?: boolean
  syncVersion?: number
}

export interface Board {
  id: string
  name: string
  code: string
}

export interface AcademicStream {
  id: string
  boardId: string
  classLevel: string // e.g. "Plus One", "Plus Two", "Class 11", "Class 12"
  name: string
  code: string
}

export interface SubjectCombination {
  id: string
  streamId: string
  name: string
  code: string
}

export interface CombinationSubject {
  combinationId: string
  subjectId: string
  isOptional?: boolean
}

export interface MasterSubject {
  id: string
  name: string
  code: string
  icon?: string
  color?: string
}

export interface MasterChapter {
  id: string
  subjectId: string
  boardId: string
  classLevel: string
  chapterNumber: number
  chapterName: string
  sectionName?: string // e.g. "Unit I — Sets and Functions", "Part 1", "Statistics for Economics"
  bookPart?: string // e.g. "Part 1", "Part 2", "Book I", "Book II"
  sortOrder?: number
  estimatedHours?: number
}

export interface UserSubject extends SyncMetadata {
  id: string
  userId: string
  subjectId: string
  enabled: boolean
}

export interface AcademicProfile {
  boardId?: string
  classLevel?: string
  streamId?: string
  subjectCombinationId?: string
  academicGoal?: string
  onboardingCompleted?: boolean
}

export interface Subject extends SyncMetadata {
  id: string
  name: string
  code?: string
  boardId?: string
  classLevel?: string
  subjectId?: string // links to master curriculum subject ID
  studyHours: number
  targetHours: number
  completedChapters: number
  pendingChapters: number
  completionPercentage: number // derived or stored
  enabled?: boolean // whether subject is active in current combination
  icon?: string
  color?: string
}

export interface Chapter extends SyncMetadata {
  id: string
  subjectId: string
  name: string
  chapterNumber?: number
  sectionName?: string
  bookPart?: string
  sortOrder?: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'not_started' | 'in_progress' | 'completed'
  estimatedHours: number
  completedHours: number
  notes: string
  revisionCount: number
  confidencePercentage: number
}

export type TopicStatus = 'not_started' | 'learning' | 'practicing' | 'mastered'
export type ChapterStatus = 'not_started' | 'in_progress' | 'covered' | 'mastered'
export type StudyType = 'CONCEPT_LEARNING' | 'PROBLEM_SOLVING' | 'REVISION' | 'PYQ_PRACTICE' | 'MOCK_ANALYSIS' | 'LECTURE' | 'SELF_STUDY' | 'OTHER'
export type SessionSource = 'POMODORO' | 'MANUAL' | 'STOPWATCH' | 'REVISION' | 'PRACTICE' | 'IMPORTED'

export interface CurriculumTopic {
  id: string
  chapterId: string
  topicNumber: number
  topicName: string
  description?: string
  sortOrder?: number
  active?: boolean
}

export interface Topic extends SyncMetadata {
  id: string
  chapterId: string
  name: string
  status: TopicStatus
  understandingPercentage: number
  questionsSolved: number
  mistakes: number
  revisionNeeded: boolean
  notes: string
  sortOrder?: number
  isCustom?: boolean
}

export interface StudySession extends SyncMetadata {
  id: string
  subjectId: string
  chapterId?: string
  topicId?: string
  topicIds?: string[]
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  durationMinutes: number
  studyMethod: 'Pomodoro' | 'Active Recall' | 'Feynman' | 'Practice' | 'Reading' | 'Other'
  studyType?: StudyType
  source?: SessionSource
  focusRating: number // 1-5
  understandingPercentage: number // 0-100
  questionsSolved?: number
  correctAnswers?: number
  wrongAnswers?: number
  notes?: string
}

export interface RevisionEntry extends SyncMetadata {
  id: string
  topicId: string
  topicName: string
  subjectName: string
  revisionNumber: number
  scheduledDate: string // YYYY-MM-DD
  completed: boolean
  completedDate?: string
  confidence: number // 1-5
}

export interface QuestionLog extends SyncMetadata {
  id: string
  subjectId: string
  chapterId?: string
  date: string // YYYY-MM-DD
  questionsSolved: number
  correct: number
  wrong: number
  skipped: number
  accuracyPercentage: number
  timeTakenMinutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  notes?: string
}

export type TestType = 
  | 'CHAPTER_TEST' 
  | 'MULTI_CHAPTER_TEST' 
  | 'SUBJECT_TEST' 
  | 'COMBINED_TEST' 
  | 'MOCK_EXAM' 
  | 'MODEL_EXAM' 
  | 'SCHOOL_EXAM' 
  | 'CUSTOM_TEST'

export const TEST_TYPE_LABELS: Record<TestType, string> = {
  CHAPTER_TEST: 'Chapter Test',
  MULTI_CHAPTER_TEST: 'Multi-Chapter Test',
  SUBJECT_TEST: 'Subject Test',
  COMBINED_TEST: 'Combined Test',
  MOCK_EXAM: 'Mock Exam',
  MODEL_EXAM: 'Model Exam',
  SCHOOL_EXAM: 'School Exam',
  CUSTOM_TEST: 'Custom Test'
}

export interface TestSubjectResult extends SyncMetadata {
  id: string
  testId: string
  subjectId: string
  score: number
  maxScore: number
  totalQuestions?: number
  correct?: number
  wrong?: number
  unattempted?: number
}

export interface TestChapterResult extends SyncMetadata {
  id: string
  testId: string
  subjectId: string
  chapterId: string
  score?: number
  maxScore?: number
  totalQuestions?: number
  attempted?: number
  correct?: number
  wrong?: number
  unattempted?: number
}

export interface TestRecord extends SyncMetadata {
  id: string
  userId?: string
  academicProfileId?: string
  testType: TestType
  testName: string
  testDate: string // YYYY-MM-DD
  date?: string // Alias for testDate
  durationMinutes: number
  examSource?: string
  examName?: string
  score: number
  maxScore: number
  percentage: number
  totalQuestions?: number
  attempted?: number
  correct?: number
  wrong?: number
  unattempted?: number
  positiveMarksPerCorrect?: number
  negativeMarksPerWrong?: number
  rank?: string
  totalCandidates?: number
  percentile?: number
  notes?: string

  // Associated subject and chapter results
  subjectResults?: TestSubjectResult[]
  chapterResults?: TestChapterResult[]

  // Legacy fields for backward compatibility
  marksObtained?: number
  totalMarks?: number
  timeTakenMinutes?: number
  mistakesCount?: number
  weakAreas?: string[]
}

export type MockTest = TestRecord

export interface Mistake extends SyncMetadata {
  id: string
  subjectId: string
  chapterId?: string
  question: string
  correctSolution: string
  reason: string
  category: 'Silly Error' | 'Conceptual Gap' | 'Time Pressure' | 'Calculation Error' | 'Other'
  revisionStatus: 'review_needed' | 'reviewed' | 'resolved'
  dateAdded: string
}

export interface Formula extends SyncMetadata {
  id: string
  subjectId: string
  chapterId?: string
  name: string
  expression: string // formula LaTeX/Text
  description: string
  example?: string
  isFavourite: boolean
}

export interface StudyNote extends SyncMetadata {
  id: string
  title: string
  content: string // Markdown text
  isPinned: boolean
  tags: string[]
  dateCreated: string
  dateUpdated: string
}
