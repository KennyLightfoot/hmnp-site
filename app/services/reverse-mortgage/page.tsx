import Link from 'next/link'
import { ChevronLeft, Check, Info, Users, Phone, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MiniFAQ from '@/components/mini-faq'

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Reverse Mortgage Signing Houston | Expert Guidance | Houston Mobile Notary Pros",
  description:
    "Specialized reverse mortgage signing services in Houston. Our certified agents provide clear, calm, and precise handling of your reverse mortgage documents.",
  keywords:
    "reverse mortgage signing Houston, HECM notary, Houston reverse mortgage specialist, mobile notary reverse mortgage, certified reverse mortgage signing agent",
  alternates: {
    canonical: '/services/reverse-mortgage',
  },
  openGraph: {
    title: "Expert Reverse Mortgage Signing Services in Houston | HMNP",
    description: "Houston Mobile Notary Pros offers specialized, expert handling of reverse mortgage signings with clarity and precision.",
    url: `${BASE_URL}/services/reverse-mortgage`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', 
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
    title: "Houston Reverse Mortgage Signing | Calm, Clear & Precise | HMNP",
    description: "Navigate your reverse mortgage signing in Houston with confidence. Our certified specialists ensure a smooth process.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const reverseMortgageFaqs = [
  {
    id: "what-is-reverse-mortgage",
    question: "What is a reverse mortgage and why is the signing process important?",
    answer: (
      <p>
        A reverse mortgage (often a Home Equity Conversion Mortgage - HECM) allows homeowners aged 62 and older to convert part of their home equity into cash, without having to sell their home or make monthly mortgage payments. The signing process is critical due to the unique nature of these loans and the extensive disclosures involved. Accuracy and clear guidance (within notarial duties) are paramount.
      </p>
    ),
  },
  {
    id: "our-expertise-rm",
    question: "Why choose Houston Mobile Notary Pros for my reverse mortgage signing?",
    answer: (
      <p>
        Our Loan Signing Specialists are specifically trained and experienced in handling the complexities of reverse mortgage documents. We understand the sensitivity and importance of these transactions, ensuring all paperwork is meticulously handled, signers feel respected and unhurried, and all notarial acts are performed correctly to prevent delays or issues.
      </p>
    ),
  },
  {
    id: "what-to-expect-rm-signing",
    question: "What should I expect during a reverse mortgage signing appointment?",
    answer: (
      <p>
        Reverse mortgage signings typically involve a larger package of documents than standard mortgages and may take longer (often 1.5 to 2 hours). Our specialist will guide you through each document, indicating where to sign, initial, and date. We ensure a calm, patient environment, allowing you ample time to review (though we cannot offer legal advice). All signers must have valid government-issued photo ID.
      </p>
    ),
  },
  {
    id: "booking-rm",
    question: "How do I book a reverse mortgage signing?",
    answer: (
      <p>
        Reverse mortgage signings are handled by our <Link href="/services/loan-signing" className="text-[#A52A2A] hover:underline">Loan Signing Specialists</Link>. Please indicate that it is a reverse mortgage when booking or during your initial contact so we can allocate the appropriate time and ensure a specialist experienced with HECMs is assigned. You can book through our main loan signing service or contact us directly.
      </p>
    ),
  }
];

export default function ReverseMortgagePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/services/loan-signing" className="flex items-center text-[#002147] hover:text-[#A52A2A] text-sm">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Loan Signing Specialist Services
        </Link>
      </div>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Expert Reverse Mortgage Signing Services
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6">
          Navigating the complexities of a reverse mortgage requires specialized knowledge and a patient approach. Our certified specialists ensure your signing is handled with precision, clarity, and the utmost care.
        </p>
         <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Our Promise: Fast, precise notary service—every time, no hassle.
        </p>
      </section>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Service Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Understanding Reverse Mortgages & Our Specialized Role</h2>
          <p className="text-gray-700 mb-4">
            A reverse mortgage, often a Home Equity Conversion Mortgage (HECM), is a unique financial tool allowing seniors to access their home equity. The signing process for these loans is intricate, involving numerous documents and specific disclosure requirements. 
          </p>
          <p className="text-gray-700 mb-4">
            At Houston Mobile Notary Pros, our Loan Signing Specialists have dedicated training and experience in handling reverse mortgage closings. We approach these signings with the sensitivity, patience, and meticulous attention to detail they demand. Our role is to facilitate a smooth and accurate signing, ensuring all documents are correctly executed according to lender and regulatory guidelines.
          </p>
          <p className="text-gray-700 mb-6">
            While we are not financial advisors or attorneys and cannot explain loan terms or offer advice, we ensure a calm and clear environment for you to review and sign your documents confidently. We work closely with lenders and title companies that specialize in reverse mortgages to provide a seamless experience.
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-4">Key Aspects of Our Reverse Mortgage Signing Service:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Specialized Training:</strong> Our agents understand the unique document set and procedures for HECMs and proprietary reverse mortgages.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Patient & Unhurried Approach:</strong> We allocate ample time (typically 1.5-2 hours) for these detailed signings.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Meticulous Document Review:</strong> Ensuring all forms are correctly filled, signed, dated, and notarized.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Clear Guidance:</strong> We clearly identify documents and direct you where to provide signatures, initials, and dates.</span>
              </li>
               <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Professional Coordination:</strong> Seamless interaction with your lender, title company, or reverse mortgage counselor.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Booking Your Reverse Mortgage Signing</h3>
            <p className="text-sm text-gray-600 mb-4">Reverse mortgage signings are conducted by our certified Loan Signing Specialists. To ensure we allocate the necessary time and expertise, please specify that it is a reverse mortgage when booking. This service is part of our <Link href="/services/loan-signing" className="text-[#A52A2A] hover:underline">Loan Signing Specialist services</Link>, with pricing typically starting from $200+ (may vary based on complexity and travel).</p>
            <Link href="/booking?service=loan-signing&type=reverse-mortgage">
              <Button size="lg" className="w-full sm:w-auto bg-[#002147] hover:bg-[#001a38] text-white">
                Book with a Loan Signing Specialist
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column - Why Choose Us / Contact */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#002147] text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Home className="mr-2 h-6 w-6" /> Your Comfort and Confidence Matter
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Certified & Insured Specialists</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Experienced with HECM & Proprietary Loans</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Respectful and Patient Service</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Mobile Service to Your Location</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Commitment to Accuracy & Compliance</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
             <Info className="text-[#A52A2A] mr-2 h-6 w-6" /> Important Note
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              As notaries and signing agents, we are not attorneys or financial advisors. We cannot provide legal or financial advice, or explain the terms of your reverse mortgage. Our role is to ensure documents are signed and notarized correctly. 
            </p>
            <p className="text-xs italic text-gray-500">
              "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN TEXAS AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR LEGAL ADVICE." (Texas Gov't Code §406.017)
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Please consult your reverse mortgage counselor, lender, or attorney for any questions regarding the loan itself.
            </p>
          </div>
           <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
              <Phone className="text-[#A52A2A] mr-2 h-6 w-6" /> Questions About Reverse Mortgage Signings?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              If you or your clients have questions about our reverse mortgage signing process, please don't hesitate to contact us.
            </p>
            <Link href="/contact?subject=Reverse%20Mortgage%20Signing%20Inquiry">
              <Button variant="outline" className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Reverse Mortgage Signing FAQs</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={reverseMortgageFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Navigate Your Reverse Mortgage with an Expert</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Ensure your reverse mortgage signing is handled with the specialized care and precision it deserves. Our experienced Loan Signing Specialists are ready to assist.
        </p>
        <Link href="/booking?service=loan-signing&type=reverse-mortgage">
            <Button size="lg" className="bg-[#002147] hover:bg-[#001a38] text-white">
              Schedule Your Reverse Mortgage Signing
            </Button>
        </Link>
      </div>
    </div>
  )
} 