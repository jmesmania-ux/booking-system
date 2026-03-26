'use client'

import React, { useState } from 'react'
import { Header } from '@/components/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingsTable } from './bookings-table'
import { ClientsList } from './clients-list'
import type { Booking, User } from '@/lib/types'
import { Calendar, Users, LayoutDashboard, Search, Filter, Download, Bell, DollarSign } from 'lucide-react'
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
  return { start, end }
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

  // Calculate earnings stats (current month only)
  const { start, end } = getCurrentMonthRange()
  const monthlyCompletedBookings = bookings.filter(b => 
    b.status === 'completed' && 
    new Date(b.created_at) >= start && 
    new Date(b.created_at) <= end
  )
  const monthlyApprovedBookings = bookings.filter(b => 
    b.status === 'approved' && 
    new Date(b.created_at) >= start && 
    new Date(b.created_at) <= end
  )
  const totalMonthlyEarnings = monthlyCompletedBookings.reduce((sum, b) => sum + (b.earnings || 0), 0)
  const pendingEarnings = monthlyApprovedBookings.reduce((sum, b) => sum + (b.earnings || 0), 0)

  // Filter bookings/clients based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = bookingFilter === 'all' || booking.status === bookingFilter
    const searchLower = searchQuery.toLowerCase().trim()
    const matchesSearch = searchLower === '' ||
                          booking.name.toLowerCase().includes(searchLower) ||
                          booking.service.toLowerCase().includes(searchLower) ||
                          booking.users.email.toLowerCase().includes(searchLower) ||
                          booking.mobile.includes(searchLower)
    return matchesFilter && matchesSearch
  })

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase().trim()
    return searchLower === '' ||
           user.email.toLowerCase().includes(searchLower) ||
           user.id.includes(searchLower)
  })

  // Handle stats card clicks to filter content
  const handleStatsClick = (filter: string) => {
    setActiveTab('bookings')
    setBookingFilter(filter)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header Section with Notifications */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage bookings, clients, and earnings</p>
              </div>
            </div>

            {/* Notification Button */}
            <Button size="sm" variant="default" className="relative self-start md:self-auto">
              <Bell className="w-4 h-4 mr-1" />
              Notifications
              {pendingCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>
          </div>

          {/* Core Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="border-amber-100 hover:shadow-md transition-all cursor-pointer" onClick={() => handleStatsClick('pending')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">
                  Pending Bookings
                </CardTitle>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Calendar className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
                {pendingCount > 0 && (
                  <Badge className="mt-2 bg-amber-100 text-amber-800 hover:bg-amber-200">
                    {pendingCount} needing action
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-md transition-all cursor-pointer" onClick={() => handleStatsClick('approved')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  Approved Bookings
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-full">
                  <Calendar className="h-4 w-4 text-green-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Confirmed sessions</p>
                {approvedCount > 0 && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    {formatPHP(pendingEarnings)} pending earnings
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveTab('clients')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total Clients
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Stats Tiles */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card className="border-emerald-100 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">
                  Monthly Earnings (Completed)
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-emerald-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-800">{formatPHP(totalMonthlyEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  From {start.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} to {end.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </p>
                <Badge className="mt-2 bg-emerald-100 text-emerald-800">
                  {completedCount} completed services
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">
                  Pending Earnings (Approved)
                </CardTitle>
                <div className="p-2 bg-indigo-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-indigo-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-800">{formatPHP(pendingEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  From {approvedCount} confirmed bookings
                </p>
                <Badge className="mt-2 bg-indigo-100 text-indigo-800">
                  Mark as completed to finalize
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mb-6">
            {/* Search Input */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={activeTab === 'bookings' 
                  ? "Search bookings by name, service or email..." 
                  : "Search clients by email or ID..."}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              {activeTab === 'bookings' && (
                <Tabs value={bookingFilter} onValueChange={setBookingFilter} className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="w-4 h-4" />
                Bookings
                {pendingCount > 0 && (
                  <Badge className="ml-1 bg-amber-100 text-amber-800">{pendingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2">
                <Users className="w-4 h-4" />
                Clients
                <Badge className="ml-1 bg-blue-100 text-blue-800">{totalClients}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab - Pass Filtered Data */}
            <TabsContent value="bookings">
              <BookingsTable bookings={filteredBookings} />
            </TabsContent>

            {/* Clients Tab - Pass Filtered Data */}
            <TabsContent value="clients">
              <ClientsList users={filteredUsers} bookings={bookings} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
