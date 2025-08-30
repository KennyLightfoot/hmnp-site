import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Video, FileText, Clock, DollarSign, Users } from "lucide-react"
import { SwipeableServices } from "@/components/mobile/swipeable-services"

export function ServicesSection() {
  const services = [
    {
      icon: MapPin,
      title: "Mobile Notary",
      description: "We come to your location for convenient, professional notarization services.",
      features: ["Same-day availability", "60-mile service area", "All document types"],
      pricing: "Starting at $50",
      popular: false,
      href: "/booking?service=mobile",
    },
    {
      icon: Video,
      title: "Remote Online Notarization (RON)",
      description: "Secure online notarization available 24/7 from anywhere in Texas.",
      features: ["24/7 availability", "Instant scheduling", "Secure video platform"],
      pricing: "Starting at $25",
      popular: true,
      href: "/ron",
    },
    {
      icon: FileText,
      title: "Loan Signing Specialist",
      description: "Expert handling of mortgage documents, refinances, and real estate closings.",
      features: ["Certified LSS", "Real estate expertise", "Title company approved"],
      pricing: "Flat $150 fee",
      popular: false,
      href: "/booking?service=loan-signing",
    },
  ]

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:hidden">
          <SwipeableServices />
        </div>

        <div className="hidden md:block">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="text-primary border-primary/20">
              Our Services
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-balance">Professional Notary Services</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Choose from our comprehensive range of notary services designed to meet your specific needs, whether you
              need us to come to you or prefer the convenience of online notarization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card
                  key={service.title}
                  className={`relative ${service.popular ? "ring-2 ring-accent shadow-lg" : ""}`}
                >
                  {service.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent">Most Popular</Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{service.pricing}</div>
                    </div>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full" variant={service.popular ? "default" : "outline"}>
                      <Link href={service.href}>{service.popular ? "Get Started" : "Learn More"}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <Clock className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Extended Hours</h3>
            <p className="text-sm text-muted-foreground">Available 7AM-9PM daily for your convenience</p>
          </div>
          <div className="text-center space-y-2">
            <Users className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Multiple Signers</h3>
            <p className="text-sm text-muted-foreground">Handle up to 4 signers per appointment</p>
          </div>
          <div className="text-center space-y-2">
            <DollarSign className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Transparent Pricing</h3>
            <p className="text-sm text-muted-foreground">No hidden fees, flat-rate pricing structure</p>
          </div>
          <div className="text-center space-y-2">
            <FileText className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">All Document Types</h3>
            <p className="text-sm text-muted-foreground">Wills, contracts, affidavits, and more</p>
          </div>
        </div>
      </div>
    </section>
  )
}
