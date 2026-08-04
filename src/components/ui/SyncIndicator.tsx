import { useEffect, useState } from 'react'
import { syncEngine } from '@/services/sync/SyncService'
import type { SyncStatusType } from '@/services/sync/SyncService'
import { cn } from '@/utils/cn'

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatusType>('offline')

  useEffect(() => {
    const unsub = syncEngine.subscribe((newStatus) => {
      setStatus(newStatus)
    })
    return unsub
  }, [])

  const config: Record<SyncStatusType, {
    text: string
    className: string
    dotColor: string
    pulse: boolean
  }> = {
    offline: {
      text: 'Offline',
      className: 'bg-[var(--bg-muted)] text-[var(--text-3)] border-[var(--border)]',
      dotColor: 'bg-[var(--text-3)]',
      pulse: false,
    },
    online: {
      text: 'Connecting...',
      className: 'bg-[var(--bg-subtle)] text-[var(--text-2)] border-[var(--border)]',
      dotColor: 'bg-amber-400',
      pulse: true,
    },
    syncing: {
      text: 'Syncing...',
      className: 'bg-[var(--accent-bg)] text-[var(--accent)] border-[var(--accent-border)]',
      dotColor: 'bg-[var(--accent)]',
      pulse: true,
    },
    synced: {
      text: 'Realtime Live',
      className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      dotColor: 'bg-emerald-500',
      pulse: true,
    },
    failed: {
      text: 'Disconnected',
      className: 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error-border)]',
      dotColor: 'bg-[var(--error)]',
      pulse: false,
    },
  }

  const current = config[status] ?? config.offline

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold select-none transition-all mr-2.5',
        current.className
      )}
      title="Automated Supabase Realtime Cross-Device Sync"
      aria-label={`Realtime sync status: ${current.text}`}
    >
      {/* Animated status dot */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        {current.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              current.dotColor,
              'animate-ping'
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', current.dotColor)} />
      </span>

      <span>{current.text}</span>
    </div>
  )
}

export default SyncIndicator
