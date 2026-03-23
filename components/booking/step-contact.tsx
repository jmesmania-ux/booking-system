'use client'

import { useBookingStore } from '@/lib/booking-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Phone, MapPin } from 'lucide-react'

export function StepContact() {
  const { formData, updateFormData, nextStep, prevStep } = useBookingStore()

  const isValid = formData.name.trim() && formData.mobile.trim() && formData.location.trim()

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-base font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Mobile Number
          </Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="Enter your mobile number"
            value={formData.mobile}
            onChange={(e) => updateFormData({ mobile: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Service Location
          </Label>
          <Textarea
            id="location"
            placeholder="Enter your address where you'd like the massage"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Our therapist will come to your location
          </p>
        </div>
      </div>

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
          Review Booking
        </Button>
      </div>
    </div>
  )
}
