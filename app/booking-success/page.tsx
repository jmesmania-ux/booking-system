import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Calendar, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Booking Confirmed | Serenity Touch',
  description: 'Your massage therapy session has been successfully booked.',
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-lg">
          <Card className="overflow-hidden">
            <div className="bg-primary/10 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Booking Submitted!</h1>
              <p className="text-muted-foreground">
                Your appointment request has been received
              </p>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <h2 className="font-semibold">What happens next?</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Review & Approval</p>
                      <p className="text-sm text-muted-foreground">
                        Our therapist will review your booking request within 24 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Payment Instructions</p>
                      <p className="text-sm text-muted-foreground">
                        Once approved, you&apos;ll receive payment details via the app chat.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Confirmation</p>
                      <p className="text-sm text-muted-foreground">
                        After payment verification, your booking will be confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button asChild>
                  <Link href="/my-bookings">
                    <Calendar className="mr-2 w-4 h-4" />
                    View My Bookings
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/my-bookings">
                    <MessageCircle className="mr-2 w-4 h-4" />
                    Chat with Therapist
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
