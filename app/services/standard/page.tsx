import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Users, FileText, Phone } from 'lucide-react'
import MiniFAQ from '@/components/mini-faq' // Assuming you have a MiniFAQ component

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Standard Notary Services | Houston Mobile Notary Pros",
  description:
    "Reliable on-site notarizations for POAs, affidavits, contracts, and more during standard business hours (9 am–5 pm). On-time, every time.",
  keywords:
    "standard notary, mobile notary Houston, POA notarization, affidavit notary, contract notarization, 9-5 notary service, Houston notary",
  alternates: {
    canonical: '/services/standard',
  },
  openGraph: {
    title: "Standard Notary Services | Houston Mobile Notary Pros",
    description: "Professional and precise standard notary services in Houston. We handle your important documents with care.",
    url: `${BASE_URL}/services/standard`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Standard Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Standard Notary Services | Houston Mobile Notary Pros",
    description: "Need a notary for standard documents in Houston? We offer on-time, professional service from 9 am to 5 pm.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const standardServiceFaqs = [
  {
    id: "standard-documents",
    question: "What types of documents are covered under Standard Notary service?",
    answer: (
      <p>
        Our Standard Notary service covers a wide range of common documents requiring notarization, including but not limited to:
        Powers of Attorney (POAs), Affidavits, Contracts and Business Agreements, Wills and Trusts (estate planning documents),
        Deeds (Quitclaim, Warranty, etc.), Vehicle Title Transfers, and Travel Consent Forms for Minors.
        If you have a document not listed, feel free to <Link href="/contact" className="text-[#A52A2A] hover:underline">contact us</Link> to confirm.
      </p>
    ),
  },
  {
    id: "standard-hours",
    question: "What are the service hours for Standard Notary?",
    answer: (
      <p>
        Standard Notary services are available Monday through Friday, from 9:00 AM to 5:00 PM.
        If you require services outside these hours or on weekends, please consider our <Link href="/services/extended" className="text-[#A52A2A] hover:underline">Extended Hours Notary</Link> service.
      </p>
    ),
  },
  {
    id: "standard-travel",
    question: "Is travel included in the Standard Notary price?",
    answer: (
      <p>
        The Standard Notary service starting price of $75 includes travel within a 15-mile radius of our base (ZIP code 77591).
        For locations beyond this, a mileage fee of $0.50 per mile (one-way) will apply. This will be confirmed when you book.
        You can find more details on our <Link href="/services/extras" className="text-[#A52A2A] hover:underline">Extras & Fees</Link> page.
      </p>
    ),
  },
];


export default function StandardNotaryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Standard Notary Services
        </h1>
        <p className="text-2xl font-semibold text-[#A52A2A] mb-4">
          On-time, every time.
        </p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          Your critical documents demand professionalism and precision. Our Promise: Fast, precise notary service—every time, no hassle.
        </p>
      </section>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Service Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Reliable Notarization for Your Everyday Needs</h2>
          <p className="text-gray-700 mb-4">
            Our Standard Notary service provides professional, on-site notarizations for a wide range of standard documents.
            Whether you're dealing with Powers of Attorney, affidavits, contracts, or other important paperwork,
            we ensure a smooth, precise, and calm experience.
          </p>
          <p className="text-gray-700 mb-6">
            We operate during standard business hours (9 am – 5 pm, Monday to Friday) and bring our services directly to your location,
            saving you time and hassle. Trust Houston Mobile Notary Pros to handle your documents with the care and expertise they deserve.
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-4">Key Features:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Service Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Documents:</strong> POAs, Affidavits, Contracts, Wills, Deeds, & more</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Travel:</strong> Included within a 15-mile radius (from 77591)</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Convenience:</strong> We come to your home, office, or other preferred location.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Professionalism:</strong> Experienced, certified, and insured notaries.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Pricing</h3>
            <p className="text-3xl font-bold text-[#002147] mb-1">$75+</p>
            <p className="text-sm text-gray-600 mb-4">Starting price for standard notarizations. Includes travel up to 15 miles and 1-2 notarized signatures. Additional signatures, documents, or mileage may incur extra fees. See our <Link href="/services/extras" className="text-[#A52A2A] hover:underline">Extras & Fees</Link> page for details.</p>
            <Link href="/booking">
              <Button size="lg" className="w-full sm:w-auto bg-[#002147] hover:bg-[#001a38] text-white">
                Book Standard Notary
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column - Benefits/Contact */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
              <FileText className="text-[#A52A2A] mr-2 h-6 w-6" /> Common Documents
            </h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Powers of Attorney (Financial, Medical)</li>
              <li>Affidavits & Sworn Statements</li>
              <li>Contracts & Business Agreements</li>
              <li>Last Will & Testament</li>
              <li>Trust Documents</li>
              <li>Quitclaim / Warranty Deeds</li>
              <li>Vehicle Title Transfers</li>
              <li>Minor Travel Consent Forms</li>
              <li>I-9 Employment Verification (as applicable)</li>
              <li>And many more...</li>
            </ul>
          </div>
          <div className="bg-[#002147] text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Users className="mr-2 h-6 w-6" /> Why Choose Us?
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Reliable & Punctual</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Clear Communication</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Meticulous Attention to Detail</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Insured for Your Peace of Mind</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
              <Phone className="text-[#A52A2A] mr-2 h-6 w-6" /> Have Questions?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              If you're unsure if this service fits your needs or have specific questions, don't hesitate to reach out.
            </p>
            <Link href="/contact">
              <Button variant="outline" className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={standardServiceFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Ready for a Hassle-Free Notarization?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Schedule your Standard Notary appointment today and experience the convenience and professionalism of Houston Mobile Notary Pros.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button size="lg" className="bg-[#002147] hover:bg-[#001a38] text-white">
              Book Standard Service
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]">
              Explore Other Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 