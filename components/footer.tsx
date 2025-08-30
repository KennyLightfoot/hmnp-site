import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  const services = [
    { name: "Mobile Notary", href: "/booking?service=mobile" },
    { name: "RON Services", href: "/ron" },
    { name: "Loan Signing", href: "/booking?service=loan-signing" },
    { name: "Business Services", href: "/business" },
  ]

  const company = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Service Areas", href: "/service-areas" },
    { name: "Pricing", href: "/pricing" },
  ]

  const legal = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund-policy" },
  ]

  const socialLinks = [
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "Instagram", href: "#", icon: Instagram },
  ]

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary-foreground flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">HM</span>
                </div>
                <span className="font-bold text-lg">Houston Mobile Notary Pros</span>
              </Link>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                Professional mobile notary services throughout the Houston area. Licensed, bonded, and insured for your
                peace of mind.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-foreground/60" />
                <span>Serving Houston & 60-mile radius</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-foreground/60" />
                <span>(713) 555-0123</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-foreground/60" />
                <span>info@houstonmobilenotary.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary-foreground/60" />
                <span>7AM-9PM Daily</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA & Social */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Ready to Get Started?</h3>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/booking">Book Now</Link>
              </Button>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-primary-foreground/60">
            © 2025 Houston Mobile Notary Pros. All rights reserved.
          </div>
          <div className="flex space-x-6">
            {legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
