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
  color = '#7c6aff',
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
        'rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.06)] p-4',
        'shadow-[0_1px_3px_rgba(0,0,0,0.4)]',
        onClick && 'cursor-pointer hover:border-[rgba(255,255,255,0.12)] hover:bg-[#13131e] transition-all',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { y: -1 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[#8888a0] uppercase tracking-wider">{title}</p>
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5 mb-1">
        <span className="text-2xl font-bold text-[#f0f0f5] leading-none">{value}</span>
        {unit && <span className="text-sm text-[#8888a0] mb-0.5">{unit}</span>}
      </div>

      {subtitle && <p className="text-xs text-[#8888a0] mb-2">{subtitle}</p>}

      {change && (
        <p className={cn('text-xs font-medium mb-2', isPositive ? 'text-[#10b981]' : isNegative ? 'text-[#f43f5e]' : 'text-[#8888a0]')}>
          {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(change.value)}{change.label ? ` ${change.label}` : ''}
        </p>
      )}

      {progress !== undefined && (
        <ProgressBar value={progress} max={progressMax} color={color} height={3} />
      )}
    </motion.div>
  )
}
