'use client'

import { useBookingStore } from '@/lib/booking-store'
import { supabase } from '@/lib/supabase' // Import Supabase client
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast' // For clean notifications (no URL prefix)

// Install react-hot-toast first: npm install react-hot-toast
export function StepReview() {
  const { formData, resetForm } = useBookingStore()
  const { calculateTotalDuration } = useBookingStore()
  const totalDuration = calculateTotalDuration()

  // Calculate pricing (adjust base prices as needed)
  const BASE_SERVICE_PRICES = {
    Swedish: 600,
    Shiatsu: 650,
    Thai: 700,
    Combination: 750
  }
  const basePrice = BASE_SERVICE_PRICES[formData.service as keyof typeof BASE_SERVICE_PRICES] || 0
  const extraTimePrice = formData.extraMinutes === 15 ? 100 : formData.extraMinutes === 30 ? 200 : 0
  const addOnPrice = formData.addOnService !== 'None' ? formData.addOnPrice : 0
  const totalPrice = basePrice + extraTimePrice + addOnPrice

  // Handle booking submission to Supabase
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.mobile || !formData.date || !formData.time) {
        toast.error('Please complete all required fields: Name, Mobile, Date, and Time')
        return
      }

      // Prepare add-ons data for Supabase JSONB column
      const addOnsData = formData.addOnService !== 'None' 
        ? [{ name: formData.addOnService, price: formData.addOnPrice, duration_minutes: 15 }]
        : []

      // Insert booking into Supabase
      const { error } = await supabase
        .from('bookings')
        .insert({
          name: formData.name,
          mobile: formData.mobile,
          location: formData.location,
          service: formData.service,
          duration: formData.duration,
          extra_minutes: formData.extraMinutes,
          add_ons: addOnsData, // JSONB format
          total_price: totalPrice,
          date: formData.date,
          time: formData.time,
          pressure_preference: formData.pressurePreference,
          focus_area: formData.focusArea,
          additional_needs: formData.additionalNeeds,
          special_requests: formData.specialRequests,
          status: 'pending'
        })

      if (error) throw new Error(error.message || 'Failed to save booking')
      
      toast.success('Booking submitted successfully! We’ll contact you shortly.')
      resetForm() // Reset form after success
    } catch (err: any) {
      console.error('Submission Error:', err) // Log to debug
      toast.error(`Booking failed: ${err.message || 'Please try again later'}`)
    }
  }

  return (
    <div className="space-y-6 max-w-md mx-auto p-4">
      <h3 className="text-xl font-semibold text-center">Review Your Booking</h3>
      <p className="text-sm text-muted-foreground text-center">Double-check all details before confirming</p>

      {/* Client Details Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" /> Client Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span>{formData.name || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile:</span>
            <span>{formData.mobile || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span>{formData.location || 'Not provided'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Service Details Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> Service & Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Treatment Type:</span>
            <span>{formData.service || 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Duration:</span>
            <span>{formData.duration || 0} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extra Time:</span>
            <span>{formData.extraMinutes || 0} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Add-On Service:</span>
            <span>{formData.addOnService || 'None'}</span>
          </div>
          <div className="flex justify-between font-medium mt-1">
            <span>Total Duration:</span>
            <span>{totalDuration} minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formData.date ? new Date(formData.date).toLocaleDateString('en-PH', {
              year: 'numeric', month: 'long', day: 'numeric'
            }) : 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span>{formData.time || 'Not selected'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Service Price:</span>
            <span>₱{basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extra Time Charge:</span>
            <span>₱{extraTimePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Add-On Price:</span>
            <span>₱{addOnPrice.toLocaleString()}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-medium text-lg">
            <span>Total Amount:</span>
            <span className="text-green-600">₱{totalPrice.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => useBookingStore.getState().prevStep()}>
          Back
        </Button>
        <Button className="flex-1" onClick={handleSubmit}>
          <CheckCircle className="mr-2 h-4 w-4" /> Submit Booking
        </Button>
      </div>

      {/* Add toast provider (add to your root layout if not already present) */}
      <div className="hidden">
        <toast.Toaster position="top-center" />
      </div>
    </div>
  )
}
