import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database, HardDrive, Cloud, CloudOff, RefreshCw, CheckCircle2,
  AlertTriangle, Clock, Archive, Activity
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { idb, STORES } from '@/services/storage/IndexedDB'
import { syncEngine } from '@/services/sync/SyncService'
import type { SyncStatusType } from '@/services/sync/SyncService'

interface StoreHealth {
  name: string
  total: number
  pending: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatTime(iso: string | null): string {
  if (!iso) return 'Never'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return 'Unknown'
  }
}

// Data stores to show health for (exclude pure management stores)
const DATA_STORE_KEYS = [
  STORES.TASKS, STORES.HABITS, STORES.GOALS, STORES.WORKOUTS, STORES.MEALS,
  STORES.SLEEP_LOGS, STORES.KNOWLEDGE, STORES.TRANSACTIONS, STORES.BUDGETS,
  STORES.SUBJECTS, STORES.CHAPTERS, STORES.TOPICS, STORES.SESSIONS,
  STORES.REVISIONS, STORES.QUESTIONS, STORES.TESTS, STORES.MISTAKES,
  STORES.FORMULAS, STORES.NOTES,
]

export default function DatabaseHealthPage() {
  const [storeHealth, setStoreHealth] = useState<StoreHealth[]>([])
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('offline')
  const [pendingTotal, setPendingTotal] = useState(0)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [syncQueueSize, setSyncQueueSize] = useState(0)

  async function loadHealth() {
    setIsRefreshing(true)
    try {
      // Load per-store counts
      const results: StoreHealth[] = []
      for (const store of DATA_STORE_KEYS) {
        try {
          const total = await idb.countAll(store)
          const pending = await idb.getPendingSync<any>(store)
          results.push({ name: store, total, pending: pending.length })
        } catch {
          results.push({ name: store, total: 0, pending: 0 })
        }
      }
      setStoreHealth(results)

      // Storage estimate
      const estimate = await idb.getStorageEstimate()
      setStorageEstimate(estimate)

      // Sync queue size
      const sq = await idb.getAll<any>(STORES.SYNC_QUEUE)
      setSyncQueueSize(sq.length)

      // Last backup
      setLastBackup(localStorage.getItem('ihsanos_last_backup'))

      // Pending total
      const pending = await idb.countAllPending()
      setPendingTotal(pending)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadHealth()
    const unsub = syncEngine.subscribe((status, pending) => {
      setSyncStatus(status)
      setPendingTotal(pending)
      setLastSync(syncEngine.lastSyncTime)
    })
    return unsub
  }, [])

  const totalRecords = storeHealth.reduce((s, h) => s + h.total, 0)

  const syncBadgeVariant =
    syncStatus === 'synced' ? 'success' :
    syncStatus === 'syncing' ? 'violet' :
    syncStatus === 'offline' ? 'default' :
    syncStatus === 'failed' ? 'error' : 'warning'

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Database Health</h2>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Real-time view of your local IndexedDB state</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={loadHealth}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="mb-5">
        <SectionHeader title="Summary" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Records', value: totalRecords.toLocaleString(), icon: Database, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-bg)]' },
            { label: 'Pending Sync', value: pendingTotal.toLocaleString(), icon: CloudOff, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Storage Used', value: storageEstimate ? formatBytes(storageEstimate.usage) : '...', icon: HardDrive, color: 'text-[var(--success)]', bg: 'bg-[var(--success-bg)]' },
            { label: 'Sync Queue', value: syncQueueSize.toString(), icon: Activity, color: 'text-[var(--info)]', bg: 'bg-[var(--info-bg)]' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-[var(--text)] tabular-nums">{stat.value}</p>
                    <p className="text-[10px] text-[var(--text-3)]">{stat.label}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-5">
        <SectionHeader title="Sync Status" />
        <Card>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {syncStatus === 'offline'
                  ? <CloudOff size={16} className="text-[var(--text-4)]" />
                  : syncStatus === 'syncing'
                  ? <RefreshCw size={16} className="text-[var(--accent)] animate-spin" />
                  : syncStatus === 'synced'
                  ? <CheckCircle2 size={16} className="text-[var(--success)]" />
                  : <AlertTriangle size={16} className="text-amber-500" />
                }
                <span className="text-sm font-medium text-[var(--text)]">Cloud Sync</span>
              </div>
              <Badge variant={syncBadgeVariant as any}>{syncStatus.toUpperCase()}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-3)]">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>Last sync: {formatTime(lastSync)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Archive size={12} />
                <span>Last backup: {formatTime(lastBackup)}</span>
              </div>
            </div>
            {storageEstimate && (
              <div>
                <div className="flex items-center justify-between text-xs text-[var(--text-3)] mb-1">
                  <span>Storage</span>
                  <span>{formatBytes(storageEstimate.usage)} / {formatBytes(storageEstimate.quota)}</span>
                </div>
                <div className="w-full bg-[var(--bg-muted)] rounded-full h-1.5">
                  <div
                    className="bg-[var(--accent)] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (storageEstimate.usage / storageEstimate.quota) * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Per-Store Breakdown */}
      <div className="mb-5">
        <SectionHeader title="Store Breakdown" />
        <Card padding="none">
          <div className="divide-y divide-[var(--border)]">
            {storeHealth.map(store => (
              <div key={store.name} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Database size={13} className="text-[var(--text-4)] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{store.name}</p>
                    <p className="text-xs text-[var(--text-3)]">{store.total} records</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {store.pending > 0 ? (
                    <Badge variant="warning" size="sm">{store.pending} pending</Badge>
                  ) : (
                    <Badge variant="success" size="sm">synced</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cloud Info */}
      <div className="mb-5">
        <SectionHeader title="Cloud Info" />
        <Card>
          <div className="flex items-start gap-3">
            <Cloud size={16} className="text-[var(--text-3)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[var(--text)]">Supabase Sync Target</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5 font-mono break-all">
                {import.meta.env.VITE_SUPABASE_URL ?? 'Not configured'}
              </p>
              <p className="text-xs text-[var(--text-4)] mt-2">
                All local data automatically syncs to your Supabase project when online.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
