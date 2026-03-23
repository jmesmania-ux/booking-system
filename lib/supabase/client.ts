import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

let client: SupabaseClient | null = null

export function createClient() {
  if (client) return client
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('[v0] Missing Supabase environment variables')
    // Return a minimal mock to prevent crashes
    throw new Error('Supabase not configured')
  }
  
  client = createBrowserClient(url, key)
  return client
}
