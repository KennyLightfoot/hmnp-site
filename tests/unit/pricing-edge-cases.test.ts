/**
 * Pricing Engine Edge Cases Unit Tests
 * Houston Mobile Notary Pros
 * 
 * Tests edge cases, boundary conditions, and error scenarios
 * for the pricing engine and business rules.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PricingEngine } from '@/lib/pricing/pricing-engine';
import { BusinessRulesEngine } from '@/lib/business-rules/business-rules-engine';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findUnique: vi.fn(),
      findMany: vi.fn()
    },
    businessSettings: {
      findMany: vi.fn()
    },
    promoCode: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock('@/lib/maps/distance', () => ({
  calculateDistance: vi.fn()
}));

describe('Pricing Engine Edge Cases', () => {
  let pricingEngine: PricingEngine;
  let businessRulesEngine: BusinessRulesEngine;

  beforeEach(() => {
    pricingEngine = new PricingEngine();
    businessRulesEngine = new BusinessRulesEngine();
    vi.clearAllMocks();
  });

  describe('Boundary Value Testing', () => {
    it('should handle minimum pricing values', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 0,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.basePrice).toBeGreaterThan(0);
      expect(result.totalPrice).toBeGreaterThan(0);
      expect(result.travelFee).toBe(0); // No travel fee for 0 distance
    });

    it('should handle maximum service area distance (60 miles)', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 60,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(true);
      expect(result.travelFee).toBeGreaterThan(0);
      expect(result.totalPrice).toBeGreaterThan(result.basePrice);
    });

    it('should reject requests beyond maximum service area (60+ miles)', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 61,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Distance exceeds maximum service area');
    });

    it('should handle maximum document count (20)', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 20,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(true);
      expect(result.documentFee).toBeGreaterThan(0);
      expect(result.totalPrice).toBeGreaterThan(result.basePrice);
    });

    it('should reject requests with too many documents (20+)', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 21,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Document count exceeds maximum limit');
    });

    it('should handle maximum signer count (20)', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 20,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(true);
      expect(result.signerFee).toBeGreaterThan(0);
    });

    it('should reject requests with too many signers (20+)', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 21,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Signer count exceeds maximum limit');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid service type', async () => {
      const request = {
        serviceType: 'INVALID_SERVICE',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid service type');
    });

    it('should handle negative values gracefully', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: -1,
        signerCount: -1,
        distance: -10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Document count must be positive');
      expect(result.errors).toContain('Signer count must be positive');
      expect(result.errors).toContain('Distance cannot be negative');
    });

    it('should handle zero values appropriately', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 0,
        signerCount: 0,
        distance: 0,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Document count must be at least 1');
      expect(result.errors).toContain('Signer count must be at least 1');
    });

    it('should handle invalid date formats', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: 'invalid-date'
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid scheduled date');
    });

    it('should handle past dates', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: pastDate.toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Scheduled date cannot be in the past');
    });

    it('should handle database connection errors', async () => {
      const mockPrisma = await import('@/lib/prisma');
      vi.mocked(mockPrisma.prisma.service.findUnique).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Service temporarily unavailable');
    });
  });

  describe('Complex Pricing Scenarios', () => {
    it('should calculate correct pricing for maximum complexity scenario', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 20, // Maximum documents
        signerCount: 20,   // Maximum signers
        distance: 59,      // Near maximum distance
        isUrgent: true,    // Urgent surcharge
        scheduledDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        promoCode: 'INVALID_PROMO' // Invalid promo code
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(true);
      expect(result.basePrice).toBe(75); // Standard base price
      expect(result.documentFee).toBeGreaterThan(0); // 19 extra documents
      expect(result.signerFee).toBeGreaterThan(0); // 19 extra signers
      expect(result.travelFee).toBeGreaterThan(0); // Travel fee for 59 miles
      expect(result.urgentFee).toBeGreaterThan(0); // Urgent surcharge
      expect(result.totalPrice).toBeGreaterThan(result.basePrice);
      expect(result.promoCodeApplied).toBe(false); // Invalid promo code
    });

    it('should handle RON service pricing correctly', async () => {
      const request = {
        serviceType: 'RON_SERVICES',
        documentCount: 1,
        signerCount: 1,
        distance: 0, // No travel for RON
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(true);
      expect(result.basePrice).toBe(35); // RON base price
      expect(result.travelFee).toBe(0); // No travel fee for RON
      expect(result.totalPrice).toBe(35);
    });

    it('should apply valid promo code correctly', async () => {
      const mockPrisma = await import('@/lib/prisma');
      vi.mocked(mockPrisma.prisma.promoCode.findUnique).mockResolvedValue({
        id: 'promo-1',
        code: 'SAVE10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usageCount: 5,
        minOrderAmount: 0,
        maxDiscountAmount: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString(),
        promoCode: 'SAVE10'
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(true);
      expect(result.promoCodeApplied).toBe(true);
      expect(result.discountAmount).toBeGreaterThan(0);
      expect(result.totalPrice).toBeLessThan(result.basePrice + result.travelFee);
    });

    it('should handle expired promo code', async () => {
      const mockPrisma = await import('@/lib/prisma');
      vi.mocked(mockPrisma.prisma.promoCode.findUnique).mockResolvedValue({
        id: 'promo-1',
        code: 'EXPIRED',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        validFrom: new Date(Date.now() - 48 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
        usageLimit: 100,
        usageCount: 5,
        minOrderAmount: 0,
        maxDiscountAmount: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString(),
        promoCode: 'EXPIRED'
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(true);
      expect(result.promoCodeApplied).toBe(false);
      expect(result.discountAmount).toBe(0);
      expect(result.warnings).toContain('Promo code has expired');
    });

    it('should handle promo code usage limit exceeded', async () => {
      const mockPrisma = await import('@/lib/prisma');
      vi.mocked(mockPrisma.prisma.promoCode.findUnique).mockResolvedValue({
        id: 'promo-1',
        code: 'MAXED',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        usageLimit: 10,
        usageCount: 10, // At limit
        minOrderAmount: 0,
        maxDiscountAmount: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString(),
        promoCode: 'MAXED'
      };

      const result = await pricingEngine.calculatePrice(request);
      
      expect(result.success).toBe(true);
      expect(result.promoCodeApplied).toBe(false);
      expect(result.discountAmount).toBe(0);
      expect(result.warnings).toContain('Promo code usage limit exceeded');
    });
  });

  describe('Business Rules Integration', () => {
    it('should enforce document limits for different service types', async () => {
      // Test HELOC restriction
      const helocRequest = {
        serviceType: 'LOAN_SIGNING',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString(),
        documentTypes: ['HELOC']
      };

      const result = await businessRulesEngine.validateBookingRequest(helocRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('HELOC documents require special handling');
    });

    it('should apply service area restrictions correctly', async () => {
      const distantRequest = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 65, // Beyond 60-mile limit
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      };

      const result = await businessRulesEngine.validateBookingRequest(distantRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Distance exceeds maximum service area');
    });

    it('should handle time-based restrictions', async () => {
      const lateNightRequest = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 1,
        signerCount: 1,
        distance: 10,
        isUrgent: false,
        scheduledDateTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour from now
        requestedTime: '23:00' // 11 PM
      };

      const result = await businessRulesEngine.validateBookingRequest(lateNightRequest);
      
      // Should be valid but with additional fees
      expect(result.isValid).toBe(true);
      expect(result.ghlActions.tags).toContain('booking_time:after_hours');
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle concurrent pricing requests', async () => {
      const requests = Array(10).fill(null).map((_, i) => ({
        serviceType: 'STANDARD_NOTARY',
        documentCount: i + 1,
        signerCount: 1,
        distance: i * 5,
        isUrgent: false,
        scheduledDateTime: new Date().toISOString()
      }));

      const results = await Promise.all(
        requests.map(req => pricingEngine.calculatePrice(req))
      );

      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.totalPrice).toBeGreaterThan(0);
        expect(result.documentFee).toBe(i * 5); // $5 per extra document
      });
    });

    it('should handle memory-intensive calculations', async () => {
      const largeRequest = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 20,
        signerCount: 20,
        distance: 59,
        isUrgent: true,
        scheduledDateTime: new Date().toISOString(),
        additionalServices: Array(100).fill('WITNESS'), // Large array
        metadata: {
          largeData: 'x'.repeat(10000) // Large string
        }
      };

      const startTime = Date.now();
      const result = await pricingEngine.calculatePrice(largeRequest);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
}); 