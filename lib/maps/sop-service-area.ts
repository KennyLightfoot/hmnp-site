/**
 * SOP Service Area Validation
 * Validates service availability within defined geographic boundaries
 */

import { getCleanApiKey } from '@/lib/config/maps';

export interface ServiceAreaResult {
  isWithinArea: boolean;
  distance: number;
  serviceType: 'STANDARD' | 'EXTENDED' | 'LOAN_SIGNING' | 'OUTSIDE_AREA';
  travelFee: number;
  message: string;
}

export interface LocationInput {
  zipCode: string;
  address?: string;
  city?: string;
  state?: string;
}

// Base office location (ZIP 77591)
const BASE_OFFICE_ZIP = '77591';
const BASE_OFFICE_COORDS = { lat: 29.5449, lng: -95.0966 }; // Lake Jackson, TX coordinates

// Service area boundaries (in miles)
const SERVICE_AREAS = {
  STANDARD: 15, // Standard service area
  EXTENDED: 20, // Extended service area
  LOAN_SIGNING: 25, // Loan signing service area
} as const;

/**
 * Validate if location is within service area and calculate travel fees
 */
export async function validateServiceArea(location: LocationInput): Promise<ServiceAreaResult> {
  try {
    // Calculate distance from base office
    const distance = await calculateDistance(BASE_OFFICE_COORDS, location);
    
    // Determine service type based on distance
    let serviceType: ServiceAreaResult['serviceType'];
    let travelFee = 0;
    let isWithinArea = false;
    let message = '';

    if (distance <= SERVICE_AREAS.STANDARD) {
      serviceType = 'STANDARD';
      isWithinArea = true;
      travelFee = distance * 0.5; // $0.50 per mile
      message = `Within standard service area (${distance.toFixed(1)} miles)`;
    } else if (distance <= SERVICE_AREAS.EXTENDED) {
      serviceType = 'EXTENDED';
      isWithinArea = true;
      travelFee = distance * 0.5; // $0.50 per mile
      message = `Within extended service area (${distance.toFixed(1)} miles)`;
    } else if (distance <= SERVICE_AREAS.LOAN_SIGNING) {
      serviceType = 'LOAN_SIGNING';
      isWithinArea = true;
      travelFee = distance * 0.5; // $0.50 per mile
      message = `Available for loan signing services only (${distance.toFixed(1)} miles)`;
    } else {
      serviceType = 'OUTSIDE_AREA';
      isWithinArea = false;
      travelFee = 0;
      message = `Outside service area (${distance.toFixed(1)} miles). Contact for special arrangements.`;
    }

    return {
      isWithinArea,
      distance,
      serviceType,
      travelFee: Math.round(travelFee * 100) / 100, // Round to cents
      message
    };

  } catch (error) {
    console.error('Service area validation failed:', error);
    return {
      isWithinArea: false,
      distance: 0,
      serviceType: 'OUTSIDE_AREA',
      travelFee: 0,
      message: 'Unable to validate service area. Please contact us directly.'
    };
  }
}

/**
 * Calculate distance between two points using Google Maps API or fallback calculation
 */
async function calculateDistance(
  baseCoords: { lat: number; lng: number },
  location: LocationInput
): Promise<number> {
  try {
    // Try Google Maps Distance Matrix API first
    const cleanedApiKey = getCleanApiKey('server');
    if (cleanedApiKey) {
      return await calculateDistanceWithGoogleMaps(baseCoords, location);
    }
    
    // Fallback to ZIP code distance calculation
    return await calculateDistanceByZipCode(location.zipCode);
    
  } catch (error) {
    console.error('Distance calculation failed:', error);
    // Return estimated distance for common ZIP codes as fallback
    return getEstimatedDistanceByZip(location.zipCode);
  }
}

/**
 * Calculate distance using Google Maps Distance Matrix API
 */
async function calculateDistanceWithGoogleMaps(
  baseCoords: { lat: number; lng: number },
  location: LocationInput
): Promise<number> {
  const origin = `${baseCoords.lat},${baseCoords.lng}`;
  const destination = location.address 
    ? `${location.address}, ${location.city}, ${location.state} ${location.zipCode}`
    : location.zipCode;

  const apiKey = getCleanApiKey('server');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=imperial&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
    const distanceText = data.rows[0].elements[0].distance.text;
    const distanceValue = parseFloat(distanceText.replace(/[^\d.]/g, ''));
    return distanceValue;
  }

  throw new Error('Google Maps API returned invalid response');
}

/**
 * Calculate distance by ZIP code using ZIP code database
 */
async function calculateDistanceByZipCode(zipCode: string): Promise<number> {
  // This would typically use a ZIP code distance calculation service
  // For now, return estimated distance based on known ZIP codes
  return getEstimatedDistanceByZip(zipCode);
}

/**
 * Get estimated distance for common ZIP codes (fallback method)
 */
function getEstimatedDistanceByZip(zipCode: string): number {
  const zipDistances: Record<string, number> = {
    // Houston area ZIP codes (approximate distances from 77591)
    '77001': 25, '77002': 25, '77003': 23, '77004': 22, '77005': 20,
    '77006': 21, '77007': 24, '77008': 26, '77009': 27, '77010': 25,
    
    // Brazoria County (close to base)
    '77515': 8,   // Angleton
    '77541': 12,  // Freeport
    '77566': 5,   // Lake Jackson
    '77578': 15,  // Pearland (south)
    
    // Galveston County
    '77550': 18,  // Galveston
    '77554': 16,  // Galveston
    '77573': 22,  // League City
    '77598': 20,  // Webster
    
    // Harris County (Houston metro)
    '77034': 18,  // South Houston
    '77047': 20,  // South Houston
    '77059': 22,  // NASA/Clear Lake
    '77062': 24,  // NASA/Clear Lake
    '77089': 19,  // South Houston
    '77521': 15,  // Baytown
    '77546': 25,  // Friendswood
    '77581': 18,  // Pearland
    '77584': 20,  // Pearland
    
    // Fort Bend County
    '77469': 30,  // Richmond
    '77479': 35,  // Sugar Land
    '77489': 32,  // Missouri City
  };

  return zipDistances[zipCode] || 50; // Default to outside area if unknown
}

/**
 * Get service area boundaries for display
 */
export function getServiceAreaBoundaries() {
  return {
    baseOffice: {
      zipCode: BASE_OFFICE_ZIP,
      coordinates: BASE_OFFICE_COORDS
    },
    serviceAreas: SERVICE_AREAS,
    travelFeeRate: 0.5 // $0.50 per mile
  };
}

/**
 * Check if service type is available for location
 */
export function isServiceAvailable(serviceType: string, locationServiceType: ServiceAreaResult['serviceType']): boolean {
  // Standard notary services available in all service areas
  if (serviceType === 'NOTARY_STANDARD') {
    return locationServiceType !== 'OUTSIDE_AREA';
  }
  
  // Loan signing services available in extended area
  if (serviceType === 'LOAN_SIGNING') {
    return locationServiceType === 'STANDARD' || 
           locationServiceType === 'EXTENDED' || 
           locationServiceType === 'LOAN_SIGNING';
  }
  
  // Mobile services available in standard and extended areas
  if (serviceType === 'MOBILE_NOTARY') {
    return locationServiceType === 'STANDARD' || locationServiceType === 'EXTENDED';
  }
  
  // Online services available everywhere
  if (serviceType === 'REMOTE_ONLINE_NOTARIZATION') {
    return true;
  }
  
  return false;
}