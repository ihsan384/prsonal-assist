import { useEffect, useState } from 'react'
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle, CloudLightning } from 'lucide-react'
import { syncEngine } from '@/services/sync/SyncService'
import type { SyncStatusType } from '@/services/sync/SyncService'
import { cn } from '@/utils/cn'

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatusType>('offline')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const unsub = syncEngine.subscribe((newStatus, count) => {
      setStatus(newStatus)
      setPendingCount(count)
    })
    return unsub
  }, [])

  const config: Record<SyncStatusType, {
    text: string
    icon: React.ElementType
    className: string
    dotColor: string
    pulse: boolean
  }> = {
    offline: {
      text: 'Offline',
      icon: CloudOff,
      className: 'bg-[var(--bg-muted)] text-[var(--text-3)] border-[var(--border)]',
      dotColor: 'bg-[var(--text-3)]',
      pulse: false,
    },
    online: {
      text: 'Online',
      icon: Cloud,
      className: 'bg-[var(--bg-subtle)] text-[var(--text-2)] border-[var(--border)]',
      dotColor: 'bg-emerald-400',
      pulse: false,
    },
    syncing: {
      text: 'Syncing',
      icon: RefreshCw,
      className: 'bg-[var(--accent-bg)] text-[var(--accent)] border-[var(--accent-border)]',
      dotColor: 'bg-[var(--accent)]',
      pulse: true,
    },
    synced: {
      text: 'Synced',
      icon: CheckCircle2,
      className: 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)]',
      dotColor: 'bg-[var(--success)]',
      pulse: false,
    },
    failed: {
      text: 'Failed',
      icon: AlertTriangle,
      className: 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error-border)]',
      dotColor: 'bg-[var(--error)]',
      pulse: false,
    },
    pending: {
      text: pendingCount > 0 ? `${pendingCount} Pending` : 'Pending',
      icon: CloudLightning,
      className: 'bg-[var(--warning-bg)] text-[#d97706] border-[#fef3c7]',
      dotColor: 'bg-amber-400',
      pulse: true,
    },
  }

  const current = config[status] ?? config.offline
  const Icon = current.icon

  return (
    <div
      onClick={() => syncEngine.sync()}
      className={cn(
        'flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold cursor-pointer select-none transition-all active:scale-95 mr-2.5',
        current.className
      )}
      title="Sync status — click to sync now"
      aria-label={`Sync status: ${current.text}`}
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

      {/* Spinning icon for syncing state */}
      <Icon size={10} className={status === 'syncing' ? 'animate-spin' : ''} />

      <span>{current.text}</span>
    </div>
  )
}

export default SyncIndicator
