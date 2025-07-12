'use client';

/**
 * Service Schema Component
 * Houston Mobile Notary Pros - Structured Data for Service Pages
 * 
 * Generates JSON-LD schema markup for service pages to enhance SEO
 * and enable rich snippets in search results.
 */

interface ServiceSchemaProps {
  serviceName: string;
  description: string;
  price?: string;
  priceRange?: string;
  serviceType: 'NotaryService' | 'LegalService' | 'ProfessionalService';
  serviceUrl: string;
  areaServed?: string[];
  hoursAvailable?: {
    dayOfWeek: string[];
    opens?: string;
    closes?: string;
    validFrom?: string;
    validThrough?: string;
  };
  features?: string[];
  additionalInfo?: {
    isEmergencyService?: boolean;
    isOnlineService?: boolean;
    certificationsRequired?: boolean;
  };
}

export default function ServiceSchema({
  serviceName,
  description,
  price,
  priceRange,
  serviceType,
  serviceUrl,
  areaServed = ['Houston, TX', 'Harris County, TX', 'Greater Houston Area'],
  hoursAvailable,
  features = [],
  additionalInfo = {}
}: ServiceSchemaProps) {
  const baseUrl = 'https://houstonmobilenotarypros.com';
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "description": description,
    "serviceType": serviceType,
    "url": `${baseUrl}${serviceUrl}`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Houston Mobile Notary Pros",
      "image": `${baseUrl}/og-image.jpg`,
      "telephone": "+1-281-404-2019",
      "email": "info@houstonmobilenotarypros.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Houston",
        "@addressRegion": "TX",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "29.7604",
        "longitude": "-95.3698"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "priceRange": "$$",
      "currenciesAccepted": "USD",
      "paymentAccepted": "Cash, Check, Credit Card, Venmo, Zelle"
    },
    "areaServed": areaServed.map(area => ({
      "@type": "City",
      "name": area
    })),
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": `${baseUrl}${serviceUrl}`,
      "servicePhone": "+1-281-404-2019",
      "availableLanguage": "English"
    }
  };

  // Add pricing information
  if (price) {
    schemaData["offers"] = {
      "@type": "Offer",
      "price": price.replace(/[^0-9.]/g, ''),
      "priceCurrency": "USD",
      "description": `Starting price for ${serviceName}`,
      "availability": "https://schema.org/InStock"
    };
  } else if (priceRange) {
    schemaData["offers"] = {
      "@type": "Offer",
      "priceRange": priceRange,
      "priceCurrency": "USD",
      "description": `Price range for ${serviceName}`,
      "availability": "https://schema.org/InStock"
    };
  }

  // Add hours of availability
  if (hoursAvailable) {
    schemaData["hoursAvailable"] = {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": hoursAvailable.dayOfWeek,
      "opens": hoursAvailable.opens,
      "closes": hoursAvailable.closes,
      "validFrom": hoursAvailable.validFrom,
      "validThrough": hoursAvailable.validThrough
    };
  }

  // Add service features
  if (features.length > 0) {
    schemaData["additionalProperty"] = features.map(feature => ({
      "@type": "PropertyValue",
      "name": "Service Feature",
      "value": feature
    }));
  }

  // Add additional service properties
  if (additionalInfo.isEmergencyService) {
    schemaData["serviceOutput"] = "Emergency Notary Service Available 24/7";
  }

  if (additionalInfo.isOnlineService) {
    schemaData["serviceType"] = "Online Service";
    schemaData["availableChannel"]["serviceLocation"] = "Online";
  }

  if (additionalInfo.certificationsRequired) {
    schemaData["termsOfService"] = "Licensed and insured notary public required";
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2)
      }}
    />
  );
} 