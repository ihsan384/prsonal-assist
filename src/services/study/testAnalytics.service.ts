import type { TestRecord, TestSubjectResult, TestChapterResult, Subject, Chapter } from '@/types/study.types'

export interface OverallTestStats {
  totalTests: number
  avgScore: number
  bestScore: number
  recentTrend: number // e.g. +8 or -5
  avgAccuracy: number
  thisMonthCount: number
}

export interface SubjectTestAnalytics {
  subjectId: string
  testsCount: number
  avgScore: number
  bestScore: number
  recentScore: number
  recentTests: Array<{
    id: string
    testName: string
    testDate: string
    testType: string
    score: number
    maxScore: number
    percentage: number
  }>
}

export interface ChapterTestAnalytics {
  chapterId: string
  testsCount: number
  totalQuestions: number
  correct: number
  wrong: number
  unattempted: number
  accuracy: number
  avgScore: number
  bestScore: number
  recentScore: number
}

export interface WeakChapterAnalysis {
  chapter: Chapter
  subject?: Subject
  avgScore: number
  accuracy: number
  testsCount: number
  reason: string
}

export interface StrongChapterAnalysis {
  chapter: Chapter
  subject?: Subject
  avgScore: number
  accuracy: number
  testsCount: number
}

export class TestAnalyticsService {
  /** Calculate overall summary stats across all logged tests */
  getOverallStats(tests: TestRecord[]): OverallTestStats {
    if (!tests || tests.length === 0) {
      return {
        totalTests: 0,
        avgScore: 0,
        bestScore: 0,
        recentTrend: 0,
        avgAccuracy: 0,
        thisMonthCount: 0
      }
    }

    const sorted = [...tests].sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
    const percentages = sorted.map(t => t.percentage)
    const avgScore = Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length)
    const bestScore = Math.max(...percentages)

    // Calculate recent trend comparing last half vs first half or last 3 vs previous 3
    let recentTrend = 0
    if (sorted.length >= 2) {
      const mid = Math.floor(sorted.length / 2)
      const older = sorted.slice(0, mid)
      const newer = sorted.slice(mid)
      const olderAvg = older.reduce((sum, t) => sum + t.percentage, 0) / (older.length || 1)
      const newerAvg = newer.reduce((sum, t) => sum + t.percentage, 0) / (newer.length || 1)
      recentTrend = Math.round(newerAvg - olderAvg)
    }

    // Overall accuracy
    let totalCorrect = 0
    let totalAttempted = 0
    sorted.forEach(t => {
      if (t.correct !== undefined && t.wrong !== undefined) {
        totalCorrect += t.correct
        totalAttempted += (t.correct + t.wrong)
      }
    })
    const avgAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : avgScore

    // Tests this month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const thisMonthCount = sorted.filter(t => {
      try {
        const d = new Date(t.testDate)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      } catch {
        return false
      }
    }).length

    return {
      totalTests: sorted.length,
      avgScore,
      bestScore,
      recentTrend,
      avgAccuracy,
      thisMonthCount
    }
  }

  /** Calculate subject-specific test analytics */
  getSubjectAnalytics(tests: TestRecord[], subjectId: string): SubjectTestAnalytics {
    const subjectTests: Array<{
      id: string
      testName: string
      testDate: string
      testType: string
      score: number
      maxScore: number
      percentage: number
    }> = []

    tests.forEach(t => {
      // Direct subject breakdown match or test-level match
      const sResult = t.subjectResults?.find(sr => sr.subjectId === subjectId)
      if (sResult) {
        const pct = sResult.maxScore > 0 ? Math.round((sResult.score / sResult.maxScore) * 100) : 0
        subjectTests.push({
          id: t.id,
          testName: t.testName,
          testDate: t.testDate,
          testType: t.testType,
          score: sResult.score,
          maxScore: sResult.maxScore,
          percentage: pct
        })
      } else if (t.chapterResults?.some(cr => cr.subjectId === subjectId)) {
        const chResults = t.chapterResults.filter(cr => cr.subjectId === subjectId)
        const totalScore = chResults.reduce((sum, c) => sum + (c.score || 0), 0)
        const totalMax = chResults.reduce((sum, c) => sum + (c.maxScore || 100), 0)
        const pct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : t.percentage
        subjectTests.push({
          id: t.id,
          testName: t.testName,
          testDate: t.testDate,
          testType: t.testType,
          score: totalScore,
          maxScore: totalMax,
          percentage: pct
        })
      }
    })

    if (subjectTests.length === 0) {
      return {
        subjectId,
        testsCount: 0,
        avgScore: 0,
        bestScore: 0,
        recentScore: 0,
        recentTests: []
      }
    }

    // Sort by date descending
    subjectTests.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())

    const avgScore = Math.round(subjectTests.reduce((sum, st) => sum + st.percentage, 0) / subjectTests.length)
    const bestScore = Math.max(...subjectTests.map(st => st.percentage))
    const recentScore = subjectTests[0].percentage

    return {
      subjectId,
      testsCount: subjectTests.length,
      avgScore,
      bestScore,
      recentScore,
      recentTests: subjectTests.slice(0, 5)
    }
  }

  /** Calculate chapter-specific test performance */
  getChapterAnalytics(tests: TestRecord[], chapterId: string): ChapterTestAnalytics {
    let testsCount = 0
    let totalQuestions = 0
    let correct = 0
    let wrong = 0
    let unattempted = 0
    const scores: number[] = []

    tests.forEach(t => {
      const cResult = t.chapterResults?.find(cr => cr.chapterId === chapterId)
      if (cResult) {
        testsCount++
        totalQuestions += cResult.totalQuestions || 0
        correct += cResult.correct || 0
        wrong += cResult.wrong || 0
        unattempted += cResult.unattempted || 0
        const pct = cResult.maxScore && cResult.maxScore > 0 
          ? Math.round(((cResult.score || 0) / cResult.maxScore) * 100) 
          : t.percentage
        scores.push(pct)
      }
    })

    if (testsCount === 0) {
      return {
        chapterId,
        testsCount: 0,
        totalQuestions: 0,
        correct: 0,
        wrong: 0,
        unattempted: 0,
        accuracy: 0,
        avgScore: 0,
        bestScore: 0,
        recentScore: 0
      }
    }

    const attempted = correct + wrong
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : (scores.length > 0 ? scores[0] : 0)
    const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    const bestScore = Math.max(...scores)
    const recentScore = scores[scores.length - 1]

    return {
      chapterId,
      testsCount,
      totalQuestions,
      correct,
      wrong,
      unattempted,
      accuracy,
      avgScore,
      bestScore,
      recentScore
    }
  }

  /** Retrieve weak chapters requiring practice/revision */
  getWeakChapters(tests: TestRecord[], chapters: Chapter[], subjects: Subject[]): WeakChapterAnalysis[] {
    const weakList: WeakChapterAnalysis[] = []

    chapters.forEach(ch => {
      const analytics = this.getChapterAnalytics(tests, ch.id)
      // Transparent rule: at least 2 test evaluations OR low performance on a single dedicated chapter test
      if (analytics.testsCount >= 1 && (analytics.avgScore < 65 || analytics.accuracy < 65)) {
        const sub = subjects.find(s => s.id === ch.subjectId)
        weakList.push({
          chapter: ch,
          subject: sub,
          avgScore: analytics.avgScore,
          accuracy: analytics.accuracy,
          testsCount: analytics.testsCount,
          reason: `Average Test Score ${analytics.avgScore}% · Accuracy ${analytics.accuracy}% (${analytics.testsCount} Test${analytics.testsCount > 1 ? 's' : ''})`
        })
      }
    })

    return weakList.sort((a, b) => a.avgScore - b.avgScore)
  }

  /** Retrieve strong chapters */
  getStrongChapters(tests: TestRecord[], chapters: Chapter[], subjects: Subject[]): StrongChapterAnalysis[] {
    const strongList: StrongChapterAnalysis[] = []

    chapters.forEach(ch => {
      const analytics = this.getChapterAnalytics(tests, ch.id)
      if (analytics.testsCount >= 2 && analytics.avgScore >= 85 && analytics.accuracy >= 80) {
        const sub = subjects.find(s => s.id === ch.subjectId)
        strongList.push({
          chapter: ch,
          subject: sub,
          avgScore: analytics.avgScore,
          accuracy: analytics.accuracy,
          testsCount: analytics.testsCount
        })
      }
    })

    return strongList.sort((a, b) => b.avgScore - a.avgScore)
  }
}

export const testAnalyticsService = new TestAnalyticsService()
