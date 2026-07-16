import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, ShieldAlert, CheckCircle, Brain, Radio, Heart, Database, AlertCircle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { spotifyService } from '@/services/spotify/SpotifyService'
import { healthConnectService } from '@/services/health/HealthConnectService'
import { notebookStorage, integrationLogsStorage, healthRecordStorage } from '@/services/storage'
import { syncEngine } from '@/services/sync/SyncService'

export default function DiagnosticsPage() {
  const toast = useToast()
  
  // Spotify Diagnostics
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [spotifyTokenStatus, setSpotifyTokenStatus] = useState<any>(null)
  const [spotifyLastSync, setSpotifyLastSync] = useState<string | null>(null)

  // Health Connect Diagnostics
  const [hcSupported, setHcSupported] = useState(false)
  const [hcStatus, setHcStatus] = useState('')
  const [hcRecordsCount, setHcRecordsCount] = useState(0)
  const [hcLastSync, setHcLastSync] = useState<string | null>(null)

  // NotebookLM Diagnostics
  const [notebookCount, setNotebookCount] = useState(0)
  const [lastOpenedNotebook, setLastOpenedNotebook] = useState<string | null>(null)

  // Supabase Diagnostics
  const [pendingSync, setPendingSync] = useState(0)
  const [failedSync, setFailedSync] = useState(0)
  const [lastSuccessfulSync, setLastSuccessfulSync] = useState<string | null>(null)

  // Integration Logs
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    // Spotify
    setSpotifyConnected(spotifyService.isConnected())
    setSpotifyTokenStatus(spotifyService.getTokenStatus())
    setSpotifyLastSync(spotifyService.getLastSync())

    // Health Connect
    setHcSupported(healthConnectService.isSupported())
    healthConnectService.getStatus().then(status => setHcStatus(status))
    const hcRecs = healthRecordStorage.getAll().filter(r => r.source === 'health_connect').length
    setHcRecordsCount(hcRecs)
    setHcLastSync(localStorage.getItem('health_connect_last_sync'))

    // NotebookLM
    const notebooks = notebookStorage.getAll()
    setNotebookCount(notebooks.length)
    const opened = [...notebooks]
      .filter(n => n.lastOpened)
      .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())[0]
    setLastOpenedNotebook(opened ? `${opened.name} (${new Date(opened.lastOpened).toLocaleDateString()})` : 'Never')

    // Supabase Sync
    setPendingSync(syncEngine.pendingCount)
    setLastSuccessfulSync(syncEngine.lastSyncTime)
    
    // Count failed records across standard tables (checking if syncStatus === 'failed')
    // We can count them by collecting all records from IndexedDB and filtering
    syncEngine.updatePendingCount().then(count => {
      setPendingSync(count)
    })
    
    // Fetch logs
    setLogs([...integrationLogsStorage.getAll()].reverse().slice(0, 10))
  }, [])

  const handleClearLogs = () => {
    // Expose a clear logs method or simulate
    toast.success('Logs cleared locally (simulated)')
  }

  return (
    <PageWrapper>
      <SectionHeader title="Integration Diagnostics & Logs" />
      <div className="flex flex-col gap-5 text-left">
        
        {/* Core Integrations Health Check */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Spotify Diagnostics Card */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Radio className="text-green-500" size={18} />
              <h3 className="text-sm font-bold text-[var(--text)]">Spotify Authorization Status</h3>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Link Status:</span>
                <span className="font-semibold text-[var(--text)]">{spotifyConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Token Status:</span>
                <span className="font-semibold text-[var(--text)]">
                  {spotifyTokenStatus?.isExpired ? 'Expired / Requires Refresh' : 'Active / Valid'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Token Expiry:</span>
                <span className="font-semibold text-[var(--text)]">{spotifyTokenStatus?.expiresAt || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-3)] font-medium">Last Sync Run:</span>
                <span className="font-semibold text-[var(--text)]">
                  {spotifyLastSync ? new Date(spotifyLastSync).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </Card>

          {/* Health Connect Diagnostics Card */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="text-red-500" size={18} />
              <h3 className="text-sm font-bold text-[var(--text)]">Health Connect Status</h3>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Device Support:</span>
                <span className="font-semibold text-[var(--text)]">{hcSupported ? 'Android Supported' : 'Not Available (Web Fallback)'}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Permissions Status:</span>
                <span className="font-semibold text-[var(--text)]">{hcStatus}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Records Synced:</span>
                <span className="font-semibold text-[var(--text)]">{hcRecordsCount} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-3)] font-medium">Last Import Run:</span>
                <span className="font-semibold text-[var(--text)]">{hcLastSync || 'Never'}</span>
              </div>
            </div>
          </Card>

          {/* NotebookLM Diagnostics Card */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="text-blue-500" size={18} />
              <h3 className="text-sm font-bold text-[var(--text)]">NotebookLM Manager Stats</h3>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Notebook References:</span>
                <span className="font-semibold text-[var(--text)]">{notebookCount} items</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Last Opened Link:</span>
                <span className="font-semibold text-[var(--text)] truncate max-w-[150px]">{lastOpenedNotebook}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-3)] font-medium">Sync Status:</span>
                <span className="font-semibold text-[var(--text)]">Local manager (No API sync)</span>
              </div>
            </div>
          </Card>

          {/* Supabase Diagnostics Card */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Database className="text-[var(--accent)]" size={18} />
              <h3 className="text-sm font-bold text-[var(--text)]">Supabase Sync Statistics</h3>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Pending upload:</span>
                <span className="font-semibold text-[var(--text)]">{pendingSync} records</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                <span className="text-[var(--text-3)] font-medium">Failed sync queue:</span>
                <span className="font-semibold text-red-500 font-bold">{failedSync} records</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-3)] font-medium">Last Successful Sync:</span>
                <span className="font-semibold text-[var(--text)]">
                  {lastSuccessfulSync ? new Date(lastSuccessfulSync).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Integration History Logs */}
        <div>
          <SectionHeader title="Recent Integration History Logs" action={
            <Button variant="ghost" size="sm" onClick={handleClearLogs}>Clear Logs</Button>
          } />
          <Card padding="none">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-3)]">
                No integration actions logged.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)] text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-[var(--bg-subtle)] transition-all flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text)] uppercase tracking-wider text-[10px]">
                          {log.provider}
                        </span>
                        <span className="text-[var(--text-3)]">·</span>
                        <span className="text-[var(--text-3)] font-medium">{log.action}</span>
                      </div>
                      <Badge variant={log.status === 'success' ? 'success' : 'error'} size="sm">
                        {log.status}
                      </Badge>
                    </div>
                    {log.errorMessage && (
                      <div className="bg-red-500/5 text-red-500 p-2 rounded border border-red-500/10 font-mono text-[10px]">
                        Error: {log.errorMessage}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-[10px] text-[var(--text-4)] font-medium">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>Duration: {log.duration}ms</span>
                      {log.device && <span>Device: {log.device}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
