import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, AlertTriangle, RefreshCw, CheckCircle, Clock, Trash2, ArrowRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { syncEngine } from '@/services/sync/SyncService'
import { idb, STORES } from '@/services/storage/IndexedDB'
import { memoryStore } from '@/services/storage/MemoryStore'
import { useToast } from '@/hooks/useToast'

export default function SyncQueuePage() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'upload' | 'conflict' | 'retry' | 'failed' | 'logs'>('upload')
  
  // State variables for queues
  const [uploadQueue, setUploadQueue] = useState<any[]>([])
  const [conflictQueue, setConflictQueue] = useState<any[]>([])
  const [retryQueue, setRetryQueue] = useState<any[]>([])
  const [failedQueue, setFailedQueue] = useState<any[]>([])
  const [syncLogs, setSyncLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Selected conflict for modal diff resolution
  const [selectedConflict, setSelectedConflict] = useState<any | null>(null)

  const loadData = async () => {
    try {
      const uploads = await syncEngine.getUploadQueue()
      const conflicts = await syncEngine.getConflictQueue()
      const retries = syncEngine.getRetryQueue()
      const failed = await syncEngine.getFailedQueue()
      const logs = await syncEngine.getSyncLog(50)

      setUploadQueue(uploads)
      setConflictQueue(conflicts)
      setRetryQueue(retries)
      setFailedQueue(failed)
      setSyncLogs(logs)
    } catch (err) {
      console.error('[SyncQueue] Load failed:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleForceSync = async () => {
    setLoading(true)
    toast.info('Starting manual synchronization...')
    try {
      await syncEngine.sync()
      toast.success('Sync run completed.')
    } catch {
      toast.error('Sync completed with errors.')
    }
    await loadData()
    setLoading(false)
  }

  const handleForceRetry = async () => {
    setLoading(true)
    toast.info('Retrying failed uploads...')
    await syncEngine.retryFailed()
    await loadData()
    setLoading(false)
  }

  // Resolve conflict: Choose Local
  const handleResolveLocal = async (conflict: any) => {
    try {
      const storeName = conflict.table
      const localRecord = {
        ...conflict.localData,
        pendingSync: true,
        syncStatus: 'pending',
        retryCount: 0
      }
      
      // Save locally
      await idb.put(storeName, localRecord)
      
      // Update memory cache
      const memKey = storeName as keyof typeof memoryStore
      if (Array.isArray(memoryStore[memKey])) {
        const list = memoryStore[memKey] as any[]
        const idx = list.findIndex(i => i.id === localRecord.id)
        if (idx >= 0) list[idx] = localRecord
      }

      // Remove from conflict queue
      await idb.delete(STORES.CONFLICT_QUEUE, conflict.id)
      
      toast.success('Kept local version. Will sync on next run.')
      setSelectedConflict(null)
      loadData()
    } catch (err) {
      toast.error('Resolution failed.')
    }
  }

  // Resolve conflict: Choose Server
  const handleResolveServer = async (conflict: any) => {
    try {
      const storeName = conflict.table
      const serverRecord = {
        ...conflict.serverData,
        pendingSync: false,
        syncStatus: 'success',
        lastSyncedAt: new Date().toISOString()
      }
      
      // Overwrite local copy with server version
      await idb.put(storeName, serverRecord)
      
      // Update memory cache
      const memKey = storeName as keyof typeof memoryStore
      if (Array.isArray(memoryStore[memKey])) {
        const list = memoryStore[memKey] as any[]
        const idx = list.findIndex(i => i.id === serverRecord.id)
        if (idx >= 0) list[idx] = serverRecord
      }

      // Remove from conflict queue
      await idb.delete(STORES.CONFLICT_QUEUE, conflict.id)
      
      toast.success('Applied server version locally.')
      setSelectedConflict(null)
      loadData()
    } catch (err) {
      toast.error('Resolution failed.')
    }
  }

  return (
    <PageWrapper>
      {/* Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-[var(--bg-subtle)] to-[var(--bg-subtle)] border-indigo-500/20 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 shrink-0">
                <Database size={22} />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text)]">Supabase Sync Center</h1>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  Monitor transaction queues, resolve data conflict diffs, and inspect connection diagnostics.
                </p>
              </div>
            </div>
            
            <div className="shrink-0 flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleForceRetry} disabled={loading}>
                Force Retry
              </Button>
              <Button variant="primary" size="sm" onClick={handleForceSync} disabled={loading}>
                <RefreshCw size={12} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Sync Now
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs list */}
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-[var(--border)] mb-5">
        {[
          { id: 'upload', label: 'Upload Queue', count: uploadQueue.length },
          { id: 'conflict', label: 'Conflicts', count: conflictQueue.length, variant: 'error' },
          { id: 'retry', label: 'Retrying', count: retryQueue.length },
          { id: 'failed', label: 'Failed', count: failedQueue.length },
          { id: 'logs', label: 'History Logs', count: syncLogs.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]'
                : 'text-[var(--text-3)] border border-transparent hover:bg-[var(--bg-subtle)]'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                tab.variant === 'error' ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--border-strong)] text-[var(--text-2)]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="text-left">
        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card padding="none">
                {uploadQueue.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-3)]">No pending uploads. Everything is synced!</div>
                ) : (
                  <div className="divide-y divide-[var(--border)] text-xs">
                    {uploadQueue.map(item => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-subtle)]">
                        <div>
                          <p className="font-semibold text-[var(--text)] line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-[var(--text-4)] mt-0.5">Table: {item.table} | ID: {item.id}</p>
                        </div>
                        <Badge variant="accent" size="sm">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'conflict' && (
            <motion.div key="conflict" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card padding="none">
                {conflictQueue.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-3)]">No active conflicts detected. Clean sync!</div>
                ) : (
                  <div className="divide-y divide-[var(--border)] text-xs">
                    {conflictQueue.map(item => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-subtle)]">
                        <div>
                          <p className="font-bold text-red-500 flex items-center gap-1.5">
                            <AlertTriangle size={14} /> Conflict: {item.localData?.name || item.localData?.title || item.id}
                          </p>
                          <p className="text-[10px] text-[var(--text-4)] mt-1">Table: {item.table} | Date: {new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedConflict(item)}>
                          Resolve Diff
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'retry' && (
            <motion.div key="retry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card padding="none">
                {retryQueue.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-3)]">No files scheduled in retry queues.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)] text-xs">
                    {retryQueue.map(item => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-[var(--bg-subtle)]">
                        <div>
                          <p className="font-semibold text-[var(--text)]">Retry: {item.table} ({item.id})</p>
                          <p className="text-[10px] text-[var(--text-4)] mt-0.5">Attempts: {item.attempts}/3 | Retrying at {item.nextRetryAt}</p>
                        </div>
                        <Badge variant="violet" size="sm">Backoff Scheduled</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card padding="none">
                {failedQueue.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-3)]">No permanently failed sync entries.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)] text-xs">
                    {failedQueue.map(item => (
                      <div key={item.id} className="p-3.5 hover:bg-[var(--bg-subtle)]">
                        <div className="flex justify-between">
                          <span className="font-semibold text-[var(--text)]">{item.name}</span>
                          <Badge variant="error" size="sm">Failed</Badge>
                        </div>
                        <div className="mt-1.5 bg-red-500/5 text-red-500 p-2 rounded font-mono text-[9px]">
                          Error: {item.error}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card padding="none">
                {syncLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[var(--text-3)]">No sync history logs written.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)] text-xs">
                    {syncLogs.map(log => (
                      <div key={log.id} className="p-3 hover:bg-[var(--bg-subtle)] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock size={14} className="text-[var(--text-4)] shrink-0" />
                          <div>
                            <p className="font-semibold text-[var(--text)] capitalize">{log.operation} - {log.store}</p>
                            <p className="text-[10px] text-[var(--text-4)] mt-0.5">
                              {new Date(log.timestamp).toLocaleString()} | Records: {log.recordCount} | Duration: {log.durationMs}ms
                            </p>
                          </div>
                        </div>
                        <Badge variant={log.status === 'success' ? 'success' : 'error'} size="sm">
                          {log.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side-by-Side Conflict Resolution Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl w-full max-w-4xl p-5 shadow-2xl flex flex-col max-h-[85vh] text-left">
            <h2 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-1.5">
              <AlertTriangle className="text-red-500" size={16} />
              Resolve Data Conflict
            </h2>
            <p className="text-xs text-[var(--text-3)] mb-4">
              Both local device edits and server cloud data were modified concurrently for table: <strong className="text-[var(--text)]">{selectedConflict.table}</strong>. Select the version to preserve.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 mb-4 pr-1 min-h-[30vh]">
              {/* Local Data Panel */}
              <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--bg)] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[var(--accent)] mb-2 flex items-center justify-between">
                    <span>1. Local Device Version</span>
                    <Badge variant="accent" size="sm">Pending</Badge>
                  </h3>
                  <pre className="text-[10px] font-mono bg-[var(--bg-muted)] p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-60 text-[var(--text-2)]">
                    {JSON.stringify(selectedConflict.localData, null, 2)}
                  </pre>
                </div>
                <Button variant="primary" fullWidth className="mt-4" onClick={() => handleResolveLocal(selectedConflict)}>
                  Preserve Local Version
                </Button>
              </div>

              {/* Server Data Panel */}
              <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--bg)] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-green-500 mb-2 flex items-center justify-between">
                    <span>2. Cloud Server Version</span>
                    <Badge variant="success" size="sm">Synced</Badge>
                  </h3>
                  <pre className="text-[10px] font-mono bg-[var(--bg-muted)] p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-60 text-[var(--text-2)]">
                    {JSON.stringify(selectedConflict.serverData, null, 2)}
                  </pre>
                </div>
                <Button variant="outline" fullWidth className="mt-4" onClick={() => handleResolveServer(selectedConflict)}>
                  Overwrite with Cloud Version
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--border)]">
              <Button variant="ghost" size="sm" onClick={() => setSelectedConflict(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  )
}
