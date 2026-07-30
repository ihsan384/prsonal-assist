import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music, Play, Plus, Search, Star, Trash2, ExternalLink,
  Flame, BookOpen, Dumbbell, Radio, RefreshCw, Check, AlertCircle, Sparkles, Filter
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useToast } from '@/hooks/useToast'
import { useMusic, formatSpotifyEmbedUrl } from '@/contexts/MusicContext'
import { musicStorage, type CustomSong } from '@/services/storage/music.storage'
import { spotifyService } from '@/services/spotify/SpotifyService'

const CATEGORY_MAP = {
  all: 'All Songs',
  focus: 'Focus & Study',
  workout: 'Workout Hype',
  chill: 'Chill & Ambient',
  custom: 'Custom Links',
} as const

export default function MusicPage() {
  const toast = useToast()
  const { currentTrack, playTrack } = useMusic()

  // State collections
  const [songs, setSongs] = useState<CustomSong[]>(() => musicStorage.getAll())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Spotify integration state
  const [spotifyConnected, setSpotifyConnected] = useState(() => spotifyService.isConnected())
  const [userPlaylists, setUserPlaylists] = useState<any[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([])
  const [spotifySearchQuery, setSpotifySearchQuery] = useState('')
  const [spotifySearchResults, setSpotifySearchResults] = useState<any[]>([])
  const [isSearchingSpotify, setIsSearchingSpotify] = useState(false)
  const [isLoadingSpotifyData, setIsLoadingSpotifyData] = useState(false)

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newCategory, setNewCategory] = useState<'focus' | 'workout' | 'chill' | 'custom'>('focus')

  // Load Spotify user playlists & recently played if connected
  useEffect(() => {
    if (spotifyConnected) {
      setIsLoadingSpotifyData(true)
      Promise.all([
        spotifyService.getPlaylists(),
        spotifyService.getRecentlyPlayed(),
      ])
        .then(([playlists, recent]) => {
          setUserPlaylists(playlists || [])
          setRecentlyPlayed(recent || [])
        })
        .finally(() => setIsLoadingSpotifyData(false))
    }
  }, [spotifyConnected])

  // Handle Spotify live search
  const handleSpotifySearch = async () => {
    if (!spotifySearchQuery.trim()) return
    setIsSearchingSpotify(true)
    try {
      const results = await spotifyService.search(spotifySearchQuery, 'playlist')
      setSpotifySearchResults(results || [])
    } catch (err) {
      toast.error('Spotify Search Failed', 'Could not search Spotify API.')
    } finally {
      setIsSearchingSpotify(false)
    }
  }

  // Handle Add Custom Song
  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('Missing Info', 'Please provide a title and Spotify/Audio URL.')
      return
    }

    const { type } = formatSpotifyEmbedUrl(newUrl)
    const updated = musicStorage.add({
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Custom Artist',
      url: newUrl.trim(),
      type,
      category: newCategory,
      isFavorite: false,
    })

    setSongs(updated)
    toast.success('Song Added', `"${newTitle}" added to your custom music library.`)
    setIsAddModalOpen(false)
    setNewTitle('')
    setNewArtist('')
    setNewUrl('')
  }

  const handleDeleteSong = (id: string, title: string) => {
    const updated = musicStorage.remove(id)
    setSongs(updated)
    toast.info('Removed', `"${title}" removed from library.`)
  }

  const handleToggleFavorite = (id: string) => {
    const updated = musicStorage.toggleFavorite(id)
    setSongs(updated)
  }

  // Filtered custom songs
  const filteredSongs = songs.filter(song => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'favorites'
        ? song.isFavorite
        : song.category === selectedCategory
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Quick launch presets
  const presets = spotifyService.getStudyCategories()

  return (
    <PageWrapper>
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gradient-to-r from-emerald-950/40 via-[var(--bg-card)] to-blue-950/30 border border-[var(--border-strong)] rounded-3xl relative overflow-hidden">
          <div className="relative z-10 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="emerald" size="sm" dot>
                Spotify Music & Custom Audio
              </Badge>
              {spotifyConnected ? (
                <Badge variant="emerald" size="sm">Spotify Connected</Badge>
              ) : (
                <Badge variant="default" size="sm">Spotify Offline</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight">
              Spotify Music Section
            </h1>
            <p className="text-sm text-[var(--text-3)] max-w-xl mt-1">
              Play custom songs, Spotify playlists, lo-fi focus streams, or your personal music links directly inside Ihsan OS ERP.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus size={16} /> Add Custom Song
            </Button>
            {!spotifyConnected && (
              <Button
                variant="secondary"
                onClick={() => spotifyService.startLoginFlow()}
                className="gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <Radio size={16} /> Connect Spotify
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Featured / Active Embedded Player */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <Card className="p-4 sm:p-6 border-[var(--border-strong)] bg-[var(--bg-elevated)]">
          <SectionHeader
            title="Featured Spotify Player"
            subtitle={currentTrack ? `Now Playing: ${currentTrack.title}` : 'Select any song or playlist below to start embedded playback.'}
          />
          
          <div className="mt-4">
            {currentTrack ? (
              <div className="space-y-3">
                {currentTrack.type === 'spotify' ? (
                  <>
                    <iframe
                      src={currentTrack.embedUrl}
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-2xl border-0 shadow-lg"
                      title={currentTrack.title}
                    />

                    {/* Full Song Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 text-left">
                        <Sparkles size={16} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">Full Song Streaming</p>
                          <p className="text-[11px] text-[var(--text-3)]">
                            {spotifyConnected
                              ? 'Connected with Spotify. Launching full song remotely on your Spotify player.'
                              : 'Embed widget is in preview mode. Click to open full song in Spotify app.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => window.open(currentTrack.url, '_blank')}
                          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <ExternalLink size={14} /> Open Full Song in Spotify
                        </Button>

                        {!spotifyConnected && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => spotifyService.startLoginFlow()}
                            className="gap-1.5 text-xs"
                          >
                            <Radio size={14} /> Connect Full Streaming
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center mx-auto">
                      <Music size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text)]">{currentTrack.title}</h3>
                      <p className="text-xs text-[var(--text-3)]">{currentTrack.artist}</p>
                    </div>
                    <audio src={currentTrack.embedUrl} controls autoPlay className="w-full max-w-md mx-auto" />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 sm:p-8 border-2 border-dashed border-[var(--border)] rounded-2xl text-center bg-[var(--bg-subtle)]/50">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Play size={24} />
                </div>
                <h3 className="text-base font-bold text-[var(--text)]">No Active Song Loaded</h3>
                <p className="text-xs text-[var(--text-3)] max-w-md mx-auto mt-1 mb-4">
                  Click on any custom song, Spotify preset, or user playlist below to stream music directly inside ERP.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {presets.slice(0, 3).map(preset => (
                    <Button
                      key={preset.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => playTrack({ title: preset.name, artist: 'Spotify Focus', url: preset.url })}
                      className="gap-1.5 text-xs"
                    >
                      <Play size={12} /> {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Curated Study & Focus Presets */}
      <div className="mb-8">
        <SectionHeader title="Curated Study & Focus Presets" subtitle="Instant 1-click Spotify focus playlists for productivity." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
          {presets.map(preset => (
            <Card
              key={preset.id}
              hover
              onClick={() => playTrack({ title: preset.name, artist: 'Spotify Focus', url: preset.url })}
              className="p-3.5 cursor-pointer border-[var(--border)] hover:border-emerald-500/40 text-left transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
                <Music size={18} />
              </div>
              <p className="text-xs font-bold text-[var(--text)] truncate">{preset.name}</p>
              <p className="text-[10px] text-[var(--text-3)] mt-0.5 flex items-center gap-1">
                <Play size={10} className="fill-current text-emerald-400" /> Click to play
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Songs Library Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SectionHeader title="Your Custom Songs & Playlists" subtitle="Stored locally in your isolated ERP database." />
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search custom songs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-48 sm:w-64 h-9 text-xs"
            />
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1 text-xs shrink-0">
              <Plus size={14} /> Add Song
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(CATEGORY_MAP).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === key
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'favorites' ? 'all' : 'favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              selectedCategory === 'favorites'
                ? 'bg-amber-500 text-white'
                : 'bg-[var(--bg-subtle)] text-[var(--text-3)] hover:text-amber-400'
            }`}
          >
            <Star size={12} className={selectedCategory === 'favorites' ? 'fill-white' : ''} /> Favorites
          </button>
        </div>

        {/* Songs Grid */}
        {filteredSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSongs.map(song => (
              <Card key={song.id} className="p-3.5 flex items-center justify-between gap-3 text-left border-[var(--border)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => playTrack({ title: song.title, artist: song.artist, url: song.url, type: song.type })}
                    className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-all"
                  >
                    <Play size={16} className="fill-current ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text)] truncate">{song.title}</p>
                    <p className="text-[10px] text-[var(--text-3)] truncate">{song.artist || 'Custom Artist'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="default" size="sm" className="text-[9px] uppercase px-1.5 py-0">
                        {song.category}
                      </Badge>
                      <span className="text-[9px] text-[var(--text-4)] uppercase">{song.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleFavorite(song.id)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      song.isFavorite ? 'text-amber-400 hover:text-amber-300' : 'text-[var(--text-4)] hover:text-[var(--text-2)]'
                    }`}
                    title="Toggle Favorite"
                  >
                    <Star size={15} className={song.isFavorite ? 'fill-current' : ''} />
                  </button>
                  <a
                    href={song.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => handleDeleteSong(song.id, song.title)}
                    className="p-1.5 rounded-lg text-[var(--text-4)] hover:text-red-400 transition-colors"
                    title="Delete Song"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed">
            <Music size={32} className="mx-auto text-[var(--text-4)] mb-2" />
            <p className="text-sm font-semibold text-[var(--text-2)]">No custom songs found</p>
            <p className="text-xs text-[var(--text-3)] mt-1">Add your own Spotify track links or audio URLs.</p>
          </Card>
        )}
      </div>

      {/* Spotify Connected Account & Live Playlists */}
      {spotifyConnected && (
        <div className="mb-8">
          <SectionHeader
            title="Your Spotify Playlists & Recently Played"
            subtitle="Synced via official Spotify OAuth integration."
          />

          {isLoadingSpotifyData ? (
            <div className="p-6 text-center text-xs text-[var(--text-3)]">Loading your Spotify playlists...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {/* User Playlists */}
              <Card className="p-4 text-left">
                <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">Your Playlists ({userPlaylists.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {userPlaylists.slice(0, 10).map((pl: any) => (
                    <div
                      key={pl.id}
                      onClick={() => playTrack({ title: pl.name, artist: `By ${pl.owner?.display_name || 'Spotify'}`, url: pl.external_urls?.spotify || pl.uri })}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {pl.images?.[0]?.url ? (
                          <img src={pl.images[0].url} alt={pl.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <Music size={14} />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-semibold text-[var(--text)] truncate">{pl.name}</p>
                          <p className="text-[10px] text-[var(--text-3)]">{pl.tracks?.total || 0} tracks</p>
                        </div>
                      </div>
                      <Play size={14} className="text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recently Played */}
              <Card className="p-4 text-left">
                <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">Recently Played Tracks</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {recentlyPlayed.slice(0, 10).map((item: any, idx: number) => {
                    const track = item.track || item
                    return (
                      <div
                        key={idx}
                        onClick={() => playTrack({ title: track.name, artist: track.artists?.[0]?.name, url: track.external_urls?.spotify || track.uri })}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {track.album?.images?.[0]?.url ? (
                            <img src={track.album.images[0].url} alt={track.name} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                              <Music size={14} />
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-semibold text-[var(--text)] truncate">{track.name}</p>
                            <p className="text-[10px] text-[var(--text-3)] truncate">{track.artists?.[0]?.name}</p>
                          </div>
                        </div>
                        <Play size={14} className="text-blue-400 shrink-0" />
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Add Custom Song Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Custom Song or Spotify Link">
        <form onSubmit={handleAddSong} className="space-y-4 text-left">
          <Input
            label="Song or Playlist Title"
            placeholder="e.g. Coding Lofi Beats"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            required
          />

          <Input
            label="Artist / Creator Name (Optional)"
            placeholder="e.g. Lofi Girl"
            value={newArtist}
            onChange={e => setNewArtist(e.target.value)}
          />

          <Input
            label="Spotify URL / URI or Audio Link"
            placeholder="e.g. https://open.spotify.com/track/... or spotify:playlist:..."
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            required
          />
          <p className="text-[11px] text-[var(--text-3)] -mt-2">
            Paste any Spotify track, playlist, album URL, or direct MP3 audio stream link.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-2)] mb-1.5">Category</label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)]"
            >
              <option value="focus">Focus & Study</option>
              <option value="workout">Workout Hype</option>
              <option value="chill">Chill & Ambient</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Song
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
