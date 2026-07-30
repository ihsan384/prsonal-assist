import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { spotifyService } from '@/services/spotify/SpotifyService'

export interface ActiveTrack {
  id?: string
  title: string
  artist?: string
  url: string
  embedUrl: string
  type: 'spotify' | 'audio' | 'youtube'
  category?: string
  spotifyEmbedUrl?: string
  youtubeEmbedUrl?: string
}

interface MusicContextType {
  currentTrack: ActiveTrack | null
  isPlaying: boolean
  isMinimized: boolean
  playTrack: (track: { title: string; artist?: string; url: string; category?: string; type?: 'spotify' | 'audio' | 'youtube' }) => void
  switchToFullSongMode: () => void
  switchToSpotifyMode: () => void
  closePlayer: () => void
  toggleMinimize: () => void
  formatSpotifyEmbedUrl: (urlOrUri: string, title?: string, artist?: string) => { embedUrl: string; type: 'spotify' | 'audio' | 'youtube'; spotifyEmbedUrl?: string; youtubeEmbedUrl?: string }
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function formatSpotifyEmbedUrl(
  urlOrUri: string,
  title?: string,
  artist?: string
): {
  embedUrl: string
  type: 'spotify' | 'audio' | 'youtube'
  spotifyEmbedUrl?: string
  youtubeEmbedUrl?: string
} {
  if (!urlOrUri) return { embedUrl: '', type: 'spotify' }

  const trimmed = urlOrUri.trim()

  // 1. YouTube URL format
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (ytMatch && ytMatch[1]) {
    const ytUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1`
    return {
      embedUrl: ytUrl,
      type: 'youtube',
      youtubeEmbedUrl: ytUrl,
    }
  }

  // 2. Spotify URL or URI
  if (trimmed.includes('open.spotify.com') || trimmed.startsWith('spotify:')) {
    let spotEmbed = ''
    let isSingleTrack = false

    if (trimmed.startsWith('spotify:')) {
      const parts = trimmed.split(':')
      if (parts.length >= 3) {
        spotEmbed = `https://open.spotify.com/embed/${parts[1]}/${parts[2]}?utm_source=generator`
        isSingleTrack = parts[1] === 'track'
      }
    } else {
      try {
        const urlObj = new URL(trimmed)
        const pathname = urlObj.pathname
        if (pathname.includes('/embed/')) {
          spotEmbed = trimmed
          isSingleTrack = pathname.includes('/track/')
        } else {
          const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname
          spotEmbed = `https://open.spotify.com/embed/${cleanPath}?utm_source=generator`
          isSingleTrack = pathname.includes('/track/')
        }
      } catch {
        const match = trimmed.match(/open\.spotify\.com\/(track|playlist|album|artist|episode|show)\/([a-zA-Z0-9]+)/)
        if (match) {
          spotEmbed = `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`
          isSingleTrack = match[1] === 'track'
        }
      }
    }

    const searchQuery = [title, artist].filter(Boolean).join(' ')
    const ytEmbed = searchQuery
      ? `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}&autoplay=1`
      : ''

    // If it's a single Spotify track, standard embeds are limited to 30s previews by Spotify.
    // Default to YouTube Full Song embed so the user gets 100% full song playback directly inside ERP!
    if (isSingleTrack && ytEmbed) {
      return {
        embedUrl: ytEmbed,
        type: 'youtube',
        spotifyEmbedUrl: spotEmbed,
        youtubeEmbedUrl: ytEmbed,
      }
    }

    return {
      embedUrl: spotEmbed || trimmed,
      type: 'spotify',
      spotifyEmbedUrl: spotEmbed,
      youtubeEmbedUrl: ytEmbed,
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

  const playTrack = (track: { title: string; artist?: string; url: string; category?: string; type?: 'spotify' | 'audio' | 'youtube' }) => {
    const { embedUrl, type, spotifyEmbedUrl, youtubeEmbedUrl } = formatSpotifyEmbedUrl(track.url, track.title, track.artist)
    const activeTrack: ActiveTrack = {
      title: track.title,
      artist: track.artist || 'Unknown Artist',
      url: track.url,
      embedUrl: track.type === 'spotify' && spotifyEmbedUrl ? spotifyEmbedUrl : embedUrl,
      type: track.type || type,
      category: track.category || 'focus',
      spotifyEmbedUrl,
      youtubeEmbedUrl,
    }
    setCurrentTrack(activeTrack)
    setIsPlaying(true)
    setIsMinimized(false)

    // Attempt remote full playback if connected
    if (activeTrack.type === 'spotify' && spotifyService.isConnected()) {
      spotifyService.playUriRemote(track.url).catch(err => console.warn(err))
    }
  }

  const switchToFullSongMode = () => {
    if (!currentTrack) return
    const searchQuery = [currentTrack.title, currentTrack.artist].filter(Boolean).join(' ')
    const ytEmbed = currentTrack.youtubeEmbedUrl || (searchQuery ? `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}&autoplay=1` : '')
    if (ytEmbed) {
      setCurrentTrack({
        ...currentTrack,
        embedUrl: ytEmbed,
        type: 'youtube',
      })
    }
  }

  const switchToSpotifyMode = () => {
    if (!currentTrack) return
    const spotEmbed = currentTrack.spotifyEmbedUrl || formatSpotifyEmbedUrl(currentTrack.url, currentTrack.title, currentTrack.artist).spotifyEmbedUrl || currentTrack.url
    if (spotEmbed) {
      setCurrentTrack({
        ...currentTrack,
        embedUrl: spotEmbed,
        type: 'spotify',
      })
    }
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
        switchToFullSongMode,
        switchToSpotifyMode,
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
