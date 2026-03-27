import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { Suspense } from 'react'

export const metadata = {
  title: "Admin Dashboard | King's Massage",
  description: 'Manage professional massage bookings and client requests.',
}

// Ensure the page doesn't cache old data
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createClient()
  
  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  // 2. Verify Admin Role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Safety check: if user doesn't exist in 'users' table or isn't admin
  if (!userData || userData.role !== 'admin') {
    redirect('/')
  }

  // 3. Fetch Bookings 
  // Added a check to ensure we get all the data needed for the tiles
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select('*') // Using * is safer for debugging during development
    .order('created_at', { ascending: false })

  if (bookingError) {
    console.error('❌ Database Fetch Error:', bookingError.message)
  }

  // 4. Fetch Client list (Matched to your screenshot showing 3 clients)
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  if (userError) {
    console.error('❌ User Fetch Error:', userError.message)
  }

  return (
    <main className="min-h-screen bg-slate-50/50">
      <Suspense fallback={<AdminLoading />}>
        {/* We pass the initial data here */}
        <AdminDashboard 
          initialBookings={bookings || []} 
          initialUsers={users || []} 
        />
      </Suspense>
    </main>
  )
}

function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-bold animate-pulse text-[10px] uppercase tracking-[0.2em]">
        Refreshing Dashboard...
      </p>
    </div>
  )
}
