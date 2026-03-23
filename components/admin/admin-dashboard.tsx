'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingsTable } from './bookings-table'
import { ClientsList } from './clients-list'
import type { Booking, User } from '@/lib/types'
import { Calendar, Users, LayoutDashboard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminDashboardProps {
  bookings: (Booking & { users: { email: string } })[]
  users: User[]
}

export function AdminDashboard({ bookings, users }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('bookings')

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const approvedCount = bookings.filter((b) => b.status === 'approved').length
  const totalClients = users.length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage bookings and clients</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Confirmed sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2">
                <Users className="w-4 h-4" />
                Clients
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <BookingsTable bookings={bookings} />
            </TabsContent>

            <TabsContent value="clients">
              <ClientsList users={users} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
