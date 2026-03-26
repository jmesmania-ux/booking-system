'use client'

import { useState } from 'react'
import type { User, Booking } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mail, Phone, Calendar, Clock, User as UserIcon, 
  ChevronDown, ChevronUp 
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ClientsListProps {
  users: User[]
  bookings: (Booking & { users: { email: string } })[]
}

export function ClientsList({ users, bookings }: ClientsListProps) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null)

  // Get booking stats for a client
  const getClientBookings = (clientId: string) => {
    const clientBookings = bookings.filter(b => b.user_id === clientId)
    return {
      total: clientBookings.length,
      approved: clientBookings.filter(b => b.status === 'approved').length,
      pending: clientBookings.filter(b => b.status === 'pending').length,
      latest: clientBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    }
  }

  const toggleExpand = (clientId: string) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Clients</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No clients registered yet</p>
        ) : (
          users.map((user) => {
            const bookingData = getClientBookings(user.id)
            return (
              <div key={user.id} className="py-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{bookingData.total} Bookings</Badge>
                        {bookingData.pending > 0 && (
                          <Badge className="bg-amber-100 text-amber-800">
                            {bookingData.pending} Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    {expandedClientId === user.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </Button>
                </div>

                {/* Expanded Client Details */}
                {expandedClientId === user.id && (
                  <div className="mt-3 pl-14 space-y-3">
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Account Created: {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">User ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    {bookingData.total > 0 ? (
                      <>
                        <h4 className="font-medium mt-3">Booking History</h4>
                        <div className="space-y-2 mt-2">
                          {bookingData.latest && (
                            <div className="p-3 border rounded-md bg-muted/50">
                              <p className="font-medium">Latest Booking</p>
                              <p className="text-sm">{bookingData.latest?.service} • {new Date(bookingData.latest?.date).toLocaleDateString()}</p>
                              <Badge className={bookingData.latest?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                                {bookingData.latest?.status}
                              </Badge>
                            </div>
                          )}
                          {bookingData.total > 1 && (
                            <Button variant="link" size="sm" className="px-0">
                              View all {bookingData.total} bookings
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">No bookings yet</p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
