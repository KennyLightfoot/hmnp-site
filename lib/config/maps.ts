/**
 * Google Maps API Configuration
 * Houston Mobile Notary Pros - Unified Maps Configuration
 * 
 * This file consolidates all Google Maps API configuration to resolve
 * the inconsistent API key usage across the application.
 * 
 * CRITICAL FIX: Updated to use environment variable cleaning utility
 * to address persistent production issues with trailing \n characters.
 */

import { getCleanEnv, detectEnvironmentCorruption } from '../env-clean';

// Detect environment corruption for Google Maps at startup
detectEnvironmentCorruption();

// ============================================================================
// API KEY CONFIGURATION (WITH AUTOMATIC CLEANING)
// ============================================================================

/**
 * Server-side API key for backend operations (SECURE)
 * Used for: Distance Matrix API, Geocoding API, Places API proxy
 * This key should have server-side restrictions only
 * 
 * FIXED: Now uses comprehensive environment variable cleaning
 */
export const GOOGLE_MAPS_SERVER_API_KEY = getCleanEnv('GOOGLE_MAPS_API_KEY') || process.env.GOOGLE_MAPS_API_KEY || '';

/**
 * Client-side API key for frontend operations (RESTRICTED)
 * Used for: Google Maps JavaScript API (if needed)
 * This key should have domain and API restrictions
 * 
 * FIXED: Now uses comprehensive environment variable cleaning
 */
export const GOOGLE_MAPS_CLIENT_API_KEY = getCleanEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY') || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

/**
 * Configuration validation
 */
export const API_KEY_STATUS = {
  hasServerKey: !!GOOGLE_MAPS_SERVER_API_KEY,
  hasClientKey: !!GOOGLE_MAPS_CLIENT_API_KEY,
  isConfigured: !!GOOGLE_MAPS_SERVER_API_KEY // Server key is primary requirement
} as const;

// ============================================================================
// SERVICE AREA CONFIGURATION
// ============================================================================

export const SERVICE_AREA_CONFIG = {
  // Base location (Houston Mobile Notary Pros office)
  BASE_LOCATION: {
    address: 'Texas City, TX 77591',
    coordinates: { lat: 29.4052, lng: -94.9355 },
    zipCode: '77591'
  },
  
  // Service radii (in miles) - SIMPLIFIED UNIVERSAL SYSTEM
  RADII: {
    STANDARD: 30,     // Universal free radius for all mobile services
    EXTENDED: 30,     // Universal free radius for all mobile services  
    MAXIMUM: 50,      // Absolute maximum service area
    FREE: 30          // Universal 30-mile free radius
  },
  
  // Pricing
  TRAVEL_FEE_RATE: 0.50, // $0.50 per mile beyond free radius
  
  // Service type configurations - UNIVERSAL 30-MILE FREE RADIUS
  SERVICES: {
    STANDARD_NOTARY: { 
      freeRadius: 30, // Universal free radius
      maxRadius: 50,
      name: 'Standard Notary'
    },
    EXTENDED_HOURS: { 
      freeRadius: 30, // Universal free radius
      maxRadius: 50,
      name: 'Extended Hours'
    },
    LOAN_SIGNING: { 
      freeRadius: 30, // Universal free radius
      maxRadius: 50,
      name: 'Loan Signing'
    },
    RON_SERVICES: { 
      freeRadius: 0, 
      maxRadius: 0,
      name: 'Remote Online Notarization'
    }
  }
} as const;

// ============================================================================
// GOOGLE MAPS API CONFIGURATION
// ============================================================================

export const GOOGLE_MAPS_CONFIG = {
  // Libraries to load
  LIBRARIES: ['places', 'geometry'] as const,
  
  // Map defaults
  DEFAULT_CENTER: SERVICE_AREA_CONFIG.BASE_LOCATION.coordinates,
  DEFAULT_ZOOM: 9,
  
  // API endpoints
  ENDPOINTS: {
    DISTANCE_MATRIX: 'https://maps.googleapis.com/maps/api/distancematrix/json',
    GEOCODING: 'https://maps.googleapis.com/maps/api/geocode/json',
    PLACES_AUTOCOMPLETE: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
  },
  
  // Request configuration
  RESTRICTIONS: {
    country: 'us',
    region: 'US'
  },
  
  // Map styling
  MAP_OPTIONS: {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    gestureHandling: 'cooperative' as const,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  },
  
  // Service area circle styling
  SERVICE_AREA_CIRCLE: {
    strokeColor: '#002147',
    strokeOpacity: 0.6,
    strokeWeight: 2,
    fillColor: '#002147',
    fillOpacity: 0.08,
  },
  
  // Marker configurations
  MARKERS: {
    BUSINESS: {
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#002147" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#fff"/>
          </svg>
        `)}`,
        scaledSize: { width: 32, height: 32 },
        anchor: { x: 16, y: 16 }
      }
    },
    CUSTOMER: {
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#A52A2A" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#fff"/>
          </svg>
        `)}`,
        scaledSize: { width: 32, height: 32 },
        anchor: { x: 16, y: 16 }
      }
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the appropriate API key for the operation type
 */
export function getApiKey(operation: 'client' | 'server' = 'server'): string {
  if (operation === 'server') {
    return GOOGLE_MAPS_SERVER_API_KEY;
  }
  return GOOGLE_MAPS_CLIENT_API_KEY;
}

/**
 * Get clean API key (removes whitespace/newlines)
 */
export function getCleanApiKey(operation: 'client' | 'server' = 'server'): string {
  const key = getApiKey(operation);
  return key.replace(/\s+/g, '');
}

/**
 * Check if Google Maps API is properly configured
 */
export function isGoogleMapsConfigured(): boolean {
  return API_KEY_STATUS.isConfigured;
}

/**
 * Get comprehensive API status
 */
export function getApiStatus() {
  return {
    ...API_KEY_STATUS,
    serverKeyLength: GOOGLE_MAPS_SERVER_API_KEY.length,
    clientKeyLength: GOOGLE_MAPS_CLIENT_API_KEY.length,
    environment: process.env.NODE_ENV || 'unknown'
  };
}

/**
 * Get service configuration for a service type
 */
export function getServiceConfig(serviceType: string) {
  return SERVICE_AREA_CONFIG.SERVICES[serviceType as keyof typeof SERVICE_AREA_CONFIG.SERVICES] || 
         SERVICE_AREA_CONFIG.SERVICES.STANDARD_NOTARY;
}

/**
 * Calculate travel fee based on distance and service type
 */
export function calculateTravelFee(distance: number, serviceType: string): number {
  const serviceConfig = getServiceConfig(serviceType);
  
  if (distance <= serviceConfig.freeRadius) {
    return 0;
  }
  
  const excessDistance = distance - serviceConfig.freeRadius;
  return Math.round(excessDistance * SERVICE_AREA_CONFIG.TRAVEL_FEE_RATE * 100) / 100;
}

/**
 * Check if location is within service area
 */
export function isWithinServiceArea(distance: number, serviceType: string): boolean {
  const serviceConfig = getServiceConfig(serviceType);
  return distance <= serviceConfig.maxRadius;
}

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
  return meters * 0.000621371;
}

/**
 * Convert miles to meters
 */
export function milesToMeters(miles: number): number {
  return miles / 0.000621371;
}

/**
 * Advanced Houston area distance estimation for fallbacks
 * Consolidated from multiple files into single source of truth
 */
export function estimateDistanceFromAddress(address: string): number {
  const lower = address.toLowerCase();
  
  // Texas City area (base location)
  if (lower.includes('77591') || lower.includes('texas city')) return 0;
  
  // Close suburbs (under 10 miles)
  if (lower.includes('league city') || lower.includes('77573')) return 5;
  if (lower.includes('webster') || lower.includes('77598')) return 8;
  if (lower.includes('friendswood') || lower.includes('77546')) return 8;
  if (lower.includes('clear lake') || lower.includes('77058')) return 10;
  
  // Houston metro (10-20 miles)
  if (lower.includes('pasadena') || lower.includes('77506')) return 12;
  if (lower.includes('baytown') || lower.includes('77520')) return 15;
  if (lower.includes('houston downtown') || lower.includes('77002')) return 18;
  if (lower.includes('sugar land') || lower.includes('77478')) return 18;
  if (lower.includes('pearland') || lower.includes('77584')) return 20;
  
  // Extended area (20-30 miles)
  if (lower.includes('katy') || lower.includes('77449')) return 20;
  if (lower.includes('cypress') || lower.includes('77429')) return 22;
  if (lower.includes('tomball') || lower.includes('77375')) return 25;
  if (lower.includes('conroe') || lower.includes('77301')) return 30;
  
  // Outer limits (30+ miles)
  if (lower.includes('galveston') || lower.includes('77550')) return 45;
  
  // Default estimate for unknown Houston area locations
  return 15;
}

/**
 * Get intelligent fallback predictions for address autocomplete
 */
export function getFallbackAddressPredictions(input: string): Array<{
  description: string;
  placeId: string;
  structuredFormatting: { mainText: string; secondaryText: string };
  types: string[];
}> {
  const commonAreas = [
    { main: `${input} Main St`, secondary: 'Houston, TX' },
    { main: `${input} Memorial Dr`, secondary: 'Houston, TX' },
    { main: `${input} Westheimer Rd`, secondary: 'Houston, TX' },
    { main: `${input} FM 1960`, secondary: 'Houston, TX' },
    { main: `${input} Highway 6`, secondary: 'Houston, TX' }
  ];

  return commonAreas.map((area, index) => ({
    description: `${area.main}, ${area.secondary}`,
    placeId: `fallback_${index}`,
    structuredFormatting: {
      mainText: area.main,
      secondaryText: area.secondary
    },
    types: ['street_address']
  }));
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that required configuration is present
 */
export function validateMapsConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!GOOGLE_MAPS_CLIENT_API_KEY && !GOOGLE_MAPS_SERVER_API_KEY) {
    errors.push('No Google Maps API key configured');
  }
  
  if (!SERVICE_AREA_CONFIG.BASE_LOCATION.coordinates.lat) {
    errors.push('Base location coordinates not configured');
  }
  
  if (SERVICE_AREA_CONFIG.TRAVEL_FEE_RATE <= 0) {
    errors.push('Travel fee rate must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Log configuration status on import (development only)
if (process.env.NODE_ENV === 'development') {
  const validation = validateMapsConfig();
  if (!validation.isValid) {
    console.warn('Google Maps configuration issues:', validation.errors);
  } else {
    console.log('✅ Google Maps configuration is valid');
  }
} 