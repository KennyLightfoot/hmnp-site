import Script from "next/script"

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Houston Mobile Notary Pros",
    image: "/images/og-image.jpg",
    "@id": "https://houstonmobilenotarypros.com/",
    url: "https://houstonmobilenotarypros.com/",
    telephone: "+1-XXX-XXX-XXXX", // Replace with actual phone number
    priceRange: "$75-$250+",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Replace with actual street address",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77591",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.0, // Replace with actual latitude
      longitude: -95.0, // Replace with actual longitude
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
        opens: "09:00",
        closes: "17:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/your-facebook-page", // Replace with actual Facebook page
      "https://www.yelp.com/biz/your-yelp-page", // Replace with actual Yelp page
      // Add other social media profiles
    ],
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
