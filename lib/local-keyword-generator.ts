/**
 * Phase 6.1: Local Keyword Generator
 * Comprehensive keyword generation for local SEO domination
 * Target: 500+ local keyword variations for "near me" searches
 */

import { LOCAL_SEO_ZIP_CODES, LOCAL_CONTENT_CLUSTERS } from './local-seo-data';

export interface LocalKeywordSet {
  primary: string[];
  secondary: string[];
  longTail: string[];
  nearMe: string[];
  landmark: string[];
  businessDistrict: string[];
  competitor: string[];
  serviceSpecific: string[];
  locationModifiers: string[];
  urgencyModifiers: string[];
}

export interface KeywordAnalysis {
  location: string;
  totalKeywords: number;
  categories: {
    [key: string]: number;
  };
  topKeywords: string[];
  competitorKeywords: string[];
  opportunityKeywords: string[];
}

// Base service keywords
const BASE_SERVICE_KEYWORDS = [
  'mobile notary',
  'notary service',
  'notary public',
  'traveling notary',
  'mobile notary service',
  'notary near me',
  'mobile notary near me',
  'notary public near me',
  'document notarization',
  'notary services',
  'loan signing',
  'loan signing agent',
  'notary signing agent',
  'real estate notary',
  'business notary',
  'apostille service',
  'notarization service',
  'certified notary',
  'licensed notary',
  'bonded notary'
];

// Location modifiers
const LOCATION_MODIFIERS = [
  'in',
  'near',
  'around',
  'close to',
  'serving',
  'covering',
  'throughout',
  'across',
  'within',
  'at'
];

// Urgency/time modifiers
const URGENCY_MODIFIERS = [
  'same day',
  'same-day',
  'today',
  'now',
  'urgent',
  'emergency',
  'immediate',
  'fast',
  'quick',
  'asap',
  'right now',
  'this morning',
  'this afternoon',
  'this evening',
  'tonight',
  'weekend',
  'after hours',
  'after-hours',
  'evening',
  'early morning',
  'late night',
  '24 hour',
  '24-hour',
  '24/7'
];

// Service type modifiers
const SERVICE_TYPE_MODIFIERS = [
  'residential',
  'home',
  'office',
  'business',
  'corporate',
  'commercial',
  'medical',
  'hospital',
  'legal',
  'real estate',
  'mortgage',
  'refinance',
  'closing',
  'loan signing',
  'document',
  'form',
  'contract',
  'agreement',
  'power of attorney',
  'will',
  'estate planning',
  'immigration',
  'apostille',
  'translation',
  'affidavit',
  'acknowledgment',
  'jurat',
  'certification'
];

// Quality modifiers
const QUALITY_MODIFIERS = [
  'best',
  'top',
  'professional',
  'certified',
  'licensed',
  'bonded',
  'insured',
  'experienced',
  'reliable',
  'trusted',
  'affordable',
  'cheap',
  'low cost',
  'reasonable',
  'competitive',
  'quality',
  'expert',
  'skilled',
  'qualified',
  'premier',
  'elite',
  'premium'
];

// Business type keywords
const BUSINESS_TYPE_KEYWORDS = [
  'hospital notary',
  'medical center notary',
  'office building notary',
  'corporate notary',
  'law firm notary',
  'title company notary',
  'bank notary',
  'credit union notary',
  'insurance office notary',
  'real estate office notary',
  'government building notary',
  'courthouse notary',
  'city hall notary',
  'school district notary',
  'university notary',
  'hotel notary',
  'restaurant notary',
  'retail store notary',
  'shopping center notary',
  'mall notary',
  'airport notary',
  'nursing home notary',
  'assisted living notary',
  'home health notary'
];

// Competitor-style keywords
const COMPETITOR_KEYWORDS = [
  'vs UPS Store notary',
  'vs FedEx Office notary',
  'vs bank notary',
  'vs online notary',
  'alternative to UPS notary',
  'better than UPS Store',
  'cheaper than UPS notary',
  'faster than bank notary',
  'more convenient than',
  'instead of UPS Store',
  'mobile vs office notary',
  'home vs office notary',
  'traveling vs stationary notary'
];

/**
 * Generate comprehensive keyword set for a specific location
 */
export function generateLocationKeywords(location: string, zipCode?: string): LocalKeywordSet {
  const locationName = zipCode ? `${location} ${zipCode}` : location;
  const shortLocation = location;
  
  const keywords: LocalKeywordSet = {
    primary: [],
    secondary: [],
    longTail: [],
    nearMe: [],
    landmark: [],
    businessDistrict: [],
    competitor: [],
    serviceSpecific: [],
    locationModifiers: [],
    urgencyModifiers: []
  };

  // Generate primary keywords
  BASE_SERVICE_KEYWORDS.forEach(service => {
    keywords.primary.push(`${service} ${locationName}`);
    keywords.primary.push(`${service} in ${locationName}`);
    keywords.primary.push(`${service} near ${locationName}`);
    if (zipCode) {
      keywords.primary.push(`${service} ${zipCode}`);
    }
  });

  // Generate secondary keywords with modifiers
  BASE_SERVICE_KEYWORDS.forEach(service => {
    LOCATION_MODIFIERS.forEach(modifier => {
      keywords.secondary.push(`${service} ${modifier} ${locationName}`);
      keywords.secondary.push(`${service} ${modifier} ${shortLocation}`);
    });
  });

  // Generate "near me" variations
  const nearMeVariations = [
    'near me',
    'close to me',
    'around me',
    'in my area',
    'nearby',
    'close by',
    'local',
    'in the area'
  ];

  nearMeVariations.forEach(variation => {
    BASE_SERVICE_KEYWORDS.forEach(service => {
      keywords.nearMe.push(`${service} ${variation} ${locationName}`);
      keywords.nearMe.push(`${service} ${variation} ${shortLocation}`);
    });
  });

  // Generate long-tail keywords
  URGENCY_MODIFIERS.forEach(urgency => {
    BASE_SERVICE_KEYWORDS.forEach(service => {
      keywords.longTail.push(`${urgency} ${service} ${locationName}`);
      keywords.longTail.push(`${urgency} ${service} in ${locationName}`);
      keywords.longTail.push(`${urgency} ${service} near ${locationName}`);
    });
  });

  // Generate service-specific keywords
  SERVICE_TYPE_MODIFIERS.forEach(serviceType => {
    BASE_SERVICE_KEYWORDS.forEach(service => {
      keywords.serviceSpecific.push(`${serviceType} ${service} ${locationName}`);
      keywords.serviceSpecific.push(`${serviceType} ${service} in ${locationName}`);
    });
  });

  // Generate quality-modified keywords
  QUALITY_MODIFIERS.forEach(quality => {
    BASE_SERVICE_KEYWORDS.forEach(service => {
      keywords.serviceSpecific.push(`${quality} ${service} ${locationName}`);
      keywords.serviceSpecific.push(`${quality} ${service} in ${locationName}`);
    });
  });

  // Generate business type keywords
  BUSINESS_TYPE_KEYWORDS.forEach(businessType => {
    keywords.businessDistrict.push(`${businessType} ${locationName}`);
    keywords.businessDistrict.push(`${businessType} in ${locationName}`);
    keywords.businessDistrict.push(`${businessType} near ${locationName}`);
  });

  // Generate competitor keywords
  COMPETITOR_KEYWORDS.forEach(competitor => {
    keywords.competitor.push(`${competitor} ${locationName}`);
    keywords.competitor.push(`${competitor} in ${locationName}`);
  });

  return keywords;
}

/**
 * Generate landmark-specific keywords
 */
export function generateLandmarkKeywords(landmark: string, location: string, zipCode?: string): string[] {
  const locationName = zipCode ? `${location} ${zipCode}` : location;
  const landmarkKeywords: string[] = [];

  // Direct landmark keywords
  BASE_SERVICE_KEYWORDS.forEach(service => {
    landmarkKeywords.push(`${service} near ${landmark}`);
    landmarkKeywords.push(`${service} at ${landmark}`);
    landmarkKeywords.push(`${service} close to ${landmark}`);
    landmarkKeywords.push(`${service} around ${landmark}`);
  });

  // Landmark + location keywords
  BASE_SERVICE_KEYWORDS.forEach(service => {
    landmarkKeywords.push(`${service} ${landmark} ${locationName}`);
    landmarkKeywords.push(`${service} near ${landmark} ${locationName}`);
  });

  // Urgency + landmark keywords
  URGENCY_MODIFIERS.forEach(urgency => {
    BASE_SERVICE_KEYWORDS.forEach(service => {
      landmarkKeywords.push(`${urgency} ${service} ${landmark}`);
      landmarkKeywords.push(`${urgency} ${service} near ${landmark}`);
    });
  });

  return landmarkKeywords;
}

/**
 * Generate ZIP code specific keywords
 */
export function generateZipCodeKeywords(zipCode: string): string[] {
  const location = LOCAL_SEO_ZIP_CODES.find(loc => loc.zipCode === zipCode);
  if (!location) return [];

  const zipKeywords: string[] = [];

  // Direct ZIP code keywords
  BASE_SERVICE_KEYWORDS.forEach(service => {
    zipKeywords.push(`${service} ${zipCode}`);
    zipKeywords.push(`${service} in ${zipCode}`);
    zipKeywords.push(`${service} ZIP code ${zipCode}`);
  });

  // ZIP code + city keywords
  BASE_SERVICE_KEYWORDS.forEach(service => {
    zipKeywords.push(`${service} ${location.city} ${zipCode}`);
    zipKeywords.push(`${service} in ${location.city} ${zipCode}`);
  });

  // Neighborhood-specific keywords
  if (location.neighborhood) {
    BASE_SERVICE_KEYWORDS.forEach(service => {
      zipKeywords.push(`${service} ${location.neighborhood}`);
      zipKeywords.push(`${service} in ${location.neighborhood}`);
    });
  }

  return zipKeywords;
}

/**
 * Generate business district keywords
 */
export function generateBusinessDistrictKeywords(location: string): string[] {
  const locationData = LOCAL_SEO_ZIP_CODES.find(loc => 
    loc.city.toLowerCase() === location.toLowerCase()
  );
  
  if (!locationData) return [];

  const businessKeywords: string[] = [];

  locationData.businessDistricts.forEach(district => {
    BASE_SERVICE_KEYWORDS.forEach(service => {
      businessKeywords.push(`${service} ${district}`);
      businessKeywords.push(`${service} in ${district}`);
      businessKeywords.push(`${service} near ${district}`);
    });

    // Business-specific keywords
    BUSINESS_TYPE_KEYWORDS.forEach(businessType => {
      businessKeywords.push(`${businessType} ${district}`);
      businessKeywords.push(`${businessType} in ${district}`);
    });
  });

  return businessKeywords;
}

/**
 * Generate medical center keywords
 */
export function generateMedicalCenterKeywords(location: string): string[] {
  const locationData = LOCAL_SEO_ZIP_CODES.find(loc => 
    loc.city.toLowerCase() === location.toLowerCase()
  );
  
  if (!locationData) return [];

  const medicalKeywords: string[] = [];

  locationData.medicalCenters.forEach(center => {
    BASE_SERVICE_KEYWORDS.forEach(service => {
      medicalKeywords.push(`${service} ${center}`);
      medicalKeywords.push(`${service} at ${center}`);
      medicalKeywords.push(`${service} near ${center}`);
    });

    // Medical-specific keywords
    const medicalServices = [
      'hospital notary',
      'medical notary',
      'bedside notary',
      'patient notary',
      'medical document notary',
      'healthcare notary',
      'medical power of attorney',
      'advance directive notary',
      'healthcare directive notary',
      'medical consent notary'
    ];

    medicalServices.forEach(medicalService => {
      medicalKeywords.push(`${medicalService} ${center}`);
      medicalKeywords.push(`${medicalService} at ${center}`);
    });
  });

  return medicalKeywords;
}

/**
 * Generate comprehensive keyword analysis
 */
export function analyzeLocationKeywords(location: string, zipCode?: string): KeywordAnalysis {
  const baseKeywords = generateLocationKeywords(location, zipCode);
  const landmarkKeywords = zipCode ? 
    generateLandmarkKeywords('', location, zipCode) : 
    [];
  const businessKeywords = generateBusinessDistrictKeywords(location);
  const medicalKeywords = generateMedicalCenterKeywords(location);

  const allKeywords = [
    ...baseKeywords.primary,
    ...baseKeywords.secondary,
    ...baseKeywords.longTail,
    ...baseKeywords.nearMe,
    ...baseKeywords.landmark,
    ...baseKeywords.businessDistrict,
    ...baseKeywords.serviceSpecific,
    ...landmarkKeywords,
    ...businessKeywords,
    ...medicalKeywords
  ];

  const uniqueKeywords = Array.from(new Set(allKeywords));

  return {
    location: zipCode ? `${location} ${zipCode}` : location,
    totalKeywords: uniqueKeywords.length,
    categories: {
      primary: baseKeywords.primary.length,
      secondary: baseKeywords.secondary.length,
      longTail: baseKeywords.longTail.length,
      nearMe: baseKeywords.nearMe.length,
      landmark: landmarkKeywords.length,
      businessDistrict: businessKeywords.length,
      serviceSpecific: baseKeywords.serviceSpecific.length,
      competitor: baseKeywords.competitor.length,
      medical: medicalKeywords.length
    },
    topKeywords: uniqueKeywords.slice(0, 20),
    competitorKeywords: baseKeywords.competitor,
    opportunityKeywords: uniqueKeywords.filter(keyword => 
      keyword.includes('same day') || 
      keyword.includes('emergency') || 
      keyword.includes('mobile') ||
      keyword.includes('near me')
    )
  };
}

/**
 * Generate all keywords for service area
 */
export function generateAllServiceAreaKeywords(): string[] {
  const allKeywords: string[] = [];

  // Generate keywords for each ZIP code
  LOCAL_SEO_ZIP_CODES.forEach(location => {
    const zipKeywords = generateZipCodeKeywords(location.zipCode);
    const locationKeywords = generateLocationKeywords(location.city, location.zipCode);
    
    allKeywords.push(...zipKeywords);
    allKeywords.push(...locationKeywords.primary);
    allKeywords.push(...locationKeywords.secondary);
    allKeywords.push(...locationKeywords.longTail);
    allKeywords.push(...locationKeywords.nearMe);
    allKeywords.push(...locationKeywords.serviceSpecific);

    // Add landmark keywords
    location.landmarks.forEach(landmark => {
      const landmarkKeywords = generateLandmarkKeywords(landmark, location.city, location.zipCode);
      allKeywords.push(...landmarkKeywords);
    });
  });

  // Generate keywords for content clusters
  LOCAL_CONTENT_CLUSTERS.forEach(cluster => {
    const clusterKeywords = generateLocationKeywords(cluster.city);
    allKeywords.push(...clusterKeywords.primary);
    allKeywords.push(...clusterKeywords.secondary);
    allKeywords.push(...clusterKeywords.nearMe);
    allKeywords.push(...cluster.localKeywords);
    allKeywords.push(...cluster.nearMeKeywords);
    allKeywords.push(...cluster.landmarkKeywords);
  });

  return Array.from(new Set(allKeywords));
}

/**
 * Get top opportunity keywords
 */
export function getTopOpportunityKeywords(location: string, limit: number = 50): string[] {
  const analysis = analyzeLocationKeywords(location);
  return analysis.opportunityKeywords.slice(0, limit);
}

/**
 * Generate keyword density recommendations
 */
export function generateKeywordDensityRecommendations(location: string): {
  primary: string[];
  secondary: string[];
  supporting: string[];
} {
  const keywords = generateLocationKeywords(location);
  
  return {
    primary: keywords.primary.slice(0, 5),
    secondary: keywords.nearMe.slice(0, 10),
    supporting: keywords.longTail.slice(0, 15)
  };
}

/**
 * Export keyword data for content optimization
 */
export function exportKeywordData() {
  const keywordData = {
    totalLocations: LOCAL_SEO_ZIP_CODES.length,
    totalKeywords: 0,
    locationBreakdown: {} as any,
    globalKeywords: generateAllServiceAreaKeywords()
  };

  LOCAL_SEO_ZIP_CODES.forEach(location => {
    const analysis = analyzeLocationKeywords(location.city, location.zipCode);
    keywordData.locationBreakdown[location.zipCode] = analysis;
    keywordData.totalKeywords += analysis.totalKeywords;
  });

  return keywordData;
} 