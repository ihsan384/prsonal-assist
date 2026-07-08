import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, Volume2, Vibrate, Clock, Calendar,
  Palette, Trash2, ChevronRight, Shield, Database, Info,
  BookOpen, Droplet, Moon, Flame, RefreshCw, Upload, Download, AlertTriangle
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { settingsStorage } from '@/services/storage'
import { syncEngine, SyncStatusType } from '@/services/sync/SyncService'
import { backupService } from '@/services/storage/BackupService'
import { idb } from '@/services/storage/IndexedDB'
import { memoryStore } from '@/services/storage/MemoryStore'
import { isSupabaseConfigured } from '@/services/supabase/supabase'

interface ToggleProps {
  enabled: boolean
  onToggle: () => void
}

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

export default function SettingsPage() {
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Settings from local storage
  const [appSettings, setAppSettings] = useState(() => settingsStorage.get())
  
  // Sync engine stats
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('offline')
  const [pendingRecords, setPendingRecords] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  // Sync settings toggles
  const [autoSync, setAutoSync] = useState(syncEngine.autoSync)
  const [wifiOnly, setWifiOnly] = useState(syncEngine.syncWifiOnly)
  const [backgroundSync, setBackgroundSync] = useState(syncEngine.backgroundSync)

  // Modals
  const [isLocalWipeOpen, setIsLocalWipeOpen] = useState(false)
  const [confirmWipeInput, setConfirmWipeInput] = useState('')
  const [isCloudWipeOpen, setIsCloudWipeOpen] = useState(false)

  useEffect(() => {
    // Sync settings back to engine
    syncEngine.autoSync = autoSync
    syncEngine.syncWifiOnly = wifiOnly
    syncEngine.backgroundSync = backgroundSync
  }, [autoSync, wifiOnly, backgroundSync])

  useEffect(() => {
    const unsub = syncEngine.subscribe((status, pending) => {
      setSyncStatus(status)
      setPendingRecords(pending)
      setLastSyncTime(syncEngine.lastSyncTime)
    })
    return unsub
  }, [])

  const updateSetting = (key: keyof typeof appSettings, value: any) => {
    const updated = { ...appSettings, [key]: value }
    setAppSettings(updated)
    settingsStorage.set({ [key]: value })
  }

  const handleManualSync = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured. Setup environment variables to sync.')
      return
    }
    toast.info('Starting synchronization...')
    await syncEngine.sync()
    if (syncEngine.status === 'failed') {
      toast.error('Sync failed. Check your network or connection key settings.')
    } else {
      toast.success('Sync complete!')
    }
  }

  const handleExportBackup = async () => {
    try {
      const backupJSON = await backupService.exportBackup()
      const blob = new Blob([backupJSON], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ihsanos_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Backup file generated and downloaded successfully.')
    } catch (err) {
      toast.error('Failed to generate backup file.')
      console.error(err)
    }
  }

  const handleImportBackupClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        await backupService.importBackup(text)
        toast.success('Backup restored successfully! Reloading page...')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } catch (err) {
        toast.error('Failed to import backup. Please verify the JSON file is correct.')
        console.error(err)
      }
    }
    reader.readAsText(file)
  }

  const handleLocalWipe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmWipeInput !== 'DELETE') {
      toast.error('Please type "DELETE" exactly to confirm.')
      return
    }

    try {
      // Delete IndexedDB database
      await idb.deleteDatabase()
      
      // Clear localStorage
      localStorage.clear()
      
      toast.success('All local data wiped. Resetting application...')
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (err) {
      toast.error('Failed to delete local database.')
      console.error(err)
    }
  }

  const handleCloudWipe = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase not configured.')
      return
    }

    try {
      toast.info('De-provisioning cloud database...')
      await syncEngine.wipeCloudData()
      toast.success('All data wiped from Supabase cloud database.')
      setIsCloudWipeOpen(false)
    } catch (err) {
      toast.error('Failed to delete cloud data.')
      console.error(err)
    }
  }

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Never'
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Never'
    }
  }

  return (
    <PageWrapper>
      {/* App Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center text-white font-bold text-lg">
              I
            </div>
            <div>
              <p className="text-base font-bold text-[var(--text)]">Ihsan OS</p>
              <p className="text-xs text-[var(--text-3)]">Version 1.3.0 · Offline First</p>
              <Badge variant="violet" size="sm" className="mt-1">Personal Life Operating System</Badge>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Sync Status and Options */}
      <div className="mb-5">
        <SectionHeader title="Supabase Sync & Cloud" />
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Sync Status</p>
                <p className="text-xs text-[var(--text-3)] mt-0.5">
                  Last Sync: {formatTime(lastSyncTime)} · {pendingRecords} records pending
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  syncStatus === 'synced' ? 'success' :
                  syncStatus === 'syncing' ? 'violet' :
                  syncStatus === 'offline' ? 'default' : 'warning'
                }>
                  {syncStatus.toUpperCase()}
                </Badge>
                <Button variant="ghost" size="icon-sm" onClick={handleManualSync} title="Sync Now">
                  <RefreshCw size={13} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Auto Sync</p>
                <p className="text-xs text-[var(--text-3)]">Sync data in background automatically</p>
              </div>
              <Toggle enabled={autoSync} onToggle={() => setAutoSync(!autoSync)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Sync Only on Wi-Fi</p>
                <p className="text-xs text-[var(--text-3)]">Conserve cellular bandwidth data</p>
              </div>
              <Toggle enabled={wifiOnly} onToggle={() => setWifiOnly(!wifiOnly)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Background Sync</p>
                <p className="text-xs text-[var(--text-3)]">Allows syncing when app is minimized</p>
              </div>
              <Toggle enabled={backgroundSync} onToggle={() => setBackgroundSync(!backgroundSync)} />
            </div>
            
            <Button variant="primary" fullWidth icon={<RefreshCw size={14} />} onClick={handleManualSync}>
              Sync Cloud Backup Now
            </Button>
          </div>
        </Card>
      </div>

      {/* Toggle Preferences */}
      <div className="mb-5">
        <SectionHeader title="Preferences" />
        <Card padding="none">
          <div className="divide-y divide-[var(--border)]">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                <Palette size={16} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Compact Mode</p>
                <p className="text-xs text-[var(--text-3)]">Reduce spacing layout padding</p>
              </div>
              <Toggle enabled={appSettings.compactMode} onToggle={() => updateSetting('compactMode', !appSettings.compactMode)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                <Bell size={16} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Notifications</p>
                <p className="text-xs text-[var(--text-3)]">Habit and tasks alert reminders</p>
              </div>
              <Toggle enabled={appSettings.notifications} onToggle={() => updateSetting('notifications', !appSettings.notifications)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                <Volume2 size={16} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Sound FX</p>
                <p className="text-xs text-[var(--text-3)]">Sound effects on checking off entries</p>
              </div>
              <Toggle enabled={appSettings.soundEnabled} onToggle={() => updateSetting('soundEnabled', !appSettings.soundEnabled)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                <Vibrate size={16} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Haptic Vibration</p>
                <p className="text-xs text-[var(--text-3)]">Tactile feedback on complete logs</p>
              </div>
              <Toggle enabled={appSettings.hapticEnabled} onToggle={() => updateSetting('hapticEnabled', !appSettings.hapticEnabled)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Week Starts Monday</p>
                <p className="text-xs text-[var(--text-3)]">Start calendar view on Monday</p>
              </div>
              <Toggle enabled={appSettings.weekStartsOn === 1} onToggle={() => updateSetting('weekStartsOn', appSettings.weekStartsOn === 1 ? 0 : 1)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">24-Hour Format</p>
                <p className="text-xs text-[var(--text-3)]">Display military time format</p>
              </div>
              <Toggle enabled={appSettings.timeFormat === '24h'} onToggle={() => updateSetting('timeFormat', appSettings.timeFormat === '24h' ? '12h' : '24h')} />
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Goals Info */}
      <div className="mb-5">
        <SectionHeader title="Daily Goals Summary" />
        <Card>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Study Goal', value: `${appSettings.studyTimerDefault} mins pomodoro`, icon: BookOpen },
              { label: 'Water Goal', value: `${appSettings.waterGoal} ml`, icon: Droplet },
              { label: 'Sleep Goal', value: `${appSettings.sleepGoal} hours`, icon: Moon },
              { label: 'Calorie Goal', value: `${appSettings.calorieGoal} kcal`, icon: Flame },
            ].map(goal => {
              const GoalIcon = goal.icon
              return (
                <div key={goal.label} className="flex items-center gap-3">
                  <GoalIcon size={18} className="text-[var(--text-3)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text)]">{goal.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--accent)] font-semibold">{goal.value}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Backup & Restore */}
      <div className="mb-5">
        <SectionHeader title="Local Backup & Restore" />
        <Card>
          <div className="flex flex-col gap-3">
            <Button variant="secondary" fullWidth icon={<Download size={14} />} onClick={handleExportBackup}>
              Export Data to JSON File
            </Button>
            <Button variant="secondary" fullWidth icon={<Upload size={14} />} onClick={handleImportBackupClick}>
              Import JSON Backup File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="mb-5">
        <SectionHeader title="Danger Zone" />
        <Card>
          <div className="flex flex-col gap-3">
            <Button
              variant="destructive"
              fullWidth
              icon={<Trash2 size={16} />}
              onClick={() => setIsLocalWipeOpen(true)}
            >
              Delete All Local Data
            </Button>
            
            <Button
              variant="destructive"
              fullWidth
              icon={<AlertTriangle size={16} />}
              onClick={() => setIsCloudWipeOpen(true)}
            >
              Delete All Cloud Data
            </Button>
          </div>
          <p className="text-xs text-[var(--text-3)] text-center mt-3">Wiping settings clears IndexedDB stores permanently</p>
        </Card>
      </div>

      {/* Wipe Local Data Modal */}
      <Modal isOpen={isLocalWipeOpen} onClose={() => setIsLocalWipeOpen(false)} title="Wipe Local Database">
        <form onSubmit={handleLocalWipe} className="flex flex-col gap-4">
          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            This action will permanently delete every entry inside IndexedDB and clear your preferences, settings, and profile lists.
          </p>
          <p className="text-xs text-[var(--error)] font-bold">
            Type "DELETE" below to confirm this permanent local wipe:
          </p>
          <Input
            placeholder="Type DELETE here"
            value={confirmWipeInput}
            onChange={e => setConfirmWipeInput(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" type="button" onClick={() => setIsLocalWipeOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" type="submit">
              Yes, Wipe Local Disk
            </Button>
          </div>
        </form>
      </Modal>

      {/* Wipe Cloud Data Modal */}
      <Modal isOpen={isCloudWipeOpen} onClose={() => setIsCloudWipeOpen(false)} title="Wipe Cloud Backup">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-[var(--text-2)] leading-relaxed">
            This will connect to Supabase and delete all synced backup records. Your local IndexedDB storage data will remain untouched.
          </p>
          <p className="text-xs text-[var(--error)] font-bold">
            Are you sure you want to completely de-provision the cloud backup?
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsCloudWipeOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCloudWipe}>
              Yes, Wipe Cloud Storage
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}
