import { idb, STORES } from '../storage/IndexedDB'
import { memoryStore } from '../storage/MemoryStore'
import { supabase } from '../supabase/supabase'
import type { UserProfile, UserRole } from '@/types/auth.types'

export const authService = {
  /**
   * Sign in using Google OAuth via Supabase Auth
   */
  async signInWithGoogle() {
    const redirectTo = `${window.location.origin}/login`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw error
    return data
  },

  /**
   * Sign in using Email and Password
   */
  async signInWithEmail(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    })
    if (error) throw error
    return data
  },

  /**
   * Sign up using Email and Password
   */
  async signUpWithEmail(email: string, pass: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
    return data
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Fetch profile for a given user ID. If profile doesn't exist, create it with default role 'client'.
   */
  async fetchOrCreateProfile(user: any): Promise<UserProfile | null> {
    if (!user || !user.id) return null

    const localProfile = (memoryStore.profile || {}) as Partial<UserProfile>

    // 1. Try to fetch existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', fetchError)
    }

    const hasSubjects = memoryStore.subjects && memoryStore.subjects.length > 0
    const isLocalStorageCompleted = 
      localStorage.getItem('onboarding_completed_global') === 'true' ||
      (user.id && localStorage.getItem(`onboarding_completed_${user.id}`) === 'true')

    const isOnboardingCompleted = Boolean(
      (existingProfile as any)?.onboarding_completed ||
      localProfile.onboarding_completed ||
      isLocalStorageCompleted ||
      hasSubjects
    )

    if (isOnboardingCompleted) {
      try {
        localStorage.setItem('onboarding_completed_global', 'true')
        if (user.id) localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
      } catch (err) {}
    }

    let finalProfile: UserProfile

    if (existingProfile) {
      finalProfile = {
        ...(existingProfile as UserProfile),
        full_name: (existingProfile as any).full_name || localProfile.full_name || (localProfile as any).name || null,
        board_id: (existingProfile as any).board_id || localProfile.board_id || null,
        class_level: (existingProfile as any).class_level || localProfile.class_level || null,
        stream_id: (existingProfile as any).stream_id || localProfile.stream_id || null,
        subject_combination_id: (existingProfile as any).subject_combination_id || localProfile.subject_combination_id || null,
        academic_goal: (existingProfile as any).academic_goal || localProfile.academic_goal || null,
        onboarding_completed: isOnboardingCompleted,
      }
    } else {
      // 2. Fallback: Create profile if PostgreSQL trigger didn't catch it
      const fullName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       localProfile.full_name ||
                       (localProfile as any).name ||
                       user.email?.split('@')[0] || 
                       'User'
      const avatarUrl = user.user_metadata?.avatar_url || localProfile.avatar_url || null

      const newProfile: Partial<UserProfile> = {
        id: user.id,
        email: user.email,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: localProfile.role || 'client',
        is_disabled: false,
        board_id: localProfile.board_id,
        class_level: localProfile.class_level,
        stream_id: localProfile.stream_id,
        subject_combination_id: localProfile.subject_combination_id,
        academic_goal: localProfile.academic_goal,
        onboarding_completed: isOnboardingCompleted,
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile as any])
        .select('*')
        .single()

      if (createError) {
        console.error('Error creating profile fallback:', createError)
        finalProfile = {
          id: user.id,
          email: user.email || '',
          full_name: fullName,
          avatar_url: avatarUrl,
          phone: null,
          role: 'client',
          is_disabled: false,
          board_id: localProfile.board_id,
          class_level: localProfile.class_level,
          stream_id: localProfile.stream_id,
          subject_combination_id: localProfile.subject_combination_id,
          academic_goal: localProfile.academic_goal,
          onboarding_completed: isOnboardingCompleted,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      } else {
        finalProfile = {
          ...createdProfile,
          onboarding_completed: isOnboardingCompleted
        } as UserProfile
      }
    }

    memoryStore.profile = finalProfile
    await idb.put(STORES.PROFILE, { ...finalProfile, id: finalProfile.id || 'user_profile' })

    return finalProfile
  },

  /**
   * Admin: Fetch all user profiles
   */
  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as UserProfile[]
  },

  /**
   * Admin: Update role for user ('owner', 'admin', 'employee', 'client')
   */
  async updateUserRole(profileId: string, role: UserRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() } as any)
      .eq('id', profileId)

    if (error) throw error
  },

  /**
   * Admin: Toggle disabled status (soft-disable)
   */
  async toggleUserDisabled(profileId: string, isDisabled: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_disabled: isDisabled, updated_at: new Date().toISOString() } as any)
      .eq('id', profileId)

    if (error) throw error
  },

  /**
   * Admin: Delete user profile
   */
  async deleteProfile(profileId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (error) throw error
  }
}
