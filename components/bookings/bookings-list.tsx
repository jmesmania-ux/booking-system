'use client'

import React, { useState } from 'react' // ✅ Added React import
import type { Booking } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { format, parseISO, startOfDay, isBefore, isSameDay } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  MessageCircle, 
  CheckCircle, 
  Clock3, 
  XCircle, 
  Star,
  Activity, // New: for Pressure
  Target    // New: for Focus Area
} from 'lucide-react'
import { ChatDialog } from '@/components/chat/chat-dialog'
import { CancelDialog } from './cancel-dialog' 
import { RatingDialog } from './rating-dialog' 
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface BookingsListProps {
  bookings: Booking[]
  userId: string
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800', // Synced with King's Massage branding
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-slate-100 text-slate-800',
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
  const [selectedBooking, setSelectedBooking] = useState<{id: string, service: string} | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const safeParseDate = (dateStr: string) => {
    const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`
    return parseISO(normalized)
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
  const upcomingBookings = bookings.filter(b => !['cancelled', 'completed'].includes(b.status) && (isSameDay(safeParseDate(b.date), today) || !isBefore(safeParseDate(b.date), today)))
  const pastBookings = bookings.filter(b => ['cancelled', 'completed'].includes(b.status) || (isBefore(safeParseDate(b.date), today) && !isSameDay(safeParseDate(b.date), today)))

  if (bookings.length === 0) {
    return (
      <Empty icon={Calendar} title="No bookings yet" description="Book your first massage session to get started">
        <Button asChild><a href="/book">Book Now</a></Button>
      </Empty>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20 pt-4">
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-emerald-100 p-2 rounded-full">
            <Clock3 className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Upcoming Sessions</h2>
        </div>
        
        <div className="space-y-6">
          {upcomingBookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onChatOpen={() => { setSelectedBooking({id: booking.id, service: booking.service}); setChatOpen(true); }} 
              onCancel={() => { setSelectedBooking({id: booking.id, service: ''}); setIsCancelModalOpen(true); }}
            />
          ))}
        </div>
      </section>

      {pastBookings.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <div className="bg-slate-100 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Past Activity</h2>
          </div>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onChatOpen={() => { setSelectedBooking({id: booking.id, service: booking.service}); setChatOpen(true); }} 
                onRate={() => { setSelectedBooking({id: booking.id, service: booking.service}); setIsRatingModalOpen(true); }}
                isPast 
              />
            ))}
          </div>
        </section>
      )}

      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} userId={userId} bookingId={selectedBooking?.id || null} serviceName={selectedBooking?.service || "Support"} />
      <CancelDialog isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={handleConfirmCancel} isLoading={isSubmitting} />
      {selectedBooking && <RatingDialog isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)} bookingId={selectedBooking.id} serviceName={selectedBooking.service} />}
    </div>
  )
}

function BookingCard({ booking, onChatOpen, onCancel, onRate, isPast = false }: any) {
  const canCancel = !isPast && (booking.status === 'pending' || booking.status === 'approved')
  const canRate = booking.status === 'completed'

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 border-none rounded-[2rem]",
      isPast ? "bg-slate-50/50 opacity-80" : "bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100"
    )}>
      {!isPast && <div className="h-1.5 bg-emerald-500 w-full" />}
      <CardContent className="p-6">
        <div className="flex flex-col gap-5">
          {/* Service Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-2xl", isPast ? "bg-slate-100" : "bg-emerald-50")}>
                <Sparkles className={cn("w-5 h-5", isPast ? "text-slate-400" : "text-emerald-600")} />
              </div>
              <div>
                <span className="font-bold text-lg block leading-tight text-slate-900">{booking.service}</span>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{booking.location}</span>
                </div>
              </div>
            </div>
            <Badge className={cn(
              STATUS_STYLES[booking.status as keyof typeof STATUS_STYLES],
              "border-none px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
            )}>
              {STATUS_LABELS[booking.status as keyof typeof STATUS_LABELS]}
            </Badge>
          </div>
          
          {/* ✅ New: Session Preferences (Pressure & Focus) */}
          <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pressure</p>
                <p className="text-xs font-bold text-slate-700 capitalize">{booking.pressure_preference || 'No Preference'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Target className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Focus</p>
                <p className="text-xs font-bold text-slate-700 capitalize">{booking.focus_area?.replace('-', ' ') || 'Full Body'}</p>
              </div>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className={cn("grid grid-cols-2 gap-3 p-3 rounded-2xl", isPast ? "bg-slate-200/20" : "bg-slate-50")}>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              {format(parseISO(booking.date.includes('T') ? booking.date : `${booking.date}T00:00:00`), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              {booking.time} ({booking.duration}m)
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 h-11 text-slate-700" onClick={onChatOpen}>
              <MessageCircle className="w-4 h-4 mr-2" /> Chat
            </Button>

            {canRate && (
              <Button className="flex-1 rounded-2xl font-bold bg-amber-400 hover:bg-amber-500 text-amber-950 h-11" onClick={onRate}>
                <Star className="w-4 h-4 mr-2 fill-amber-950" /> Rate
              </Button>
            )}

            {canCancel && (
              <Button variant="ghost" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold h-11" onClick={onCancel}>
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
