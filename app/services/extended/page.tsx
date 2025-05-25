import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Users, Clock, Phone, AlertTriangle } from 'lucide-react'
import MiniFAQ from '@/components/mini-faq'

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Extended Hours Notary Services | Houston Mobile Notary Pros",
  description:
    "Urgent & after-hours mobile notary (7 am–9 pm daily). When 9–5 won't cut it, we're there. Fast, precise, and reliable service for your time-sensitive documents.",
  keywords:
    "extended hours notary, after-hours notary, same-day notary, urgent notary Houston, Houston mobile notary, 7am-9pm notary, weekend notary",
  alternates: {
    canonical: '/services/extended',
  },
  openGraph: {
    title: "Extended Hours Notary | Houston Mobile Notary Pros",
    description: "Need a notary outside standard hours? Our Extended Hours service (7 am-9 pm daily) has you covered.",
    url: `${BASE_URL}/services/extended`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'Extended Hours Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Extended Hours Notary | Houston Mobile Notary Pros",
    description: "Don\'t let time constraints stop you. Get professional notary services from 7 am to 9 pm daily in Houston.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const extendedServiceFaqs = [
  {
    id: "extended-hours-details",
    question: "What are the specific hours for Extended Hours Notary service?",
    answer: (
      <p>
        Our Extended Hours Notary service is available 7 days a week, from 7:00 AM to 9:00 PM. This includes weekends and most holidays, subject to availability.
        This service is designed for situations that fall outside our <Link href="/services/standard" className="text-[#A52A2A] hover:underline">Standard Notary</Link> hours of 9 am - 5 pm, Monday to Friday.
      </p>
    ),
  },
  {
    id: "extended-response-time",
    question: "Is this a same-day or immediate response service?",
    answer: (
      <p>
        While we strive to accommodate urgent requests and often provide same-day service with our Extended Hours package, immediate dispatch (e.g., within 1 hour) may depend on current availability and location.
        We recommend booking as soon as you anticipate the need. For very urgent, time-critical situations, please call us directly at <a href="tel:+18326174285" className="text-[#A52A2A] hover:underline">(832) 617-4285</a> to discuss feasibility.
      </p>
    ),
  },
  {
    id: "extended-vs-standard-cost",
    question: "How does the pricing for Extended Hours compare to Standard Notary?",
    answer: (
      <p>
        The Extended Hours Notary service starts at $100+, reflecting the premium availability outside of standard business hours and often on shorter notice.
        Standard Notary service starts at $75. The increased price for extended hours covers the flexibility and readiness required for urgent or after-hours requests.
        Additional fees for mileage or specific complex documents may still apply. See our <Link href="/services/extras" className="text-[#A52A2A] hover:underline">Extras & Fees</Link> page for more details.
      </p>
    ),
  },
];

export default function ExtendedHoursNotaryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Extended Hours Notary Services
        </h1>
        <p className="text-2xl font-semibold text-[#A52A2A] mb-4">
          When 9–5 just won't cut it.
        </p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          Your critical documents demand professionalism, even when time is tight. Our Promise: Fast, precise notary service—every time, no hassle.
        </p>
      </section>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Service Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Urgent & After-Hours Notarizations, Handled with Precision</h2>
          <p className="text-gray-700 mb-4">
            Life doesn't always fit neatly into a 9-to-5 schedule. Our Extended Hours Notary service is designed for those moments when you need professional notary services urgently, in the early mornings, late evenings, or on weekends.
          </p>
          <p className="text-gray-700 mb-6">
            Operating from 7 am to 9 pm daily, we provide the same meticulous care and attention to detail for your time-sensitive documents as our standard service. Whether it's a last-minute business agreement, an urgent personal document, or any situation requiring notarization outside typical business hours, count on Houston Mobile Notary Pros.
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-4">Key Features:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Premium Availability:</strong> 7 days a week, 7:00 AM - 9:00 PM</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Ideal For:</strong> Urgent needs, same-day requests (subject to availability), after-hours & weekend signings.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Rapid Response:</strong> We prioritize accommodating your schedule for time-sensitive matters.</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Comprehensive Service:</strong> All standard document types handled with extended availability.</span>
              </li>
               <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Peace of Mind:</strong> Reliable, professional service even when you're short on time.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#A52A2A]/10 p-6 rounded-lg border border-[#A52A2A]/30">
            <h3 className="text-xl font-semibold text-[#A52A2A] mb-3">Pricing</h3>
            <p className="text-3xl font-bold text-[#A52A2A] mb-1">$100+</p>
            <p className="text-sm text-gray-700 mb-4">Starting price for extended hours notarizations. Includes travel up to 15 miles and 1-2 notarized signatures. Additional fees for mileage, specific complex documents, or extensive wait times may apply. See our <Link href="/services/extras" className="text-[#A52A2A] hover:underline">Extras & Fees</Link> page.</p>
            <Link href="/booking">
              <Button size="lg" className="w-full sm:w-auto bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                Book Extended Hours Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column - Benefits/Contact */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
              <AlertTriangle className="text-[#A52A2A] mr-2 h-6 w-6" /> When to Choose Extended Hours?
            </h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Urgent document signing deadlines</li>
              <li>Real estate closings after business hours</li>
              <li>Hospital or healthcare facility signings</li>
              <li>Airport or travel-related notarizations</li>
              <li>Weekend legal document needs</li>
              <li>Any situation requiring prompt, flexible service</li>
            </ul>
          </div>
           <div className="bg-[#002147] text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Users className="mr-2 h-6 w-6" /> Your Trusted Partner, Anytime
            </h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Professionalism, guaranteed</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Clarity, even under pressure</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Full E&O Insurance</li>
              <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Dedicated to your convenience</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
              <Phone className="text-[#A52A2A] mr-2 h-6 w-6" /> Need Immediate Assistance?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              For very urgent requests or to confirm immediate availability, please call us directly.
            </p>
            <a href="tel:+18326174285">
              <Button variant="outline" className="w-full border-[#A52A2A] text-[#A52A2A] hover:bg-[#A52A2A] hover:text-white">
                Call (832) 617-4285
              </Button>
            </a>
            <Link href="/contact" className="mt-3 block text-center">
                <Button variant="link" className="text-sm text-[#002147] hover:underline">
                    Or Send an Online Inquiry
                </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Extended Hours FAQs</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={extendedServiceFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Don't Let Time Hold You Back</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Secure your after-hours or urgent notarization with Houston Mobile Notary Pros. We're ready when you are.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
              Book Extended Hours
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]">
              View All Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 