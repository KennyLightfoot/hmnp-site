import { testimonials } from "@/data/testimonials"

export function TestimonialsStructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Houston Mobile Notary Pros",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1),
      reviewCount: testimonials.length,
    },
    review: testimonials.map((testimonial) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: testimonial.name,
      },
      datePublished: testimonial.date,
      reviewRating: {
        "@type": "Rating",
        ratingValue: testimonial.rating,
      },
      reviewBody: testimonial.text,
    })),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

