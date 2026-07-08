import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { ProgressBar } from './ProgressRing'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  icon?: ReactNode
  color?: string
  progress?: number
  progressMax?: number
  change?: { value: number; label?: string }
  subtitle?: string
  onClick?: () => void
  className?: string
}

export function StatCard({
  title,
  value,
  unit,
  icon,
  color = 'var(--accent)',
  progress,
  progressMax = 100,
  change,
  subtitle,
  onClick,
  className,
}: StatCardProps) {
  const isPositive = change && change.value > 0
  const isNegative = change && change.value < 0

  return (
    <motion.div
      className={cn(
        'rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-4',
        'shadow-[var(--shadow-sm)]',
        onClick && 'cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-all',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { y: -1 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wider">{title}</p>
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color.startsWith('var') ? 'var(--accent-bg)' : `${color}20`, color }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5 mb-1">
        <span className="text-2xl font-bold text-[var(--text)] leading-none">{value}</span>
        {unit && <span className="text-sm text-[var(--text-3)] mb-0.5">{unit}</span>}
      </div>

      {subtitle && <p className="text-xs text-[var(--text-3)] mb-2">{subtitle}</p>}

      {change && (
        <p className={cn('text-xs font-medium mb-2', isPositive ? 'text-[var(--success)]' : isNegative ? 'text-[var(--error)]' : 'text-[var(--text-3)]')}>
          {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(change.value)}{change.label ? ` ${change.label}` : ''}
        </p>
      )}

      {progress !== undefined && (
        <ProgressBar value={progress} max={progressMax} color={color} height={3} />
      )}
    </motion.div>
  )
}
