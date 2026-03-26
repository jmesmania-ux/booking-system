'use client'

import { useBookingStore } from '@/lib/booking-store'
import { createClient } from '@/lib/supabase/client' 
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react' 
import { useRouter } from 'next/navigation'

export function StepReview() {
  const router = useRouter()
  const { formData, resetForm } = useBookingStore()
  const { calculateTotalDuration } = useBookingStore()
  const totalDuration = calculateTotalDuration()

  const supabase = createClient()

  // --- States ---
  const [showModal, setShowModal] = useState(false)
  const [modalText, setModalText] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- Pricing Logic ---
  const BASE_SERVICE_PRICES = {
    Swedish: 600,
    Shiatsu: 600,
    Thai: 600,
    Combination: 600
  }
  const basePrice = BASE_SERVICE_PRICES[formData.service as keyof typeof BASE_SERVICE_PRICES] || 0
  const extraTimePrice = formData.extraMinutes === 15 ? 100 : formData.extraMinutes === 30 ? 200 : 0
  const addOnPrice = formData.addOnService !== 'None' ? formData.addOnPrice : 0
  const totalPrice = basePrice + extraTimePrice + addOnPrice

  // --- Handle Submission ---
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setModalText('Processing your booking request... please wait.')
      setShowModal(true)

      // 1. Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Authentication required. Please log in to complete your booking.')
      }

      // 2. Validate required fields
      if (!formData.name || !formData.mobile || !formData.date || !formData.time) {
        throw new Error('Missing information. Please ensure Name, Mobile, Date, and Time are filled.')
      }

      // 3. Prepare JSONB data for add-ons
      const addOnsData = formData.addOnService !== 'None' 
        ? [{ name: formData.addOnService, price: formData.addOnPrice, duration_minutes: 15 }]
        : []

      // 4. Insert into Supabase
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          name: formData.name,
          mobile: formData.mobile,
          location: formData.location,
          service: formData.service,
          duration: formData.duration,
          extra_minutes: formData.extraMinutes,
          add_ons: addOnsData, 
          total_price: totalPrice,
          date: formData.date,
          time: formData.time,
          pressure_preference: formData.pressurePreference,
          focus_area: formData.focusArea,
          additional_needs: formData.additionalNeeds,
          special_requests: formData.specialRequests,
          status: 'pending'
        })

      if (error) throw error
      
      // 5. Success Handling
      setIsSuccess(true)
      setModalText('Thank you! Your booking has been confirmed. We look forward to seeing you!')
      resetForm() 
      
    } catch (err: any) {
      console.error('Submission Error:', err) 
      setModalText(err.message || 'We encountered an error. Please try again.')
      setIsSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    if (isSuccess) {
      router.push('/bookings') // Navigates to user history after success
    }
  }

  return (
    <div className="space-y-6 max-w-md mx-auto p-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Review Your Booking</h3>
        <p className="text-sm text-muted-foreground">Confirm your details for King's Massage</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <User className="h-4 w-4" /> Client Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span>{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile:</span>
            <span>{formData.mobile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span>{formData.location}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Schedule & Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Treatment:</span>
            <span>{formData.service} ({totalDuration} mins)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formData.date ? new Date(formData.date).toLocaleDateString('en-PH', {
              year: 'numeric', month: 'long', day: 'numeric'
            }) : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span>{formData.time}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Service:</span>
            <span>₱{basePrice}</span>
          </div>
          {extraTimePrice > 0 && (
            <div className="flex justify-between">
              <span>Extra Time:</span>
              <span>₱{extraTimePrice}</span>
            </div>
          )}
          {addOnPrice > 0 && (
            <div className="flex justify-between">
              <span>Add-on ({formData.addOnService}):</span>
              <span>₱{addOnPrice}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span className="text-green-600">₱{totalPrice.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={() => useBookingStore.getState().prevStep()}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          className="flex-1 bg-green-600 hover:bg-green-700" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          Confirm Booking
        </Button>
      </div>

      {/* Dynamic Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              {isSubmitting ? (
                <Loader2 className="h-14 w-14 text-green-500 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle className="h-14 w-14 text-green-500" />
              ) : (
                <AlertCircle className="h-14 w-14 text-red-500" />
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              {isSubmitting ? 'One Moment...' : isSuccess ? 'Great News!' : 'Booking Failed'}
            </h3>
            
            <p className="text-gray-600 mb-8">{modalText}</p>
            
            {!isSubmitting && (
              <Button 
                className="w-full h-12 text-lg font-medium" 
                onClick={handleClose}
                variant={isSuccess ? 'default' : 'destructive'}
              >
                {isSuccess ? 'View My Bookings' : 'Back to Review'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
