import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addMinutes, format, parse, isBefore, isAfter, setHours, setMinutes } from 'date-fns'

// Configurable working hours (9 AM to 6 PM)
const WORKING_HOURS_START = 9
const WORKING_HOURS_END = 18
const SLOT_INTERVAL = 60 // minutes

// Generate all possible time slots for a day
function generateTimeSlots(): string[] {
  const slots: string[] = []
  let currentTime = setMinutes(setHours(new Date(), WORKING_HOURS_START), 0)
  const endTime = setMinutes(setHours(new Date(), WORKING_HOURS_END), 0)

  while (isBefore(currentTime, endTime)) {
    slots.push(format(currentTime, 'h:mm a'))
    currentTime = addMinutes(currentTime, SLOT_INTERVAL)
  }

  return slots
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateParam = searchParams.get('date')

  if (!dateParam) {
    return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    
    // Get all approved bookings for the requested date
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('time, duration, extra_minutes')
      .eq('date', dateParam)
      .in('status', ['pending', 'approved'])

    if (error) throw error

    // Generate all time slots
    const allSlots = generateTimeSlots()
    
    // Mark slots as unavailable if they conflict with existing bookings
    const slotsWithAvailability = allSlots.map((slotTime) => {
      const slotStart = parse(slotTime, 'h:mm a', new Date())
      
      // Check if this slot conflicts with any existing booking
      const isBooked = bookings?.some((booking) => {
        const bookingStart = parse(booking.time, 'h:mm a', new Date())
        const bookingDuration = booking.duration + (booking.extra_minutes || 0)
        const bookingEnd = addMinutes(bookingStart, bookingDuration)
        
        // Check if slot overlaps with booking
        // A slot is unavailable if it starts during a booking or if a standard session
        // starting at this slot would overlap with an existing booking
        const slotEnd = addMinutes(slotStart, 60) // Assume minimum 60 min session
        
        return (
          (isAfter(slotStart, bookingStart) || slotStart.getTime() === bookingStart.getTime()) && 
          isBefore(slotStart, bookingEnd)
        ) || (
          isAfter(slotEnd, bookingStart) && 
          (isBefore(slotEnd, bookingEnd) || slotEnd.getTime() === bookingEnd.getTime())
        )
      })

      return {
        time: slotTime,
        available: !isBooked,
      }
    })

    return NextResponse.json({ slots: slotsWithAvailability })
  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
