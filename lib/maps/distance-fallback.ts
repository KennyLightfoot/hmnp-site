/**
 * Distance Calculation with Multiple Fallbacks
 * Houston Mobile Notary Pros
 * 
 * Implements robust distance calculation with multiple fallback methods
 * to ensure the booking system never fails due to API issues.
 */

import { logger } from '@/lib/logger';

export interface DistanceResult {
  distance: number;
  duration: number;
  source: 'google_maps' | 'openstreetmap' | 'zip_estimation' | 'fallback';
}

/**
 * Calculate distance with multiple fallbacks
 */
export async function calculateDistanceWithFallbacks(
  origin: string, 
  destination: string
): Promise<DistanceResult> {
  const requestId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Try Google Maps API first
    const googleResult = await calculateDistanceGoogleMaps(origin, destination);
    if (googleResult.distance > 0) {
      logger.info('Distance calculated via Google Maps', {
        requestId,
        distance: googleResult.distance,
        duration: googleResult.duration
      });
      return { ...googleResult, source: 'google_maps' };
    }
  } catch (error) {
    logger.warn('Google Maps distance calculation failed', { 
      requestId,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  try {
    // Fallback to OpenStreetMap/Nominatim
    const osmResult = await calculateDistanceOpenStreetMap(origin, destination);
    if (osmResult.distance > 0) {
      logger.info('Distance calculated via OpenStreetMap', {
        requestId,
        distance: osmResult.distance,
        duration: osmResult.duration
      });
      return { ...osmResult, source: 'openstreetmap' };
    }
  } catch (error) {
    logger.warn('OpenStreetMap distance calculation failed', { 
      requestId,
      error: error instanceof Error ? error.message : String(error)
    });
  }
  
  // Final fallback: estimate based on ZIP codes
  const estimatedDistance = estimateDistanceByZipCodes(origin, destination);
  
  logger.info('Using estimated distance calculation', { 
    requestId,
    origin, 
    destination, 
    estimatedDistance 
  });
  
  return {
    distance: estimatedDistance,
    duration: estimatedDistance * 2, // Rough estimate: 2 minutes per mile
    source: 'zip_estimation'
  };
}

/**
 * Google Maps distance calculation
 */
async function calculateDistanceGoogleMaps(
  origin: string, 
  destination: string
): Promise<{ distance: number; duration: number }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.set('origins', origin);
  url.searchParams.set('destinations', destination);
  url.searchParams.set('units', 'imperial');
  url.searchParams.set('mode', 'driving');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Google Maps API HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
    throw new Error(`Google Maps API status: ${data.status}`);
  }

  const element = data.rows[0].elements[0];
  if (element.status !== 'OK') {
    throw new Error(`Distance calculation failed: ${element.status}`);
  }

  const distanceMiles = element.distance.value * 0.000621371; // meters to miles
  const durationMinutes = Math.round(element.duration.value / 60); // seconds to minutes

  return {
    distance: Math.round(distanceMiles * 100) / 100, // Round to 2 decimal places
    duration: durationMinutes
  };
}

/**
 * OpenStreetMap distance calculation (free alternative)
 */
async function calculateDistanceOpenStreetMap(
  origin: string, 
  destination: string
): Promise<{ distance: number; duration: number }> {
  // First, geocode the addresses
  const [originCoords, destCoords] = await Promise.all([
    geocodeAddress(origin),
    geocodeAddress(destination)
  ]);

  // Calculate straight-line distance and estimate driving distance
  const straightDistance = calculateHaversineDistance(
    originCoords.lat, originCoords.lon,
    destCoords.lat, destCoords.lon
  );
  
  // Estimate driving distance (typically 1.3x straight-line distance in urban areas)
  const drivingDistance = straightDistance * 1.3;
  const duration = Math.round(drivingDistance * 2); // ~2 minutes per mile

  return {
    distance: Math.round(drivingDistance * 100) / 100,
    duration
  };
}

/**
 * Geocode address using Nominatim (OpenStreetMap)
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number }> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', address);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'us');

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'HoustonMobileNotaryPros/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim API HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    throw new Error('Address not found');
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateHaversineDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate distance based on ZIP codes (final fallback)
 */
function estimateDistanceByZipCodes(origin: string, destination: string): number {
  // Extract ZIP codes
  const originZip = origin.match(/\d{5}/)?.[0];
  const destZip = destination.match(/\d{5}/)?.[0];
  
  if (!originZip || !destZip) {
    return 20; // Default fallback distance
  }
  
  // Houston area ZIP code distance estimation
  // This is a simplified approach - in production, you'd want a more sophisticated lookup
  const zipDistanceMap: Record<string, number> = {
    '77591': 0, // Base location (Texas City)
    '77001': 25, // Downtown Houston
    '77002': 24,
    '77003': 23,
    '77004': 22,
    '77005': 21, // Rice University area
    '77006': 20, // Museum District
    '77007': 19,
    '77008': 18,
    '77009': 17,
    '77010': 16, // Medical Center
    '77011': 15,
    '77012': 14,
    '77013': 13,
    '77014': 12,
    '77015': 11,
    '77016': 10,
    '77017': 9,
    '77018': 8,
    '77019': 7, // River Oaks
    '77020': 6,
    '77021': 5,
    '77022': 4,
    '77023': 3,
    '77024': 2, // Memorial area
    '77025': 1,
    // Katy area
    '77449': 35,
    '77450': 36,
    '77494': 37,
    // Sugar Land area
    '77478': 30,
    '77479': 31,
    '77498': 32,
    // Pearland area
    '77581': 15,
    '77584': 16,
    '77588': 17,
    // Pasadena area
    '77502': 10,
    '77503': 11,
    '77504': 12,
    // League City area
    '77573': 8,
    '77574': 9,
    // Friendswood area
    '77546': 12,
    // Webster area
    '77598': 14,
    // Clear Lake area
    '77058': 18,
    '77062': 20
  };
  
  const originDistance = zipDistanceMap[originZip] || 20;
  const destDistance = zipDistanceMap[destZip] || 20;
  
  // Calculate distance between ZIP codes
  const estimatedDistance = Math.abs(destDistance - originDistance);
  
  // Ensure minimum distance for different ZIP codes
  return estimatedDistance === 0 && originZip !== destZip ? 5 : estimatedDistance;
}

/**
 * Legacy function for backward compatibility
 */
export async function calculateDistance(
  origin: string, 
  destination: string
): Promise<{ distance: number; duration: number; route: string }> {
  const result = await calculateDistanceWithFallbacks(origin, destination);
  return {
    distance: result.distance,
    duration: result.duration,
    route: result.source
  };
}