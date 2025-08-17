import Link from "next/link"
import { ChevronRight, Clock, MapPin, CheckCircle, Shield, Users, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SERVICES_CONFIG } from "@/lib/services/config"
import { PRICING_CONFIG } from "@/lib/pricing/base"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Essential Mobile Notary Houston | Stress-Free & Professional | Houston Mobile Notary Pros",
  description:
    "Experience stress-free essential mobile notary services in Houston. We bring calm, clarity, and precision to your wills, POAs, affidavits, and general notarizations. Mon-Fri, 9am-5pm.",
  keywords: "standard notary Houston, mobile notary, general notarization, power of attorney notary, will notary, affidavit notary, Houston notary service, stress-free notary, clear notary process, precise notarization, peace of mind notary",
  alternates: {
    canonical: '/services/standard-notary',
  },
  openGraph: {
    title: "Essential Mobile Notary Package | Houston Mobile Notary Pros",
    description: "Get your essential documents (wills, POAs, etc.) notarized in Houston with calm and precision. Our mobile service ensures a stress-free experience.",
    url: `${BASE_URL}/services/standard-notary`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Essential Mobile Notary Service by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Essential Mobile Notary Package - Houston Mobile Notary Pros",
    description: "Houston's choice for essential mobile notary services. We bring calm, clarity, and professional precision to your standard document needs (wills, POAs). Book your stress-free appointment!",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function EssentialServicePage() {
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
            <span className="text-gray-900">Essential Package</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#002147] to-[#003366] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Essential Mobile Notary
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Professional notarization services for your everyday document needs
          </p>
          <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
            From wills and powers of attorney to affidavits and general documents, we bring calm, clarity, and precision to your doorstep. Experience notarization that gives you peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking?service=essential">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                Book Appointment
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
                  <Shield className="mr-3 h-6 w-6 text-[#A52A2A]" />
                  Service Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Our Essential Mobile Notary Package is designed for individuals and businesses who need professional notary services with the convenience of mobile service. We come to your location, making the notarization process straightforward and stress-free.
                </p>
                <p>
                  Perfect for notarizing wills, powers of attorney, affidavits, and other general documents that require notarization. Our experienced notaries ensure every document is handled with meticulous care and proper execution.
                </p>
                <p>
                  All notaries are commissioned by the state of Texas, carry E&O insurance, and follow strict protocols to ensure the validity of every notarization.
                </p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Available Monday through Friday, 9am to 5pm. Weekend service available with additional fee.</p>
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
                  <p className="text-gray-700">We come to your location within 20 miles (included). Tiered travel applies 21–50 miles.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Document Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Wills, powers of attorney, affidavits, contracts, and all standard notarization needs.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Users className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Professional Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Texas-commissioned notaries with E&O insurance and strict quality protocols.</p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147] text-center">
                  Transparent Pricing
                </CardTitle>
                <p className="text-center text-gray-600 mt-2">Professional service with no hidden fees</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold text-[#002147] mb-2">Essential Service</h3>
                      <p className="text-3xl font-bold text-[#A52A2A] mb-2">${SERVICES_CONFIG.STANDARD_NOTARY.basePrice} <span className="text-sm text-gray-500 ml-1"><a href="#travel-tiers" className="underline text-[#002147]">See travel tiers</a></span></p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• 1-2 documents per signer</li>
                        <li>• Includes travel within {SERVICES_CONFIG.STANDARD_NOTARY.includedRadius} miles</li>
                        <li>• Travel tiers: 21–30 +$25; 31–40 +$45; 41–50 +$65</li>
                        <li>• Monday-Friday, 9am-5pm</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold text-[#002147] mb-2">Two Signers</h3>
                      <p className="text-3xl font-bold text-[#A52A2A] mb-2">$85</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Up to 3 documents per signer</li>
                        <li>• All Essential Service benefits</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold text-[#002147] mb-2">Three Signers</h3>
                      <p className="text-3xl font-bold text-[#A52A2A] mb-2">$95</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Up to 3 documents per signer</li>
                        <li>• All Essential Service benefits</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold text-[#002147] mb-2">Four+ Signers</h3>
                      <p className="text-2xl font-bold text-[#A52A2A] mb-2">Custom Quote</p>
                      <p className="text-sm text-gray-700">Contact us for group pricing</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <Link href="/booking?service=essential">
                    <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                      Book Your Essential Service
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Common Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Common Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Wills & Living Wills</li>
                  <li>• Powers of Attorney</li>
                  <li>• Affidavits</li>
                  <li>• Contracts & Agreements</li>
                  <li>• Real Estate Documents</li>
                  <li>• Healthcare Directives</li>
                  <li>• Financial Documents</li>
                  <li>• Business Forms</li>
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
                  <li>• E&O insurance coverage</li>
                  <li>• Mobile convenience</li>
                  <li>• Professional service</li>
                  <li>• Transparent pricing</li>
                  <li>• Same-day availability</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-[#002147]">Phone</p>
                  <p className="text-gray-700">(281) 404-2019</p>
                </div>
                <div>
                  <p className="font-semibold text-[#002147]">Email</p>
                  <p className="text-gray-700">info@houstonmobilenotarypros.com</p>
                </div>
                <Link href="/contact">
                  <Button className="w-full bg-[#002147] hover:bg-[#003366] text-white">
                    Get Custom Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Additional Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold">Extra Documents</p>
                    <p className="text-gray-600">$5 each</p>
                  </div>
                  <div>
                    <p className="font-semibold">Weekend Service</p>
                    <p className="text-gray-600">+$50 flat fee</p>
                  </div>
                  <div>
                    <p className="font-semibold">Extended Travel</p>
                    <p className="text-gray-600">$0.50/mile beyond 15 miles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#002147] text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">What forms of ID are acceptable?</h3>
                <p className="text-gray-700">We accept government-issued photo IDs such as driver's licenses, passports, military IDs, and state ID cards. The ID must be current and contain a photograph, physical description, signature, and serial number.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">Can you provide legal advice?</h3>
                <p className="text-gray-700">No, as notaries we are prohibited by law from providing legal advice. Our role is strictly to verify identity and witness signatures. For legal advice, please consult with an attorney.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">How long does an appointment take?</h3>
                <p className="text-gray-700">For the Essential Package, most appointments take 15-30 minutes depending on the number of documents and signers.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-700">We accept credit/debit cards (preferred) and cash (exact change required). For corporate clients, we offer billing options for approved accounts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
