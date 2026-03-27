'use client'

import { useBookingStore } from '@/lib/booking-store'
import { StepIndicator } from './step-indicator'
import { StepService } from './step-service'
import { StepPreferences } from './step-preferences' // New Import
import { StepDateTime } from './step-datetime'
import { StepContact } from './step-contact'
import { StepReview } from './step-review'

const STEPS = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Preferences' }, // Added Step
  { number: 3, label: 'Schedule' },
  { number: 4, label: 'Contact' },
  { number: 5, label: 'Review' },
]

export function BookingForm() {
  const { currentStep } = useBookingStore()

  return (
    <div className="w-full max-w-lg mx-auto pb-10">
      <StepIndicator currentStep={currentStep} steps={STEPS} />
      
      <div className="mt-6">
        {currentStep === 1 && <StepService />}
        {currentStep === 2 && <StepPreferences />} 
        {currentStep === 3 && <StepDateTime />}
        {currentStep === 4 && <StepContact />}
        {currentStep === 5 && <StepReview />}
      </div>
    </div>
  )
}
