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
import { useState } from 'react'
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
          // Redirect to sign-up success page for email sign-ups
          emailRedirectTo:
            process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URL ||
            `${window.location.origin}/auth/sign-up-success`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect to sign-up success page for Google sign-ups
          redirectTo:
            process.env.NEXT_PUBLIC_SIGNUP_REDIRECT_URL ||
            `${window.location.origin}/auth/sign-up-success`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Google sign-up failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign up</CardTitle>
              <CardDescription>Create a new account to book appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="grid gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Sign up'}
                  </Button>
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm text-gray-500">Or continue with</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full bg-white border border-gray-300"
                    disabled={isGoogleLoading}
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    {isGoogleLoading ? 'Processing...' : 'Continue with Google'}
                  </Button>
                  <div className="text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="underline">
                      Login here
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
