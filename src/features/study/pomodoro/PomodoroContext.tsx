/**
 * PomodoroContext.tsx
 * Core timer engine — persists to localStorage, survives page navigation and refresh.
 * All state is shared via context so PomodoroPage and PomodoroMiniTimer stay in sync.
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { studyERPStorage } from '@/services/storage/studyERP.storage'

// ─── Types ─────────────────────────────────────────────────────────────────

export type PomodoroMode  = 'focus' | 'short_break' | 'long_break'
export type PomodoroPhase = 'idle' | 'running' | 'paused'
export type SoundType     = 'bell' | 'chime' | 'digital' | 'none'
export type Preset        = 'classic' | 'deepwork' | 'custom'

export interface PomodoroSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakAfter: number
  autoStartBreak: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
  soundType: SoundType
  volume: number
  notificationsEnabled: boolean
}

export interface SessionSetup {
  subjectId: string
  chapterId: string
  topicId: string
  studyMethod: string
  targetPomodoros: number
  notes: string
}

interface PersistedState {
  mode: PomodoroMode
  phase: PomodoroPhase
  secondsLeft: number
  totalSeconds: number
  cycleIndex: number   // focus sessions completed in current long-break cycle
  startedAt: number | null  // epoch ms — used to compensate for background elapsed time
  preset: Preset
  settings: PomodoroSettings
  sessionSetup: SessionSetup
}

export interface PomodoroContextValue {
  // State
  mode: PomodoroMode
  phase: PomodoroPhase
  secondsLeft: number
  totalSeconds: number
  cycleIndex: number
  preset: Preset
  settings: PomodoroSettings
  sessionSetup: SessionSetup
  // Computed
  progressPct: number
  displayTime: string
  isActive: boolean
  completedToday: number
  todayFocusMinutes: number
  weeklyPomodoros: number
  streak: number
  // Controls
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  skip: () => void
  fullReset: () => void
  // Config
  setPreset: (p: Preset) => void
  updateSettings: (s: Partial<PomodoroSettings>) => void
  updateSessionSetup: (s: Partial<SessionSetup>) => void
  requestNotificationPermission: () => void
}

// ─── Presets ────────────────────────────────────────────────────────────────

const PRESETS: Record<Preset, { focus: number; short: number; long: number; longAfter: number }> = {
  classic:  { focus: 25, short: 5,  long: 15, longAfter: 4 },
  deepwork: { focus: 50, short: 10, long: 20, longAfter: 3 },
  custom:   { focus: 25, short: 5,  long: 15, longAfter: 4 },
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, longBreakAfter: 4,
  autoStartBreak: false, autoStartFocus: false,
  soundEnabled: true, soundType: 'bell', volume: 70,
  notificationsEnabled: false,
}

const DEFAULT_SESSION: SessionSetup = {
  subjectId: '', chapterId: '', topicId: '',
  studyMethod: 'Pomodoro', targetPomodoros: 4, notes: '',
}

function defaultState(): PersistedState {
  return {
    mode: 'focus', phase: 'idle',
    secondsLeft: DEFAULT_SETTINGS.focusMinutes * 60,
    totalSeconds: DEFAULT_SETTINGS.focusMinutes * 60,
    cycleIndex: 0, startedAt: null,
    preset: 'classic',
    settings: { ...DEFAULT_SETTINGS },
    sessionSetup: { ...DEFAULT_SESSION },
  }
}

// ─── Persistence ────────────────────────────────────────────────────────────

const LS_KEY = 'ihsanos_pomodoro'

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return defaultState()
    const s = JSON.parse(raw) as PersistedState
    // Compensate for time elapsed while app was closed / navigated away
    if (s.phase === 'running' && s.startedAt) {
      const elapsed = Math.floor((Date.now() - s.startedAt) / 1000)
      s.secondsLeft = Math.max(0, s.secondsLeft - elapsed)
      s.startedAt = Date.now()
    }
    return s
  } catch {
    return defaultState()
  }
}

// ─── Audio via Web Audio API (no deps) ──────────────────────────────────────

function playSound(type: SoundType, volume: number) {
  if (type === 'none') return
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx() as AudioContext
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.value = (volume / 100) * 0.35

    const config: Record<SoundType, { freq: number; type: OscillatorType }> = {
      bell:    { freq: 880,  type: 'sine' },
      chime:   { freq: 528,  type: 'triangle' },
      digital: { freq: 1200, type: 'square' },
      none:    { freq: 440,  type: 'sine' },
    }
    osc.frequency.value = config[type].freq
    osc.type = config[type].type
    osc.start()
    gain.gain.setTargetAtTime(0, ctx.currentTime + 0.4, 0.15)
    osc.stop(ctx.currentTime + 1.5)
  } catch { /* AudioContext blocked by browser policy until user gesture */ }
}

// ─── Browser Notifications ──────────────────────────────────────────────────

function notify(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  try { new Notification(title, { body, icon: '/pwa-192x192.png' }) } catch {}
}

// ─── Context ────────────────────────────────────────────────────────────────

const PomodoroContext = createContext<PomodoroContextValue | null>(null)

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Persist every change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  }, [state])

  // Autoplay Spotify playlist when Focus starts
  useEffect(() => {
    if (state.phase === 'running' && state.mode === 'focus') {
      const autoplay = localStorage.getItem('spotify_pomodoro_autoplay') === 'true'
      const playlistUrl = localStorage.getItem('spotify_pomodoro_playlist_url')
      if (autoplay && playlistUrl) {
        import('@/services/spotify/SpotifyService').then(({ spotifyService }) => {
          spotifyService.launchPlaylist(playlistUrl)
        })
      }
    }
  }, [state.phase, state.mode])


  const clearTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  // Auto-log completed focus session to existing sessions store
  const logSession = useCallback(() => {
    const s = stateRef.current
    if (!s.sessionSetup.subjectId) return
    const durationMin = s.settings.focusMinutes
    const end = new Date()
    const start = new Date(end.getTime() - durationMin * 60_000)
    const fmt = (d: Date) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    studyERPStorage.addSession({
      id: `pomo-${Date.now()}`,
      subjectId: s.sessionSetup.subjectId,
      chapterId: s.sessionSetup.chapterId || undefined,
      topicId:   s.sessionSetup.topicId   || undefined,
      date: new Date().toISOString().split('T')[0],
      startTime: fmt(start), endTime: fmt(end),
      durationMinutes: durationMin,
      studyMethod: 'Pomodoro',
      focusRating: 5,
      understandingPercentage: 80,
      notes: s.sessionSetup.notes || undefined,
      pendingSync: true, syncVersion: 1,
    })
  }, [])

  // Called when a timer hits 0 — determines the next mode and advances
  const advanceMode = useCallback(() => {
    const s = stateRef.current
    const { settings } = s

    if (s.mode === 'focus') {
      logSession()
      if (settings.soundEnabled) playSound(settings.soundType, settings.volume)
      if (settings.notificationsEnabled) notify('Focus Complete! 🎯', 'Time for a break — you earned it.')

      const newCycle = s.cycleIndex + 1
      const isLongBreak = newCycle >= settings.longBreakAfter
      const nextMode: PomodoroMode = isLongBreak ? 'long_break' : 'short_break'
      const nextSec = (isLongBreak ? settings.longBreakMinutes : settings.shortBreakMinutes) * 60
      setState(prev => ({
        ...prev,
        mode: nextMode,
        cycleIndex: isLongBreak ? 0 : newCycle,
        secondsLeft: nextSec,
        totalSeconds: nextSec,
        phase: settings.autoStartBreak ? 'running' : 'idle',
        startedAt: settings.autoStartBreak ? Date.now() : null,
      }))
    } else {
      if (settings.soundEnabled) playSound(settings.soundType, settings.volume)
      if (settings.notificationsEnabled) notify('Break Over! 💪', 'Ready to focus again?')
      const nextSec = settings.focusMinutes * 60
      setState(prev => ({
        ...prev,
        mode: 'focus',
        secondsLeft: nextSec,
        totalSeconds: nextSec,
        phase: settings.autoStartFocus ? 'running' : 'idle',
        startedAt: settings.autoStartFocus ? Date.now() : null,
      }))
    }
  }, [logSession])

  // Interval that drives the countdown
  useEffect(() => {
    if (state.phase !== 'running') { clearTimer(); return clearTimer }

    intervalRef.current = setInterval(() => {
      const curr = stateRef.current
      if (curr.secondsLeft <= 1) {
        clearTimer()
        setState(prev => ({ ...prev, secondsLeft: 0, phase: 'idle', startedAt: null }))
        advanceMode()
        return
      }
      setState(prev => ({ ...prev, secondsLeft: prev.secondsLeft - 1 }))
    }, 1000)

    return clearTimer
  }, [state.phase, clearTimer, advanceMode])

  // ── Controls ──────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'running', startedAt: Date.now() }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'paused', startedAt: null }))
  }, [])

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'running', startedAt: Date.now() }))
  }, [])

  const restart = useCallback(() => {
    clearTimer()
    const s = stateRef.current
    const sec = s.mode === 'focus' ? s.settings.focusMinutes * 60
      : s.mode === 'short_break' ? s.settings.shortBreakMinutes * 60
      : s.settings.longBreakMinutes * 60
    setState(prev => ({ ...prev, phase: 'idle', secondsLeft: sec, totalSeconds: sec, startedAt: null }))
  }, [clearTimer])

  const skip = useCallback(() => {
    clearTimer()
    setState(prev => ({ ...prev, secondsLeft: 0, phase: 'idle', startedAt: null }))
    setTimeout(advanceMode, 50)
  }, [clearTimer, advanceMode])

  const fullReset = useCallback(() => {
    clearTimer()
    setState(defaultState())
  }, [clearTimer])

  const setPreset = useCallback((p: Preset) => {
    clearTimer()
    const preset = PRESETS[p]
    setState(prev => ({
      ...prev,
      preset: p,
      mode: 'focus', phase: 'idle', cycleIndex: 0, startedAt: null,
      secondsLeft: preset.focus * 60, totalSeconds: preset.focus * 60,
      settings: { ...prev.settings, focusMinutes: preset.focus, shortBreakMinutes: preset.short, longBreakMinutes: preset.long, longBreakAfter: preset.longAfter },
    }))
  }, [clearTimer])

  const updateSettings = useCallback((partial: Partial<PomodoroSettings>) => {
    clearTimer()
    setState(prev => {
      const ns = { ...prev.settings, ...partial }
      const sec = prev.mode === 'focus' ? ns.focusMinutes * 60
        : prev.mode === 'short_break' ? ns.shortBreakMinutes * 60
        : ns.longBreakMinutes * 60
      return { ...prev, settings: ns, preset: 'custom', phase: 'idle', secondsLeft: sec, totalSeconds: sec, startedAt: null }
    })
  }, [clearTimer])

  const updateSessionSetup = useCallback((partial: Partial<SessionSetup>) => {
    setState(prev => ({ ...prev, sessionSetup: { ...prev.sessionSetup, ...partial } }))
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  // ── Stats (computed from study sessions store) ─────────────────────────────

  const today = new Date().toISOString().split('T')[0]
  const allSessions = studyERPStorage.getSessions()
  const todaySessions = allSessions.filter(s => s.date === today && s.studyMethod === 'Pomodoro')
  const completedToday = todaySessions.length
  const todayFocusMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStr = weekStart.toISOString().split('T')[0]
  const weeklyPomodoros = allSessions.filter(s => s.studyMethod === 'Pomodoro' && s.date >= weekStr).length

  // Consecutive days with at least 1 pomodoro
  const streak = (() => {
    const pomoDays = new Set(allSessions.filter(s => s.studyMethod === 'Pomodoro').map(s => s.date))
    let count = 0
    const d = new Date()
    while (true) {
      const ds = d.toISOString().split('T')[0]
      if (!pomoDays.has(ds)) break
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  // ── Computed values ────────────────────────────────────────────────────────

  const progressPct = state.totalSeconds > 0
    ? ((state.totalSeconds - state.secondsLeft) / state.totalSeconds) * 100
    : 0
  const mins = Math.floor(state.secondsLeft / 60)
  const secs = state.secondsLeft % 60
  const displayTime = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  const isActive = state.phase === 'running' || state.phase === 'paused'

  const value: PomodoroContextValue = {
    mode: state.mode, phase: state.phase,
    secondsLeft: state.secondsLeft, totalSeconds: state.totalSeconds,
    cycleIndex: state.cycleIndex, preset: state.preset,
    settings: state.settings, sessionSetup: state.sessionSetup,
    progressPct, displayTime, isActive,
    completedToday, todayFocusMinutes, weeklyPomodoros, streak,
    start, pause, resume, restart, skip, fullReset,
    setPreset, updateSettings, updateSessionSetup, requestNotificationPermission,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoro must be used within PomodoroProvider')
  return ctx
}
