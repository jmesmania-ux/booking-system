'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Booking } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { MoreHorizontal, Check, X, MessageCircle } from 'lucide-react'
import { ChatDialog } from '@/components/chat/chat-dialog'

interface BookingsTableProps {
  bookings: (Booking & { users: { email: string } })[]
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function BookingsTable({ bookings: initialBookings }: BookingsTableProps) {
  const router = useRouter()
  const [bookings, setBookings] = useState(initialBookings)
  const [updating, setUpdating] = useState<string | null>(null)
  const [chatUserId, setChatUserId] = useState<string | null>(null)
  const supabase = createClient()

  const updateBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    setUpdating(bookingId)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)

      if (error) throw error

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      )
      router.refresh()
    } catch (error) {
      console.error('Failed to update booking:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.mobile}</p>
                      </div>
                    </TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>
                      <div>
                        <p>{format(parseISO(booking.date), 'MMM d, yyyy')}</p>
                        <p className="text-sm text-muted-foreground">{booking.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.duration + booking.extra_minutes} min
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate">{booking.location}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[booking.status]} variant="secondary">
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={updating === booking.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {booking.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => updateBookingStatus(booking.id, 'approved')}
                              >
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateBookingStatus(booking.id, 'rejected')}
                              >
                                <X className="mr-2 h-4 w-4 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => setChatUserId(booking.user_id)}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ChatDialog 
        open={!!chatUserId} 
        onOpenChange={(open) => !open && setChatUserId(null)} 
        userId={chatUserId || ''}
        isAdmin
      />
    </>
  )
}
