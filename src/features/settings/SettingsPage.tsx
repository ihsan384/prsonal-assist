import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, Volume2, Vibrate, Clock, Calendar,
  Palette, Trash2, BookOpen, Droplet, Moon, Flame, RefreshCw, Upload, Download, AlertTriangle,
  RotateCcw, Database, Archive, Activity, ChevronRight, User, LogOut, Shield, Sparkles, CheckCircle2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { settingsStorage } from '@/services/storage'
import { syncEngine } from '@/services/sync/SyncService'
import type { SyncStatusType } from '@/services/sync/SyncService'
import { backupService } from '@/services/storage/BackupService'
import { idb } from '@/services/storage/IndexedDB'
import { isSupabaseConfigured } from '@/services/supabase/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ToggleProps {
  enabled: boolean
  onToggle: () => void
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-primary-600' : 'bg-[var(--border-strong)]'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${enabled ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, profile, logout } = useAuth()
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

  // Android features toggles
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('settings_notifications_enabled') !== 'false')
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(() => localStorage.getItem('settings_quiet_hours_enabled') !== 'false')
  const [widgetsEnabled, setWidgetsEnabled] = useState(() => localStorage.getItem('settings_android_widgets_enabled') !== 'false')
  const [shortcutsEnabled, setShortcutsEnabled] = useState(() => localStorage.getItem('settings_quick_actions_enabled') !== 'false')

  useEffect(() => {
    localStorage.setItem('settings_notifications_enabled', String(notifEnabled))
  }, [notifEnabled])

  useEffect(() => {
    localStorage.setItem('settings_quiet_hours_enabled', String(quietHoursEnabled))
  }, [quietHoursEnabled])

  useEffect(() => {
    localStorage.setItem('settings_android_widgets_enabled', String(widgetsEnabled))
    if (widgetsEnabled) {
      import('@/services/native/WidgetRepository').then(({ widgetRepository }) => {
        widgetRepository.updateWidgetPayload().catch(e => console.error(e))
      })
    }
  }, [widgetsEnabled])

  useEffect(() => {
    localStorage.setItem('settings_quick_actions_enabled', String(shortcutsEnabled))
  }, [shortcutsEnabled])

  // Modals
  const [isLocalWipeOpen, setIsLocalWipeOpen] = useState(false)
  const [confirmWipeInput, setConfirmWipeInput] = useState('')
  const [isCloudWipeOpen, setIsCloudWipeOpen] = useState(false)
  const [isFactoryResetOpen, setIsFactoryResetOpen] = useState(false)
  const [confirmResetInput, setConfirmResetInput] = useState('')

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
      toast.error('Sync failed. Check your network connection.')
    } else {
      toast.success('Sync complete!')
    }
  }

  const handleExportBackup = async () => {
    try {
      const backupJSON = await backupService.exportBackup()
      await backupService.downloadFile(
        backupJSON,
        `studyerp_backup_${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      )
      toast.success('Backup file generated and downloaded successfully.')
    } catch (err: any) {
      toast.error('Failed to generate backup file.', err?.message || String(err))
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
      } catch (err: any) {
        toast.error('Import Failed', err?.message || 'Please verify the JSON file is correct.')
        console.error(err)
      }
    }
    reader.onerror = () => {
      toast.error('File Read Error', 'Unable to read selected backup file.')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleLocalWipe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmWipeInput !== 'DELETE') {
      toast.error('Please type "DELETE" exactly to confirm.')
      return
    }

    try {
      await idb.clearAll()
      localStorage.clear()
      sessionStorage.clear()
      toast.success('All local data wiped. Resetting application...')
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (err) {
      toast.error('Failed to wipe local database.')
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

  const handleFactoryReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmResetInput !== 'DELETE EVERYTHING') {
      toast.error('Please type "DELETE EVERYTHING" exactly to confirm.')
      return
    }
    try {
      await syncEngine.factoryReset()
      toast.success('Factory reset complete. Reloading...')
      setTimeout(() => { window.location.href = '/' }, 1500)
    } catch (err) {
      toast.error('Factory reset failed.', String(err))
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

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const userEmail = user?.email || 'student@studyerp.app'

  return (
    <PageWrapper>
      {/* App Info Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/25">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-[var(--text)] tracking-tight">Study ERP</h1>
                <p className="text-xs text-[var(--text-3)] font-medium mt-0.5">Study Management Platform · Version 13.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 size={12} /> Offline Ready
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <CloudSyncIcon /> Cloud Sync
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ACCOUNT SECTION */}
      <div className="mb-6">
        <SectionHeader title="Account" />
        <Card padding="none">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="User Avatar" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-[var(--text)]">{displayName}</p>
                <p className="text-xs text-[var(--text-3)]">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')} icon={<User size={14} />}>
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={logout} icon={<LogOut size={14} className="text-red-500" />}>
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* DATA & CLOUD SYNC SECTION */}
      <div className="mb-6">
        <SectionHeader title="Data & Cloud Sync" />
        {/* Realtime Cross-Device Synchronization */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                Realtime Cross-Device Sync
                <Badge variant="success" size="sm">● Live</Badge>
              </h3>
              <p className="text-xs text-[var(--text-3)] mt-0.5">
                Automated WebSocket synchronization. Your edits sync instantly across all devices logged into this account.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-[var(--text)] block">Automatic Realtime Engine Active</span>
              <span className="text-[var(--text-3)] block mt-0.5">
                Manual sync options are disabled. Any change on mobile, tablet, or desktop instantly broadcasts to all your active devices.
              </span>
            </div>
          </div>
        </Card>

        {/* Local Backup & Restore */}
        <Card className="mt-4">
          <h3 className="text-sm font-bold text-[var(--text)] mb-1">Backup & Restore</h3>
          <p className="text-xs text-[var(--text-3)] mb-4">
            Export a local JSON copy of your study data or restore from a backup file.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" fullWidth icon={<Download size={14} />} onClick={handleExportBackup}>
              Export Backup
            </Button>
            <Button variant="secondary" fullWidth icon={<Upload size={14} />} onClick={handleImportBackupClick}>
              Import Backup
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

      {/* PREFERENCES SECTION */}
      <div className="mb-6">
        <SectionHeader title="Preferences" />
        <Card padding="none">
          <div className="divide-y divide-[var(--border)]">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                <Palette size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Compact Mode</p>
                <p className="text-xs text-[var(--text-3)]">Reduce padding in layout views</p>
              </div>
              <Toggle enabled={appSettings.compactMode} onToggle={() => updateSetting('compactMode', !appSettings.compactMode)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Notifications</p>
                <p className="text-xs text-[var(--text-3)]">Task and study reminders</p>
              </div>
              <Toggle enabled={appSettings.notifications} onToggle={() => updateSetting('notifications', !appSettings.notifications)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                <Volume2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Sound FX</p>
                <p className="text-xs text-[var(--text-3)]">Sound effects on task completion</p>
              </div>
              <Toggle enabled={appSettings.soundEnabled} onToggle={() => updateSetting('soundEnabled', !appSettings.soundEnabled)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                <Vibrate size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Haptic Vibration</p>
                <p className="text-xs text-[var(--text-3)]">Tactile feedback on completion</p>
              </div>
              <Toggle enabled={appSettings.hapticEnabled} onToggle={() => updateSetting('hapticEnabled', !appSettings.hapticEnabled)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">Week Starts Monday</p>
                <p className="text-xs text-[var(--text-3)]">Start calendar view on Monday</p>
              </div>
              <Toggle enabled={appSettings.weekStartsOn === 1} onToggle={() => updateSetting('weekStartsOn', appSettings.weekStartsOn === 1 ? 0 : 1)} />
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                <Clock size={16} />
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

      {/* INTEGRATIONS SECTION */}
      <div className="mb-6">
        <SectionHeader title="Integrations" />
        <Card padding="none">
          <div className="divide-y divide-[var(--border)]">
            <button
              onClick={() => navigate('/settings/integrations')}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Activity size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">External Services</p>
                  <p className="text-xs text-[var(--text-3)]">Spotify Music, Health Connect, and NotebookLM</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--text-4)]" />
            </button>
          </div>
        </Card>
      </div>

      {/* ADVANCED DIAGNOSTICS SECTION */}
      <div className="mb-6">
        <SectionHeader title="Advanced" />
        <p className="text-xs text-[var(--text-3)] mb-3 -mt-2">
          Diagnostic tools and database health utilities for troubleshooting.
        </p>
        <Card padding="none">
          <div className="divide-y divide-[var(--border)]">
            {[
              { label: 'Database Health', description: 'Record counts, storage & engine metrics', icon: Database, path: '/settings/db-health', color: 'text-primary-500', bg: 'bg-primary-500/10' },
              { label: 'Sync Transaction Center', description: 'Inspect queues and resolve sync conflicts', icon: RefreshCw, path: '/settings/sync-queue', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Sync History', description: 'Log of upload/download operations', icon: Activity, path: '/settings/sync-log', color: 'text-violet-500', bg: 'bg-violet-500/10' },
              { label: 'Connection Diagnostics', description: 'Sync stats and token lifecycle log history', icon: Database, path: '/settings/diagnostics', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            ].map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-3)]">{item.description}</p>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-4)] flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      {/* DANGER ZONE */}
      <div className="mb-6">
        <SectionHeader title="Danger Zone" />
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5 mb-1">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-500 font-medium leading-relaxed">
              These actions are permanent and cannot be undone. Create a local backup before proceeding.
            </p>
          </div>
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
          <Button
            variant="destructive"
            fullWidth
            icon={<RotateCcw size={16} />}
            onClick={() => setIsFactoryResetOpen(true)}
          >
            Factory Reset
          </Button>
        </div>
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

      {/* Factory Reset Modal */}
      <Modal isOpen={isFactoryResetOpen} onClose={() => setIsFactoryResetOpen(false)} title="Factory Reset">
        <form onSubmit={handleFactoryReset} className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--error-bg)] border border-[var(--error-border)]">
            <AlertTriangle size={16} className="text-[var(--error)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error)] leading-relaxed">
              <strong>This will delete everything:</strong> IndexedDB, localStorage, sessionStorage, and all service worker caches.
              The app will restart in first-launch state.
            </p>
          </div>
          <p className="text-xs text-[var(--error)] font-bold">
            Type <span className="font-mono">"DELETE EVERYTHING"</span> below to confirm:
          </p>
          <Input
            placeholder="Type DELETE EVERYTHING here"
            value={confirmResetInput}
            onChange={e => setConfirmResetInput(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" type="button" onClick={() => { setIsFactoryResetOpen(false); setConfirmResetInput('') }}>
              Cancel
            </Button>
            <Button variant="destructive" type="submit" icon={<RotateCcw size={14} />}>
              Yes, Factory Reset
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

function CloudSyncIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 00-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  )
}
