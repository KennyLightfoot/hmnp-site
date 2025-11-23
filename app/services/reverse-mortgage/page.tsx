import Link from "next/link"
import { ChevronRight, Home, Users, CheckCircle, Shield, Clock, ArrowRight, Info, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Reverse Mortgage Signing Services in Houston",
  description:
    "Certified loan signing agents handle HECM and proprietary reverse mortgage packages with patience, clarity, and on-time document returns.",
  keywords:
    "reverse mortgage signing Houston, HECM notary, reverse mortgage specialist, mobile notary reverse mortgage",
  alternates: {
    canonical: `${BASE_URL}/services/reverse-mortgage`,
  },
  openGraph: {
    title: "Reverse Mortgage Signing Services in Houston",
    description: "Notaries specially trained for reverse mortgage closings across Greater Houston.",
    url: `${BASE_URL}/services/reverse-mortgage`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Reverse Mortgage Signing Services - Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Reverse Mortgage Signing Services in Houston",
    description: "Book experienced reverse mortgage notaries for detailed, patient signings.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function ReverseMortgagePage() {
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
            <Link href="/services/loan-signing-specialist" className="hover:text-[#A52A2A]">Loan Signing</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Reverse Mortgage</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#002147] to-[#003366] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Reverse Mortgage Signing
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-blue-100">
            Expert handling of HECM and reverse mortgage documents
          </p>
          <p className="text-lg mb-8 text-blue-100 max-w-3xl mx-auto">
            Our certified loan signing specialists understand the complexities of reverse mortgages, providing patient, precise service that ensures your signing is handled with utmost care and compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking?service=loan-signing&type=reverse-mortgage">
              <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                Book Reverse Mortgage Signing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact?subject=Reverse%20Mortgage%20Signing%20Inquiry">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
                Ask Questions
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
                  <Home className="mr-3 h-6 w-6 text-[#A52A2A]" />
                  Reverse Mortgage Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  A reverse mortgage, often a Home Equity Conversion Mortgage (HECM), is a unique financial tool allowing seniors to access their home equity. The signing process for these loans is intricate, involving numerous documents and specific disclosure requirements.
                </p>
                <p>
                  Our Loan Signing Specialists have dedicated training and experience in handling reverse mortgage closings. We approach these signings with the sensitivity, patience, and meticulous attention to detail they demand, ensuring all documents are correctly executed according to lender and regulatory guidelines.
                </p>
                <p>
                  While we cannot provide financial or legal advice, we ensure a calm and clear environment for you to review and sign your documents confidently, working closely with lenders and title companies that specialize in reverse mortgages.
                </p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Users className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Specialized Training
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Our agents understand the unique document set and procedures for HECMs and proprietary reverse mortgages.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Patient Approach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">We allocate ample time (typically 1.5-2 hours) for these detailed signings with an unhurried approach.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Meticulous Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Ensuring all forms are correctly filled, signed, dated, and notarized with precision and accuracy.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#002147] flex items-center">
                    <Shield className="mr-3 h-5 w-5 text-[#A52A2A]" />
                    Professional Coordination
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">Seamless interaction with your lender, title company, or reverse mortgage counselor.</p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147] text-center">
                  Reverse Mortgage Signing Pricing
                </CardTitle>
                <p className="text-center text-gray-600 mt-2">Specialized service with dedicated time allocation</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-8 rounded-lg text-center mb-6">
                  <h3 className="text-3xl font-bold text-[#A52A2A] mb-4">Starting at $200+ <span className="text-sm text-[#002147] ml-1"><Link href="/services/extras#travel-tiers" className="underline" title="View tiered travel zones">See travel tiers</Link></span></h3>
                  <p className="text-lg mb-6 text-gray-700">Comprehensive reverse mortgage document handling</p>
                  <div className="text-left max-w-md mx-auto">
                    <h4 className="font-semibold mb-3 text-[#002147]">Includes:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Certified loan signing specialist</li>
                      <li>• 1.5-2 hour appointment time</li>
                      <li>• Complete document review</li>
                      <li>• Professional coordination</li>
                      <li>• Travel to your location</li>
                    </ul>
                    <p className="text-xs text-gray-600 mt-4">
                      Pricing may vary based on complexity and travel distance. Part of our Loan Signing Specialist services.
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <Link href="/booking?service=loan-signing&type=reverse-mortgage">
                    <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                      Book Reverse Mortgage Signing
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-[#002147]">What to Expect During Your Signing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Reverse mortgage signings typically involve a larger package of documents than standard mortgages and require more time. Our specialist will guide you through each document, clearly indicating where to sign, initial, and date.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-[#002147]">Before the Signing:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Confirm appointment time and location</li>
                        <li>• Ensure all signers have valid photo ID</li>
                        <li>• Review any pre-signing materials</li>
                        <li>• Prepare a quiet, comfortable space</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-[#002147]">During the Signing:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Document explanation and guidance</li>
                        <li>• Patient review of all forms</li>
                        <li>• Proper notarization procedures</li>
                        <li>• Questions addressed (within scope)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Important Notice */}
            <Card className="border-orange-200 border-2">
              <CardHeader>
                <CardTitle className="text-lg text-orange-700 flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-gray-700">
                  As notaries and signing agents, we are not attorneys or financial advisors. We cannot provide legal or financial advice, or explain the terms of your reverse mortgage.
                </p>
                <p className="text-xs italic text-gray-500">
                  "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN TEXAS AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR LEGAL ADVICE." (Texas Gov't Code §406.017)
                </p>
                <p className="text-gray-700">
                  Please consult your reverse mortgage counselor, lender, or attorney for any questions regarding the loan itself.
                </p>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Questions About Reverse Mortgage Signings?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-[#002147]">Loan Signing Specialist Line</p>
                  <p className="text-gray-700">(281) 404-2019</p>
                </div>
                <p className="text-sm text-gray-600">
                  If you or your clients have questions about our reverse mortgage signing process, please don't hesitate to contact us.
                </p>
                <Link href="/contact?subject=Reverse%20Mortgage%20Signing%20Inquiry">
                  <Button className="w-full bg-[#002147] hover:bg-[#003366] text-white">
                    Contact Us
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Service Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Why Choose Our Specialists</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Certified & insured specialists</li>
                  <li>• HECM & proprietary loan experience</li>
                  <li>• Respectful and patient service</li>
                  <li>• Mobile service to your location</li>
                  <li>• Commitment to accuracy & compliance</li>
                  <li>• Professional coordination</li>
                </ul>
              </CardContent>
            </Card>

            {/* Document Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Common Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• HECM loan documents</li>
                  <li>• Proprietary reverse mortgage papers</li>
                  <li>• Truth in Lending disclosures</li>
                  <li>• Right of rescission notices</li>
                  <li>• Counseling certificates</li>
                  <li>• Title and escrow documents</li>
                  <li>• Insurance requirements</li>
                  <li>• Regulatory compliance forms</li>
                </ul>
              </CardContent>
            </Card>

            {/* Related Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147]">Related Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/services/loan-signing-specialist" className="block text-sm text-[#A52A2A] hover:underline">
                  • Full Loan Signing Specialist Services
                </Link>
                <Link href="/services/standard-notary" className="block text-sm text-[#A52A2A] hover:underline">
                  • General Notary Services
                </Link>
                <Link href="/services/business" className="block text-sm text-[#A52A2A] hover:underline">
                  • Business Notary Solutions
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#002147] text-center mb-8">Reverse Mortgage Signing FAQ</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">What is a reverse mortgage and why is the signing process important?</h3>
                <p className="text-gray-700">A reverse mortgage (often a HECM) allows homeowners aged 62+ to convert home equity into cash. The signing process is critical due to unique loan nature and extensive disclosures. Accuracy and clear guidance are paramount.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">Why choose our specialists for reverse mortgage signings?</h3>
                <p className="text-gray-700">Our specialists are specifically trained in reverse mortgage complexities, ensuring all paperwork is meticulously handled, signers feel respected and unhurried, and all notarial acts are performed correctly.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">What should I expect during the appointment?</h3>
                <p className="text-gray-700">Reverse mortgage signings typically take 1.5-2 hours with larger document packages. Our specialist guides you through each document in a calm, patient environment, allowing ample review time.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#002147] mb-2">How do I book a reverse mortgage signing?</h3>
                <p className="text-gray-700">Book through our Loan Signing Specialist services. Please indicate it's a reverse mortgage so we can allocate appropriate time and assign an experienced HECM specialist.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 