import Script from "next/script"
import { ServiceArea } from "@/lib/serviceAreas"
import { FAQ } from "@/lib/faqs"

interface Props {
  area: ServiceArea
  faqs?: FAQ[]
}

export default function ServiceAreaJSONLD({ area, faqs }: Props) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Mobile Notary Public",
    areaServed: {
      "@type": "City",
      name: area.cityName,
      address: {
        "@type": "PostalAddress",
        addressLocality: area.cityName,
        addressRegion: "TX",
        addressCountry: "US",
      },
    },
    provider: {
      "@type": "LocalBusiness",
      name: "Houston Mobile Notary Pros",
      url: process.env.NEXT_PUBLIC_BASE_URL || "https://houstonmobilenotarypros.com",
      telephone: "+12817798847",
    },
    offers: {
      "@type": "Offer",
      name: "Standard mobile notarization (starting)",
      priceCurrency: "USD",
      price: "40",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
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
  }

  const faqEntities = faqs?.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  }))

  const faqSchema = faqEntities?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqEntities,
      }
    : null

  return (
    <>
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}
