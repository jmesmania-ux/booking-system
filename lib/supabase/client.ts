import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) throw new Error('Supabase not configured')

  return createBrowserClient(url, key, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
    },
    cookies: {
      getAll() {
        if (typeof document === 'undefined') return []
        return document.cookie.split('; ').map(c => {
          const [name, value] = c.split('=')
          return { name, value }
        })
      },
      setAll(cookiesToSet) {
        if (typeof document === 'undefined') return
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOpts = [
            `${name}=${value}`,
            `path=${options.path || '/'}`,
            `max-age=${options.maxAge || 31536000}`,
            process.env.NODE_ENV === 'production' ? 'Secure' : '',
            'SameSite=Lax',
          ].filter(Boolean).join('; ')
          document.cookie = cookieOpts
        })
      },
    },
  })
}
