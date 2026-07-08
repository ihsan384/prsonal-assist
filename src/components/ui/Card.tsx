import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  children: ReactNode
  flat?: boolean
}

const paddingStyles = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  padding = 'md',
  hover = false,
  flat = false,
  className,
  children,
  onClick,
  ...props
}, ref) => {
  const interactive = !!onClick || hover

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        'bg-[var(--bg)] border border-[var(--border)] rounded-[12px]',
        !flat && 'shadow-[var(--shadow-sm)]',
        paddingStyles[padding],
        interactive && 'cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-all duration-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = 'Card'

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-[var(--text)]', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props}>{children}</div>
}

export function CardDivider() {
  return <div className="h-px bg-[var(--border)] -mx-4 my-3" />
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  change?: { value: number; label?: string }
  color?: string
  className?: string
  onClick?: () => void
}

export function MetricCard({ label, value, unit, change, className, onClick }: MetricCardProps) {
  const isPositive = change && change.value > 0
  const isNegative = change && change.value < 0

  return (
    <Card hover={!!onClick} onClick={onClick} className={cn('', className)}>
      <p className="text-xs text-[var(--text-3)] font-medium mb-1.5">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-semibold text-[var(--text)] leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        {unit && <span className="text-sm text-[var(--text-3)] mb-0.5">{unit}</span>}
      </div>
      {change && (
        <p className={cn(
          'text-xs mt-1 font-medium',
          isPositive ? 'text-[var(--success)]' : isNegative ? 'text-[var(--error)]' : 'text-[var(--text-3)]'
        )}>
          {isPositive ? '+' : ''}{change.value}{change.label ? ` ${change.label}` : ''}
        </p>
      )}
    </Card>
  )
}
