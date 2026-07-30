import { motion, AnimatePresence } from 'framer-motion'
import { Music, X, Minimize2, Maximize2, ExternalLink, Play, Sparkles } from 'lucide-react'
import { useMusic } from '@/contexts/MusicContext'

export function FloatingMusicPlayer() {
  const { currentTrack, isMinimized, toggleMinimize, closePlayer, switchToFullSongMode, switchToSpotifyMode } = useMusic()

  if (!currentTrack) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm w-full sm:w-96 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-subtle)] border-b border-[var(--border)]">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className={`w-6 h-6 rounded-md ${currentTrack.type === 'youtube' ? 'bg-red-500/15 text-red-400' : 'bg-[#1DB954]/15 text-[#1DB954]'} flex items-center justify-center shrink-0`}>
              <Music size={13} className="animate-pulse" />
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-[var(--text)] truncate leading-tight">
                {currentTrack.title}
              </p>
              <p className="text-[10px] text-[var(--text-3)] truncate">
                {currentTrack.artist || 'Music Stream'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <a
              href={currentTrack.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Open Original Link"
            >
              <ExternalLink size={13} />
            </a>
            <button
              onClick={toggleMinimize}
              className="p-1 rounded-md text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors"
              title={isMinimized ? 'Expand Player' : 'Minimize Player'}
            >
              {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
            <button
              onClick={closePlayer}
              className="p-1 rounded-md text-[var(--text-4)] hover:text-red-400 hover:bg-[var(--bg-hover)] transition-colors"
              title="Close Player"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Player Content Body */}
        {!isMinimized && (
          <div className="p-2 bg-black/40">
            {currentTrack.type === 'youtube' ? (
              <iframe
                src={currentTrack.embedUrl}
                width="100%"
                height="180"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl border-0 shadow-xs"
                title={currentTrack.title}
              />
            ) : currentTrack.type === 'spotify' ? (
              <iframe
                src={currentTrack.embedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl border-0 shadow-xs"
                title={currentTrack.title}
              />
            ) : (
              <div className="p-3 text-center space-y-2">
                <p className="text-xs text-[var(--text-2)] font-medium truncate">{currentTrack.title}</p>
                <audio
                  src={currentTrack.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-9 rounded-lg"
                />
              </div>
            )}

            {/* Mode Switcher Bar */}
            <div className="flex items-center justify-between gap-1 px-1 mt-2 text-[10px]">
              <span className="text-[var(--text-3)] flex items-center gap-1">
                <Sparkles size={11} className={currentTrack.type === 'youtube' ? 'text-red-400' : 'text-emerald-400'} />
                {currentTrack.type === 'youtube' ? 'Full Song Stream' : 'Spotify Widget'}
              </span>
              <div className="flex items-center gap-1">
                {currentTrack.type !== 'youtube' && (
                  <button
                    onClick={switchToFullSongMode}
                    className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors font-medium"
                  >
                    Switch to Full Song
                  </button>
                )}
                {currentTrack.type !== 'spotify' && (
                  <button
                    onClick={switchToSpotifyMode}
                    className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-medium"
                  >
                    Spotify Widget
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
