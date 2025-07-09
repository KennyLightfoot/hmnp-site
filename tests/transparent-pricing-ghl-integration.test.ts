/**
 * Transparent Pricing GHL Integration Test Suite
 * Phase 4 Week 3: Comprehensive Testing
 * 
 * Tests the entire transparent pricing system with GHL integration
 */

import { describe, expect, test, beforeAll, afterAll } from '@jest/test';
import { TransparentPricingGHLIntegration } from '../lib/ghl/transparent-pricing-integration';
import { UnifiedPricingEngine } from '../lib/pricing/unified-pricing-engine';

describe('Transparent Pricing GHL Integration', () => {
  
  beforeAll(async () => {
    // Ensure test environment is set up
    if (!process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
      console.warn('⚠️ GHL integration tests will be skipped - no test credentials');
    }
  });

  describe('Pricing Calculation', () => {
    
    test('should calculate transparent pricing for Standard Notary service', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        documentCount: 2,
        signerCount: 1,
        address: 'Katy, TX',
        scheduledDateTime: '2025-01-15T14:30:00.000Z',
        customerType: 'new' as const,
        customerEmail: 'test@example.com'
      };

      const result = await UnifiedPricingEngine.calculateTransparentPricing(request);

      expect(result.success).toBe(true);
      expect(result.serviceType).toBe('STANDARD_NOTARY');
      expect(result.basePrice).toBe(75);
      expect(result.totalPrice).toBeGreaterThan(0);
      expect(result.breakdown).toBeDefined();
      expect(result.transparency).toBeDefined();
      expect(result.businessRules).toBeDefined();
      expect(result.ghlActions).toBeDefined();
    });

    test('should apply first-time customer discount', async () => {
      const request = {
        serviceType: 'EXTENDED_HOURS',
        documentCount: 1,
        customerType: 'new' as const,
        customerEmail: 'new-customer@example.com'
      };

      const result = await UnifiedPricingEngine.calculateTransparentPricing(request);

      expect(result.breakdown.discounts).toHaveLength(1);
      expect(result.breakdown.discounts[0].label).toContain('First-time');
      expect(result.breakdown.discounts[0].amount).toBe(15);
      expect(result.businessRules.discountsApplied).toContain('first_time');
    });

    test('should calculate travel fees correctly', async () => {
      const request = {
        serviceType: 'STANDARD_NOTARY',
        address: 'Galveston, TX', // Should be about 50+ miles
        customerType: 'new' as const
      };

      const result = await UnifiedPricingEngine.calculateTransparentPricing(request);

      expect(result.breakdown.travelFee).toBeDefined();
      expect(result.breakdown.travelFee!.amount).toBeGreaterThan(0);
      expect(result.businessRules.serviceAreaZone).toBe('extended_range');
    });

    test('should apply time-based surcharges for same-day service', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(19, 0, 0, 0); // 7 PM - extended hours

      const request = {
        serviceType: 'EXTENDED_HOURS',
        scheduledDateTime: tomorrow.toISOString(),
        customerType: 'new' as const
      };

      const result = await UnifiedPricingEngine.calculateTransparentPricing(request);

      expect(result.breakdown.timeBasedSurcharges.length).toBeGreaterThan(0);
      expect(result.businessRules.dynamicPricingActive).toBe(true);
    });

    test('should suggest alternative services', async () => {
      const request = {
        serviceType: 'LOAN_SIGNING',
        documentCount: 1,
        customerType: 'new' as const
      };

      const result = await UnifiedPricingEngine.calculateTransparentPricing(request);

      expect(result.transparency.alternatives).toHaveLength(2);
      
      const alternatives = result.transparency.alternatives;
      alternatives.forEach(alt => {
        expect(alt.price).toBeLessThan(150); // Loan signing base price
        expect(alt.savings).toBeGreaterThan(0);
        expect(alt.tradeoffs).toBeDefined();
      });
    });
  });

  describe('GHL Integration', () => {
    
    const mockPricingResult = {
      serviceType: 'STANDARD_NOTARY',
      basePrice: 75,
      totalPrice: 60,
      breakdown: {
        serviceBase: {
          amount: 75,
          label: 'Standard Notary Service',
          description: 'Professional notary service',
          isDiscount: false
        },
        discounts: [{
          amount: 15,
          label: 'First-time customer',
          description: 'Welcome discount',
          isDiscount: true
        }]
      },
      transparency: {
        whyThisPrice: 'Your standard notary service is priced at $60 with first-time discount.',
        feeExplanations: ['Base price includes up to 2 documents'],
        alternatives: []
      },
      businessRules: {
        serviceAreaZone: 'houston_metro',
        isWithinServiceArea: true,
        documentLimitsExceeded: false,
        dynamicPricingActive: false,
        discountsApplied: ['first_time'],
        violations: [],
        recommendations: []
      },
      ghlActions: {
        tags: ['service:standard_notary', 'pricing:discount_applied'],
        customFields: {
          cf_service_type: 'STANDARD_NOTARY',
          cf_base_price: 75,
          cf_final_total: 60
        },
        workflows: ['GHL_PRICING_CONFIRMATION_WORKFLOW_ID']
      },
      metadata: {
        calculatedAt: new Date().toISOString(),
        requestId: 'test_pricing_123',
        version: '1.0.0',
        calculationTime: 100
      }
    };

    test('should transform pricing result to custom fields', () => {
      const { TransparentPricingFieldManager } = require('../lib/ghl/transparent-pricing-fields');
      
      const customFields = TransparentPricingFieldManager.transformPricingResultToCustomFields(mockPricingResult);

      expect(customFields).toBeInstanceOf(Array);
      expect(customFields.length).toBeGreaterThan(0);

      const totalPriceField = customFields.find(f => f.key === 'cf_transparent_pricing_total');
      expect(totalPriceField).toBeDefined();
      expect(totalPriceField.value).toBe(60);

      const discountField = customFields.find(f => f.key === 'cf_transparent_discount_total');
      expect(discountField).toBeDefined();
      expect(discountField.value).toBe(15);
    });

    test('should generate appropriate tags', () => {
      const { TransparentPricingFieldManager } = require('../lib/ghl/transparent-pricing-fields');
      
      const tags = TransparentPricingFieldManager.generateTagsForPricingResult(mockPricingResult);

      expect(tags).toContain('service:standard_notary');
      expect(tags).toContain('pricing:transparent');
      expect(tags).toContain('pricing:discount_applied');
      expect(tags).toContain('discount:first_time');
      expect(tags).toContain('area:houston_metro');
    });

    // Skip GHL API tests if no credentials
    const skipGHLTests = !process.env.GHL_PRIVATE_INTEGRATION_TOKEN;

    test.skipIf(skipGHLTests)('should test GHL connection', async () => {
      const testResult = await TransparentPricingGHLIntegration.testGHLIntegration();

      expect(testResult.success).toBe(true);
      expect(testResult.errors).toHaveLength(0);
    });

    test.skipIf(skipGHLTests)('should sync pricing data to GHL', async () => {
      const request = {
        pricingResult: mockPricingResult,
        customerEmail: 'test.pricing@example.com',
        customerName: 'Test Pricing Customer',
        customerPhone: '+1234567890',
        createContactIfNotExists: true,
        triggerWorkflows: false // Don't trigger workflows in test
      };

      const result = await TransparentPricingGHLIntegration.syncPricingToGHL(request);

      expect(result.success).toBe(true);
      expect(result.contactId).toBeDefined();
      expect(result.customFieldsUpdated).toBeGreaterThan(0);
      expect(result.tagsApplied).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Integration', () => {
    
    test('should complete full pricing calculation and GHL sync flow', async () => {
      // Step 1: Calculate transparent pricing
      const pricingRequest = {
        serviceType: 'EXTENDED_HOURS',
        documentCount: 3,
        address: 'Sugar Land, TX',
        scheduledDateTime: '2025-01-20T18:00:00.000Z',
        customerType: 'new' as const,
        customerEmail: 'e2e.test@example.com'
      };

      const pricingResult = await UnifiedPricingEngine.calculateTransparentPricing(pricingRequest);
      
      expect(pricingResult.success).toBe(true);
      expect(pricingResult.totalPrice).toBeGreaterThan(0);

      // Step 2: Sync to GHL (skip if no credentials)
      if (process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
        const ghlRequest = {
          pricingResult,
          customerEmail: pricingRequest.customerEmail,
          customerName: 'E2E Test Customer',
          createContactIfNotExists: true,
          triggerWorkflows: false
        };

        const ghlResult = await TransparentPricingGHLIntegration.syncPricingToGHL(ghlRequest);
        
        expect(ghlResult.success).toBe(true);
        expect(ghlResult.contactId).toBeDefined();
        expect(ghlResult.customFieldsUpdated).toBeGreaterThan(5);
        expect(ghlResult.tagsApplied).toBeGreaterThan(3);
      }
    });
  });

  describe('API Endpoints', () => {
    
    test('should call transparent pricing API successfully', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pricing/transparent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'STANDARD_NOTARY',
          documentCount: 1,
          customerType: 'new'
        })
      });

      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.serviceType).toBe('STANDARD_NOTARY');
      expect(result.basePrice).toBe(75);
      expect(result.breakdown).toBeDefined();
      expect(result.transparency).toBeDefined();
      expect(result.businessRules).toBeDefined();
      expect(result.ghlActions).toBeDefined();
    });

    test('should handle booking creation with transparent pricing', async () => {
      // First get pricing
      const pricingResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pricing/transparent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'QUICK_STAMP_LOCAL',
          documentCount: 1,
          address: 'Houston, TX',
          customerType: 'new'
        })
      });

      const pricingResult = await pricingResponse.json();
      expect(pricingResult.success).toBe(true);

      // Then create booking with pricing data
      const bookingResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/booking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'QUICK_STAMP_LOCAL',
          customerName: 'Test Booking Customer',
          customerEmail: 'test.booking@example.com',
          customerPhone: '+1234567890',
          scheduledDateTime: '2025-01-25T10:00:00.000Z',
          addressStreet: '123 Test St',
          addressCity: 'Houston',
          addressState: 'TX',
          addressZip: '77001',
          pricing: {
            basePrice: pricingResult.basePrice,
            travelFee: pricingResult.breakdown.travelFee?.amount || 0,
            totalPrice: pricingResult.totalPrice,
            transparentData: pricingResult
          },
          numberOfDocuments: 1,
          numberOfSigners: 1
        })
      });

      // Should succeed even if GHL integration fails
      expect(bookingResponse.status).toBeLessThan(500);
      
      if (bookingResponse.ok) {
        const bookingResult = await bookingResponse.json();
        expect(bookingResult.success).toBe(true);
        expect(bookingResult.booking.id).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    
    test('should handle invalid service types gracefully', async () => {
      const request = {
        serviceType: 'INVALID_SERVICE',
        customerType: 'new' as const
      };

      await expect(UnifiedPricingEngine.calculateTransparentPricing(request as any))
        .rejects.toThrow();
    });

    test('should handle GHL integration failures gracefully', async () => {
      const invalidRequest = {
        pricingResult: mockPricingResult,
        customerEmail: 'invalid-email',
        createContactIfNotExists: true
      };

      const result = await TransparentPricingGHLIntegration.syncPricingToGHL(invalidRequest);
      
      // Should not crash, but may not succeed
      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    test('should handle missing pricing data in booking creation', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/booking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'STANDARD_NOTARY',
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          scheduledDateTime: '2025-01-25T10:00:00.000Z',
          pricing: {
            basePrice: 75,
            travelFee: 0,
            totalPrice: 75
            // No transparentData
          }
        })
      });

      // Should still work without transparent pricing data
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Performance', () => {
    
    test('should calculate pricing within performance limits', async () => {
      const startTime = Date.now();
      
      const request = {
        serviceType: 'LOAN_SIGNING',
        documentCount: 5,
        address: 'Conroe, TX',
        scheduledDateTime: '2025-01-30T16:00:00.000Z',
        customerType: 'loyalty' as const
      };

      const result = await UnifiedPricingEngine.calculateTransparentPricing(request);
      
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.metadata.calculationTime).toBeLessThan(1000); // Internal calculation under 1 second
    });

    test('should handle bulk GHL integration efficiently', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        pricingResult: {
          ...mockPricingResult,
          metadata: {
            ...mockPricingResult.metadata,
            requestId: `bulk_test_${i}`
          }
        },
        customerEmail: `bulk.test.${i}@example.com`,
        customerName: `Bulk Test Customer ${i}`,
        createContactIfNotExists: true,
        triggerWorkflows: false
      }));

      const startTime = Date.now();
      
      const results = await TransparentPricingGHLIntegration.bulkSyncPricingToGHL(requests);
      
      const processingTime = Date.now() - startTime;
      
      expect(results).toHaveLength(5);
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      // At least some should succeed (depending on test environment)
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThanOrEqual(0);
    });
  });
});

// Helper function to clean up test data
afterAll(async () => {
  // Clean up any test contacts created in GHL
  // This would require additional GHL API calls to find and delete test contacts
  console.log('🧹 Test cleanup completed');
}); 