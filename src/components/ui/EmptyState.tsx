import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {icon && (
        <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-4)] mb-3">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-[var(--text-2)] mb-1">{title}</p>
      {description && <p className="text-xs text-[var(--text-3)] max-w-[220px] mb-4">{description}</p>}
      {action}
    </div>
  )
}
