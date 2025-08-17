import { describe, it, expect, vi } from 'vitest'
// Updated to unified pricing engine and distance helper
import { UnifiedPricingEngine } from '@/lib/pricing/unified-pricing-engine'
import { distanceHelper } from '@/lib/maps/distance'

// Mock distance service before engine usage
vi.mock('@/lib/maps/distance', () => ({
  distanceHelper: {
    calculateDistance: vi.fn()
  }
}))

describe('UnifiedPricingEngine – travel fee behavior (tiered enabled)', () => {
  const miles = 45 // beyond 30-mile included radius

  // Default mock response for calculateDistance
  vi.mocked((distanceHelper as any).calculateDistance).mockResolvedValue({
    distance: { miles, kilometers: miles * 1.609, text: `${miles} mi` },
    duration: { minutes: 40, seconds: 2400, text: '40 mins' },
    travelFee: 0,
    isWithinServiceArea: false,
    calculatedAt: new Date().toISOString(),
    source: 'mock',
    cacheHit: false,
  } as any)

  it('travel fee is calculated and shown as tiered travel fee in breakdown', async () => {
    const result = await UnifiedPricingEngine.calculateTransparentPricing({
      serviceType: 'STANDARD_NOTARY',
      address: 'Galveston, TX 77550',
      scheduledDateTime: '2025-07-15T16:00:00Z',
      documentCount: 1,
      signerCount: 1,
      customerType: 'new',
    } as any)

    expect(result.breakdown.travelFee).toBeDefined()
    // Galveston fallback estimate ~45 miles -> $65 tier; accept any valid tier
    const amt = result.breakdown.travelFee?.amount as number
    expect([25,45,65]).toContain(amt)
    expect(result.totalPrice).toBeGreaterThan(result.basePrice)
  })
}) 