import { Header } from '@/components/header'
import { BookingForm } from '@/components/booking/booking-form'
import { Leaf } from 'lucide-react'

export const metadata = {
  title: 'Book Your Session | Serenity Touch',
  description: 'Schedule your personalized massage therapy session with our easy booking system.',
}

export default function BookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-4">
              <Leaf className="w-4 h-4" />
              Easy Booking
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Book Your Session</h1>
            <p className="text-muted-foreground">
              Follow the steps below to schedule your massage
            </p>
          </div>
          
          <BookingForm />
        </div>
      </main>
    </div>
  )
}
