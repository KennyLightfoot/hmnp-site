import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, FileCheck, CreditCard } from "lucide-react"

export function BookingGuide() {
  const steps = [
    {
      icon: Calendar,
      title: "Schedule Online",
      description: "Choose your service type and preferred time slot using our easy booking system.",
      time: "2 minutes",
    },
    {
      icon: MapPin,
      title: "We Come to You",
      description: "Our licensed notary arrives at your location with all necessary equipment.",
      time: "On-time arrival",
    },
    {
      icon: FileCheck,
      title: "Notarize Documents",
      description: "Professional notarization with proper ID verification and document handling.",
      time: "15-30 minutes",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay securely online or in-person. Digital receipts provided immediately.",
      time: "Instant",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="text-primary border-primary/20">
            How It Works
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-balance">Simple 4-Step Process</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Getting your documents notarized has never been easier. Our streamlined process ensures quick, professional
            service every time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <Card key={step.title} className="relative">
                <CardContent className="p-6 text-center">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  <IconComponent className="h-12 w-12 text-primary mx-auto mb-4 mt-4" />
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {step.time}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
            <Link href="/booking">Schedule Your Appointment</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Same-day appointments available • No setup fees • Satisfaction guaranteed
          </p>
        </div>
      </div>
    </section>
  )
}
