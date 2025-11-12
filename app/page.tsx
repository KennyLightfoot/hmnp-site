import { Metadata } from 'next'
import { StructuredData } from "@/components/structured-data"
import HeroSection from "@/components/hero-section"
import ValueRow from "@/components/ValueRow"
import ServicesGrid from "@/components/ServicesGrid"
import HowItWorks from "@/components/HowItWorks"
import ServiceArea from "@/components/service-area"
import Reviews from "@/components/Reviews"
import FaqStrip from "@/components/FaqStrip"
import FinalCta from "@/components/FinalCta"
import MobileDock from "@/components/MobileDock"
import SocialProof from "@/components/SocialProof"
import MicroTestimonials from "@/components/MicroTestimonials"
import CommonDocuments from "@/components/CommonDocuments"
import StickyBookBar from "@/components/StickyBookBar"
import LocationReassurance from "@/components/LocationReassurance"
import ReviewsModal from "@/components/ReviewsModal"

export const metadata: Metadata = {
  title: "Mobile Notary Houston | Notary Near Me | 24/7 Loan Signing Agent",
  description: "Need a notary near you in Houston? We come to you! Mobile notary services, loan signing agent, RON, and emergency notarization. Book online now.",
  keywords:
    "mobile notary Houston, notary near me, Houston notary, notary public, loan signing agent, traveling notary, notary services, electronic notary, mobile notary near me, after hours notary, emergency notary Houston, RON notary, remote online notarization",
  alternates: {
    canonical: "/",
  },
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
  return (
    <main>
      <StructuredData />
      {/* Simple Hero Section - restored from commit f05266 */}
      <HeroSection />
      
      {/* Rest of the homepage content */}
      <SocialProof />
      <ValueRow />
      <LocationReassurance />
      <ReviewsModal />
      <MicroTestimonials />
      <ServicesGrid />
      <CommonDocuments />
      <HowItWorks />
      <ServiceArea />
      <Reviews />
      <FaqStrip />
      <FinalCta />
      <MobileDock />
      <StickyBookBar />
    </main>
  )
}
