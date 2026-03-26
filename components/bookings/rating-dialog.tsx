'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Loader2 } from "lucide-react"

interface RatingDialogProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  serviceName: string
}

export function RatingDialog({ isOpen, onClose, bookingId, serviceName }: RatingDialogProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return
    setIsSubmitting(true)
    
    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    onClose()
    alert(`Thanks for rating your ${serviceName} session!`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
        <DialogHeader className="items-center">
          <DialogTitle className="text-xl font-bold">Rate your Session</DialogTitle>
          <DialogDescription className="text-center">
            How was your {serviceName} experience?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-2 py-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="transition-transform active:scale-90"
            >
              <Star 
                className={`w-10 h-10 ${
                  (hover || rating) >= star 
                  ? "fill-amber-400 text-amber-400" 
                  : "text-gray-200"
                } transition-colors`} 
              />
            </button>
          ))}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0 || isSubmitting}
            className="w-full rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold h-12"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
