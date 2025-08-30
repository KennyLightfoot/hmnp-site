import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Video, FileText, Clock, Users, CheckCircle } from "lucide-react"
import { SwipeableServices } from "@/components/mobile/swipeable-services"

export function ServicesSection() {
  const services = [
    {
      icon: MapPin,
      title: "Mobile Standard",
      subtitle: "from $75",
      description: "Professional mobile notary service that comes to your location.",
      features: [
        "For one client, On-site",
        "Priority arrival windows at any location",
        "Up to 20 Travel Credit Guarantee",
      ],
      buttonText: "Book Now",
      buttonVariant: "destructive" as const,
      popular: false,
      href: "/booking?service=mobile",
    },
    {
      icon: Clock,
      title: "Extended Mobile (Urgent)",
      subtitle: "from $125",
      description: "Priority service with extended hours and faster response times.",
      features: ["30 mins included", "2-3 day", "Up to 30 Travel Credit Guarantee"],
      buttonText: "Book Now",
      buttonVariant: "default" as const,
      popular: false,
      href: "/booking?service=extended",
    },
    {
      icon: FileText,
      title: "Loan Signing",
      subtitle: "from $175",
      description: "Specialized loan document signing with certified expertise.",
      features: ["Loan packages: 24 hours", "On-site included", "Experienced loan document and wire"],
      buttonText: "Book Now",
      buttonVariant: "default" as const,
      popular: false,
      href: "/booking?service=loan-signing",
    },
    {
      icon: Video,
      title: "Remote Online Notarization (RON)",
      subtitle: "from $35",
      description: "Secure online notarization available 24/7 from anywhere.",
      features: ["Texas compliant, credential analysis", "SSL encrypted", "Identity verification", "24/7 availability"],
      buttonText: "Book Now",
      buttonVariant: "default" as const,
      popular: false,
      href: "/ron",
    },
  ]

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:hidden">
          <SwipeableServices />
        </div>

        <div className="hidden md:block">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {services.map((service) => {
              const IconComponent = service.icon
              return (
                <Card key={service.title} className="relative border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-[#002147]" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
                    <div className="text-lg font-bold text-[#A52A2A]">{service.subtitle}</div>
                    <CardDescription className="text-sm text-gray-600">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className={`w-full ${
                        service.buttonVariant === "destructive"
                          ? "bg-[#A52A2A] hover:bg-[#A52A2A]/90 text-white"
                          : "bg-[#002147] hover:bg-[#002147]/90 text-white"
                      }`}
                    >
                      <Link href={service.href}>{service.buttonText}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Essential Services</h3>
            <p className="text-sm text-gray-600">
              Flexible rescheduling: Full refund with 4-hour notice making it easy to adjust your schedule.
            </p>
          </div>
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Priority Services</h3>
            <p className="text-sm text-gray-600">
              Live support: Real-time during service hours, quick support if timing shifts.
            </p>
          </div>
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-[#A52A2A] rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Need Same-Day Service?</h3>
            <p className="text-sm text-gray-600">Call us at (832) 777-0000</p>
          </div>
        </div>
      </div>
    </section>
  )
}
