"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Shield, Star, Phone } from "lucide-react"
import Link from "next/link"

const services = [
  {
    id: "quick-stamp",
    title: "Quick-Stamp Local",
    price: "$50",
    description: "Perfect for single documents",
    features: ["≤1 document", "≤2 stamps", "10-mile radius", "Same day"],
    popular: false,
    icon: "⚡",
  },
  {
    id: "standard",
    title: "Standard Mobile",
    price: "$75",
    description: "Most popular choice",
    features: ["≤4 documents", "≤2 signers", "20-mile radius", "Flexible timing"],
    popular: true,
    icon: "📋",
  },
  {
    id: "extended",
    title: "Extended Hours",
    price: "$100",
    description: "Early morning & evening",
    features: ["≤4 documents", "≤2 signers", "30-mile radius", "7AM-9PM daily"],
    popular: false,
    icon: "🌙",
  },
  {
    id: "loan-signing",
    title: "Loan Signing",
    price: "$150",
    description: "Real estate specialists",
    features: ["Unlimited docs", "≤4 signers", "2 hours included", "Certified LSA"],
    popular: false,
    icon: "🏠",
  },
  {
    id: "ron",
    title: "RON Services",
    price: "$25",
    description: "Remote online notarization",
    features: ["24/7 availability", "$5 per seal", "Secure platform", "No travel needed"],
    popular: false,
    icon: "💻",
  },
]

export function SwipeableServices() {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Our Services</h2>
        <p className="text-muted-foreground">Swipe to explore all options</p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {services.map((service) => (
            <CarouselItem key={service.id} className="pl-2 md:pl-4 basis-[280px] md:basis-1/3">
              <Card className="h-full relative overflow-hidden">
                {service.popular && (
                  <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">Most Popular</Badge>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-accent">{service.price}</span>
                    {service.id === "ron" && <span className="text-sm text-muted-foreground">/session</span>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Fast</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Insured</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>5.0★</span>
                    </div>
                  </div>

                  <Button asChild className="w-full mt-4" variant={service.popular ? "default" : "outline"}>
                    <Link href={`/booking?service=${service.id}`}>Select {service.title}</Link>
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground mb-3">Need help choosing? We're here to help!</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" asChild>
            <a href="tel:+17135550123" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/booking" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Get Quote
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
