/**
 * Phase 6.1: Local SEO Expansion Data
 * Houston Mobile Notary Pros - Local SEO Domination
 * 
 * Comprehensive data structure for capturing 6.1M "near me" searches
 * with hyper-local content and ZIP code-specific landing pages.
 */

export interface LocalSEOLocation {
  zipCode: string;
  city: string;
  neighborhood?: string;
  county: string;
  distance: number; // miles from 77591
  population: number;
  landmarks: string[];
  businessDistricts: string[];
  medicalCenters: string[];
  schools: string[];
  localKeywords: string[];
  nearbyRestaurants: string[];
  shoppingCenters: string[];
  communityFeatures: string[];
}

export interface LocalContentCluster {
  city: string;
  slug: string;
  mainZipCode: string;
  allZipCodes: string[];
  metaTitle: string;
  metaDescription: string;
  h1Title: string;
  heroDescription: string;
  localKeywords: string[];
  nearMeKeywords: string[];
  landmarkKeywords: string[];
  competitorKeywords: string[];
}

// ZIP codes within 25-mile radius of 77591 (Texas City, TX)
export const LOCAL_SEO_ZIP_CODES: LocalSEOLocation[] = [
  // Primary service area (0-15 miles)
  {
    zipCode: '77591',
    city: 'Texas City',
    county: 'Galveston',
    distance: 0,
    population: 51000,
    landmarks: ['Texas City Dike', 'Tanger Outlets', 'Texas City Museum', 'Carbide Park'],
    businessDistricts: ['Texas City Downtown', 'Tanger Outlets Area', 'Texas City Industrial'],
    medicalCenters: ['Mainland Medical Center', 'Texas City Health Center'],
    schools: ['Texas City High School', 'Blocker Middle School'],
    localKeywords: ['mobile notary Texas City', 'notary 77591', 'Texas City notary service'],
    nearbyRestaurants: ['Shrimp N Stuff Downtown', 'Monument Inn', 'Fish Tales'],
    shoppingCenters: ['Tanger Outlets Texas City', 'Texas City Plaza'],
    communityFeatures: ['Texas City Dike', 'Nessler Park', 'Texas City Museum']
  },
  {
    zipCode: '77590',
    city: 'Texas City',
    county: 'Galveston',
    distance: 2,
    population: 48000,
    landmarks: ['Texas City Refinery', 'College of the Mainland', 'Texas City Prairie Preserve'],
    businessDistricts: ['Refinery Row', 'College of the Mainland Area'],
    medicalCenters: ['Mainland Medical Center Emergency', 'Texas City Medical Plaza'],
    schools: ['College of the Mainland', 'Texas City Middle School'],
    localKeywords: ['mobile notary 77590', 'Texas City notary', 'College of the Mainland notary'],
    nearbyRestaurants: ['Yaga\'s Burgers', 'Kelley\'s Restaurant', 'Subway on Palmer'],
    shoppingCenters: ['Texas City Shopping Center', 'Walmart Texas City'],
    communityFeatures: ['Texas City Prairie Preserve', 'Shoal Point Park']
  },
  // League City area (10-15 miles)
  {
    zipCode: '77573',
    city: 'League City',
    county: 'Galveston',
    distance: 12,
    population: 108000,
    landmarks: ['League Park', 'Helen Hall Library', 'Walter Hall Park', 'League City Historical Museum'],
    businessDistricts: ['League City Town Center', 'South Shore Harbour', 'League City Parkway'],
    medicalCenters: ['Houston Methodist St. Catherine Hospital', 'Clear Lake Regional Medical Center'],
    schools: ['Clear Springs High School', 'League City Intermediate'],
    localKeywords: ['mobile notary League City', 'notary 77573', 'League City notary service'],
    nearbyRestaurants: ['Gringo\'s Mexican Kitchen', 'Saltgrass Steak House', 'Cracker Barrel'],
    shoppingCenters: ['League City Marketplace', 'South Shore Harbour Marina'],
    communityFeatures: ['League Park', 'Helen Hall Library', 'Walter Hall Park']
  },
  {
    zipCode: '77574',
    city: 'League City',
    county: 'Galveston',
    distance: 14,
    population: 35000,
    landmarks: ['League City Regional Park', 'Countryside Park', 'League City Golf Course'],
    businessDistricts: ['League City Parkway Corridor', 'South Shore Business District'],
    medicalCenters: ['Houston Methodist League City', 'League City Medical Center'],
    schools: ['League City High School', 'Austin Elementary'],
    localKeywords: ['mobile notary 77574', 'League City south notary', 'League City mobile notary'],
    nearbyRestaurants: ['Pappa\'s Seafood House', 'Olive Garden League City', 'Chick-fil-A'],
    shoppingCenters: ['League City Town Center', 'Market Street League City'],
    communityFeatures: ['League City Regional Park', 'Countryside Park']
  },
  // Friendswood area (15-20 miles)
  {
    zipCode: '77546',
    city: 'Friendswood',
    county: 'Harris/Galveston',
    distance: 18,
    population: 40000,
    landmarks: ['Stevenson Park', 'Friendswood City Park', 'Friendswood Museum'],
    businessDistricts: ['Friendswood Downtown', 'West Ranch Shopping Center'],
    medicalCenters: ['Houston Methodist San Jacinto Hospital', 'Friendswood Medical Center'],
    schools: ['Friendswood High School', 'Friendswood Junior High'],
    localKeywords: ['mobile notary Friendswood', 'notary 77546', 'Friendswood notary service'],
    nearbyRestaurants: ['Gringo\'s Mexican Kitchen', 'Saltgrass Steak House', 'Chick-fil-A'],
    shoppingCenters: ['West Ranch Shopping Center', 'Friendswood Plaza'],
    communityFeatures: ['Stevenson Park', 'Friendswood City Park', 'Centennial Park']
  },
  // Pearland area (20-25 miles)
  {
    zipCode: '77581',
    city: 'Pearland',
    county: 'Brazoria',
    distance: 22,
    population: 125000,
    landmarks: ['Pearland Town Center', 'Pearland Recreation Center', 'Pearland Historical Museum'],
    businessDistricts: ['Pearland Town Center', 'Highway 288 Corridor', 'Pearland Parkway'],
    medicalCenters: ['Houston Methodist Pearland Hospital', 'Memorial Hermann Pearland'],
    schools: ['Pearland High School', 'Dawson High School', 'Pearland ISD'],
    localKeywords: ['mobile notary Pearland', 'notary 77581', 'Pearland notary service'],
    nearbyRestaurants: ['Pappadeaux Seafood Kitchen', 'Olive Garden Pearland', 'Texas Roadhouse'],
    shoppingCenters: ['Pearland Town Center', 'Pearland Marketplace'],
    communityFeatures: ['Pearland Town Center', 'Pearland Recreation Center']
  },
  {
    zipCode: '77584',
    city: 'Pearland',
    county: 'Brazoria',
    distance: 24,
    population: 45000,
    landmarks: ['Shadow Creek Ranch', 'Pearland Regional Airport', 'Independence Park'],
    businessDistricts: ['Shadow Creek Ranch Town Center', 'Pearland Parkway South'],
    medicalCenters: ['Houston Methodist Pearland', 'Pearland Medical Center'],
    schools: ['Shadow Creek High School', 'Pearland Junior High South'],
    localKeywords: ['mobile notary 77584', 'Shadow Creek Ranch notary', 'Pearland south notary'],
    nearbyRestaurants: ['Gringo\'s Mexican Kitchen', 'Chuy\'s Pearland', 'Buffalo Wild Wings'],
    shoppingCenters: ['Shadow Creek Ranch Shopping', 'Pearland Town Center South'],
    communityFeatures: ['Shadow Creek Ranch', 'Independence Park', 'Pearland Regional Airport']
  },
  // Clear Lake area (18-25 miles)
  {
    zipCode: '77058',
    city: 'Clear Lake',
    neighborhood: 'Clear Lake City',
    county: 'Harris',
    distance: 20,
    population: 45000,
    landmarks: ['NASA Johnson Space Center', 'Space Center Houston', 'Clear Lake', 'Armand Bayou'],
    businessDistricts: ['NASA Road 1 Corridor', 'Clear Lake City Boulevard', 'Space Center Business District'],
    medicalCenters: ['Clear Lake Regional Medical Center', 'Houston Methodist Clear Lake'],
    schools: ['Clear Lake High School', 'Clear Brook High School', 'NASA Elementary'],
    localKeywords: ['mobile notary Clear Lake', 'notary 77058', 'NASA area notary', 'Clear Lake City notary'],
    nearbyRestaurants: ['Saltgrass Steak House', 'Pappadeaux Seafood', 'Landry\'s Seafood'],
    shoppingCenters: ['Baybrook Mall', 'Clear Lake Marketplace'],
    communityFeatures: ['NASA Johnson Space Center', 'Clear Lake Park', 'Armand Bayou Nature Center']
  },
  {
    zipCode: '77059',
    city: 'Clear Lake',
    neighborhood: 'Clear Lake Shores',
    county: 'Harris',
    distance: 22,
    population: 35000,
    landmarks: ['Clear Lake Marina', 'Kemah Boardwalk', 'Clear Lake Shores Golf Course'],
    businessDistricts: ['Clear Lake City Boulevard', 'NASA Road 1', 'Marina District'],
    medicalCenters: ['Clear Lake Regional Medical Center', 'Bay Area Regional Medical Center'],
    schools: ['Clear Lake Intermediate', 'Clear Falls High School'],
    localKeywords: ['mobile notary 77059', 'Clear Lake Shores notary', 'marina notary service'],
    nearbyRestaurants: ['Landry\'s Seafood', 'Kemah Boardwalk restaurants', 'Flying Dutchman'],
    shoppingCenters: ['Clear Lake Marketplace', 'Kemah Boardwalk'],
    communityFeatures: ['Clear Lake Marina', 'Kemah Boardwalk', 'Clear Lake Shores Golf Course']
  },
  // Webster area (20-25 miles)
  {
    zipCode: '77598',
    city: 'Webster',
    county: 'Harris',
    distance: 21,
    population: 12000,
    landmarks: ['NASA Road 1', 'Clear Lake Park', 'Webster Presbyterian Church'],
    businessDistricts: ['NASA Road 1 Corridor', 'Webster City Center'],
    medicalCenters: ['Bay Area Regional Medical Center', 'Clear Lake Regional Medical Center'],
    schools: ['Clear Lake High School', 'Webster Elementary'],
    localKeywords: ['mobile notary Webster', 'notary 77598', 'NASA Road 1 notary'],
    nearbyRestaurants: ['Gringo\'s Mexican Kitchen', 'Chili\'s Webster', 'Subway NASA Road 1'],
    shoppingCenters: ['Webster Shopping Center', 'NASA Road 1 Plaza'],
    communityFeatures: ['Clear Lake Park', 'Webster City Hall', 'NASA Road 1 corridor']
  },
  // Pasadena area (25-30 miles)
  {
    zipCode: '77502',
    city: 'Pasadena',
    county: 'Harris',
    distance: 25,
    population: 155000,
    landmarks: ['Pasadena Convention Center', 'Strawberry Park', 'Pasadena Historical Museum'],
    businessDistricts: ['Pasadena Downtown', 'Spencer Highway', 'Fairmont Parkway'],
    medicalCenters: ['Bayshore Medical Center', 'Houston Methodist Baytown'],
    schools: ['Pasadena High School', 'South Houston High School'],
    localKeywords: ['mobile notary Pasadena', 'notary 77502', 'Pasadena TX notary'],
    nearbyRestaurants: ['Pappasito\'s Cantina', 'Luby\'s Pasadena', 'Golden Corral'],
    shoppingCenters: ['Pasadena Town Square', 'Spencer Highway Shopping'],
    communityFeatures: ['Pasadena Convention Center', 'Strawberry Park', 'Pasadena Memorial Stadium']
  },
  // Galveston area (20-25 miles)
  {
    zipCode: '77550',
    city: 'Galveston',
    county: 'Galveston',
    distance: 23,
    population: 48000,
    landmarks: ['Galveston Historic District', 'The Strand', 'Galveston Seawall', 'Pleasure Pier'],
    businessDistricts: ['Galveston Downtown', 'The Strand Historic District', 'Seawall Boulevard'],
    medicalCenters: ['UTMB Galveston', 'Galveston Regional Medical Center'],
    schools: ['Ball High School', 'Galveston College'],
    localKeywords: ['mobile notary Galveston', 'notary 77550', 'Galveston Island notary'],
    nearbyRestaurants: ['The Rooftop Bar', 'Fisherman\'s Wharf', 'Landry\'s Galveston'],
    shoppingCenters: ['Galveston Island Historic Pleasure Pier', 'The Strand Shopping'],
    communityFeatures: ['Galveston Seawall', 'The Strand Historic District', 'Galveston Beach']
  },
  // Sugar Land area (30-35 miles) - Extended range
  {
    zipCode: '77479',
    city: 'Sugar Land',
    county: 'Fort Bend',
    distance: 32,
    population: 120000,
    landmarks: ['Sugar Land Town Square', 'Smart Financial Centre', 'Sugar Land Memorial Park'],
    businessDistricts: ['Sugar Land Town Square', 'Highway 6 Corridor', 'University Boulevard'],
    medicalCenters: ['Houston Methodist Sugar Land Hospital', 'Memorial Hermann Sugar Land'],
    schools: ['Clements High School', 'Austin High School', 'Sugar Land Middle School'],
    localKeywords: ['mobile notary Sugar Land', 'notary 77479', 'Sugar Land notary service'],
    nearbyRestaurants: ['The Rooftop Bar', 'Pappadeaux Seafood', 'Perry\'s Steakhouse'],
    shoppingCenters: ['Sugar Land Town Square', 'First Colony Mall'],
    communityFeatures: ['Sugar Land Town Square', 'Smart Financial Centre', 'Sugar Land Memorial Park']
  }
];

// Content clusters for major cities
export const LOCAL_CONTENT_CLUSTERS: LocalContentCluster[] = [
  {
    city: 'Texas City',
    slug: 'texas-city',
    mainZipCode: '77591',
    allZipCodes: ['77591', '77590'],
    metaTitle: 'Mobile Notary Texas City TX | 24/7 Notary Service 77591, 77590',
    metaDescription: 'Professional mobile notary service in Texas City, TX. Serving ZIP codes 77591, 77590. Same-day appointments, loan signings, and document notarization.',
    h1Title: 'Mobile Notary Service in Texas City, TX',
    heroDescription: 'Professional mobile notary service serving Texas City and surrounding areas. We come to you at your home, office, or any convenient location.',
    localKeywords: [
      'mobile notary Texas City',
      'notary service 77591',
      'Texas City notary public',
      'mobile notary 77590',
      'Texas City document notarization'
    ],
    nearMeKeywords: [
      'mobile notary near me Texas City',
      'notary near Texas City Dike',
      'mobile notary near Tanger Outlets',
      'notary near College of the Mainland',
      'mobile notary near Mainland Medical Center'
    ],
    landmarkKeywords: [
      'notary Texas City Dike',
      'mobile notary Tanger Outlets',
      'notary College of the Mainland',
      'mobile notary Mainland Medical Center',
      'notary Texas City Museum'
    ],
    competitorKeywords: [
      'Texas City notary service',
      'best mobile notary Texas City',
      'affordable notary Texas City',
      'same day notary Texas City'
    ]
  },
  {
    city: 'League City',
    slug: 'league-city',
    mainZipCode: '77573',
    allZipCodes: ['77573', '77574'],
    metaTitle: 'Mobile Notary League City TX | Professional Service 77573, 77574',
    metaDescription: 'Trusted mobile notary in League City, TX. Fast, professional service for ZIP codes 77573, 77574. Real estate, legal documents, and more.',
    h1Title: 'Mobile Notary Service in League City, TX',
    heroDescription: 'Fast and reliable mobile notary service in League City. We specialize in real estate closings, legal documents, and business notarizations.',
    localKeywords: [
      'mobile notary League City',
      'notary service 77573',
      'League City notary public',
      'mobile notary 77574',
      'League City document notarization'
    ],
    nearMeKeywords: [
      'mobile notary near me League City',
      'notary near League Park',
      'mobile notary near South Shore Harbour',
      'notary near Helen Hall Library',
      'mobile notary near Walter Hall Park'
    ],
    landmarkKeywords: [
      'notary League Park',
      'mobile notary South Shore Harbour',
      'notary Helen Hall Library',
      'mobile notary Walter Hall Park',
      'notary League City Town Center'
    ],
    competitorKeywords: [
      'League City notary service',
      'best mobile notary League City',
      'affordable notary League City',
      'same day notary League City'
    ]
  },
  {
    city: 'Pearland',
    slug: 'pearland',
    mainZipCode: '77581',
    allZipCodes: ['77581', '77584'],
    metaTitle: 'Mobile Notary Pearland TX | Expert Service 77581, 77584',
    metaDescription: 'Professional mobile notary service in Pearland, TX. Serving Shadow Creek Ranch, Town Center, and all Pearland neighborhoods. Same-day service available.',
    h1Title: 'Mobile Notary Service in Pearland, TX',
    heroDescription: 'Expert mobile notary service throughout Pearland, including Shadow Creek Ranch and Pearland Town Center. Professional, reliable, and convenient.',
    localKeywords: [
      'mobile notary Pearland',
      'notary service 77581',
      'Pearland notary public',
      'mobile notary 77584',
      'Shadow Creek Ranch notary'
    ],
    nearMeKeywords: [
      'mobile notary near me Pearland',
      'notary near Pearland Town Center',
      'mobile notary near Shadow Creek Ranch',
      'notary near Houston Methodist Pearland',
      'mobile notary near Pearland Recreation Center'
    ],
    landmarkKeywords: [
      'notary Pearland Town Center',
      'mobile notary Shadow Creek Ranch',
      'notary Houston Methodist Pearland',
      'mobile notary Pearland Recreation Center',
      'notary Pearland High School'
    ],
    competitorKeywords: [
      'Pearland notary service',
      'best mobile notary Pearland',
      'affordable notary Pearland',
      'same day notary Pearland'
    ]
  },
  {
    city: 'Clear Lake',
    slug: 'clear-lake',
    mainZipCode: '77058',
    allZipCodes: ['77058', '77059'],
    metaTitle: 'Mobile Notary Clear Lake TX | NASA Area Service 77058, 77059',
    metaDescription: 'Mobile notary service in Clear Lake, TX and NASA area. Professional service for Space Center employees, residents, and businesses. Call now!',
    h1Title: 'Mobile Notary Service in Clear Lake, TX',
    heroDescription: 'Professional mobile notary service in Clear Lake and NASA area. Serving Space Center employees, residents, and local businesses with reliable document notarization.',
    localKeywords: [
      'mobile notary Clear Lake',
      'notary service 77058',
      'Clear Lake notary public',
      'mobile notary 77059',
      'NASA area notary'
    ],
    nearMeKeywords: [
      'mobile notary near me Clear Lake',
      'notary near NASA Johnson Space Center',
      'mobile notary near Space Center Houston',
      'notary near Clear Lake Regional Medical Center',
      'mobile notary near Baybrook Mall'
    ],
    landmarkKeywords: [
      'notary NASA Johnson Space Center',
      'mobile notary Space Center Houston',
      'notary Clear Lake Regional Medical Center',
      'mobile notary Baybrook Mall',
      'notary Clear Lake Park'
    ],
    competitorKeywords: [
      'Clear Lake notary service',
      'best mobile notary Clear Lake',
      'affordable notary Clear Lake',
      'NASA area notary service'
    ]
  }
];

// Local keyword variations for "near me" searches
export const NEAR_ME_VARIATIONS = [
  'mobile notary near me',
  'notary public near me',
  'notary service near me',
  'mobile notary close to me',
  'notary near my location',
  'mobile notary in my area',
  'local mobile notary',
  'nearby notary service',
  'mobile notary around me',
  'notary public close by'
];

// Landmark-based keywords for local SEO
export const LANDMARK_KEYWORDS = [
  'notary near hospital',
  'mobile notary medical center',
  'notary near shopping mall',
  'mobile notary business district',
  'notary near school',
  'mobile notary downtown',
  'notary near library',
  'mobile notary restaurant',
  'notary near park',
  'mobile notary office building'
];

// Business district keywords
export const BUSINESS_DISTRICT_KEYWORDS = [
  'mobile notary downtown',
  'notary business district',
  'mobile notary industrial area',
  'notary commercial district',
  'mobile notary office complex',
  'notary business park',
  'mobile notary corporate center',
  'notary financial district'
];

// Get location data by ZIP code
export function getLocationByZipCode(zipCode: string): LocalSEOLocation | undefined {
  return LOCAL_SEO_ZIP_CODES.find(location => location.zipCode === zipCode);
}

// Get content cluster by city slug
export function getContentClusterBySlug(slug: string): LocalContentCluster | undefined {
  return LOCAL_CONTENT_CLUSTERS.find(cluster => cluster.slug === slug);
}

// Get all ZIP codes within specific distance
export function getZipCodesByDistance(maxDistance: number): LocalSEOLocation[] {
  return LOCAL_SEO_ZIP_CODES.filter(location => location.distance <= maxDistance);
}

// Generate local keywords for specific location
export function generateLocalKeywords(location: LocalSEOLocation): string[] {
  const baseKeywords = [
    `mobile notary ${location.city}`,
    `notary ${location.zipCode}`,
    `mobile notary ${location.zipCode}`,
    `${location.city} notary service`,
    `${location.city} mobile notary`,
    `notary public ${location.city}`,
    `${location.city} document notarization`
  ];

  // Add landmark-based keywords
  const landmarkKeywords = location.landmarks.map(landmark => 
    `mobile notary near ${landmark}`
  );

  // Add business district keywords
  const businessKeywords = location.businessDistricts.map(district => 
    `mobile notary ${district}`
  );

  return [...baseKeywords, ...landmarkKeywords, ...businessKeywords];
}

// Generate schema markup for local business
export function generateLocalBusinessSchema(location: LocalSEOLocation) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Houston Mobile Notary Pros - ${location.city}`,
    "description": `Professional mobile notary service in ${location.city}, TX ${location.zipCode}. Same-day appointments, loan signings, and document notarization.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location.city,
      "addressRegion": "TX",
      "postalCode": location.zipCode,
      "addressCountry": "US"
    },
    "telephone": "832-617-4285",
    "url": `https://houstonmobilenotarypros.com/mobile-notary-${location.zipCode}`,
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "29.4052",
        "longitude": "-94.9355"
      },
      "geoRadius": "40233" // 25 miles in meters
    },
    "serviceArea": location.city,
    "priceRange": "$$",
    "openingHours": [
      "Mo-Fr 09:00-17:00",
      "Sa-Su 09:00-17:00"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "247"
    }
  };
} 