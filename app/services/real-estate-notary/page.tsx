import Link from "next/link"
import { ChevronLeft, Check, Home, Users, FileText, Clock, Shield, MapPin, Star, ArrowRight, Briefcase, Phone, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SERVICES_CONFIG } from "@/lib/services/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MiniFAQ from "@/components/mini-faq"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Real Estate Notary Houston | Property Transaction Specialists | HMNP",
  description:
    "Expert real estate notary services in Houston. Specializing in property transactions, deed signings, title work, and real estate closings. Trusted by realtors and title companies.",
  keywords:
    "real estate notary Houston, property transaction notary, deed signing Houston, title notary, real estate closing notary, Houston property notary, real estate document notary, mobile notary real estate",
  alternates: {
    canonical: '/services/real-estate-notary',
  },
  openGraph: {
    title: "Real Estate Notary Houston | Property Transaction Specialists | HMNP",
    description: "Houston's trusted real estate notary specialists. Expert handling of property transactions, deed signings, and title work. Preferred by realtors and title companies.",
    url: `${BASE_URL}/services/real-estate-notary`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Real Estate Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Real Estate Notary Houston | Property Transaction Specialists | HMNP",
    description: "Expert real estate notary services in Houston. Specializing in property transactions, deed signings, and closings. Trusted by industry professionals.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const realEstateFaqs = [
  {
    id: "real-estate-specialization",
    question: "What makes you specialists in real estate notarization?",
    answer: (
      <p>
        Our real estate notary specialists have extensive experience with property transactions, understanding the nuances of deed requirements, title company procedures, and closing processes. We're familiar with Texas property law requirements, work closely with real estate professionals, and maintain relationships with major Houston-area title companies. Our precision ensures transactions close on time without funding delays.
      </p>
    ),
  },
  {
    id: "real-estate-documents",
    question: "What types of real estate documents do you handle?",
    answer: (
      <p>
        We handle all real estate-related notarizations including: warranty deeds, quitclaim deeds, special warranty deeds, affidavits of title, power of attorney for real estate, homestead exemptions, deed restrictions, property disclosures, seller financing documents, and investor transaction paperwork. For full loan signing packages, see our <Link href="/services/loan-signing-specialist" className="text-[#A52A2A] hover:underline">Loan Signing Specialist service</Link>.
      </p>
    ),
  },
  {
    id: "title-company-work",
    question: "Do you work directly with title companies and realtors?",
    answer: (
      <p>
        Yes! We partner with Houston-area title companies, real estate agencies, and individual realtors. We understand their timelines, documentation requirements, and preferred procedures. We offer corporate accounts for volume clients and can coordinate directly with your preferred title company for seamless transactions. Contact us to set up a business relationship.
      </p>
    ),
  },
  {
    id: "closing-locations",
    question: "Where can you handle real estate signings?",
    answer: (
      <p>
        We provide real estate notary services at title company offices, real estate offices, client homes, coffee shops, libraries, or any convenient location throughout the Houston metro area. We're experienced with last-minute location changes and can accommodate signing preferences of all parties involved in the transaction.
      </p>
    ),
  },
  {
    id: "real-estate-pricing",
    question: "How much do real estate notary services cost?",
    answer: (
      <p>
        Real estate notary pricing starts at $75 for basic property documents (deeds, affidavits, etc.) with standard travel included. Complex transactions or multiple-property deals may require additional fees. For comprehensive loan signing packages, pricing starts at $200+. We offer volume discounts for real estate professionals and title companies with recurring needs.
      </p>
    ),
  },
];

export default function RealEstateNotaryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Real Estate Notary Houston
        </h1>
        <p className="text-2xl font-semibold text-[#A52A2A] mb-6">
          Property transaction specialists trusted by industry professionals.
        </p>
        
        {/* Professional Trust Banner */}
        <div className="bg-gradient-to-r from-[#002147] to-[#001a38] border-2 border-[#A52A2A] rounded-lg px-8 py-6 mx-auto max-w-3xl mb-6">
          <div className="flex items-center justify-center">
            <Home className="w-10 h-10 text-[#A52A2A] mr-4" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#A52A2A]">TRUSTED BY PROFESSIONALS</div>
              <div className="text-white font-semibold text-xl">Realtors • Title Companies • Investors • Attorneys</div>
              <div className="text-sm text-[#91A3B0] mt-2">Expert handling of property transactions since day one</div>
            </div>
          </div>
        </div>
        
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          Real estate transactions demand precision, timing, and expertise. Our specialized notary team understands property law requirements, title company procedures, and the critical nature of real estate deadlines in the Houston market.
        </p>
      </section>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Service Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Houston's Premier Real Estate Notary Specialists</h2>
          <p className="text-gray-700 mb-4">
            Whether you're a realtor managing multiple closings, a title company coordinating complex transactions, or an investor handling property acquisitions, our real estate notary team delivers the expertise and reliability your business demands.
          </p>
          <p className="text-gray-700 mb-6">
            We understand Texas property law, title requirements, and the time-sensitive nature of real estate transactions. Our specialists work seamlessly with your existing processes, ensuring every signature, acknowledgment, and notarization meets legal standards without delaying your closings.
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-4">Real Estate Documents We Handle:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Deed Documents:</strong> Warranty deeds, quitclaim deeds, special warranty deeds, corrective deeds</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Title & Closing Documents:</strong> Affidavits of title, title commitments, settlement statements</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Property Disclosures:</strong> Seller's disclosures, lead-based paint forms, property condition reports</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Investment Documents:</strong> Assignment contracts, investor agreements, partnership documents</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Power of Attorney:</strong> Real estate-specific POAs, closing representation, property management</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Texas-Specific Forms:</strong> Homestead exemptions, deed restrictions, mineral rights documents</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Real Estate Notary Pricing</h3>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-3xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.STANDARD_NOTARY.basePrice}+</span>
              <span className="text-lg text-gray-600">basic property documents</span>
            </div>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold text-[#002147]">${SERVICES_CONFIG.LOAN_SIGNING.basePrice}+</span>
              <span className="text-lg text-gray-600">full loan signing packages</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Pricing varies based on document complexity, number of signers, and travel requirements. Volume discounts available for real estate professionals and title companies. Same-day service available.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/booking?service=real-estate">
                <Button size="lg" className="w-full sm:w-auto bg-[#002147] hover:bg-[#001a38] text-white">
                  Book Real Estate Notary
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact?subject=Real%20Estate%20Professional%20Services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                  Professional Inquiry
                  <Briefcase className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Houston Real Estate Market Section */}
          <div className="bg-[#002147]/5 p-6 rounded-lg border border-[#002147]/20">
            <h3 className="text-xl font-semibold text-[#002147] mb-3 flex items-center">
              <MapPin className="text-[#002147] mr-2 h-5 w-5" /> Houston Real Estate Market Expertise
            </h3>
            <p className="text-gray-700 mb-4">
              We understand Houston's unique real estate landscape, from Inner Loop condos to Katy suburbs, from commercial properties in the Energy Corridor to investment properties in emerging neighborhoods. Our team knows local title companies, understands Harris County recording requirements, and can navigate the complexities of Texas property law.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Service Areas:</strong> Greater Houston metro, Harris County, Fort Bend County, Montgomery County
              </div>
              <div>
                <strong>Property Types:</strong> Residential, commercial, industrial, land, investment properties
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Professional Services & Contact */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#002147] text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Star className="mr-2 h-6 w-6" /> Why Real Estate Pros Choose Us
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Texas property law expertise</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Title company relationships</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Same-day service available</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Volume discount programs</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />$1M E&O insurance coverage</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Mobile convenience</li>
            </ul>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#002147] flex items-center">
                <Users className="mr-2 h-5 w-5 text-[#A52A2A]" /> Professional Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-semibold">Title Companies:</p>
                  <p>Corporate accounts, direct coordination, preferred pricing</p>
                </div>
                <div>
                  <p className="font-semibold">Real Estate Agencies:</p>
                  <p>Volume discounts, priority scheduling, same-day service</p>
                </div>
                <div>
                  <p className="font-semibold">Individual Realtors:</p>
                  <p>Reliable backup, emergency availability, client-focused service</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#002147] flex items-center">
                <Clock className="mr-2 h-5 w-5 text-[#A52A2A]" /> Service Timing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span>Standard Service:</span>
                  <span className="font-semibold">24-48 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Same-Day:</span>
                  <span className="font-semibold">2-6 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency:</span>
                  <span className="font-semibold">1-2 hours</span>
                </div>
                <p className="text-xs text-gray-500 pt-2">Rush service available for time-sensitive closings</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#002147] flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-[#A52A2A]" /> Related Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 space-y-3">
                <div>
                  <p className="font-semibold">Full Loan Signings:</p>
                  <Link href="/services/loan-signing-specialist" className="text-[#A52A2A] hover:underline">Certified Loan Signing Agent</Link>
                </div>
                <div>
                  <p className="font-semibold">RON Services:</p>
                  <Link href="/services/remote-online-notarization" className="text-[#A52A2A] hover:underline">Remote Online Notarization</Link>
                </div>
                <div>
                  <p className="font-semibold">Business Solutions:</p>
                  <Link href="/services/business" className="text-[#A52A2A] hover:underline">Corporate Account Programs</Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Real Estate Notary FAQs</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={realEstateFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Keep Your Real Estate Transactions Moving</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Don't let notarization delays derail your closings. Houston's real estate professionals trust us for reliable, expert service that keeps transactions on schedule.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking?service=real-estate">
            <Button size="lg" className="bg-white text-[#A52A2A] hover:bg-gray-100">
              Book Real Estate Service
              <Home className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contact?subject=Real%20Estate%20Professional%20Partnership">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#A52A2A]">
              Professional Partnership
              <Briefcase className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 