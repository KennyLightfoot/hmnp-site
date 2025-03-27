export default function PartnershipSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Houston Mobile Notary Pros Partnership Program",
    description:
      "Strategic partnership opportunities with Houston Mobile Notary Pros for real estate agencies, law firms, financial institutions, and title companies.",
    provider: {
      "@type": "LocalBusiness",
      name: "Houston Mobile Notary Pros",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Houston",
        addressRegion: "TX",
        addressCountry: "US",
      },
      telephone: "(713) 322-8623",
      url: "https://houstonmobilenotarypros.com",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 29.7604,
        longitude: -95.3698,
      },
      geoRadius: "50 miles",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Business Partners",
    },
    offers: {
      "@type": "Offer",
      description: "Strategic partnership opportunities with Houston Mobile Notary Pros",
      availability: "https://schema.org/InStock",
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
}

