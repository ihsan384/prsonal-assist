import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, Trash2, RefreshCw, CheckCircle2, XCircle,
  Clock, RotateCcw
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { syncEngine, type SyncLogEntry } from '@/services/sync/SyncService'

type StatusFilter = 'all' | 'success' | 'failed'
type OpFilter = 'all' | 'upload' | 'delete'

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch { return iso }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function SyncLogPage() {
  const toast = useToast()
  const [entries, setEntries] = useState<SyncLogEntry[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClearOpen, setIsClearOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [opFilter, setOpFilter] = useState<OpFilter>('all')

  async function load() {
    setIsRefreshing(true)
    try {
      const log = await syncEngine.getSyncLog(200)
      setEntries(log)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleClear() {
    await syncEngine.clearSyncLog()
    setEntries([])
    setIsClearOpen(false)
    toast.success('Sync log cleared.')
  }

  async function handleRetryFailed() {
    if (!navigator.onLine) {
      toast.error('You are offline. Connect to retry.')
      return
    }
    toast.info('Retrying failed syncs...')
    await syncEngine.retryFailed()
    await load()
    toast.success('Retry complete.')
  }

  const filtered = entries.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (opFilter !== 'all' && e.operation !== opFilter) return false
    return true
  })

  const successCount = entries.filter(e => e.status === 'success').length
  const failedCount = entries.filter(e => e.status === 'failed').length

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Sync History</h2>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Log of every sync operation performed</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />}
              onClick={load}
              disabled={isRefreshing}
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: entries.length, icon: Clock, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-bg)]' },
            { label: 'Success', value: successCount, icon: CheckCircle2, color: 'text-[var(--success)]', bg: 'bg-[var(--success-bg)]' },
            { label: 'Failed', value: failedCount, icon: XCircle, color: 'text-[var(--error)]', bg: 'bg-[var(--error-bg)]' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <div className="flex flex-col gap-1 items-center text-center">
                  <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon size={15} className={stat.color} />
                  </div>
                  <p className="text-lg font-bold text-[var(--text)] tabular-nums">{stat.value}</p>
                  <p className="text-[10px] text-[var(--text-3)]">{stat.label}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          icon={<RotateCcw size={13} />}
          onClick={handleRetryFailed}
          disabled={failedCount === 0}
        >
          Retry Failed ({failedCount})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={13} className="text-[var(--error)]" />}
          onClick={() => setIsClearOpen(true)}
          disabled={entries.length === 0}
        >
          Clear Log
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <SectionHeader title="Filters" />
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {(['all', 'success', 'failed'] as StatusFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors capitalize ${
                  statusFilter === f
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-[var(--bg)] text-[var(--text-3)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {(['all', 'upload', 'delete'] as OpFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setOpFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors capitalize ${
                  opFilter === f
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-[var(--bg)] text-[var(--text-3)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Entries */}
      <div className="mb-5">
        <SectionHeader title={`Entries (${filtered.length})`} />
        {filtered.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Clock size={28} className="text-[var(--text-4)]" />
              <p className="text-sm text-[var(--text-3)]">No sync log entries yet</p>
              <p className="text-xs text-[var(--text-4)]">
                Entries appear here after a successful or failed sync operation.
              </p>
            </div>
          </Card>
        ) : (
          <Card padding="none">
            <div className="divide-y divide-[var(--border)]">
              {filtered.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                  <div className={`flex-shrink-0 mt-0.5 ${entry.status === 'success' ? 'text-[var(--success)]' : entry.status === 'failed' ? 'text-[var(--error)]' : 'text-[var(--text-4)]'}`}>
                    {entry.status === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--text)]">{entry.store}</span>
                      <Badge
                        variant={entry.status === 'success' ? 'success' : 'error'}
                        size="sm"
                      >
                        {entry.operation}
                      </Badge>
                      <Badge variant="default" size="sm">{entry.recordCount} records</Badge>
                      <Badge variant="default" size="sm">{formatDuration(entry.durationMs)}</Badge>
                      {entry.retryCount > 0 && (
                        <Badge variant="warning" size="sm">{entry.retryCount} retries</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={10} className="text-[var(--text-4)]" />
                      <span className="text-xs text-[var(--text-3)]">{formatTime(entry.timestamp)}</span>
                    </div>
                    {entry.errorMessage && (
                      <p className="text-xs text-[var(--error)] mt-1 font-mono truncate">{entry.errorMessage}</p>
                    )}
                  </div>
                  {entry.operation === 'upload' ? (
                    <Upload size={12} className="text-[var(--text-4)] flex-shrink-0 mt-1" />
                  ) : (
                    <Trash2 size={12} className="text-[var(--text-4)] flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Clear Confirm Modal */}
      <Modal isOpen={isClearOpen} onClose={() => setIsClearOpen(false)} title="Clear Sync Log">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-2)] leading-relaxed">
            This will permanently delete all {entries.length} sync log entries.
            Your actual data will not be affected.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsClearOpen(false)}>Cancel</Button>
            <Button variant="destructive" icon={<Trash2 size={14} />} onClick={handleClear}>
              Clear All Entries
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}
