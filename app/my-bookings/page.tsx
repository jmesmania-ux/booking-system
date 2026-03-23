import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { BookingsList } from '@/components/bookings/bookings-list'
import { Calendar } from 'lucide-react'

export const metadata = {
  title: 'My Bookings | Serenity Touch',
  description: 'View and manage your massage therapy bookings.',
}

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/my-bookings')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Bookings</h1>
              <p className="text-sm text-muted-foreground">View and manage your appointments</p>
            </div>
          </div>
          
          <BookingsList bookings={bookings || []} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
