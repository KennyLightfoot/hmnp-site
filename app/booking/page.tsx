"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, FileText, Shield, Zap } from "lucide-react"

const services = [
  {
    id: "quick-stamp",
    name: "Quick-Stamp Local",
    price: 50,
    description: "Perfect for single documents and quick notarizations",
    features: ["Up to 1 document", "Up to 2 notary stamps", "10-mile radius from 77591", "Same-day availability"],
    icon: Zap,
    popular: false,
    restrictions: "Single document limit strictly enforced",
  },
  {
    id: "standard",
    name: "Standard Mobile",
    price: 75,
    description: "Most popular choice for general notary needs",
    features: ["Up to 4 documents", "Up to 2 signers", "20-mile radius from 77591", "Flexible scheduling"],
    icon: FileText,
    popular: true,
    restrictions: "Additional fees apply for extra documents",
  },
  {
    id: "extended",
    name: "Extended Hours",
    price: 100,
    description: "Evening and weekend service when you need it",
    features: ["Up to 4 documents", "Up to 2 signers", "30-mile radius from 77591", "7am-9pm daily availability"],
    icon: Clock,
    popular: false,
    restrictions: "Premium pricing for convenience",
  },
  {
    id: "loan-signing",
    name: "Loan Signing",
    price: 150,
    description: "Specialized service for real estate transactions",
    features: ["Unlimited documents", "Up to 4 signers", "2-hour appointment window", "Certified loan signing agent"],
    icon: Shield,
    popular: false,
    restrictions: "No HELOC documents (no office space)",
  },
  {
    id: "ron",
    name: "RON Services",
    price: 25,
    description: "24/7 remote online notarization from anywhere",
    features: ["$25 per session", "$5 per notary seal", "24/7 availability", "Texas-compliant platform"],
    icon: MapPin,
    popular: false,
    restrictions: "Requires valid ID and stable internet",
  },
]

const BookingStartBeacon = dynamic(() => import("@/components/analytics/BookingStartBeacon"), { ssr: false })

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get("service")
  const [selectedService, setSelectedService] = useState<string | null>(preselectedService)

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
  }

  const handleContinue = () => {
    if (selectedService) {
      router.push(`/booking/details?service=${selectedService}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BookingStartBeacon />
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-2">Select Your Notary Service</h1>
            <p className="text-primary-foreground/90">
              Choose the service that best fits your needs. All services include licensed, insured notary with ID
              verification.
            </p>
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon
              const isSelected = selectedService === service.id

              return (
                <Card
                  key={service.id}
                  className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected ? "ring-2 ring-primary shadow-lg" : "hover:ring-1 hover:ring-muted-foreground/20"
                  }`}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  {service.popular && (
                    <Badge className="absolute -top-2 left-4 bg-accent text-accent-foreground">Most Popular</Badge>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-primary">${service.price}</span>
                          {service.id === "ron" && <span className="text-sm text-muted-foreground">+ $5/seal</span>}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm">{service.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-4">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <strong>Note:</strong> {service.restrictions}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Continue Button */}
          <div className="mt-12 text-center">
            <Button size="lg" onClick={handleContinue} disabled={!selectedService} className="px-8 py-3 text-lg">
              Continue with Selected Service
            </Button>

            {selectedService && (
              <p className="mt-4 text-sm text-muted-foreground">
                Selected: <strong>{services.find((s) => s.id === selectedService)?.name}</strong>
              </p>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 border-t pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Licensed & Insured</h3>
                <p className="text-sm text-muted-foreground">Texas-licensed notary with full liability coverage</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Extended Hours</h3>
                <p className="text-sm text-muted-foreground">Available 7am-9pm daily, including weekends</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Mobile Service</h3>
                <p className="text-sm text-muted-foreground">We come to you anywhere in the Houston area</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
