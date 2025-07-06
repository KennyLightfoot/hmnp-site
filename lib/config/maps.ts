/**
 * Google Maps API Configuration
 * Houston Mobile Notary Pros - Unified Maps Configuration
 * 
 * This file consolidates all Google Maps API configuration to resolve
 * the inconsistent API key usage across the application.
 */

// ============================================================================
// API KEY CONFIGURATION
// ============================================================================

/**
 * Primary API key for client-side operations
 * Used for: Google Maps JavaScript API, Places API (client-side)
 */
export const GOOGLE_MAPS_CLIENT_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

/**
 * Server-side API key for backend operations
 * Used for: Distance Matrix API, Geocoding API (server-side)
 */
export const GOOGLE_MAPS_SERVER_API_KEY = process.env.GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_CLIENT_API_KEY;

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
  
  // Service radii (in miles)
  RADII: {
    STANDARD: 15,     // Standard notary services
    EXTENDED: 20,     // Extended hours services
    MAXIMUM: 50,      // Absolute maximum service area
    FREE: 20          // No travel fee within this radius
  },
  
  // Pricing
  TRAVEL_FEE_RATE: 0.50, // $0.50 per mile beyond free radius
  
  // Service type configurations
  SERVICES: {
    STANDARD_NOTARY: { 
      freeRadius: 15, 
      maxRadius: 50,
      name: 'Standard Notary'
    },
    EXTENDED_HOURS: { 
      freeRadius: 20, 
      maxRadius: 50,
      name: 'Extended Hours'
    },
    LOAN_SIGNING: { 
      freeRadius: 20, 
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
export function getApiKey(operation: 'client' | 'server' = 'client'): string {
  if (operation === 'server') {
    return GOOGLE_MAPS_SERVER_API_KEY;
  }
  return GOOGLE_MAPS_CLIENT_API_KEY;
}

/**
 * Check if Google Maps API is properly configured
 */
export function isGoogleMapsConfigured(): boolean {
  return !!(GOOGLE_MAPS_CLIENT_API_KEY || GOOGLE_MAPS_SERVER_API_KEY);
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