import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

// ─── Progress Ring ────────────────────────────────────────────────────────────

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  showValue?: boolean
  children?: React.ReactNode
  className?: string
}

export function ProgressRing({
  value,
  max = 100,
  size = 56,
  strokeWidth = 4,
  color = 'var(--accent)',
  trackColor,
  showValue = false,
  children,
  className,
}: ProgressRingProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const dash = (pct / 100) * circumference

  return (
    <div className={cn('relative flex items-center justify-center flex-shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor ?? 'var(--border)'} strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {showValue && !children && (
          <span className="font-semibold text-[var(--text)] leading-none" style={{ fontSize: size * 0.2 }}>
            {Math.round(pct)}%
          </span>
        )}
        {children}
      </div>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  color?: string
  height?: number
  rounded?: boolean
  showLabel?: boolean
}

export function ProgressBar({ value, max = 100, color = 'var(--accent)', height = 4, rounded = true, showLabel = false, className, ...props }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)
  return (
    <div {...props} className={cn('w-full', className)}>
      <div
        className={cn('w-full bg-[var(--bg-muted)]', rounded && 'rounded-full')}
        style={{ height }}
      >
        <div
          className={cn('h-full', rounded && 'rounded-full')}
          style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 0.4s ease' }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-[var(--text-3)] mt-1">{Math.round(pct)}%</p>
      )}
    </div>
  )
}
