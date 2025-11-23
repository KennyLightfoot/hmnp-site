import UnifiedTestimonials from "@/components/testimonials/unified-testimonials"
import type { Metadata } from "next"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Mobile Notary Testimonials",
  description:
    "Hear from homeowners, lenders, and businesses who trust Houston Mobile Notary Pros for on-time, professional service.",
  keywords:
    "notary testimonials, mobile notary reviews, Houston notary service reviews, client feedback, notary recommendations",
  alternates: {
    canonical: "https://houstonmobilenotarypros.com/testimonials",
  },
  openGraph: {
    title: "Mobile Notary Testimonials",
    description: "Real stories from clients across Houston who rely on Houston Mobile Notary Pros.",
    url: "https://houstonmobilenotarypros.com/testimonials",
    type: "website",
  },
}

const testimonialsSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Houston Mobile Notary Pros",
  "url": "https://houstonmobilenotarypros.com",
  "image": "https://houstonmobilenotarypros.com/og-image.jpg",
  "telephone": "+1-832-617-4285",
  "priceRange": "$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Sarah Johnson" },
      "reviewBody": "I needed a notary for my power of attorney documents and Houston Mobile Notary Pros made it so easy. The notary arrived on time, was professional, and efficiently handled all my documents. I highly recommend their services!",
      "datePublished": "2023-06-15",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5", "worstRating": "1" },
      "itemReviewed": { "@type": "Service", "name": "Standard Notary Services" }
    },
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Michael Rodriguez" },
      "reviewBody": "Our loan signing went smoothly thanks to the professional service provided. The notary explained everything clearly and made sure all documents were properly executed.",
      "datePublished": "2023-07-03",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5", "worstRating": "1" },
      "itemReviewed": { "@type": "Service", "name": "Loan Signing Service" }
    },
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Jennifer Williams" },
      "reviewBody": "I needed a notary urgently for some time-sensitive documents. They had someone at my office by lunchtime and handled everything with care.",
      "datePublished": "2023-05-22",
      "reviewRating": { "@type": "Rating", "ratingValue": "4.5", "bestRating": "5", "worstRating": "1" },
      "itemReviewed": { "@type": "Service", "name": "Extended Hours Notary" }
    }
  ]
}

export default function TestimonialsPage() {
  return (
    <>
      <Script
        id="testimonials-review-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(testimonialsSchema) }}
      />
      <UnifiedTestimonials 
        variant="page" 
        showTabs={true}
        title="Client Testimonials"
        description="Read what our clients have to say about our mobile notary services. We're proud to have served hundreds of satisfied customers throughout the Houston area."
      />
    </>
  )
}
