/**
 * Comprehensive Unit Tests - Distance Calculator
 * Houston Mobile Notary Pros
 * 
 * Battle-tested coverage for travel fee calculations and service area validation
 * Target: 85%+ branch coverage, bulletproof geo calculations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Google Maps API before importing the module
const mockGoogleMapsResponse = {
  routes: [{
    legs: [{
      distance: { value: 24140, text: '15.0 mi' }, // 15 miles in meters
      duration: { value: 1800, text: '30 mins' }
    }]
  }],
  status: 'OK'
};

// Mock fetch globally
global.fetch = vi.fn();

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service';
import type { 
  ServiceAreaConfig, 
  DistanceCalculationResult, 
  GeofenceValidationResult 
} from '@/lib/maps/unified-distance-service';
import { logger } from '@/lib/logger';

const mockedFetch = vi.mocked(fetch);
const mockedLogger = vi.mocked(logger);

describe('UnifiedDistanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up environment variable mock
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';
    
    // Default successful mock response
    mockedFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGoogleMapsResponse)
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Area Configuration', () => {
    it('should return correct config for STANDARD_NOTARY', () => {
      const config = UnifiedDistanceService.getServiceAreaConfig('STANDARD_NOTARY');
      
      expect(config).toEqual({
        serviceType: 'STANDARD_NOTARY',
        maxRadius: 50,
        freeRadius: 15
      });
    });

    it('should return correct config for EXTENDED_HOURS_NOTARY', () => {
      const config = UnifiedDistanceService.getServiceAreaConfig('EXTENDED_HOURS_NOTARY');
      
      expect(config).toEqual({
        serviceType: 'EXTENDED_HOURS_NOTARY',
        maxRadius: 50,
        freeRadius: 20
      });
    });

    it('should return correct config for LOAN_SIGNING_SPECIALIST', () => {
      const config = UnifiedDistanceService.getServiceAreaConfig('LOAN_SIGNING_SPECIALIST');
      
      expect(config).toEqual({
        serviceType: 'LOAN_SIGNING_SPECIALIST',
        maxRadius: 50,
        freeRadius: 20
      });
    });

    it('should return default config for unknown service types', () => {
      const config = UnifiedDistanceService.getServiceAreaConfig('UNKNOWN_SERVICE');
      
      expect(config).toEqual({
        serviceType: 'STANDARD_NOTARY',
        maxRadius: 50,
        freeRadius: 15
      });
    });
  });

  describe('Distance Calculation - Google Maps Integration', () => {
    it('should calculate distance successfully with Google Maps API', async () => {
      const destination = '123 Main St, Houston, TX 77001';
      const serviceType = 'STANDARD_NOTARY';

      const result = await UnifiedDistanceService.calculateDistance(destination, serviceType);

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining('maps.googleapis.com/maps/api/directions'),
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result.success).toBe(true);
      expect(result.distance.miles).toBe(15.0);
      expect(result.duration.minutes).toBe(30);
      expect(result.metadata.apiSource).toBe('google_maps');
    });

    it('should handle Google Maps API errors gracefully', async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ZERO_RESULTS' })
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Invalid Address, Nowhere, TX 00000',
        'STANDARD_NOTARY'
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toContain('No route found to destination');
    });

    it('should handle network errors and fall back gracefully', async () => {
      mockedFetch.mockRejectedValue(new Error('Network error'));

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Main St, Houston, TX 77001',
        'STANDARD_NOTARY'
      );

      expect(result.success).toBe(false);
      expect(result.metadata.apiSource).toBe('fallback');
      expect(mockedLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Google Maps API error'),
        expect.any(Object)
      );
    });

    it('should handle invalid API responses', async () => {
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Main St, Houston, TX 77001',
        'STANDARD_NOTARY'
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toContain('API request failed');
    });

    it('should handle malformed API responses', async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Main St, Houston, TX 77001',
        'STANDARD_NOTARY'
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toContain('Invalid API response format');
    });
  });

  describe('Service Area Validation', () => {
    it('should identify locations within standard service area', async () => {
      // Mock 10-mile distance (within 15-mile standard radius)
      const closeResponse = {
        routes: [{
          legs: [{
            distance: { value: 16093, text: '10.0 mi' }, // 10 miles
            duration: { value: 1200, text: '20 mins' }
          }]
        }],
        status: 'OK'
      };

      mockedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(closeResponse)
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Nearby St, League City, TX 77573',
        'STANDARD_NOTARY'
      );

      expect(result.serviceArea.isWithinStandardArea).toBe(true);
      expect(result.serviceArea.isWithinExtendedArea).toBe(true);
      expect(result.serviceArea.applicableRadius).toBe(15);
      expect(result.pricing.requiresTravelFee).toBe(false);
      expect(result.pricing.travelFee).toBe(0);
    });

    it('should calculate travel fees for distances beyond free radius', async () => {
      // Mock 25-mile distance (beyond 15-mile standard radius)
      const farResponse = {
        routes: [{
          legs: [{
            distance: { value: 40234, text: '25.0 mi' }, // 25 miles
            duration: { value: 2700, text: '45 mins' }
          }]
        }],
        status: 'OK'
      };

      mockedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(farResponse)
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Far St, Katy, TX 77449',
        'STANDARD_NOTARY'
      );

      expect(result.serviceArea.isWithinStandardArea).toBe(false);
      expect(result.serviceArea.isWithinExtendedArea).toBe(false);
      expect(result.pricing.requiresTravelFee).toBe(true);
      expect(result.pricing.travelDistance).toBe(10); // 25 - 15 = 10 miles beyond
      expect(result.pricing.travelFee).toBe(5.0); // 10 miles * $0.50/mile
    });

    it('should handle extended hours service area correctly', async () => {
      // Mock 18-mile distance (beyond standard 15, within extended 20)
      const extendedResponse = {
        routes: [{
          legs: [{
            distance: { value: 28968, text: '18.0 mi' }, // 18 miles
            duration: { value: 2100, text: '35 mins' }
          }]
        }],
        status: 'OK'
      };

      mockedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(extendedResponse)
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Medium St, Sugar Land, TX 77479',
        'EXTENDED_HOURS_NOTARY'
      );

      expect(result.serviceArea.isWithinStandardArea).toBe(false);
      expect(result.serviceArea.isWithinExtendedArea).toBe(true);
      expect(result.serviceArea.applicableRadius).toBe(20);
      expect(result.pricing.requiresTravelFee).toBe(false); // Within extended free radius
      expect(result.pricing.travelFee).toBe(0);
    });

    it('should reject bookings beyond maximum service area', async () => {
      // Mock 60-mile distance (beyond 50-mile maximum)
      const veryFarResponse = {
        routes: [{
          legs: [{
            distance: { value: 96561, text: '60.0 mi' }, // 60 miles
            duration: { value: 4800, text: '80 mins' }
          }]
        }],
        status: 'OK'
      };

      mockedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(veryFarResponse)
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Very Far St, Austin, TX 78701',
        'STANDARD_NOTARY'
      );

      expect(result.serviceArea.isWithinMaxArea).toBe(false);
      expect(result.warnings).toContain('beyond maximum service area');
      expect(result.recommendations).toContain('consider remote online notarization');
    });
  });

  describe('Geofence Validation', () => {
    it('should allow bookings within service area', () => {
      const result = UnifiedDistanceService.validateGeofence(
        12, // 12 miles
        'STANDARD_NOTARY'
      );

      expect(result.isAllowed).toBe(true);
      expect(result.travelFee).toBe(0);
      expect(result.blockingReasons).toHaveLength(0);
    });

    it('should allow bookings with travel fee within max area', () => {
      const result = UnifiedDistanceService.validateGeofence(
        25, // 25 miles
        'STANDARD_NOTARY'
      );

      expect(result.isAllowed).toBe(true);
      expect(result.travelFee).toBe(5.0); // (25 - 15) * $0.50
      expect(result.warnings).toContain('Travel fee applies');
    });

    it('should block bookings beyond maximum service area', () => {
      const result = UnifiedDistanceService.validateGeofence(
        60, // 60 miles
        'STANDARD_NOTARY'
      );

      expect(result.isAllowed).toBe(false);
      expect(result.blockingReasons).toContain('Distance exceeds maximum service area');
      expect(result.recommendations).toContain('Consider Remote Online Notarization');
    });

    it('should handle different service types correctly', () => {
      const standardResult = UnifiedDistanceService.validateGeofence(18, 'STANDARD_NOTARY');
      const extendedResult = UnifiedDistanceService.validateGeofence(18, 'EXTENDED_HOURS_NOTARY');

      expect(standardResult.travelFee).toBe(1.5); // (18 - 15) * $0.50
      expect(extendedResult.travelFee).toBe(0); // Within 20-mile free radius
    });
  });

  describe('Travel Fee Calculations', () => {
    it('should calculate correct travel fees for various distances', () => {
      const testCases = [
        { distance: 10, serviceType: 'STANDARD_NOTARY', expectedFee: 0 },
        { distance: 15, serviceType: 'STANDARD_NOTARY', expectedFee: 0 },
        { distance: 20, serviceType: 'STANDARD_NOTARY', expectedFee: 2.5 },
        { distance: 30, serviceType: 'STANDARD_NOTARY', expectedFee: 7.5 },
        { distance: 15, serviceType: 'EXTENDED_HOURS_NOTARY', expectedFee: 0 },
        { distance: 25, serviceType: 'EXTENDED_HOURS_NOTARY', expectedFee: 2.5 }
      ];

      testCases.forEach(({ distance, serviceType, expectedFee }) => {
        const fee = UnifiedDistanceService.calculateTravelFee(distance, serviceType);
        expect(fee).toBe(expectedFee);
      });
    });

    it('should handle edge case distances correctly', () => {
      expect(UnifiedDistanceService.calculateTravelFee(0, 'STANDARD_NOTARY')).toBe(0);
      expect(UnifiedDistanceService.calculateTravelFee(-5, 'STANDARD_NOTARY')).toBe(0);
      expect(UnifiedDistanceService.calculateTravelFee(14.99, 'STANDARD_NOTARY')).toBe(0);
      expect(UnifiedDistanceService.calculateTravelFee(15.01, 'STANDARD_NOTARY')).toBe(0.005);
    });

    it('should round travel fees appropriately', () => {
      // Test rounding behavior for fractional miles
      const fee = UnifiedDistanceService.calculateTravelFee(15.33, 'STANDARD_NOTARY');
      expect(fee).toBeCloseTo(0.165, 3); // 0.33 * $0.50
    });
  });

  describe('Fallback Distance Calculation', () => {
    it('should provide fallback calculations when Google Maps fails', async () => {
      // Mock API failure
      mockedFetch.mockRejectedValue(new Error('API unavailable'));

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Main St, Houston, TX 77001',
        'STANDARD_NOTARY'
      );

      expect(result.success).toBe(false);
      expect(result.metadata.apiSource).toBe('fallback');
      expect(result.distance.miles).toBeGreaterThan(0); // Should have some fallback value
      expect(result.warnings).toContain('Using estimated distance');
    });

    it('should provide reasonable fallback estimates for Houston area', async () => {
      mockedFetch.mockRejectedValue(new Error('API unavailable'));

      const result = await UnifiedDistanceService.calculateDistance(
        'Houston, TX',
        'STANDARD_NOTARY'
      );

      expect(result.distance.miles).toBeGreaterThan(0);
      expect(result.distance.miles).toBeLessThan(100);
      expect(result.duration.minutes).toBeGreaterThan(0);
    });
  });

  describe('Address Parsing and Validation', () => {
    it('should handle various address formats', async () => {
      const addresses = [
        '123 Main St, Houston, TX 77001',
        '123 Main Street, Houston, Texas 77001',
        'Houston, TX',
        '77001', // ZIP code only
        'Downtown Houston, TX'
      ];

      for (const address of addresses) {
        const result = await UnifiedDistanceService.calculateDistance(
          address,
          'STANDARD_NOTARY'
        );

        // Should at least attempt calculation (success depends on mock)
        expect(typeof result.success).toBe('boolean');
        expect(result.metadata.requestId).toBeDefined();
      }
    });

    it('should handle empty or invalid addresses', async () => {
      const invalidAddresses = ['', '   ', 'Invalid Address 12345'];

      for (const address of invalidAddresses) {
        const result = await UnifiedDistanceService.calculateDistance(
          address,
          'STANDARD_NOTARY'
        );

        if (!result.success) {
          expect(result.warnings.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Performance and Caching', () => {
    it('should include request timing in metadata', async () => {
      const result = await UnifiedDistanceService.calculateDistance(
        '123 Main St, Houston, TX 77001',
        'STANDARD_NOTARY'
      );

      expect(result.metadata.calculatedAt).toBeDefined();
      expect(new Date(result.metadata.calculatedAt)).toBeInstanceOf(Date);
      expect(result.metadata.requestId).toBeDefined();
    });

    it('should handle concurrent requests correctly', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        UnifiedDistanceService.calculateDistance(
          `123 Test St ${i}, Houston, TX 77001`,
          'STANDARD_NOTARY'
        )
      );

      const results = await Promise.all(promises);

      results.forEach((result, index) => {
        expect(result.metadata.requestId).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      });

      // Each request should have unique request ID
      const requestIds = results.map(r => r.metadata.requestId);
      const uniqueIds = new Set(requestIds);
      expect(uniqueIds.size).toBe(results.length);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing API key gracefully', async () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Main St, Houston, TX 77001',
        'STANDARD_NOTARY'
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toContain('Google Maps API key not configured');
    });

    it('should handle rate limiting from Google Maps API', async () => {
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Main St, Houston, TX 77001',
        'STANDARD_NOTARY'
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toContain('Rate limit exceeded');
    });

    it('should handle quota exceeded errors', async () => {
      mockedFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'OVER_QUERY_LIMIT' })
      } as Response);

      const result = await UnifiedDistanceService.calculateDistance(
        '123 Main St, Houston, TX 77001',
        'STANDARD_NOTARY'
      );

      expect(result.success).toBe(false);
      expect(result.warnings).toContain('API quota exceeded');
    });
  });
});

// Helper functions for integration tests
export function createMockDistanceResult(overrides: Partial<DistanceCalculationResult> = {}): DistanceCalculationResult {
  return {
    success: true,
    distance: {
      miles: 15.0,
      kilometers: 24.1,
      text: '15.0 mi'
    },
    duration: {
      minutes: 30,
      seconds: 1800,
      text: '30 mins'
    },
    serviceArea: {
      isWithinStandardArea: true,
      isWithinExtendedArea: true,
      isWithinMaxArea: true,
      applicableRadius: 15
    },
    pricing: {
      travelFee: 0,
      travelDistance: 0,
      requiresTravelFee: false
    },
    warnings: [],
    recommendations: [],
    metadata: {
      calculatedAt: new Date().toISOString(),
      apiSource: 'google_maps',
      requestId: 'test-request-id'
    },
    ...overrides
  };
}