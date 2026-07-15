/**
 * PomodoroMiniTimer.tsx
 * Floating mini-timer widget — visible on all pages EXCEPT /study/pomodoro when the timer is active.
 * Timer continues running; this is a live view, not a separate timer instance.
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { Play, Pause, Timer } from 'lucide-react'
import { usePomodoro } from './PomodoroContext'
import { cn } from '@/utils/cn'

const MODE_COLORS = {
  focus:       '#2563eb',
  short_break: '#16a34a',
  long_break:  '#7c3aed',
}

const MODE_LABELS = {
  focus:       'Focus',
  short_break: 'Break',
  long_break:  'Long Break',
}

export function PomodoroMiniTimer() {
  const { mode, phase, displayTime, progressPct, pause, resume } = usePomodoro()
  const navigate = useNavigate()
  const location = useLocation()

  // Only show when timer is running or paused, and NOT on the pomodoro page itself
  const isActive = phase === 'running' || phase === 'paused'
  const isOnPomodoroPage = location.pathname === '/study/pomodoro'

  if (!isActive || isOnPomodoroPage) return null

  const color = MODE_COLORS[mode]
  const circumference = 2 * Math.PI * 16
  const dash = ((progressPct) / 100) * circumference

  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 z-50',
        'lg:bottom-6 lg:right-6',
      )}
    >
      <div
        className="flex items-center gap-2.5 pl-2.5 pr-3 py-2 rounded-full border border-[var(--border)] bg-[var(--bg)] shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 active:scale-95"
        onClick={() => navigate('/study/pomodoro')}
        title="Go to Pomodoro Timer"
      >
        {/* Mini SVG ring */}
        <div className="relative flex items-center justify-center" style={{ width: 36, height: 36 }}>
          <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            <circle cx="18" cy="18" r="16" fill="none" stroke={color + '20'} strokeWidth="3" />
            <circle
              cx="18" cy="18" r="16" fill="none"
              stroke={color} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <Timer size={12} style={{ color, position: 'relative', zIndex: 1 }} />
        </div>

        {/* Info */}
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>
            {MODE_LABELS[mode]}
          </span>
          <span className="text-sm font-mono font-bold text-[var(--text)] tabular-nums">
            {displayTime}
          </span>
        </div>

        {/* Pause / Resume */}
        <button
          onClick={e => {
            e.stopPropagation()
            phase === 'running' ? pause() : resume()
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ backgroundColor: color + '15' }}
        >
          {phase === 'running'
            ? <Pause size={12} style={{ color }} fill={color} />
            : <Play  size={12} style={{ color }} fill={color} />
          }
        </button>
      </div>

      {/* Pulsing dot when running */}
      {phase === 'running' && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg)] animate-pulse"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  )
}
