"use client"

interface ServiceSchemaProps {
  service: {
    name: string
    description: string
    type: string
    price: string
  }
}

export function ServiceSchema({ service }: ServiceSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    serviceType: service.type,
    provider: {
      "@type": "LocalBusiness",
      name: "Houston Mobile Notary Pros",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 29.7604,
        longitude: -95.3698,
      },
      geoRadius: "20 miles",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: service.price,
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
}

export function LocalBusinessSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Houston Mobile Notary Pros",
          image:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hmnp-logo-A3QP2XwMq7IZyRZw-gXLMHbwEv8ThwKyhdSw117oesQllEG.png",
          "@id": "https://houstonmobilenotarypros.com",
          url: "https://houstonmobilenotarypros.com",
          telephone: "+12817798847",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Houston, TX",
            addressLocality: "Houston",
            addressRegion: "TX",
            postalCode: "77591",
            addressCountry: "US",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 29.4608,
            longitude: -95.0513,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "17:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Saturday", "Sunday"],
              opens: "10:00",
              closes: "15:00",
            },
          ],
          sameAs: [
            "https://www.facebook.com/houstonmobilenotarypros",
            "https://www.instagram.com/houstonmobilenotarypros",
            "https://twitter.com/houstonnotary",
          ],
        }),
      }}
    />
  )
}

