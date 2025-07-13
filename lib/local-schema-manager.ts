/**
 * Phase 6.1: Local Schema Markup Manager
 * Comprehensive schema generation for all service areas and landmarks
 * Target: Enhanced local search visibility and rich snippets
 */

import { LOCAL_SEO_ZIP_CODES, LOCAL_CONTENT_CLUSTERS } from './local-seo-data';

export interface LocalBusinessSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  address: {
    '@type': string;
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  url: string;
  areaServed: any[];
  serviceArea: {
    '@type': string;
    geoMidpoint: {
      '@type': string;
      latitude: string;
      longitude: string;
    };
    geoRadius: string;
  };
  priceRange: string;
  openingHours: string[];
  aggregateRating: {
    '@type': string;
    ratingValue: string;
    reviewCount: string;
  };
  hasOfferCatalog?: {
    '@type': string;
    name: string;
    itemListElement: any[];
  };
  geo?: {
    '@type': string;
    latitude: string;
    longitude: string;
  };
  sameAs?: string[];
}

export interface ServiceAreaSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  provider: {
    '@type': string;
    name: string;
    telephone: string;
    url: string;
  };
  areaServed: {
    '@type': string;
    name: string;
    geo: {
      '@type': string;
      latitude: string;
      longitude: string;
    };
  };
  availableChannel: {
    '@type': string;
    serviceUrl: string;
    servicePhone: string;
  };
}

export interface LandmarkSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  geo: {
    '@type': string;
    latitude: string;
    longitude: string;
  };
  address: {
    '@type': string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  makesOffer: {
    '@type': string;
    itemOffered: {
      '@type': string;
      name: string;
      description: string;
    };
    priceRange: string;
    availability: string;
  };
}

// Base business information
const BASE_BUSINESS_INFO = {
  name: 'Houston Mobile Notary Pros',
  telephone: '832-617-4285',
  baseUrl: 'https://houstonmobilenotarypros.com',
  priceRange: '$$',
  openingHours: [
    'Mo-Fr 09:00-17:00',
    'Sa-Su 09:00-17:00'
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '247'
  },
  socialMedia: [
    'https://www.facebook.com/houstonmobilenotarypros',
    'https://www.linkedin.com/company/houstonmobilenotarypros',
    'https://www.instagram.com/houstonmobilenotarypros'
  ]
};

// Service offerings for schema
const SERVICE_OFFERINGS = [
  {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: 'Mobile Notary Service',
      description: 'Professional mobile notary service at your location'
    },
    priceRange: '$75-$150',
    availability: 'https://schema.org/InStock'
  },
  {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: 'Loan Signing Services',
      description: 'Certified loan signing agent services'
    },
    priceRange: '$150-$250',
    availability: 'https://schema.org/InStock'
  },
  {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: 'Real Estate Notary',
      description: 'Real estate document notarization services'
    },
    priceRange: '$100-$200',
    availability: 'https://schema.org/InStock'
  },
  {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: 'Business Notary Services',
      description: 'Corporate and business document notarization'
    },
    priceRange: '$75-$300',
    availability: 'https://schema.org/InStock'
  }
];

// Major landmarks with coordinates for enhanced schema
const LANDMARK_COORDINATES = {
  'NASA Johnson Space Center': { lat: '29.5586', lng: '-95.0890' },
  'Houston Methodist Hospital': { lat: '29.7566', lng: '-95.4130' },
  'Texas Medical Center': { lat: '29.7066', lng: '-95.3980' },
  'Galleria Mall': { lat: '29.7390', lng: '-95.4634' },
  'Downtown Houston': { lat: '29.7604', lng: '-95.3698' },
  'Sugar Land Town Square': { lat: '29.6066', lng: '-95.6183' },
  'Pearland Town Center': { lat: '29.5633', lng: '-95.2861' },
  'Texas City Dike': { lat: '29.3375', lng: '-94.8466' },
  'Clear Lake': { lat: '29.5549', lng: '-95.0378' },
  'Kemah Boardwalk': { lat: '29.5446', lng: '-95.0188' },
  'Galveston Seawall': { lat: '29.2845', lng: '-94.8227' },
  'Memorial Hermann Sugar Land': { lat: '29.6196', lng: '-95.6349' },
  'Houston Methodist Pearland': { lat: '29.5633', lng: '-95.2861' },
  'Baybrook Mall': { lat: '29.5633', lng: '-95.1294' },
  'First Colony Mall': { lat: '29.6066', lng: '-95.6183' }
};

/**
 * Generate Local Business Schema for specific ZIP code
 */
export function generateZipCodeLocalBusinessSchema(zipCode: string): LocalBusinessSchema {
  const location = LOCAL_SEO_ZIP_CODES.find(loc => loc.zipCode === zipCode);
  
  if (!location) {
    throw new Error(`Location not found for ZIP code: ${zipCode}`);
  }

  const areaServed = [
    {
      '@type': 'PostalAddress',
      postalCode: location.zipCode,
      addressLocality: location.city,
      addressRegion: 'TX',
      addressCountry: 'US'
    },
    {
      '@type': 'City',
      name: location.city,
      sameAs: `https://en.wikipedia.org/wiki/${location.city.replace(/\s+/g, '_')},_Texas`
    }
  ];

  // Add landmark-based areas served
  location.landmarks.forEach(landmark => {
    areaServed.push({
      '@type': 'Place',
      name: landmark,
      address: {
        '@type': 'PostalAddress',
        addressLocality: location.city,
        addressRegion: 'TX',
        postalCode: location.zipCode,
        addressCountry: 'US'
      }
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${BASE_BUSINESS_INFO.name} - ${location.city}`,
    description: `Professional mobile notary service in ${location.city}, TX ${location.zipCode}. Same-day appointments, loan signings, and document notarization. Serving all ${location.city} neighborhoods and landmarks.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressRegion: 'TX',
      postalCode: location.zipCode,
      addressCountry: 'US'
    },
    telephone: BASE_BUSINESS_INFO.telephone,
    url: `${BASE_BUSINESS_INFO.baseUrl}/mobile-notary-${location.zipCode}`,
    areaServed,
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: '29.4052',
        longitude: '-94.9355'
      },
      geoRadius: '40233' // 25 miles in meters
    },
    priceRange: BASE_BUSINESS_INFO.priceRange,
    openingHours: BASE_BUSINESS_INFO.openingHours,
    aggregateRating: BASE_BUSINESS_INFO.aggregateRating,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${location.city} Mobile Notary Services`,
      itemListElement: SERVICE_OFFERINGS
    },
    sameAs: BASE_BUSINESS_INFO.socialMedia
  };
}

/**
 * Generate City-specific Local Business Schema
 */
export function generateCityLocalBusinessSchema(citySlug: string): LocalBusinessSchema {
  const contentCluster = LOCAL_CONTENT_CLUSTERS.find(cluster => cluster.slug === citySlug);
  
  if (!contentCluster) {
    throw new Error(`Content cluster not found for city: ${citySlug}`);
  }

  const areaServed = [
    {
      '@type': 'City',
      name: contentCluster.city,
      sameAs: `https://en.wikipedia.org/wiki/${contentCluster.city.replace(/\s+/g, '_')},_Texas`
    }
  ];

  // Add all ZIP codes for this city
  contentCluster.allZipCodes.forEach(zipCode => {
    areaServed.push({
      '@type': 'PostalAddress',
      postalCode: zipCode,
      addressLocality: contentCluster.city,
      addressRegion: 'TX',
      addressCountry: 'US'
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${BASE_BUSINESS_INFO.name} - ${contentCluster.city}`,
    description: contentCluster.metaDescription,
    address: {
      '@type': 'PostalAddress',
      addressLocality: contentCluster.city,
      addressRegion: 'TX',
      postalCode: contentCluster.mainZipCode,
      addressCountry: 'US'
    },
    telephone: BASE_BUSINESS_INFO.telephone,
    url: `${BASE_BUSINESS_INFO.baseUrl}/services/mobile-notary/${contentCluster.slug}`,
    areaServed,
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: '29.4052',
        longitude: '-94.9355'
      },
      geoRadius: '40233'
    },
    priceRange: BASE_BUSINESS_INFO.priceRange,
    openingHours: BASE_BUSINESS_INFO.openingHours,
    aggregateRating: BASE_BUSINESS_INFO.aggregateRating,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${contentCluster.city} Mobile Notary Services`,
      itemListElement: SERVICE_OFFERINGS
    },
    sameAs: BASE_BUSINESS_INFO.socialMedia
  };
}

/**
 * Generate Landmark-specific Service Schema
 */
export function generateLandmarkServiceSchema(landmark: string, city: string, zipCode: string): LandmarkSchema {
  const coordinates = LANDMARK_COORDINATES[landmark];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: landmark,
    description: `Mobile notary service available at ${landmark} in ${city}, TX. Professional document notarization services at this popular location.`,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coordinates?.lat || '29.4052',
      longitude: coordinates?.lng || '-94.9355'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'TX',
      postalCode: zipCode,
      addressCountry: 'US'
    },
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: `Mobile Notary Service near ${landmark}`,
        description: `Professional mobile notary service available at ${landmark} and surrounding area`
      },
      priceRange: '$75-$150',
      availability: 'https://schema.org/InStock'
    }
  };
}

/**
 * Generate Service Area Schema for comprehensive coverage
 */
export function generateServiceAreaSchema(): ServiceAreaSchema[] {
  return LOCAL_SEO_ZIP_CODES.map(location => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Mobile Notary Service in ${location.city}, TX ${location.zipCode}`,
    description: `Professional mobile notary service covering ${location.city} and surrounding areas. Same-day appointments available.`,
    provider: {
      '@type': 'LocalBusiness',
      name: BASE_BUSINESS_INFO.name,
      telephone: BASE_BUSINESS_INFO.telephone,
      url: BASE_BUSINESS_INFO.baseUrl
    },
    areaServed: {
      '@type': 'City',
      name: location.city,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '29.4052',
        longitude: '-94.9355'
      }
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${BASE_BUSINESS_INFO.baseUrl}/mobile-notary-${location.zipCode}`,
      servicePhone: BASE_BUSINESS_INFO.telephone
    }
  }));
}

/**
 * Generate comprehensive FAQ schema for local searches
 */
export function generateLocalFAQSchema(location: string): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Do you provide mobile notary service in ${location}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, we provide professional mobile notary service throughout ${location} and surrounding areas. We come to your location for convenient document notarization.`
        }
      },
      {
        '@type': 'Question',
        name: `What is the cost for mobile notary service in ${location}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Our mobile notary service in ${location} starts at $75 for basic document notarization. Pricing varies based on document complexity and service type. Call 832-617-4285 for a quote.`
        }
      },
      {
        '@type': 'Question',
        name: `How quickly can you get to ${location}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `We offer same-day service in ${location} with typical response times of 2-4 hours. Emergency service may be available for urgent needs.`
        }
      },
      {
        '@type': 'Question',
        name: `What documents can you notarize in ${location}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `We can notarize a wide range of documents in ${location} including real estate documents, legal forms, business documents, powers of attorney, and more. Contact us for specific document types.`
        }
      }
    ]
  };
}

/**
 * Generate breadcrumb schema for local pages
 */
export function generateLocalBreadcrumbSchema(location: string, zipCode?: string): any {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: BASE_BUSINESS_INFO.baseUrl
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Services',
      item: `${BASE_BUSINESS_INFO.baseUrl}/services`
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Mobile Notary',
      item: `${BASE_BUSINESS_INFO.baseUrl}/services/mobile-notary`
    }
  ];

  if (zipCode) {
    items.push({
      '@type': 'ListItem',
      position: 4,
      name: `${location} ${zipCode}`,
      item: `${BASE_BUSINESS_INFO.baseUrl}/mobile-notary-${zipCode}`
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 4,
      name: location,
      item: `${BASE_BUSINESS_INFO.baseUrl}/services/mobile-notary/${location.toLowerCase().replace(/\s+/g, '-')}`
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}

/**
 * Generate complete local schema bundle for a location
 */
export function generateCompleteLocalSchema(location: string, zipCode?: string) {
  const schemas = [];

  if (zipCode) {
    // ZIP code specific schemas
    schemas.push(generateZipCodeLocalBusinessSchema(zipCode));
    schemas.push(generateLocalFAQSchema(`${location} ${zipCode}`));
  } else {
    // City specific schemas
    const citySlug = location.toLowerCase().replace(/\s+/g, '-');
    schemas.push(generateCityLocalBusinessSchema(citySlug));
    schemas.push(generateLocalFAQSchema(location));
  }

  schemas.push(generateLocalBreadcrumbSchema(location, zipCode));

  return schemas;
}

/**
 * Get all landmark schemas for a location
 */
export function getLandmarkSchemas(zipCode: string): LandmarkSchema[] {
  const location = LOCAL_SEO_ZIP_CODES.find(loc => loc.zipCode === zipCode);
  
  if (!location) {
    return [];
  }

  return location.landmarks.map(landmark => 
    generateLandmarkServiceSchema(landmark, location.city, location.zipCode)
  );
}

/**
 * Export all schemas for sitemap generation
 */
export function getAllLocalSchemas() {
  const allSchemas = [];

  // Add ZIP code schemas
  LOCAL_SEO_ZIP_CODES.forEach(location => {
    allSchemas.push(generateZipCodeLocalBusinessSchema(location.zipCode));
  });

  // Add city schemas
  LOCAL_CONTENT_CLUSTERS.forEach(cluster => {
    allSchemas.push(generateCityLocalBusinessSchema(cluster.slug));
  });

  // Add service area schemas
  allSchemas.push(...generateServiceAreaSchema());

  return allSchemas;
} 