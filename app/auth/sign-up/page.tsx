'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FcGoogle } from 'react-icons/fc'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Force mobile view on load
  useEffect(() => {
    const lockMobileView = () => {
      document.documentElement.style.width = 'device-width'
      document.documentElement.style.overflowX = 'hidden'
      // Override any desktop viewport overrides from OAuth redirects
      if (window.innerWidth > 768) {
        document.body.style.maxWidth = '375px'
        document.body.style.margin = '0 auto'
      }
    }
    lockMobileView()
    window.addEventListener('resize', lockMobileView)
    return () => window.removeEventListener('resize', lockMobileView)
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URL ||
            `${window.location.origin}/auth/sign-up-success?mobile=true`, // Add mobile flag
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign-up')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URL ||
            `${window.location.origin}/auth/sign-up-success?mobile=true`, // Mobile flag
          pkceVerifierStorage: 'cookie',
          flowType: 'pkce',
          // Force mobile user-agent for OAuth flow
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36'
          }
        },
      })
      if (error) throw error
      // Force direct mobile redirect (bypass Next.js navigation)
      if (data?.url) window.location.replace(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-up failed - try clearing cache')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 sm:p-6 bg-gray-50">
      <div className="w-full max-w-xs sm:max-w-sm"> {/* Restrict max width for mobile */}
        <Card className="shadow-md w-full">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">Sign up</CardTitle>
            <CardDescription className="text-center text-sm">
              Create a new account to book appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeat-password" className="text-sm font-medium">Repeat Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-sm"
                />
              </div>

              {error && <p className="text-red-500 text-xs sm:text-sm font-medium text-center">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium text-sm py-2"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>

              <div className="flex items-center gap-2 py-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs sm:text-sm text-gray-500">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium text-sm py-2"
                disabled={isGoogleLoading}
              >
                <FcGoogle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {isGoogleLoading ? 'Processing...' : 'Continue with Google'}
              </Button>

              <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="underline text-primary font-medium">
                  Login here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
