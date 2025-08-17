import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Check, Clock, MapPin, Shield, FileText, Users, DollarSign, Calendar, Briefcase, Award, Building, PlusCircle, Info, ListPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import MiniFAQ from "@/components/mini-faq"
import { SERVICES_CONFIG } from "@/lib/services/config"
import { PRICING_CONFIG } from "@/lib/pricing/base"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Houston Mobile Notary Services | 24/7 Loan Signing & More | HMNP",
  description:
    "Complete mobile notary services in Houston. 24/7 loan signing agent, estate planning, business solutions. Flawless service—or we pay the redraw fee. Book today.",
  keywords:
    "mobile notary, Houston notary, standard notary, extended hours notary, loan signing specialist, specialty notary services, business notary solutions, transparent pricing, notary services, loan signing, priority notary",
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: "Notary Services You Can Rely On | Houston Mobile Notary Pros",
    description: "Our Promise: Fast, precise notary service—every time, no hassle. Discover our range of mobile notary services tailored to your needs.",
    url: `${BASE_URL}/services`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Houston Mobile Notary Pros Service Offerings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Notary Services You Can Rely On | Houston Mobile Notary Pros",
    description: "Need a reliable mobile notary in Houston? We offer fast, precise service for all your notary needs. Our Promise: Fast, precise notary service—every time, no hassle.",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function ServicesPage() {
  const formatHours = (hours: { start: number; end: number; days: number[] }) => {
    if (hours.start === 0 && hours.end === 24 && hours.days.length === 7) {
      return '24/7'
    }
    const to12h = (h: number) => {
      const suffix = h >= 12 ? 'pm' : 'am'
      const hour = h % 12 === 0 ? 12 : h % 12
      return `${hour} ${suffix}`
    }
    const isDaily = hours.days.length === 7
    const isMF = hours.days.length === 5 && hours.days.every(d => [1,2,3,4,5].includes(d))
    const dayLabel = isDaily ? 'Daily' : (isMF ? 'M-F' : 'By Appt')
    return `${to12h(hours.start)}–${to12h(hours.end)} ${dayLabel}`
  }
  // Move services array inside the component
  const services = [
    {
      slug: "standard-notary",
      name: "Standard Notary Services",
      price: `$${SERVICES_CONFIG.STANDARD_NOTARY.basePrice}+`,
      tagline: "On-time, every time.",
      description:
        "On-site notarizations of standard documents (POAs, affidavits, contracts) between 9 am–5 pm.",
      link: "/services/standard-notary",
      icon: FileText,
      features: [
        "POAs, affidavits, contracts",
        "Service between 9 am - 5 pm",
        `Travel within ${SERVICES_CONFIG.STANDARD_NOTARY.includedRadius} miles included`,
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "extended-hours-notary",
      name: "Extended Hours Notary",
      price: `$${SERVICES_CONFIG.EXTENDED_HOURS.basePrice}+`,
      tagline: "Urgent notarization, 2-hour response.",
      description:
        "Guaranteed 2-hour response for urgent notarization needs, available 7am-9pm daily.",
      link: "/services/extended-hours-notary",
      icon: Clock,
      features: [
        "2-hour response guarantee",
        "Service 7am-9pm daily",
        `Up to ${SERVICES_CONFIG.EXTENDED_HOURS.maxDocuments} documents, 2 signers`,
      ],
      bgColor: "bg-[#A52A2A]",
      borderColor: "border-t-[#A52A2A]",
      buttonVariant: "default" as "outline" | "default",
      textColor: "text-white",
      hoverBgColor: "hover:bg-[#8B0000]",
      isPopular: true,
    },
    {
      slug: "loan-signing-specialist",
      name: "Loan Signing Specialist",
      price: `$${SERVICES_CONFIG.LOAN_SIGNING.basePrice}+`,
      tagline: "Paperwork pros you can trust.",
      description:
        "Certified loan signings, including all trip-chain, remote online signings, and courier returns.",
      link: "/services/loan-signing-specialist",
      icon: Briefcase,
      features: [
        "Certified loan signings",
        "RON and courier returns",
        "Meticulous & professional",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "estate-planning",
      name: "Estate Planning Package",
      price: "$250+",
      tagline: "Secure your legacy, simply.",
      description:
        "A comprehensive package for notarizing all your estate documents—Wills, Trusts, POAs, and more.",
      link: "/services/estate-planning", // Links to the main service page
      icon: Shield,
      features: [
        "Notarize up to 10 documents",
        "Includes up to 4 signers",
        "Mobile service to your location",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "specialty",
      name: "Specialty Notary Services",
      price: "$150+",
      tagline: "Complex docs handled.",
      description:
        "Apostilles, embassy certifications, translations, and other complex notarial acts.",
      link: "/services/specialty",
      icon: Award,
      features: [
        "Apostilles, translations",
        "Embassy certifications",
        "Expert handling of unique needs",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "business",
      name: "Business Notary Solutions",
      price: "$250+",
      tagline: "Keep your business moving.",
      description:
        "Volume signings, block-booking discounts, corporate account setups, and recurring appointments.",
      link: "/services/business",
      icon: Building,
      features: [
        "Volume & block-booking discounts",
        "Corporate accounts",
        "Recurring appointments",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
    {
      slug: "extras",
      name: "Extras & Fees",
      price: "See details",
      tagline: "Transparent pricing, no surprises.",
      description:
        `Travel Zones: 0–20 mi included (Standard) • 21–30 +$25 • 31–40 +$45 • 41–50 +$65 • After-Hours Fee: $${PRICING_CONFIG.surcharges.afterHours} • Weekend Fee: $${PRICING_CONFIG.surcharges.weekend}`,
      link: "/services/extras",
      icon: ListPlus,
      features: [
        "Travel: 21–30 +$25; 31–40 +$45; 41–50 +$65",
        "After-Hours Fee: $30",
        "Weekend Fee: $40",
      ],
      bgColor: "bg-[#002147]",
      borderColor: "border-t-[#002147]",
      buttonVariant: "outline" as "outline" | "default",
      textColor: "text-[#002147]",
      hoverBgColor: "hover:bg-[#002147]",
      hoverTextColor: "hover:text-white",
    },
  ];

  // Updated FAQ data
  const serviceFaqs = [
    {
      id: "service-difference",
      question: "What's the difference between your service packages?",
      answer: (
        <p>
          Our services are designed to meet diverse needs:
          <strong className="block mt-2">Standard Notary:</strong> For on-site notarizations of standard documents (POAs, affidavits, contracts) during 9 am–5 pm.
          <strong className="block mt-2">Priority Mobile Notary:</strong> Guaranteed 2-hour response for urgent notarization needs, available 7am-9pm daily.
          <strong className="block mt-2">Extended Hours Notary:</strong> Offers same-day or after-hours service (7 am–9 pm) for urgent needs outside standard business hours.
          <strong className="block mt-2">Loan Signing Specialist:</strong> Provides certified loan signings, including remote online notarizations (RON) and courier services.
          <strong className="block mt-2">Specialty Notary Services:</strong> Covers complex notarial acts like apostilles, embassy certifications, and translations.
          <strong className="block mt-2">Business Notary Solutions:</strong> Caters to businesses with volume signings, block-booking discounts, and corporate account setups.
          Each service ensures professionalism and precision. Please check individual service details for specifics.
        </p>
      ),
    },
    {
      id: "service-area",
      question: "How far do you travel for your services?",
      answer: (
        <p>
          We serve clients within a 20-mile radius of ZIP code 77591 at no additional travel fee (Standard). Beyond that we
          use simple travel zones: 21–30 miles +$25, 31–40 miles +$45, 41–50 miles +$65 (maximum service area). Extended Hours
          and Loan Signing include travel up to 30 miles.
        </p>
      ),
    },
    {
      id: "weekend-availability",
      question: "Do you offer weekend services?",
      answer: (
        <p>
          Yes, we offer weekend services for all our service packages with a $50 weekend surcharge. Our Priority Service
          is available 7 days a week from 7am-9pm, including weekends. Weekend appointments should be booked at least 48
          hours in advance when possible.
        </p>
      ),
    },
    {
      id: "prevent-mistakes",
      question: "I'm worried about making a mistake on important documents. How do you help prevent that?",
      answer: (
        <p>
          We understand! Our process is built on precision and clarity. We guide you patiently, explain documents
          clearly, and double-check everything – from ID verification to signatures and dates – to ensure accuracy
          and prevent errors that could cause future issues. Your confidence is our priority.
        </p>
      ),
    },
    {
      id: "hmnp-difference",
      question: "What makes your notary service different from others?",
      answer: (
        <p>
          Beyond convenience, we're committed to a higher standard of care. This means arriving early and
          professionally, explaining everything without jargon, ensuring every detail is accurate, and following
          through diligently. We believe every signing deserves this level of dedication for your peace of mind.
        </p>
      ),
    },
    {
      id: "notary-process",
      question: "What is the mobile notary process like?",
      answer: (
        <p>
          We aim for a clear, calm, and professional experience every time. We've outlined our entire mobile notary process
          from start to finish for your convenience. Please visit our{" "}
          <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline font-medium">
            What to Expect page
          </Link>{" "}
          for a detailed guide.
        </p>
      ),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="hero text-center mb-16">
  <h1 className="text-4xl font-bold text-[#002147] mb-4">
    Notary Services You Can Rely On
  </h1>
  <p className="subtitle text-xl text-gray-600 max-w-3xl mx-auto mb-6">
    Our Promise: Fast, precise notary service—every time, no hassle.
  </p>
  
  {/* Guarantee Banner */}
  <div className="bg-gradient-to-r from-[#002147] to-[#001a38] border-2 border-[#A52A2A] rounded-lg px-8 py-6 mx-auto max-w-2xl">
    <div className="flex items-center justify-center">
      <svg className="w-8 h-8 text-[#A52A2A] mr-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <div className="text-center">
        <div className="text-xl font-bold text-[#A52A2A]">OUR GUARANTEE</div>
        <div className="text-white font-semibold text-lg">Flawless the first time—or we pay the redraw fee</div>
        <div className="text-xs text-[#91A3B0] mt-2">*Terms apply. Valid for notarization errors due to our oversight.</div>
      </div>
    </div>
  </div>
</section>

      {/* Service Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick-Stamp Local - NEW per SOP */}
        <Card className="relative overflow-hidden border-2 border-[#91A3B0]/20 hover:border-[#A52A2A]/30 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 left-0 bg-[#A52A2A] text-white px-3 py-1 text-xs font-bold rounded-br-lg">
            NEW
          </div>
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#A52A2A]/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#A52A2A]" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#002147]">Quick-Stamp Local</CardTitle>
                <CardDescription className="text-[#91A3B0]">Fast & simple local signings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.QUICK_STAMP_LOCAL.basePrice}</span>
              <span className="text-sm text-gray-500">starting at</span>
              <span className="text-xs text-[#002147] ml-2"><Link href="/services/extras#travel-tiers" className="underline">See travel tiers</Link></span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ 1 document, ≤ 2 stamps</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>1 signer included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ 10 miles travel included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Perfect for simple documents</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Add-ons:</strong> Extra stamp $5 ea. • Extra signer $10 ea.
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">
              <Link href="/booking?service=quick-stamp-local">Book Quick-Stamp</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Standard Mobile Notary - Updated pricing */}
        <Card className="border-2 border-[#91A3B0]/20 hover:border-[#A52A2A]/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#002147]" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#002147]">Standard Mobile Notary</CardTitle>
                <CardDescription className="text-[#91A3B0]">Professional document notarization</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.STANDARD_NOTARY.basePrice}</span>
              <span className="text-sm text-gray-500">base price</span>
              <span className="text-xs text-[#002147] ml-2"><Link href="/services/extras#travel-tiers" className="underline">See travel tiers</Link></span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ {SERVICES_CONFIG.STANDARD_NOTARY.maxDocuments} documents included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ 2 signers included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ {SERVICES_CONFIG.STANDARD_NOTARY.includedRadius} miles travel included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>9 AM – 5 PM weekdays</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Add-ons:</strong> Extra doc $10 ea. • Extra signer $5 ea.
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-[#002147] hover:bg-[#001a38]">
              <Link href="/booking?service=standard-notary">Book Standard</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Extended Hours Mobile - Updated pricing */}
        <Card className="border-2 border-[#91A3B0]/20 hover:border-[#A52A2A]/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#A52A2A]/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#A52A2A]" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#002147]">Extended Hours Mobile</CardTitle>
                <CardDescription className="text-[#91A3B0]">Flexible scheduling & same-day service</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.EXTENDED_HOURS.basePrice}</span>
              <span className="text-sm text-gray-500">base price</span>
              <span className="text-xs text-[#002147] ml-2"><Link href="/services/extras#travel-tiers" className="underline">See travel tiers</Link></span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ {SERVICES_CONFIG.EXTENDED_HOURS.maxDocuments} documents included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ 2 signers included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ {SERVICES_CONFIG.EXTENDED_HOURS.includedRadius} miles travel included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>7 AM – 9 PM daily</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Add-ons:</strong> Same-day +$25 after 3 PM • Night (9 PM – 7 AM) +$50 • Extra doc $10 ea. • Extra signer $5 ea.
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">
              <Link href="/booking?service=extended-hours">Book Extended Hours</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Loan Signing Specialist - Updated pricing */}
        <Card className="border-2 border-[#91A3B0]/20 hover:border-[#A52A2A]/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-[#002147]" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#002147]">Loan Signing Specialist</CardTitle>
                <CardDescription className="text-[#91A3B0]">Expert real estate closings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.LOAN_SIGNING.basePrice}</span>
              <span className="text-sm text-gray-500">flat fee</span>
              <span className="text-xs text-[#002147] ml-2"><Link href="/services/extras#travel-tiers" className="underline">See travel tiers</Link></span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Single package included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ 4 signers included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Print 2 sets included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>≤ 2 hours table time</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>FedEx drop included</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Add-ons:</strong> Rush print +$20 • Scan-back +$15
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-[#002147] hover:bg-[#001a38]">
              <Link href="/booking?service=loan-signing">Book Loan Signing</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Remote Online Notarization (RON) - Updated pricing */}
        <Card className="border-2 border-[#91A3B0]/20 hover:border-[#A52A2A]/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#A52A2A]/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#A52A2A]" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#002147]">Remote Online Notarization (RON)</CardTitle>
                <CardDescription className="text-[#91A3B0]">Secure online notarization</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.RON_SERVICES.basePrice}</span>
              <span className="text-sm text-gray-500">/session +</span>
              <span className="text-2xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.RON_SERVICES.sealPrice}</span>
              <span className="text-sm text-gray-500">/seal</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Credential Analysis included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>KBA verification included</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Audio-video recording</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Texas statewide service</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Add-ons:</strong> Extra signer $10 ea.
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full bg-[#A52A2A] hover:bg-[#8B0000]">
              <Link href="/ron/dashboard">Start RON Session</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/ron/how-it-works">How RON Works</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Business Solutions - Updated pricing */}
        <Card className="border-2 border-[#91A3B0]/20 hover:border-[#A52A2A]/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#002147]/10 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-[#002147]" />
              </div>
              <div>
                <CardTitle className="text-xl text-[#002147]">Business Subscription</CardTitle>
                <CardDescription className="text-[#91A3B0]">Ongoing business needs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.BUSINESS_ESSENTIALS.basePrice}</span>
                <span className="text-sm text-gray-500">/month</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Essentials</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-[#A52A2A]">${SERVICES_CONFIG.BUSINESS_GROWTH.basePrice}</span>
                <span className="text-sm text-gray-500">/month</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Growth</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span><strong>Essentials:</strong> Up to 10 RON seals/mo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span><strong>Growth:</strong> Up to 40 RON seals/mo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>10% off mobile rates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span><strong>Growth:</strong> 1 free loan signing</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Overage:</strong> Essentials $5/seal • Growth $4/seal
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-[#002147] hover:bg-[#001a38]">
              <Link href="/services/business">View Business Plans</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* What to Expect Call-out */}
      <div className="my-16 p-8 bg-gray-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-[#002147] mb-4">New to Mobile Notary Services?</h2>
        <p className="text-gray-700 mb-6 max-w-xl mx-auto">
          Understanding the process can bring peace of mind. We've detailed every step, so you know exactly what to expect when you book with us.
        </p>
        <Link href="/what-to-expect">
          <Button variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
            Learn About Our Process
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Service Comparison */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Service Comparison</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] md:w-[200px]">Feature</TableHead>
                <TableHead>Standard Notary</TableHead>
                <TableHead>Extended Hours Notary</TableHead>
                <TableHead>Loan Signing Specialist</TableHead>
                <TableHead>Specialty Notary Services</TableHead>
                <TableHead>Business Notary Solutions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Starting Price</TableCell>
                <TableCell>${SERVICES_CONFIG.STANDARD_NOTARY.basePrice}+</TableCell>
                <TableCell>${SERVICES_CONFIG.EXTENDED_HOURS.basePrice}+</TableCell>
                <TableCell>${SERVICES_CONFIG.LOAN_SIGNING.basePrice}+</TableCell>
                <TableCell>${SERVICES_CONFIG.RON_SERVICES.basePrice}+ / RON</TableCell>
                <TableCell>${SERVICES_CONFIG.BUSINESS_ESSENTIALS.basePrice}+ / mo</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Service Hours</TableCell>
                <TableCell>{formatHours(SERVICES_CONFIG.STANDARD_NOTARY.businessHours)}</TableCell>
                <TableCell>{formatHours(SERVICES_CONFIG.EXTENDED_HOURS.businessHours)}</TableCell>
                <TableCell>{formatHours(SERVICES_CONFIG.LOAN_SIGNING.businessHours)}</TableCell>
                <TableCell>{formatHours(SERVICES_CONFIG.RON_SERVICES.businessHours)}</TableCell>
                <TableCell>{formatHours(SERVICES_CONFIG.BUSINESS_ESSENTIALS.businessHours)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Key Documents/Use</TableCell>
                <TableCell>POAs, Affidavits, Contracts</TableCell>
                <TableCell>Urgent, Same-day, After-hours</TableCell>
                <TableCell>Certified Loan Signings, RON</TableCell>
                <TableCell>Apostilles, Translations, Embassy</TableCell>
                <TableCell>Volume Signings, Corporate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Best For</TableCell>
                <TableCell>Standard legal documents</TableCell>
                <TableCell>Time-sensitive situations</TableCell>
                <TableCell>Real estate transactions</TableCell>
                <TableCell>International & complex docs</TableCell>
                <TableCell>Businesses with ongoing needs</TableCell>
              </TableRow>
              {/* Add more feature rows as needed */}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Service Area */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold text-[#002147] mb-6">Our Service Area</h2>
          <p className="text-gray-600 mb-6">
            We proudly serve the greater Houston area, providing mobile notary services wherever you need them.
          </p>

          <div className="bg-[#002147]/5 p-5 rounded-lg border border-[#002147]/10 mb-6">
            <div className="flex items-start">
              <div className="bg-[#002147] p-2 rounded-full mr-3 shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#002147] mb-1">Standard Service Area</h3>
                <p className="text-gray-700">
                  Our standard service area extends to a 20-mile radius from ZIP code 77591. Beyond that, we use simple travel zones: 21–30 +$25; 31–40 +$45; 41–50 +$65. See <Link href="/services/extras#travel-tiers" className="underline text-[#002147]">travel tiers</Link>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-[#002147] mb-2 border-b border-gray-200 pb-2">North & West</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                  <span>Houston</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                  <span>The Woodlands</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                  <span>Katy</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                  <span>Sugar Land</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-[#002147] mb-2 border-b border-gray-200 pb-2">South & East</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                  <span>Galveston</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                  <span>League City</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                  <span>Pearland</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="text-[#A52A2A] mr-2 h-4 w-4" />
                  <span>Baytown</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-md border border-gray-200">
          <Image
            src="/texas-city-radius.png"
            alt="Service area map showing 20-mile radius from ZIP 77591"
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 400px"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002147]/60 to-transparent"></div>

          {/* Service radius indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[250px] h-[250px] border-2 border-[#A52A2A] rounded-full opacity-70 flex items-center justify-center">
              <div className="w-4 h-4 bg-[#A52A2A] rounded-full"></div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-[#A52A2A] rounded-full mr-2"></div>
              <p className="font-semibold">ZIP 77591 (Texas City, TX)</p>
            </div>
            <p className="text-sm mb-1">20-mile standard service radius</p>
            <p className="text-sm">Extended coverage available for additional fee</p>
          </div>
        </div>
      </div>

      {/* Service Tabs - Mobile Friendly Alternative */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Explore Our Services</h2>

        <Tabs defaultValue={services[0]?.slug || 'standard-notary'} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-8">
            {services.map(service => (
              <TabsTrigger key={service.slug} value={service.slug} className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
                {service.name.replace(" Notary", "").replace(" Services", "").replace(" Specialist", "").replace(" Solutions", "")} {/* Shortened name for tab */}
              </TabsTrigger>
            ))}
          </TabsList>

          {services.map(service => (
            <TabsContent key={service.slug} value={service.slug} className="mt-0">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#002147] mb-4">{service.name}</h3>
                    <p className="text-gray-600 mb-2"><strong>Tagline:</strong> {service.tagline}</p>
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>
                    {service.price && (
                       <p className="text-lg font-semibold text-[#002147] mb-4">
                        {service.price === "See details" ? "Pricing: See details below or contact us" : `Starting at: ${service.price}`}
                      </p>
                    )}
                    {service.slug === "extras" && (
                       <div className="mt-4">
                        <h4 className="font-semibold text-[#002147] mb-2">Fee Details:</h4>
                        <ul className="space-y-1 text-gray-600">
                          <li>{`Mileage Fee: $${SERVICES_CONFIG.STANDARD_NOTARY.feePerMile}/mile`}</li>
                          <li>{`After-Hours Fee: $${PRICING_CONFIG.surcharges.afterHours}`}</li>
                          <li>{`Weekend Fee: $${PRICING_CONFIG.surcharges.weekend}`}</li>
                        </ul>
                       </div>
                    )}
                    <div className="mt-6">
                      <Link href={service.link}>
                        <Button className={`${service.bgColor} ${service.textColor || 'text-white'} ${service.hoverBgColor || 'hover:bg-[#001a38]'}`}>
                          Learn More About {service.name.replace(" Notary", "").replace(" Services", "")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {service.features && service.features.length > 0 && service.slug !== "extras" && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-[#002147] mb-2">Key Features & Inclusions</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="text-[#A52A2A] mr-2 h-5 w-5 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                     {service.slug === "standard-notary" && (
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-[#002147] mb-2">Common Documents Handled</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>Wills, Trusts, & Estate Planning</li>
                          <li>Powers of Attorney (Financial, Medical)</li>
                          <li>Affidavits & Sworn Statements</li>
                          <li>Deeds (Quitclaim, Warranty, etc.)</li>
                          <li>Contracts & Business Agreements</li>
                          <li>Vehicle Title Transfers</li>
                          <li>Travel Consent Forms for Minors</li>
                          <li>I-9 Employment Verification (as applicable)</li>
                        </ul>
                       </div>
                    )}
                    {service.slug === "loan-signing-specialist" && (
                       <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-[#002147] mb-2">Loan Signing Expertise</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>Certified Loan Signing Agent</li>
                            <li>Purchase, Refinance, HELOC, Seller Packages</li>
                            <li>Remote Online Notarization (RON) capabilities</li>
                            <li>Courier and document return services</li>
                            <li>Meticulous attention to detail</li>
                        </ul>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <MiniFAQ faqs={serviceFaqs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Book Your Notary Service?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Schedule your appointment today and experience the convenience of our mobile notary services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
              Book Now
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-[#002147]">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
