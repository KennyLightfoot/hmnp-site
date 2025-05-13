import Link from "next/link"
import { ChevronLeft, Check, Globe, FileCheck, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Expert Specialty Notary Houston | Apostille, Verifications & More | Houston Mobile Notary Pros",
  description:
    "Navigate complex document needs in Houston with our expert specialty notary services. Apostilles, verifications, and more, handled with precision, clarity, and calm.",
  keywords:
    "specialty notary Houston, apostille service Houston, background check notary, wedding certificate notary, medallion signature Houston, mobile notary, expert apostille Houston, precise document verification, confidential notary services, complex notary solutions, Houston Medallion Signature experts",
  alternates: {
    canonical: '/services/specialty',
  },
  openGraph: {
    title: "Houston Specialty Notary: Expert Apostille & Verification | HMNP",
    description: "For complex notary needs in Houston like Apostilles or Medallion Signatures, trust our experts for precise, calm, and clear service.",
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
    title: "Specialty Notary Houston: Apostilles, Verifications, Medallion | HMNP",
    description: "Expert Houston notaries for specialty services (Apostille, Verifications). We handle complex documents with precision and calm. Get peace of mind!",
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
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Navigating your unique and complex document requirements with <span className="font-semibold text-[#002147]">expert precision and clarity</span>. Experience <span className="font-semibold text-[#002147]">peace of mind</span> with our specialized solutions.
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
              Expert authentication of your documents for international use, ensuring compliance with Hague Convention requirements with clarity and precision.
            </p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Meticulous review and preparation of your documents for apostille.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Precise notarization as required for the apostille process.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Efficient submission to the Secretary of State, handled with care.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Secure return shipping of your authenticated documents, giving you peace of mind.</span>
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
              Confidential and precise verification services for critical background checks, handled with professionalism and integrity.
            </p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Rigorous identity verification to ensure authenticity.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Thorough authentication of supporting documents.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Accurate completion and notarization of the required verification form.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Secure and prompt digital delivery to the designated agency.</span>
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
            <p className="mb-4">Navigate the complexities of wedding certificate and marriage license processing with our calm and efficient expediting service.</p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Careful review and preparation of all necessary paperwork.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Precise notarization where needed to ensure validity.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Professional coordination with the county clerk's office for smooth processing.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Diligent effort for express processing to meet your timeline.</span>
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
              High-assurance Medallion Signature Guarantees for your valuable financial transactions, executed with the utmost security and precision.
            </p>
            <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Secure and confidential handling of your sensitive financial documents.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Strict, multi-layered identity verification for maximum security.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Correct and precise application of the Medallion Signature Guarantee stamp.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>Assured secure return of your processed documents.</span>
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
              With specialized training and experience, our expert notaries calmly and precisely navigate unique situations that demand a higher level of expertise and meticulous care.
            </p>
            <p>
              Whether you need documents authenticated for international use, verification for sensitive background
              checks, or expedited processing of important certificates, our team provides the expert knowledge, credentials, and clear communication necessary to guide you through these processes and ensure your peace of mind.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Our Specialty Service Advantages</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Deep Expertise & Specialized Training:</span> Our notaries hold additional certifications and continuously train to master the nuances of specialty services, ensuring every detail is correct.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">In-Depth Process Knowledge & Clarity:</span> We don't just understand the requirements; we explain them clearly, so you feel confident and informed throughout.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Established Agency Relationships:</span> Our experience includes working effectively with relevant government agencies and institutions, facilitating smoother and more reliable processing.
                </span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Unwavering Security & Confidentiality:</span> We employ stringent security measures and uphold the strictest confidentiality for your most sensitive documents, providing complete peace of mind.
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
                  <span>Proper Power of Attorney for overseas use</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Accurate birth certificates for dual citizenship</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Verified business documents for foreign entities</span>
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
                  <span>Reliable professional license verification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Confidential security clearance documentation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Thorough employment eligibility verification</span>
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
                  <span>Secure stock transfers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Precise retirement account transactions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Protected high-value asset transfers</span>
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
                  <span>Properly handled marriage certificates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Careful processing of adoption papers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#A52A2A] mr-2">•</span>
                  <span>Accurate educational credential verification</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Process */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Specialty Service Process</h2>
        <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto">
          Navigating specialty notary services requires clarity and expertise. We ensure a calm, understandable, and meticulous process from your first consultation to the final delivery of your documents:
        </p>
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
        <p className="text-sm text-gray-600 mt-6 text-center">
          For a comprehensive overview of our entire client journey, from initial booking to post-signing, please see our detailed{" "}
          <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline font-medium">
            What to Expect guide
          </Link>.
        </p>
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
        <h2 className="text-2xl font-bold mb-4">Expert Solutions for Your Complex Notary Needs</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Don't navigate complex document requirements alone. Our experts provide calm, clear, and precise specialty notary services. Request a consultation for your peace of mind.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact?service=specialty&subject=Specialty%20Service%20Booking%20Inquiry">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white w-full sm:w-auto">
              Book Specialty Service
            </Button>
          </Link>
          <Link href="/contact?subject=Specialty%20Service%20Consultation%20Request">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147] w-full sm:w-auto">
              Request Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
