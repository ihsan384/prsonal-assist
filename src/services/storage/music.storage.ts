import { generateId } from '@/utils/format'
import { storage } from './storageService'

export interface CustomSong {
  id: string
  title: string
  artist?: string
  url: string // Spotify link, URI or direct MP3 audio URL
  type: 'spotify' | 'audio'
  category: 'focus' | 'workout' | 'chill' | 'custom'
  isFavorite?: boolean
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'custom_music_library'

const DEFAULT_PRESETS: Omit<CustomSong, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Lofi Focus Beats',
    artist: 'Spotify Chill',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    type: 'spotify',
    category: 'focus',
    isFavorite: true,
  },
  {
    title: 'Deep Focus Ambient',
    artist: 'Spotify Ambient',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DW1s9vYBE5fQE',
    type: 'spotify',
    category: 'focus',
    isFavorite: true,
  },
  {
    title: 'Peaceful Piano Study',
    artist: 'Spotify Classical',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSp46JctO',
    type: 'spotify',
    category: 'focus',
    isFavorite: false,
  },
  {
    title: 'Workout Beast Mode',
    artist: 'Spotify Hype',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX32v12f8pq0M',
    type: 'spotify',
    category: 'workout',
    isFavorite: false,
  },
]

export const musicStorage = {
  getAll(): CustomSong[] {
    const items = storage.get<CustomSong[]>(STORAGE_KEY)
    if (!items || items.length === 0) {
      // Seed default preset tracks if library is empty
      const now = new Date().toISOString()
      const seeded: CustomSong[] = DEFAULT_PRESETS.map(preset => ({
        ...preset,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }))
      storage.set(STORAGE_KEY, seeded)
      return seeded
    }
    return items
  },

  getById(id: string): CustomSong | undefined {
    return this.getAll().find(song => song.id === id)
  },

  add(song: Omit<CustomSong, 'id' | 'createdAt' | 'updatedAt'>): CustomSong[] {
    const id = generateId()
    const now = new Date().toISOString()
    const record: CustomSong = {
      ...song,
      id,
      createdAt: now,
      updatedAt: now,
    }
    const current = this.getAll()
    const updated = [record, ...current]
    storage.set(STORAGE_KEY, updated)
    return updated
  },

  update(id: string, partial: Partial<CustomSong>): CustomSong[] {
    const current = this.getAll()
    const updated = current.map(song =>
      song.id === id ? { ...song, ...partial, updatedAt: new Date().toISOString() } : song
    )
    storage.set(STORAGE_KEY, updated)
    return updated
  },

  remove(id: string): CustomSong[] {
    const current = this.getAll()
    const updated = current.filter(song => song.id !== id)
    storage.set(STORAGE_KEY, updated)
    return updated
  },

  toggleFavorite(id: string): CustomSong[] {
    const current = this.getAll()
    const updated = current.map(song =>
      song.id === id ? { ...song, isFavorite: !song.isFavorite, updatedAt: new Date().toISOString() } : song
    )
    storage.set(STORAGE_KEY, updated)
    return updated
  },
}
