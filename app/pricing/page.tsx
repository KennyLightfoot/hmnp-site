import Link from "next/link"
import { Metadata } from "next"
import dynamic from "next/dynamic"
import { Calculator, DollarSign, MapPin, Clock, Shield, Star, CheckCircle, Zap, Users, Award, FileText, ArrowRight, BadgeCent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PricingFAQ from "@/components/pricing/PricingFAQ"
import StickyMobileCTA from "@/components/ui/StickyMobileCTA"
import PricingFunnelTracker from "@/components/analytics/PricingFunnelTracker"
import GuaranteeStrip from "@/components/guarantees/GuaranteeStrip"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://houstonmobilenotarypros.com"

const SimplePricingCalculator = dynamic(() => import("@/components/pricing/SimplePricingCalculator"), {
  loading: () => (
    <div className="h-64 w-full rounded-2xl border border-dashed border-gray-200 bg-gray-100 animate-pulse" />
  )
})

const ServiceComparisonTable = dynamic(() => import("@/components/pricing/ServiceComparisonTable"), {
  loading: () => (
    <div className="h-96 w-full rounded-2xl border border-dashed border-gray-200 bg-gray-100 animate-pulse" />
  )
})

const TrustBadges = dynamic(() => import("@/components/ui/TrustBadges"), {
  loading: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`trust-badge-skeleton-${index}`}
          className="h-24 rounded-2xl border border-dashed border-gray-200 bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  )
})

const pricingServiceLinks = [
  { href: "/services/mobile-notary", label: "Standard Mobile Notary" },
  { href: "/services/extended-hours-notary", label: "Extended Hours/Emergency" },
  { href: "/services/loan-signing-specialist", label: "Loan Signing Specialist" },
  { href: "/services/remote-online-notarization", label: "Remote Online Notarization" },
  { href: "/services/business", label: "Business Notary Programs" },
]

const pricingCityLinks = [
  { href: "/service-areas/houston", label: "Houston" },
  { href: "/service-areas/pearland", label: "Pearland" },
  { href: "/service-areas/league-city", label: "League City" },
  { href: "/service-areas/galveston", label: "Galveston" },
  { href: "/service-areas/pasadena", label: "Pasadena" },
]

export const metadata: Metadata = {
  title: "Mobile Notary Pricing in Houston",
  description:
    "Review transparent pricing for mobile notary, loan signing, extended-hours, and online notarization services across Greater Houston.",
  keywords: ["mobile notary pricing", "Houston notary costs", "loan signing fees", "notary travel fees"],
  alternates: {
    canonical: `${BASE_URL}/pricing`,
  },
  openGraph: {
    title: "Mobile Notary Pricing in Houston",
    description: "Compare every Houston Mobile Notary Pros package with transparent fees and no surprises.",
    url: `${BASE_URL}/pricing`,
  },
}

export const revalidate = 86400

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Houston Mobile Notary Pricing",
  description:
    "Transparent, upfront pricing for mobile notary, loan signing, and remote online notarization services across the Houston metro area.",
  url: "https://houstonmobilenotarypros.com/pricing",
  serviceType: [
    "Mobile Notary",
    "Loan Signing",
    "Remote Online Notarization",
  ],
  areaServed: [
    { "@type": "City", name: "Houston", addressRegion: "TX", addressCountry: "US" },
    { "@type": "City", name: "Pearland", addressRegion: "TX", addressCountry: "US" },
    { "@type": "City", name: "Sugar Land", addressRegion: "TX", addressCountry: "US" },
    { "@type": "City", name: "Missouri City", addressRegion: "TX", addressCountry: "US" },
    { "@type": "City", name: "Galveston", addressRegion: "TX", addressCountry: "US" },
  ],
  provider: {
    "@type": "LocalBusiness",
    name: "Houston Mobile Notary Pros",
    url: "https://houstonmobilenotarypros.com",
    telephone: "+1-832-617-4285",
    image: "https://houstonmobilenotarypros.com/logo.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77591",
      addressCountry: "US",
    },
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Mobile Notary Packages",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Standard Mobile Notary",
        description: "Professional mobile notary with travel up to 20 miles included.",
        price: "75.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Service",
          name: "Standard Mobile Notary",
          serviceType: "Mobile Notary",
        },
      },
      {
        "@type": "Offer",
        name: "Extended Hours Mobile Notary",
        description: "Evening and weekend availability with 30 miles of travel included.",
        price: "125.00",
        priceCurrency: "USD",
        availability: "https://schema.org/LimitedAvailability",
        itemOffered: {
          "@type": "Service",
          name: "Extended Hours Mobile Notary",
          serviceType: "Mobile Notary",
        },
      },
      {
        "@type": "Offer",
        name: "Loan Signing Specialist",
        description: "Certified loan signing agent for mortgage packages with FedEx drop included.",
        price: "175.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Service",
          name: "Loan Signing Service",
          serviceType: "Loan Signing",
        },
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "247",
  },
}

const pricingBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${BASE_URL}/`
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: `${BASE_URL}/pricing`
    }
  ]
}

export default function PricingPage() {
  return (
    <main className="min-h-dvh pb-28 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingBreadcrumbSchema) }}
      />
      <PricingFunnelTracker />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#002147]/5 via-[#A52A2A]/5 to-[#002147]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-[#002147] tracking-tight mb-6">
            Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Same-day mobile notary, flawlessly executed, or we pay the redraw fee. Clear, upfront pricing with no hidden fees—see exactly what you'll pay before you book.
          </p>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.9★ Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Same-Day Available</span>
            </div>
          </div>

          {/* Quick Pricing Overview */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="border-2 border-[#A52A2A] relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-[#A52A2A] text-white px-3 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-[#002147]">Standard Mobile Notary</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-[#A52A2A] mb-2">$75</div>
                <p className="text-sm text-gray-600">Professional document notarization</p>
                <div className="text-xs text-gray-500 mt-2">≤20 miles • 4 documents • 2 signers</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-[#002147]">Extended Hours</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-[#A52A2A] mb-2">$125</div>
                <p className="text-sm text-gray-600">Flexible scheduling & same-day</p>
                <div className="text-xs text-gray-500 mt-2">≤30 miles • 4 documents • 2 signers</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-[#002147]">Loan Signing Specialist</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-[#A52A2A] mb-2">$175</div>
                <p className="text-sm text-gray-600">Certified loan signings</p>
                <div className="text-xs text-gray-500 mt-2">≤30 miles • Full package • FedEx included</div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] h-12 px-8" asChild>
              <Link href="/booking">
                <Calculator className="h-5 w-5 mr-2" />
                Get Instant Quote
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="#calculator">
                <DollarSign className="h-5 w-5 mr-2" />
                Try Pricing Calculator
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Guarantee Strip */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <GuaranteeStrip variant="banner" className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-[#002147]/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#002147] mb-4 text-center">What to Expect</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="flex items-start space-x-2">
                    <FileText className="h-5 w-5 text-[#A52A2A] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#002147]">Documents Ready</p>
                      <p className="text-gray-600">Don't sign beforehand—notary must witness</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <BadgeCent className="h-5 w-5 text-[#A52A2A] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#002147]">Valid ID Required</p>
                      <p className="text-gray-600">Government-issued photo ID for all signers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-[#A52A2A] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#002147]">Professional Service</p>
                      <p className="text-gray-600">On-time arrival, clear guidance, accurate execution</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline text-sm font-medium inline-flex items-center gap-1">
                    Learn more about our process <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Pricing Calculator */}
      <section id="calculator" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SimplePricingCalculator />
          </div>
        </div>
      </section>

      {/* Service Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <ServiceComparisonTable />
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Additional Services & Fees</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understand all potential costs with our transparent fee structure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Travel Fees */}
            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-[#002147]" />
                </div>
                <CardTitle className="text-lg text-[#002147]">Travel Zones</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-3">Beyond included radius (from ZIP 77591)</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>21–30 miles:</span>
                    <span className="font-semibold text-[#A52A2A]">+$25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>31–40 miles:</span>
                    <span className="font-semibold text-[#A52A2A]">+$45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>41–50 miles:</span>
                    <span className="font-semibold text-[#A52A2A]">+$65</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-3 space-y-1">
                  <div>Standard: 20 miles included</div>
                  <div>Extended/Loan: 30 miles included</div>
                </div>
              </CardContent>
            </Card>

            {/* Urgency Fees */}
            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-[#002147]" />
                </div>
                <CardTitle className="text-lg text-[#002147]">Urgency Fees</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Same-day (1-2 hours):</span>
                    <span className="font-semibold text-[#A52A2A]">+$25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Urgent (30-60 min):</span>
                    <span className="font-semibold text-[#A52A2A]">+$50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Weekend service:</span>
                    <span className="font-semibold text-[#A52A2A]">+$40</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document & Signer Fees */}
            <Card className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-[#002147]" />
                </div>
                <CardTitle className="text-lg text-[#002147]">Additional Items</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Extra document:</span>
                    <span className="font-semibold text-[#A52A2A]">+$10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Extra signer:</span>
                    <span className="font-semibold text-[#A52A2A]">+$5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Extra stamp:</span>
                    <span className="font-semibold text-[#A52A2A]">+$5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links to Services & Cities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-2">
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-[#002147] mb-4">Jump to Service Pricing</h2>
            <p className="text-gray-600 mb-6">
              Go straight to the package that matches your situation—mobile, emergency, loan signing, or RON.
            </p>
            <div className="space-y-3">
              {pricingServiceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-2xl border border-white bg-white px-4 py-3 shadow-sm hover:shadow-md transition"
                >
                  <span className="font-medium text-[#002147]">{link.label}</span>
                  <ArrowRight className="h-4 w-4 text-[#A52A2A]" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#002147] mb-4">Popular Cities We Serve</h2>
            <p className="text-gray-600 mb-6">
              Pricing stays transparent no matter where you are in the Houston metro.
            </p>
            <ul className="space-y-3">
              {pricingCityLinks.map((city) => (
                <li key={city.href}>
                  <Link
                    href={city.href}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 hover:bg-gray-50"
                  >
                    <span className="text-[#002147] font-medium">{city.label}</span>
                    <ArrowRight className="h-4 w-4 text-[#A52A2A]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Why Choose Houston Mobile Notary Pros?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional, reliable, and transparent - we're your trusted mobile notary partner
            </p>
          </div>
          <TrustBadges variant="carousel" />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <PricingFAQ />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#002147] to-[#001a38] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Get your documents notarized quickly and professionally. Same-day service available, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] h-12 px-8" asChild>
              <Link href="/booking">
                <Calculator className="h-5 w-5 mr-2" />
                Book Appointment Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 border-white text-white hover:bg-white hover:text-[#002147]" asChild>
              <Link href="/contact">
                <Users className="h-5 w-5 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <StickyMobileCTA
        headline="Instant mobile notary quotes on your phone"
        subheadline="Tap to book online or call for immediate assistance"
        analyticsContext="sticky_mobile_pricing"
      />
    </main>
  )
}


