'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/lib/booking-store'
import { SERVICES } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { format } from 'date-fns'
import { Sparkles, CalendarDays, Clock, User, Phone, MapPin, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function StepReview() {
  const router = useRouter()
  const { formData, prevStep, resetForm } = useBookingStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const service = SERVICES.find((s) => s.value === formData.service)
  const totalMinutes = formData.duration + formData.extraMinutes

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?redirect=/book')
        return
      }

      const { error: bookingError } = await supabase.from('bookings').insert({
        user_id: user.id,
        name: formData.name,
        mobile: formData.mobile,
        location: formData.location,
        service: formData.service,
        date: formData.date ? format(formData.date, 'yyyy-MM-dd') : null,
        time: formData.time,
        duration: formData.duration,
        extra_minutes: formData.extraMinutes,
        status: 'pending',
      })

      if (bookingError) throw bookingError

      resetForm()
      router.push('/booking-success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            <div className="flex items-start gap-4 p-4">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Treatment</p>
                <p className="font-medium">{service?.label}</p>
                <p className="text-sm text-muted-foreground">{service?.description}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4">
              <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {formData.date ? format(formData.date, 'EEEE, MMMM d, yyyy') : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Time & Duration</p>
                <p className="font-medium">
                  {formData.time} ({totalMinutes} minutes total)
                </p>
                {formData.extraMinutes > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Includes +{formData.extraMinutes} min extra
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-4 p-4">
              <User className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{formData.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4">
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="font-medium">{formData.mobile}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{formData.location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1" 
          size="lg" 
          onClick={prevStep}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          className="flex-1" 
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Submitting...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        By confirming, you agree to our booking terms. Payment details will be sent after approval.
      </p>
    </div>
  )
}
