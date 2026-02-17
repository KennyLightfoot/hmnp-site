import Link from "next/link"
import { ChevronRight, Building, Users, Briefcase, Shield, CheckCircle, ArrowRight, Heart, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Business Notary Solutions in Houston",
  description:
    "Corporate and high-volume mobile notary services with block-booking, recurring appointments, and dedicated account support across Houston.",
  keywords:
    "business notary Houston, corporate notary services, volume notarization, recurring notary appointments",
  alternates: {
    canonical: `${BASE_URL}/services/business`,
  },
  openGraph: {
    title: "Business Notary Solutions in Houston",
    description: "Volume and recurring notarization programs that keep your business moving.",
    url: `${BASE_URL}/services/business`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Business Notary Solutions by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Business Notary Solutions in Houston",
    description: "Corporate, healthcare, and legal teams rely on our mobile notary programs with dedicated support.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function BusinessSolutionsPage() {
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
            <span className="text-gray-900">Business Solutions</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#002147] to-[#003366] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Business Notary Solutions
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Streamlined notary services that keep your business moving
          </p>
          <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
            From volume signings to corporate accounts, we provide comprehensive notary solutions tailored to your business needs with transparent pricing and professional reliability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?subject=Business%20Notary%20Solutions%20Inquiry">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                Get Custom Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/booking?service=business">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]"
            >
                Schedule Consultation
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
                  <Building className="mr-3 h-6 w-6 text-[#A52A2A]" />
                  Business Solutions Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Houston Mobile Notary Pros offers comprehensive Business Notary Solutions designed to meet the unique demands of your company. Whether you require regular volume signings, block-booking convenience, dedicated corporate accounts, or reliable recurring appointments, we provide efficient and professional notary services.
                </p>
                <p>
                  Our goal is to integrate seamlessly with your workflow, saving you time, reducing administrative burden, and ensuring your important documents are handled with utmost care and compliance.
                </p>
                <p>
                  All business solutions include the same Texas-commissioned notaries, E&O insurance coverage, and strict quality protocols that define our standard service.
                </p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Users className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Volume Discounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Cost-effective pricing for high-volume needs with block-booking rates and monthly packages.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Briefcase className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Dedicated Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Assigned account managers and priority scheduling for consistent business relationships.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Flexible Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Recurring appointments and on-site visits scheduled around your business operations.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Shield className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Industry Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">HIPAA compliance for healthcare, specialized protocols for legal firms and title companies.</p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147] text-center">
                  Business Package Pricing
                </CardTitle>
                <p className="text-center text-gray-600 mt-2">Tailored solutions for your business needs</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
                  <h3 className="text-3xl font-bold text-[#A52A2A] mb-4">Starting at $250+ <span className="text-sm text-[#002147] ml-1"><Link href="/services/extras#travel-tiers" title="View tiered travel zones" className="underline">See travel tiers</Link></span></h3>
                  <p className="text-lg mb-6 text-gray-700">Customized business packages with volume pricing</p>
                  <div className="text-left max-w-md mx-auto">
                    <h4 className="font-semibold mb-3 text-[#002147]">Includes:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Custom pricing based on volume</li>
                      <li>• Dedicated account management</li>
                      <li>• Priority scheduling</li>
                      <li>• Monthly reporting & analytics</li>
                      <li>• Industry-specific protocols</li>
                    </ul>
                  </div>
                </div>
                <div className="text-center">
                  <Link href="/contact?subject=Business%20Notary%20Solutions%20Inquiry">
                    <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                      Get Custom Business Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Industry Solutions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147]">Industry-Specific Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-[#A52A2A] pl-4">
                      <h4 className="font-semibold text-[#002147] mb-2 flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        Title Company Partnership
                      </h4>
                      <p className="text-sm text-gray-700">Guaranteed priority scheduling, dedicated communication, volume pricing tiers.</p>
                      <p className="text-sm font-semibold text-[#A52A2A]">Partner plans from $199/month</p>
                    </div>
                    <div className="border-l-4 border-[#A52A2A] pl-4">
                      <h4 className="font-semibold text-[#002147] mb-2 flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        Healthcare Provider Solutions
                      </h4>
                      <p className="text-sm text-gray-700">HIPAA-compliant services, patient room visits, medical directive handling.</p>
                      <p className="text-sm font-semibold text-[#A52A2A]">Custom pricing based on needs</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-l-4 border-[#A52A2A] pl-4">
                      <h4 className="font-semibold text-[#002147] mb-2 flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Business Concierge Package
                      </h4>
                      <p className="text-sm text-gray-700">Scheduled on-site visits, I-9 verifications, dedicated account manager.</p>
                      <p className="text-sm font-semibold text-[#A52A2A]">From $200/month</p>
                    </div>
                    <div className="border-l-4 border-[#A52A2A] pl-4">
                      <h4 className="font-semibold text-[#002147] mb-2 flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Educational Institution Package
                      </h4>
                      <p className="text-sm text-gray-700">Student document verification, employee onboarding, regular campus visits.</p>
                      <p className="text-sm font-semibold text-[#A52A2A]">Contact for academic pricing</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="border-[#002147] border-2">
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Business Inquiries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-[#002147]">Business Line</p>
                  <p className="text-gray-700 text-lg font-bold">(281) 404-2019</p>
                </div>
                <div>
                  <p className="font-semibold text-[#002147]">Consultation</p>
                  <p className="text-gray-700">Free business needs assessment</p>
                </div>
                <Link href="/contact?subject=Business%20Notary%20Solutions%20Inquiry">
                  <Button className="w-full bg-[#002147] hover:bg-[#003366] text-white">
                    Schedule Consultation
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Business Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Volume discount pricing</li>
                  <li>• Block-booking available</li>
                  <li>• Dedicated account managers</li>
                  <li>• Priority scheduling</li>
                  <li>• Recurring appointments</li>
                  <li>• Monthly reporting</li>
                  <li>• Custom billing terms</li>
                  <li>• Industry compliance</li>
                </ul>
              </CardContent>
            </Card>

            {/* Industries Served */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Industries We Serve</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Title & Escrow Companies</li>
                  <li>• Healthcare Facilities</li>
                  <li>• Legal Firms</li>
                  <li>• Corporate Offices</li>
                  <li>• Educational Institutions</li>
                  <li>• Financial Services</li>
                  <li>• Real Estate Agencies</li>
                  <li>• Manufacturing</li>
                </ul>
              </CardContent>
            </Card>

            {/* Common Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Common Business Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• I-9 Employment Verification</li>
                  <li>• Corporate document signing</li>
                  <li>• Loan document packages</li>
                  <li>• Real estate closings</li>
                  <li>• Healthcare directives</li>
                  <li>• Legal affidavits</li>
                  <li>• Powers of attorney</li>
                  <li>• Contract notarizations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Why Choose Us */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Why Businesses Choose Us</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Proven reliability</li>
                  <li>• Scalable solutions</li>
                  <li>• Professional consistency</li>
                  <li>• Competitive pricing</li>
                  <li>• Industry expertise</li>
                  <li>• Flexible terms</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#002147] text-center mb-8">Business Solutions FAQ</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">How do we get started with business solutions?</h3>
                <p className="text-gray-700">Contact us for a free consultation where we'll discuss your specific needs, document volume, and preferred scheduling to recommend the best package or create a custom solution.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">Do you offer custom packages?</h3>
                <p className="text-gray-700">Absolutely! We specialize in creating custom business solutions tailored to unique operational needs, service frequencies, and industry-specific document handling requirements.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">Are volume discounts available?</h3>
                <p className="text-gray-700">Yes, volume discounts and block-booking rates are key components of our business solutions. We provide cost-effective services for ongoing or high-volume notary needs.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">Can you service multiple locations?</h3>
                <p className="text-gray-700">Yes, we can arrange service for multiple business locations within our greater Houston service area and can coordinate broader geographical coverage as needed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
