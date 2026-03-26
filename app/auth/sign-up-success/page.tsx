'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const supabase = createClient()

  const handleResend = async () => {
    setResendLoading(true)
    setResendMessage(null)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup' })
      if (error) throw error
      setResendMessage('Confirmation email resent successfully!')
    } catch (err) {
      setResendMessage(
        err instanceof Error ? err.message : 'Failed to resend confirmation email'
      )
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>
              <CardDescription>Check your email to confirm your account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email (including spam/junk folders) to
                confirm your account before signing in.
              </p>
              
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/auth/login">
                  <Button className="w-full">Go to Login</Button>
                </Link>
                
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full" 
                  onClick={handleResend}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Resending...' : 'Resend Confirmation Email'}
                </Button>
                
                {resendMessage && (
                  <p className={`mt-2 text-sm text-center ${
                    resendMessage.includes('successfully') 
                      ? 'text-green-600' 
                      : 'text-red-500'
                  }`}>
                    {resendMessage}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
