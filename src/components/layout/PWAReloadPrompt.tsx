import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw, X, Sparkles, Cloud, CheckCircle2 } from 'lucide-react'
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
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-[calc(1.5rem+env(safe-area-inset-right,0px))] z-[9999] pointer-events-none flex flex-col gap-3 max-w-sm w-[calc(100vw-3rem)]">
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
            {/* Actions */}
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNeedRefresh(false)}
                className="text-xs font-medium text-zinc-400 hover:text-white"
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateServiceWorker(true)}
                className="text-xs font-medium gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-none shadow-md shadow-violet-600/10"
              >
                <RefreshCw size={13} className="animate-spin-slow" />
                Reload Now
              </Button>
            </div>
          </motion.div>
        )}

        {/* Offline Ready Banner */}
        {offlineReady && !needRefresh && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto bg-[#0a0a0f]/80 border border-emerald-500/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ready for Offline Use</h4>
                <p className="text-xs text-zinc-400">
                  Study ERP is cached and ready to work fully offline.
                </p>
              </div>
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
