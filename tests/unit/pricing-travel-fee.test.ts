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

describe('UnifiedPricingEngine – travel fee behavior (disabled)', () => {
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

  it('travel fee calculation is disabled - no travel fee component in breakdown', async () => {
    const result = await UnifiedPricingEngine.calculateTransparentPricing({
      serviceType: 'STANDARD_NOTARY',
      address: 'Far St',
      scheduledDateTime: '2025-07-15T16:00:00Z',
      documentCount: 1,
      signerCount: 1,
      customerType: 'new',
    } as any)

    // Travel fee calculation is temporarily disabled in unified engine
    expect(result.breakdown.travelFee).toBeUndefined()
    expect(result.totalPrice).toBeGreaterThan(0)
  })
}) 