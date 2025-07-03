/**
 * Comprehensive Unit Tests - Pricing Engine
 * Houston Mobile Notary Pros
 * 
 * Battle-tested coverage for all pricing logic edge cases
 * Target: 90%+ branch coverage, <200ms per suite
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PricingEngine, SERVICES, PRICING_CONFIG, PricingCalculationError } from '@/lib/pricing-engine';
import type { PricingCalculationParams } from '@/lib/pricing-engine';

// Mock external dependencies
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
  }
}));

vi.mock('@/lib/maps/distance-calculator', () => ({
  calculateDistance: vi.fn()
}));

// Import mocked modules for type safety
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { calculateDistance } from '@/lib/maps/distance-calculator';

const mockedLogger = vi.mocked(logger);
const mockedRedis = vi.mocked(redis);
const mockedCalculateDistance = vi.mocked(calculateDistance);

describe('PricingEngine - Pure Logic Tests', () => {
  let pricingEngine: PricingEngine;
  
  beforeEach(() => {
    vi.clearAllMocks();
    pricingEngine = new PricingEngine('test-request-id');
    
    // Default mock responses
    mockedRedis.get.mockResolvedValue(null);
    mockedRedis.set.mockResolvedValue('OK');
    mockedCalculateDistance.mockResolvedValue({
      distance: 10, // 10 miles default
      duration: 20, // 20 minutes
      route: 'test-route'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Base Pricing', () => {
    it('should return correct base price for STANDARD_NOTARY', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.basePrice).toBe(SERVICES.STANDARD_NOTARY.price);
      expect(result.breakdown.lineItems).toContainEqual(
        expect.objectContaining({
          description: 'Standard Notary Service',
          amount: 75,
          type: 'base'
        })
      );
    });

    it('should return correct base price for EXTENDED_HOURS', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'EXTENDED_HOURS',
        scheduledDateTime: new Date('2024-02-15T20:00:00Z').toISOString(),
        documentCount: 3,
        signerCount: 2,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.basePrice).toBe(SERVICES.EXTENDED_HOURS.price);
      expect(result.total).toBeGreaterThanOrEqual(100);
    });

    it('should return correct base price for LOAN_SIGNING', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'LOAN_SIGNING',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 15,
        signerCount: 3,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.basePrice).toBe(SERVICES.LOAN_SIGNING.price);
    });

    it('should return correct base price for RON_SERVICES', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'RON_SERVICES',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.basePrice).toBe(SERVICES.RON_SERVICES.price);
      expect(result.travelFee).toBe(0); // RON has no travel fee
    });
  });

  describe('Travel Fee Calculations', () => {
    it('should calculate no travel fee within included radius', async () => {
      mockedCalculateDistance.mockResolvedValue({
        distance: 10, // Within 15-mile radius for STANDARD_NOTARY
        duration: 20,
        route: 'test-route'
      });

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        location: {
          address: '123 Test St, Houston, TX 77001',
          latitude: 29.7604,
          longitude: -95.3698
        },
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.travelFee).toBe(0);
      expect(result.breakdown.transparency.travelCalculation).toContain('within included radius');
    });

    it('should calculate travel fee beyond included radius', async () => {
      mockedCalculateDistance.mockResolvedValue({
        distance: 25, // Beyond 15-mile radius for STANDARD_NOTARY
        duration: 45,
        route: 'test-route'
      });

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        location: {
          address: '123 Far Away St, Katy, TX 77449',
          latitude: 29.7858,
          longitude: -95.8244
        },
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      const expectedTravelFee = (25 - SERVICES.STANDARD_NOTARY.includedRadius) * SERVICES.STANDARD_NOTARY.feePerMile;
      expect(result.travelFee).toBe(expectedTravelFee);
      expect(result.breakdown.lineItems).toContainEqual(
        expect.objectContaining({
          type: 'travel',
          amount: expectedTravelFee
        })
      );
    });

    it('should handle different travel rates for different services', async () => {
      mockedCalculateDistance.mockResolvedValue({
        distance: 25,
        duration: 45,
        route: 'test-route'
      });

      const params: PricingCalculationParams = {
        serviceType: 'EXTENDED_HOURS',
        location: {
          address: '123 Far Away St, Katy, TX 77449'
        },
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      const expectedTravelFee = (25 - SERVICES.EXTENDED_HOURS.includedRadius) * SERVICES.EXTENDED_HOURS.feePerMile;
      expect(result.travelFee).toBe(expectedTravelFee);
    });

    it('should handle RON services with zero travel fee', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'RON_SERVICES',
        location: {
          address: '123 Anywhere St, Dallas, TX 75201'
        },
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.travelFee).toBe(0);
      expect(mockedCalculateDistance).not.toHaveBeenCalled();
    });
  });

  describe('Surcharge Calculations', () => {
    it('should apply priority surcharge when requested', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {
          priority: true
        }
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.surcharges).toBe(PRICING_CONFIG.surcharges.priority);
      expect(result.breakdown.lineItems).toContainEqual(
        expect.objectContaining({
          description: 'Priority Service',
          amount: PRICING_CONFIG.surcharges.priority,
          type: 'surcharge'
        })
      );
    });

    it('should apply weather surcharge for travel during weather alerts', async () => {
      mockedCalculateDistance.mockResolvedValue({
        distance: 20,
        duration: 30,
        route: 'test-route'
      });

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        location: {
          address: '123 Test St, Houston, TX 77001'
        },
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {
          weatherAlert: true
        }
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      const baseTravelFee = (20 - SERVICES.STANDARD_NOTARY.includedRadius) * SERVICES.STANDARD_NOTARY.feePerMile;
      const weatherSurcharge = (20 - SERVICES.STANDARD_NOTARY.includedRadius) * PRICING_CONFIG.surcharges.weather;
      
      expect(result.travelFee).toBe(baseTravelFee);
      expect(result.surcharges).toBe(weatherSurcharge);
    });

    it('should apply weekend surcharge for Saturday/Sunday bookings', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-17T14:00:00Z').toISOString(), // Saturday
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.surcharges).toBe(PRICING_CONFIG.surcharges.weekend);
    });

    it('should apply after-hours surcharge', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T22:00:00Z').toISOString(), // 10 PM
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.surcharges).toBe(PRICING_CONFIG.surcharges.afterHours);
    });

    it('should combine multiple surcharges correctly', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-17T22:00:00Z').toISOString(), // Saturday 10 PM
        documentCount: 1,
        signerCount: 1,
        options: {
          priority: true
        }
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      const expectedSurcharges = PRICING_CONFIG.surcharges.weekend + 
                                PRICING_CONFIG.surcharges.afterHours + 
                                PRICING_CONFIG.surcharges.priority;
      expect(result.surcharges).toBe(expectedSurcharges);
    });
  });

  describe('Discount Calculations', () => {
    it('should apply first-time customer discount', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        customerEmail: 'newcustomer@example.com',
        options: {}
      };

      // Mock Redis to return null (new customer)
      mockedRedis.get.mockResolvedValue(null);

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.discounts).toBe(PRICING_CONFIG.discounts.firstTime);
      expect(result.breakdown.lineItems).toContainEqual(
        expect.objectContaining({
          description: 'First-time customer discount',
          amount: -PRICING_CONFIG.discounts.firstTime,
          type: 'discount'
        })
      );
    });

    it('should apply referral discount with valid referral code', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        referralCode: 'FRIEND123',
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.discounts).toBe(PRICING_CONFIG.discounts.referral);
    });

    it('should apply volume discount for multiple documents', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 5, // Multiple documents
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      const expectedVolumeDiscount = result.basePrice * PRICING_CONFIG.discounts.volume;
      expect(result.discounts).toBe(expectedVolumeDiscount);
    });

    it('should not stack first-time and referral discounts', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        customerEmail: 'newcustomer@example.com',
        referralCode: 'FRIEND123',
        options: {}
      };

      mockedRedis.get.mockResolvedValue(null);

      const result = await pricingEngine.calculateBookingPrice(params);
      
      // Should apply the higher discount (referral > first-time)
      expect(result.discounts).toBe(PRICING_CONFIG.discounts.referral);
    });
  });

  describe('Promo Code Handling', () => {
    it('should apply valid promo code discount', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        promoCode: 'SAVE10',
        options: {}
      };

      // Mock valid promo code
      mockedRedis.get.mockResolvedValue(JSON.stringify({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed',
        active: true,
        expiresAt: '2024-12-31T23:59:59Z'
      }));

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.discounts).toBe(10);
      expect(result.breakdown.lineItems).toContainEqual(
        expect.objectContaining({
          description: 'Promo code: SAVE10',
          amount: -10,
          type: 'discount'
        })
      );
    });

    it('should apply percentage promo codes correctly', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        promoCode: 'SAVE20PCT',
        options: {}
      };

      mockedRedis.get.mockResolvedValue(JSON.stringify({
        code: 'SAVE20PCT',
        discount: 20,
        type: 'percentage',
        active: true,
        expiresAt: '2024-12-31T23:59:59Z'
      }));

      const result = await pricingEngine.calculateBookingPrice(params);
      
      const expectedDiscount = (result.basePrice + result.travelFee + result.surcharges) * 0.20;
      expect(result.discounts).toBe(expectedDiscount);
    });

    it('should ignore invalid promo codes', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        promoCode: 'INVALID',
        options: {}
      };

      mockedRedis.get.mockResolvedValue(null);

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.discounts).toBe(0);
      expect(result.breakdown.transparency.discountSource).toContain('invalid');
    });

    it('should ignore expired promo codes', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        promoCode: 'EXPIRED',
        options: {}
      };

      mockedRedis.get.mockResolvedValue(JSON.stringify({
        code: 'EXPIRED',
        discount: 15,
        type: 'fixed',
        active: true,
        expiresAt: '2023-12-31T23:59:59Z' // Expired
      }));

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.discounts).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid service type', async () => {
      const params = {
        serviceType: 'INVALID_SERVICE' as any,
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      await expect(pricingEngine.calculateBookingPrice(params))
        .rejects.toThrow();
    });

    it('should handle distance calculation failures gracefully', async () => {
      mockedCalculateDistance.mockRejectedValue(new Error('Google Maps API error'));

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        location: {
          address: '123 Test St, Houston, TX 77001'
        },
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      // Should fall back to base pricing without travel fee
      expect(result.travelFee).toBe(0);
      expect(result.total).toBe(SERVICES.STANDARD_NOTARY.price);
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Distance calculation failed'),
        expect.any(Object)
      );
    });

    it('should handle Redis failures gracefully', async () => {
      mockedRedis.get.mockRejectedValue(new Error('Redis connection error'));

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        customerEmail: 'test@example.com',
        promoCode: 'SAVE10',
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      // Should continue without discounts/promo codes
      expect(result.discounts).toBe(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should handle extreme values gracefully', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 999,
        signerCount: 100,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.total).toBeGreaterThan(0);
      expect(result.total).toBeLessThan(10000); // Reasonable upper bound
    });

    it('should handle zero and negative values', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 0, // Invalid
        signerCount: -1, // Invalid
        options: {}
      };

      await expect(pricingEngine.calculateBookingPrice(params))
        .rejects.toThrow();
    });
  });

  describe('Total Calculation Accuracy', () => {
    it('should calculate totals correctly with all components', async () => {
      mockedCalculateDistance.mockResolvedValue({
        distance: 25,
        duration: 45,
        route: 'test-route'
      });

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        location: {
          address: '123 Far Away St, Katy, TX 77449'
        },
        scheduledDateTime: new Date('2024-02-17T22:00:00Z').toISOString(), // Saturday 10 PM
        documentCount: 1,
        signerCount: 1,
        promoCode: 'SAVE10',
        options: {
          priority: true
        }
      };

      mockedRedis.get.mockResolvedValue(JSON.stringify({
        code: 'SAVE10',
        discount: 10,
        type: 'fixed',
        active: true,
        expiresAt: '2024-12-31T23:59:59Z'
      }));

      const result = await pricingEngine.calculateBookingPrice(params);
      
      const expectedTravelFee = (25 - 15) * 0.50; // 10 miles @ $0.50/mile
      const expectedSurcharges = PRICING_CONFIG.surcharges.weekend + 
                                PRICING_CONFIG.surcharges.afterHours + 
                                PRICING_CONFIG.surcharges.priority;
      const expectedTotal = SERVICES.STANDARD_NOTARY.price + 
                           expectedTravelFee + 
                           expectedSurcharges - 
                           10; // promo code

      expect(result.total).toBe(expectedTotal);
      expect(result.basePrice).toBe(SERVICES.STANDARD_NOTARY.price);
      expect(result.travelFee).toBe(expectedTravelFee);
      expect(result.surcharges).toBe(expectedSurcharges);
      expect(result.discounts).toBe(10);
    });

    it('should never return negative totals', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'RON_SERVICES', // Cheapest service
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        promoCode: 'HUGE_DISCOUNT',
        options: {}
      };

      mockedRedis.get.mockResolvedValue(JSON.stringify({
        code: 'HUGE_DISCOUNT',
        discount: 1000, // Bigger than service price
        type: 'fixed',
        active: true,
        expiresAt: '2024-12-31T23:59:59Z'
      }));

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Confidence and Metadata', () => {
    it('should return high confidence for standard calculations', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.confidence.level).toBe('high');
      expect(result.confidence.factors).toContain('standard_pricing');
    });

    it('should return medium confidence when distance calc fails', async () => {
      mockedCalculateDistance.mockRejectedValue(new Error('API error'));

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        location: {
          address: '123 Test St, Houston, TX 77001'
        },
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.confidence.level).toBe('medium');
      expect(result.confidence.factors).toContain('distance_estimation_failed');
    });

    it('should include proper metadata', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {}
      };

      const result = await pricingEngine.calculateBookingPrice(params);
      
      expect(result.metadata.requestId).toBe('test-request-id');
      expect(result.metadata.version).toBeDefined();
      expect(result.metadata.calculatedAt).toBeDefined();
      expect(new Date(result.metadata.calculatedAt)).toBeInstanceOf(Date);
    });
  });
});

// Export helper function for integration tests
export function createMockPricingParams(overrides: Partial<PricingCalculationParams> = {}): PricingCalculationParams {
  return {
    serviceType: 'STANDARD_NOTARY',
    scheduledDateTime: new Date('2024-02-15T14:00:00Z').toISOString(),
    documentCount: 1,
    signerCount: 1,
    options: {},
    ...overrides
  };
}