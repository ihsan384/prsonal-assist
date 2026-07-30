import { integrationSettingsStorage, integrationLogsStorage } from '../storage'
import { encryptToken, decryptToken } from '@/utils/crypto'
import { Capacitor } from '@capacitor/core'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '867c1596a947440bb28a66206509a36b'
const SCOPES = 'streaming user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played playlist-read-private playlist-read-collaborative'
const CACHE_MINUTES = 20

interface SpotifyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number // epoch ms
}

class SpotifyService {
  private activeTokens: SpotifyTokens | null = null
  private tokensLoaded = false

  // Local caching variables
  private playlistsCache: any[] | null = null
  private recentlyPlayedCache: any[] | null = null
  private podcastsCache: any[] | null = null
  private lastCacheTime = 0

  private getRedirectUri(): string {
    if (Capacitor.isNativePlatform()) {
      return 'com.ihsan.ihsanos://callback'
    }
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'https://prsonal-assist.vercel.app/callback'
  }

  // ─── OAuth2 PKCE Flow Helper Methods ───────────────────────────────────────
  
  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    const values = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(values, x => possible[x % possible.length]).join('')
  }

  private async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return crypto.subtle.digest('SHA-256', data)
  }

  private base64urlencode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }

  // Starts the Spotify OAuth2 redirect flow using PKCE
  async startLoginFlow(): Promise<void> {
    const verifier = this.generateRandomString(64)
    localStorage.setItem('spotify_code_verifier', verifier)
    
    const hashed = await this.sha256(verifier)
    const codeChallenge = this.base64urlencode(hashed)
    
    const state = this.generateRandomString(16)
    localStorage.setItem('spotify_auth_state', state)
    
    const redirectUri = this.getRedirectUri()
    console.log('[SpotifyService] startLoginFlow parameters:', {
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: SCOPES,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
      code_verifier_local: verifier
    })

    const url = new URL('https://accounts.spotify.com/authorize')
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPES,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    }).toString()
    
    console.log('[SpotifyService] Redirecting authorization URL:', url.toString())
    window.location.href = url.toString()
  }

  // Exchanges authorization code for access/refresh tokens
  async handleCallback(code: string, state: string): Promise<boolean> {
    const startMs = Date.now()
    console.log('[SpotifyService] handleCallback raw payload:', { code, state })
    try {
      const savedState = localStorage.getItem('spotify_auth_state')
      console.log('[SpotifyService] Verifying state params:', { received: state, expected: savedState })
      if (state !== savedState) {
        throw new Error(`State mismatch error. Received "${state}" but expected "${savedState}".`)
      }
      
      const verifier = localStorage.getItem('spotify_code_verifier')
      console.log('[SpotifyService] Retrieved local code verifier:', verifier)
      if (!verifier) {
        throw new Error('No local code verifier found in localStorage.')
      }

      const redirectUri = this.getRedirectUri()
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      })

      console.log('[SpotifyService] Posting token exchange payload:', {
        url: 'https://accounts.spotify.com/api/token',
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: verifier
      })

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token exchange server error: ${errorText}`)
      }

      const data = await response.json()
      
      console.log('[SpotifyService] Token exchange successful. Payload:', {
        accessToken: data.access_token ? 'SUCCESS (length: ' + data.access_token.length + ')' : 'MISSING',
        refreshToken: data.refresh_token ? 'SUCCESS (length: ' + data.refresh_token.length + ')' : 'MISSING',
        expiresIn: data.expires_in,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toLocaleString()
      })

      // Store tokens securely encrypted
      await this.saveTokens(
        data.access_token,
        data.refresh_token,
        data.expires_in
      )

      localStorage.removeItem('spotify_code_verifier')
      localStorage.removeItem('spotify_auth_state')

      integrationLogsStorage.add({
        provider: 'spotify',
        action: 'authorize',
        status: 'success',
        duration: Date.now() - startMs,
        timestamp: new Date().toISOString(),
        device: 'Web/PWA/Android'
      })

      return true
    } catch (err: any) {
      console.error('[SpotifyService] Callback error:', err)
      integrationLogsStorage.add({
        provider: 'spotify',
        action: 'authorize',
        status: 'failed',
        duration: Date.now() - startMs,
        timestamp: new Date().toISOString(),
        device: 'Web/PWA/Android',
        errorMessage: err.message
      })
      return false
    }
  }

  // ─── Token Persistence & Encryption ───────────────────────────────────────
  
  private async loadTokens(): Promise<SpotifyTokens | null> {
    if (this.tokensLoaded) return this.activeTokens
    
    try {
      const setting = integrationSettingsStorage.getById('spotify')
      if (!setting || setting.status !== 'connected' || !setting.encryptedTokens) {
        this.activeTokens = null
      } else {
        const decrypted = await decryptToken(setting.encryptedTokens)
        this.activeTokens = JSON.parse(decrypted) as SpotifyTokens
      }
    } catch (err) {
      console.error('[SpotifyService] Failed to load/decrypt tokens:', err)
      this.activeTokens = null
    }
    
    this.tokensLoaded = true
    return this.activeTokens
  }

  private async saveTokens(accessToken: string, refreshToken: string, expiresInSeconds: number): Promise<void> {
    const tokens: SpotifyTokens = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresInSeconds * 1000
    }
    
    // Encrypt
    const encrypted = await encryptToken(JSON.stringify(tokens))
    
    // Save locally
    integrationSettingsStorage.save({
      id: 'spotify',
      status: 'connected',
      lastSync: new Date().toISOString(),
      encryptedTokens: encrypted,
      syncStatus: 'success',
      retryCount: 0
    })
    
    this.activeTokens = tokens
    this.tokensLoaded = true
  }

  async disconnect(): Promise<void> {
    integrationSettingsStorage.save({
      id: 'spotify',
      status: 'disconnected',
      lastSync: new Date().toISOString(),
      encryptedTokens: '',
      syncStatus: 'success',
      retryCount: 0
    })
    this.activeTokens = null
    this.tokensLoaded = true
    this.clearCache()
  }

  // ─── Token Lifecycle & Refresh Manager ────────────────────────────────────
  
  // Refreshes the Spotify access token using the refresh token (PKCE, no Client Secret)
  private async refreshToken(): Promise<boolean> {
    const startMs = Date.now()
    if (!this.activeTokens?.refreshToken) {
      console.error('[SpotifyService] Cannot refresh token: No refresh token is loaded.')
      return false
    }

    try {
      console.log('[SpotifyService] Refreshing access token with refresh token:', {
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token_preview: this.activeTokens.refreshToken.slice(0, 10) + '...'
      })
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: this.activeTokens.refreshToken,
      })

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Refresh request failed: ${errorText}`)
      }

      const data = await response.json()
      
      console.log('[SpotifyService] Token refresh successful:', {
        accessToken: data.access_token ? 'SUCCESS' : 'MISSING',
        refreshToken: data.refresh_token ? 'NEW (SUCCESS)' : 'PRESERVED OLD',
        expiresIn: data.expires_in
      })

      // Save refreshed tokens
      await this.saveTokens(
        data.access_token,
        data.refresh_token || this.activeTokens.refreshToken, // Spotify may not return a new refresh token
        data.expires_in
      )

      integrationLogsStorage.add({
        provider: 'spotify',
        action: 'refresh_token',
        status: 'success',
        duration: Date.now() - startMs,
        timestamp: new Date().toISOString(),
        device: 'Web/PWA/Android'
      })

      return true
    } catch (err: any) {
      console.error('[SpotifyService] Token refresh failed:', err)
      integrationLogsStorage.add({
        provider: 'spotify',
        action: 'refresh_token',
        status: 'failed',
        duration: Date.now() - startMs,
        timestamp: new Date().toISOString(),
        device: 'Web/PWA/Android',
        errorMessage: err.message
      })
      
      // Safeguard: disconnect on fatal refresh failures
      await this.disconnect()
      return false
    }
  }

  // Ensures we have a valid access token before making requests
  private async getValidToken(): Promise<string | null> {
    const tokens = await this.loadTokens()
    if (!tokens) return null

    // Check if expired or expiring within 60 seconds
    if (Date.now() + 60000 >= tokens.expiresAt) {
      const refreshed = await this.refreshToken()
      if (!refreshed) return null
    }

    return this.activeTokens?.accessToken || null
  }

  // Helper method for authenticated requests with retry capabilities
  private async fetchSpotify<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getValidToken()
    if (!token) throw new Error('Spotify not connected or unauthorized')

    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    })

    if (res.status === 401) {
      // Token might have expired precisely at this moment, force a refresh once
      const refreshed = await this.refreshToken()
      if (refreshed && this.activeTokens) {
        // Retry original request
        const retryRes = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.activeTokens.accessToken}`
          }
        })
        if (!retryRes.ok) throw new Error(`Spotify API error after refresh: ${retryRes.status}`)
        return retryRes.json() as Promise<T>
      }
      throw new Error('Spotify session expired. Re-connection required.')
    }

    if (!res.ok) {
      throw new Error(`Spotify API error: ${res.status}`)
    }

    return res.json() as Promise<T>
  }

  // ─── API Methods with Caching ─────────────────────────────────────────────
  
  isConnected(): boolean {
    const setting = integrationSettingsStorage.getById('spotify')
    return setting?.status === 'connected'
  }

  getLastSync(): string | null {
    const setting = integrationSettingsStorage.getById('spotify')
    return setting?.lastSync || null
  }

  getTokenStatus(): { isExpired: boolean; expiresAt: string | null } {
    if (!this.activeTokens) return { isExpired: true, expiresAt: null }
    return {
      isExpired: Date.now() >= this.activeTokens.expiresAt,
      expiresAt: new Date(this.activeTokens.expiresAt).toLocaleString()
    }
  }

  private isCacheValid(): boolean {
    const now = Date.now()
    const diff = now - this.lastCacheTime
    return diff < CACHE_MINUTES * 60 * 1000
  }

  clearCache(): void {
    this.playlistsCache = null
    this.recentlyPlayedCache = null
    this.podcastsCache = null
    this.lastCacheTime = 0
  }

  // Fetches current playlist metadata
  async getPlaylists(forceRefresh = false): Promise<any[]> {
    if (!this.isConnected()) return []
    if (this.playlistsCache && this.isCacheValid() && !forceRefresh) {
      return this.playlistsCache
    }

    const startMs = Date.now()
    try {
      const data = await this.fetchSpotify<{ items: any[] }>('https://api.spotify.com/v1/me/playlists?limit=20')
      this.playlistsCache = data.items || []
      this.lastCacheTime = Date.now()
      
      integrationLogsStorage.add({
        provider: 'spotify',
        action: 'get_playlists',
        status: 'success',
        duration: Date.now() - startMs,
        timestamp: new Date().toISOString(),
        device: 'Web/PWA/Android'
      })
      return this.playlistsCache
    } catch (err: any) {
      console.error('[Spotify] Get playlists failed:', err)
      return this.playlistsCache || []
    }
  }

  // Fetches recently played tracks metadata
  async getRecentlyPlayed(forceRefresh = false): Promise<any[]> {
    if (!this.isConnected()) return []
    if (this.recentlyPlayedCache && this.isCacheValid() && !forceRefresh) {
      return this.recentlyPlayedCache
    }

    const startMs = Date.now()
    try {
      const data = await this.fetchSpotify<{ items: any[] }>('https://api.spotify.com/v1/me/player/recently-played?limit=20')
      this.recentlyPlayedCache = (data.items || []).map((item: any) => ({
        track: item.track,
        playedAt: item.played_at
      }))
      this.lastCacheTime = Date.now()
      
      integrationLogsStorage.add({
        provider: 'spotify',
        action: 'get_recently_played',
        status: 'success',
        duration: Date.now() - startMs,
        timestamp: new Date().toISOString(),
        device: 'Web/PWA/Android'
      })
      return this.recentlyPlayedCache
    } catch (err: any) {
      console.error('[Spotify] Get recently played failed:', err)
      return this.recentlyPlayedCache || []
    }
  }

  // Fetches podcasts or shows (represented here as search or standard mocks because user-shows api is restricted sometimes)
  async getPodcasts(forceRefresh = false): Promise<any[]> {
    if (!this.isConnected()) return []
    if (this.podcastsCache && this.isCacheValid() && !forceRefresh) {
      return this.podcastsCache
    }

    const startMs = Date.now()
    try {
      // Query Spotify for top podcasts/shows with a placeholder query
      const data = await this.fetchSpotify<{ shows: { items: any[] } }>('https://api.spotify.com/v1/search?q=podcast&type=show&limit=10')
      this.podcastsCache = data.shows?.items || []
      this.lastCacheTime = Date.now()

      integrationLogsStorage.add({
        provider: 'spotify',
        action: 'get_podcasts',
        status: 'success',
        duration: Date.now() - startMs,
        timestamp: new Date().toISOString(),
        device: 'Web/PWA/Android'
      })
      return this.podcastsCache
    } catch (err: any) {
      console.error('[Spotify] Get podcasts failed:', err)
      return this.podcastsCache || []
    }
  }

  // Search playlists or tracks
  async search(query: string, type: 'playlist' | 'track' = 'playlist'): Promise<any[]> {
    if (!this.isConnected() || !query.trim()) return []
    try {
      const data = await this.fetchSpotify<any>(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=10`)
      if (type === 'playlist') {
        return data.playlists?.items || []
      } else {
        return data.tracks?.items || []
      }
    } catch (err) {
      console.error('[Spotify] Search failed:', err)
      return []
    }
  }

  // Get active access token (auto-refreshing if expired)
  async getAccessToken(): Promise<string | null> {
    const tokens = await this.loadTokens()
    if (!tokens) return null
    if (Date.now() >= tokens.expiresAt) {
      const refreshed = await this.refreshToken()
      if (!refreshed) return null
    }
    return this.activeTokens?.accessToken || null
  }

  // Extracts Spotify ID from URL or URI
  extractSpotifyId(urlOrUri: string, type: 'track' | 'playlist' | 'album' | 'show' | 'episode' = 'track'): string {
    if (!urlOrUri) return ''
    if (urlOrUri.startsWith('spotify:')) {
      const parts = urlOrUri.split(':')
      return parts[2] || parts[1] || urlOrUri
    }
    const match = urlOrUri.match(new RegExp(`${type}\/([a-zA-Z0-9]+)`))
    return match ? match[1] : urlOrUri
  }

  // Triggers full song playback on user's active Spotify device/Web Playback API
  async playUriRemote(urlOrUri: string): Promise<boolean> {
    if (!this.isConnected()) return false
    try {
      let bodyPayload: any = {}
      if (urlOrUri.includes('track')) {
        const trackId = this.extractSpotifyId(urlOrUri, 'track')
        bodyPayload = { uris: [`spotify:track:${trackId}`] }
      } else if (urlOrUri.includes('playlist')) {
        const playlistId = this.extractSpotifyId(urlOrUri, 'playlist')
        bodyPayload = { context_uri: `spotify:playlist:${playlistId}` }
      } else if (urlOrUri.includes('album')) {
        const albumId = this.extractSpotifyId(urlOrUri, 'album')
        bodyPayload = { context_uri: `spotify:album:${albumId}` }
      } else if (urlOrUri.startsWith('spotify:')) {
        bodyPayload = urlOrUri.includes('track') ? { uris: [urlOrUri] } : { context_uri: urlOrUri }
      }

      await this.fetchSpotify('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      })
      return true
    } catch (err) {
      console.warn('[Spotify] Remote play failed:', err)
      return false
    }
  }

  // Opens a Spotify playlist in a new browser window/native app
  launchPlaylist(playlistUrl: string): void {
    if (!playlistUrl) return
    window.open(playlistUrl, '_blank')
  }

  // Get curated focus playlists
  getStudyCategories() {
    return [
      { id: 'lofi', name: 'Lofi Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn' },
      { id: 'ambient', name: 'Ambient Study', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWGFQLwR2X4t' },
      { id: 'classical', name: 'Classical Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWE3w1vQj57i' },
      { id: 'ambient_relax', name: 'Deep Focus Ambient', url: 'https://open.spotify.com/playlist/37i9dQZF1DW1s9vYBE5fQE' },
      { id: 'piano', name: 'Peaceful Piano Study', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSp46JctO' }
    ]
  }
}

export const spotifyService = new SpotifyService()
