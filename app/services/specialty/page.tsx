import Link from "next/link"
import { ChevronLeft, Check, Award, Globe, FileText, Users, Phone, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import MiniFAQ from "@/components/mini-faq"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Specialty Notary Services Houston | Apostilles, Translations & More | HMNP",
  description:
    "Expert handling of complex documents: Apostilles, embassy certifications, translations, and other specialized notarial acts in Houston. Complex docs handled with precision.",
  keywords:
    "specialty notary Houston, apostille service Houston, embassy certification, document translation notary, complex notary Houston, expert notary services, international documents notary",
  alternates: {
    canonical: '/services/specialty',
  },
  openGraph: {
    title: "Houston Specialty Notary Services | Complex Documents Handled | HMNP",
    description: "Houston Mobile Notary Pros offers expert specialty notary services including apostilles, embassy certifications, and translations.",
    url: `${BASE_URL}/services/specialty`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg',
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
    title: "Specialty Notary Houston | Apostilles, Translations & More | HMNP",
    description: "Need expert help with complex documents in Houston? We handle Apostilles, embassy certifications, and translations. Complex docs handled!",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const specialtyServiceFaqs = [
  {
    id: "what-are-specialty-services",
    question: "What kind of services fall under 'Specialty Notary Services'?",
    answer: (
      <p>
        Specialty Notary Services cover notarial acts that require specific knowledge, additional steps beyond standard notarization, or involve documents for international use. Common examples include Apostille processing, embassy or consulate certifications, notarization of translated documents (where the notary verifies the signer's identity and oath for the translation's accuracy), and other complex or unusual document types. If you have a unique situation, it's best to <Link href="/contact" className="text-[#A52A2A] hover:underline">contact us</Link> to discuss your needs.
      </p>
    ),
  },
  {
    id: "apostille-explained",
    question: "Can you explain what an Apostille is?",
    answer: (
      <p>
        An Apostille is a certificate that authenticates the origin of a public document (e.g., birth certificate, court order, or a document notarized by a public notary) for use in foreign countries that are signatories to the Hague Convention. We facilitate the entire Apostille process, from notarizing the underlying document correctly to submitting it to the Texas Secretary of State for Apostille issuance.
      </p>
    ),
  },
  {
    id: "pricing-specialty",
    question: "How is pricing determined for Specialty Notary Services?",
    answer: (
      <p>
        Our Specialty Notary Services start at $150+. Due to the varied nature and complexity of these services (e.g., number of documents, government fees involved for Apostilles or embassy certifications, research time for unusual requests), the final price is determined after a consultation. We provide a clear quote once we understand the full scope of your requirements. Please <Link href="/contact?subject=Specialty%20Service%20Quote" className="text-[#A52A2A] hover:underline">contact us for a consultation</Link>.
      </p>
    ),
  },
];

export default function SpecialtyServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Specialty Notary Services
        </h1>
        <p className="text-2xl font-semibold text-[#A52A2A] mb-4">
          Complex docs handled.
        </p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          Your critical documents demand more than just a stamp. They Demand Our Expertise. Our Promise: Fast, precise notary service—every time, no hassle.
        </p>
      </section>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Service Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Expert Navigation for Your Complex Document Needs</h2>
          <p className="text-gray-700 mb-4">
            When standard notarization isn't enough, Houston Mobile Notary Pros offers specialized expertise to handle your most complex document requirements. Our Specialty Notary Services are designed for situations that demand a deeper understanding of legal formalities, international protocols, or specific agency procedures.
          </p>
          <p className="text-gray-700 mb-6">
            From authenticating documents for international use with Apostilles or embassy certifications, to assisting with notarizations related to translated documents, we provide meticulous care and precise execution. Trust us to manage these intricate processes with professionalism and clarity, ensuring your documents are correctly prepared and accepted.
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-4">Examples of Our Specialty Services Include:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Apostille & Authentication Services:</strong> Full-service facilitation for documents intended for international use (Hague Convention countries and beyond).</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Embassy & Consulate Certifications:</strong> Processing documents requiring legalization through specific embassies or consulates.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Notarization of Translated Documents:</strong> Assisting with the notarization process for translated materials, including translator affidavits.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Other Complex Notarial Acts:</strong> Handling unique or uncommon requests that require specialized notarial knowledge (e.g., specific verification forms, witness-only services for certain legal documents, etc.).</span>
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">If your specific need isn't listed, please contact us. We thrive on finding solutions for complex notarial challenges.</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Pricing & Consultation</h3>
            <p className="text-3xl font-bold text-[#002147] mb-1">$150+</p>
            <p className="text-sm text-gray-600 mb-4">Starting price for specialty notary services. Due to the unique nature of each request, final pricing is determined after a thorough consultation. This ensures we understand the full scope, any third-party fees (like government apostille fees), and the time involved. We provide a transparent quote before any work begins. Please visit our <Link href="/services/extras" className="text-[#A52A2A] hover:underline">Extras & Fees</Link> page for general fee information.</p>
            <Link href="/contact?subject=Specialty%20Service%20Consultation">
              <Button size="lg" className="w-full sm:w-auto bg-[#002147] hover:bg-[#001a38] text-white">
                Request Consultation for Specialty Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column - Why Choose Us / Areas */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#002147] text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Award className="mr-2 h-6 w-6" /> Why Our Specialized Expertise?
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />In-depth knowledge of complex procedures</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Meticulous attention to detail</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Experience with government agencies</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Clear communication throughout the process</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Commitment to accuracy and compliance</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
              <Globe className="text-[#A52A2A] mr-2 h-6 w-6" /> Focus Areas Include:
            </h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Apostilles for International Use</li>
              <li>Embassy & Consular Legalizations</li>
              <li>Verification of Translated Documents</li>
              <li>Powers of Attorney for Foreign Jurisdictions</li>
              <li>Corporate Documents for Overseas Branches</li>
              <li>Sensitive Verifications & Authentications</li>
            </ul>
          </div>
           <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
              <Phone className="text-[#A52A2A] mr-2 h-6 w-6" /> Discuss Your Unique Needs
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Specialty services often require a preliminary discussion to ensure we provide the correct solution. Contact us to outline your requirements.
            </p>
            <Link href="/contact?subject=Specialty%20Notary%20Inquiry">
              <Button variant="outline" className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                Inquire About Specialty Services
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Specialty Services FAQs</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={specialtyServiceFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Handle Complex Documents with Confidence</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          For Apostilles, embassy certifications, translations, or other intricate notarial acts, trust the experts at Houston Mobile Notary Pros.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact?subject=Specialty%20Service%20Consultation%20Request">
            <Button size="lg" className="bg-[#002147] hover:bg-[#001a38] text-white">
              Request a Consultation
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]">
              Explore All Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
