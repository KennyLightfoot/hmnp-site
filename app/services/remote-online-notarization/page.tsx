import Link from "next/link"
import { ChevronLeft, Check, Users, Monitor, Shield, Clock, Globe, Phone, Info, ExternalLink, ArrowRight, Zap, FileText, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import EstimatorStrip from "@/components/EstimatorStrip"
import { SERVICES_CONFIG } from "@/lib/services/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MiniFAQ from "@/components/mini-faq"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Remote Online Notarization in Texas",
  description:
    "Meet with a Texas-commissioned notary online for fast, secure notarization that includes credential analysis, KBA, and digital journals.",
  keywords:
    "remote online notarization Texas, RON services Houston, online notary Texas, virtual notary",
  alternates: {
    canonical: `${BASE_URL}/services/remote-online-notarization`,
  },
  openGraph: {
    title: "Remote Online Notarization in Texas",
    description: "Statewide RON appointments with credential analysis, KBA, and recording included.",
    url: `${BASE_URL}/services/remote-online-notarization`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Remote Online Notarization Services by Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Remote Online Notarization in Texas",
    description: "Book a secure online notary session with credential analysis and KBA in minutes.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

const remoteOnlineSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Remote Online Notarization (RON) Texas",
  description:
    "Secure, Texas-compliant remote online notarization with credential analysis, KBA, and digital seal. Available statewide 24/7.",
  serviceType: "Remote Online Notarization",
  url: "https://houstonmobilenotarypros.com/services/remote-online-notarization",
  provider: {
    "@type": "LocalBusiness",
    name: "Houston Mobile Notary Pros",
    url: "https://houstonmobilenotarypros.com",
    telephone: "+1-832-617-4285",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77591",
      addressCountry: "US",
    },
  },
  areaServed: [
    { "@type": "State", name: "Texas", addressCountry: "US" },
  ],
  offers: {
    "@type": "Offer",
    price: "35.00",
    priceCurrency: "USD",
    description: "RON session includes credential analysis, KBA, and digital journal entry.",
    availability: "https://schema.org/InStock",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "RON Enhancements",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Additional Notarial Seal",
        price: "10.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Rush After-Hours Convenience Fee",
        price: "10.00",
        priceCurrency: "USD",
        availability: "https://schema.org/LimitedAvailability",
      },
      {
        "@type": "Offer",
        name: "Business Agreements with Multiple Signers",
        price: "55.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "247",
  },
}

const ronFaqs = [
  {
    id: "what-is-ron",
    question: "What is Remote Online Notarization (RON)?",
    answer: (
      <p>
        Remote Online Notarization (RON) allows you to get documents notarized online through a secure video conference with a commissioned Texas notary. Using state-approved technology, we verify your identity through credential analysis and knowledge-based authentication (KBA), witness your signature electronically, and apply a digital notarial seal. RON is legally equivalent to traditional in-person notarization and is recognized across all 50 states.
      </p>
    ),
  },
  {
    id: "ron-requirements-texas",
    question: "What are the requirements for RON in Texas?",
    answer: (
      <p>
        To use RON in Texas, you need: (1) A reliable internet connection, (2) A device with camera and microphone capabilities, (3) A valid government-issued photo ID (driver's license, passport, etc.), and (4) Documents in digital format (PDF). Our platform handles all technical requirements including credential analysis, identity verification, and secure document storage as required by Texas law.
      </p>
    ),
  },
  {
    id: "ron-vs-mobile",
    question: "When should I choose RON vs. mobile notary services?",
    answer: (
      <p>
        Choose RON when you need: immediate service (available 24/7), convenience from your location, faster turnaround, or when dealing with parties in different locations. Choose our <Link href="/services/standard-notary" className="text-[#A52A2A] hover:underline">mobile notary services</Link> when you prefer in-person interaction, have multiple signers in one location, need to notarize physical documents, or require witness services beyond the notary.
      </p>
    ),
  },
  {
    id: "ron-legal-validity",
    question: "Is RON legally valid and accepted everywhere?",
    answer: (
      <p>
        Yes! Texas RON is legally valid and recognized in all 50 states under the Full Faith and Credit Clause of the U.S. Constitution. Our RON platform meets all Texas Secretary of State requirements including tamper-evident technology, secure storage, and proper audit trails. Documents notarized through our RON service are accepted by banks, courts, government agencies, and businesses nationwide.
      </p>
    ),
  },
  {
    id: "ron-pricing-structure",
    question: "How does RON pricing work?",
    answer: (
      <p>
        Our RON pricing is transparent: $25 per session + $5 per notarial seal. A session covers the entire notarization process regardless of how many documents you have. Each document requiring notarization gets one seal ($5). For example: 3 documents = $25 session + $15 for seals = $40 total. Additional signers are $10 each. No hidden fees, no travel charges, no rush fees.
      </p>
    ),
  },
];

export default function RemoteOnlineNotarizationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(remoteOnlineSchema) }}
      />
      <div className="container mx-auto px-4 py-12">
        <Link href="/services" className="flex items-center text-[#002147] hover:text-[#A52A2A] mb-8">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to All Services
        </Link>

        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#002147] mb-3">
            Upload. Verify. Notarized — often in 15–30 minutes.
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-4">
            Built on Proof.com. From $35 online. Texas‑compliant with credential analysis, KBA, and recording.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm mb-6">
            <span className="inline-flex items-center rounded-full bg-[#002147]/5 border border-[#002147]/10 text-[#002147] px-3 py-1">Credential analysis</span>
            <span className="inline-flex items-center rounded-full bg-[#002147]/5 border border-[#002147]/10 text-[#002147] px-3 py-1">KBA</span>
            <span className="inline-flex items-center rounded-full bg-[#002147]/5 border border-[#002147]/10 text-[#002147] px-3 py-1">AV recording</span>
            <span className="inline-flex items-center rounded-full bg-[#002147]/5 border border-[#002147]/10 text-[#002147] px-3 py-1">Transparent pricing</span>
          </div>
          <div className="max-w-3xl mx-auto mt-6">
            <EstimatorStrip defaultMode="RON" />
          </div>
        </section>

        {/* Main Content Area */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Service Details */}
          <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#002147] mb-6">Professional RON Services Across Texas</h2>
            <p className="text-gray-700 mb-4">
              Remote Online Notarization represents the future of notarial services, combining traditional notarial standards with cutting-edge technology. Our Texas-licensed notaries use state-approved platforms to provide secure, convenient, and legally compliant notarization services 24/7.
            </p>
            <p className="text-gray-700 mb-6">
              Whether you're in Houston, Dallas, Austin, San Antonio, or anywhere else in Texas, our RON services bring professional notarization directly to your device. Perfect for busy professionals, remote workers, or anyone who values convenience without compromising security or legal compliance.
            </p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#002147] mb-4">What's Included in Every RON Session:</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                  <span><strong>Credential Analysis:</strong> Advanced ID verification using tamper-detection technology</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                  <span><strong>Knowledge-Based Authentication (KBA):</strong> Additional identity verification through public records</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                  <span><strong>Audio-Video Recording:</strong> Complete session recording stored securely for 10+ years</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                  <span><strong>Digital Notarial Seal:</strong> Tamper-evident electronic seal with notary commission details</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                  <span><strong>Secure Document Storage:</strong> Encrypted storage and instant download of completed documents</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-[#A52A2A] mr-2 h-6 w-6 mt-0.5 shrink-0" />
                  <span><strong>Texas Compliance:</strong> Meets all Texas Secretary of State requirements for RON</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <h3 className="text-xl font-semibold text-[#002147] mb-3">Transparent RON Pricing</h3>
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.RON_SERVICES.basePrice}</span>
                <span className="text-lg text-gray-600">/session</span>
                <span className="text-xl text-gray-600">+</span>
                <span className="text-3xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.RON_SERVICES.sealPrice}</span>
                <span className="text-lg text-gray-600">/seal</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Session fee covers the entire notarization process. Each document requiring notarization gets one seal. Additional signers: $10 each. No hidden fees, travel charges, or rush fees.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/ron/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                    Start RON Session Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/ron/how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                    How RON Works
                    <Info className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Texas RON Law Section */}
            <div className="bg-[#002147]/5 p-6 rounded-lg border border-[#002147]/20">
              <h3 className="text-xl font-semibold text-[#002147] mb-3 flex items-center">
                <Shield className="text-[#002147] mr-2 h-5 w-5" /> Texas RON Compliance & Legal Authority
              </h3>
              <p className="text-gray-700 mb-4">
                Texas authorized Remote Online Notarization in 2018, making us one of the early adopters. Our RON services comply with Texas Government Code Chapter 406 and Administrative Code Title 1, Part 4. Every notarization creates a tamper-evident audit trail and is backed by our $1M Errors & Omissions insurance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Authorized Documents:</strong> Most document types including contracts, affidavits, powers of attorney, acknowledgments, and jurats.
                </div>
                <div>
                  <strong>Legal Recognition:</strong> Accepted in all 50 states and recognized by federal agencies, banks, and courts.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Process & Benefits */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#002147] text-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Monitor className="mr-2 h-6 w-6" /> Why Choose Our RON Services?
              </h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Available 24/7, 365 days/year</li>
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Texas-licensed & insured notaries</li>
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Bank-level security & encryption</li>
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Instant document download</li>
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />No software installation required</li>
                <li className="flex items-start"><Check className="mr-2 mt-1 h-4 w-4 shrink-0" />Multi-device compatibility</li>
              </ul>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147] flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-[#A52A2A]" /> Quick RON Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li><strong>1. Access Proof:</strong> Book with HMNP → open the Proof.com link from your email/dashboard (create a Proof account if new)</li>
                  <li><strong>2. Upload:</strong> Add your PDF documents in Proof (or we can upload for you)</li>
                  <li><strong>3. Verify:</strong> Complete KBA and ID scan (credential analysis)</li>
                  <li><strong>4. Connect:</strong> Join the secure video call with the notary</li>
                  <li><strong>5. Sign & Download:</strong> E‑sign in Proof and download notarized copies; your Proof account keeps access</li>
                </ol>
                <p className="text-xs text-gray-500 mt-3">Average session time: 5-10 minutes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#002147] flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-[#A52A2A]" /> Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Primary:</strong> Houston, Dallas, Austin, San Antonio</p>
                  <p><strong>Statewide:</strong> All Texas cities and counties</p>
                  <p><strong>Document Acceptance:</strong> Nationwide recognition</p>
                  <p className="text-xs text-gray-500 pt-2">RON services available to all Texas residents regardless of location</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[#002147] mb-3 flex items-center">
                <Phone className="text-[#A52A2A] mr-2 h-6 w-6" /> Need Help Getting Started?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                First time using RON? Our team can guide you through the process and answer any questions about online notarization.
              </p>
              <Link href="/contact?subject=RON%20Support">
                <Button variant="outline" className="w-full border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                  Get RON Support
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="my-12">
          <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Remote Online Notarization FAQs</h2>
          <div className="max-w-3xl mx-auto">
            <MiniFAQ faqs={ronFaqs} />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Experience the Future of Notarization</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Join thousands of Texans who've discovered the convenience of Remote Online Notarization. Secure, legal, and available whenever you need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ron/dashboard">
              <Button size="lg" className="bg-white text-[#A52A2A] hover:bg-gray-100">
                Start Your RON Session
                <Video className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/ron/how-it-works">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#A52A2A]">
                Learn How It Works
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
} 