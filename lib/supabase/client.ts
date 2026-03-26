import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

// ❌ DO NOT use a singleton - creates conflicts in Render/Next.js dev/prod modes
// ✅ Create a NEW client instance every time the function is called
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('[Supabase Client] Missing environment variables (NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY)')
    throw new Error('Supabase is not configured - check your environment variables')
  }

  // ✅ Create a fresh client on every call (critical for auth flow consistency)
  return createBrowserClient(url, key, {
    // Force cookie storage for PKCE/auth consistency
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
    },
    cookies: {
      // Explicit cookie configuration to match server-side setup
      get(name: string) {
        if (typeof document === 'undefined') return null
        return document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
          ?.split('=')[1]
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return
        const opts = { ...options, path: '/', secure: process.env.NODE_ENV === 'production' }
        document.cookie = `${name}=${value}; ${Object.entries(opts).map(([k, v]) => `${k}=${v}`).join('; ')}`
      },
    },
  })
}
