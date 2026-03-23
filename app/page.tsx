'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf, Clock, MapPin, Star, ArrowRight } from 'lucide-react'


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
    title: 'Home Service',
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
              Professional Massage Therapy
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Relax, Restore, Rejuvenate
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Experience therapeutic massage tailored to your needs, delivered to your doorstep by a certified professional.
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

        {/* Features Section */}
        <section className="py-16 px-4 bg-card border-y">
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
        <section id="services" className="py-20 px-4">
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
            <div className="text-center mt-10">
              <Button size="lg" asChild>
                <Link href="/book">
                  Book Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Feel Better?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Take the first step towards relaxation and wellness. Book your personalized massage session today.
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
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-semibold">Serenity Touch</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Professional massage therapy services
          </p>
        </div>
      </footer>
    </div>
  )
}
