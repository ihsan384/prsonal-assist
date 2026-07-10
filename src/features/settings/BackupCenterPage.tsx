import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Archive, Download, Upload, Trash2, Plus,
  CheckCircle2, AlertTriangle, FileJson, FileText, Clock
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { backupService, type BackupHistoryEntry, type BackupData } from '@/services/storage/BackupService'
import { memoryStore } from '@/services/storage/MemoryStore'

interface ToggleProps { enabled: boolean; onToggle: () => void }
function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${enabled ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const CSV_MODULES: Array<{ key: keyof BackupData['data']; label: string }> = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'habits', label: 'Habits' },
  { key: 'goals', label: 'Goals' },
  { key: 'workouts', label: 'Workouts' },
  { key: 'meals', label: 'Meals' },
  { key: 'sleepLogs', label: 'Sleep Logs' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'subjects', label: 'Study Subjects' },
  { key: 'sessions', label: 'Study Sessions' },
]

export default function BackupCenterPage() {
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [history, setHistory] = useState<BackupHistoryEntry[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BackupHistoryEntry | null>(null)
  const [autoBackup, setAutoBackup] = useState(backupService.autoBackup)
  const [frequency, setFrequency] = useState(backupService.backupFrequency)

  async function loadHistory() {
    setHistory(await backupService.getBackupHistory())
  }

  useEffect(() => { loadHistory() }, [])

  // Persist settings on change
  useEffect(() => { backupService.autoBackup = autoBackup }, [autoBackup])
  useEffect(() => { backupService.backupFrequency = frequency }, [frequency])

  async function handleCreate() {
    setIsCreating(true)
    try {
      const { json, entry } = await backupService.createAndSaveBackup()
      downloadFile(json, `ihsanos_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json')
      await loadHistory()
      toast.success('Backup created and downloaded.', entry.label)
    } catch (err) {
      toast.error('Backup failed.', String(err))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDownload(entry: BackupHistoryEntry) {
    try {
      // Re-export fresh data (we don't store the full JSON in IDB — only metadata)
      const json = await backupService.exportBackup()
      downloadFile(json, `ihsanos_backup_${entry.createdAt.split('T')[0]}.json`, 'application/json')
      toast.success('Backup downloaded.')
    } catch (err) {
      toast.error('Download failed.', String(err))
    }
  }

  async function handleDelete(entry: BackupHistoryEntry) {
    await backupService.deleteBackupEntry(entry.id)
    await loadHistory()
    setDeleteTarget(null)
    toast.success('Backup entry deleted.')
  }

  function handleImportClick() { fileInputRef.current?.click() }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string
        await backupService.importBackup(text)
        toast.success('Backup restored! Reloading...')
        setTimeout(() => window.location.reload(), 1500)
      } catch (err) {
        toast.error('Import failed.', String(err))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleExportCSV(module: keyof BackupData['data']) {
    await memoryStore.init()
    const data = (memoryStore as any)[module]
    if (!Array.isArray(data) || data.length === 0) {
      toast.info('No data', `No records in "${module}" to export.`)
      return
    }
    const csv = backupService.exportCSV(module, data)
    downloadFile(csv, `ihsanos_${module}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
    toast.success(`${module} exported as CSV.`)
  }

  async function handleExportFullJSON() {
    try {
      const json = await backupService.exportBackup()
      downloadFile(json, `ihsanos_full_${new Date().toISOString().split('T')[0]}.json`, 'application/json')
      toast.success('Full JSON export downloaded.')
    } catch (err) {
      toast.error('Export failed.', String(err))
    }
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h2 className="text-base font-bold text-[var(--text)]">Backup Center</h2>
        <p className="text-xs text-[var(--text-3)] mt-0.5">Create, restore, and manage your data backups</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="mb-5">
        <SectionHeader title="Quick Actions" />
        <Card>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              fullWidth
              icon={<Plus size={14} />}
              onClick={handleCreate}
              loading={isCreating}
            >
              Create Backup
            </Button>
            <Button
              variant="secondary"
              fullWidth
              icon={<Upload size={14} />}
              onClick={handleImportClick}
            >
              Import Backup
            </Button>
            <Button
              variant="secondary"
              fullWidth
              icon={<FileJson size={14} />}
              onClick={handleExportFullJSON}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              fullWidth
              icon={<FileText size={14} />}
              onClick={() => {}} // opens CSV section (scroll)
            >
              Export CSV ↓
            </Button>
          </div>
        </Card>
        <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" className="hidden" />
      </div>

      {/* Auto Backup Settings */}
      <div className="mb-5">
        <SectionHeader title="Automatic Backup" />
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Auto Backup</p>
                <p className="text-xs text-[var(--text-3)]">Create backups automatically</p>
              </div>
              <Toggle enabled={autoBackup} onToggle={() => setAutoBackup(!autoBackup)} />
            </div>
            {autoBackup && (
              <div>
                <p className="text-xs font-medium text-[var(--text-2)] mb-2">Backup Frequency</p>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                        frequency === f
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'bg-[var(--bg)] text-[var(--text-3)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Backup History */}
      <div className="mb-5">
        <SectionHeader title={`Backup History (${history.length})`} />
        {history.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Archive size={28} className="text-[var(--text-4)]" />
              <p className="text-sm text-[var(--text-3)]">No backups yet</p>
              <p className="text-xs text-[var(--text-4)]">Create your first backup using the button above</p>
            </div>
          </Card>
        ) : (
          <Card padding="none">
            <div className="divide-y divide-[var(--border)]">
              <AnimatePresence>
                {history.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-4 py-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                      <Archive size={14} className="text-[var(--accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] truncate">{entry.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--text-3)] flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(entry.createdAt)}
                        </span>
                        <Badge variant="default" size="sm">{formatBytes(entry.sizeBytes)}</Badge>
                        <Badge variant="default" size="sm">{entry.recordCount} records</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon-sm" title="Download" onClick={() => handleDownload(entry)}>
                        <Download size={13} />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Delete" onClick={() => setDeleteTarget(entry)}>
                        <Trash2 size={13} className="text-[var(--error)]" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        )}
      </div>

      {/* CSV Export */}
      <div className="mb-5">
        <SectionHeader title="Export as CSV" />
        <Card padding="none">
          <div className="divide-y divide-[var(--border)]">
            {CSV_MODULES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText size={14} className="text-[var(--text-4)]" />
                  <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                </div>
                <Button variant="ghost" size="sm" icon={<Download size={12} />} onClick={() => handleExportCSV(key)}>
                  CSV
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Import Info Banner */}
      <div className="mb-5">
        <Card>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-[var(--success)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--text)]">Backup Compatibility</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5 leading-relaxed">
                Backups are versioned (current: v2.0). Importing a backup will{' '}
                <span className="font-semibold text-[var(--error)]">replace all local data</span>{' '}
                and queue everything for sync to Supabase.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Backup Entry"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--error-bg)] border border-[var(--error-border)]">
            <AlertTriangle size={16} className="text-[var(--error)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error)]">
              Remove "<strong>{deleteTarget?.label}</strong>" from backup history?
              This does not delete any app data — only this history record.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" icon={<Trash2 size={14} />} onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete Entry
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}
