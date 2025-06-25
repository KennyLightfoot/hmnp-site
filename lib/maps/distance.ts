/**
 * Google Maps Distance Matrix API integration
 * Calculates travel distance and provides geofencing for Houston Mobile Notary Pros
 */

interface DistanceMatrixResponse {
  rows: {
    elements: {
      distance: {
        text: string;
        value: number; // meters
      };
      duration: {
        text: string;
        value: number; // seconds
      };
      status: string;
    }[];
  }[];
  status: string;
}

export interface DistanceResult {
  distance: {
    miles: number;
    text: string;
  };
  duration: {
    minutes: number;
    text: string;
  };
  isWithinServiceArea: boolean;
  warnings: string[];
}

export interface GeofenceResult {
  isAllowed: boolean;
  distance: number;
  warnings: string[];
  recommendations: string[];
}

export class DistanceService {
  private static readonly GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  private static readonly BASE_LOCATION = "77591"; // Our service center ZIP code
  private static readonly BASE_LOCATION_FULL = "Texas City, TX 77591"; // Full address for Google Maps
  private static readonly MAX_SERVICE_RADIUS = 50; // miles (extended per SOP)
  private static readonly FREE_SERVICE_RADIUS = 15; // miles (15-mile base radius per SOP)
  private static readonly TRAVEL_FEE_PER_MILE = 0.50; // $0.50/mile beyond free radius per SOP
  private static readonly METERS_TO_MILES = 0.000621371;

  /**
   * Calculate distance and duration from Houston to destination
   */
  static async calculateDistance(
    destination: string
  ): Promise<DistanceResult> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return this.getFallbackResult(destination);
    }

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
      url.searchParams.set('origins', this.BASE_LOCATION_FULL);
      url.searchParams.set('destinations', destination);
      url.searchParams.set('units', 'imperial');
      url.searchParams.set('mode', 'driving');
      url.searchParams.set('avoid', 'tolls'); // Prefer non-toll routes for cost efficiency
      url.searchParams.set('key', this.GOOGLE_MAPS_API_KEY);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data: DistanceMatrixResponse = await response.json();

      if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
        throw new Error('No distance data available');
      }

      const element = data.rows[0].elements[0];

      if (element.status !== 'OK') {
        throw new Error(`Distance calculation failed: ${element.status}`);
      }

      const distanceMiles = element.distance.value * this.METERS_TO_MILES;
      const durationMinutes = Math.round(element.duration.value / 60);
      
      const isWithinServiceArea = distanceMiles <= this.MAX_SERVICE_RADIUS;
      const warnings = this.generateWarnings(distanceMiles, durationMinutes);

      return {
        distance: {
          miles: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal
          text: element.distance.text
        },
        duration: {
          minutes: durationMinutes,
          text: element.duration.text
        },
        isWithinServiceArea,
        warnings
      };

    } catch (error) {
      console.error('Distance calculation error:', error);
      return this.getFallbackResult(destination);
    }
  }

  /**
   * Perform geofencing check with detailed recommendations
   */
  static async performGeofenceCheck(
    destination: string
  ): Promise<GeofenceResult> {
    const distanceResult = await this.calculateDistance(destination);
    
    const isAllowed = distanceResult.isWithinServiceArea;
    const distance = distanceResult.distance.miles;
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Generate warnings based on distance
    if (distance > this.MAX_SERVICE_RADIUS) {
      warnings.push(`Location is ${distance.toFixed(1)} miles away, beyond our standard ${this.MAX_SERVICE_RADIUS}-mile service area.`);
      recommendations.push('Consider contacting us directly to discuss special arrangements.');
    } else if (distance > this.FREE_SERVICE_RADIUS) {
      warnings.push(`Travel fee will apply for distances beyond ${this.FREE_SERVICE_RADIUS} miles from ZIP 77591.`);
      const travelFee = (distance - this.FREE_SERVICE_RADIUS) * this.TRAVEL_FEE_PER_MILE;
      recommendations.push(`Additional travel fee: $${travelFee.toFixed(2)} ($${this.TRAVEL_FEE_PER_MILE}/mile beyond ${this.FREE_SERVICE_RADIUS}-mile base radius)`);
    }

    // Duration-based recommendations
    if (distanceResult.duration.minutes > 60) {
      recommendations.push('Due to travel time, consider scheduling in advance for better availability.');
    }

    // Area-specific recommendations
    if (destination.toLowerCase().includes('katy') || destination.toLowerCase().includes('sugar land')) {
      recommendations.push('Popular service area - we visit this location frequently.');
    }

    return {
      isAllowed,
      distance,
      warnings,
      recommendations
    };
  }

  /**
   * Calculate travel fee based on distance (SOP: 15-mile base radius from 77591, $0.50/mile beyond)
   */
  static calculateTravelFee(distanceMiles: number): number {
    if (distanceMiles <= this.FREE_SERVICE_RADIUS) {
      return 0;
    }
    return (distanceMiles - this.FREE_SERVICE_RADIUS) * this.TRAVEL_FEE_PER_MILE;
  }

  /**
   * Get estimated travel time for scheduling
   */
  static async getEstimatedTravelTime(destination: string): Promise<number> {
    const result = await this.calculateDistance(destination);
    return result.duration.minutes;
  }

  /**
   * Batch distance calculation for multiple destinations
   */
  static async calculateMultipleDistances(
    destinations: string[]
  ): Promise<DistanceResult[]> {
    const promises = destinations.map(dest => this.calculateDistance(dest));
    return Promise.all(promises);
  }

  /**
   * Generate warnings based on distance and duration
   */
  private static generateWarnings(distanceMiles: number, durationMinutes: number): string[] {
    const warnings: string[] = [];

    if (distanceMiles > this.MAX_SERVICE_RADIUS) {
      warnings.push('Location exceeds standard service area');
    } else if (distanceMiles > this.FREE_SERVICE_RADIUS) {
      warnings.push('Travel fee applies');
    }

    if (durationMinutes > 45) {
      warnings.push('Extended travel time may affect same-day availability');
    }

    return warnings;
  }

  /**
   * Fallback result when Google Maps API is unavailable
   */
  private static getFallbackResult(destination: string): DistanceResult {
    // Simple heuristic based on common Houston area knowledge
    const lowerDest = destination.toLowerCase();
    let estimatedMiles = 15; // Default assumption

    // Houston area distance estimates
    if (lowerDest.includes('katy')) estimatedMiles = 20;
    else if (lowerDest.includes('sugar land')) estimatedMiles = 18;
    else if (lowerDest.includes('cypress')) estimatedMiles = 22;
    else if (lowerDest.includes('tomball')) estimatedMiles = 25;
    else if (lowerDest.includes('conroe')) estimatedMiles = 30;
    else if (lowerDest.includes('galveston')) estimatedMiles = 45;

    const estimatedMinutes = Math.round(estimatedMiles * 1.5); // Rough estimate: 1.5 min per mile

    return {
      distance: {
        miles: estimatedMiles,
        text: `${estimatedMiles} mi`
      },
      duration: {
        minutes: estimatedMinutes,
        text: `${estimatedMinutes} mins`
      },
      isWithinServiceArea: estimatedMiles <= this.MAX_SERVICE_RADIUS,
      warnings: [
        'Distance estimated (Google Maps unavailable)',
        ...this.generateWarnings(estimatedMiles, estimatedMinutes)
      ]
    };
  }
}

export default DistanceService; 