import Link from 'next/link'
import { ChevronLeft, Check, DollarSign, MapPin, Clock, CalendarDays, Info, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SERVICES_CONFIG } from '@/lib/services/config'
import { PRICING_CONFIG } from '@/lib/pricing/base'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import MiniFAQ from '@/components/mini-faq'

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Notary Service Extras & Fees | Transparent Pricing | Houston Mobile Notary Pros",
  description:
    "Understand our transparent pricing for additional notary services and fees in Houston, including travel zones, after-hours, and weekend appointments. No surprises.",
  keywords:
    "notary fees Houston, mobile notary pricing, travel fee notary, after-hours notary fee, weekend notary fee, transparent notary pricing, additional notary services",
  alternates: {
    canonical: '/services/extras',
  },
  openGraph: {
    title: "Extras & Fees for Houston Mobile Notary Services | HMNP",
    description: "Clear, transparent pricing for travel zones, after-hours, weekend fees, and other additional notary services at Houston Mobile Notary Pros.",
    url: `${BASE_URL}/services/extras`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', 
        width: 1200,
        height: 630,
        alt: 'Notary Extras & Fees - Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Houston Notary Extras & Fees | Transparent & Fair | HMNP",
    description: "Know your costs upfront. View our clear list of additional notary service fees for travel, weekends, and after-hours in Houston.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const extrasFaqs = [
  {
    id: "when-travel-fee-applies",
    question: "When does the travel fee apply?",
    answer: (
      <div>
        <p>We use simple, fair travel zones from ZIP 77591:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>0–20 miles: included with Standard Mobile Notary</li>
          <li>21–30 miles: +$25</li>
          <li>31–40 miles: +$45</li>
          <li>41–50 miles: +$65 (maximum service area)</li>
        </ul>
        <p className="mt-2">Extended Hours and Loan Signing include travel up to 30 miles; the same tier applies beyond that. RON has no travel fees.</p>
      </div>
    ),
  },
  {
    id: "after-hours-definition",
    question: "What constitutes 'After-Hours' for the fee?",
    answer: (
      <p>
        The After-Hours Fee applies to appointments scheduled outside our Standard Notary service hours (9 am – 5 pm, Monday to Friday) but still within the operating window of our <Link href="/services/extended" className="text-[#A52A2A] hover:underline">Extended Hours Notary</Link> service (7 am – 9 pm daily). For example, an appointment at 7:30 pm on a weekday, or at 8 am on a weekday, might incur this fee if not booked as part of the Extended Hours package which has its own pricing structure.
      </p>
    ),
  },
  {
    id: "weekend-fee-details",
    question: "Is the Weekend Fee in addition to other fees?",
    answer: (
      <p>
        Yes, the Weekend Fee of $40 is for appointments scheduled on Saturdays or Sundays. It can be in addition to a mileage fee if applicable. Our Extended Hours Notary service is available on weekends and its pricing structure is designed to incorporate this premium availability. The $40 weekend fee is more typically applied if a Standard Notary service is exceptionally requested for a weekend.
      </p>
    ),
  },
  {
    id: "fee-transparency",
    question: "How will I know which fees apply to my booking?",
    answer: (
      <p>
        We believe in complete transparency. All applicable fees (mileage, after-hours, weekend, or for specific additional services like excessive wait time or extra witnesses) will be clearly communicated and agreed upon with you during the booking process before your appointment is confirmed. There are no hidden charges.
      </p>
    ),
  }
];

export default function ExtrasAndFeesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Notary Service Extras & Fees
        </h1>
        <p className="text-2xl font-semibold text-[#A52A2A] mb-4">
          Transparent pricing, no surprises.
        </p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          We believe in clear and upfront communication about all potential costs. This page outlines additional fees that may apply to your mobile notary service.
        </p>
      </section>

      {/* Main Fees Section */}
      <section className="mb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center mb-2">
                <MapPin className="h-8 w-8 text-[#002147] mr-3" />
                <CardTitle className="text-2xl text-[#002147]">Travel Fee (Tiered Zones)</CardTitle>
              </div>
              <CardDescription className="text-sm">Simple zones from ZIP 77591; max 50 miles.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-[#002147] font-semibold">
                <p>0–20 mi: Included (Standard)</p>
                <p>21–30 mi: +$25</p>
                <p>31–40 mi: +$45</p>
                <p>41–50 mi: +$65</p>
              </div>
              <p className="text-xs text-gray-600 mt-2">Extended Hours and Loan Signing include up to 30 miles. RON is remote and has no travel fee.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center mb-2">
                <Clock className="h-8 w-8 text-[#002147] mr-3" />
                <CardTitle className="text-2xl text-[#002147]">After-Hours Fee</CardTitle>
              </div>
              <CardDescription className="text-sm">For appointments outside 9 am - 5 pm, Mon-Fri (if not part of Extended Hours package).</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#002147] mb-2">${PRICING_CONFIG.surcharges.afterHours}</p>
              <p className="text-xs text-gray-600">
                This fee may apply for services scheduled before 9 am or after 5 pm on weekdays, if not covered by the <Link href="/services/extended" className="text-[#A52A2A] hover:underline">Extended Hours Notary</Link> service pricing.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center mb-2">
                <CalendarDays className="h-8 w-8 text-[#002147] mr-3" />
                <CardTitle className="text-2xl text-[#002147]">Weekend Fee</CardTitle>
              </div>
              <CardDescription className="text-sm">For appointments scheduled on Saturdays or Sundays.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#002147] mb-2">${PRICING_CONFIG.surcharges.weekend}</p>
              <p className="text-xs text-gray-600">
                Applies to services requested on a weekend. Our <Link href="/services/extended" className="text-[#A52A2A] hover:underline">Extended Hours Notary</Link> service is available on weekends and includes this premium availability in its pricing structure.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Other Potential Fees Section */}
      <section className="mb-12 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-[#002147] mb-6 text-center">Other Potential Service Fees</h2>
        <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto">
            In addition to the above, certain situations or specific requests might incur other modest fees. We always aim for full transparency.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-[#002147] mb-2 flex items-center"><DollarSign className="h-5 w-5 mr-2 text-[#A52A2A]" /> Excessive Wait Time</h3>
                <p className="text-sm text-gray-600">If our notary is required to wait for more than 15 minutes past the scheduled appointment time (due to signer delay or unpreparedness), a fee of $1 per minute may apply. We value your time and ours, and encourage punctuality.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-[#002147] mb-2 flex items-center"><Users className="h-5 w-5 mr-2 text-[#A52A2A]" /> Additional Signers/Witnesses</h3>
                <p className="text-sm text-gray-600">Base service fees typically include a set number of signers. If more signers are involved than quoted, or if we are requested to provide witnesses, additional fees may apply (e.g., $10 per additional signer/witness). Please inform us of all participants during booking.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-[#002147] mb-2 flex items-center"><FileText className="h-5 w-5 mr-2 text-[#A52A2A]" /> Document Printing/Scanning</h3>
                <p className="text-sm text-gray-600">For extensive document printing (e.g., large loan packages if not provided by title/lender) or scan-back services beyond a few pages, a nominal fee based on page count may be discussed. Basic printing for standard services is usually included.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-[#002147] mb-2 flex items-center"><Info className="h-5 w-5 mr-2 text-[#A52A2A]" /> Other Specific Requests</h3>
                <p className="text-sm text-gray-600">Unique situations or requests not covered by standard service descriptions (e.g., hospital parking fees, toll road charges for distant locations, specific courier services not included in loan signing) will be discussed and agreed upon upfront.</p>
            </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-8">
            <strong>Our Commitment:</strong> All applicable fees will be clearly communicated to you during the booking process for your approval before the service is rendered. We believe in honest and transparent pricing.
        </p>
      </section>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Extras & Fees FAQs</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={extrasFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Questions About Our Fees?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          We're happy to clarify any aspect of our pricing or provide a detailed quote for your specific notary needs. Contact us today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact?subject=Fee%20Inquiry">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
              Contact Us About Fees
            </Button>
          </Link>
          <Link href="/booking">
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]">
              Book a Notary Service
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 