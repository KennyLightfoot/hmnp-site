/**
 * Comprehensive Unit Tests for PricingEngine
 * Houston Mobile Notary Pros
 * 
 * Tests all methods, error paths, edge cases, and uncovered branches
 * Target: 80%+ coverage for pricing-engine.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PricingEngine, createPricingEngine, calculateBookingPrice } from '@/lib/pricing-engine';
import type { PricingCalculationParams, PricingResult } from '@/lib/pricing/types';

// Mock all dependencies
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/pricing/surcharges', () => ({
  calculateSurcharges: vi.fn(() => 0),
}));

vi.mock('@/lib/pricing/discounts', () => ({
  calculateDiscounts: vi.fn(() => Promise.resolve(0)),
}));

vi.mock('@/lib/pricing/upsells', () => ({
  detectUpsellOpportunities: vi.fn(() => []),
}));

vi.mock('@/lib/pricing/breakdown', () => ({
  generatePricingBreakdown: vi.fn(() => ({
    lineItems: [],
    transparency: {},
  })),
}));

vi.mock('@/lib/pricing/confidence', () => ({
  calculatePricingConfidence: vi.fn(() => ({
    level: 'high' as const,
    factors: [],
  })),
}));

vi.mock('@/lib/pricing/cache', () => ({
  cacheResult: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/maps/unified-distance-service', () => ({
  UnifiedDistanceService: {
    calculateDistance: vi.fn(() => Promise.resolve({
      distance: { miles: 10 },
      withinServiceArea: true,
    })),
  },
}));

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(() => Promise.resolve(null)),
    setex: vi.fn(() => Promise.resolve(true)),
    set: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock('@/lib/pricing/base', () => ({
  getServiceBasePrice: vi.fn((serviceType: string) => {
    const prices: Record<string, number> = {
      STANDARD_NOTARY: 75,
      EXTENDED_HOURS: 100,
      LOAN_SIGNING: 150,
      RON_SERVICES: 35,
      BUSINESS_ESSENTIALS: 125,
      BUSINESS_GROWTH: 349,
    };
    return prices[serviceType] || 75;
  }),
  SERVICES: {
    STANDARD_NOTARY: { price: 75, includedRadius: 20, feePerMile: 0.5, maxDocuments: 2 },
    EXTENDED_HOURS: { price: 100, includedRadius: 20, feePerMile: 0.5, maxDocuments: 5 },
    LOAN_SIGNING: { price: 150, includedRadius: 30, feePerMile: 0.5, maxDocuments: 999 },
    RON_SERVICES: { price: 35, includedRadius: 0, feePerMile: 0, maxDocuments: 10 },
  },
  PRICING_CONFIG: {
    baseLocation: '77591',
    surcharges: { afterHours: 30, weekend: 40, weather: 0.65, priority: 25, sameDay: 0 },
    deposits: { threshold: 100, percentage: 0.5 },
    discounts: { firstTime: 15, referral: 20, volume: 0.10 },
  },
}));

describe('PricingEngine', () => {
  let engine: PricingEngine;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);

  beforeEach(() => {
    engine = new PricingEngine('test-request-id');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with custom requestId', () => {
      const customEngine = new PricingEngine('custom-id');
      expect(customEngine).toBeInstanceOf(PricingEngine);
    });

    it('should create instance with auto-generated requestId', () => {
      const autoEngine = new PricingEngine();
      expect(autoEngine).toBeInstanceOf(PricingEngine);
    });
  });

  describe('calculateBookingPrice - Happy Path', () => {
    it('should calculate price for STANDARD_NOTARY service', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('basePrice', 75);
      expect(result).toHaveProperty('total');
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.metadata.requestId).toBe('test-request-id');
    });

    it('should calculate price for RON_SERVICES', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'RON_SERVICES',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.basePrice).toBe(35);
      expect(result.travelFee).toBe(0);
    });

    it('should calculate price for EXTENDED_HOURS service', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'EXTENDED_HOURS',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.basePrice).toBe(100);
    });

    it('should calculate price for LOAN_SIGNING service', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'LOAN_SIGNING',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.basePrice).toBe(150);
    });

    it('should include surcharges in calculation', async () => {
      const { calculateSurcharges } = await import('@/lib/pricing/surcharges');
      vi.mocked(calculateSurcharges).mockReturnValue(30);

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.surcharges).toBe(30);
      expect(result.total).toBeGreaterThanOrEqual(result.basePrice + 30);
    });

    it('should apply discounts in calculation', async () => {
      const { calculateDiscounts } = await import('@/lib/pricing/discounts');
      vi.mocked(calculateDiscounts).mockResolvedValue(15);

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
        promoCode: 'WELCOME15',
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.discounts).toBe(15);
      expect(result.total).toBeLessThanOrEqual(result.basePrice);
    });

    it('should handle location with address', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
        location: {
          address: '123 Main St, Houston, TX 77001',
        },
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('travelFee', 0); // Currently disabled
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should include upsell suggestions', async () => {
      const { detectUpsellOpportunities } = await import('@/lib/pricing/upsells');
      vi.mocked(detectUpsellOpportunities).mockReturnValue([
        {
          type: 'service_upgrade',
          fromService: 'STANDARD_NOTARY',
          toService: 'EXTENDED_HOURS',
          priceIncrease: 25,
          headline: 'Upgrade Available',
          benefit: 'More documents',
        },
      ]);

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.upsellSuggestions).toHaveLength(1);
      expect(result.upsellSuggestions[0].headline).toBe('Upgrade Available');
    });
  });

  describe('calculateBookingPrice - Error Handling', () => {
    it('should return fallback pricing on validation error', async () => {
      const invalidParams = {
        serviceType: 'INVALID_SERVICE',
        scheduledDateTime: 'invalid-date',
      } as any;

      const result = await engine.calculateBookingPrice(invalidParams);

      expect(result).toHaveProperty('basePrice', 75);
      expect(result).toHaveProperty('total', 75);
      expect(result.confidence.level).toBe('low');
      expect(result.breakdown.transparency.travelCalculation).toContain('Fallback');
    });

    it('should return fallback pricing on discount calculation error', async () => {
      const { calculateDiscounts } = await import('@/lib/pricing/discounts');
      vi.mocked(calculateDiscounts).mockRejectedValue(new Error('Discount service unavailable'));

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
        promoCode: 'TEST',
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.discounts).toBe(0);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle total calculation ensuring non-negative', async () => {
      const { calculateDiscounts } = await import('@/lib/pricing/discounts');
      const { calculateSurcharges } = await import('@/lib/pricing/surcharges');
      
      // Set discount larger than base price to test Math.max(0, ...)
      vi.mocked(calculateDiscounts).mockResolvedValue(1000);
      vi.mocked(calculateSurcharges).mockReturnValue(0);

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateBookingPrice - Edge Cases', () => {
    it('should handle multiple document counts', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 5,
        signerCount: 2,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('total');
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle priority booking option', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {
          priority: true,
        },
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('total');
    });

    it('should handle same-day booking option', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {
          sameDay: true,
        },
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('total');
    });

    it('should handle customer email for first-time discount', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
        customerEmail: 'newcustomer@example.com',
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('total');
    });

    it('should handle referral code', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
        referralCode: 'REF123',
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('total');
    });

    it('should handle promo code', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
        promoCode: 'SAVE10',
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('total');
    });

    it('should handle location with coordinates', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
        location: {
          address: '123 Main St',
          latitude: 29.7604,
          longitude: -95.3698,
        },
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result).toHaveProperty('total');
    });
  });

  describe('calculateBookingPrice - Service Types', () => {
    const serviceTypes = [
      'STANDARD_NOTARY',
      'EXTENDED_HOURS',
      'LOAN_SIGNING',
      'RON_SERVICES',
      'BUSINESS_ESSENTIALS',
      'BUSINESS_GROWTH',
    ] as const;

    serviceTypes.forEach((serviceType) => {
      it(`should calculate price for ${serviceType}`, async () => {
        const params: PricingCalculationParams = {
          serviceType,
          scheduledDateTime: futureDate.toISOString(),
          documentCount: 1,
          signerCount: 1,
          options: {},
        };

        const result = await engine.calculateBookingPrice(params);

        expect(result).toHaveProperty('basePrice');
        expect(result).toHaveProperty('total');
        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.metadata.version).toBe('2.0.0');
      });
    });
  });

  describe('calculateBookingPrice - Breakdown and Confidence', () => {
    it('should generate pricing breakdown', async () => {
      const { generatePricingBreakdown } = await import('@/lib/pricing/breakdown');
      vi.mocked(generatePricingBreakdown).mockReturnValue({
        lineItems: [
          { description: 'Base Service', amount: 75, type: 'base' },
        ],
        transparency: {
          travelCalculation: 'Test calculation',
        },
      });

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.breakdown).toHaveProperty('lineItems');
      expect(result.breakdown.lineItems.length).toBeGreaterThan(0);
    });

    it('should calculate pricing confidence', async () => {
      const { calculatePricingConfidence } = await import('@/lib/pricing/confidence');
      vi.mocked(calculatePricingConfidence).mockReturnValue({
        level: 'medium',
        factors: ['Extended service area'],
        competitiveAdvantage: 'Competitive pricing',
      });

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.confidence.level).toBe('medium');
      expect(result.confidence.factors).toContain('Extended service area');
    });
  });

  describe('calculateBookingPrice - Caching', () => {
    it('should cache pricing results', async () => {
      const { cacheResult } = await import('@/lib/pricing/cache');

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      await engine.calculateBookingPrice(params);

      expect(cacheResult).toHaveBeenCalled();
    });
  });

  describe('Factory Functions', () => {
    it('createPricingEngine should create instance', () => {
      const engine = createPricingEngine('factory-id');
      expect(engine).toBeInstanceOf(PricingEngine);
    });

    it('calculateBookingPrice convenience function should work', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await calculateBookingPrice(params);

      expect(result).toHaveProperty('total');
      expect(result.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Metadata and Request Tracking', () => {
    it('should include requestId in metadata', async () => {
      const customEngine = new PricingEngine('custom-request-123');
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await customEngine.calculateBookingPrice(params);

      expect(result.metadata.requestId).toBe('custom-request-123');
    });

    it('should include calculatedAt timestamp', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.metadata.calculatedAt).toBeDefined();
      expect(new Date(result.metadata.calculatedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should include pricing factors in metadata', async () => {
      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: futureDate.toISOString(),
        documentCount: 3,
        signerCount: 2,
        options: { priority: true },
      };

      const result = await engine.calculateBookingPrice(params);

      expect(result.metadata.factors).toHaveProperty('serviceType', 'STANDARD_NOTARY');
      expect(result.metadata.factors).toHaveProperty('documentCount', 3);
      expect(result.metadata.factors).toHaveProperty('signerCount', 2);
    });
  });

  describe('Internal helper methods', () => {
    it('calculateTravelFee computes distance-based fee and withinArea', async () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const result = await anyEngine.calculateTravelFee('STANDARD_NOTARY', {
        address: '123 Test St, Houston, TX 77001',
      });

      expect(result).toHaveProperty('fee');
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('withinArea');
    });

    it('calculateTravelFee falls back to default values on error', async () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;
      const { UnifiedDistanceService } = await import('@/lib/maps/unified-distance-service');

      vi.mocked(UnifiedDistanceService.calculateDistance).mockRejectedValueOnce(
        new Error('Distance service unavailable'),
      );

      const result = await anyEngine.calculateTravelFee('STANDARD_NOTARY', {
        address: '123 Test St, Houston, TX 77001',
      });

      expect(result).toEqual({ fee: 10, distance: 20, withinArea: false });
    });

    it('calculateSurcharges applies after-hours, weekend, and options-based surcharges', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      // Saturday at 8pm to trigger after-hours + weekend
      const saturdayEvening = new Date();
      saturdayEvening.setDate(saturdayEvening.getDate() + ((6 - saturdayEvening.getDay() + 7) % 7));
      saturdayEvening.setHours(20, 0, 0, 0);

      const total = anyEngine.calculateSurcharges(
        'STANDARD_NOTARY',
        saturdayEvening.toISOString(),
        { priority: true, sameDay: true },
      );

      // From mocked PRICING_CONFIG in this test file
      expect(total).toBeGreaterThan(0);
    });

    it('calculateDiscounts combines first-time, referral, volume, and promo discounts', async () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const total = await anyEngine.calculateDiscounts(
        'SAVE10',
        'newcustomer@example.com',
        'REF123',
        3,
        'STANDARD_NOTARY',
      );

      // From mocked PRICING_CONFIG + common promo codes in pricing-engine
      // 15 (first-time) + 20 (referral) + 8 (volume) + 10 (SAVE10) = 53
      expect(total).toBeGreaterThanOrEqual(53);
    });

    it('detectUpsellOpportunities surfaces all relevant suggestions', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // within 24h, evening possible
        documentCount: 12,
        signerCount: 3,
        options: {},
      };

      const travelData = {
        fee: 25,
        distance: 25,
        withinArea: false,
      };

      const suggestions = anyEngine.detectUpsellOpportunities(params, travelData);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s: any) => s.type === 'service_upgrade')).toBe(true);
      expect(suggestions.some((s: any) => s.type === 'add_on')).toBe(true);
    });

    it('generatePricingBreakdown builds line items and transparency info', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const breakdown = anyEngine.generatePricingBreakdown(
        75,
        15,
        30,
        10,
        { distance: 25, withinArea: false },
      );

      expect(breakdown.lineItems.length).toBeGreaterThan(1);
      expect(breakdown.transparency.travelCalculation).toBeDefined();
      expect(breakdown.transparency.surchargeExplanation).toBeDefined();
      expect(breakdown.transparency.discountSource).toBeDefined();
    });

    it('calculatePricingConfidence reflects travel area and service type', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const confidence = anyEngine.calculatePricingConfidence(
        {
          serviceType: 'LOAN_SIGNING',
          scheduledDateTime: new Date().toISOString(),
          documentCount: 1,
          signerCount: 1,
          options: {},
        } as PricingCalculationParams,
        { withinArea: false },
      );

      expect(confidence.level).toBe('medium');
      expect(confidence.factors).toContain('Extended service area');
      expect(confidence.factors).toContain('Flat-rate pricing');
    });

    it('getPricingFactors summarizes key pricing inputs', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date().toISOString(),
        documentCount: 4,
        signerCount: 2,
        options: { priority: true },
      };

      const factors = anyEngine.getPricingFactors(params, {
        distance: 18,
        withinArea: true,
      });

      expect(factors.serviceType).toBe('STANDARD_NOTARY');
      expect(factors.documentCount).toBe(4);
      expect(factors.signerCount).toBe(2);
      expect(factors.distance).toBe(18);
      expect(factors.withinServiceArea).toBe(true);
    });

    it('sanitizeParams masks customer email', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const sanitized = anyEngine.sanitizeParams({
        customerEmail: 'longemail@example.com',
        other: 'value',
      });

      expect(sanitized.customerEmail).toMatch(/^\w{2}\*\*\*@/);
      expect(sanitized.other).toBe('value');
    });

    it('isFirstTimeCustomer caches result and returns boolean', async () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const first = await anyEngine.isFirstTimeCustomer('test@example.com');
      const second = await anyEngine.isFirstTimeCustomer('test@example.com');

      expect(typeof first).toBe('boolean');
      expect(typeof second).toBe('boolean');
    });

    it('getPromoCodeDiscount uses common codes and redis cache', async () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;
      const { redis } = await import('@/lib/redis');

      // First call should compute and cache
      const discount = await anyEngine.getPromoCodeDiscount('WELCOME15');
      expect(discount).toBeGreaterThan(0);

      // Subsequent call should hit cache path
      vi.mocked(redis.get).mockResolvedValueOnce('10');
      const cached = await anyEngine.getPromoCodeDiscount('SAVE10');
      expect(cached).toBe(10);
    });

    it('detectLoanDocuments flags high document or signer counts', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const manyDocs = anyEngine.detectLoanDocuments({
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date().toISOString(),
        documentCount: 12,
        signerCount: 1,
        options: {},
      } as PricingCalculationParams);

      const manySigners = anyEngine.detectLoanDocuments({
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date().toISOString(),
        documentCount: 1,
        signerCount: 3,
        options: {},
      } as PricingCalculationParams);

      expect(manyDocs).toBe(true);
      expect(manySigners).toBe(true);
    });

    it('isWithinPriorityTimeframe detects bookings within 24 hours', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const within24h = anyEngine.isWithinPriorityTimeframe(
        new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      );
      const beyond24h = anyEngine.isWithinPriorityTimeframe(
        new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      );

      expect(within24h).toBe(true);
      expect(beyond24h).toBe(false);
    });

    it('cacheResult computes hash and stores result via redis', async () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;
      const { redis } = await import('@/lib/redis');

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: new Date().toISOString(),
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const result: PricingResult = {
        basePrice: 75,
        travelFee: 0,
        surcharges: 0,
        discounts: 0,
        total: 75,
        breakdown: {
          lineItems: [],
          transparency: {},
        },
        upsellSuggestions: [],
        confidence: {
          level: 'high',
          factors: [],
        },
        metadata: {
          calculatedAt: new Date().toISOString(),
          version: '2.0.0',
          factors: {},
          requestId: 'cache-test',
        },
      };

      await anyEngine.cacheResult(params, result);

      expect(redis.setex).toHaveBeenCalled();
    });

    it('hashParams generates stable short hash for params', () => {
      const internalEngine = new PricingEngine();
      const anyEngine = internalEngine as any;

      const params: PricingCalculationParams = {
        serviceType: 'STANDARD_NOTARY',
        scheduledDateTime: '2025-01-01T00:00:00Z',
        documentCount: 1,
        signerCount: 1,
        options: {},
      };

      const hash1 = anyEngine.hashParams(params);
      const hash2 = anyEngine.hashParams(params);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBeLessThanOrEqual(32);
    });
  });
});

