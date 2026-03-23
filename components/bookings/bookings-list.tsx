'use client'

import { useState } from 'react'
import type { Booking } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { format, parseISO, isPast } from 'date-fns'
import { Calendar, Clock, MapPin, Sparkles, MessageCircle, CheckCircle, Clock3 } from 'lucide-react'
import { ChatDialog } from '@/components/chat/chat-dialog'

interface BookingsListProps {
  bookings: Booking[]
  userId: string
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

const STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
}

export function BookingsList({ bookings, userId }: BookingsListProps) {
  const [chatOpen, setChatOpen] = useState(false)

  // Separate upcoming and past bookings
  const upcomingBookings = bookings.filter(booking => !isPast(new Date(booking.date)))
  const pastBookings = bookings.filter(booking => isPast(new Date(booking.date)))

  if (bookings.length === 0) {
    return (
      <Empty
        icon={Calendar}
        title="No bookings yet"
        description="Book your first massage session to get started"
      >
        <Button asChild>
          <a href="/book">Book Now</a>
        </Button>
      </Empty>
    )
  }

  return (
    <>
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
          </div>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onChatOpen={() => setChatOpen(true)} />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-muted-foreground">Past Bookings</h2>
          </div>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onChatOpen={() => setChatOpen(true)} isPast />
            ))}
          </div>
        </div>
      )}

      <ChatDialog 
        open={chatOpen} 
        onOpenChange={setChatOpen} 
        userId={userId}
      />
    </>
  )
}

interface BookingCardProps {
  booking: Booking
  onChatOpen: () => void
  isPast?: boolean
}

function BookingCard({ booking, onChatOpen, isPast = false }: BookingCardProps) {
  return (
    <Card className={`overflow-hidden ${isPast ? 'opacity-75' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">{booking.service} Massage</span>
              </div>
              <Badge className={STATUS_STYLES[booking.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.pending} variant="secondary">
                {STATUS_LABELS[booking.status as keyof typeof STATUS_LABELS] || booking.status}
              </Badge>
            </div>
            
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {booking.time} ({(booking.duration || 60) + (booking.extra_minutes || 0)} min)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{booking.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex md:flex-col items-center justify-end gap-2 p-4 md:border-l bg-muted/30">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={onChatOpen}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
