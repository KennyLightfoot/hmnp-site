import Script from "next/script"

interface StructuredDataProps {
  nonce: string;
}

export function StructuredData({ nonce }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    additionalType: "https://schema.org/Notary",
    name: "Houston Mobile Notary Pros",
    image: "/og-image.jpg",
    "@id": "https://houstonmobilenotarypros.com/",
    url: "https://houstonmobilenotarypros.com/",
    telephone: "+12817798847",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "3118 FM 528 Rd",
      addressLocality: "Webster",
      addressRegion: "TX",
      postalCode: "77598",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.53858,
      longitude: -95.11935,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        name: "Essential Service Hours",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        name: "Priority Service Hours",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "07:00",
        closes: "21:00",
      },
    ],
    sameAs: [
      // Add social media profile URLs here when available
    ],
    email: "contact@houstonmobilenotarypros.com",
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
