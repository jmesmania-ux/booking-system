import { create } from 'zustand'
import type { BookingFormData, ServiceType } from './types'

interface BookingStore {
  currentStep: number
  formData: BookingFormData
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  updateFormData: (data: Partial<BookingFormData>) => void
  resetForm: () => void
}

const initialFormData: BookingFormData = {
  name: '',
  mobile: '',
  location: '',
  service: 'Swedish' as ServiceType,
  date: null,
  time: '',
  duration: 60,
  extraMinutes: 0,
}

export const useBookingStore = create<BookingStore>((set) => ({
  currentStep: 1,
  formData: initialFormData,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  resetForm: () => set({ currentStep: 1, formData: initialFormData }),
}))
