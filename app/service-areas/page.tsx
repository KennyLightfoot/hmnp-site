import Link from "next/link"
import { Metadata } from "next"
import dynamic from "next/dynamic"
import { MapPin, Clock, DollarSign, Users, Star, Shield, CheckCircle, Zap, Phone, Mail, Map, Calculator, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SERVICE_AREAS } from "@/lib/serviceAreas"
import { getBusinessPhoneFormatted, getBusinessTel } from "@/lib/phone"

const TrustBadges = dynamic(() => import("@/components/ui/TrustBadges"), {
  loading: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={`trust-skeleton-${idx}`} className="h-20 rounded-2xl bg-white border border-gray-100 animate-pulse" />
      ))}
    </div>
  ),
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://houstonmobilenotarypros.com"

export const metadata: Metadata = {
  title: "Mobile Notary Service Areas",
  description:
    "Browse all cities and areas we serve for mobile notary and loan signing services throughout Greater Houston and the Gulf Coast. Fast, reliable service in your area.",
  keywords: "Houston mobile notary, service areas, mobile notary near me, notary service areas, Houston metro notary",
  alternates: {
    canonical: `${BASE_URL}/service-areas`,
  },
  openGraph: {
    url: `${BASE_URL}/service-areas`,
    title: "Mobile Notary Service Areas",
    description:
      "Browse all cities and areas we serve for mobile notary and loan signing services throughout Greater Houston and the Gulf Coast. Fast, reliable service in your area.",
  },
}

// Enhanced service area data with local positioning
const enhancedServiceAreas = [
  {
    ...SERVICE_AREAS[0], // Houston
    highlights: ["Downtown business district", "Medical Center", "Galleria area", "Rice University"],
    travelFee: "20 miles included",
    responseTime: "1-2 hours",
    specialNotes: "Premium business district service"
  },
  {
    ...SERVICE_AREAS[1], // Sugar Land
    highlights: ["Sugar Land Town Square", "First Colony", "Riverstone", "Telfair"],
    travelFee: "25 miles included",
    responseTime: "1-3 hours",
    specialNotes: "Family-friendly community service"
  },
  {
    ...SERVICE_AREAS[2], // Katy
    highlights: ["Katy Mills Mall", "Cinco Ranch", "Grand Lakes", "Cross Creek Ranch"],
    travelFee: "30 miles included",
    responseTime: "2-4 hours",
    specialNotes: "Growing suburban area coverage"
  },
  {
    ...SERVICE_AREAS[3], // The Woodlands
    highlights: ["Market Street", "Waterway Square", "Town Center", "Research Forest"],
    travelFee: "35 miles included",
    responseTime: "2-4 hours",
    specialNotes: "Premium residential service"
  },
  {
    ...SERVICE_AREAS[4], // Pearland
    highlights: ["Pearland Town Center", "Shadow Creek Ranch", "Silverlake", "Southfork"],
    travelFee: "25 miles included",
    responseTime: "1-3 hours",
    specialNotes: "South Houston metro coverage"
  },
  {
    ...SERVICE_AREAS[5], // Spring
    highlights: ["Spring Town Center", "Old Town Spring", "Spring Creek", "Northgate"],
    travelFee: "30 miles included",
    responseTime: "2-4 hours",
    specialNotes: "North Houston metro coverage"
  }
]

const highlightedSlugs = enhancedServiceAreas.map(area => area.slug)
const additionalServiceAreas = SERVICE_AREAS.filter(area => !highlightedSlugs.includes(area.slug))

const serviceAreasBreadcrumbSchema = {
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
      name: "Service Areas",
      item: `${BASE_URL}/service-areas`
    }
  ]
}

export default function ServiceAreasIndexPage() {
  return (
    <main className="min-h-dvh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreasBreadcrumbSchema) }}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#002147]/5 via-[#A52A2A]/5 to-[#002147]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-[#002147] tracking-tight mb-6">
            Areas We Serve
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Houston Mobile Notary Pros provides on-site notarization across the Greater Houston region and Gulf Coast. 
            We come to you - no matter where you are in the metro area.
          </p>
          
          {/* Service Highlights */}
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-[#A52A2A]" />
              <span>25+ Mile Radius</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-[#A52A2A]" />
              <span>Same-Day Available</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4 text-[#A52A2A]" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-[#A52A2A]" />
              <span>Licensed & Insured</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] h-12 px-8" asChild>
              <Link href="/booking">
                <MapPin className="h-5 w-5 mr-2" />
                Book Mobile Service
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="#areas">
                <Map className="h-5 w-5 mr-2" />
                View All Areas
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 border-white/70 text-white hover:bg-white hover:text-[#002147]" asChild>
              <Link href={`tel:${getBusinessTel()}`}>
                <Phone className="h-5 w-5 mr-2" />
                Call {getBusinessPhoneFormatted()}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Service Areas Grid */}
      <section id="areas" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Major Service Areas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Click on any area below to see detailed information and get a quote for your location
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {enhancedServiceAreas.map((area, index) => (
              <Card 
                key={area.slug} 
                className="border-2 border-[#002147]/20 hover:border-[#A52A2A]/30 transition-all duration-300 hover:shadow-xl"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-[#002147]" />
                    </div>
                    <Badge className="bg-[#A52A2A] text-white">
                      {area.travelFee}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-[#002147] mb-2">{area.cityName}</CardTitle>
                  <p className="text-sm text-gray-600">{area.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Local Highlights */}
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Local Highlights:</h4>
                    <div className="flex flex-wrap gap-1">
                      {area.highlights.map((highlight, highlightIndex) => (
                        <Badge key={highlightIndex} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Response time:</span>
                      <span className="font-medium text-[#A52A2A]">{area.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Travel included:</span>
                      <span className="font-medium">{area.travelFee}</span>
                    </div>
                  </div>

                  {/* Special Notes */}
                  {area.specialNotes && (
                    <div className="bg-[#002147]/5 p-3 rounded-lg">
                      <p className="text-xs text-[#002147] font-medium">{area.specialNotes}</p>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button className="w-full bg-[#002147] hover:bg-[#001a38]" asChild>
                    <Link href={`/service-areas/${area.slug}`}>
                      <MapPin className="h-4 w-4 mr-2" />
                      View {area.cityName} Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {additionalServiceAreas.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-[#002147] mb-4 text-center">More Cities We Cover</h3>
              <p className="text-gray-600 text-center mb-6 max-w-3xl mx-auto">
                These additional Greater Houston communities are also within our mobile notary radius. Pick your city to view response times and local highlights.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                {additionalServiceAreas.map((area) => (
                  <Link
                    key={area.slug}
                    href={`/service-areas/${area.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 hover:bg-gray-50"
                  >
                    <span className="text-[#002147] font-medium">{area.cityName}</span>
                    <ArrowRight className="h-4 w-4 text-[#A52A2A]" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Travel Fee Calculator */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#002147] mb-4">Travel Fee Calculator</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Not sure if you're in our service area? Check your location and see travel fees
              </p>
            </div>

            <Card className="border-2 border-[#002147]/20">
              <CardHeader className="bg-gradient-to-r from-[#002147]/5 to-[#A52A2A]/5">
                <CardTitle className="text-xl text-[#002147] flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Check Your Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Service Radius from ZIP 77591:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">0–20 miles</span>
                        <Badge className="bg-green-100 text-green-800">Included</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium">21–30 miles</span>
                        <Badge className="bg-yellow-100 text-yellow-800">+$25</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm font-medium">31–40 miles</span>
                        <Badge className="bg-orange-100 text-orange-800">+$45</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium">41–50 miles</span>
                        <Badge className="bg-red-100 text-red-800">+$65</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Get Instant Quote:</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter your ZIP code to get an instant pricing quote for your location
                    </p>
                    <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000]" asChild>
                      <Link href="/pricing#calculator">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Price
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">Why Choose Our Mobile Service?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional, reliable, and convenient - we bring the notary to you
            </p>
          </div>
          <TrustBadges variant="grid" />
        </div>
      </section>

      {/* Coverage Map Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#002147] mb-6">Service Coverage Map</h2>
            <p className="text-xl text-gray-600 mb-6">
              We serve the entire Greater Houston Metropolitan Area and beyond
            </p>

            {/* Live Google Maps embed */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-8 w-full" style={{ height: 360 }}>
              <iframe
                title="Houston Mobile Notary Pros service coverage map"
                width="100%"
                height="360"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?width=100%25&height=360&hl=en&q=Texas+City,+TX+77591&t=&z=9&ie=UTF8&iwloc=B&output=embed"
                aria-label="Map of Houston Mobile Notary Pros service coverage area centered on Texas City, TX 77591"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-[#002147]" />
                </div>
                <h3 className="font-semibold text-[#002147] mb-2">Primary Coverage</h3>
                <p className="text-sm text-gray-600">20-mile radius from ZIP 77591</p>
                <p className="text-xs text-gray-500 mt-1">Standard service included</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-[#A52A2A]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-[#A52A2A]" />
                </div>
                <h3 className="font-semibold text-[#002147] mb-2">Extended Coverage</h3>
                <p className="text-sm text-gray-600">30-mile radius available</p>
                <p className="text-xs text-gray-500 mt-1">Additional travel fees apply</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-[#002147] mb-2">Custom Coverage</h3>
                <p className="text-sm text-gray-600">Beyond 30 miles</p>
                <p className="text-xs text-gray-500 mt-1">Custom quotes available</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#002147] to-[#001a38] text-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Need Service Outside Our Standard Area?</h3>
              <p className="text-gray-200 mb-6">
                We're happy to provide service beyond our standard coverage area. Contact us for a custom quote.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]"
                  asChild
                >
                  <Link href="/contact">
                    <Mail className="h-5 w-5 mr-2" />
                    Request Custom Quote
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]"
                  asChild
                >
                  <Link href={`tel:${getBusinessTel()}`}>
                    <Phone className="h-5 w-5 mr-2" />
                    Call {getBusinessPhoneFormatted()}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002147] mb-6">Ready to Book Your Mobile Notary Service?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We come to you - whether you're at home, work, or anywhere in the Houston metro area
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] h-12 px-8" asChild>
              <Link href="/booking">
                <MapPin className="h-5 w-5 mr-2" />
                Book Mobile Service
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="/pricing">
                <DollarSign className="h-5 w-5 mr-2" />
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
