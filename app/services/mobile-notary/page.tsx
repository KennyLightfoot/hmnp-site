import Link from "next/link"
import { ChevronRight, MapPin, Clock, CheckCircle, Shield, Users, Car, ArrowRight, Phone, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Mobile Notary Services | Traveling Notary Houston | We Come to You",
  description:
    "Professional mobile notary services in Houston. We travel to your location - home, office, hospital, or anywhere convenient. Same-day service available 24/7.",
  keywords: "mobile notary, traveling notary, mobile notary services, notary comes to you, mobile notary Houston, traveling notary near me, on-site notary, mobile notary near me, home notary services",
  alternates: {
    canonical: '/services/mobile-notary',
  },
  openGraph: {
    title: "Mobile Notary Services Houston | Traveling Notary | We Come to You",
    description: "Professional mobile notary services in Houston. We travel to your location for convenient, reliable notarization. Same-day service available.",
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
            Mobile Notary Services
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Professional traveling notary services that come to you
          </p>
          <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
            Skip the trip to the notary office. Our mobile notary services bring certified, professional notarization directly to your home, office, hospital, or any location convenient for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking?service=mobile-notary">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                Book Mobile Notary Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
                Get Quote
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
                <p className="text-gray-700 mb-3">We provide mobile notary services throughout:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Houston Metro Area</li>
                  <li>• Galveston County</li>
                  <li>• Harris County</li>
                  <li>• Montgomery County</li>
                  <li>• Fort Bend County</li>
                  <li>• Brazoria County</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3">Travel fees may apply for locations beyond our standard service radius.</p>
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
                    <span className="font-semibold text-[#002147]">$75+</span>
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
                    Base pricing includes travel within 20 miles. Additional fees may apply for extra documents, signers, or extended travel.
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