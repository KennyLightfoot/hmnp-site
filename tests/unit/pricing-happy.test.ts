import { describe, it, expect, vi } from 'vitest'
import { UnifiedPricingEngine } from '@/lib/pricing/unified-pricing-engine'
import { distanceHelper } from '@/lib/maps/distance'

// Helper to build mock result
const buildResult = (miles: number, fee: number, serviceType = 'STANDARD_NOTARY') => ({
  success: true,
  distance: { miles, kilometers: miles * 1.609, text: `${miles} mi` },
  duration: { minutes: 20, seconds: 1200, text: '20 mins' },
  travelFee: fee,
  isWithinServiceArea: miles <= 20,
  serviceArea: {},
  warnings: [],
  recommendations: [],
  metadata: { calculatedAt: new Date().toISOString(), apiSource: 'google_maps' as const, requestId: 'mock', serviceType }
})

vi.mock('@/lib/maps/distance', () => ({
  distanceHelper: {
    calculateDistance: vi.fn()
  }
}))

// Set a default mock value for general tests
vi.mocked((distanceHelper as any).calculateDistance).mockResolvedValue(buildResult(10, 0) as any)

describe('UnifiedPricingEngine – happy path', () => {

  it('calculates base price without travel fee inside 30-mile radius', async () => {
    const result = await UnifiedPricingEngine.calculateTransparentPricing({
      serviceType: 'STANDARD_NOTARY',
      scheduledDateTime: '2025-07-15T16:00:00-05:00',
      documentCount: 1,
      signerCount: 1,
      customerType: 'new',
    } as any)

    expect(result.totalPrice).toBeGreaterThan(0)
    expect(result.breakdown.travelFee).toBeUndefined()
  })

  it('adds travel fee beyond 30-mile radius', async () => {
    const miles = 45
    vi.mocked((distanceHelper as any).calculateDistance).mockResolvedValueOnce(buildResult(miles, 0) as any)

    const result = await UnifiedPricingEngine.calculateTransparentPricing({
      serviceType: 'STANDARD_NOTARY',
      address: 'Far St',
      scheduledDateTime: '2025-07-15T16:00:00-05:00',
      documentCount: 1,
      signerCount: 1,
      customerType: 'new',
    } as any)

    expect(result.breakdown.travelFee).toBeUndefined()
    expect(result.totalPrice).toBeGreaterThan(0)
  })
}) 