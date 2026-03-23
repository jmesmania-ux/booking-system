'use client'

import { useBookingStore } from '@/lib/booking-store'
import { StepIndicator } from './step-indicator'
import { StepService } from './step-service'
import { StepDateTime } from './step-datetime'
import { StepContact } from './step-contact'
import { StepReview } from './step-review'

const STEPS = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Schedule' },
  { number: 3, label: 'Details' },
  { number: 4, label: 'Review' },
]

export function BookingForm() {
  const { currentStep } = useBookingStore()

  return (
    <div className="w-full max-w-lg mx-auto">
      <StepIndicator currentStep={currentStep} steps={STEPS} />
      
      <div className="mt-6">
        {currentStep === 1 && <StepService />}
        {currentStep === 2 && <StepDateTime />}
        {currentStep === 3 && <StepContact />}
        {currentStep === 4 && <StepReview />}
      </div>
    </div>
  )
}
