'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client' // ensure this returns a browser supabase client
import { Header } from '@/components/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingsTable } from './bookings-table'
import { ClientsList } from './clients-list'
import type { Booking, User } from '@/lib/types'
import { Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AdminDashboardProps {
  bookings: (Booking & { users?: { email?: string } })[] // users may be optional
  users: User[]
}

// Format Philippine Pesos currency
const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0
  }).format(amount)
}

// Get current month for earnings calculation
const getCurrentMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start,
    end,
    label: `${now.toLocaleDateString('en-PH', { month: 'long' })} ${now.getFullYear()}`
  }
}

export function AdminDashboard({ bookings = [], users = [] }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'clients'>('bookings')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingFilter, setBookingFilter] = useState<'all' | string>('all')

  // localBookings mirrors incoming bookings and allows optimistic updates
  const [localBookings, setLocalBookings] = useState(() => bookings ?? [])

  const router = useRouter()
  const supabase = createClient()

  // Keep localBookings in sync when parent props change
  useEffect(() => {
    setLocalBookings(bookings ?? [])
  }, [bookings])

  // Helper to perform optimistic update with rollback
  async function optimisticUpdate(
    id: string,
    patch: Partial<Booking>,
    dbUpdate: () => Promise<{ error: any }>
  ) {
    const previous = localBookings
    setLocalBookings(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)))

    try {
      const { error } = await dbUpdate()
      if (error) {
        console.error('DB update error:', error)
        // rollback
        setLocalBookings(previous)
      }
    } catch (err) {
      console.error('Unexpected error during DB update:', err)
      setLocalBookings(previous)
    } finally {
      // refresh to ensure server state is reflected
      try {
        router.refresh()
      } catch (e) {
        // router.refresh may not be necessary in all setups; ignore failures
      }
    }
  }

  // 🔑 Optimistic Handlers
  async function handleApprove(id: string) {
    await optimisticUpdate(
      id,
      { status: 'approved' },
      async () => await supabase.from('bookings').update({ status: 'approved' }).eq('id', id)
    )
  }

  async function handleReject(id: string) {
    await optimisticUpdate(
      id,
      { status: 'cancelled' },
      async () => await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    )
  }

  async function handleComplete(id: string, earnings: number) {
    await optimisticUpdate(
      id,
      { status: 'completed', earnings },
      async () => await supabase.from('bookings').update({ status: 'completed', earnings }).eq('id', id)
    )
  }

  // Stats (defensive checks)
  const pendingCount = localBookings.filter((b) => (b.status ?? '').toLowerCase() === 'pending').length
  const approvedCount = localBookings.filter((b) => (b.status ?? '').toLowerCase() === 'approved').length
  const completedCount = localBookings.filter((b) => (b.status ?? '').toLowerCase() === 'completed').length
  const totalClients = users?.length ?? 0

  const { label: monthLabel, start: monthStart, end: monthEnd } = getCurrentMonthRange()
  const monthlyEarnings = localBookings
    .filter(b => (b.status ?? '').toLowerCase() === 'completed')
    .filter(b => {
      if (!b.created_at) return false
      const created = new Date(b.created_at)
      return created >= monthStart && created <= monthEnd
    })
    .reduce((sum, b) => sum + (Number(b.earnings ?? 0) || 0), 0)

  // Filters (defensive string checks)
  const filteredBookings = localBookings
    .filter(booking => {
      const searchLower = (searchQuery ?? '').toLowerCase().trim()
      if (!searchLower) return true
      const name = (booking.name ?? '').toLowerCase()
      const service = (booking.service ?? '').toLowerCase()
      const email = (booking.users?.email ?? '').toLowerCase()
      const id = (booking.id ?? '').toLowerCase()
      return name.includes(searchLower) || service.includes(searchLower) || email.includes(searchLower) || id.includes(searchLower)
    })
    .filter(booking => bookingFilter === 'all' || (booking.status ?? '') === bookingFilter)

  const filteredUsers = (users ?? []).filter(user => {
    const searchLower = (searchQuery ?? '').toLowerCase().trim()
    if (!searchLower) return true
    const email = (user.email ?? '').toLowerCase()
    const id = (user.id ?? '').toLowerCase()
    return email.includes(searchLower) || id.includes(searchLower)
  })

  const handleFilterClick = (filter: 'all' | string) => {
    setBookingFilter(filter)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Manage bookings and clients</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400">This month</div>
                <div className="font-semibold">{monthLabel}</div>
                <div className="text-sm text-emerald-600">{formatPHP(monthlyEarnings)}</div>
              </div>
              <button className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700">
                Notifications
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-amber-50 border">
              <p className="text-xs font-semibold text-slate-500 uppercase">Pending Bookings</p>
              <p className="text-3xl font-extrabold mt-2">{pendingCount}</p>
              <p className="text-xs text-slate-500 mt-2">{pendingCount} Awaiting approval</p>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 border">
              <p className="text-xs font-semibold text-slate-500 uppercase">Approved Bookings</p>
              <p className="text-3xl font-extrabold mt-2">{approvedCount}</p>
              <p className="text-xs text-slate-500 mt-2">{approvedCount} Confirmed sessions</p>
            </div>

            <div className="p-4 rounded-lg bg-sky-50 border">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Clients</p>
              <p className="text-3xl font-extrabold mt-2">{totalClients}</p>
              <p className="text-xs text-slate-500 mt-2">{totalClients} Registered users</p>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'bookings' | 'clients')} className="mb-8">
            <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bookings
                {pendingCount > 0 && (
                  <Badge className="ml-2 bg-amber-100 text-amber-700">{pendingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clients
                <Badge className="ml-2 bg-blue-100 text-blue-700">{totalClients}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab Content */}
            <TabsContent value="bookings" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Bookings {bookingFilter !== 'all' ? `(${bookingFilter})` : ''}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleFilterClick('all')}>All</Button>
                  <Button variant="outline" size="sm" onClick={() => handleFilterClick('pending')}>Pending</Button>
                  <Button variant="outline" size="sm" onClick={() => handleFilterClick('approved')}>Approved</Button>
                  <Button variant="outline" size="sm" onClick={() => handleFilterClick('completed')}>Completed</Button>
                </div>
              </div>

              <div className="mb-4">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, service, email or id..."
                  className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <BookingsTable
                bookings={filteredBookings}
                onApprove={handleApprove}
                onReject={handleReject}
                onComplete={handleComplete}
              />
            </TabsContent>

            {/* Clients Tab Content */}
            <TabsContent value="clients">
              <h3 className="text-lg font-semibold mb-4">Registered Clients ({totalClients})</h3>

              <div className="mb-4">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients by email or ID..."
                  className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              <ClientsList users={filteredUsers} bookings={localBookings} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
