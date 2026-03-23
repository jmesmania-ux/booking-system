'use client'

import { useBookingStore } from '@/lib/booking-store'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CalendarDays, Clock } from 'lucide-react'
import { addDays, format, isBefore, startOfDay } from 'date-fns'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StepDateTime() {
  const { formData, updateFormData, nextStep, prevStep } = useBookingStore()
  
  const dateParam = formData.date ? format(formData.date, 'yyyy-MM-dd') : ''
  const { data: slotsData, isLoading } = useSWR(
    dateParam ? `/api/availability?date=${dateParam}` : null,
    fetcher
  )

  const timeSlots = slotsData?.slots || []
  const isValid = formData.date && formData.time

  const disabledDays = (date: Date) => {
    const today = startOfDay(new Date())
    const maxDate = addDays(today, 30)
    return isBefore(date, today) || isBefore(maxDate, date)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Select Date
        </Label>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={formData.date || undefined}
            onSelect={(date) => {
              updateFormData({ date: date || null, time: '' })
            }}
            disabled={disabledDays}
            className="rounded-lg border bg-card"
          />
        </div>
      </div>

      {formData.date && (
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Available Times for {format(formData.date, 'MMMM d, yyyy')}
          </Label>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot: { time: string; available: boolean }) => (
                <Button
                  key={slot.time}
                  type="button"
                  variant={formData.time === slot.time ? 'default' : 'outline'}
                  className={cn(
                    'h-10',
                    !slot.available && 'opacity-50 cursor-not-allowed',
                    formData.time === slot.time && 'ring-2 ring-primary/20'
                  )}
                  disabled={!slot.available}
                  onClick={() => updateFormData({ time: slot.time })}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No available slots for this date
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="outline" className="flex-1" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button 
          className="flex-1" 
          size="lg"
          onClick={nextStep}
          disabled={!isValid}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
