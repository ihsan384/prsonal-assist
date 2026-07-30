import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface ActiveTrack {
  id?: string
  title: string
  artist?: string
  url: string
  embedUrl: string
  type: 'spotify' | 'audio'
  category?: string
}

interface MusicContextType {
  currentTrack: ActiveTrack | null
  isPlaying: boolean
  isMinimized: boolean
  playTrack: (track: { title: string; artist?: string; url: string; category?: string; type?: 'spotify' | 'audio' }) => void
  closePlayer: () => void
  toggleMinimize: () => void
  formatSpotifyEmbedUrl: (urlOrUri: string) => { embedUrl: string; type: 'spotify' | 'audio' }
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function formatSpotifyEmbedUrl(urlOrUri: string): { embedUrl: string; type: 'spotify' | 'audio' } {
  if (!urlOrUri) return { embedUrl: '', type: 'spotify' }

  const trimmed = urlOrUri.trim()

  // Spotify URI format: spotify:track:id or spotify:playlist:id
  if (trimmed.startsWith('spotify:')) {
    const parts = trimmed.split(':')
    if (parts.length >= 3) {
      const mediaType = parts[1] // track, playlist, album, episode, show
      const mediaId = parts[2]
      return {
        embedUrl: `https://open.spotify.com/embed/${mediaType}/${mediaId}?utm_source=generator`,
        type: 'spotify',
      }
    }
  }

  // Spotify Web URL format: https://open.spotify.com/track/id...
  if (trimmed.includes('open.spotify.com')) {
    try {
      const urlObj = new URL(trimmed)
      const pathname = urlObj.pathname // e.g. /track/4cOdK... or /embed/track/4cOdK...
      if (pathname.includes('/embed/')) {
        return { embedUrl: trimmed, type: 'spotify' }
      }
      const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname
      return {
        embedUrl: `https://open.spotify.com/embed/${cleanPath}?utm_source=generator`,
        type: 'spotify',
      }
    } catch {
      // Fallback regex if URL parsing fails
      const match = trimmed.match(/open\.spotify\.com\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/)
      if (match) {
        return {
          embedUrl: `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`,
          type: 'spotify',
        }
      }
    }
  }

  // Generic direct MP3/Audio stream link
  return {
    embedUrl: trimmed,
    type: 'audio',
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<ActiveTrack | null>(() => {
    try {
      const saved = localStorage.getItem('active_music_track')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isPlaying, setIsPlaying] = useState<boolean>(!!currentTrack)
  const [isMinimized, setIsMinimized] = useState<boolean>(false)

  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('active_music_track', JSON.stringify(currentTrack))
    } else {
      localStorage.removeItem('active_music_track')
    }
  }, [currentTrack])

  const playTrack = (track: { title: string; artist?: string; url: string; category?: string; type?: 'spotify' | 'audio' }) => {
    const { embedUrl, type } = formatSpotifyEmbedUrl(track.url)
    const activeTrack: ActiveTrack = {
      title: track.title,
      artist: track.artist || 'Unknown Artist',
      url: track.url,
      embedUrl,
      type: track.type || type,
      category: track.category || 'focus',
    }
    setCurrentTrack(activeTrack)
    setIsPlaying(true)
    setIsMinimized(false)
  }

  const closePlayer = () => {
    setCurrentTrack(null)
    setIsPlaying(false)
  }

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev)
  }

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isMinimized,
        playTrack,
        closePlayer,
        toggleMinimize,
        formatSpotifyEmbedUrl,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider')
  }
  return context
}
