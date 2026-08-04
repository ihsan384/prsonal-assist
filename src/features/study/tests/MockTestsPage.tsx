import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Award, Trash2, Filter, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, MetricCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { testAnalyticsService } from '@/services/study/testAnalytics.service'
import type { TestRecord, TestType, Subject, Chapter } from '@/types/study.types'
import { TEST_TYPE_LABELS } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { LogTestModal } from './LogTestModal'
import { TestDetailModal } from './TestDetailModal'

export default function MockTestsPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [tests, setTests] = useState<TestRecord[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])

  // Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [testToEdit, setTestToEdit] = useState<TestRecord | null>(null)
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null)

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<string | null>(null)

  // Filter states
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL')
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const reloadData = () => {
    const allTests = studyERPStorage.getTests().sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime())
    setTests(allTests)
    setSubjects(studyERPStorage.getSubjects().filter(s => s.enabled !== false))
    setChapters(studyERPStorage.getChapters())
  }

  useEffect(() => {
    reloadData()
  }, [])

  // Analytics computation
  const overallStats = testAnalyticsService.getOverallStats(tests)
  const weakChapters = testAnalyticsService.getWeakChapters(tests, chapters, subjects)

  // Filtering
  const filteredTests = tests.filter(t => {
    if (selectedTypeFilter !== 'ALL') {
      if (selectedTypeFilter === 'COMBINED') {
        if (t.testType !== 'COMBINED_TEST') return false
      } else if (t.testType !== selectedTypeFilter) {
        return false
      }
    }
    if (selectedSubjectFilter !== 'ALL') {
      const isSubMatch = t.subjectResults?.some(sr => sr.subjectId === selectedSubjectFilter) ||
                         t.chapterResults?.some(cr => cr.subjectId === selectedSubjectFilter)
      if (!isSubMatch) return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = t.testName.toLowerCase().includes(q)
      const matchSource = t.examSource?.toLowerCase().includes(q)
      if (!matchName && !matchSource) return false
    }
    return true
  })

  const handleOpenEdit = (test: TestRecord) => {
    setTestToEdit(test)
    setIsLogModalOpen(true)
  }

  const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setTestToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (testToDelete) {
      studyERPStorage.removeTest(testToDelete)
      reloadData()
      toast.success('Test log deleted.')
    }
    setIsDeleteOpen(false)
    setTestToDelete(null)
  }

  const handleLogMistake = (test: TestRecord) => {
    const firstSubId = test.subjectResults && test.subjectResults.length > 0 ? test.subjectResults[0].subjectId : ''
    navigate(`/study/mistakes?subjectId=${firstSubId}`)
  }

  return (
    <PageWrapper>
      {/* Header section */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <SectionHeader 
          title="Tests & Exams" 
          subtitle="Track chapter tests, subject exams, combined tests and mock performance." 
          compact 
        />
        <Button 
          variant="primary" 
          size="sm" 
          icon={<Plus size={14} />}
          onClick={() => { setTestToEdit(null); setIsLogModalOpen(true) }}
        >
          Log Test
        </Button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-4">
        <MetricCard
          label="Tests Taken"
          value={overallStats.totalTests}
          change={{ value: overallStats.thisMonthCount, label: 'taken this month' }}
        />
        <MetricCard
          label="Average Score"
          value={`${overallStats.avgScore}%`}
          change={{ value: overallStats.avgAccuracy, label: 'overall accuracy' }}
        />
        <MetricCard
          label="Best Score"
          value={`${overallStats.bestScore}%`}
          change={{ value: 0, label: 'personal record' }}
        />
        <MetricCard
          label="Recent Trend"
          value={`${overallStats.recentTrend >= 0 ? '+' : ''}${overallStats.recentTrend}%`}
          change={{ value: 0, label: overallStats.recentTrend >= 0 ? 'improving trajectory' : 'needs focus' }}
        />
      </div>

      {/* Subject Performance Row */}
      {subjects.length > 0 && tests.length > 0 && (
        <div className="my-4 text-left">
          <SectionHeader title="Subject Test Averages" compact />
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
            {subjects.map(sub => {
              const subAnalytics = testAnalyticsService.getSubjectAnalytics(tests, sub.id)
              return (
                <Card key={sub.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text)]">{sub.name}</span>
                    <Badge variant={subAnalytics.avgScore >= 75 ? 'success' : subAnalytics.avgScore >= 60 ? 'warning' : 'error'}>
                      {subAnalytics.avgScore}% Avg
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[var(--text-3)] mt-2">
                    <span>{subAnalytics.testsCount} Tests taken</span>
                    <span>Best: {subAnalytics.bestScore}%</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Weak Chapter Needs Attention Section */}
      {weakChapters.length > 0 && (
        <div className="my-5 text-left">
          <div className="flex items-center gap-2 bg-[var(--bg-subtle)] p-3 rounded-[12px] border border-[var(--border)]">
            <AlertTriangle size={18} className="text-[var(--warning)] shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[var(--text)]">Needs Attention — Weak Chapters Detected</h4>
              <p className="text-[11px] text-[var(--text-3)]">Identified based on test accuracy & recent test scores.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {weakChapters.slice(0, 4).map(wc => (
              <Card key={wc.chapter.id} className="p-3.5 flex justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text)]">{wc.chapter.name}</span>
                    {wc.subject && <Badge variant="default" size="sm">{wc.subject.name}</Badge>}
                  </div>
                  <p className="text-[10px] text-[var(--error)] font-medium mt-1">
                    {wc.reason}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/study/revision?subjectId=${wc.chapter.subjectId}&chapterId=${wc.chapter.id}`)}
                  >
                    Revise
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => navigate(`/study/questions?subjectId=${wc.chapter.subjectId}&chapterId=${wc.chapter.id}`)}
                  >
                    Practice
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="my-5 text-left flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SectionHeader title="Test History" compact />
          
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              placeholder="Search test name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-48 text-xs"
            />
            <Select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value)}
              className="text-xs w-36"
              options={[{ value: 'ALL', label: 'All Subjects' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
            />
          </div>
        </div>

        {/* Test Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('ALL')}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
              selectedTypeFilter === 'ALL'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-subtle)] text-[var(--text-3)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            All Tests
          </button>
          {(Object.keys(TEST_TYPE_LABELS) as TestType[]).map(typeKey => (
            <button
              key={typeKey}
              type="button"
              onClick={() => setSelectedTypeFilter(typeKey)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                selectedTypeFilter === typeKey
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-3)] hover:text-[var(--text)] border border-[var(--border)]'
              }`}
            >
              {TEST_TYPE_LABELS[typeKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Test Logs List */}
      <div className="text-left">
        {filteredTests.length === 0 ? (
          <EmptyState
            icon={<Award size={24} />}
            title="No test logs found"
            description="Log your Chapter Tests, Subject Exams, Combined Tests, and Mock Performance to track score progress."
            action={
              <Button variant="primary" size="sm" onClick={() => { setTestToEdit(null); setIsLogModalOpen(true) }}>
                Log First Test
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTests.map(test => {
              const scorePct = test.percentage || 0
              return (
                <Card 
                  key={test.id} 
                  className="p-4 hover:border-[var(--accent)]/50 transition-all cursor-pointer"
                  onClick={() => { setSelectedTest(test); setIsDetailModalOpen(true) }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[var(--text)]">{test.testName}</h4>
                        <Badge variant="accent" size="sm">
                          {TEST_TYPE_LABELS[test.testType] || test.testType}
                        </Badge>
                        <Badge variant="default" size="sm">{test.testDate}</Badge>
                        {test.rank && <Badge variant="success" size="sm">Rank: #{test.rank}</Badge>}
                      </div>

                      <p className="text-xs text-[var(--text-2)] mt-2">
                        Score: <span className="font-semibold text-[var(--text)]">{test.score}/{test.maxScore}</span> ({test.percentage}%) · Time: {test.durationMinutes || 0} mins {test.examSource ? `· ${test.examSource}` : ''}
                      </p>

                      {/* Subject Results Pills */}
                      {test.subjectResults && test.subjectResults.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mt-2.5">
                          {test.subjectResults.map(sr => {
                            const sub = subjects.find(s => s.id === sr.subjectId)
                            const pct = sr.maxScore > 0 ? Math.round((sr.score / sr.maxScore) * 100) : 0
                            return (
                              <span key={sr.id} className="text-[10px] bg-[var(--bg-subtle)] border border-[var(--border)] px-2 py-0.5 rounded font-medium text-[var(--text-2)]">
                                {sub?.name || 'Subject'}: <strong className="text-[var(--text)]">{pct}%</strong> ({sr.score}/{sr.maxScore})
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[var(--accent)] block text-right">
                          {scorePct}%
                        </span>
                        <span className="text-[10px] text-[var(--text-3)] block mt-0.5">
                          {scorePct >= 75 ? 'Strong' : scorePct >= 60 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); setSelectedTest(test); setIsDetailModalOpen(true) }}
                      >
                        View Analysis
                      </Button>

                      <button
                        onClick={(e) => handleDeleteClick(test.id, e)}
                        className="text-[var(--text-4)] hover:text-[var(--error)] p-1.5 transition-colors"
                        title="Delete Test Log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {test.notes && (
                    <p className="text-xs text-[var(--text-3)] leading-relaxed border-t border-[var(--border)] pt-2 mt-3 text-left">
                      {test.notes}
                    </p>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Log / Edit Test Modal */}
      <LogTestModal
        isOpen={isLogModalOpen}
        onClose={() => { setIsLogModalOpen(false); setTestToEdit(null) }}
        onSaved={reloadData}
        initialTest={testToEdit}
      />

      {/* Test Detail Analysis Modal */}
      <TestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTest(null) }}
        test={selectedTest}
        onEdit={handleOpenEdit}
        onLogMistake={handleLogMistake}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setTestToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Test Log"
        description="Are you sure you want to permanently delete this test record? Calculated subject and chapter averages will be updated."
      />
    </PageWrapper>
  )
}
