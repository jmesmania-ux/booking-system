'use client'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Page() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          if (error.message.includes('PKCE code verifier not found')) {
            setError('Please try signing in again - clear cache if issue persists')
          } else {
            setError(error.message)
          }
        } else if (user) {
          setIsLoggedIn(true)
        }
      } catch (err) {
        setError('Failed to check session')
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10 bg-gray-50">
      <Card className="w-full max-w-sm shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center">Thank you for signing up!</h2>
          {isLoading && <p className="text-center text-gray-500">Finalizing your account...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!isLoading && !error && (
            <>
              {isLoggedIn ? (
                <Link href="/book" className="block w-full">
                  <Button className="w-full mt-4">Go to Bookings</Button>
                </Link>
              ) : (
                <>
                  <p className="text-center text-gray-600 mt-4">
                    Check your email for a verification link!
                  </p>
                  <Link href="/auth/login" className="block text-center mt-4 text-primary">
                    Already verified? Login here
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
