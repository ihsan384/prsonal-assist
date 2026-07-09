import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw, X, Sparkles, Cloud } from 'lucide-react'
import { Button } from '../ui/Button'

export function PWAReloadPrompt() {
  const [showOfflineToast, setShowOfflineToast] = useState(false)

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  useEffect(() => {
    if (offlineReady) {
      setShowOfflineToast(true)
      // Auto-dismiss the offline-ready toast after 4 seconds
      const timer = setTimeout(() => {
        setShowOfflineToast(false)
        setOfflineReady(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [offlineReady, setOfflineReady])

  const closePrompt = () => {
    setNeedRefresh(false)
    setOfflineReady(false)
    setShowOfflineToast(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none flex flex-col gap-3 max-w-sm w-[calc(100vw-3rem)]">
      <AnimatePresence>
        {/* Update Prompt */}
        {needRefresh && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto flex flex-col gap-4 p-5 rounded-2xl border border-violet-500/20 bg-[#0a0a0f]/80 backdrop-blur-xl shadow-2xl shadow-violet-500/5 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white tracking-tight">New Version Available</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  A fresh update for Ihsan OS is ready with new optimizations and improvements.
                </p>
              </div>
              <button
                onClick={closePrompt}
                className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800/40"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={closePrompt}
                className="text-xs font-medium text-zinc-400 hover:text-white"
              >
                Later
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateServiceWorker(true)}
                className="text-xs font-medium gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-none shadow-md shadow-violet-600/10"
              >
                <RefreshCw size={13} className="animate-spin-slow" />
                Update Now
              </Button>
            </div>
          </motion.div>
        )}

        {/* Offline Ready Toast */}
        {showOfflineToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto flex items-start gap-4 p-4 rounded-xl border border-emerald-500/20 bg-[#0a0a0f]/80 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Cloud size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white tracking-tight">Offline Enabled</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ihsan OS is cached and ready to work fully offline.
              </p>
            </div>
            <button
              onClick={() => setShowOfflineToast(false)}
              className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
