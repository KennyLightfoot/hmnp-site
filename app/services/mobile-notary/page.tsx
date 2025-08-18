import Link from "next/link"
import { ChevronRight, MapPin, Clock, CheckCircle, Shield, Users, Car, ArrowRight, Phone, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Mobile Notary Houston | Traveling Notary Near Me | 20-Mile Included + Tiers to 50 mi",
  description:
    "Professional mobile notary services in Houston, Pearland, Sugar Land, Galveston. 20-mile travel included from 77591; fair travel tiers up to 50 miles. We come to you - home, office, hospital. Same-day available.",
  keywords: "mobile notary Houston, mobile notary near me, traveling notary Houston, mobile notary Pearland, mobile notary Sugar Land, mobile notary Galveston, mobile notary services, notary comes to you, on-site notary, home notary services, 77591 mobile notary",
  alternates: {
    canonical: '/services/mobile-notary',
  },
  openGraph: {
    title: "Mobile Notary Services Houston | 20-Mile Included • Tiers to 50 mi",
    description: "Professional mobile notary services in Houston. 20-mile travel included; tiered travel fees up to 50 miles. We travel to your location for convenient, reliable notarization.",
    url: `${BASE_URL}/services/mobile-notary`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mobile Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mobile Notary Services Houston | Traveling Notary | We Come to You",
    description: "Professional mobile notary services in Houston. We travel to your location for convenient, reliable notarization. Same-day service available.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function MobileNotaryServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#A52A2A]">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/services" className="hover:text-[#A52A2A]">Services</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Mobile Notary Services</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#002147] to-[#003366] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Notary near you today — mobile to your door
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            From $75. Same‑day available. 20–30 mi included.
          </p>
          <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
            We come to homes, offices, hospitals, and more across Greater Houston.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking?service=mobile-notary">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                Book Mobile Notary Now - $75+
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="tel:+18326174285">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
                Call Now: (832) 617-4285
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-2 text-xs text-blue-100">
            <Link href="/services/extras#travel-tiers" className="underline">See travel tiers</Link>
          </div>
          
          {/* Trust Signals */}
          <div className="mt-4 flex flex-wrap justify-center items-center gap-3 text-blue-100">
            <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-sm">Same‑day windows</span>
            <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-sm">20–30 mi included</span>
            <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-sm">Transparent pricing</span>
            <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-sm">$1M E&O</span>
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
                <CardTitle className="text-2xl text-[#002147] flex items-center">
                  <Car className="mr-3 h-6 w-6 text-[#A52A2A]" />
                  Mobile Notary Services Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Our mobile notary services eliminate the hassle of traveling to a notary office. We bring professional, certified notarization directly to your location, whether it's your home, office, hospital, senior living facility, or any other convenient location.
                </p>
                <p>
                  Perfect for busy professionals, elderly clients, individuals with mobility challenges, or anyone who values convenience and time savings. Our traveling notary services are available throughout the Greater Houston area.
                </p>
                <p>
                  All mobile notary services include the same Texas-commissioned notaries, E&O insurance coverage, and strict quality protocols that define our standard service - just with the added convenience of coming to you.
                </p>
              </CardContent>
            </Card>

            {/* Why Choose Mobile Notary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147] flex items-center">
                  <Shield className="mr-3 h-6 w-6 text-[#A52A2A]" />
                  Why Choose Mobile Notary Services?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Save Time:</strong> No travel, no waiting rooms, no parking hassles</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Convenience:</strong> Service at your preferred location and time</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Privacy:</strong> Confidential service in your own space</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Flexibility:</strong> Evening and weekend appointments available</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Accessibility:</strong> Perfect for elderly or mobility-challenged clients</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#A52A2A] mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Professional:</strong> Same expertise as office visits</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147]">Mobile Notary Service Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#002147]">General Mobile Notarization</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Wills and estate planning documents</li>
                      <li>• Powers of attorney</li>
                      <li>• Affidavits and sworn statements</li>
                      <li>• Contracts and agreements</li>
                      <li>• Real estate documents</li>
                      <li>• Medical directives</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#002147]">Specialized Mobile Services</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Loan signing (real estate closings)</li>
                      <li>• Hospital and nursing home visits</li>
                      <li>• Business and corporate documents</li>
                      <li>• I-9 employment verification</li>
                      <li>• Apostille preparation</li>
                      <li>• Emergency and after-hours service</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147]">How Mobile Notary Service Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-[#002147]">Book Your Appointment</h4>
                      <p className="text-gray-700">Schedule online or call us. Choose your preferred date, time, and location.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-[#002147]">We Travel to You</h4>
                      <p className="text-gray-700">Our certified notary travels to your specified location with all necessary equipment.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-[#002147]">Professional Service</h4>
                      <p className="text-gray-700">We verify identities, explain documents, and complete notarization properly.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold text-[#002147]">Complete & Secure</h4>
                      <p className="text-gray-700">Documents are properly notarized, sealed, and ready for immediate use.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147] flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-[#A52A2A]" />
                  Mobile Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">We serve the entire Houston metro area (20-mile included; tiers to 50 mi):</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• <strong>Houston</strong> - All districts & neighborhoods</li>
                  <li>• <strong>Pearland</strong> - Our home base (77591)</li>
                  <li>• <strong>Sugar Land</strong> - Fort Bend County</li>
                  <li>• <strong>Galveston</strong> - Island & mainland</li>
                  <li>• <strong>League City</strong> - Clear Lake area</li>
                  <li>• <strong>Pasadena</strong> - East Houston</li>
                  <li>• <strong>Missouri City</strong> - Southwest Houston</li>
                  <li>• <strong>Stafford</strong> - Fort Bend County</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3">Same-day service available. Travel fees included in service area.</p>
              </CardContent>
            </Card>
            
            {/* Quick Service Guarantee */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147] flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-[#A52A2A]" />
                  Service Guarantee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ <strong>Same-Day Service</strong> - Available when you need it</li>
                  <li>✓ <strong>No Travel Fees</strong> - Within 20 miles</li>
                  <li>✓ <strong>$1M E&O Insurance</strong> - Your protection guaranteed</li>
                  <li>✓ <strong>Texas Certified</strong> - Licensed & bonded professionals</li>
                  <li>✓ <strong>Evening & Weekend</strong> - Available 7 days a week</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Customer Testimonial */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147] flex items-center">
                  <Star className="mr-2 h-5 w-5 text-[#A52A2A]" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 italic">"Came to my office in Pearland within 2 hours. Professional, efficient, and saved me a whole day of running around. Highly recommend!"</p>
                    <p className="text-xs text-gray-500 mt-1">- Sarah M., Pearland</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 italic">"Perfect for busy professionals! They handled all my loan documents right at my kitchen table. No travel, no hassle."</p>
                    <p className="text-xs text-gray-500 mt-1">- Mike T., Sugar Land</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Mobile Service Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Standard Mobile</span>
                    <span className="font-semibold text-[#002147]">$75+ <Link href="/services/extras#travel-tiers" className="underline text-sm ml-1">See travel tiers</Link></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Extended Hours</span>
                    <span className="font-semibold text-[#002147]">$100+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Emergency Service</span>
                    <span className="font-semibold text-[#002147]">$150+</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-3">
                    Base pricing includes travel within 20 miles. Beyond that, tiered travel applies: 21–30 +$25; 31–40 +$45; 41–50 +$65. <Link href="/services/extras#travel-tiers" className="underline text-[#002147]">See travel tiers</Link>.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Ready to Book?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/booking?service=mobile-notary">
                  <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Mobile Notary
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                    <Phone className="mr-2 h-4 w-4" />
                    Get Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 