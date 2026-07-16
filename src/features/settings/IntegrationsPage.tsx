import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Heart, Radio, Activity, RefreshCw, Trash2, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useToast } from '@/hooks/useToast'
import { spotifyService } from '@/services/spotify/SpotifyService'
import { healthConnectService, type HCStatusType } from '@/services/health/HealthConnectService'
import { notebookStorage } from '@/services/storage'

export default function IntegrationsPage() {
  const toast = useToast()
  
  // State for Spotify connection
  const [spotifyConnected, setSpotifyConnected] = useState(() => spotifyService.isConnected())
  const [spotifyLastSync, setSpotifyLastSync] = useState(() => spotifyService.getLastSync())
  
  // State for Health Connect
  const [hcSupported, setHcSupported] = useState(() => healthConnectService.isSupported())
  const [hcStatus, setHcStatus] = useState<HCStatusType>('denied')
  const [hcLastSync, setHcLastSync] = useState<string | null>(null)
  
  // State for NotebookLM
  const [notebookCount, setNotebookCount] = useState(0)

  // Loading indicator for actions
  const [syncingHC, setSyncingHC] = useState(false)
  const [syncingSpotify, setSyncingSpotify] = useState(false)

  useEffect(() => {
    // Check callback for Spotify OAuth authorization code
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    
    if (code && state) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname)
      
      toast.info('Completing Spotify connection...')
      spotifyService.handleCallback(code, state).then(success => {
        if (success) {
          toast.success('Connected to Spotify!')
          setSpotifyConnected(true)
          setSpotifyLastSync(spotifyService.getLastSync())
        } else {
          toast.error('Failed to connect to Spotify. Check state parameters.')
        }
      })
    }

    // Load Health Connect stats
    healthConnectService.getStatus().then(status => {
      setHcStatus(status)
      const setting = localStorage.getItem('health_connect_last_sync')
      setHcLastSync(setting)
    })

    // Load Notebook count
    setNotebookCount(notebookStorage.getAll().length)
  }, [toast])

  const handleConnectSpotify = async () => {
    try {
      await spotifyService.startLoginFlow()
    } catch (err) {
      toast.error('Could not start Spotify connection flow')
    }
  }

  const handleDisconnectSpotify = async () => {
    await spotifyService.disconnect()
    setSpotifyConnected(false)
    setSpotifyLastSync(null)
    toast.success('Disconnected Spotify account')
  }

  const handleConnectHC = async () => {
    const status = await healthConnectService.requestPermissions()
    setHcStatus(status)
    if (status === 'granted') {
      toast.success('Connected to Health Connect!')
    } else {
      toast.warning(`Permission status: ${status}`)
    }
  }

  const handleDisconnectHC = async () => {
    await healthConnectService.disconnect()
    setHcStatus('denied')
    toast.success('Disconnected Health Connect')
  }

  const handleSyncHC = async () => {
    setSyncingHC(true)
    const success = await healthConnectService.syncHealthConnect()
    setSyncingHC(false)
    if (success) {
      toast.success('Health Connect data synchronized!')
      healthConnectService.getStatus().then(status => setHcStatus(status))
      setHcLastSync(new Date().toLocaleString())
      localStorage.setItem('health_connect_last_sync', new Date().toLocaleString())
    } else {
      toast.error('Health Connect sync failed. Check device permissions.')
    }
  }

  const handleSyncSpotify = async () => {
    setSyncingSpotify(true)
    // Triggers playlist cache reload
    await spotifyService.getPlaylists(true)
    await spotifyService.getRecentlyPlayed(true)
    setSyncingSpotify(false)
    setSpotifyLastSync(spotifyService.getLastSync())
    toast.success('Spotify metadata cache refreshed!')
  }

  return (
    <PageWrapper>
      <SectionHeader title="Productivity & Health Integrations" />
      <div className="flex flex-col gap-5 text-left">
        
        {/* Spotify Card */}
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 shrink-0">
                <Radio size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Spotify</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  Authenticate using Spotify Authorization Code Flow with PKCE. Import favorite playlists, podcasts, recently played, and launch them during study sessions.
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  {spotifyConnected ? (
                    <>
                      <Badge variant="success" size="sm" className="flex items-center gap-1">
                        <CheckCircle size={10} /> Connected
                      </Badge>
                      <span className="text-[var(--text-4)]">
                        Last sync: {spotifyLastSync ? new Date(spotifyLastSync).toLocaleString() : 'Never'}
                      </span>
                    </>
                  ) : (
                    <Badge variant="default" size="sm">Disconnected</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex gap-2">
              {spotifyConnected ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleSyncSpotify} disabled={syncingSpotify}>
                    <RefreshCw size={12} className={syncingSpotify ? 'animate-spin' : ''} />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDisconnectSpotify}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button variant="primary" size="sm" onClick={handleConnectSpotify}>
                  Connect
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Health Connect Card */}
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 shrink-0">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Google Health Connect</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  Import Steps, Distance, Calories, Active Minutes, Heart Rate, Sleep, and Biometrics. Available natively on Android. Manual inputs serve as fallbacks on other systems.
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  {!hcSupported ? (
                    <Badge variant="default" size="sm" className="flex items-center gap-1">
                      <ShieldAlert size={10} /> Web/PWA Fallback Active (Manual Entry)
                    </Badge>
                  ) : hcStatus === 'granted' ? (
                    <>
                      <Badge variant="success" size="sm" className="flex items-center gap-1">
                        <CheckCircle size={10} /> Permission Granted
                      </Badge>
                      <span className="text-[var(--text-4)]">
                        Last sync: {hcLastSync || 'Never'}
                      </span>
                    </>
                  ) : (
                    <Badge variant="violet" size="sm">Disconnected / Not Linked</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex gap-2">
              {hcSupported ? (
                hcStatus === 'granted' ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleSyncHC} disabled={syncingHC}>
                      <RefreshCw size={12} className={syncingHC ? 'animate-spin' : ''} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDisconnectHC}>
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleConnectHC}>
                    Link App
                  </Button>
                )
              ) : (
                <Button variant="secondary" size="sm" onClick={() => toast.info('Health Connect is only available on Android native. Use the Fitness page to manually enter metrics.')} className="cursor-pointer">
                  Info
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* NotebookLM Card */}
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shrink-0">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">NotebookLM Manager</h3>
                <p className="text-xs text-[var(--text-3)] mt-1">
                  Notebook manager utility. Create study collections, tags, estimate reading times, and organize your files. Auto-synchronization is not available because NotebookLM does not provide a public API.
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <Badge variant="violet" size="sm">
                    {notebookCount} Stored Notebooks
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="shrink-0">
              <Button variant="secondary" size="sm" onClick={() => window.open('https://notebooklm.google.com', '_blank')}>
                Launch NotebookLM
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
