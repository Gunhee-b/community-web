import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  import.meta.env.PUBLIC_SUPABASE_URL ??
  ''
const rawSupabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
  ''

const supabaseUrl = rawSupabaseUrl.trim().replace(/\/+$/, '')
const supabaseAnonKey = rawSupabaseAnonKey.trim()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error('Supabase URL must start with https://')
}

export const SUPABASE_URL = supabaseUrl
export const SUPABASE_ANON_KEY = supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
  // Never override global headers or fetch to avoid CORS issues
})
