import Link from "next/link"
import Image from "next/image"
import { Metadata } from 'next'
import {
  MapPin,
  Clock,
  Award,
  CheckCircle,
  ArrowRight,
  Shield,
  Calendar,
  FileText,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import MiniFAQ from "@/components/mini-faq"
import HeroSection from "@/components/hero-section"
import ServiceHoursBanner from "@/components/service-hours-banner"
import ServicesOverview from "@/components/services-overview"
import WhyChooseUs from "@/components/why-choose-us"
import ServiceArea from "@/components/service-area"
import UnifiedTestimonials from "@/components/testimonials/unified-testimonials"
import FaqSection from "@/components/faq-section"
import CtaSection from "@/components/cta-section"

export const metadata: Metadata = {
  title: "Mobile Notary Houston | Notary Near Me | 24/7 Loan Signing Agent",
  description: "Need a notary near you in Houston? We come to you! Mobile notary services, loan signing agent, RON, and emergency notarization. Book online now.",
  keywords:
    "mobile notary Houston, notary near me, Houston notary, notary public, loan signing agent, traveling notary, notary services, electronic notary, mobile notary near me, after hours notary, emergency notary Houston, RON notary, remote online notarization",
  openGraph: {
    title: "Mobile Notary Houston | Notary Near Me | Houston Mobile Notary Pros",
    description: "Need a notary near you in Houston? We come to you! Mobile notary services, loan signing agent, RON, and emergency notarization available 24/7.",
    url: "/", // Assuming this is the root URL
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Houston Mobile Notary Pros',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mobile Notary Houston | Notary Near Me | 24/7 Service",
    description: "Need a notary near you in Houston? We come to you! Mobile notary services, loan signing agent, RON, and emergency notarization available now.",
    images: [`/og-image.jpg`], // Must be an absolute URL relative to the domain
  },
}

export default function HomePage() {
  // FAQ items for the MiniFAQ component
  const faqs = [
    {
      id: "what-is-notary",
      question: "What is a mobile notary?",
      answer: (
        <p>
          A mobile notary is a state-commissioned notary public who travels to your location to perform notarial acts.
          This service saves you time and hassle by bringing the notary to your home, office, or other convenient
          location.
        </p>
      ),
    },
    {
      id: "service-area",
      question: "What areas do you serve?",
      answer: (
        <div>
          <p>
            We cover up to 50 miles from ZIP code 77591 across Greater Houston. Included travel:
            Standard Mobile includes 20 miles; Extended Hours and Loan Signing include 30 miles.
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>0–20 miles: included (Standard)</li>
            <li>21–30 miles: +$25 (Extended/Loan include 30)</li>
            <li>31–40 miles: +$45</li>
            <li>41–50 miles: +$65 (maximum service area)</li>
          </ul>
          <p className="mt-2">RON is statewide (Texas) with no travel fees.</p>
        </div>
      ),
    },
    {
      id: "id-requirements",
      question: "What forms of ID do you accept?",
      answer: (
        <p>
          We accept government-issued photo IDs such as driver's licenses, passports, military IDs, and state ID cards.
          The ID must be current (not expired) and contain a photograph, physical description, signature, and serial
          number.
        </p>
      ),
    },
  ]

  return (
    <>
      {/* Hero Section with Background Image - Removed */}
      {/* <section className="relative py-20 md:py-28 overflow-hidden"> ... </section> */}
      <HeroSection />

      {/* Service Hours Banner - Simplified */}
      <ServiceHoursBanner />

      {/* Services Overview - Simplified */}
      <ServicesOverview />

      {/* Why Choose Us - Simplified */}
      <WhyChooseUs />

      {/* Our Commitment Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">
              🛡️ Our Commitment to You
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              We believe every signature tells a story—and it deserves to be handled with care, clarity, and precision. 
              Our work is not just about documents. It's about peace of mind.
            </p>
            <p className="text-md text-gray-600 max-w-3xl mx-auto mt-4">
              To see how these commitments translate into a smooth and transparent experience for you, 
              we invite you to learn about{" "}
              <Link href="/what-to-expect" className="text-[#A52A2A] hover:underline font-medium">
                what to expect during your appointment
              </Link>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl font-semibold text-[#002147] mb-6">Core Beliefs</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#A52A2A] mr-3 flex-shrink-0 mt-1" />
                  <span><strong>Every Signature Carries Weight:</strong> We don't handle paper—we handle people's futures.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#A52A2A] mr-3 flex-shrink-0 mt-1" />
                  <span><strong>Clarity Creates Confidence:</strong> We don't just present documents. We explain, guide, and educate.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#A52A2A] mr-3 flex-shrink-0 mt-1" />
                  <span><strong>Precision Is Non-Negotiable:</strong> Accuracy isn't a feature—it's our default.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#A52A2A] mr-3 flex-shrink-0 mt-1" />
                  <span><strong>Professionalism Is a Ritual, Not a Performance:</strong> Clean appearance. Calm tone. Courteous manner. Every time.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#A52A2A] mr-3 flex-shrink-0 mt-1" />
                  <span><strong>Time is Sacred:</strong> We don't waste a second—yours or ours.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#A52A2A] mr-3 flex-shrink-0 mt-1" />
                  <span><strong>We're the Calm in Critical Moments:</strong> Legal stress, real estate rush, family crisis—we show up with care.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#A52A2A] mr-3 flex-shrink-0 mt-1" />
                  <span><strong>We Don't Earn Trust Once:</strong> Every signing is a living reference. We win trust again each time.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-[#002147] mb-6">Code of Conduct</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">✅ Arrive early</li>
                <li className="flex items-center">✅ Dress professionally</li>
                <li className="flex items-center">✅ Explain without ego</li>
                <li className="flex items-center">✅ Check every detail twice</li>
                <li className="flex items-center">✅ Secure your confidentiality</li>
                <li className="flex items-center">✅ Guide with calm clarity</li>
                <li className="flex items-center">✅ Follow through after the signing</li>
                <li className="flex items-center">✅ Serve with presence and pride</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-4">
              Want peace of mind with your next signing?
            </p>
            <Button asChild size="lg" className="bg-[#A52A2A] hover:bg-opacity-80 text-white">
              <Link href="/booking">
                Book Your Service Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Service Area - Fixed with proper map */}
      <ServiceArea />

      {/* Testimonials - Simplified - Removed */}
      {/* <section className="py-16 bg-gray-50"> ... </section> */}
              <UnifiedTestimonials variant="section" showStats={true} />

      {/* FAQ Section - Simplified - Removed */}
      {/* <section className="py-16 bg-white"> ... </section> */}
      <FaqSection faqs={faqs} />

      {/* Special Offers Section */}
      <section className="py-12 md:py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#002147] mb-8">
            Exclusive Savings & Rewards!
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg text-left">
              <h3 className="text-2xl font-semibold text-[#A52A2A] mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-7 w-7"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 1 0-8c-2 0-4 1.33-6 4Z"/><path d="M12 12v-2"/><path d="M12 12v2"/><path d="M12 12H2"/><path d="M12 12h10"/></svg> {/* Sparkles Icon */}
                First-Time Client Discount
              </h3>
              <p className="text-gray-700 mb-2">
                New to Houston Mobile Notary Pros? Welcome aboard! Enjoy <strong>$25 OFF</strong> your very first service with us.
              </p>
              <p className="text-gray-600 text-sm">
                Simply use code <strong className="text-[#002147] bg-yellow-200 px-1 rounded">FIRST25</strong> during your booking.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-left">
              <h3 className="text-2xl font-semibold text-[#A52A2A] mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-7 w-7"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg> {/* Users Icon (simplified gift/users) */}
                Refer a Friend & You Both Save!
              </h3>
              <p className="text-gray-700 mb-2">
                Love our convenient notary services? Share the love! When you refer a new client, and they complete their first booking, <strong>you both receive a $25 discount</strong>.
              </p>
              <p className="text-gray-600 text-sm">
                Ensure your friend mentions your full name when they book their appointment.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Button asChild size="lg" className="bg-[#A52A2A] hover:bg-opacity-80 text-white px-8 py-3">
              <Link href="/booking">
                Book Now & Save <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Updated Service Showcase - SOP Pricing */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-[#002147] mb-3">Standard Mobile Notary</h3>
          <div className="text-3xl font-bold text-[#A52A2A] mb-2">$75</div>
          <p className="text-gray-600 mb-4">Professional service • ≤ 4 docs • ≤ 2 signers • ≤ 20 mi travel</p>
          <Link href="/booking">
            <Button className="bg-[#002147] hover:bg-[#001a38] text-white">
              Book Now
            </Button>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold text-[#002147] mb-3">Loan Signing Specialist</h3>
          <div className="text-3xl font-bold text-[#A52A2A] mb-2">$175</div>
          <p className="text-gray-600 mb-4">Real estate closings • Flat fee • ≤ 4 signers • Expert handling</p>
          <Link href="/booking">
            <Button className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
              Book Now
            </Button>
          </Link>
        </div>
      </div>

      {/* CTA Section - Simplified */}
      <CtaSection />
    </>
  )
}
