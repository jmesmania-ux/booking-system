import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          )
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Proxy cookie sync failed:', error)
          }
        }
      },
    },
  })

  // Refresh session to keep auth valid (critical for Render)
  await supabase.auth.getUser()

  return supabaseResponse
}

// Specify which paths the middleware applies to
export const config = {
  matcher: [
    /* Match all request paths except for:
     * - Static files (e.g., favicon.ico)
     * - Images, scripts, styles (public/ folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
