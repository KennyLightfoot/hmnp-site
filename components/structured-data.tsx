import Script from "next/script"

interface StructuredDataProps {
  nonce: string;
}

export function StructuredData({ nonce }: StructuredDataProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'
  
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
      streetAddress: "Based in Pearland Area",
      addressLocality: "Houston",
      addressRegion: "TX",
      postalCode: "77591",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 29.5630556,
      longitude: -95.2861111,
    },
    areaServed: [
      {
        "@type": "City",
        "name": "Houston",
        "sameAs": "https://en.wikipedia.org/wiki/Houston"
      },
      {
        "@type": "City", 
        "name": "Pearland",
        "sameAs": "https://en.wikipedia.org/wiki/Pearland,_Texas"
      },
      {
        "@type": "City",
        "name": "Sugar Land", 
        "sameAs": "https://en.wikipedia.org/wiki/Sugar_Land,_Texas"
      },
      {
        "@type": "City",
        "name": "Missouri City",
        "sameAs": "https://en.wikipedia.org/wiki/Missouri_City,_Texas"
      },
      {
        "@type": "City",
        "name": "Galveston",
        "sameAs": "https://en.wikipedia.org/wiki/Galveston,_Texas"
      },
      {
        "@type": "City",
        "name": "Stafford",
        "sameAs": "https://en.wikipedia.org/wiki/Stafford,_Texas"
      },
      {
        "@type": "City",
        "name": "League City",
        "sameAs": "https://en.wikipedia.org/wiki/League_City,_Texas"
      },
      {
        "@type": "City",
        "name": "Friendswood",
        "sameAs": "https://en.wikipedia.org/wiki/Friendswood,_Texas"
      }
    ],
    serviceArea: {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 29.5630556,
        "longitude": -95.2861111
      },
      "geoRadius": "20 miles"
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
          text: "We serve Houston, Pearland, Sugar Land, Missouri City, Galveston, Stafford, and nearby areas. Travel within 20 miles of 77591 is included; beyond that we use simple travel tiers to 50 miles."
        }
      },
      {
        "@type": "Question",
        name: "How much does mobile notary service cost in Houston?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mobile notary costs in Houston start at $75 for standard service, $100 for extended hours, and $150 for loan signing specialist services. RON (Remote Online Notarization) starts at $25. Transparent pricing with no hidden fees."
        }
      },
      {
        "@type": "Question",
        name: "Do you charge travel fees for mobile notary service?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Travel is included within 20 miles of 77591. Beyond that, tiered travel applies: 21–30 +$25; 31–40 +$45; 41–50 +$65."
        }
      },
      {
        "@type": "Question",
        name: "What is the cost difference between mobile notary and office visits?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mobile notary services cost more than office visits but provide significant value through time savings, convenience, and professional service at your location. No travel time, parking fees, or schedule disruption."
        }
      }
    ]
  }

  // Service-specific schema markup for better SERP features
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${BASE_URL}/#mobile-notary-service`,
    "name": "Mobile Notary Services Houston",
    "description": "Professional mobile notary services throughout Houston metro area. We come to you for document notarization, loan signings, and emergency services.",
    "serviceType": "Mobile Notary Public Services",
    "areaServed": [
      {
        "@type": "City",
        "name": "Houston",
        "sameAs": "https://en.wikipedia.org/wiki/Houston"
      },
      {
        "@type": "City",
        "name": "Pearland",
        "sameAs": "https://en.wikipedia.org/wiki/Pearland,_Texas"
      },
      {
        "@type": "City",
        "name": "Sugar Land",
        "sameAs": "https://en.wikipedia.org/wiki/Sugar_Land,_Texas"
      },
      {
        "@type": "City",
        "name": "Galveston",
        "sameAs": "https://en.wikipedia.org/wiki/Galveston,_Texas"
      }
    ],
    "provider": {
      "@type": "LocalBusiness",
      "name": "Houston Mobile Notary Pros",
      "url": BASE_URL
    },
    "offers": {
      "@type": "Offer",
      "price": "75",
      "priceCurrency": "USD",
      "description": "Starting price for mobile notary services including travel within 20 miles; tiered travel beyond"
    },
    "additionalType": "https://schema.org/NotaryService"
  }

  const loanSigningSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${BASE_URL}/#loan-signing-service`,
    "name": "Loan Signing Agent Houston",
    "description": "Certified loan signing agent services for real estate transactions. Mobile mortgage notary for closings, refinances, and HELOCs throughout Houston area.",
    "serviceType": "Loan Signing Agent Services",
    "areaServed": [
      {
        "@type": "City",
        "name": "Houston",
        "sameAs": "https://en.wikipedia.org/wiki/Houston"
      },
      {
        "@type": "City",
        "name": "Pearland",
        "sameAs": "https://en.wikipedia.org/wiki/Pearland,_Texas"
      },
      {
        "@type": "City",
        "name": "Sugar Land",
        "sameAs": "https://en.wikipedia.org/wiki/Sugar_Land,_Texas"
      }
    ],
    "provider": {
      "@type": "LocalBusiness",
      "name": "Houston Mobile Notary Pros",
      "url": BASE_URL
    },
    "offers": {
      "@type": "Offer",
      "price": "200",
      "priceCurrency": "USD",
      "description": "Starting price for comprehensive loan signing services including all documents and travel"
    },
    "additionalType": "https://schema.org/RealEstateService"
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
      <Script
        id="service-schema"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="loan-signing-schema"
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(loanSigningSchema) }}
      />
    </>
  )
}
