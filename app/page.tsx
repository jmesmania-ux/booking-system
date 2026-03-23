'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf, Clock, MapPin, Star, ArrowRight, Phone, Mail, MapPinIcon } from 'lucide-react'

const SERVICES = [
  {
    title: 'Swedish Massage',
    description: 'Classic relaxation technique with long, flowing strokes to ease tension and promote overall wellness.',
    icon: '🌿',
  },
  {
    title: 'Shiatsu',
    description: 'Traditional Japanese pressure point therapy that balances energy flow and relieves deep muscle tension.',
    icon: '🎋',
  },
  {
    title: 'Thai Massage',
    description: 'Dynamic stretching and rhythmic pressure to improve flexibility and energize your body.',
    icon: '🌸',
  },
  {
    title: 'Combination',
    description: 'A personalized blend of techniques tailored to your specific needs and preferences.',
    icon: '✨',
  },
]

const FEATURES = [
  {
    icon: MapPin,
    title: 'Home and Hotel Services',
    description: 'Enjoy your massage in the comfort of your own space',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book sessions that fit your busy lifestyle',
  },
  {
    icon: Star,
    title: 'Expert Therapist',
    description: 'Certified professional with years of experience',
  },
]

const PRICING = [
  { duration: '60 minutes', price: '₱600' },
  { duration: '+15 minutes', price: '₱150' },
  { duration: '+30 minutes', price: '₱250' },
]

const REVIEWS = [
  {
    name: 'Maria Santos',
    rating: 5,
    massage: 'Swedish Massage',
    review: 'Amazing experience! John is a true professional. The Swedish massage was exactly what I needed. Highly recommended!',
  },
  {
    name: 'Carlos Reyes',
    rating: 5,
    massage: 'Thai Massage',
    review: 'Best massage I\'ve ever had. The flexibility and energy I gained from the Thai massage is incredible. Will book again!',
  },
  {
    name: 'Angela Fernandez',
    rating: 5,
    massage: 'Shiatsu',
    review: 'Professional, punctual, and incredibly skilled. The Shiatsu massage relieved my back pain completely.',
  },
  {
    name: 'Roberto Dela Cruz',
    rating: 5,
    massage: 'Combination Massage',
    review: 'Love the personalized approach. The combination massage was tailored perfectly to my needs. Booking my next session soon!',
  },
  {
    name: 'Lisa Mendoza',
    rating: 5,
    massage: 'Swedish Massage',
    review: 'Exceptional service! John\'s professionalism and attention to detail made me feel completely relaxed. Worth every peso!',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-6">
              <Leaf className="w-4 h-4" />
              King Massage Therapy
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Relax. Recharge. We Come to You.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Experience therapeutic massage tailored to your needs, delivered to your doorstep by "King", a certified professional with years of expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base" asChild>
                <Link href="/book">
                  Book Your Session
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link href="#services">View Services</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Business Info Section */}
        <section className="py-16 px-4 bg-card border-y">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">King's Massage</h2>
              <p className="text-muted-foreground text-lg mb-8">Professional Home Service Massage</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <MapPinIcon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-sm text-muted-foreground">San Rosa, Laguna, Philippines</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Phone className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Mobile</h3>
                  <p className="text-sm text-muted-foreground">+63 9XX XXX XXXX</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Mail className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground">kingmassage.therapy@gmail.com</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Clock className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Hours</h3>
                  <p className="text-sm text-muted-foreground">Mon-Sun: 8:30 AM - 3:00 SM</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold mb-2">🧑‍💼 Business Owner</h3>
              <p className="text-muted-foreground mb-4">King</p>
              <h3 className="font-semibold mb-2">📋 Service Type</h3>
              <p className="text-muted-foreground">Home service massage (client location required)</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 px-4 bg-card">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Services</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Choose from our range of therapeutic massage treatments, each designed to address your unique wellness needs.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {SERVICES.map((service) => (
                <Card key={service.title} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <span className="text-3xl mb-4 block">{service.icon}</span>
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">💰 Pricing</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Transparent and competitive pricing for all our massage services.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {PRICING.map((item, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold mb-4">{item.duration}</h3>
                    <p className="text-4xl font-bold text-primary">{item.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="bg-primary/5 rounded-lg border border-primary/10 p-6">
              <h3 className="font-semibold mb-4">💳 Payment Methods Accepted</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>✅ GCash</div>
                <div>✅ Bank Transfer</div>
                <div>✅ Cash</div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 px-4 bg-card">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">⭐ Customer Reviews</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                See what our satisfied clients have to say about their experience with King Massage Therapy.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REVIEWS.map((review, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-primary mb-2">{review.massage}</p>
                    <p className="text-sm text-muted-foreground mb-4">"{review.review}"</p>
                    <p className="font-semibold text-sm">— {review.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Feel Better?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Take the first step towards relaxation and wellness. Book your personalized massage session today with John Michael Sawal.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/book">
                Schedule Your Appointment
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">King's Massage</span>
              </div>
              <p className="text-sm text-muted-foreground">Professional home service massage in Laguna</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📍 San Jose, Laguna, Philippines</li>
                <li>📞 +63 9XX XXX XXXX</li>
                <li>📧 kingmassage.therapy@gmail.com</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hours</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Mon - Sun</li>
                <li>8:30 AM - 10:00 PM</li>
                <li>By appointment only</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 King Massage Therapy. All rights reserved. Professional massage services by "King".</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
