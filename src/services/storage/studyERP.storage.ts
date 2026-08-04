import { memoryStore } from './MemoryStore'
import { STORES } from './IndexedDB'
import type { 
  Subject, Chapter, Topic, StudySession, RevisionEntry, 
  QuestionLog, MockTest, TestRecord, TestSubjectResult, TestChapterResult, Mistake, Formula, StudyNote 
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
  updateSubject: (id: string, updates: Partial<Subject>) => {
    const match = memoryStore.subjects.find(s => s.id === id)
    if (match) {
      const updated = { ...match, ...updates, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.SUBJECTS, memoryStore.subjects, updated)
    }
  },

  // Chapters
  getChapters: (subjectId?: string) => {
    if (!subjectId) return memoryStore.chapters.filter(c => !c.deleted)
    const sub = memoryStore.subjects.find(s => s.id === subjectId)
    const subMasterId = sub?.subjectId || (sub?.code ? `sub-${sub.code.toLowerCase()}` : undefined)
    return memoryStore.chapters.filter(c => 
      !c.deleted && (
        c.subjectId === subjectId || 
        (subMasterId && c.subjectId === subMasterId) ||
        (sub?.id && c.subjectId === sub.id)
      )
    )
  },
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
  getTopics: (chapterId?: string) => {
    if (!chapterId) return memoryStore.topics.filter(t => !t.deleted)
    return memoryStore.topics.filter(t => !t.deleted && t.chapterId === chapterId)
  },
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
  updateTopicStatus: (topicId: string, status: Topic['status'], confidence?: number) => {
    const match = memoryStore.topics.find(t => t.id === topicId)
    if (match) {
      const updated = { 
        ...match, 
        status, 
        ...(confidence !== undefined ? { understandingPercentage: confidence } : {}),
        updatedAt: new Date().toISOString() 
      }
      memoryStore.saveToStore(STORES.TOPICS, memoryStore.topics, updated)
    }
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

  // Tests & Exams
  getTests: (): TestRecord[] => {
    const rawTests = memoryStore.tests.filter(t => !t.deleted)
    return rawTests.map(t => {
      // Attach subject & chapter results if present
      const subjectResults = memoryStore.testSubjectResults.filter(sr => !sr.deleted && sr.testId === t.id)
      const chapterResults = memoryStore.testChapterResults.filter(cr => !cr.deleted && cr.testId === t.id)
      return {
        ...t,
        testType: t.testType || 'MOCK_EXAM',
        testName: t.testName || (t as any).examName || 'Test',
        testDate: t.testDate || (t as any).date || new Date().toISOString().split('T')[0],
        durationMinutes: t.durationMinutes || (t as any).timeTakenMinutes || 0,
        score: t.score !== undefined ? t.score : ((t as any).marksObtained || 0),
        maxScore: t.maxScore || (t as any).totalMarks || 100,
        percentage: t.percentage !== undefined ? t.percentage : Math.round((((t as any).marksObtained || 0) / ((t as any).totalMarks || 100)) * 100),
        subjectResults,
        chapterResults
      } as TestRecord
    })
  },
  saveTests: (tests: TestRecord[]) => {
    tests.forEach(t => {
      const record = { ...t, deleted: false, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.TESTS, memoryStore.tests, record)
    })
  },
  addTest: (test: TestRecord, subjectResults?: TestSubjectResult[], chapterResults?: TestChapterResult[]) => {
    const record = { 
      ...test, 
      testType: test.testType || 'MOCK_EXAM',
      testName: test.testName || (test as any).examName || 'Test',
      testDate: test.testDate || (test as any).date || new Date().toISOString().split('T')[0],
      durationMinutes: test.durationMinutes || (test as any).timeTakenMinutes || 0,
      deleted: false, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    }
    memoryStore.saveToStore(STORES.TESTS, memoryStore.tests, record)

    if (subjectResults && subjectResults.length > 0) {
      subjectResults.forEach(sr => {
        const srRecord = { ...sr, testId: test.id, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        memoryStore.saveToStore(STORES.TEST_SUBJECT_RESULTS, memoryStore.testSubjectResults, srRecord)
      })
    }

    if (chapterResults && chapterResults.length > 0) {
      chapterResults.forEach(cr => {
        const crRecord = { ...cr, testId: test.id, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        memoryStore.saveToStore(STORES.TEST_CHAPTER_RESULTS, memoryStore.testChapterResults, crRecord)
      })
    }
  },
  updateTest: (id: string, testUpdates: Partial<TestRecord>, subjectResults?: TestSubjectResult[], chapterResults?: TestChapterResult[]) => {
    const match = memoryStore.tests.find(t => t.id === id)
    if (match) {
      const updated = { ...match, ...testUpdates, updatedAt: new Date().toISOString() }
      memoryStore.saveToStore(STORES.TESTS, memoryStore.tests, updated)
    }

    if (subjectResults !== undefined) {
      // Remove old subject results for this test
      const existingSr = memoryStore.testSubjectResults.filter(sr => sr.testId === id)
      existingSr.forEach(sr => memoryStore.removeFromStore(STORES.TEST_SUBJECT_RESULTS, memoryStore.testSubjectResults, sr.id))
      // Save new
      subjectResults.forEach(sr => {
        const srRecord = { ...sr, testId: id, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        memoryStore.saveToStore(STORES.TEST_SUBJECT_RESULTS, memoryStore.testSubjectResults, srRecord)
      })
    }

    if (chapterResults !== undefined) {
      // Remove old chapter results for this test
      const existingCr = memoryStore.testChapterResults.filter(cr => cr.testId === id)
      existingCr.forEach(cr => memoryStore.removeFromStore(STORES.TEST_CHAPTER_RESULTS, memoryStore.testChapterResults, cr.id))
      // Save new
      chapterResults.forEach(cr => {
        const crRecord = { ...cr, testId: id, deleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        memoryStore.saveToStore(STORES.TEST_CHAPTER_RESULTS, memoryStore.testChapterResults, crRecord)
      })
    }
  },
  removeTest: (id: string) => {
    memoryStore.softDeleteFromStore(STORES.TESTS, memoryStore.tests, id)
    // Also soft delete associated subject and chapter results
    memoryStore.testSubjectResults.filter(sr => sr.testId === id).forEach(sr => {
      memoryStore.softDeleteFromStore(STORES.TEST_SUBJECT_RESULTS, memoryStore.testSubjectResults, sr.id)
    })
    memoryStore.testChapterResults.filter(cr => cr.testId === id).forEach(cr => {
      memoryStore.softDeleteFromStore(STORES.TEST_CHAPTER_RESULTS, memoryStore.testChapterResults, cr.id)
    })
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
  }
}
