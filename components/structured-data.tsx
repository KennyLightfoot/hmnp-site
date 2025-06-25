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
    slogan: "Flawless the first time—or we pay the redraw fee",
    image: "/og-image.jpg",
    "@id": "https://houstonmobilenotarypros.com/",
    url: "https://houstonmobilenotarypros.com/",
    telephone: "+18326174285",
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
      "https://www.facebook.com/HoustonMobileNotaryPros/"
      // Add other social media profile URLs here
    ],
    email: "contact@houstonmobilenotarypros.com",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "35",
    },
    offers: [
      {
        "@type": "Offer",
        "name": "Quick-Stamp Local",
        "description": "Fast and simple local notary service for basic documents",
        "price": "50.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      {
        "@type": "Offer", 
        "name": "Standard Mobile Notary",
        "description": "Professional mobile notary service for standard documents",
        "price": "75.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      {
        "@type": "Offer",
        "name": "Extended Hours Mobile",
        "description": "Extended hours and same-day notary service with premium scheduling",
        "price": "100.00", 
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      {
        "@type": "Offer",
        "name": "Loan Signing Specialist", 
        "description": "Expert loan signing and real estate closing services",
        "price": "150.00",
        "priceCurrency": "USD", 
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      {
        "@type": "Offer",
        "name": "Remote Online Notarization (RON)",
        "description": "Secure online notarization with credential analysis and KBA",
        "price": "25.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock", 
        "validFrom": new Date().toISOString()
      }
    ],
  }

  // Enhanced FAQ Schema with guarantee messaging
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Houston Mobile Notary Pros' guarantee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We guarantee flawless service the first time—or we pay the redraw fee. Our mission is to eliminate sloppy signings that kill funding with zero tolerance for errors."
        }
      },
      {
        "@type": "Question", 
        name: "Do you offer 24/7 loan signing services in Houston?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we provide 24/7 loan signing services throughout the Houston area with certified loan signing agents available for urgent real estate transactions and emergency signings."
        }
      },
      {
        "@type": "Question",
        name: "What areas does Houston Mobile Notary Pros serve?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We serve Houston, Galveston, League City, Pearland, Sugar Land, and surrounding areas within a 50-mile radius of Webster, TX with mobile notary services at your location."
        }
      }
    ]
  }

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
