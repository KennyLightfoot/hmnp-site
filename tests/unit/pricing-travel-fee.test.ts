import { describe, it, expect, vi } from 'vitest'
import { PricingEngine, SERVICES } from '@/lib/pricing-engine'
import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service'

// Mock distance service before engine import usage
vi.mock('@/lib/maps/unified-distance-service', () => ({
  UnifiedDistanceService: {
    calculateDistance: vi.fn()
  }
}))

describe('PricingEngine – travel fee edge cases', () => {
  const miles = 45 // beyond 30-mile included radius
  const fee = (miles - SERVICES.STANDARD_NOTARY.includedRadius) * SERVICES.STANDARD_NOTARY.feePerMile

  // Default mock response for calculateDistance
  vi.mocked(UnifiedDistanceService.calculateDistance).mockResolvedValue({
    success: true,
    distance: { miles, kilometers: miles * 1.609, text: `${miles} mi` },
    duration: { minutes: 40, seconds: 2400, text: '40 mins' },
    travelFee: fee,
    isWithinServiceArea: false,
    serviceArea: {},
    warnings: [],
    recommendations: [],
    metadata: { calculatedAt: new Date().toISOString(), apiSource: 'mock' as const }
  } as any)

  it('travel fee calculation is disabled - returns 0 fee', async () => {
    const engine = new PricingEngine('travel-fee')

    const result = await engine.calculateBookingPrice({
      serviceType: 'STANDARD_NOTARY',
      location: { address: 'Far St' },
      scheduledDateTime: '2025-07-15T16:00:00Z', // valid ISO – avoids Zod error
      documentCount: 1,
      signerCount: 1,
      options: { priority: false, weatherAlert: false, sameDay: false }
    } as any)

    // Travel fee calculation is temporarily disabled
    expect(result.travelFee).toBe(0)
    expect(result.total).toBe(SERVICES.STANDARD_NOTARY.price)
  })
}) 