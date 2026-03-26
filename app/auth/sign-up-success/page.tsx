'use client'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setIsLoggedIn(true)
    }
    checkSession()
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Card className="mobile-lock p-6 shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Thank you for signing up!</h2>
        <Link href="/book" className="block w-full">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white py-2">
            {isLoggedIn ? 'Go to Bookings' : 'Proceed to Bookings'}
          </Button>
        </Link>
      </Card>
    </div>
  )
}
