import type { Metadata } from "next"
import Link from "next/link"
import { Mail, Phone, MapPin, Clock, Facebook, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ContactForm from "@/components/contact-form"
import { getBusinessPhoneFormatted, getBusinessTel, getSmsHref, getSmsNumberFormatted } from "@/lib/phone"

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'; // Replace with your actual domain

const resourceLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/services/extended-hours-notary", label: "Priority & Extended Hours" },
  { href: "/services/loan-signing-specialist", label: "Loan Signing Program" },
  { href: "/services/remote-online-notarization", label: "Remote Online Notary" },
  { href: "/service-areas/houston", label: "Houston Coverage Map" },
  { href: "/pricing", label: "Transparent Pricing" },
  { href: "/faq", label: "Frequently Asked Questions" },
]

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Contact Us | Houston Mobile Notary Pros",
  description:
    "Contact our mobile notary service for appointments, quotes, or questions. Serving Houston, Galveston, Pearland, and surrounding areas with professional notary services.",
  keywords: "contact notary, Houston notary contact, mobile notary appointment, notary quote, notary questions",
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: "Contact Houston Mobile Notary Pros",
    description: "Get in touch with Houston Mobile Notary Pros for appointments, quotes, or questions. Serving Houston and nearby areas.",
    url: `${BASE_URL}/contact`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Contact Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Contact Houston Mobile Notary Pros",
    description: "Need a mobile notary in Houston? Contact us via phone, email, or contact form for appointments, quotes, or inquiries.",
    // Add your Twitter handle here if you have one
    // siteId: 'YourTwitterID',
    // creator: '@YourTwitterHandle',
    // creatorId: 'YourTwitterCreatorID',
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function ContactPage() {
  const phoneDisplay = getBusinessPhoneFormatted()
  const businessTel = getBusinessTel()
  const smsHref = getSmsHref()
  const smsDisplay = getSmsNumberFormatted()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have questions or ready to book? We're here to help with all your notary needs.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="shadow-md">
          <CardHeader className="bg-[#002147]/5 pb-2">
            <CardTitle className="flex items-center text-[#002147]">
              <Phone className="mr-2 h-5 w-5 text-[#A52A2A]" />
              Call Us
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-xl font-bold mb-2">
              <a href={`tel:${businessTel}`} className="underline">
                {phoneDisplay}
              </a>
            </p>
            <p className="text-gray-600 mb-4">For immediate assistance or to book by phone</p>
            <div className="text-sm text-gray-500">
              <p className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Monday-Friday: 8am-6pm
              </p>
              <p className="mt-1">Weekend calls returned promptly</p>
              <p className="flex items-center mt-3">
                <MessageCircle className="mr-2 h-4 w-4" />
                <a href={smsHref} className="underline">
                  Text {smsDisplay}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-[#002147]/5 pb-2">
            <CardTitle className="flex items-center text-[#002147]">
              <Mail className="mr-2 h-5 w-5 text-[#A52A2A]" />
              Email Us
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg font-bold mb-2 break-words">contact@houstonmobilenotarypros.com</p>
            <p className="text-gray-600 mb-4">For quotes, questions, or scheduling</p>
            <div className="text-sm text-gray-500">
              <p>We respond to all emails within 2 business hours during business hours</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-[#002147]/5 pb-2">
            <CardTitle className="flex items-center text-[#002147]">
              <MapPin className="mr-2 h-5 w-5 text-[#A52A2A]" />
              Service Area
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="font-bold mb-2">Houston & Surrounding Areas</p>
            <p className="text-gray-600 mb-4">20-mile radius from ZIP 77591</p>
            <div className="text-sm text-gray-500">
              <p>Extended service area available for additional fee</p>
              <p className="mt-1">We come to your location!</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-[#002147]/5 pb-2">
            <CardTitle className="flex items-center text-[#002147]">
              <Facebook className="mr-2 h-5 w-5 text-[#A52A2A]" />
              Connect With Us
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <a href="https://www.facebook.com/HoustonMobileNotaryPros/" target="_blank" rel="noopener noreferrer" className="text-lg font-bold mb-2 hover:text-[#A52A2A] break-words">
              Facebook Page
            </a>
            <p className="text-gray-600 mb-4">Follow us for updates and news</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <Card className="shadow-md">
            <CardHeader className="bg-[#002147] text-white">
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#002147] mb-4">Business Hours</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="font-medium">Essential Services:</span>
                  <span>Monday-Friday, 9am-5pm</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="font-medium">Priority Services:</span>
                  <span>7 days a week, 7am-9pm</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="font-medium">Weekend Services:</span>
                  <span>Available with $50 surcharge</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">After-Hours:</span>
                  <span>Available with $30 surcharge</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#002147] mb-4">Quick Links</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/booking">Book an Appointment</a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/services">Our Services</a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/faq">FAQ</a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/testimonials">Testimonials</a>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-[#A52A2A]/10 p-6 rounded-lg border border-[#A52A2A]/20">
            <h3 className="font-semibold text-[#A52A2A] mb-2">Need Urgent Notary Service?</h3>
            <p className="text-gray-700 mb-4">
              Our Priority Service guarantees a 2-hour response time, 7 days a week from 7am-9pm.
            </p>
            <Button className="bg-[#A52A2A] hover:bg-[#8B0000]" asChild>
              <a href="/services/extended-hours-notary">Learn About Priority Service</a>
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-12 space-y-10">
        <section className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">How we handle every inquiry</h2>
          <p className="text-gray-700 leading-relaxed">
            Every submission is routed to a dispatch specialist who monitors current appointment windows, notary availability,
            and any document requirements you mention. We respond within 15 minutes during business hours and within one hour
            during our extended (7 AM – 9 PM) coverage. After-hours submissions still receive an acknowledgment so you know the
            request is in queue.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">Helpful details to include</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                <li>Document type(s) and signer count that need to be notarized</li>
                <li>Exact address or neighborhood for the appointment</li>
                <li>Preferred date/time windows or legal deadlines</li>
                <li>Special considerations such as hospital access, witnesses, or rush arrival</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#002147] mb-2">What happens next</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                <li>We confirm the best-fit service tier (standard, extended, loan signing, or RON)</li>
                <li>Dispatch sends a written quote with transparent travel tiers or surcharges</li>
                <li>You receive a secure link to finalize booking, upload documents, or pay the deposit</li>
                <li>Live updates continue via SMS/email until a notary is on-site or in the online session</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-6">
            We only use your information to respond to your request and coordinate service. Learn how we log consent, store records,
            and honor deletion timelines inside our{' '}
            <Link href="/privacy-policy" className="text-primary underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="bg-[#A52A2A]/5 p-8 rounded-lg border border-[#A52A2A]/20">
          <h3 className="text-xl font-semibold text-[#002147] mb-4 text-center">Helpful shortcuts while you wait</h3>
          <p className="text-gray-700 text-center max-w-2xl mx-auto mb-6">
            Need a fast answer before we respond? Jump into the links below for pricing, compliance, and rush-arrival policies.
            Each resource opens in a new tab so you never lose your place in the contact flow.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {resourceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-white bg-white/90 px-4 py-3 text-[#002147] hover:border-[#A52A2A] hover:bg-white transition-colors"
              >
                <span className="font-medium">{link.label}</span>
                <span aria-hidden className="text-sm text-[#A52A2A]">↗</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
