import Link from "next/link"
import { ChevronLeft, Check, AlertTriangle, Clock, Shield, Phone, Zap, MapPin, Users, Star, ArrowRight, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MiniFAQ from "@/components/mini-faq"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Emergency Notary Services Houston | 24/7 Urgent Mobile Notary | HMNP",
  description:
    "Emergency notary services available 24/7 in Houston. Urgent mobile notary for hospital visits, jail signings, time-sensitive documents. Same-day service guaranteed.",
  keywords:
    "emergency notary Houston, 24/7 notary services, urgent notary Houston, hospital notary, jail notary, emergency mobile notary, urgent document signing, 24 hour notary Houston, emergency signing services, urgent notarization",
  alternates: {
    canonical: '/services/emergency-notary',
  },
  openGraph: {
    title: "Emergency Notary Services Houston | 24/7 Urgent Mobile Notary | HMNP",
    description: "When you need a notary urgently in Houston, we're available 24/7. Hospital visits, jail signings, emergency documents - we respond fast.",
    url: `${BASE_URL}/services/emergency-notary`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Emergency Notary Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Emergency Notary Houston | 24/7 Urgent Mobile Notary | HMNP",
    description: "Emergency notary services available 24/7 in Houston. Hospital visits, jail signings, urgent documents. Fast response guaranteed.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const emergencyFaqs = [
  {
    id: "what-qualifies-emergency",
    question: "What qualifies as an emergency notary situation?",
    answer: (
      <p>
        Emergency notary situations include: hospitalization requiring urgent document signing, jail or detention facility notarizations, time-sensitive legal deadlines (court filings, real estate closings), last-minute travel requiring apostilles or powers of attorney, medical emergencies requiring healthcare directives, and any situation where standard business hours can't accommodate critical document needs. When you're under pressure, we respond fast.
      </p>
    ),
  },
  {
    id: "emergency-response-time",
    question: "How quickly can you respond to emergencies?",
    answer: (
      <p>
        For true emergencies, we guarantee response within 1-2 hours, 24/7/365. Hospital visits typically within 1 hour during peak times. Jail notarizations are scheduled same-day when facility permits. For urgent (non-emergency) situations, we offer our <Link href="/services/extended-hours-notary" className="text-[#A52A2A] hover:underline">Extended Hours service</Link> with 2-hour response during 7am-9pm daily.
      </p>
    ),
  },
  {
    id: "emergency-locations",
    question: "Where can you provide emergency notary services?",
    answer: (
      <p>
        We provide emergency services at: hospitals, rehabilitation centers, hospice facilities, county jails and detention centers, senior living communities, private residences, business offices after hours, and any location where urgent notarization is needed. We're familiar with Houston-area medical facilities and detention centers, understanding their specific requirements and visiting procedures.
      </p>
    ),
  },
  {
    id: "emergency-pricing",
    question: "How much do emergency notary services cost?",
    answer: (
      <p>
        Emergency service pricing starts at $150 base fee plus standard notarization fees ($5-10 per document). Additional charges may apply for: extreme after-hours (midnight-6am), hospital/jail facility requirements, extended travel beyond 30 miles, or holiday/weekend emergencies. We provide upfront pricing during your emergency call - no surprise fees when you're already stressed.
      </p>
    ),
  },
  {
    id: "emergency-preparation",
    question: "What should I prepare for an emergency notary visit?",
    answer: (
      <p>
        Have ready: valid government-issued photo ID for all signers, unsigned documents (we'll guide you through proper signing), contact information for all parties, location details and any access requirements (hospital room number, visitor procedures, etc.). For jail visits, we handle facility clearance procedures. Our emergency team will walk you through exactly what's needed when you call.
      </p>
    ),
  },
];

export default function EmergencyNotaryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to All Services
      </Link>

      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-3">
          Emergency Notary Services Houston
        </h1>
        <p className="text-2xl font-semibold text-[#A52A2A] mb-6">
          24/7 urgent mobile notary - when you can't wait.
        </p>
        
        {/* Emergency Response Banner */}
        <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] border-2 border-[#002147] rounded-lg px-8 py-6 mx-auto max-w-3xl mb-6">
          <div className="flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-white mr-4" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">EMERGENCY RESPONSE</div>
              <div className="text-white font-semibold text-xl">1-2 Hour Response • Available 24/7/365</div>
              <div className="text-sm text-red-100 mt-2">Hospital visits • Jail signings • Urgent documents</div>
            </div>
          </div>
        </div>
        
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
          When life throws unexpected curveballs requiring urgent notarization, we're here around the clock. Hospital rooms, detention facilities, or anywhere critical documents need immediate attention - we respond fast with professional, compassionate service.
        </p>
      </section>

      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Service Details */}
        <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Professional Emergency Response When Every Minute Counts</h2>
          <p className="text-gray-700 mb-4">
            Medical emergencies, legal deadlines, unexpected hospitalizations, or urgent travel needs don't follow business hours. Our certified emergency notary team understands the stress of time-sensitive situations and provides rapid, professional service exactly when you need it most.
          </p>
          <p className="text-gray-700 mb-6">
            We're experienced in navigating hospital protocols, jail facility requirements, and high-pressure situations while maintaining the precision and legal compliance your documents demand. Available 24/7/365 across the greater Houston area.
          </p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-4">Emergency Situations We Handle:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Hospital & Medical Facility Visits:</strong> ICU, rehabilitation centers, hospice care, surgical pre-ops</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Jail & Detention Center Signings:</strong> Harris County Jail, municipal facilities, federal detention</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Time-Critical Legal Documents:</strong> Court deadlines, real estate closings, estate planning emergencies</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Last-Minute Travel Documents:</strong> Powers of attorney, apostilles, travel consents for minors</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>Senior Living Communities:</strong> Assisted living, memory care facilities, nursing homes</span>
              </li>
              <li className="flex items-start">
                <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                <span><strong>After-Hours Business Emergencies:</strong> Contract signings, employment documents, corporate emergencies</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Emergency Service Pricing</h3>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-3xl font-bold text-[#A52A2A]">$150</span>
              <span className="text-lg text-gray-600">base emergency fee</span>
              <span className="text-xl text-gray-600">+</span>
              <span className="text-lg text-gray-600">notary fees</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Base fee covers emergency response, travel, and facility protocols. Standard notary fees apply ($5-10 per document). Additional charges for extreme after-hours, extended travel, or holiday service. Transparent pricing provided during your emergency call.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="tel:+12814042019">
                <Button size="lg" className="w-full sm:w-auto bg-[#DC2626] hover:bg-[#B91C1C] text-white">
                  Call Emergency Line
                  <Phone className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact?subject=Emergency%20Notary%20Inquiry">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                  Emergency Contact Form
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Houston Emergency Facilities Section */}
          <div className="bg-[#002147]/5 p-6 rounded-lg border border-[#002147]/20">
            <h3 className="text-xl font-semibold text-[#002147] mb-3 flex items-center">
              <MapPin className="text-[#002147] mr-2 h-5 w-5" /> Houston Emergency Service Areas
            </h3>
            <p className="text-gray-700 mb-4">
              We're familiar with emergency protocols at major Houston facilities including Houston Methodist, Memorial Hermann, Texas Medical Center, Harris County Jail, and detention centers throughout Harris, Fort Bend, and Montgomery counties.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Medical Centers:</strong> Texas Medical Center, Houston Methodist system, Memorial Hermann network, CHI St. Joseph Health
              </div>
              <div>
                <strong>Detention Facilities:</strong> Harris County Jail, federal detention centers, municipal facilities, immigration detention
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Emergency Contact & Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#DC2626] text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Phone className="mr-2 h-6 w-6" /> Emergency Contact
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm opacity-90">24/7 Emergency Line</p>
                <p className="text-2xl font-bold">(281) 404-2019</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Response Time</p>
                <p className="font-semibold">1-2 Hours Guaranteed</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Availability</p>
                <p className="font-semibold">24/7/365</p>
              </div>
            </div>
            <Link href="tel:+12814042019">
              <Button className="w-full mt-4 bg-white text-[#DC2626] hover:bg-gray-100">
                Call Now
                <Phone className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#002147] flex items-center">
                <Clock className="mr-2 h-5 w-5 text-[#A52A2A]" /> Emergency Response Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-gray-700">
                <li><strong>1. Call:</strong> Immediate assessment of urgency</li>
                <li><strong>2. Dispatch:</strong> Notary en route within 30 minutes</li>
                <li><strong>3. Navigate:</strong> Handle facility protocols/clearance</li>
                <li><strong>4. Execute:</strong> Professional notarization on-site</li>
                <li><strong>5. Complete:</strong> Secure document handling & delivery</li>
              </ol>
              <p className="text-xs text-gray-500 mt-3">Average total time: 1-3 hours depending on location and complexity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#002147] flex items-center">
                <Shield className="mr-2 h-5 w-5 text-[#A52A2A]" /> Emergency Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Insurance:</strong> $1M Errors & Omissions</p>
                <p><strong>Background:</strong> FBI & State cleared</p>
                <p><strong>Bonding:</strong> $25,000 surety bond</p>
                <p><strong>Training:</strong> Hospital & detention protocols</p>
                <p className="text-xs text-gray-500 pt-2">Licensed and insured for high-security environments</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#002147] flex items-center">
                <Users className="mr-2 h-5 w-5 text-[#A52A2A]" /> Non-Emergency Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 space-y-3">
                <div>
                  <p className="font-semibold">Same-Day Service:</p>
                  <Link href="/services/extended-hours-notary" className="text-[#A52A2A] hover:underline">Extended Hours (2-hour response)</Link>
                </div>
                <div>
                  <p className="font-semibold">Online Option:</p>
                  <Link href="/services/remote-online-notarization" className="text-[#A52A2A] hover:underline">RON Service (24/7 digital)</Link>
                </div>
                <div>
                  <p className="font-semibold">Standard Service:</p>
                  <Link href="/services/standard-notary" className="text-[#A52A2A] hover:underline">Mobile Notary (next day)</Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="my-12">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Emergency Notary Service FAQs</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={emergencyFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Don't Let Emergencies Wait for Business Hours</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          When urgent documents can't wait, Houston Mobile Notary Pros responds immediately. Professional, compassionate service exactly when you need it most.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="tel:+12814042019">
            <Button size="lg" className="bg-[#DC2626] hover:bg-[#B91C1C] text-white">
              Call Emergency Line
              <Phone className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contact?subject=Emergency%20Notary%20Information">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#002147]">
              Emergency Contact Form
              <FileText className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 