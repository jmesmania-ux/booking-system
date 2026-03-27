'use client'

import { useState } from 'react'
import type { Booking } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
// Added 'addHours' to helper fix potential UTC shifts if needed, though 'T00:00:00' is better
import { format, parseISO, startOfDay, isBefore, isSameDay } from 'date-fns'
import { Calendar, Clock, MapPin, Sparkles, MessageCircle, CheckCircle, Clock3, XCircle, Star } from 'lucide-react'
import { ChatDialog } from '@/components/chat/chat-dialog'
import { CancelDialog } from './cancel-dialog' 
import { RatingDialog } from './rating-dialog' 
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BookingsListProps {
  bookings: Booking[]
  userId: string
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
}

const STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function BookingsList({ bookings, userId }: BookingsListProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  
  // Track the full booking object for the dialogs
  const [selectedBooking, setSelectedBooking] = useState<{id: string, service: string} | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Helper to safely parse dates without timezone shifts
  const safeParseDate = (dateStr: string) => {
    // If it's just YYYY-MM-DD, append time to force local interpretation
    const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`
    return parseISO(normalized)
  }

  const handleOpenChat = (id: string, service: string) => {
    setSelectedBooking({ id, service })
    setChatOpen(true)
  }

  const handleOpenCancelModal = (id: string) => {
    setSelectedBooking({ id, service: '' })
    setIsCancelModalOpen(true)
  }

  const handleOpenRatingModal = (id: string, service: string) => {
    setSelectedBooking({ id, service })
    setIsRatingModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return
    try {
      setIsSubmitting(true)
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', selectedBooking.id)
      if (error) throw error
      setIsCancelModalOpen(false)
      router.refresh()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
      setSelectedBooking(null)
    }
  }

  const today = startOfDay(new Date())

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = startOfDay(safeParseDate(booking.date as string))
    const isFinalized = booking.status === 'cancelled' || booking.status === 'completed'
    const isUpcomingDate = isSameDay(bookingDate, today) || !isBefore(bookingDate, today)
    return isUpcomingDate && !isFinalized
  })

  const pastBookings = bookings.filter(booking => {
    const bookingDate = startOfDay(safeParseDate(booking.date as string))
    const isFinalized = booking.status === 'cancelled' || booking.status === 'completed'
    const isActuallyPast = isBefore(bookingDate, today) && !isSameDay(bookingDate, today)
    return isFinalized || isActuallyPast
  })

  if (bookings.length === 0) {
    return (
      <Empty icon={Calendar} title="No bookings yet" description="Book your first massage session to get started">
        <Button asChild><a href="/book">Book Now</a></Button>
      </Empty>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-green-100 p-2 rounded-full">
            <Clock3 className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Upcoming Sessions</h2>
        </div>
        
        <div className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onChatOpen={() => handleOpenChat(booking.id, booking.service)} 
                onCancel={() => handleOpenCancelModal(booking.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-3xl bg-gray-50/50 text-muted-foreground">
              <Calendar className="w-8 h-8 mb-2 opacity-20" />
              <p className="font-medium">No upcoming appointments</p>
            </div>
          )}
        </div>
      </section>

      {pastBookings.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <div className="bg-gray-100 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Past & Activity</h2>
          </div>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onChatOpen={() => handleOpenChat(booking.id, booking.service)} 
                onRate={() => handleOpenRatingModal(booking.id, booking.service)}
                isPast 
              />
            ))}
          </div>
        </section>
      )}

      {/* Pass the dynamic bookingId and serviceName to ChatDialog */}
      <ChatDialog 
        open={chatOpen} 
        onOpenChange={setChatOpen} 
        userId={userId} 
        bookingId={selectedBooking?.id || null}
        serviceName={selectedBooking?.service || "Support Chat"}
      />
      
      <CancelDialog 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        onConfirm={handleConfirmCancel} 
        isLoading={isSubmitting} 
      />
      
      {selectedBooking && (
        <RatingDialog
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          bookingId={selectedBooking.id}
          serviceName={selectedBooking.service}
        />
      )}
    </div>
  )
}

function BookingCard({ booking, onChatOpen, onCancel, onRate, isPast = false }: any) {
  const canCancel = !isPast && (booking.status === 'pending' || booking.status === 'approved')
  const canRate = booking.status === 'completed'

  return (
    <Card className={`overflow-hidden transition-all duration-300 border-none rounded-[2rem] ${
      isPast ? 'bg-gray-50/50 opacity-80' : 'bg-white shadow-lg shadow-black/5 ring-1 ring-black/5'
    }`}>
      {!isPast && <div className="h-1.5 bg-green-500 w-full" />}
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${isPast ? 'bg-gray-100' : 'bg-green-50'}`}>
                <Sparkles className={`w-5 h-5 ${isPast ? 'text-gray-400' : 'text-green-600'}`} />
              </div>
              <div>
                <span className="font-bold text-lg block leading-tight">{booking.service}</span>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{booking.location}</span>
                </div>
              </div>
            </div>
            <Badge className={`${STATUS_STYLES[booking.status as keyof typeof STATUS_STYLES]} border-none px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold`}>
              {STATUS_LABELS[booking.status as keyof typeof STATUS_LABELS]}
            </Badge>
          </div>
          
          <div className={`grid grid-cols-2 gap-3 p-3 rounded-2xl ${isPast ? 'bg-gray-200/20' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              {/* Force local interpretation to prevent March 27 becoming March 26 */}
              {format(parseISO(booking.date.includes('T') ? booking.date : `${booking.date}T00:00:00`), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              {booking.time}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button variant="secondary" className="flex-1 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 h-11" onClick={onChatOpen}>
              <MessageCircle className="w-4 h-4 mr-2" /> Chat
            </Button>

            {canRate && (
              <Button 
                className="flex-1 rounded-2xl font-bold bg-amber-400 hover:bg-amber-500 text-amber-950 h-11 shadow-sm"
                onClick={onRate}
              >
                <Star className="w-4 h-4 mr-2 fill-amber-950" /> Rate
              </Button>
            )}

            {canCancel && (
              <Button 
                variant="ghost" 
                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold h-11"
                onClick={onCancel}
              >
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
