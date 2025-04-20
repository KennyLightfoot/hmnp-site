import Link from "next/link"
import Image from "next/image"
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
import TestimonialCarousel from "@/components/testimonial-carousel"
import MiniFAQ from "@/components/mini-faq"
import HeroSection from "@/components/hero-section"
import ServiceHoursBanner from "@/components/service-hours-banner"
import ServicesOverview from "@/components/services-overview"
import WhyChooseUs from "@/components/why-choose-us"
import ServiceArea from "@/components/service-area"
import TestimonialsSection from "@/components/testimonials-section"
import FaqSection from "@/components/faq-section"
import CtaSection from "@/components/cta-section"

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
        <p>
          We serve clients within a 20-mile radius of ZIP code 77591, covering the greater Houston area including
          Houston, Galveston, League City, Pearland, Sugar Land, and more. We can also travel beyond our standard
          service area for an additional fee.
        </p>
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

      {/* Service Area - Fixed with proper map */}
      <ServiceArea />

      {/* Testimonials - Simplified - Removed */}
      {/* <section className="py-16 bg-gray-50"> ... </section> */}
      <TestimonialsSection />

      {/* FAQ Section - Simplified - Removed */}
      {/* <section className="py-16 bg-white"> ... </section> */}
      <FaqSection faqs={faqs} />

      {/* CTA Section - Simplified */}
      <CtaSection />
    </>
  )
}
