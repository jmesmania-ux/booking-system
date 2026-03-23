'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  steps: { number: number; label: string }[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                currentStep > step.number
                  ? 'bg-primary text-primary-foreground'
                  : currentStep === step.number
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                'mt-2 text-xs font-medium text-center',
                currentStep >= step.number
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2 transition-all duration-300',
                currentStep > step.number ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
