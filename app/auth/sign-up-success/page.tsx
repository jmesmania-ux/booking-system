'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleUser, setIsGoogleUser] = useState(false) // ← ADDED!
  const supabase = createClient()

  // Handle Supabase auth code exchange
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      if (!code) {
        setProcessing(false)
        return
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
        
        // Check if user signed up with Google
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.identities?.[0]?.provider === 'google') {
          setIsGoogleUser(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete sign-up')
      } finally {
        setProcessing(false)
      }
    }

    handleAuthCallback()
  }, [supabase])


  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Thank you for signing up!</CardTitle>
            <CardDescription>
              {processing 
                ? 'Finalizing your account...' 
                : error 
                  ? error 
                  : 'Your account is ready to use.'
            }</CardDescription>
          </CardHeader>
          <CardContent>
            {!processing && !error && (
              <>
                {isGoogleUser ? ( // ← NOW DEFINED!
                  <Link href="/book">
                    <Button className="w-full">Go to Book Appointment</Button>
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <Button className="w-full">Go to Login</Button>
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
