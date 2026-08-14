import { createClient } from '@supabase/supabase-js'

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Netlify forwards this path to Supabase (see netlify.toml). Keeping requests
// on the site origin avoids a direct browser connection to supabase.co.
const shouldUseNetlifyProxy =
  typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('.netlify.app') || import.meta.env.VITE_USE_SUPABASE_PROXY === 'true')

const supabaseUrl = shouldUseNetlifyProxy
  ? new URL('/supabase', window.location.origin).toString().replace(/\/$/, '')
  : configuredSupabaseUrl

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
