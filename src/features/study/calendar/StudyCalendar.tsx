import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { StudySession, RevisionEntry, MockTest, Subject } from '@/types/study.types'

export default function StudyCalendar() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [revisions, setRevisions] = useState<RevisionEntry[]>([])
  const [tests, setTests] = useState<MockTest[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 8)) // prefill July 2026 to match seed data
  const [selectedDate, setSelectedDate] = useState('2026-07-08')

  useEffect(() => {
    setSessions(studyERPStorage.getSessions())
    setRevisions(studyERPStorage.getRevisions())
    setTests(studyERPStorage.getTests())
    setSubjects(studyERPStorage.getSubjects())
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Generate date cells
  const cells: (Date | null)[] = []
  // Fill initial offset blanks
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null)
  }
  // Fill dates
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d))
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Format date to ISO key YYYY-MM-DD
  const getISOKey = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Get items for date key
  const getDayItems = (key: string) => {
    const daySess = sessions.filter(s => s.date === key)
    const dayRevs = revisions.filter(r => r.scheduledDate === key)
    const dayTests = tests.filter(t => t.date === key)
    return { daySess, dayRevs, dayTests }
  }

  const getSubName = (subId: string) => {
    return subjects.find(s => s.id === subId)?.name ?? 'General Study'
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const selectedItems = getDayItems(selectedDate)

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Study & Exam Calendar" subtitle="Overview of scheduled revisions, study sessions, and tests" compact />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Calendar Grid card */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card>
            {/* Header navigator */}
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border)] mb-4">
              <h3 className="text-sm font-bold text-[var(--text)]">
                {monthNames[month]} {year}
              </h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={handlePrevMonth}>
                  <ChevronLeft size={14} />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={handleNextMonth}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-[var(--text-3)] mb-2 uppercase">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, idx) => {
                if (!cell) return <div key={idx} className="aspect-square" />
                
                const isoKey = getISOKey(cell)
                const isSelected = isoKey === selectedDate
                const isToday = isoKey === new Date().toISOString().split('T')[0]
                
                const { daySess, dayRevs, dayTests } = getDayItems(isoKey)
                const hasSess = daySess.length > 0
                const hasRevs = dayRevs.length > 0
                const hasTests = dayTests.length > 0

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(isoKey)}
                    className={`aspect-square rounded-[8px] flex flex-col items-center justify-between p-1.5 border transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)]' 
                        : isToday 
                        ? 'bg-[var(--bg-subtle)] border-[var(--text-3)] text-[var(--text)]'
                        : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--bg-hover)] text-[var(--text)]'
                    }`}
                  >
                    <span className="text-[10px] font-bold block">{cell.getDate()}</span>
                    
                    {/* Dots indicators */}
                    <div className="flex gap-0.5 justify-center mt-auto w-full">
                      {hasSess && <span className="w-1 h-1 rounded-full bg-[var(--info)]" title="Study Sessions" />}
                      {hasRevs && <span className="w-1 h-1 rounded-full bg-[var(--warning)]" title="Revisions" />}
                      {hasTests && <span className="w-1 h-1 rounded-full bg-[var(--error)]" title="Mock Exams" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Calendar legend */}
            <div className="flex gap-4 justify-center items-center mt-4 pt-3 border-t border-[var(--border)] text-[10px] text-[var(--text-3)] font-semibold uppercase">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--info)]" />
                <span>Sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                <span>Revisions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)]" />
                <span>Exams</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Selected date panel */}
        <div className="flex flex-col gap-4">
          <SectionHeader title="Events Log" subtitle={`Items on ${selectedDate}`} />
          
          <div className="flex flex-col gap-3">
            {/* Sessions */}
            {selectedItems.daySess.map(sess => (
              <div 
                key={sess.id} 
                className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--text)]">{getSubName(sess.subjectId)}</span>
                  <Badge variant="accent" size="sm">Session</Badge>
                </div>
                <p className="text-[10px] text-[var(--text-3)] mt-1">{sess.startTime} · {sess.studyMethod} · {sess.durationMinutes}m</p>
                {sess.notes && <p className="text-[10px] text-[var(--text-2)] mt-1.5 italic">{sess.notes}</p>}
              </div>
            ))}

            {/* Revisions */}
            {selectedItems.dayRevs.map(rev => (
              <div 
                key={rev.id} 
                className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--text)]">{rev.topicName}</span>
                  <Badge variant="warning" size="sm">Revision {rev.revisionNumber}</Badge>
                </div>
                <p className="text-[10px] text-[var(--text-3)] mt-1">{rev.subjectName} · Spaced repetition due</p>
              </div>
            ))}

            {/* Mock Tests */}
            {selectedItems.dayTests.map(test => (
              <div 
                key={test.id} 
                className="p-3 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--text)]">{test.examName}</span>
                  <Badge variant="error" size="sm">Exam</Badge>
                </div>
                <p className="text-[10px] text-[var(--text-3)] mt-1">Score: {test.marksObtained}/{test.totalMarks} ({test.percentage}%)</p>
              </div>
            ))}

            {selectedItems.daySess.length === 0 && 
             selectedItems.dayRevs.length === 0 && 
             selectedItems.dayTests.length === 0 && (
              <p className="text-xs text-[var(--text-3)] text-center py-8">No scheduled items on this day.</p>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
