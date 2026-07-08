export interface SyncMetadata {
  createdAt?: string
  updatedAt?: string
  pendingSync?: boolean
  lastSyncedAt?: string | null
  deleted?: boolean
  syncVersion?: number
}

export interface Subject extends SyncMetadata {
  id: string
  name: string
  studyHours: number
  targetHours: number
  completedChapters: number
  pendingChapters: number
  completionPercentage: number // derived or stored
}

export interface Chapter extends SyncMetadata {
  id: string
  subjectId: string
  name: string
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
