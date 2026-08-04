export type UserRole = 'owner' | 'admin' | 'employee' | 'client'

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: UserRole
  is_disabled: boolean
  board_id?: string | null
  class_level?: string | null
  stream_id?: string | null
  subject_combination_id?: string | null
  academic_goal?: string | null
  onboarding_completed?: boolean
  created_at: string
  updated_at: string

  // Legacy/App Preferences
  name?: string
  avatar?: string
  bio?: string
  timezone?: string
  theme?: 'dark' | 'light' | 'system'
  accentColor?: string
  dateOfBirth?: string
  joinedAt?: string
}

export interface GymMember {
  id: string
  profile_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  membership_type: string
  membership_status: 'Active' | 'Expired' | 'Pending' | 'Cancelled'
  joined_date: string
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: any | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
}
