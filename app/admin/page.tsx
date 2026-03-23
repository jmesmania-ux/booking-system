import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export const metadata = {
  title: 'Admin Dashboard | Serenity Touch',
  description: 'Manage bookings and communicate with clients.',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/')
  }

  // Fetch all bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, users!inner(email)')
    .order('created_at', { ascending: false })

  // Fetch all users with their latest message
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return <AdminDashboard bookings={bookings || []} users={users || []} />
}
