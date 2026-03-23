'use client'

import { useBookingStore } from '@/lib/booking-store'
import { SERVICES, DURATIONS, EXTRA_MINUTES, type ServiceType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { Sparkles, Clock, Plus } from 'lucide-react'

export function StepService() {
  const { formData, updateFormData, nextStep } = useBookingStore()

  const isValid = formData.service && formData.duration

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Select Your Treatment
        </Label>
        <div className="grid gap-3">
          {SERVICES.map((service) => (
            <Card
              key={service.value}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:border-primary/50',
                formData.service === service.value && 'border-primary bg-primary/5 ring-1 ring-primary'
              )}
              onClick={() => updateFormData({ service: service.value as ServiceType })}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <RadioGroup value={formData.service}>
                  <RadioGroupItem value={service.value} id={service.value} />
                </RadioGroup>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{service.label}</p>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Session Duration
        </Label>
        <div className="flex flex-wrap gap-3">
          {DURATIONS.map((duration) => (
            <Button
              key={duration.value}
              type="button"
              variant={formData.duration === duration.value ? 'default' : 'outline'}
              className={cn(
                'flex-1 min-w-[100px]',
                formData.duration === duration.value && 'ring-2 ring-primary/20'
              )}
              onClick={() => updateFormData({ duration: duration.value })}
            >
              {duration.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Extra Time (Optional)
        </Label>
        <div className="flex flex-wrap gap-3">
          {EXTRA_MINUTES.map((extra) => (
            <Button
              key={extra.value}
              type="button"
              variant={formData.extraMinutes === extra.value ? 'default' : 'outline'}
              className="flex-1 min-w-[100px]"
              onClick={() => updateFormData({ extraMinutes: extra.value })}
            >
              {extra.label}
            </Button>
          ))}
        </div>
      </div>

      <Button 
        className="w-full mt-6" 
        size="lg"
        onClick={nextStep}
        disabled={!isValid}
      >
        Continue to Schedule
      </Button>
    </div>
  )
}
