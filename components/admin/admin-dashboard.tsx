'use client'

import React, { useState } from 'react'
import { Header } from '@/components/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingsTable } from './bookings-table'
import { ClientsList } from './clients-list'
import type { Booking, User } from '@/lib/types'
import { Calendar, Users, LayoutDashboard, Search, Filter, Download, Bell, DollarSign, Flame, Droplets, Wind, Lungs } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface AdminDashboardProps {
  bookings: (Booking & { users: { email: string } })[]
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

export function AdminDashboard({ bookings, users }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('bookings')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingFilter, setBookingFilter] = useState('all')

  // Calculate core stats
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const approvedCount = bookings.filter((b) => b.status === 'approved').length
  const completedCount = bookings.filter((b) => b.status === 'completed').length
  const totalClients = users.length
  
  // Calculate earnings stats
  const { label: monthLabel, start: monthStart, end: monthEnd } = getCurrentMonthRange()
  const monthlyEarnings = bookings
    .filter(b => b.status === 'completed' && new Date(b.created_at) >= monthStart && new Date(b.created_at) <= monthEnd)
    .reduce((sum, b) => sum + (b.earnings || 0), 0)
  
  const pendingEarnings = bookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + (b.earnings || 0), 0)

  // Filter bookings/clients based on search
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchQuery.toLowerCase().trim()
    return searchLower === '' || 
           booking.name.toLowerCase().includes(searchLower) ||
           booking.service.toLowerCase().includes(searchLower) ||
           booking.users.email.toLowerCase().includes(searchLower)
  }).filter(booking => bookingFilter === 'all' || booking.status === bookingFilter)

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase().trim()
    return searchLower === '' || 
           user.email.toLowerCase().includes(searchLower) ||
           user.id.includes(searchLower)
  })

  // Handle filter clicks
  const handleFilterClick = (filter: string) => {
    setBookingFilter(filter)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your massage services and clients</p>
              </div>
            </div>

            <Button variant="default" size="sm" className="relative">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {pendingCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground">
                  {pendingCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Pending Bookings */}
            <Card className="border-amber-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-amber-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Pending Bookings
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-700">
                  {pendingCount}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingCount}</p>
                <p className="text-muted-foreground text-sm">Awaiting your approval</p>
              </CardContent>
            </Card>

            {/* Approved Bookings */}
            <Card className="border-green-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Approved Services
                </CardTitle>
                <Badge className="bg-green-100 text-green-700">
                  {approvedCount}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{approvedCount}</p>
                <p className="text-muted-foreground text-sm">Ready for service delivery</p>
              </CardContent>
            </Card>

            {/* Total Earnings */}
            <Card className="border-emerald-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-emerald-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Earnings
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {monthLabel}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatPHP(monthlyEarnings)}</p>
                <p className="text-muted-foreground text-sm">
                  From {completedCount} completed services
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search bookings or clients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bookings
                {pendingCount > 0 && (
                  <Badge className="ml-2 bg-amber-100 text-amber-700">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clients
                <Badge className="ml-2 bg-blue-100 text-blue-700">
                  {totalClients}
                </Badge>
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
              <BookingsTable bookings={filteredBookings} />
            </TabsContent>

            {/* Clients Tab Content */}
            <TabsContent value="clients">
              <h3 className="text-lg font-semibold mb-4">Registered Clients ({totalClients})</h3>
              <ClientsList users={filteredUsers} bookings={bookings} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
