import Link from "next/link"
import { ChevronRight, Clock, MapPin, CheckCircle, Shield, Users, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EstimatorStrip from "@/components/EstimatorStrip"
import { SERVICES_CONFIG } from "@/lib/services/config"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Extended Hours Mobile Notary in Houston",
  description:
    "Book an emergency mobile notary with guaranteed two-hour response windows from 7am–9pm anywhere in Greater Houston.",
  keywords: "extended-hours notary Houston, urgent notary Houston, same day notary, emergency mobile notary",
  alternates: {
    canonical: `${BASE_URL}/services/extended-hours-notary`,
  },
  openGraph: {
    title: "Extended Hours Mobile Notary in Houston",
    description: "Emergency notarization with two-hour response windows across Greater Houston.",
    url: `${BASE_URL}/services/extended-hours-notary`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Priority Mobile Notary Service by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Extended Hours Mobile Notary in Houston",
    description: "Urgent notarization available 7am–9pm with two-hour dispatch windows.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const prioritySchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Extended Hours Mobile Notary",
  description:
    "Priority mobile notary with 2-hour response windows available 7am-9pm across Greater Houston.",
  serviceType: "Mobile Notary",
  url: "https://houstonmobilenotarypros.com/services/extended-hours-notary",
  provider: {
    "@type": "LocalBusiness",
    name: "Houston Mobile Notary Pros",
    url: "https://houstonmobilenotarypros.com",
    telephone: "+1-832-617-4285",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77591",
      addressCountry: "US",
    },
  },
  areaServed: [
    { "@type": "City", name: "Houston", addressRegion: "TX", addressCountry: "US" },
    { "@type": "City", name: "Pearland", addressRegion: "TX", addressCountry: "US" },
    { "@type": "City", name: "Sugar Land", addressRegion: "TX", addressCountry: "US" },
    { "@type": "City", name: "Missouri City", addressRegion: "TX", addressCountry: "US" },
  ],
  offers: {
    "@type": "Offer",
    price: "100.00",
    priceCurrency: "USD",
    availability: "https://schema.org/LimitedAvailability",
    description: "Priority notary arrival within a 2-hour window, travel up to 30 miles included.",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Priority Notary Enhancements",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Weekend Surcharge",
        price: "40.00",
        priceCurrency: "USD",
        availability: "https://schema.org/LimitedAvailability",
      },
      {
        "@type": "Offer",
        name: "Additional Documents",
        price: "10.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Additional Signers",
        price: "5.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "247",
  },
}

export default function PriorityServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(prioritySchema) }}
      />
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#A52A2A]">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/services" className="hover:text-[#A52A2A]">Services</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Priority Package</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Priority Mobile Notary
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-red-100">
            Urgent notarization with guaranteed 2-hour response
          </p>
          <p className="text-lg mb-8 text-red-100 max-w-3xl mx-auto">
            When time is critical, count on our rapid response. We deliver swift notarization with calm, clarity, and precision—available 7am to 9pm daily.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking?service=priority">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Book Priority Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white bg-transparent hover:bg-white hover:text-primary"
            >
                Emergency Contact
              </Button>
            </Link>
          </div>
          <div className="max-w-3xl mx-auto mt-6">
            <EstimatorStrip defaultMode="MOBILE" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Service Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-secondary flex items-center">
                  <Zap className="mr-3 h-6 w-6 text-primary" />
                  Service Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Our Priority Service Package is your solution for urgent notarization needs. With a guaranteed 2-hour response time from 7am to 9pm daily, we ensure your critical documents are addressed without delay while maintaining complete professional calm and precision.
                </p>
                <p>
                  This premium service ensures your time-sensitive documents are notarized with both speed and meticulous accuracy. Even under tight deadlines or last-minute requests, our Priority Service delivers peace of mind, knowing every detail is handled correctly.
                </p>
                <p>
                  All notaries are commissioned by the state of Texas, carry E&O insurance, and follow strict protocols to ensure validity of every notarization—even when time is limited.
                </p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    2-Hour Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Guaranteed arrival within 2 hours of your request, 7am to 9pm daily including weekends.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <MapPin className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Extended Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Service includes travel up to 30 miles (from 77591). Tiered travel applies 31–50 miles.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Real-Time Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">SMS notifications with ETA and arrival updates for complete peace of mind and planning.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Shield className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Professional Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Fast service without compromise—maintaining precision and calm professionalism under pressure.</p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147] text-center">
                  Priority Service Pricing
                </CardTitle>
                <p className="text-center text-gray-600 mt-2">Premium service for urgent needs</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-[#A52A2A] to-[#8B0000] text-white p-8 rounded-lg text-center mb-6">
                  <h3 className="text-3xl font-bold mb-4">${SERVICES_CONFIG.EXTENDED_HOURS.basePrice} <span className="text-sm text-white/80 ml-1"><a href="#travel-tiers" className="underline">See travel tiers</a></span></h3>
                  <p className="text-xl mb-6">Flat fee for priority service</p>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="font-semibold mb-3">Included:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• 2-hour response guarantee</li>
                        <li>• Up to {SERVICES_CONFIG.EXTENDED_HOURS.maxDocuments} documents</li>
                        <li>• Up to 2 signers</li>
                        <li>• Service 7am-9pm daily</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Additional Options:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Extra signers: $10 each</li>
                        <li>• Extra documents: $5 each</li>
                        <li>• 30-mile included travel (tiers 31–40 +$45; 41–50 +$65)</li>
                        <li>• Real-time SMS updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Link href="/booking?service=priority">
                    <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                      Request Priority Service
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* When to Choose Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147]">When to Choose Priority Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-[#A52A2A] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8" />
                    </div>
                    <h4 className="font-semibold mb-2">Urgent Deadlines</h4>
                    <p className="text-sm text-gray-600">Critical deadlines that can't wait for standard scheduling</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-[#A52A2A] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8" />
                    </div>
                    <h4 className="font-semibold mb-2">After-Hours Needs</h4>
                    <p className="text-sm text-gray-600">Early mornings, late evenings, or weekend requirements</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-[#A52A2A] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8" />
                    </div>
                    <h4 className="font-semibold mb-2">Last-Minute Requests</h4>
                    <p className="text-sm text-gray-600">Sudden notarization needs with minimal advance notice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <Card className="border-[#A52A2A] border-2">
              <CardHeader>
                <CardTitle className="text-lg text-[#A52A2A]">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-[#002147]">Priority Line</p>
                  <p className="text-gray-700 text-lg font-bold">(281) 404-2019</p>
                </div>
                <div>
                  <p className="font-semibold text-[#002147]">Available</p>
                  <p className="text-gray-700">7am - 9pm Daily</p>
                </div>
                <Link href="/booking?service=priority">
                  <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Service Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Priority Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 2-hour response guarantee</li>
                  <li>• 7am-9pm availability</li>
                  <li>• Weekend service included</li>
                  <li>• 30-mile included travel</li>
                  <li>• Real-time SMS updates</li>
                  <li>• Professional precision</li>
                  <li>• E&O insurance coverage</li>
                </ul>
              </CardContent>
            </Card>

            {/* Common Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Urgent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Real estate closings</li>
                  <li>• Legal deadlines</li>
                  <li>• Medical directives</li>
                  <li>• Business contracts</li>
                  <li>• Court documents</li>
                  <li>• Financial papers</li>
                  <li>• Travel documents</li>
                  <li>• Emergency POAs</li>
                </ul>
              </CardContent>
            </Card>

            {/* Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Quick Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start">
                    <div className="bg-[#A52A2A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</div>
                    <div>
                      <p className="font-semibold">Call or Book</p>
                      <p className="text-gray-600">Request priority service</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#A52A2A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</div>
                    <div>
                      <p className="font-semibold">Confirmation</p>
                      <p className="text-gray-600">Get ETA within 15 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#A52A2A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</div>
                    <div>
                      <p className="font-semibold">Arrival</p>
                      <p className="text-gray-600">Notary arrives within 2 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#A52A2A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">4</div>
                    <div>
                      <p className="font-semibold">Complete</p>
                      <p className="text-gray-600">Fast, precise notarization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#002147] text-center mb-8">Priority Service FAQ</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">How quickly can you arrive?</h3>
                <p className="text-gray-700">We guarantee arrival within 2 hours of your confirmed request, available 7am to 9pm daily including weekends.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">What's the coverage area?</h3>
                <p className="text-gray-700">We cover up to 50 miles from 77591. Travel tiers: 0–20 mi included (Standard), 21–30 +$25, 31–40 +$45, 41–50 +$65.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">Do you provide weekend service?</h3>
                <p className="text-gray-700">Yes, Priority Service is available 7 days a week from 7am to 9pm at the same flat rate with no weekend surcharge.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">How do I track your arrival?</h3>
                <p className="text-gray-700">You'll receive real-time SMS updates with ETA confirmation and arrival notifications for complete peace of mind.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
