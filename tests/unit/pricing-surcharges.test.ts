import { describe, it, expect, vi } from 'vitest'
import { PricingEngine, SERVICES } from '@/lib/pricing-engine'
import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service'

// Mock distance calculations so tests are deterministic
vi.mock('@/lib/maps/unified-distance-service', () => ({
  UnifiedDistanceService: {
    calculateDistance: vi.fn()
  }
}))

const engine = new PricingEngine('test_surcharges')

describe('PricingEngine – surcharges & travel edge cases', () => {
  it('adds after-hours + weekend surcharges', async () => {
    // Distance inside free radius (10 mi)
    vi.mocked(UnifiedDistanceService.calculateDistance).mockResolvedValue({
      success: true,
      distance: { miles: 10, kilometers: 16, text: '10 mi' },
      duration: { minutes: 20 },
    } as any)

    const scheduled = '2030-01-06T04:00:00Z' // Sunday 4 AM UTC – weekend & after-hours
    const result = await engine.calculateBookingPrice({
      serviceType: 'STANDARD_NOTARY',
      location: { address: 'Somewhere' },
      scheduledDateTime: scheduled,
      documentCount: 1,
      signerCount: 1,
      options: {}
    } as any)

    const expectedSurcharges = 30 + 40 // afterHours + weekend = 70
    expect(result.surcharges).toBe(expectedSurcharges)
    expect(result.travelFee).toBe(0) // within 30-mile radius
    expect(result.total).toBe(result.basePrice + 70)
  })

  it('charges no travel fee when exactly at included radius (30 mi)', async () => {
    vi.mocked(UnifiedDistanceService.calculateDistance).mockResolvedValue({
      success: true,
      distance: { miles: 30, kilometers: 48, text: '30 mi' },
      duration: { minutes: 35 },
    } as any)

    const result = await engine.calculateBookingPrice({
      serviceType: 'STANDARD_NOTARY',
      location: { address: 'Edge' },
      scheduledDateTime: '2030-01-02T12:00:00Z',
      documentCount: 1,
      signerCount: 1,
      options: {}
    } as any)

    expect(result.travelFee).toBe(0)
  })
}) 