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

export interface Topic extends SyncMetadata {
  id: string
  chapterId: string
  name: string
  status: 'not_started' | 'in_progress' | 'mastered'
  understandingPercentage: number
  questionsSolved: number
  mistakes: number
  revisionNeeded: boolean
  notes: string
}

export interface StudySession extends SyncMetadata {
  id: string
  subjectId: string
  chapterId?: string
  topicId?: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  durationMinutes: number
  studyMethod: 'Pomodoro' | 'Active Recall' | 'Feynman' | 'Practice' | 'Reading' | 'Other'
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

export interface MockTest extends SyncMetadata {
  id: string
  examName: string
  date: string // YYYY-MM-DD
  marksObtained: number
  totalMarks: number
  percentage: number
  timeTakenMinutes: number
  rank?: string
  mistakesCount: number
  weakAreas: string[]
  notes?: string
}

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
