/**
 * Unified Distance Service
 * Houston Mobile Notary Pros - Single Source of Truth for Distance Operations
 * 
 * This service consolidates all distance calculation functionality and replaces
 * the multiple competing implementations throughout the codebase.
 */

import { 
  getCleanApiKey,
  getApiStatus,
  SERVICE_AREA_CONFIG, 
  GOOGLE_MAPS_CONFIG,
  calculateTravelFee,
  isWithinServiceArea,
  metersToMiles,
  getServiceConfig,
  estimateDistanceFromAddress,
  getFallbackAddressPredictions
} from '@/lib/config/maps';

import { calculateDistanceWithCache, CachedDistanceResult } from './distance';
import { getErrorMessage } from '@/lib/utils/error-utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DistanceResult {
  success: boolean;
  distance: {
    miles: number;
    kilometers: number;
    text: string;
  };
  duration: {
    minutes: number;
    seconds: number;
    text: string;
  };
  travelFee: number;
  isWithinServiceArea: boolean;
  serviceArea: {
    isWithinStandardArea: boolean;
    isWithinExtendedArea: boolean;
    isWithinMaxArea: boolean;
    applicableRadius: number;
  };
  warnings: string[];
  recommendations: string[];
  metadata: {
    calculatedAt: string;
    apiSource: 'google_maps' | 'fallback';
    requestId: string;
    serviceType: string;
    cacheHit?: boolean;
  };
}

export interface PlacePrediction {
  description: string;
  placeId: string;
  structuredFormatting: {
    mainText: string;
    secondaryText: string;
  };
  types: string[];
}

export interface GeofenceResult {
  isAllowed: boolean;
  distance: number;
  travelFee?: number;
  warnings: string[];
  recommendations: string[];
  blockingReasons: string[];
}

// ============================================================================
// UNIFIED DISTANCE SERVICE
// ============================================================================

export class UnifiedDistanceService {
  /**
   * Calculate distance and travel information from base location to destination
   * Now uses Redis caching for improved performance and persistence
   */
  static async calculateDistance(
    destination: string,
    serviceType: string = 'STANDARD_NOTARY'
  ): Promise<DistanceResult> {
    const requestId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Use Redis-cached distance calculation
      const cachedResult = await calculateDistanceWithCache(destination, {
        serviceType,
        forceFresh: false
      });
      
      // Convert CachedDistanceResult to DistanceResult format
      const result: DistanceResult = this.convertCachedToDistanceResult(
        cachedResult,
        requestId,
        serviceType
      );

      const duration = Date.now() - startTime;
      console.log(`Distance calculation completed in ${duration}ms`, {
        requestId,
        distance: result.distance.miles,
        travelFee: result.travelFee,
        apiSource: result.metadata.apiSource,
        cacheHit: result.metadata.cacheHit
      });

      return result;

    } catch (error) {
      console.error('Distance calculation failed:', error);
      
      // Try fallback calculation if Redis cache fails
      try {
        const fallbackResult = this.calculateWithFallback(destination, serviceType, requestId);
        return fallbackResult;
      } catch (fallbackError) {
        console.error('Fallback calculation also failed:', fallbackError);
      }
      
      return {
        success: false,
        distance: { miles: 0, kilometers: 0, text: 'Unknown' },
        duration: { minutes: 0, seconds: 0, text: 'Unknown' },
        travelFee: 0,
        isWithinServiceArea: false,
        serviceArea: {
          isWithinStandardArea: false,
          isWithinExtendedArea: false,
          isWithinMaxArea: false,
          applicableRadius: 0
        },
        warnings: ['Distance calculation failed'],
        recommendations: ['Please try again or contact support'],
        metadata: {
          calculatedAt: new Date().toISOString(),
          apiSource: 'fallback',
          requestId,
          serviceType,
          cacheHit: false
        }
      };
    }
  }

  /**
   * Get address predictions using server-side proxy (CORS Fix)
   */
  static async getPlacePredictions(
    input: string,
    sessionToken?: string
  ): Promise<PlacePrediction[]> {
    if (!input || input.length < 3) {
      return [];
    }

    const requestId = `predictions_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Use server-side proxy to avoid CORS issues
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const url = new URL('/api/places-autocomplete', baseUrl);
      url.searchParams.set('input', input);
      
      if (sessionToken) {
        url.searchParams.set('sessiontoken', sessionToken);
      }

      console.log('Fetching address predictions via proxy', { 
        input: input.substring(0, 20) + '...', 
        requestId,
        timestamp: new Date().toISOString(),
        proxyUrl: url.pathname
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Places proxy HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle server-side error responses
      if (data.error) {
        console.warn('Places proxy returned error', { 
          error: data.error, 
          fallback: data.fallback,
          requestId 
        });
        
        if (data.fallback) {
          return this.getFallbackPredictions(input);
        }
        
        throw new Error(data.error);
      }

      // Enhanced status validation
      if (!data) {
        throw new Error('Empty response from places proxy');
      }

      if (data.status === 'ZERO_RESULTS') {
        console.warn('No predictions found for input', { input, requestId });
        return this.getFallbackPredictions(input);
      }

      if (data.status !== 'OK') {
        const errorDetails = {
          status: data.status,
          input: input.substring(0, 20) + '...',
          requestId
        };
        console.error('Places proxy API error:', errorDetails);
        return this.getFallbackPredictions(input);
      }

      // Validate predictions array
      if (!data.predictions || !Array.isArray(data.predictions)) {
        console.warn('Invalid predictions array in proxy response', { requestId });
        return this.getFallbackPredictions(input);
      }

      const predictions = data.predictions.map((prediction: any, index: number) => {
        try {
          // Validate each prediction
          if (!prediction) {
            console.warn('Null prediction in response', { index, requestId });
            return null;
          }

          return {
            description: prediction.description || '',
            placeId: prediction.place_id || `fallback_${index}`,
            structuredFormatting: {
              mainText: prediction.structured_formatting?.main_text || prediction.description || '',
              secondaryText: prediction.structured_formatting?.secondary_text || ''
            },
            types: Array.isArray(prediction.types) ? prediction.types : []
          };
        } catch (parseError) {
          console.warn('Failed to parse individual prediction', { 
            prediction, 
            index, 
            error: parseError,
            requestId 
          });
          return null;
        }
      }).filter(Boolean) as PlacePrediction[];

      const duration = Date.now() - startTime;
      console.log('Address predictions fetched successfully via proxy', {
        input: input.substring(0, 20) + '...',
        resultCount: predictions.length,
        duration: `${duration}ms`,
        requestId
      });

      return predictions;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorDetails = {
        input: input.substring(0, 20) + '...',
        errorMessage: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        duration: `${duration}ms`,
        requestId,
        timestamp: new Date().toISOString()
      };

      console.error('CRITICAL: Places proxy request failure', errorDetails);
      
      // Return enhanced fallback predictions
      return this.getFallbackPredictions(input);
    }
  }

  /**
   * Perform comprehensive geofencing check
   */
  static async performGeofenceCheck(
    destination: string,
    serviceType: string = 'STANDARD_NOTARY'
  ): Promise<GeofenceResult> {
    const distanceResult = await this.calculateDistance(destination, serviceType);
    
    const serviceConfig = getServiceConfig(serviceType);
    const distance = distanceResult.distance.miles;
    
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const blockingReasons: string[] = [];

    // Service area validation
    const isAllowed = isWithinServiceArea(distance, serviceType);
    
    if (!isAllowed) {
      blockingReasons.push(`Location is ${distance.toFixed(1)} miles away, beyond our ${serviceConfig.maxRadius}-mile service area.`);
      recommendations.push('Consider contacting us directly to discuss special arrangements.');
    } else if (distanceResult.travelFee > 0) {
      warnings.push(`Travel fee of $${distanceResult.travelFee.toFixed(2)} applies for distances beyond ${serviceConfig.freeRadius} miles.`);
    }

    // Duration-based recommendations
    if (distanceResult.duration.minutes > 60) {
      recommendations.push('Due to travel time, advance booking is recommended for better availability.');
    }

    // Area-specific recommendations
    const lowerDestination = destination.toLowerCase();
    if (lowerDestination.includes('katy') || lowerDestination.includes('sugar land') || lowerDestination.includes('pearland')) {
      recommendations.push('Popular service area - excellent availability.');
    } else if (lowerDestination.includes('conroe') || lowerDestination.includes('tomball')) {
      recommendations.push('Outer service area - advance booking highly recommended.');
    }

    return {
      isAllowed,
      distance,
      warnings,
      recommendations,
      blockingReasons
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Calculate distance using Google Maps Distance Matrix API
   */
  private static async calculateWithGoogleMaps(
    destination: string,
    serviceType: string,
    requestId: string
  ): Promise<DistanceResult> {
    const url = new URL(GOOGLE_MAPS_CONFIG.ENDPOINTS.DISTANCE_MATRIX);
    url.searchParams.set('origins', SERVICE_AREA_CONFIG.BASE_LOCATION.address);
    url.searchParams.set('destinations', destination);
    url.searchParams.set('units', 'imperial');
    url.searchParams.set('mode', 'driving');
    url.searchParams.set('avoid', 'tolls');
    url.searchParams.set('key', getCleanApiKey('server'));

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
      throw new Error(`Distance calculation status: ${element.status}`);
    }

    const distanceMiles = metersToMiles(element.distance.value);
    const durationSeconds = element.duration.value;
    const durationMinutes = Math.round(durationSeconds / 60);

    return this.buildResult({
      distanceMiles,
      durationSeconds,
      durationMinutes,
      distanceText: element.distance.text,
      durationText: element.duration.text,
      serviceType,
      requestId,
      apiSource: 'google_maps'
    });
  }

  /**
   * Calculate distance using fallback estimation
   */
  private static calculateWithFallback(
    destination: string,
    serviceType: string,
    requestId: string
  ): DistanceResult {
    const estimatedMiles = estimateDistanceFromAddress(destination);
    const estimatedMinutes = Math.round(estimatedMiles * 1.5); // ~1.5 minutes per mile

    return this.buildResult({
      distanceMiles: estimatedMiles,
      durationSeconds: estimatedMinutes * 60,
      durationMinutes: estimatedMinutes,
      distanceText: `~${estimatedMiles} mi (estimated)`,
      durationText: `~${estimatedMinutes} mins (estimated)`,
      serviceType,
      requestId,
      apiSource: 'fallback'
    });
  }

  /**
   * Build standardized result object
   */
  private static buildResult(params: {
    distanceMiles: number;
    durationSeconds: number;
    durationMinutes: number;
    distanceText: string;
    durationText: string;
    serviceType: string;
    requestId: string;
    apiSource: 'google_maps' | 'fallback';
  }): DistanceResult {
    const { distanceMiles, durationSeconds, durationMinutes, distanceText, durationText, serviceType, requestId, apiSource } = params;
    
    const serviceConfig = getServiceConfig(serviceType);
    const travelFee = calculateTravelFee(distanceMiles, serviceType);
    const withinServiceArea = isWithinServiceArea(distanceMiles, serviceType);
    
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Generate warnings and recommendations
    if (apiSource === 'fallback') {
      warnings.push('Distance estimated using local data - exact calculation will be confirmed during booking');
    }

    if (!withinServiceArea) {
      warnings.push(`Location exceeds ${serviceConfig.name} service radius of ${serviceConfig.maxRadius} miles`);
    } else if (travelFee > 0) {
      warnings.push(`Travel fee of $${travelFee.toFixed(2)} applies for distances beyond ${serviceConfig.freeRadius} miles`);
    }

    if (durationMinutes > 45) {
      recommendations.push('Advance booking recommended due to travel time');
    }

    return {
      success: true,
      distance: {
        miles: Math.round(distanceMiles * 10) / 10,
        kilometers: Math.round(distanceMiles * 1.60934 * 10) / 10,
        text: distanceText
      },
      duration: {
        minutes: durationMinutes,
        seconds: durationSeconds,
        text: durationText
      },
      travelFee,
      isWithinServiceArea: withinServiceArea,
      serviceArea: {
        isWithinStandardArea: distanceMiles <= SERVICE_AREA_CONFIG.RADII.STANDARD,
        isWithinExtendedArea: distanceMiles <= SERVICE_AREA_CONFIG.RADII.EXTENDED,
        isWithinMaxArea: distanceMiles <= SERVICE_AREA_CONFIG.RADII.MAXIMUM,
        applicableRadius: serviceConfig.maxRadius
      },
      warnings,
      recommendations,
      metadata: {
        calculatedAt: new Date().toISOString(),
        apiSource,
        requestId,
        serviceType
      }
    };
  }

  /**
   * Convert CachedDistanceResult to DistanceResult format
   */
  private static convertCachedToDistanceResult(
    cachedResult: CachedDistanceResult,
    requestId: string,
    serviceType: string
  ): DistanceResult {
    const miles = cachedResult.distance.miles;
    const serviceConfig = getServiceConfig(serviceType);
    
    return {
      success: true,
      distance: cachedResult.distance,
      duration: cachedResult.duration,
      travelFee: cachedResult.travelFee,
      isWithinServiceArea: cachedResult.isWithinServiceArea,
      serviceArea: {
        isWithinStandardArea: miles <= SERVICE_AREA_CONFIG.RADII.STANDARD,
        isWithinExtendedArea: miles <= SERVICE_AREA_CONFIG.RADII.EXTENDED,
        isWithinMaxArea: miles <= SERVICE_AREA_CONFIG.RADII.MAXIMUM,
        applicableRadius: serviceConfig.maxRadius
      },
      warnings: this.generateWarnings(miles, serviceType),
      recommendations: this.generateRecommendations(miles, serviceType),
      metadata: {
        calculatedAt: cachedResult.calculatedAt,
        apiSource: cachedResult.source === 'cache' ? 'google_maps' : cachedResult.source,
        requestId,
        serviceType,
        cacheHit: cachedResult.cacheHit
      }
    };
  }

  /**
   * Generate warnings based on distance and service type
   */
  private static generateWarnings(miles: number, serviceType: string): string[] {
    const warnings: string[] = [];
    const serviceConfig = getServiceConfig(serviceType);
    
    if (miles > serviceConfig.maxRadius) {
      warnings.push(`Distance ${miles} miles exceeds service area limit of ${serviceConfig.maxRadius} miles`);
    }
    
    if (miles > SERVICE_AREA_CONFIG.RADII.FREE) {
      const travelFee = calculateTravelFee(miles, serviceType);
      warnings.push(`Travel fee of $${travelFee.toFixed(2)} applies for distances over ${SERVICE_AREA_CONFIG.RADII.FREE} miles`);
    }
    
    return warnings;
  }

  /**
   * Generate recommendations based on distance and service type
   */
  private static generateRecommendations(miles: number, serviceType: string): string[] {
    const recommendations: string[] = [];
    
    if (miles > 30) {
      recommendations.push('Consider scheduling during extended hours to allow for travel time');
    }
    
    if (miles > SERVICE_AREA_CONFIG.RADII.STANDARD && serviceType === 'STANDARD_NOTARY') {
      recommendations.push('Extended Hours service may be more suitable for this distance');
    }
    
    return recommendations;
  }

  // Note: estimateDistanceFromAddress moved to central config

  /**
   * Get fallback address predictions (uses centralized function)
   */
  private static getFallbackPredictions(input: string): PlacePrediction[] {
    return getFallbackAddressPredictions(input);
  }

  /**
   * Safety fallback when all other methods fail
   */
  private static getSafetyFallback(
    destination: string,
    serviceType: string,
    requestId: string
  ): DistanceResult {
    return this.buildResult({
      distanceMiles: 25, // Safe default
      durationSeconds: 3000, // 50 minutes
      durationMinutes: 50,
      distanceText: '~25 mi (estimated)',
      durationText: '~50 mins (estimated)',
      serviceType,
      requestId,
      apiSource: 'fallback'
    });
  }

  /** Normalize various legacy service type strings to current ones */
  private static normalizeServiceType(serviceType: string): string {
    const map: Record<string, string> = {
      EXTENDED_HOURS_NOTARY: 'EXTENDED_HOURS',
      LOAN_SIGNING_SPECIALIST: 'LOAN_SIGNING'
    };
    return map[serviceType] ?? serviceType;
  }

  // Radius overrides removed – universal 30-mile free radius now applies to all

  // ============================================================================
  // CACHE MANAGEMENT (Redis-based)
  // ============================================================================

  /**
   * Clear all cached results (Redis-based)
   */
  static async clearCache(): Promise<void> {
    const { clearDistanceCache } = await import('./distance');
    await clearDistanceCache();
  }

  static getServiceAreaConfig(serviceType: string) {
    const normalized = this.normalizeServiceType(serviceType);
    const cfg = getServiceConfig(normalized);

    const exists = !!SERVICE_AREA_CONFIG.SERVICES[normalized as keyof typeof SERVICE_AREA_CONFIG.SERVICES];

    return {
      serviceType: exists ? normalized : 'STANDARD_NOTARY',
      freeRadius: cfg.freeRadius,
      maxRadius: cfg.maxRadius
    } as const;
  }

  /**
   * Wrapper for legacy tests – calculates travel fee using shared utility
   */
  static calculateTravelFee(distanceMiles: number, serviceType: string = 'STANDARD_NOTARY') {
    if (distanceMiles <= 0) return 0;

    const normalized = this.normalizeServiceType(serviceType);
    return calculateTravelFee(distanceMiles, normalized);
  }

  /**
   * Legacy geofence validator expected by unit-tests.
   * Returns whether a booking is allowed based on distance & serviceType.
   */
  static validateGeofence(distanceMiles: number, serviceType: string = 'STANDARD_NOTARY'): GeofenceResult {
    const normalized = this.normalizeServiceType(serviceType);
    const serviceConfig = getServiceConfig(normalized);
    const isWithin = distanceMiles <= serviceConfig.maxRadius;
    const requiresTravelFee = distanceMiles > serviceConfig.freeRadius && isWithin;
    const travelFee = requiresTravelFee ? this.calculateTravelFee(distanceMiles, normalized) : 0;

    const warnings: string[] = [];
    const recommendations: string[] = [];
    const blockingReasons: string[] = [];

    if (requiresTravelFee) {
      warnings.push('Travel fee applies');
    }

    if (!isWithin) {
      blockingReasons.push('Distance exceeds maximum service area');
      recommendations.push('Consider Remote Online Notarization');
    }

    return {
      isAllowed: isWithin,
      distance: distanceMiles,
      travelFee,
      warnings,
      recommendations,
      blockingReasons
    };
  }
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy function for backward compatibility
 */
export async function calculateDistance(
  origin: string = SERVICE_AREA_CONFIG.BASE_LOCATION.address,
  destination: string
): Promise<{ distance: number; duration: number; success: boolean }> {
  try {
    const result = await UnifiedDistanceService.calculateDistance(destination);
    return {
      distance: result.distance.miles,
      duration: result.duration.minutes,
      success: result.success
    };
  } catch (error) {
    return {
      distance: 15, // Safe fallback
      duration: 25,
      success: false
    };
  }
} 