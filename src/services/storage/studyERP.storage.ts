import { memoryStore } from './MemoryStore'
import { STORES } from './IndexedDB'
import type { 
  Subject, Chapter, Topic, StudySession, RevisionEntry, 
  QuestionLog, MockTest, Mistake, Formula, StudyNote 
} from '@/types/study.types'

export const studyERPStorage = {
  // Subjects
  getSubjects: () => memoryStore.subjects.filter(s => !s.deleted),
  saveSubjects: (subjects: Subject[]) => {
    subjects.forEach(s => {
      const record = { ...s, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.SUBJECTS, memoryStore.subjects, record)
    })
  },
  addSubject: (subject: Subject) => {
    const record = { ...subject, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.SUBJECTS, memoryStore.subjects, record)
  },

  // Chapters
  getChapters: () => memoryStore.chapters.filter(c => !c.deleted),
  saveChapters: (chapters: Chapter[]) => {
    chapters.forEach(c => {
      const record = { ...c, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.CHAPTERS, memoryStore.chapters, record)
    })
  },
  addChapter: (chapter: Chapter) => {
    const record = { ...chapter, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.CHAPTERS, memoryStore.chapters, record)
  },

  // Topics
  getTopics: () => memoryStore.topics.filter(t => !t.deleted),
  saveTopics: (topics: Topic[]) => {
    topics.forEach(t => {
      const record = { ...t, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.TOPICS, memoryStore.topics, record)
    })
  },
  addTopic: (topic: Topic) => {
    const record = { ...topic, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.TOPICS, memoryStore.topics, record)
  },

  // Sessions
  getSessions: () => memoryStore.sessions.filter(s => !s.deleted),
  saveSessions: (sessions: StudySession[]) => {
    sessions.forEach(s => {
      const record = { ...s, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.SESSIONS, memoryStore.sessions, record)
    })
  },
  addSession: (session: StudySession) => {
    const record = { ...session, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.SESSIONS, memoryStore.sessions, record)
  },

  // Revisions
  getRevisions: () => memoryStore.revisions.filter(r => !r.deleted),
  saveRevisions: (revisions: RevisionEntry[]) => {
    revisions.forEach(r => {
      const record = { ...r, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.REVISIONS, memoryStore.revisions, record)
    })
  },
  addRevision: (revision: RevisionEntry) => {
    const record = { ...revision, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.REVISIONS, memoryStore.revisions, record)
  },

  // Questions
  getQuestions: () => memoryStore.questions.filter(q => !q.deleted),
  saveQuestions: (questions: QuestionLog[]) => {
    questions.forEach(q => {
      const record = { ...q, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.QUESTIONS, memoryStore.questions, record)
    })
  },
  addQuestion: (question: QuestionLog) => {
    const record = { ...question, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.QUESTIONS, memoryStore.questions, record)
  },

  // Tests
  getTests: () => memoryStore.tests.filter(t => !t.deleted),
  saveTests: (tests: MockTest[]) => {
    tests.forEach(t => {
      const record = { ...t, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.TESTS, memoryStore.tests, record)
    })
  },
  addTest: (test: MockTest) => {
    const record = { ...test, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.TESTS, memoryStore.tests, record)
  },

  // Mistakes
  getMistakes: () => memoryStore.mistakes.filter(m => !m.deleted),
  saveMistakes: (mistakes: Mistake[]) => {
    mistakes.forEach(m => {
      const record = { ...m, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.MISTAKES, memoryStore.mistakes, record)
    })
  },
  addMistake: (mistake: Mistake) => {
    const record = { ...mistake, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.MISTAKES, memoryStore.mistakes, record)
  },

  // Formulas
  getFormulas: () => memoryStore.formulas.filter(f => !f.deleted),
  saveFormulas: (formulas: Formula[]) => {
    formulas.forEach(f => {
      const record = { ...f, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.FORMULAS, memoryStore.formulas, record)
    })
  },
  addFormula: (formula: Formula) => {
    const record = { ...formula, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.FORMULAS, memoryStore.formulas, record)
  },

  // Notes
  getNotes: () => memoryStore.notes.filter(n => !n.deleted),
  saveNotes: (notes: StudyNote[]) => {
    notes.forEach(n => {
      const record = { ...n, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.NOTES, memoryStore.notes, record)
    })
  },
  addNote: (note: StudyNote) => {
    const record = { ...note, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    memoryStore.saveToStore(STORES.NOTES, memoryStore.notes, record)
  },
  
  // Deletion helper methods
  removeSession: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.SESSIONS, memoryStore.sessions, id)
  },
  removeNote: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.NOTES, memoryStore.notes, id)
  },
  removeFormula: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.FORMULAS, memoryStore.formulas, id)
  },
  removeMistake: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.MISTAKES, memoryStore.mistakes, id)
  },
  removeTest: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.TESTS, memoryStore.tests, id)
  }
}
