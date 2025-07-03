/**
 * Enhanced Distance Calculator for Houston Mobile Notary Pros
 * Implements SOP_ENHANCED.md requirements for service area validation and pricing
 * 
 * SOP Requirements:
 * - Primary Service Areas: 15-mile radius (Standard), 20-mile radius (Extended Hours) from ZIP 77591
 * - Travel Fee: $0.50/mile beyond primary service area
 * - Auto-geofencing: Prevent bookings beyond service areas or apply travel fees
 */

import { logger } from '@/lib/logger';

// Service area configuration from SOP_ENHANCED.md
const SERVICE_CONFIG = {
  CENTER_ZIP: '77591',
  CENTER_LOCATION: 'Texas City, TX 77591',
  STANDARD_RADIUS: 15, // miles
  EXTENDED_RADIUS: 20, // miles  
  MAX_RADIUS: 50, // absolute maximum
  TRAVEL_FEE_RATE: 0.50, // $0.50 per mile
  METERS_TO_MILES: 0.000621371
} as const;

export interface ServiceAreaConfig {
  serviceType: 'STANDARD_NOTARY' | 'EXTENDED_HOURS_NOTARY' | 'LOAN_SIGNING_SPECIALIST' | 'BUSINESS_SOLUTIONS';
  maxRadius: number;
  freeRadius: number;
}

export interface DistanceCalculationResult {
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
  serviceArea: {
    isWithinStandardArea: boolean;
    isWithinExtendedArea: boolean;
    isWithinMaxArea: boolean;
    applicableRadius: number;
  };
  pricing: {
    travelFee: number;
    travelDistance: number; // distance beyond free radius
    requiresTravelFee: boolean;
  };
  warnings: string[];
  recommendations: string[];
  metadata: {
    calculatedAt: string;
    apiSource: 'google_maps' | 'fallback';
    requestId: string;
  };
}

export interface GeofenceValidationResult {
  isAllowed: boolean;
  serviceType: string;
  distance: number;
  maxAllowedDistance: number;
  travelFee: number;
  warnings: string[];
  blockingReasons: string[];
  recommendations: string[];
}

export class EnhancedDistanceCalculator {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  private static readonly FALLBACK_ENABLED = true;

  /**
   * Get service area configuration based on service type
   */
  static getServiceAreaConfig(serviceType: string): ServiceAreaConfig {
    switch (serviceType) {
      case 'STANDARD_NOTARY':
        return {
          serviceType: 'STANDARD_NOTARY',
          maxRadius: SERVICE_CONFIG.STANDARD_RADIUS,
          freeRadius: SERVICE_CONFIG.STANDARD_RADIUS
        };
      case 'EXTENDED_HOURS_NOTARY':
        return {
          serviceType: 'EXTENDED_HOURS_NOTARY', 
          maxRadius: SERVICE_CONFIG.EXTENDED_RADIUS,
          freeRadius: SERVICE_CONFIG.EXTENDED_RADIUS
        };
      case 'LOAN_SIGNING_SPECIALIST':
      case 'BUSINESS_SOLUTIONS':
        return {
          serviceType: serviceType as any,
          maxRadius: SERVICE_CONFIG.EXTENDED_RADIUS, // Loan signings get extended radius
          freeRadius: SERVICE_CONFIG.EXTENDED_RADIUS
        };
      default:
        return {
          serviceType: 'STANDARD_NOTARY',
          maxRadius: SERVICE_CONFIG.STANDARD_RADIUS,
          freeRadius: SERVICE_CONFIG.STANDARD_RADIUS
        };
    }
  }

  /**
   * Calculate distance and validate service area according to SOP
   */
  static async calculateDistanceAndValidate(
    destinationAddress: string,
    serviceType: string = 'STANDARD_NOTARY'
  ): Promise<DistanceCalculationResult> {
    const requestId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      logger.info('Starting distance calculation', 'DISTANCE', {
        destination: destinationAddress,
        serviceType,
        requestId
      });

      const serviceConfig = this.getServiceAreaConfig(serviceType);
      let result: DistanceCalculationResult;

      if (this.API_KEY) {
        try {
          result = await this.calculateWithGoogleMaps(destinationAddress, serviceConfig, requestId);
        } catch (error) {
          logger.warn('Google Maps API failed, using fallback', 'DISTANCE', { error, requestId });
          result = this.calculateWithFallback(destinationAddress, serviceConfig, requestId);
        }
      } else {
        logger.warn('Google Maps API key not configured, using fallback', 'DISTANCE', { requestId });
        result = this.calculateWithFallback(destinationAddress, serviceConfig, requestId);
      }

      const duration = Date.now() - startTime;
      logger.info('Distance calculation completed', 'DISTANCE', {
        requestId,
        duration: `${duration}ms`,
        distance: result.distance.miles,
        travelFee: result.pricing.travelFee,
        apiSource: result.metadata.apiSource
      });

      return result;

    } catch (error) {
      logger.error('Distance calculation failed', 'DISTANCE', error as Error, { 
        destination: destinationAddress, 
        serviceType, 
        requestId 
      });
      
      // Return safe fallback
      return this.getSafetyFallback(destinationAddress, serviceType, requestId);
    }
  }

  /**
   * Perform comprehensive geofence validation
   */
  static async validateServiceArea(
    destinationAddress: string,
    serviceType: string = 'STANDARD_NOTARY'
  ): Promise<GeofenceValidationResult> {
    const distanceResult = await this.calculateDistanceAndValidate(destinationAddress, serviceType);
    const serviceConfig = this.getServiceAreaConfig(serviceType);
    
    const isAllowed = distanceResult.distance.miles <= serviceConfig.maxRadius;
    const warnings: string[] = [];
    const blockingReasons: string[] = [];
    const recommendations: string[] = [];

    // Distance-based validation
    if (distanceResult.distance.miles > SERVICE_CONFIG.MAX_RADIUS) {
      blockingReasons.push(`Location is ${distanceResult.distance.miles.toFixed(1)} miles away, beyond our maximum ${SERVICE_CONFIG.MAX_RADIUS}-mile service area.`);
      recommendations.push('Please contact us directly to discuss alternative arrangements.');
    } else if (distanceResult.distance.miles > serviceConfig.maxRadius) {
      blockingReasons.push(`Location exceeds the ${serviceConfig.maxRadius}-mile radius for ${serviceType} services.`);
      recommendations.push(`Consider selecting Extended Hours service (${SERVICE_CONFIG.EXTENDED_RADIUS}-mile radius) if available.`);
    } else if (distanceResult.pricing.requiresTravelFee) {
      warnings.push(`Travel fee of $${distanceResult.pricing.travelFee.toFixed(2)} applies for distances beyond ${serviceConfig.freeRadius} miles.`);
    }

    // Duration-based recommendations
    if (distanceResult.duration.minutes > 60) {
      recommendations.push('Due to extended travel time, please book at least 24 hours in advance for better availability.');
    } else if (distanceResult.duration.minutes > 30) {
      recommendations.push('Advance booking recommended due to travel time.');
    }

    // Area-specific intelligence
    const lowerAddress = destinationAddress.toLowerCase();
    if (lowerAddress.includes('katy') || lowerAddress.includes('sugar land') || lowerAddress.includes('pearland')) {
      recommendations.push('Popular service area - excellent availability.');
    } else if (lowerAddress.includes('conroe') || lowerAddress.includes('tomball')) {
      recommendations.push('Outer service area - advance booking highly recommended.');
    }

    return {
      isAllowed,
      serviceType,
      distance: distanceResult.distance.miles,
      maxAllowedDistance: serviceConfig.maxRadius,
      travelFee: distanceResult.pricing.travelFee,
      warnings,
      blockingReasons,
      recommendations
    };
  }

  /**
   * Calculate travel fee according to SOP requirements
   */
  static calculateTravelFee(distanceMiles: number, serviceType: string = 'STANDARD_NOTARY'): number {
    const serviceConfig = this.getServiceAreaConfig(serviceType);
    
    if (distanceMiles <= serviceConfig.freeRadius) {
      return 0;
    }

    const extraDistance = distanceMiles - serviceConfig.freeRadius;
    return Math.round(extraDistance * SERVICE_CONFIG.TRAVEL_FEE_RATE * 100) / 100; // Round to nearest cent
  }

  /**
   * Calculate using Google Maps Distance Matrix API
   */
  private static async calculateWithGoogleMaps(
    destination: string,
    serviceConfig: ServiceAreaConfig,
    requestId: string
  ): Promise<DistanceCalculationResult> {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins', SERVICE_CONFIG.CENTER_LOCATION);
    url.searchParams.set('destinations', destination);
    url.searchParams.set('units', 'imperial');
    url.searchParams.set('mode', 'driving');
    url.searchParams.set('avoid', 'tolls');
    url.searchParams.set('key', this.API_KEY!);

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

    const distanceMiles = element.distance.value * SERVICE_CONFIG.METERS_TO_MILES;
    const durationSeconds = element.duration.value;
    const durationMinutes = Math.round(durationSeconds / 60);

    return this.buildResult({
      distanceMiles,
      durationSeconds,
      durationMinutes,
      distanceText: element.distance.text,
      durationText: element.duration.text,
      serviceConfig,
      requestId,
      apiSource: 'google_maps'
    });
  }

  /**
   * Calculate using local intelligence fallback
   */
  private static calculateWithFallback(
    destination: string,
    serviceConfig: ServiceAreaConfig,
    requestId: string
  ): DistanceCalculationResult {
    const estimatedMiles = this.estimateDistanceFromAddress(destination);
    const estimatedSeconds = Math.round(estimatedMiles * 90); // ~1.5 min per mile
    const estimatedMinutes = Math.round(estimatedSeconds / 60);

    return this.buildResult({
      distanceMiles: estimatedMiles,
      durationSeconds: estimatedSeconds,
      durationMinutes: estimatedMinutes,
      distanceText: `~${estimatedMiles} mi (estimated)`,
      durationText: `~${estimatedMinutes} mins (estimated)`,
      serviceConfig,
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
    serviceConfig: ServiceAreaConfig;
    requestId: string;
    apiSource: 'google_maps' | 'fallback';
  }): DistanceCalculationResult {
    const { distanceMiles, durationSeconds, durationMinutes, distanceText, durationText, serviceConfig, requestId, apiSource } = params;
    
    const travelFee = this.calculateTravelFee(distanceMiles, serviceConfig.serviceType);
    const travelDistance = Math.max(0, distanceMiles - serviceConfig.freeRadius);
    
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Generate warnings and recommendations
    if (apiSource === 'fallback') {
      warnings.push('Distance estimated using local data - exact calculation will be confirmed during booking');
    }

    if (distanceMiles > SERVICE_CONFIG.MAX_RADIUS) {
      warnings.push('Location exceeds maximum service area');
    } else if (distanceMiles > serviceConfig.maxRadius) {
      warnings.push(`Location exceeds ${serviceConfig.serviceType} service radius`);
    } else if (travelFee > 0) {
      warnings.push(`Travel fee of $${travelFee.toFixed(2)} applies`);
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
      serviceArea: {
        isWithinStandardArea: distanceMiles <= SERVICE_CONFIG.STANDARD_RADIUS,
        isWithinExtendedArea: distanceMiles <= SERVICE_CONFIG.EXTENDED_RADIUS,
        isWithinMaxArea: distanceMiles <= SERVICE_CONFIG.MAX_RADIUS,
        applicableRadius: serviceConfig.maxRadius
      },
      pricing: {
        travelFee,
        travelDistance,
        requiresTravelFee: travelFee > 0
      },
      warnings,
      recommendations,
      metadata: {
        calculatedAt: new Date().toISOString(),
        apiSource,
        requestId
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
   * Safety fallback for complete failures
   */
  private static getSafetyFallback(
    destination: string, 
    serviceType: string, 
    requestId: string
  ): DistanceCalculationResult {
    const serviceConfig = this.getServiceAreaConfig(serviceType);
    const safeMiles = 15; // Conservative estimate
    const safeMinutes = 25;
    
    return this.buildResult({
      distanceMiles: safeMiles,
      durationSeconds: safeMinutes * 60,
      durationMinutes: safeMinutes,
      distanceText: `~${safeMiles} mi (safety estimate)`,
      durationText: `~${safeMinutes} mins (safety estimate)`,
      serviceConfig,
      requestId,
      apiSource: 'fallback'
    });
  }
}

/**
 * Legacy calculateDistance function for backward compatibility
 * Simple interface for basic distance calculations
 */
export async function calculateDistance(
  origin: string = SERVICE_CONFIG.CENTER_LOCATION,
  destination: string
): Promise<{ distance: number; duration: number; success: boolean }> {
  try {
    const result = await EnhancedDistanceCalculator.calculateDistanceAndValidate(destination);
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

// Named exports for backward compatibility
export { EnhancedDistanceCalculator as DistanceCalculator };

// Legacy compatibility exports
export const DistanceService = EnhancedDistanceCalculator;

// Default export
export default EnhancedDistanceCalculator;
