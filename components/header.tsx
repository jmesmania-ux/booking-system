'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Leaf, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null
    
    try {
      const supabase = createClient()
      
      const getUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        } catch (error) {
          console.log("[v0] Error getting user:", error)
        }
      }
      getUser()

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
      subscription = data.subscription
    } catch (error) {
      console.log("[v0] Supabase not configured:", error)
    }

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.log("[v0] Error signing out:", error)
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Serenity Touch</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Home
          </Link>
          <Link 
            href="/book" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive('/book') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Book Now
          </Link>
          {user && (
            <Link 
              href="/my-bookings" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/my-bookings') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              My Bookings
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col gap-4 py-4 px-4">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "text-sm font-medium py-2",
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Home
            </Link>
            <Link 
              href="/book"
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "text-sm font-medium py-2",
                isActive('/book') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Book Now
            </Link>
            {user && (
              <Link 
                href="/my-bookings"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-sm font-medium py-2",
                  isActive('/my-bookings') ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                My Bookings
              </Link>
            )}
            <div className="pt-4 border-t">
              {user ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/sign-up">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
