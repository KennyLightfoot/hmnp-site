/**
 * Unified Distance Service
 * Houston Mobile Notary Pros - Single Source of Truth for Distance Operations
 * 
 * This service consolidates all distance calculation functionality and replaces
 * the multiple competing implementations throughout the codebase.
 */

import { 
  getApiKey, 
  SERVICE_AREA_CONFIG, 
  GOOGLE_MAPS_CONFIG,
  calculateTravelFee,
  isWithinServiceArea,
  metersToMiles,
  getServiceConfig
} from '@/lib/config/maps';

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
  warnings: string[];
  recommendations: string[];
  blockingReasons: string[];
}

// ============================================================================
// UNIFIED DISTANCE SERVICE
// ============================================================================

export class UnifiedDistanceService {
  private static readonly requestCache = new Map<string, DistanceResult>();
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Calculate distance and travel information from base location to destination
   */
  static async calculateDistance(
    destination: string,
    serviceType: string = 'STANDARD_NOTARY'
  ): Promise<DistanceResult> {
    const requestId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = `${destination}:${serviceType}`;
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      let result: DistanceResult;

      // Try Google Maps API first
      if (getApiKey('server')) {
        try {
          result = await this.calculateWithGoogleMaps(destination, serviceType, requestId);
        } catch (error) {
          console.warn('Google Maps API failed, using fallback:', error);
          result = this.calculateWithFallback(destination, serviceType, requestId);
        }
      } else {
        console.warn('Google Maps API key not configured, using fallback');
        result = this.calculateWithFallback(destination, serviceType, requestId);
      }

      // Cache the result
      this.setCachedResult(cacheKey, result);

      const duration = Date.now() - startTime;
      console.log(`Distance calculation completed in ${duration}ms`, {
        requestId,
        distance: result.distance.miles,
        travelFee: result.travelFee,
        apiSource: result.metadata.apiSource
      });

      return result;

    } catch (error) {
      console.error('Distance calculation failed:', error);
      return this.getSafetyFallback(destination, serviceType, requestId);
    }
  }

  /**
   * Get address predictions using Google Places Autocomplete with enhanced error handling
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
      const apiKey = getApiKey('server');
      if (!apiKey) {
        console.warn('Google Maps API key not available, using fallback predictions', { requestId });
        return this.getFallbackPredictions(input);
      }

      const url = new URL(GOOGLE_MAPS_CONFIG.ENDPOINTS.PLACES_AUTOCOMPLETE);
      url.searchParams.set('input', input);
      url.searchParams.set('key', apiKey);
      url.searchParams.set('components', `country:${GOOGLE_MAPS_CONFIG.RESTRICTIONS.country}`);
      url.searchParams.set('types', 'address');
      url.searchParams.set('region', GOOGLE_MAPS_CONFIG.RESTRICTIONS.region);
      
      if (sessionToken) {
        url.searchParams.set('sessiontoken', sessionToken);
      }

      console.log('Fetching address predictions', { 
        input: input.substring(0, 20) + '...', 
        requestId,
        timestamp: new Date().toISOString()
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Houston Mobile Notary Pros Booking System'
        }
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Places API HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Enhanced status validation
      if (!data) {
        throw new Error('Empty response from Places API');
      }

      if (data.status === 'ZERO_RESULTS') {
        console.warn('No predictions found for input', { input, requestId });
        return this.getFallbackPredictions(input);
      }

      if (data.status !== 'OK') {
        const errorDetails = {
          status: data.status,
          errorMessage: data.error_message || 'Unknown error',
          input: input.substring(0, 20) + '...',
          requestId
        };
        console.error('Places API error:', errorDetails);
        throw new Error(`Places API status: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      // Validate predictions array
      if (!data.predictions || !Array.isArray(data.predictions)) {
        throw new Error('Invalid predictions array in response');
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
      console.log('Address predictions fetched successfully', {
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
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        duration: `${duration}ms`,
        requestId,
        timestamp: new Date().toISOString()
      };

      console.error('CRITICAL: Places API prediction failure', errorDetails);
      
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
    url.searchParams.set('key', getApiKey('server'));

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
    const estimatedMiles = this.estimateDistanceFromAddress(destination);
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
   * Estimate distance using local Houston area knowledge
   */
  private static estimateDistanceFromAddress(address: string): number {
    const lower = address.toLowerCase();
    
    // Houston Metro area estimates from ZIP 77591 (Texas City)
    if (lower.includes('77591') || lower.includes('texas city')) return 0;
    if (lower.includes('league city') || lower.includes('77573')) return 5;
    if (lower.includes('webster') || lower.includes('77598')) return 8;
    if (lower.includes('friendswood') || lower.includes('77546')) return 8;
    if (lower.includes('clear lake') || lower.includes('77058')) return 10;
    if (lower.includes('pasadena') || lower.includes('77506')) return 12;
    if (lower.includes('baytown') || lower.includes('77520')) return 15;
    if (lower.includes('houston downtown') || lower.includes('77002')) return 18;
    if (lower.includes('sugar land') || lower.includes('77478')) return 18;
    if (lower.includes('pearland') || lower.includes('77584')) return 20;
    if (lower.includes('katy') || lower.includes('77449')) return 20;
    if (lower.includes('cypress') || lower.includes('77429')) return 22;
    if (lower.includes('tomball') || lower.includes('77375')) return 25;
    if (lower.includes('conroe') || lower.includes('77301')) return 30;
    if (lower.includes('galveston') || lower.includes('77550')) return 45;
    
    // Default estimate for unknown Houston area locations
    return 15;
  }

  /**
   * Get fallback address predictions
   */
  private static getFallbackPredictions(input: string): PlacePrediction[] {
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

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private static getCachedResult(key: string): DistanceResult | null {
    const cached = this.requestCache.get(key);
    if (cached) {
      const age = Date.now() - new Date(cached.metadata.calculatedAt).getTime();
      if (age < this.CACHE_DURATION) {
        return cached;
      } else {
        this.requestCache.delete(key);
      }
    }
    return null;
  }

  private static setCachedResult(key: string, result: DistanceResult): void {
    this.requestCache.set(key, result);
  }

  /**
   * Clear all cached results
   */
  static clearCache(): void {
    this.requestCache.clear();
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