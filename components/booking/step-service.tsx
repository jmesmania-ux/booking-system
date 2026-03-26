// FILE: step-service.tsx
'use client'

import { useBookingStore } from '@/lib/booking-store'
import { SERVICES, DURATIONS, EXTRA_MINUTES, type ServiceType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Sparkles, Clock, Plus, MessageSquare, Info, Timer } from 'lucide-react'

// Define add-on services
const ADD_ON_SERVICES = [
  { name: 'None', price: 0 },
  { name: 'Ear Candling', price: 150 },
  { name: 'Hot Stone', price: 200 },
  { name: 'Ventusa', price: 200 },
  { name: 'Fire Massage', price: 200 }
]

export function StepService() {
  const { formData, updateFormData, nextStep, calculateTotalDuration } = useBookingStore()
  const totalDuration = calculateTotalDuration()
  const isValid = formData.service && formData.duration

  return (
    <div className="space-y-6">
      {/* Service Selection */}
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

      {/* Session Duration Section (from SessionDetailsStep) */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Session Duration
        </Label>
        
        <div className="grid grid-cols-2 gap-3">
          {DURATIONS.map((duration) => (
            <Button
              key={duration.value}
              type="button"
              variant={formData.duration === duration.value ? 'default' : 'outline'}
              className={cn('flex-1 min-w-[100px] py-3')}
              onClick={() => updateFormData({ duration: duration.value })}
            >
              {duration.label}
            </Button>
          ))}
        </div>

        {/* Extra Time (Optional) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {}} // Removed state since EXTRA_MINUTES is already handled
            className="flex items-center gap-2 text-sm font-medium text-primary"
          >
            <Plus className="h-4 w-4" />
            Extra Time (Optional)
          </button>

          <div className="flex flex-wrap gap-3">
            {EXTRA_MINUTES.map((extra) => (
              <Button
                key={extra.value}
                type="button"
                variant={formData.extraMinutes === extra.value ? 'default' : 'outline'}
                className="flex-1 min-w-[100px] py-2"
                onClick={() => updateFormData({ extraMinutes: extra.value })}
              >
                {extra.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Total Duration Display */}
        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-md text-primary font-medium">
          <Timer className="h-5 w-5 flex-shrink-0" />
          <div>
            <span>Total Session Duration:</span>
            <span className="text-lg ml-2">{totalDuration} minutes</span>
          </div>
        </div>
      </div>

      {/* Session Preferences Section (from SessionDetailsStep) */}
      <div className="space-y-4 border-t pt-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Session Preferences
        </Label>

        <div className="space-y-3">
          {/* Preferred Pressure Level */}
          <div className="space-y-2">
            <Label className="text-sm">Preferred Pressure Level</Label>
            <Select 
              value={formData.pressurePreference} 
              onValueChange={(value) => updateFormData({ pressurePreference: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pressure level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-preference">No Preference</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="firm">Firm/Deep</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Focus Areas */}
          <div className="space-y-2">
            <Label className="text-sm">Primary Focus Areas</Label>
            <Select 
              value={formData.focusArea} 
              onValueChange={(value) => updateFormData({ focusArea: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-body">Full Body (Even Distribution)</SelectItem>
                <SelectItem value="back-shoulders">Back & Shoulders</SelectItem>
                <SelectItem value="legs-feet">Legs & Feet</SelectItem>
                <SelectItem value="neck-upper-back">Neck & Upper Back</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Needs */}
          <div className="space-y-2">
            <Label className="text-sm">Additional Needs</Label>
            <Select 
              value={formData.additionalNeeds} 
              onValueChange={(value) => updateFormData({ additionalNeeds: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select additional needs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Special Needs</SelectItem>
                <SelectItem value="oil-allergy">Oil Allergy</SelectItem>
                <SelectItem value="table-assistance">Needs Table Setup Help</SelectItem>
                <SelectItem value="quiet-session">Quiet Session (No Conversation)</SelectItem>
                <SelectItem value="aromatherapy">Aromatherapy Preferred</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label className="text-sm">Additional Details (Optional)</Label>
            <Input
              placeholder="Specify allergies, injuries, or extra preferences..."
              value={formData.specialRequests || ''}
              onChange={(e) => updateFormData({ specialRequests: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Add-On Services Section (from SessionDetailsStep) */}
      <div className="space-y-4 border-t pt-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Add-On Services
        </Label>

        {/* Note about additional 15 minutes */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md text-amber-800 text-sm">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p><strong>Important Note:</strong> All add-on services include an additional 15 minutes added to your total session duration.</p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm">Select Add-On (Optional)</Label>
          <Select 
            value={formData.addOnService || 'None'} 
            onValueChange={(value) => {
              const selected = ADD_ON_SERVICES.find(s => s.name === value)
              updateFormData({ addOnService: selected.name, addOnPrice: selected.price })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an add-on service" />
            </SelectTrigger>
            <SelectContent>
              {ADD_ON_SERVICES.map(service => (
                <SelectItem 
                  key={service.name} 
                  value={service.name}
                >
                  {service.name} {service.price > 0 ? `(+₱${service.price})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {formData.addOnService && formData.addOnService !== 'None' && (
            <div className="p-2 bg-green-50 rounded-md text-sm text-green-700">
              ✔ {formData.addOnService} added (+₱{formData.addOnPrice} | +15 minutes to total duration)
            </div>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <Button 
        className="w-full mt-6 py-6 text-base font-medium" 
        onClick={nextStep}
        disabled={!isValid}
      >
        Continue to Schedule
      </Button>
    </div>
  )
}
