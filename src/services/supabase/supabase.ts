import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Checks if the Supabase configuration is updated from the default placeholder.
 */
export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder' &&
    supabaseUrl !== '' &&
    supabaseAnonKey !== ''
  )
}
