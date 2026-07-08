import { cn } from '@/utils/cn'

// ─── Card Skeleton ────────────────────────────────────────────────────────────

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[12px] border border-[var(--border)] bg-[var(--bg)] p-4 shadow-[var(--shadow-sm)]', className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-[8px] bg-[var(--bg-muted)] animate-shimmer" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3 w-32 rounded-full bg-[var(--bg-muted)] animate-shimmer" />
          <div className="h-2.5 w-20 rounded-full bg-[var(--bg-muted)] animate-shimmer" />
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--bg-muted)] animate-shimmer mb-2" />
      <div className="h-2 w-3/4 rounded-full bg-[var(--bg-muted)] animate-shimmer" />
    </div>
  )
}

// ─── Text Skeleton ────────────────────────────────────────────────────────────

export function TextSkeleton({ width = '100%', className }: { width?: string | number; className?: string }) {
  return (
    <div className={cn('h-3 rounded-full bg-[var(--bg-muted)] animate-shimmer', className)} style={{ width }} />
  )
}

// ─── Table Row Skeleton ────────────────────────────────────────────────────────

export function TableRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg)] overflow-hidden divide-y divide-[var(--border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-7 h-7 rounded-[6px] bg-[var(--bg-muted)] animate-shimmer flex-shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 rounded-full bg-[var(--bg-muted)] animate-shimmer" style={{ width: `${60 + (i % 3) * 15}%` }} />
            <div className="h-2.5 w-20 rounded-full bg-[var(--bg-muted)] animate-shimmer" />
          </div>
          <div className="h-3 w-12 rounded-full bg-[var(--bg-muted)] animate-shimmer flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ─── Page Loader ──────────────────────────────────────────────────────────────

export function PageLoader() {
  return (
    <div className="px-4 pt-4 flex flex-col gap-3">
      <CardSkeleton />
      <div className="grid grid-cols-2 gap-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton />
    </div>
  )
}
