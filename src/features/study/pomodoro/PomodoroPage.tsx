import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer, Play, Pause, RotateCcw, SkipForward, Settings2,
  Coffee, Brain, Flame, Calendar, Target, Clock,
  Droplets, Wind, Eye, Dumbbell, ChevronDown, ChevronUp,
  Bell, BellOff, Volume2, CheckCircle2, Zap, Trophy,
  BookOpen, Layers,
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Modal } from '@/components/ui/Modal'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import { usePomodoro, type Preset, type SoundType } from './PomodoroContext'
import { cn } from '@/utils/cn'

// ─── Mode Config ──────────────────────────────────────────────────────────────

const MODE_CONFIG = {
  focus:       { label: 'Focus',       color: '#2563eb', bg: '#eff6ff', icon: Brain },
  short_break: { label: 'Short Break', color: '#16a34a', bg: '#f0fdf4', icon: Coffee },
  long_break:  { label: 'Long Break',  color: '#7c3aed', bg: '#f5f3ff', icon: Zap },
}

// ─── Break Reminders ─────────────────────────────────────────────────────────

function BreakScreen() {
  const { mode, displayTime, secondsLeft, totalSeconds, skip, phase, start } = usePomodoro()
  const cfg = MODE_CONFIG[mode]
  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0

  const reminders = [
    { icon: Droplets, label: 'Drink water', color: '#2563eb' },
    { icon: Dumbbell, label: 'Stretch', color: '#16a34a' },
    { icon: Eye,      label: 'Eye rest (20-20-20)', color: '#7c3aed' },
    { icon: Wind,     label: 'Deep breaths', color: '#0891b2' },
  ]

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <ProgressRing value={progressPct} max={100} size={180} strokeWidth={8} color={cfg.color} trackColor={cfg.bg}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-mono font-bold text-[var(--text)] tabular-nums">{displayTime}</span>
            <span className="text-[10px] text-[var(--text-4)] uppercase tracking-wide">remaining</span>
          </div>
        </ProgressRing>
      </div>

      {/* Reminders */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {reminders.map(r => (
          <div key={r.label} className="flex items-center gap-2 p-2.5 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border)]">
            <r.icon size={14} style={{ color: r.color }} />
            <span className="text-xs text-[var(--text-2)] font-medium">{r.label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {phase === 'idle' && (
          <Button variant="primary" size="sm" onClick={start}>
            <Play size={13} /> Start Break
          </Button>
        )}
        {phase === 'running' && (
          <Button variant="secondary" size="sm" onClick={skip}>
            <SkipForward size={13} /> Skip Break
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Timer Ring Display ──────────────────────────────────────────────────────

function TimerRing() {
  const { mode, phase, progressPct, displayTime, secondsLeft, totalSeconds,
          cycleIndex, settings, start, pause, resume, restart, skip } = usePomodoro()
  const cfg = MODE_CONFIG[mode]
  const elapsedMin = Math.floor((totalSeconds - secondsLeft) / 60)

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Progress Ring */}
      <div className="relative">
        <ProgressRing
          value={progressPct}
          max={100}
          size={220}
          strokeWidth={10}
          color={cfg.color}
          trackColor={`${cfg.color}20`}
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-4xl font-mono font-bold text-[var(--text)] tabular-nums leading-none">
              {displayTime}
            </span>
            <span className="text-[10px] text-[var(--text-4)] uppercase tracking-widest font-semibold">
              {elapsedMin > 0 ? `${elapsedMin}m elapsed` : cfg.label}
            </span>
          </div>
        </ProgressRing>

        {/* Animated pulse when running */}
        {phase === 'running' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: cfg.color + '30' }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Cycle Dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: settings.longBreakAfter }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              i < cycleIndex ? 'scale-110' : 'bg-[var(--border)]'
            )}
            style={i < cycleIndex ? { backgroundColor: cfg.color } : {}}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={restart}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] transition-all"
          title="Restart"
        >
          <RotateCcw size={16} />
        </button>

        {phase === 'idle' && (
          <button
            onClick={start}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: cfg.color, boxShadow: `0 4px 20px ${cfg.color}50` }}
          >
            <Play size={24} fill="white" />
          </button>
        )}
        {phase === 'running' && (
          <button
            onClick={pause}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: cfg.color, boxShadow: `0 4px 20px ${cfg.color}50` }}
          >
            <Pause size={24} fill="white" />
          </button>
        )}
        {phase === 'paused' && (
          <button
            onClick={resume}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: cfg.color, boxShadow: `0 4px 20px ${cfg.color}50` }}
          >
            <Play size={24} fill="white" />
          </button>
        )}

        <button
          onClick={skip}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] transition-all"
          title="Skip"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {phase === 'paused' && (
        <span className="text-xs text-[var(--text-4)] font-medium animate-pulse">PAUSED</span>
      )}
    </div>
  )
}

// ─── Preset Selector ─────────────────────────────────────────────────────────

const PRESET_OPTIONS: { value: Preset; label: string; desc: string; color: string }[] = [
  { value: 'classic',  label: 'Classic',    desc: '25 / 5 / 15 min',   color: '#2563eb' },
  { value: 'deepwork', label: 'Deep Work',  desc: '50 / 10 / 20 min',  color: '#7c3aed' },
  { value: 'custom',   label: 'Custom',     desc: 'Your settings',      color: '#d97706' },
]

function PresetSelector() {
  const { preset, setPreset, phase } = usePomodoro()
  if (phase === 'running') return null

  return (
    <div className="flex gap-1.5 flex-wrap justify-center">
      {PRESET_OPTIONS.map(p => (
        <button
          key={p.value}
          onClick={() => setPreset(p.value)}
          className={cn(
            'px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-all',
            preset === p.value
              ? 'text-white border-transparent'
              : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--border-strong)]'
          )}
          style={preset === p.value ? { backgroundColor: p.color, borderColor: p.color } : {}}
        >
          {p.label}
          <span className="ml-1.5 font-normal opacity-75">{p.desc}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Session Setup Panel ──────────────────────────────────────────────────────

function SessionSetupPanel() {
  const { sessionSetup, updateSessionSetup, phase } = usePomodoro()
  const [open, setOpen] = useState(false)
  const [targetPomoStr, setTargetPomoStr] = useState(String(sessionSetup.targetPomodoros))

  const subjects = studyERPStorage.getSubjects()
  const chapters = studyERPStorage.getChapters().filter(c => c.subjectId === sessionSetup.subjectId)
  const topics   = studyERPStorage.getTopics().filter(t => t.chapterId === sessionSetup.chapterId)

  const selectedSubjectName = subjects.find(s => s.id === sessionSetup.subjectId)?.name || 'No subject'
  const selectedChapterName = chapters.find(c => c.id === sessionSetup.chapterId)?.name

  return (
    <Card padding="sm">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-[var(--accent)]" />
          <div className="text-left">
            <p className="text-xs font-semibold text-[var(--text)]">{selectedSubjectName}</p>
            {selectedChapterName && <p className="text-[10px] text-[var(--text-4)]">{selectedChapterName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {sessionSetup.subjectId && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
          {open ? <ChevronUp size={14} className="text-[var(--text-4)]" /> : <ChevronDown size={14} className="text-[var(--text-4)]" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border)] mt-3">
              <Select
                label="Subject"
                value={sessionSetup.subjectId}
                onChange={e => updateSessionSetup({ subjectId: e.target.value, chapterId: '', topicId: '' })}
                options={subjects.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Select subject…"
                disabled={phase === 'running'}
              />
              <Select
                label="Chapter (optional)"
                value={sessionSetup.chapterId}
                onChange={e => updateSessionSetup({ chapterId: e.target.value, topicId: '' })}
                options={chapters.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Select chapter…"
                disabled={!sessionSetup.subjectId || phase === 'running'}
              />
              <Select
                label="Topic (optional)"
                value={sessionSetup.topicId}
                onChange={e => updateSessionSetup({ topicId: e.target.value })}
                options={topics.map(t => ({ value: t.id, label: t.name }))}
                placeholder="Select topic…"
                disabled={!sessionSetup.chapterId || phase === 'running'}
              />
              <Select
                label="Study Method"
                value={sessionSetup.studyMethod}
                onChange={e => updateSessionSetup({ studyMethod: e.target.value })}
                options={[
                  { value: 'Pomodoro',       label: 'Pomodoro' },
                  { value: 'Active Recall',  label: 'Active Recall' },
                  { value: 'Feynman',        label: 'Feynman Technique' },
                  { value: 'Practice',       label: 'Practice Problems' },
                  { value: 'Reading',        label: 'Reading' },
                  { value: 'Other',          label: 'Other' },
                ]}
              />
              <div className="flex items-center gap-3">
                <Input
                  label="Target Pomodoros"
                  type="number"
                  min="1"
                  value={targetPomoStr}
                  onChange={e => {
                    const val = e.target.value
                    setTargetPomoStr(val)
                    if (val !== '' && !isNaN(Number(val))) {
                      const num = Number(val)
                      if (num > 0) updateSessionSetup({ targetPomodoros: num })
                    }
                  }}
                  onBlur={() => {
                    if (!targetPomoStr || isNaN(Number(targetPomoStr)) || Number(targetPomoStr) < 1) {
                      setTargetPomoStr(String(sessionSetup.targetPomodoros || 4))
                      updateSessionSetup({ targetPomodoros: sessionSetup.targetPomodoros || 4 })
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text-2)]">Notes (optional)</label>
                <textarea
                  value={sessionSetup.notes}
                  onChange={e => updateSessionSetup({ notes: e.target.value })}
                  placeholder="What are you working on?"
                  rows={2}
                  className="w-full p-2.5 rounded-[8px] text-sm bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-[var(--text-4)] focus:outline-none focus:border-[var(--border-focus)] resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ─── Settings Modal ───────────────────────────────────────────────────────────

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings, requestNotificationPermission } = usePomodoro()

  const [focusStr, setFocusStr] = useState(String(settings.focusMinutes))
  const [shortBreakStr, setShortBreakStr] = useState(String(settings.shortBreakMinutes))
  const [longBreakStr, setLongBreakStr] = useState(String(settings.longBreakMinutes))
  const [longBreakAfterStr, setLongBreakAfterStr] = useState(String(settings.longBreakAfter))

  useEffect(() => {
    if (open) {
      setFocusStr(String(settings.focusMinutes))
      setShortBreakStr(String(settings.shortBreakMinutes))
      setLongBreakStr(String(settings.longBreakMinutes))
      setLongBreakAfterStr(String(settings.longBreakAfter))
    }
  }, [open, settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes, settings.longBreakAfter])

  const SOUND_OPTIONS: { value: SoundType; label: string }[] = [
    { value: 'bell',    label: '🔔 Bell' },
    { value: 'chime',   label: '🎵 Soft Chime' },
    { value: 'digital', label: '📟 Digital Beep' },
    { value: 'none',    label: '🔇 Silent' },
  ]

  const handleDone = () => {
    const f = Number(focusStr) > 0 ? Number(focusStr) : (settings.focusMinutes || 25)
    const sb = Number(shortBreakStr) > 0 ? Number(shortBreakStr) : (settings.shortBreakMinutes || 5)
    const lb = Number(longBreakStr) > 0 ? Number(longBreakStr) : (settings.longBreakMinutes || 15)
    const lba = Number(longBreakAfterStr) > 0 ? Number(longBreakAfterStr) : (settings.longBreakAfter || 4)

    updateSettings({
      focusMinutes: f,
      shortBreakMinutes: sb,
      longBreakMinutes: lb,
      longBreakAfter: lba,
    })
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={handleDone} title="Timer Settings" size="sm">
      <div className="flex flex-col gap-5">
        {/* Durations */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-2)] mb-3 uppercase tracking-wide">Durations</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Focus (min)"
              type="number"
              min="1"
              value={focusStr}
              onChange={e => {
                const val = e.target.value
                setFocusStr(val)
                if (val !== '' && !isNaN(Number(val))) {
                  const num = Number(val)
                  if (num > 0) updateSettings({ focusMinutes: num })
                }
              }}
              onBlur={() => {
                if (!focusStr || isNaN(Number(focusStr)) || Number(focusStr) < 1) {
                  setFocusStr(String(settings.focusMinutes || 25))
                  updateSettings({ focusMinutes: settings.focusMinutes || 25 })
                }
              }}
            />
            <Input
              label="Short Break (min)"
              type="number"
              min="1"
              value={shortBreakStr}
              onChange={e => {
                const val = e.target.value
                setShortBreakStr(val)
                if (val !== '' && !isNaN(Number(val))) {
                  const num = Number(val)
                  if (num > 0) updateSettings({ shortBreakMinutes: num })
                }
              }}
              onBlur={() => {
                if (!shortBreakStr || isNaN(Number(shortBreakStr)) || Number(shortBreakStr) < 1) {
                  setShortBreakStr(String(settings.shortBreakMinutes || 5))
                  updateSettings({ shortBreakMinutes: settings.shortBreakMinutes || 5 })
                }
              }}
            />
            <Input
              label="Long Break (min)"
              type="number"
              min="1"
              value={longBreakStr}
              onChange={e => {
                const val = e.target.value
                setLongBreakStr(val)
                if (val !== '' && !isNaN(Number(val))) {
                  const num = Number(val)
                  if (num > 0) updateSettings({ longBreakMinutes: num })
                }
              }}
              onBlur={() => {
                if (!longBreakStr || isNaN(Number(longBreakStr)) || Number(longBreakStr) < 1) {
                  setLongBreakStr(String(settings.longBreakMinutes || 15))
                  updateSettings({ longBreakMinutes: settings.longBreakMinutes || 15 })
                }
              }}
            />
            <Input
              label="Long break after (sessions)"
              type="number"
              min="1"
              value={longBreakAfterStr}
              onChange={e => {
                const val = e.target.value
                setLongBreakAfterStr(val)
                if (val !== '' && !isNaN(Number(val))) {
                  const num = Number(val)
                  if (num > 0) updateSettings({ longBreakAfter: num })
                }
              }}
              onBlur={() => {
                if (!longBreakAfterStr || isNaN(Number(longBreakAfterStr)) || Number(longBreakAfterStr) < 1) {
                  setLongBreakAfterStr(String(settings.longBreakAfter || 4))
                  updateSettings({ longBreakAfter: settings.longBreakAfter || 4 })
                }
              }}
            />
          </div>
        </div>

        {/* Auto-start */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-2)] mb-3 uppercase tracking-wide">Auto Start</p>
          <div className="flex flex-col gap-2.5">
            {[
              { key: 'autoStartBreak', label: 'Auto-start break after focus' },
              { key: 'autoStartFocus', label: 'Auto-start focus after break' },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text-2)]">{item.label}</span>
                <div
                  onClick={() => updateSettings({ [item.key]: !settings[item.key as keyof typeof settings] } as any)}
                  className={cn(
                    'relative w-10 h-5.5 rounded-full transition-all cursor-pointer shrink-0',
                    settings[item.key as keyof typeof settings] ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
                  )}
                >
                  <div className={cn(
                    'absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all',
                    settings[item.key as keyof typeof settings] ? 'left-[22px]' : 'left-0.5'
                  )} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Sound */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-2)] mb-3 uppercase tracking-wide">Sound</p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[var(--text-2)]">Enable sound</span>
              <div
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={cn('relative w-10 h-5.5 rounded-full transition-all cursor-pointer shrink-0',
                  settings.soundEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]')}
              >
                <div className={cn('absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all',
                  settings.soundEnabled ? 'left-[22px]' : 'left-0.5')} />
              </div>
            </label>
            {settings.soundEnabled && (
              <>
                <Select label="Sound type" value={settings.soundType}
                  onChange={e => updateSettings({ soundType: e.target.value as SoundType })}
                  options={SOUND_OPTIONS} />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[var(--text-2)] flex items-center gap-1">
                      <Volume2 size={12} /> Volume
                    </label>
                    <span className="text-xs text-[var(--text-4)]">{settings.volume}%</span>
                  </div>
                  <input type="range" min="10" max="100" value={settings.volume}
                    onChange={e => updateSettings({ volume: Number(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--accent)' }} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-2)] mb-3 uppercase tracking-wide">Notifications</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-2)]">Browser notifications</span>
            <button
              onClick={() => {
                if (!settings.notificationsEnabled) requestNotificationPermission()
                updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
              }}
              className={cn('relative w-10 h-5.5 rounded-full transition-all cursor-pointer shrink-0',
                settings.notificationsEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]')}
            >
              <div className={cn('absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all',
                settings.notificationsEnabled ? 'left-[22px]' : 'left-0.5')} />
            </button>
          </div>
        </div>

        <Button variant="primary" onClick={handleDone} className="w-full">Done</Button>
      </div>
    </Modal>
  )
}


// ─── Stats Grid ───────────────────────────────────────────────────────────────

function StatsGrid() {
  const { completedToday, todayFocusMinutes, weeklyPomodoros, streak, settings, sessionSetup } = usePomodoro()
  const focusHrsToday = (todayFocusMinutes / 60).toFixed(1)
  const targetProgress = sessionSetup.targetPomodoros > 0
    ? Math.round((completedToday / sessionSetup.targetPomodoros) * 100)
    : 0

  const stats = [
    { label: "Today's Pomodoros", value: completedToday, unit: `/ ${sessionSetup.targetPomodoros}`, icon: Timer, color: '#2563eb' },
    { label: 'Focus Time Today',  value: focusHrsToday,  unit: 'hrs', icon: Clock, color: '#7c3aed' },
    { label: 'This Week',         value: weeklyPomodoros, unit: 'sessions', icon: Calendar, color: '#d97706' },
    { label: 'Current Streak',    value: streak,         unit: 'days', icon: Flame, color: '#dc2626' },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)]">
            <stat.icon size={15} style={{ color: stat.color }} />
            <span className="text-xl font-bold text-[var(--text)] tabular-nums">{stat.value}</span>
            {stat.unit && <span className="text-[10px] text-[var(--text-3)] font-medium">{stat.unit}</span>}
            <span className="text-[9px] text-[var(--text-4)] uppercase tracking-wide text-center leading-tight">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Target progress bar */}
      {sessionSetup.targetPomodoros > 0 && (
        <div className="flex flex-col gap-1.5 p-3 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-2)] flex items-center gap-1">
              <Target size={12} className="text-[var(--accent)]" /> Daily Target
            </span>
            <span className="text-xs font-bold text-[var(--accent)]">{targetProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[var(--accent)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, targetProgress)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: sessionSetup.targetPomodoros }).map((_, i) => (
              <CheckCircle2 key={i} size={12}
                className={i < completedToday ? 'text-[var(--success)]' : 'text-[var(--border-strong)]'} />
            ))}
          </div>
        </div>
      )}

      {/* Session info if configured */}
      {sessionSetup.subjectId && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[var(--accent-bg)] border border-[var(--accent-border)]">
          <BookOpen size={13} className="text-[var(--accent)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--accent-text)] truncate">
              {studyERPStorage.getSubjects().find(s => s.id === sessionSetup.subjectId)?.name ?? ''}
            </p>
            <p className="text-[10px] text-[var(--accent)] opacity-75">{sessionSetup.studyMethod}</p>
          </div>
          <Badge variant="default" size="sm">{settings.focusMinutes}m focus</Badge>
        </div>
      )}
    </div>
  )
}

// ─── Pomodoro Calendar Heatmap ────────────────────────────────────────────────

function PomodoroCalendar() {
  const allSessions = studyERPStorage.getSessions().filter(s => s.studyMethod === 'Pomodoro')

  // Build last 49 days heatmap (7 weeks)
  const heatmap = useMemo(() => {
    const map = new Map<string, number>()
    allSessions.forEach(s => map.set(s.date, (map.get(s.date) || 0) + 1))

    const days: { date: string; count: number; label: string }[] = []
    for (let i = 48; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      days.push({
        date: ds,
        count: map.get(ds) || 0,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })
    }
    return days
  }, [allSessions.length])

  const getColor = (count: number) => {
    if (count === 0) return 'var(--bg-muted)'
    if (count <= 2)  return '#bfdbfe'
    if (count <= 4)  return '#60a5fa'
    if (count <= 6)  return '#3b82f6'
    return '#1d4ed8'
  }

  const maxCount = Math.max(...heatmap.map(d => d.count), 1)

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[var(--text-2)] flex items-center gap-1.5">
          <Calendar size={13} className="text-[var(--accent)]" /> Study Heatmap (7 weeks)
        </p>
        <div className="flex items-center gap-1 text-[10px] text-[var(--text-4)]">
          <span>Less</span>
          {[0, 2, 4, 6, 8].map(v => (
            <div key={v} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: getColor(v) }} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {heatmap.map(day => (
          <div
            key={day.date}
            title={`${day.label}: ${day.count} pomodoro${day.count !== 1 ? 's' : ''}`}
            className="aspect-square rounded-[3px] cursor-default transition-transform hover:scale-110"
            style={{ backgroundColor: getColor(day.count) }}
          />
        ))}
      </div>
      {maxCount > 0 && (
        <p className="text-[10px] text-[var(--text-4)] mt-2 text-right">
          Peak: {maxCount} pomodoros/day
        </p>
      )}
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PomodoroPage() {
  const { mode, phase, settings, completedToday, preset, fullReset } = usePomodoro()
  const [showSettings, setShowSettings] = useState(false)
  const cfg = MODE_CONFIG[mode]
  const isBreak = mode !== 'focus'

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
            <Timer size={16} style={{ color: cfg.color }} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[var(--text)]">Pomodoro Timer</h1>
            <p className="text-[11px] text-[var(--text-4)]">Focus · Break · Repeat</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={fullReset}
            className="p-1.5 rounded-[8px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"
            title="Full reset"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-[8px] text-[var(--text-3)] hover:bg-[var(--bg-hover)] transition-all"
            title="Settings"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {/* Mode Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="flex items-center justify-between px-4 py-2.5 rounded-[10px] border"
          style={{ backgroundColor: cfg.bg, borderColor: cfg.color + '30' }}
        >
          <div className="flex items-center gap-2">
            <cfg.icon size={15} style={{ color: cfg.color }} />
            <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
            {phase === 'running' && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cfg.color }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium" style={{ color: cfg.color }}>
              {isBreak ? 'Rest & recover' : `Session ${completedToday + 1}`}
            </span>
            <Badge variant="default" size="sm">{preset}</Badge>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main content: Timer + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timer card */}
        <div className="lg:col-span-2">
          <Card padding="lg" className="flex flex-col items-center gap-5">
            {/* Preset selector */}
            <PresetSelector />

            {/* Timer or Break screen */}
            {isBreak ? <BreakScreen /> : <TimerRing />}

            {/* Status row */}
            <div className="flex items-center gap-4 text-[10px] text-[var(--text-4)] uppercase tracking-wide font-medium">
              <span className="flex items-center gap-1">
                <Layers size={10} /> Cycle {Math.floor(completedToday / settings.longBreakAfter) + 1}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={10} /> {completedToday} done today
              </span>
              {settings.soundEnabled ? (
                <span className="flex items-center gap-1"><Bell size={10} /> Sound on</span>
              ) : (
                <span className="flex items-center gap-1"><BellOff size={10} /> Silent</span>
              )}
            </div>
          </Card>
        </div>

        {/* Side panel: Session setup + Stats */}
        <div className="flex flex-col gap-3">
          <SessionSetupPanel />
          <Card padding="sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Trophy size={13} className="text-[var(--warning)]" />
              <span className="text-xs font-semibold text-[var(--text-2)]">Quick Stats</span>
            </div>
            <StatsGrid />
          </Card>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <PomodoroCalendar />

      {/* Settings Modal */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </PageWrapper>
  )
}
