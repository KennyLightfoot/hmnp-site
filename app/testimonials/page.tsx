import UnifiedTestimonials from "@/components/testimonials/unified-testimonials"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Testimonials | Houston Mobile Notary Pros",
  description:
    "Read reviews and testimonials from satisfied clients who have used our mobile notary services in Houston and surrounding areas.",
  keywords:
    "notary testimonials, mobile notary reviews, Houston notary service reviews, client feedback, notary recommendations",
  openGraph: {
    title: "Client Testimonials | Houston Mobile Notary Pros",
    description: "Read what our clients say about our professional mobile notary services in Houston.",
    url: "/testimonials",
    type: "website",
  },
}

export default function TestimonialsPage() {
  return (
    <UnifiedTestimonials 
      variant="page" 
      showTabs={true}
      title="Client Testimonials"
      description="Read what our clients have to say about our mobile notary services. We're proud to have served hundreds of satisfied customers throughout the Houston area."
    />
  )
}
