import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Flame, AlertCircle, Activity, Radio, Brain, Heart, ChevronRight } from 'lucide-react'
import { Card, MetricCard } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressRing'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { getGreeting, formatDate, formatTime } from '@/utils/date'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { taskStorage, habitStorage, healthRecordStorage, notebookStorage } from '@/services/storage'
import { spotifyService } from '@/services/spotify/SpotifyService'
import { healthConnectService } from '@/services/health/HealthConnectService'
import { syncEngine } from '@/services/sync/SyncService'
import { useAuth } from '@/contexts/AuthContext'
import { useMemoryStoreUpdate } from '@/hooks/useMemoryStoreUpdate'


export default function DashboardPage() {
  const navigate = useNavigate()
  const { userFirstName } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Storage states
  const [sessions, setSessions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [habits, setHabits] = useState<any[]>([])
  
  const [integrationsInfo, setIntegrationsInfo] = useState({
    spotifyConnected: false,
    spotifyPlaylist: 'None',
    hcStatus: 'Disconnected',
    todaySteps: 0,
    sleepSummary: 'No sleep log',
    lastNotebook: 'None',
    lastSync: 'Never'
  })


  useMemoryStoreUpdate()

  const refreshDashboardData = () => {
    setSessions(studyERPStorage.getSessions())
    setSubjects(studyERPStorage.getSubjects())
    setChapters(studyERPStorage.getChapters())
    setTasks(taskStorage.getAll())
    setHabits(habitStorage.getAll())
  }

  useEffect(() => {
    refreshDashboardData()
  })

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000 * 30)
    refreshDashboardData()

    // Load integrations details
    const isSpotifyConnected = spotifyService.isConnected()
    const favPlaylist = localStorage.getItem('spotify_pomodoro_playlist_url')
    const spotifyPlaylist = favPlaylist ? 'Linked Study Playlist' : 'None'
    
    let hcStatusVal = 'Disconnected'
    let todayStepsVal = 0
    let sleepVal = 'No sleep log'
    
    healthConnectService.getStatus().then(status => {
      hcStatusVal = status === 'granted' ? 'Connected' : 'Unavailable / Manual'
      
      const records = healthRecordStorage.getAll()
      const todayStr = new Date().toDateString()
      const todayRecs = records.filter(r => new Date(r.timestamp).toDateString() === todayStr)
      
      const stepsRec = todayRecs.find(r => r.type === 'steps')
      todayStepsVal = stepsRec ? Number(stepsRec.value) : 0
      
      const sleepRec = todayRecs.find(r => r.type === 'sleep_hours')
      sleepVal = sleepRec ? `${sleepRec.value}h slept` : 'No sleep log'
      
      const notebooksList = notebookStorage.getAll()
      const opened = [...notebooksList]
        .filter(n => n.lastOpened)
        .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())[0]
      const lastNotebookVal = opened ? opened.name : 'None'
      
      setIntegrationsInfo({
        spotifyConnected: isSpotifyConnected,
        spotifyPlaylist,
        hcStatus: hcStatusVal,
        todaySteps: todayStepsVal,
        sleepSummary: sleepVal,
        lastNotebook: lastNotebookVal,
        lastSync: syncEngine.lastSyncTime ? new Date(syncEngine.lastSyncTime).toLocaleTimeString() : 'Never'
      })
    })

    return () => clearInterval(interval)
  }, [])


  const greeting = getGreeting()
  const dateStr = formatDate(currentTime)
  const timeStr = formatTime(currentTime)

  // Calculations
  const todayStr = new Date().toDateString()
  const todaySessions = sessions.filter(s => {
    try {
      return new Date(s.date).toDateString() === todayStr
    } catch {
      return false
    }
  })
  const studyHoursToday = todaySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60
  
  // Weekly calculations (Monday start)
  const now = new Date()
  const currentDay = now.getDay()
  const distanceToMon = currentDay === 0 ? 6 : currentDay - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - distanceToMon)
  monday.setHours(0, 0, 0, 0)
  
  const sessionsThisWeek = sessions.filter(s => {
    try {
      return new Date(s.date).getTime() >= monday.getTime()
    } catch {
      return false
    }
  })
  const studyHoursThisWeek = sessionsThisWeek.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60
  const weeklyTarget = 40.0
  const weeklyHoursRemaining = Math.max(0, weeklyTarget - studyHoursThisWeek)

  // Streak: Max habit streak
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0), 0) : 0

  // Tasks Completed
  const tasksCompleted = tasks.filter(t => t.status === 'done').length
  const tasksTotal = tasks.length

  // Quick Navigation Links
  const quickActions = [
    { label: 'Study Overview', path: '/study', desc: 'Study ERP Hub' },
    { label: 'Subjects & Syllabus', path: '/study/subjects', desc: `Track ${subjects.length} subjects` },
    { label: 'New Study Session', path: '/study/sessions/new', desc: 'Start focus timer' },
    { label: 'Revision Planner', path: '/study/revision', desc: 'Spaced repetition schedule' },
  ]

  // Focus Score: Average focus rating of today's sessions
  const avgFocusRating = todaySessions.length > 0
    ? Math.round((todaySessions.reduce((sum, s) => sum + (s.focusRating || 0), 0) / todaySessions.length) * 20)
    : 0

  // Recent Sessions
  const recentSessions = [...sessions].slice(-3).reverse().map(s => {
    const subName = subjects.find(sub => sub.id === s.subjectId)?.name ?? 'General Study'
    return {
      id: s.id,
      subject: subName,
      topic: s.notes || 'Focus study block',
      duration: `${s.durationMinutes}m`,
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  })

  // Subject Progress mapping
  const subjectProgress = subjects.map(s => {
    const chs = chapters.filter(c => c.subjectId === s.id)
    const completed = chs.filter(c => c.status === 'completed').length
    const pct = chs.length > 0 ? Math.round((completed / chs.length) * 100) : 0
    return {
      id: s.id,
      name: s.name,
      pct
    }
  })

  const totalChaptersCompleted = chapters.filter(c => c.status === 'completed').length
  const totalChaptersCount = chapters.length

  // Checklist items: top 4 pending tasks
  const pendingChecklist = tasks.filter(t => t.status !== 'done').slice(0, 4)

  const handleToggleTask = (id: string) => {
    const currentTask = tasks.find(t => t.id === id)
    if (!currentTask) return
    taskStorage.update(id, { status: 'done' })
    setTasks(taskStorage.getAll())
  }

  return (
    <PageWrapper className="pt-4" padBottom={true}>
      {/* Hero / Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-[var(--border)] mb-6 gap-4">
        <div className="text-left">
          <span className="text-xs text-[var(--text-3)] font-medium uppercase tracking-wider">{dateStr}</span>
          <h1 className="text-2xl font-bold text-[var(--text)] mt-1 tracking-tight">
            {greeting}, {userFirstName}
          </h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">Welcome back to your study workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[8px] text-right">
            <span className="text-xs text-[var(--text-3)] block font-medium">Daily Streak</span>
            <span className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5 justify-end">
              <Flame size={14} className="text-[var(--warning)] fill-[var(--warning)]" />
              {bestStreak} Days
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
            <SectionHeader title="Today's Study Metrics" />
            {sessions.length === 0 && tasks.length === 0 ? (
              <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl text-center text-xs text-[var(--text-3)] flex items-center justify-center gap-1.5">
                <AlertCircle size={14} />
                No data available for today
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricCard
                  label="Today's Study"
                  value={studyHoursToday.toFixed(1)}
                  unit="h"
                  change={todaySessions.length > 0 ? { value: todaySessions.length, label: 'sessions logged' } : undefined}
                />
                <MetricCard
                  label="Focus Rating"
                  value={avgFocusRating > 0 ? `${avgFocusRating}%` : 'N/A'}
                  change={avgFocusRating > 0 ? { value: avgFocusRating >= 80 ? 5 : 2, label: 'rating indicator' } : undefined}
                />
                <MetricCard
                  label="Tasks Done"
                  value={`${tasksCompleted}/${tasksTotal}`}
                  change={tasksTotal - tasksCompleted > 0 ? { value: tasksTotal - tasksCompleted, label: 'remaining' } : undefined}
                />
              </div>
            )}
          </div>

          {/* Dynamic Study Focus Box */}
          {pendingChecklist.length > 0 && (
            <Card className="bg-[var(--accent-bg)] border-[var(--accent-border)] text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-[8px] bg-[var(--bg)] border border-[var(--accent-border)] text-[var(--accent)] shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-wider">Current Focus Task</span>
                  <p className="text-sm font-medium text-[var(--accent-text)] mt-1">
                    {pendingChecklist[0].title}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Recent sessions */}
          <div>
            <SectionHeader title="Recent Focus Sessions" action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/study/sessions')}>
                View all
              </Button>
            } />
            <Card padding="none">
              {recentSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-3)]">
                  No focus sessions logged. Start a focus timer to see history.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-3.5 hover:bg-[var(--bg-subtle)] transition-all">
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[var(--text)]">{session.subject}</p>
                        <p className="text-xs text-[var(--text-3)] mt-0.5">{session.topic}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="accent" size="sm">{session.duration}</Badge>
                        <p className="text-[10px] text-[var(--text-4)] mt-1">{session.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>

        {/* Right Column: Progress & Daily schedule */}
        <div className="flex flex-col gap-6">
          
          {/* Syllabus Progress Overview Card */}
          <Card className="text-left">
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">Syllabus Progress</h3>
            {subjectProgress.length === 0 ? (
              <p className="text-xs text-[var(--text-3)] text-center py-6">No subjects configured. Add subjects to view syllabus progress.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {subjectProgress.slice(0, 3).map((sub, idx) => {
                  const colors = ['var(--accent)', 'var(--success)', 'var(--info)']
                  return (
                    <div key={sub.id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[var(--text-2)] font-medium">{sub.name}</span>
                        <span className="text-[var(--text-3)] font-semibold">{sub.pct}%</span>
                      </div>
                      <ProgressBar value={sub.pct} max={100} height={5} color={colors[idx % colors.length]} />
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-3)] font-medium">Total Chapters Done</span>
              <span className="font-semibold text-[var(--text)]">{totalChaptersCompleted} of {totalChaptersCount}</span>
            </div>
          </Card>

          {/* Today's Goals / Checklist */}
          <Card className="text-left">
            <h3 className="text-sm font-bold text-[var(--text)] mb-3">Today's Checklist</h3>
            {pendingChecklist.length === 0 ? (
              <p className="text-xs text-[var(--text-3)] text-center py-6">All tasks completed! Enjoy your day.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingChecklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => handleToggleTask(item.id)}
                      className="mt-0.5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                    />
                    <span className="text-xs text-[var(--text-2)]">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Integrations & Health Status Card */}
          <Card className="text-left">
            <h3 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-1.5">
              <Activity size={15} className="text-[var(--accent)]" />
              Connected Services
            </h3>
            
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                <div className="flex items-center gap-1.5">
                  <Radio size={14} className="text-green-500" />
                  <span className="text-[var(--text-2)]">Spotify</span>
                </div>
                <span className="font-semibold text-[var(--text)] text-[11px]">
                  {integrationsInfo.spotifyConnected ? (
                    <span className="text-green-500 font-bold">Connected</span>
                  ) : (
                    <span className="text-[var(--text-4)]">Disconnected</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                <div className="flex items-center gap-1.5">
                  <Heart size={14} className="text-red-500" />
                  <span className="text-[var(--text-2)]">Health Connect</span>
                </div>
                <span className="font-semibold text-[var(--text)] text-[11px]">
                  {integrationsInfo.hcStatus}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                <div className="flex items-center gap-1.5">
                  <Brain size={14} className="text-blue-500" />
                  <span className="text-[var(--text-2)]">NotebookLM Manager</span>
                </div>
                <span className="font-semibold text-[var(--text)] text-[11px] text-blue-500">
                  Active
                </span>
              </div>

              <div className="bg-[var(--bg-subtle)] p-2.5 rounded-xl border border-[var(--border)] flex flex-col gap-1.5 text-[10.5px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-3)] font-medium">Last Sync:</span>
                  <span className="font-semibold text-[var(--text)]">{integrationsInfo.lastSync}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-3)] font-medium">Steps Today:</span>
                  <span className="font-semibold text-[var(--text)]">{integrationsInfo.todaySteps} steps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-3)] font-medium">Sleep Last Night:</span>
                  <span className="font-semibold text-[var(--text)]">{integrationsInfo.sleepSummary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-3)] font-medium">Spotify Playlist:</span>
                  <span className="font-semibold text-[var(--text)] truncate max-w-[120px]">{integrationsInfo.spotifyPlaylist}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-3)] font-medium">Recent Notebook:</span>
                  <span className="font-semibold text-[var(--text)] truncate max-w-[120px]">{integrationsInfo.lastNotebook}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => navigate('/settings/integrations')}
                className="text-[10px] uppercase font-bold tracking-wider mt-1 cursor-pointer"
              >
                Manage Connections <ChevronRight size={10} className="ml-1" />
              </Button>
            </div>
          </Card>

          {/* Short Stats info */}
          <Card className="text-center p-4">
            <h4 className="text-xs text-[var(--text-3)] font-medium uppercase tracking-wider">Weekly Target Goal</h4>
            <p className="text-2xl font-bold text-[var(--text)] mt-1">{studyHoursThisWeek.toFixed(1)} / {weeklyTarget}h</p>
            <div className="mt-3">
              <ProgressBar value={studyHoursThisWeek} max={weeklyTarget} height={6} />
            </div>
            <p className="text-[10.5px] text-[var(--text-3)] mt-2">
              {weeklyHoursRemaining > 0 ? `${weeklyHoursRemaining.toFixed(1)} hours remaining to hit target` : 'Weekly focus target achieved! 🎉'}
            </p>
          </Card>

        </div>

      </div>
    </PageWrapper>
  )
}
