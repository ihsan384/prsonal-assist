import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/services/supabase/supabase'
import { authService } from '@/services/auth/authService'
import { memoryStore } from '@/services/storage/MemoryStore'
import { storage } from '@/services/storage/storageService'
import type { UserProfile, UserRole } from '@/types/auth.types'

interface AuthContextType {
  user: any | null
  profile: UserProfile | null
  role: UserRole
  loading: boolean
  isAuthenticated: boolean
  isDisabled: boolean
  osName: string
  userFirstName: string
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
  const [loading, setLoading] = useState<boolean>(true)

  const loadUserData = async (authUser: any) => {
    if (!authUser) {
      setUser(null)
      setProfile(null)
      storage.setUserId('guest')
      await memoryStore.switchUser('guest')
      setLoading(false)
      return
    }

    try {
      setUser(authUser)
      storage.setUserId(authUser.id)
      await memoryStore.switchUser(authUser.id)
      const userProfile = await authService.fetchOrCreateProfile(authUser)
      setProfile(userProfile)
    } catch (err) {
      console.error('Error loading user data in AuthContext:', err)
    } finally {
      setLoading(false)
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
            if (isMounted) setLoading(false)
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
          storage.setUserId('guest')
          await memoryStore.switchUser('guest')
          setLoading(false)
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
    setLoading(true)
    try {
      await authService.signInWithGoogle()
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true)
    try {
      const res = await authService.signInWithEmail(email, pass)
      if (res.user) {
        await loadUserData(res.user)
      }
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    setLoading(true)
    try {
      const res = await authService.signUpWithEmail(email, pass, fullName)
      if (res.user) {
        await loadUserData(res.user)
      }
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } finally {
      setUser(null)
      setProfile(null)
      storage.setUserId('guest')
      await memoryStore.switchUser('guest')
      setLoading(false)
    }
  }

  const role: UserRole = profile?.role || 'client'
  const isAuthenticated = !!user
  const isDisabled = profile?.is_disabled ?? false

  const rawName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : '')
  const formattedFirstName = rawName ? rawName.trim().split(' ')[0] : 'Ihsan'
  const userFirstName = formattedFirstName ? formattedFirstName.charAt(0).toUpperCase() + formattedFirstName.slice(1) : 'Ihsan'
  const osName = rawName ? `${userFirstName} OS` : 'Ihsan OS'

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = osName
    }
  }, [osName])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isAuthenticated,
        isDisabled,
        osName,
        userFirstName,
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
