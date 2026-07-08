import { useEffect, useState } from 'react'
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle, CloudLightning } from 'lucide-react'
import { syncEngine, SyncStatusType } from '@/services/sync/SyncService'
import { cn } from '@/utils/cn'

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatusType>('offline')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    return syncEngine.subscribe((newStatus, count) => {
      setStatus(newStatus)
      setPendingCount(count)
    })
  }, [])

  const config = {
    offline: { text: 'Offline', icon: CloudOff, className: 'bg-[var(--bg-muted)] text-[var(--text-3)] border-[var(--border)]' },
    online: { text: 'Online', icon: Cloud, className: 'bg-[var(--bg-subtle)] text-[var(--text-2)] border-[var(--border)]' },
    syncing: { text: 'Syncing', icon: RefreshCw, className: 'bg-[var(--accent-bg)] text-[var(--accent)] border-[var(--accent-border)]' },
    synced: { text: 'Synced', icon: CheckCircle2, className: 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)]' },
    failed: { text: 'Sync Failed', icon: AlertTriangle, className: 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error-border)]' },
    pending: { text: `${pendingCount} Pending`, icon: CloudLightning, className: 'bg-[var(--warning-bg)] text-[#d97706] border-[#fef3c7]' }
  }

  const current = config[status] || config.offline
  const Icon = current.icon

  return (
    <div
      onClick={() => syncEngine.sync()}
      className={cn(
        'flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold cursor-pointer select-none transition-all active:scale-95 mr-2.5',
        current.className
      )}
      title="Supabase sync engine status. Click to sync now."
    >
      <Icon size={11} className={status === 'syncing' ? 'animate-spin' : ''} />
      <span>{current.text}</span>
    </div>
  )
}
export default SyncIndicator
