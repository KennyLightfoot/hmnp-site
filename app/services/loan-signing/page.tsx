import Link from "next/link"
import { ChevronLeft, Check, FileText, Users, Clock, Briefcase, Phone, Info, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MiniFAQ from "@/components/mini-faq"; // Assuming you have this component

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Houston Loan Signing Agent | Certified Specialists | HMNP",
  description:
    "Houston's certified loan signing agents. Expert handling of purchases, refinances, HELOCs. Flawless signings or we pay the redraw fee. Book today for precision you can trust.",
  keywords:
    "loan signing specialist Houston, mobile notary loan signing, certified loan signer, mortgage signing agent, HELOC notary, reverse mortgage signing Houston, RON notary, real estate closing, courier returns, paperwork pros",
  alternates: {
    canonical: '/services/loan-signing',
  },
  openGraph: {
    title: "Houston Loan Signing Specialist | Certified & Reliable | HMNP",
    description: "Houston Mobile Notary Pros: Your certified Loan Signing Specialists for smooth, accurate real estate closings, including RON and reverse mortgages.",
    url: `${BASE_URL}/services/loan-signing`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'Loan Signing Specialist Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Loan Signing Specialist Houston: Certified Pros You Can Trust | HMNP",
    description: "Need a Loan Signing Specialist in Houston? We handle all loan types, RON, and courier returns with precision. Book with the paperwork pros!",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const loanSigningFaqs = [
  {
    id: "what-is-lsa",
    question: "What does a Loan Signing Specialist do?",
    answer: (
      <p>
        A Loan Signing Specialist (or Loan Signing Agent) is a notary public specifically trained to handle and notarize loan documents for real estate transactions. We guide signers through the paperwork, ensure all signatures and initials are correctly placed, and return the documents promptly to the lender or title company. Our role is to ensure a smooth, accurate, and compliant closing process.
      </p>
    ),
  },
  {
    id: "loan-types-covered",
    question: "What types of loan signings do you handle?",
    answer: (
      <p>
        Our certified Loan Signing Specialists are experienced with a wide range of real estate transactions, including: Purchase agreements, Refinances, Home Equity Lines of Credit (HELOCs), Seller packages, and <Link href="/services/reverse-mortgage" className="text-[#A52A2A] hover:underline">Reverse Mortgages</Link>. We also offer Remote Online Notarization (RON) for eligible signings.
      </p>
    ),
  },
  {
    id: "ron-courier",
    question: "Do you offer Remote Online Notarization (RON) and courier services?",
    answer: (
      <p>
        Yes! We are equipped to handle Remote Online Notarizations (RON) for clients who prefer a digital closing experience or when signers are in different locations. We also manage all necessary courier returns (e.g., FedEx, UPS) to ensure your completed loan package is delivered securely and on time.
      </p>
    ),
  },
  {
    id: "booking-process-loan",
    question: "How do I book a Loan Signing Specialist?",
    answer: (
      <p>
        You can book our Loan Signing Specialist service directly through our <Link href="/booking?service=loan-signing" className="text-[#A52A2A] hover:underline">online booking system</Link> or by <Link href="/contact" className="text-[#A52A2A] hover:underline">contacting us</Link> with your signing details (date, time, location, type of loan). We coordinate with title companies and lenders to ensure we have the documents and instructions needed.
      </p>
    ),
  }
];

export default function LoanSigningPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Loan Signing Specialist Services
        </h1>
        <p className="text-2xl font-semibold text-[#A52A2A] mb-6">
          Paperwork pros you can trust.
        </p>
        
        {/* Guarantee Banner - Prominent for Loan Signings */}
        <div className="bg-gradient-to-r from-[#003C2D] to-[#005544] border-2 border-yellow-400 rounded-lg px-8 py-6 mx-auto max-w-3xl mb-6">
          <div className="flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-400 mr-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">LOAN SIGNING GUARANTEE</div>
              <div className="text-white font-semibold text-xl">Flawless the first time—or we pay the redraw fee</div>
              <div className="text-sm text-gray-200 mt-2">We eliminate sloppy signings that kill funding. Zero tolerance for errors.</div>
              <div className="text-xs text-gray-300 mt-1">*Terms apply. Valid for notarization errors due to our oversight.</div>
            </div>
          </div>
        </div>
        
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          Your critical loan documents demand more than just a stamp. They Demand Our Expertise. Our Promise: Fast, precise notary service—every time, no hassle.
        </p>
      </section>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Service Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Certified Expertise for Your Real Estate Transactions</h2>
          <p className="text-gray-700 mb-4">
            Navigating the complexities of real estate closings requires specialized knowledge and meticulous attention to detail. Our certified Loan Signing Specialists are dedicated to providing a seamless, accurate, and stress-free experience for borrowers, lenders, and title companies alike.
          </p>
          <p className="text-gray-700 mb-6">
            We handle all types of loan documents, including purchases, refinances, HELOCs, and reverse mortgages. With expertise in Remote Online Notarization (RON) and efficient courier return services, we ensure your transaction is completed correctly and on schedule, whether in-person or online.
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-4">Key Features of Our Loan Signing Service:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Certified Loan Signing Agents:</strong> Trained and experienced in all types of real estate loan documents.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Comprehensive Document Handling:</strong> Includes Purchases, Refinances, HELOCs, Seller Packages, and Reverse Mortgages.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Remote Online Notarization (RON):</strong> Available for eligible signings, providing convenience and flexibility.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Courier & Scan-Back Services:</strong> Efficient management of document returns (FedEx, UPS, scan-backs) to meet deadlines.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Meticulous & Professional:</strong> We ensure every signature, initial, and date is correct, preventing funding delays.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Pricing</h3>
            <p className="text-3xl font-bold text-[#002147] mb-1">$200+</p>
            <p className="text-sm text-gray-600 mb-4">Starting price for comprehensive loan signing services. This includes handling of all documents, travel within our standard service area, RON setup if applicable, and standard courier returns. Specific requirements for your signing will be confirmed upon booking. Visit our <Link href="/services/extras" className="text-[#A52A2A] hover:underline">Extras & Fees</Link> page for more details.</p>
            <Link href="/booking?service=loan-signing">
              <Button size="lg" className="w-full sm:w-auto bg-[#002147] hover:bg-[#001a38] text-white">
                Book Loan Signing Specialist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Reverse Mortgage Section */}
          <div className="bg-[#002147]/5 p-6 rounded-lg border border-[#002147]/20">
            <h3 className="text-xl font-semibold text-[#002147] mb-3 flex items-center">
              <Info className="text-[#002147] mr-2 h-5 w-5" /> Specialized in Reverse Mortgages
            </h3>
            <p className="text-gray-700 mb-4">
              Reverse mortgage signings require specific expertise and sensitivity. Our specialists are well-versed in these unique transactions, ensuring all documents are handled with the utmost care and all signers feel comfortable and informed (within the scope of our notarial duties).
            </p>
            <Link href="/services/reverse-mortgage">
              <Button variant="outline" size="sm" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                Learn More About Reverse Mortgage Signings
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column - Why Choose Us / Legal */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#002147] text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Briefcase className="mr-2 h-6 w-6" /> Why Entrust Us With Your Closing?
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Certified & Insured ($1M E&O)</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />NNA Background Screened</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Punctual & Reliable Professionals</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Flexible Scheduling (Evenings/Weekends)</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Clear, Calm Communication</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Commitment to Accuracy</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-[#002147] mb-3">Legal Disclaimer</h3>
            <p className="text-xs text-gray-600 mb-2">
              As Loan Signing Specialists, we are not attorneys. We cannot provide legal advice or explain loan terms.
              Our role is to ensure documents are signed and notarized correctly.
            </p>
            <p className="text-xs italic text-gray-500">
              "I AM NOT AN ATTORNEY LICENSED TO PRACTICE LAW IN TEXAS AND MAY NOT GIVE LEGAL ADVICE OR ACCEPT FEES FOR LEGAL ADVICE." (Texas Gov't Code §406.017)
            </p>
            <p className="text-xs text-gray-600 mt-2">
              For questions about your loan, please contact your lender or title company.
            </p>
          </div>
           <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
              <Phone className="text-[#A52A2A] mr-2 h-6 w-6" /> Questions or Title Company Inquiries?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We partner with title companies and lenders to provide seamless closing experiences. Contact us for collaboration or if you have specific questions.
            </p>
            <Link href="/contact?subject=Loan%20Signing%20Inquiry">
              <Button variant="outline" className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Process Section (Simplified from existing, if applicable) */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Our Streamlined Loan Signing Process</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="bg-[#002147] text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">1</div>
            <h4 className="font-semibold text-[#002147] mb-1">Receive & Review</h4>
            <p className="text-xs text-gray-600">Docs received from title/lender, meticulously reviewed.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="bg-[#002147] text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">2</div>
            <h4 className="font-semibold text-[#002147] mb-1">Confirm & Travel</h4>
            <p className="text-xs text-gray-600">Appointment confirmed, notary travels to your location.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="bg-[#002147] text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">3</div>
            <h4 className="font-semibold text-[#002147] mb-1">Sign & Notarize</h4>
            <p className="text-xs text-gray-600">IDs verified, documents professionally signed & notarized.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="bg-[#002147] text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">4</div>
            <h4 className="font-semibold text-[#002147] mb-1">Return & Close</h4>
            <p className="text-xs text-gray-600">Docs promptly returned per instructions, ensuring funding.</p>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Loan Signing FAQs</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={loanSigningFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Trust Your Closing to Certified Professionals</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Experience a smooth, accurate, and stress-free loan signing with Houston Mobile Notary Pros. We are your dedicated paperwork pros.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking?service=loan-signing">
            <Button size="lg" className="bg-[#002147] hover:bg-[#001a38] text-white">
              Book Loan Signing Specialist
            </Button>
          </Link>
          <Link href="/contact?subject=Loan%20Signing%20Partnership">
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]">
              Title Company Partnerships
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
