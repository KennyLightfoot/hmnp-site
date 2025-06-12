import Link from "next/link"
import { ChevronRight, Clock, MapPin, CheckCircle, Shield, Users, Moon, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Extended Hours Notary Services | Houston Mobile Notary Pros",
  description:
    "Urgent & after-hours mobile notary (7 am–9 pm daily). When 9–5 won't cut it, we're there. Fast, precise, and reliable service for your time-sensitive documents.",
  keywords:
    "extended hours notary, after-hours notary, same-day notary, urgent notary Houston, Houston mobile notary, 7am-9pm notary, weekend notary",
  alternates: {
    canonical: '/services/extended',
  },
  openGraph: {
    title: "Extended Hours Notary | Houston Mobile Notary Pros",
    description: "Need a notary outside standard hours? Our Extended Hours service (7 am-9 pm daily) has you covered.",
    url: `${BASE_URL}/services/extended`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'Extended Hours Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Extended Hours Notary | Houston Mobile Notary Pros",
    description: "Don\'t let time constraints stop you. Get professional notary services from 7 am to 9 pm daily in Houston.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function ExtendedHoursNotaryPage() {
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
            <span className="text-gray-900">Extended Hours</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#002147] to-[#003366] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Extended Hours Notary
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Professional notarization when you need it most
          </p>
          <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
            Life doesn't stop at 5 PM. Our Extended Hours service provides professional notarization from 7 AM to 9 PM daily, including weekends and most holidays.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking?service=extended">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                Book Extended Hours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
                Get Quote
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
                  <Moon className="mr-3 h-6 w-6 text-[#A52A2A]" />
                  Service Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Our Extended Hours Notary service is designed for those moments when you need professional notary services outside typical business hours. Operating from 7 AM to 9 PM daily, we provide the same meticulous care and attention to detail for your time-sensitive documents.
                </p>
                <p>
                  Whether it's a last-minute business agreement, an urgent personal document, or any situation requiring notarization outside standard hours, count on Houston Mobile Notary Pros to deliver professional service when you need it most.
                </p>
                <p>
                  All notaries are commissioned by the state of Texas, carry E&O insurance, and maintain the same strict quality standards regardless of the hour.
                </p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Extended Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Available 7 AM to 9 PM daily, including weekends and most holidays.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <MapPin className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Mobile Convenience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Full mobile service to your location, perfect for urgent after-hours needs.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Same-Day Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Often available for same-day requests, subject to availability and scheduling.</p>
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
                  <p className="text-gray-700">Maintaining precision and professionalism regardless of the hour or urgency.</p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147] text-center">
                  Extended Hours Pricing
                </CardTitle>
                <p className="text-center text-gray-600 mt-2">Premium service for after-hours convenience</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
                  <h3 className="text-3xl font-bold text-[#A52A2A] mb-4">$100+</h3>
                  <p className="text-lg mb-6 text-gray-700">Starting price for extended hours service</p>
                  <div className="text-left max-w-md mx-auto">
                    <h4 className="font-semibold mb-3 text-[#002147]">Includes:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Travel up to 15 miles</li>
                      <li>• 1-2 notarized signatures</li>
                      <li>• Service 7 AM - 9 PM daily</li>
                      <li>• Weekend availability</li>
                      <li>• Same professional standards</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-4">
                      Additional fees may apply for extra mileage, complex documents, or extended wait times.
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <Link href="/booking?service=extended">
                    <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                      Book Extended Hours Service
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* When to Choose Extended Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147]">When to Choose Extended Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-[#002147]">Perfect for:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Urgent document signing deadlines</li>
                      <li>• Real estate closings after business hours</li>
                      <li>• Hospital or healthcare facility signings</li>
                      <li>• Airport or travel-related notarizations</li>
                      <li>• Weekend legal document needs</li>
                      <li>• Any situation requiring flexible service</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-[#002147]">Service Hours:</h4>
                    <div className="bg-[#002147] text-white p-4 rounded-lg">
                      <p className="text-lg font-bold mb-2">7 AM - 9 PM</p>
                      <p className="text-sm">Monday through Sunday</p>
                      <p className="text-sm">Including most holidays</p>
                      <p className="text-xs mt-2 text-blue-200">
                        Subject to availability - book as early as possible for best results
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="border-[#A52A2A] border-2">
              <CardHeader>
                <CardTitle className="text-lg text-[#A52A2A]">Urgent Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-[#002147]">For Immediate Needs</p>
                  <p className="text-gray-700 text-lg font-bold">(281) 404-2019</p>
                </div>
                <div>
                  <p className="font-semibold text-[#002147]">Available</p>
                  <p className="text-gray-700">7 AM - 9 PM Daily</p>
                </div>
                <Link href="/booking?service=extended">
                  <Button className="w-full bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                    Book Extended Hours
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Service Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Extended Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 7 AM - 9 PM availability</li>
                  <li>• Weekend service included</li>
                  <li>• Holiday availability</li>
                  <li>• Same-day requests welcome</li>
                  <li>• Mobile service to your location</li>
                  <li>• Professional precision guaranteed</li>
                  <li>• E&O insurance coverage</li>
                </ul>
              </CardContent>
            </Card>

            {/* Common Situations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Common Situations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Real estate closings</li>
                  <li>• Medical facility visits</li>
                  <li>• Travel documents</li>
                  <li>• Business contracts</li>
                  <li>• Legal deadlines</li>
                  <li>• Emergency POAs</li>
                  <li>• Healthcare directives</li>
                  <li>• Financial documents</li>
                </ul>
              </CardContent>
            </Card>

            {/* Why Choose Us */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Why Choose Us</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Texas-commissioned notaries</li>
                  <li>• Professionalism guaranteed</li>
                  <li>• Clarity under pressure</li>
                  <li>• Full E&O insurance</li>
                  <li>• Dedicated to convenience</li>
                  <li>• Flexible scheduling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#002147] text-center mb-8">Extended Hours FAQ</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">What are your exact extended hours?</h3>
                <p className="text-gray-700">Our Extended Hours service is available 7 days a week, from 7:00 AM to 9:00 PM, including weekends and most holidays, subject to availability.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">Is same-day service available?</h3>
                <p className="text-gray-700">While we strive to accommodate urgent requests and often provide same-day service, availability depends on current schedule and location. We recommend booking as soon as possible.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">How does pricing compare to standard hours?</h3>
                <p className="text-gray-700">Extended Hours service starts at $100+, reflecting the premium availability outside standard business hours. Standard service starts at $75. The increased price covers flexibility and readiness for urgent requests.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">Do you provide holiday service?</h3>
                <p className="text-gray-700">Yes, we're available on most holidays during our extended hours. Holiday service may include additional fees. Please call to confirm availability for specific holidays.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 