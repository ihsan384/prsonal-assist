import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/services/supabase/supabase'
import { authService } from '@/services/auth/authService'
import { memoryStore } from '@/services/storage/MemoryStore'
import { storage } from '@/services/storage/storageService'
import type { UserProfile, UserRole } from '@/types/auth.types'

export type AuthStatus = 'INITIALIZING' | 'AUTHENTICATED' | 'UNAUTHENTICATED'

interface AuthContextType {
  user: any | null
  profile: UserProfile | null
  role: UserRole
  loading: boolean
  authStatus: AuthStatus
  isAuthenticated: boolean
  isDisabled: boolean
  osName: string
  userFirstName: string
  rememberDevice: boolean
  setRememberDevice: (remember: boolean) => void
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, pass: string) => Promise<void>
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('INITIALIZING')
  const [rememberDevice] = useState<boolean>(true)

  const setRememberDevice = () => {}

  const loadUserData = async (authUser: any) => {
    if (!authUser) {
      setUser(null)
      setProfile(null)
      storage.setUserId(null)
      await memoryStore.switchUser('guest')
      setAuthStatus('UNAUTHENTICATED')
      return
    }

    try {
      setUser(authUser)
      storage.setUserId(authUser.id)
      await memoryStore.switchUser(authUser.id)
      const userProfile = await authService.fetchOrCreateProfile(authUser)
      setProfile(userProfile)
      setAuthStatus('AUTHENTICATED')

      // Trigger user sync after switching user DB
      import('@/services/sync/SyncService').then(({ syncEngine }) => {
        syncEngine.sync().catch(err => console.error('Sync failed on auth switch:', err))
      })
    } catch (err) {
      console.error('Error loading user data in AuthContext:', err)
      setAuthStatus('UNAUTHENTICATED')
    }
  }

  useEffect(() => {
    let isMounted = true

    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        if (session?.user) {
          loadUserData(session.user)
        } else {
          memoryStore.switchUser('guest').finally(() => {
            if (isMounted) setAuthStatus('UNAUTHENTICATED')
          })
        }
      }
    })

    // Listen for auth status changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            await loadUserData(session.user)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          storage.setUserId(null)
          await memoryStore.switchUser('guest')
          setAuthStatus('UNAUTHENTICATED')
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user)
    }
  }

  const signInWithGoogle = async () => {
    setAuthStatus('INITIALIZING')
    try {
      await authService.signInWithGoogle()
    } catch (error) {
      setAuthStatus('UNAUTHENTICATED')
      throw error
    }
  }

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthStatus('INITIALIZING')
    try {
      const res = await authService.signInWithEmail(email, pass)
      if (res.user) {
        await loadUserData(res.user)
      }
    } catch (error) {
      setAuthStatus('UNAUTHENTICATED')
      throw error
    }
  }

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    setAuthStatus('INITIALIZING')
    try {
      const res = await authService.signUpWithEmail(email, pass, fullName)
      if (res.user) {
        await loadUserData(res.user)
      }
    } catch (error) {
      setAuthStatus('UNAUTHENTICATED')
      throw error
    }
  }

  const logout = async () => {
    setAuthStatus('INITIALIZING')
    try {
      await authService.signOut()
    } finally {
      setUser(null)
      setProfile(null)
      storage.setUserId(null)
      await memoryStore.switchUser(null)
      setAuthStatus('UNAUTHENTICATED')
    }
  }

  const role: UserRole = profile?.role || 'client'
  const isAuthenticated = authStatus === 'AUTHENTICATED' && !!user
  const isDisabled = profile?.is_disabled ?? false

  const rawName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : '')
  const formattedFirstName = rawName ? rawName.trim().split(' ')[0] : 'Student'
  const userFirstName = formattedFirstName ? formattedFirstName.charAt(0).toUpperCase() + formattedFirstName.slice(1) : 'Student'
  const osName = 'Study ERP'

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = osName
    }
  }, [osName])

  if (authStatus === 'INITIALIZING') {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col items-center justify-center text-white z-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-xl font-bold tracking-tight">Study ERP</h1>
        <p className="text-sm text-gray-400 mt-1">Initializing secure session...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading: false,
        authStatus,
        isAuthenticated,
        isDisabled,
        osName,
        userFirstName,
        rememberDevice,
        setRememberDevice,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
