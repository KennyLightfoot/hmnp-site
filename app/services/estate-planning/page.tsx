import Link from "next/link"
import { ChevronRight, Clock, MapPin, CheckCircle, Shield, Users, FileText, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Estate Planning Notary Houston | Comprehensive Package | Houston Mobile Notary Pros",
  description:
    "Comprehensive estate planning notary services in Houston. Professional notarization for wills, trusts, POAs, and more. Up to 10 documents, 4 signers included.",
  keywords:
    "estate planning notary Houston, will notarization, trust notary, POA notary, mobile estate planning, Houston estate notary, comprehensive estate package, will and trust notary",
  alternates: {
    canonical: '/services/estate-planning',
  },
  openGraph: {
    title: "Estate Planning Notary Package | Houston Mobile Notary Pros",
    description: "Secure your legacy with our comprehensive estate planning notary package. Professional handling of wills, trusts, POAs, and estate documents.",
    url: `${BASE_URL}/services/estate-planning`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Estate Planning Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Estate Planning Notary Houston | Secure Your Legacy | HMNP",
    description: "Professional estate planning notary services in Houston. Comprehensive package for wills, trusts, POAs, and more. Mobile service to your location.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function EstatePlanningServicePage() {
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
            <span className="text-gray-900">Estate Planning Package</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#002147] to-[#003366] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Estate Planning Package
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Secure your legacy with comprehensive estate document notarization
          </p>
          <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
            Professional, compassionate handling of your most important documents. From wills and trusts to powers of attorney, we ensure your legacy is properly secured with meticulous care and attention to detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking?service=estate-planning">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                Book Estate Planning Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
                Get Consultation
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
                  Comprehensive Estate Planning Package
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Our Estate Planning Package is designed to provide comprehensive notarization services for all your estate planning documents in one convenient session. Whether you're creating your first will or updating complex trust arrangements, we handle your most sensitive documents with the utmost care and professionalism.
                </p>
                <p>
                  This specialized service accommodates up to 10 documents and 4 signers, making it perfect for individuals, couples, and families who need multiple estate documents notarized. We understand the importance of these documents and approach each signing with compassion, patience, and meticulous attention to detail.
                </p>
                <p>
                  All notaries are commissioned by the state of Texas, carry comprehensive E&O insurance, and follow strict protocols to ensure the validity and legal compliance of every estate document.
                </p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <FileText className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Comprehensive Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Up to 10 documents including wills, trusts, powers of attorney, healthcare directives, and other estate planning instruments.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Users className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Multiple Signers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Accommodates up to 4 signers, perfect for couples, families, and complex estate arrangements requiring multiple parties.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Home className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Mobile Convenience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">We come to your home, office, or preferred location for privacy and comfort during this important process.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Flexible Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Available 7 days a week with extended hours to accommodate your schedule and family needs.</p>
                </CardContent>
              </Card>
            </div>

            {/* Document Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147]">
                  Documents We Handle
                </CardTitle>
                <p className="text-gray-600 mt-2">Common estate planning documents included in our package</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-[#002147]">Primary Estate Documents:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Last Will and Testament</li>
                      <li>• Living Trust (Revocable/Irrevocable)</li>
                      <li>• Pour-Over Will</li>
                      <li>• Trust Amendments</li>
                      <li>• Codicils to Wills</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-[#002147]">Powers of Attorney & Directives:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• General Power of Attorney</li>
                      <li>• Durable Financial POA</li>
                      <li>• Medical Power of Attorney</li>
                      <li>• Advance Healthcare Directive</li>
                      <li>• HIPAA Authorization</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> We provide notarization services only. For legal advice or document preparation, please consult with a qualified estate planning attorney.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147] text-center">
                  Estate Planning Package Pricing
                </CardTitle>
                <p className="text-center text-gray-600 mt-2">Comprehensive service for your peace of mind</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-[#002147] to-[#003366] text-white p-8 rounded-lg text-center mb-6">
                  <h3 className="text-3xl font-bold mb-4">$250</h3>
                  <p className="text-xl mb-6">Complete Estate Planning Package</p>
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="font-semibold mb-3">Package Includes:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Up to 10 estate documents</li>
                        <li>• Up to 4 signers included</li>
                        <li>• Mobile service to your location</li>
                        <li>• Extended appointment time</li>
                        <li>• Professional document handling</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Additional Options:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Extra documents: $10 each</li>
                        <li>• Extra signers: $15 each</li>
                        <li>• Extended travel: $0.50/mile</li>
                        <li>• Weekend/holiday: +$40</li>
                        <li>• After-hours: +$30</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Link href="/booking?service=estate-planning">
                    <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                      Book Estate Planning Package
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Process Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147]">
                  Our Estate Planning Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">1</div>
                    <div>
                      <h4 className="font-semibold text-[#002147] mb-2">Consultation & Scheduling</h4>
                      <p className="text-gray-700 text-sm">We discuss your needs, document count, and schedule a convenient appointment at your preferred location.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">2</div>
                    <div>
                      <h4 className="font-semibold text-[#002147] mb-2">Document Preparation</h4>
                      <p className="text-gray-700 text-sm">Ensure all documents are properly prepared by your attorney and all signers have valid identification ready.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">3</div>
                    <div>
                      <h4 className="font-semibold text-[#002147] mb-2">Professional Notarization</h4>
                      <p className="text-gray-700 text-sm">Our certified notary arrives on time, verifies identities, witnesses signatures, and completes all notarial acts with precision.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#A52A2A] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">4</div>
                    <div>
                      <h4 className="font-semibold text-[#002147] mb-2">Completion & Next Steps</h4>
                      <p className="text-gray-700 text-sm">All documents are properly executed and returned to you with instructions for safekeeping and next steps.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Quick Service Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-[#A52A2A]" />
                  <span>Available 7 days a week</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-[#A52A2A]" />
                  <span>Mobile service to your location</span>
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4 text-[#A52A2A]" />
                  <span>Up to 10 documents included</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4 text-[#A52A2A]" />
                  <span>Up to 4 signers included</span>
                </div>
                <div className="flex items-center text-sm">
                  <Shield className="mr-2 h-4 w-4 text-[#A52A2A]" />
                  <span>Fully insured & certified</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  Have questions about your estate planning documents? Our team is here to help guide you through the process.
                </p>
                <Link href="/contact">
                  <Button className="w-full bg-[#002147] hover:bg-[#001a38] text-white">
                    Contact Us
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Related Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Related Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/services/standard" className="block text-sm text-[#A52A2A] hover:underline">
                  Standard Notary Services
                </Link>
                <Link href="/services/extended" className="block text-sm text-[#A52A2A] hover:underline">
                  Extended Hours Notary
                </Link>
                <Link href="/services/business" className="block text-sm text-[#A52A2A] hover:underline">
                  Business Notary Solutions
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 