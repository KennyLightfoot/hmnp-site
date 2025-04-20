import Link from "next/link"
import { ChevronLeft, Check, Globe, FileCheck, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Specialty Notary Services (Apostille, Verification) | Houston Mobile Notary Pros",
  description:
    "Expert specialty notary services in Houston, including Apostille, background check verification, wedding certificate expediting, and Medallion Signatures.",
  keywords:
    "specialty notary Houston, apostille service Houston, background check notary, wedding certificate notary, medallion signature Houston, mobile notary",
  alternates: {
    canonical: '/services/specialty',
  },
  openGraph: {
    title: "Specialty Notary Services in Houston (Apostille, Verification) | HMNP",
    description: "Houston Mobile Notary Pros offers specialized services like Apostille, background verifications, wedding certificate expediting, and Medallion Signatures.",
    url: `${BASE_URL}/services/specialty`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Specialty Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Houston Specialty Notary: Apostille, Verifications & More - HMNP",
    description: "Need Apostille, background check verification, or other specialty notary services in Houston? Houston Mobile Notary Pros can help.",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function SpecialtyServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Specialty Notary Services</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Specialized notary solutions for unique document requirements
        </p>
      </div>

      {/* Service Options */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Apostille Services */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Apostille Services
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$75 + state fees</p>
            <p className="mb-4">
              Authentication of documents for use in foreign countries that are members of the Hague Convention.
            </p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Document review and preparation</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Notarization of documents</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Submission to Secretary of State</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Return shipping of completed documents</span>
              </li>
            </ul>
            <h3 className="text-xl font-semibold mb-3">Additional Options:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">+</span>
                <span>Expedited Processing: $75</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#A52A2A] mr-2">+</span>
                <span>Document Preparation: $20/document</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Book Apostille Service</Button>
            </div>
          </CardContent>
        </Card>

        {/* Background Check Verification */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <FileCheck className="mr-2 h-5 w-5" />
              Background Check Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$55</p>
            <p className="mb-4">
              Professional verification services for employment, education, and licensing background checks.
            </p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Identity verification</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Document authentication</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Notarized verification form</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Secure digital delivery to verification agency</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Book Verification Service</Button>
            </div>
          </CardContent>
        </Card>

        {/* Wedding Certificate Expediting */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Wedding Certificate Expediting
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$75</p>
            <p className="mb-4">Streamlined processing of wedding certificates and marriage license documentation.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Document review and preparation</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Notarization of required documents</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>County clerk coordination</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Express processing (where available)</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Book Certificate Service</Button>
            </div>
          </CardContent>
        </Card>

        {/* Medallion Signature */}
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147] text-white">
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Medallion Signature
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-6">$150</p>
            <p className="mb-4">
              Specialized signature guarantee for financial transactions, particularly securities transfers.
            </p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>High-security document handling</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Enhanced identity verification</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Medallion stamp application</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Secure document return</span>
              </li>
            </ul>
            <div className="mt-6">
              <Button className="w-full bg-[#002147] hover:bg-[#001a38]">Book Medallion Service</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Description */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Specialized Notary Expertise</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Why Choose Our Specialty Services</h3>
            <p className="mb-4">
              Our specialty notary services go beyond standard notarizations to address complex document requirements.
              With specialized training and experience, our notaries can handle unique situations that require
              additional expertise.
            </p>
            <p>
              Whether you need documents authenticated for international use, verification for sensitive background
              checks, or expedited processing of important certificates, our team has the knowledge and credentials to
              assist you.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Our Specialty Service Advantages</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Specialized Training:</span> Our notaries have additional
                  certifications for specialty services.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Process Knowledge:</span> We understand the unique requirements of
                  specialty documents.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Agency Relationships:</span> Established connections with relevant
                  government agencies and institutions.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Enhanced Security:</span> Additional security measures for sensitive
                  documents.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common Uses */}
      <div className="bg-gray-50 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Common Uses for Specialty Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">International Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Power of Attorney for overseas use</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Birth certificates for dual citizenship</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Business documents for foreign entities</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Employment Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Professional license verification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Security clearance documentation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Employment eligibility verification</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Financial Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Stock transfers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Retirement account transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>High-value asset transfers</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Personal Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Marriage certificates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Adoption papers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Educational credential verification</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Process */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Specialty Service Process</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  1
                </div>
                Consultation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                We discuss your specific needs and determine which specialty service is appropriate for your situation.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  2
                </div>
                Document Review
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                We examine your documents to ensure they meet all requirements for the specific specialty service
                needed.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  3
                </div>
                Service Execution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                Our specialized notary performs the required service, following all legal protocols and requirements.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-[#91A3B0]/20">
              <CardTitle className="flex items-center">
                <div className="bg-[#002147] text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  4
                </div>
                Processing & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>
                We handle any additional processing with relevant agencies and deliver the completed documents to you.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">How long does the apostille process take?</h3>
            <p>
              Standard apostille processing typically takes 2-3 weeks. With our expedited service option, we can often
              complete the process in 3-5 business days, depending on the document type and destination country.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              What's the difference between a regular notarization and a Medallion Signature?
            </h3>
            <p>
              A Medallion Signature Guarantee is a specialized form of authentication specifically for financial
              securities transactions. Unlike standard notarization, it provides a guarantee backed by insurance that
              protects the transfer agent against fraudulent transfers. Medallion stamps can only be provided by
              authorized financial institutions and their approved agents.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#002147] mb-2">
              Do you handle international document authentication for all countries?
            </h3>
            <p>
              We handle document authentication for countries that are members of the Hague Apostille Convention. For
              non-member countries, we offer authentication services through the U.S. Department of State and relevant
              embassies or consulates. Please contact us with your specific country requirements for detailed
              information.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Need Specialized Notary Services?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Contact us today to discuss your specific requirements and how our specialty services can assist you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
            Book Specialty Service
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
            Request Consultation
          </Button>
        </div>
      </div>
    </div>
  )
}
