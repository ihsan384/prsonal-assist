import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Radio, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { spotifyService } from '@/services/spotify/SpotifyService'
import { useToast } from '@/hooks/useToast'

export default function SpotifyCallbackPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'exchanging' | 'success' | 'failed'>('exchanging')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('[SpotifyCallback] OAuth Query Params:', { code: code ? 'Present' : 'Missing', state, error })

    if (error) {
      console.error('[SpotifyCallback] Spotify returned OAuth error:', error)
      setStatus('failed')
      setErrorMsg(`Authorization failed: ${error}`)
      toast.error(`Spotify Login Error: ${error}`)
      return
    }

    if (!code || !state) {
      console.error('[SpotifyCallback] Missing code or state parameters.')
      setStatus('failed')
      setErrorMsg('Invalid parameters received from Spotify.')
      return
    }

    // Exchange code for tokens
    spotifyService.handleCallback(code, state).then(success => {
      if (success) {
        setStatus('success')
        toast.success('Successfully connected to Spotify!')
        // Redirect back to integrations page after 1.5 seconds
        setTimeout(() => {
          navigate('/settings/integrations')
        }, 1500)
      } else {
        setStatus('failed')
        setErrorMsg('Security code verifier validation or token exchange failed.')
        toast.error('Failed to link Spotify account.')
      }
    })
  }, [searchParams, navigate, toast])

  return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[60vh] text-left">
        <Card className="max-w-md w-full p-6 text-center border-emerald-500/20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/15 via-[var(--bg-subtle)] to-[var(--bg-subtle)]">
          <AnimatePresence mode="wait">
            {status === 'exchanging' && (
              <motion.div
                key="exchanging"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />
                  <Radio className="text-emerald-500 animate-[spin_3s_linear_infinite] relative" size={48} />
                </div>
                <h2 className="text-base font-bold text-[var(--text)] mt-2">Linking Spotify Account</h2>
                <p className="text-xs text-[var(--text-3)] max-w-xs">
                  Exchanging secure PKCE authorization codes with Spotify OAuth servers...
                </p>
                <Loader2 className="animate-spin text-emerald-500/60 mt-4" size={20} />
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-base font-bold text-[var(--text)]">Connected Successfully</h2>
                <p className="text-xs text-[var(--text-3)] max-w-xs">
                  Your credentials have been securely stored. Redirecting back to settings...
                </p>
              </motion.div>
            )}

            {status === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                  <AlertTriangle size={40} />
                </div>
                <h2 className="text-base font-bold text-[var(--text)]">Connection Failed</h2>
                <p className="text-xs text-red-400 max-w-xs font-mono bg-red-500/5 p-2.5 rounded border border-red-500/10 mt-1">
                  {errorMsg}
                </p>
                <Button
                  variant="primary"
                  className="mt-4"
                  size="sm"
                  onClick={() => navigate('/settings/integrations')}
                >
                  Return to Settings
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </PageWrapper>
  )
}

// Minimal AnimatePresence mock wrapper if not imported
import { AnimatePresence } from 'framer-motion'
