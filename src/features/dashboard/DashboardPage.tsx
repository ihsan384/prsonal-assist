import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Flame } from 'lucide-react'
import { Card, MetricCard } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { getGreeting, formatDate, formatTime } from '@/utils/date'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000 * 30)
    return () => clearInterval(interval)
  }, [])

  const greeting = getGreeting()
  const dateStr = formatDate(currentTime)
  const timeStr = formatTime(currentTime)

  // Combined real/mock initial values for Study ERP & general stats
  const stats = {
    studyHours: 4.5,
    studyGoal: 6.0,
    tasksCompleted: 6,
    tasksTotal: 8,
    streak: 14,
    focusScore: 88,
  }

  const quickActions = [
    { label: 'Study Overview', path: '/study', desc: 'Study ERP Hub' },
    { label: 'Subjects & Syllabus', path: '/study/subjects', desc: 'Track 5 core subjects' },
    { label: 'New Study Session', path: '/study/sessions/new', desc: 'Start focus timer' },
    { label: 'Revision Planner', path: '/study/revision', desc: 'Spaced repetition schedule' },
  ]

  const recentSessions = [
    { id: '1', subject: 'Physics', topic: 'Electromagnetism', duration: '45m', date: 'Today, 2:30 PM' },
    { id: '2', subject: 'Mathematics', topic: 'Calculus Limits', duration: '60m', date: 'Today, 11:00 AM' },
    { id: '3', subject: 'Chemistry', topic: 'Organic Synthesis', duration: '30m', date: 'Yesterday' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-10 px-4 max-w-5xl mx-auto w-full pt-4">
      {/* Hero / Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-[var(--border)] mb-6 gap-4">
        <div>
          <span className="text-xs text-[var(--text-3)] font-medium uppercase tracking-wider">{dateStr}</span>
          <h1 className="text-2xl font-bold text-[var(--text)] mt-1 tracking-tight">
            {greeting}, Ihsan
          </h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">Welcome back to your personal operating system.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-right">
            <span className="text-xs text-[var(--text-3)] block font-medium">Daily Streak</span>
            <span className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5 justify-end">
              <Flame size={14} className="text-[var(--warning)] fill-[var(--warning)]" />
              {stats.streak} Days
            </span>
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-right">
            <span className="text-xs text-[var(--text-3)] block font-medium">Local Time</span>
            <span className="text-sm font-bold text-[var(--text)] tabular-nums">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: ERP Overview & Quick Actions */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Quick Actions / Study Links */}
          <div>
            <SectionHeader title="Study ERP Quick Nav" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-start text-left p-4 rounded-[12px] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-all cursor-pointer"
                >
                  <span className="text-sm font-semibold text-[var(--text)]">{action.label}</span>
                  <span className="text-xs text-[var(--text-3)] mt-1">{action.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Metrics / Focus */}
          <div>
            <SectionHeader title="Study Metrics" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricCard
                label="Today's Study"
                value={stats.studyHours}
                unit="h"
                change={{ value: 1.5, label: 'vs yesterday' }}
              />
              <MetricCard
                label="Focus Score"
                value={`${stats.focusScore}%`}
                change={{ value: 4, label: 'above avg' }}
              />
              <MetricCard
                label="Tasks Done"
                value={`${stats.tasksCompleted}/${stats.tasksTotal}`}
                change={{ value: 2, label: 'remaining' }}
              />
            </div>
          </div>

          {/* Today's Focus Box */}
          <Card className="bg-[var(--accent-bg)] border-[var(--accent-border)]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[8px] bg-[var(--bg)] border border-[var(--accent-border)] text-[var(--accent)] shrink-0">
                <BookOpen size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-wider">Today's Study Focus</span>
                <p className="text-sm font-medium text-[var(--accent-text)] mt-1">
                  Complete Electromagnetic Waves questions and log 1 Mock Test.
                </p>
              </div>
            </div>
          </Card>

          {/* Recent sessions */}
          <div>
            <SectionHeader title="Recent Focus Sessions" action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/study/sessions')}>
                View all
              </Button>
            } />
            <Card padding="none">
              <div className="divide-y divide-[var(--border)]">
                {recentSessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3.5 hover:bg-[var(--bg-subtle)] transition-all">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{session.subject}</p>
                      <p className="text-xs text-[var(--text-3)] mt-0.5">{session.topic}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="accent" size="sm">{session.duration}</Badge>
                      <p className="text-[10px] text-[var(--text-4)] mt-1">{session.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>

        {/* Right Column: Progress & Daily schedule */}
        <div className="flex flex-col gap-6">
          
          {/* Progress Overview Card */}
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">Syllabus Progress</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-2)] font-medium">Physics</span>
                  <span className="text-[var(--text-3)]">65%</span>
                </div>
                <ProgressBar value={65} max={100} height={5} color="var(--accent)" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-2)] font-medium">Chemistry</span>
                  <span className="text-[var(--text-3)]">48%</span>
                </div>
                <ProgressBar value={48} max={100} height={5} color="var(--success)" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-2)] font-medium">Mathematics</span>
                  <span className="text-[var(--text-3)]">82%</span>
                </div>
                <ProgressBar value={82} max={100} height={5} color="var(--info)" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-3)]">Total Chapters Done</span>
              <span className="font-semibold text-[var(--text)]">34 of 50</span>
            </div>
          </Card>

          {/* Today's Goals */}
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-3">Today's Checklist</h3>
            <div className="flex flex-col gap-3">
              {[
                { title: 'Revise chemistry formulas', done: true },
                { title: 'Solve 25 maths matrix problems', done: false },
                { title: 'Study computer science networks topic', done: false },
                { title: 'Complete English reading comprehension', done: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={item.done}
                    readOnly
                    className="mt-0.5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <span className={`text-xs ${item.done ? 'line-through text-[var(--text-3)]' : 'text-[var(--text-2)]'}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Short Stats info */}
          <Card className="text-center p-4">
            <h4 className="text-xs text-[var(--text-3)] font-medium uppercase tracking-wider">Weekly Target Goal</h4>
            <p className="text-2xl font-bold text-[var(--text)] mt-1">28.5 / 40h</p>
            <div className="mt-3">
              <ProgressBar value={28.5} max={40} height={6} />
            </div>
            <p className="text-[10.5px] text-[var(--text-3)] mt-2">11.5 hours remaining to hit target</p>
          </Card>

        </div>

      </div>
    </div>
  )
}
