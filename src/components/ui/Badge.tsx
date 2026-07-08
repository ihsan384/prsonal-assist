import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent' |
  'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'outline'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-[var(--bg-muted)] text-[var(--text-3)] border border-[var(--border)]',
  success:  'bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)]',
  warning:  'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-border)]',
  error:    'bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)]',
  info:     'bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info-border)]',
  accent:   'bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]',
  outline:  'bg-transparent text-[var(--text-3)] border border-[var(--border)]',
  blue:     'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  violet:   'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
  emerald:  'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  amber:    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  rose:     'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--text-4)]',
  success: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning)]',
  error:   'bg-[var(--error)]',
  info:    'bg-[var(--info)]',
  accent:  'bg-[var(--accent)]',
  outline: 'bg-[var(--text-4)]',
  blue:    'bg-blue-500',
  violet:  'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
}

export function Badge({ variant = 'default', size = 'md', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full leading-none',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  )
}
