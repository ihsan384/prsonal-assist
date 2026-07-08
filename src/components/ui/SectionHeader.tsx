import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: ReactNode
  compact?: boolean
}

export function SectionHeader({ title, subtitle, action, compact = false, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', compact ? 'mb-2' : 'mb-3', className)} {...props}>
      <div>
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--text-3)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
    </div>
  )
}
