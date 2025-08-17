import { describe, it, expect, vi } from 'vitest'
// Updated imports to new pricing engine and distance helpers
import { UnifiedPricingEngine } from '@/lib/pricing/unified-pricing-engine'
import { distanceHelper } from '@/lib/maps/distance'

// Mock distance calculations so tests are deterministic
vi.mock('@/lib/maps/distance', () => ({
  distanceHelper: {
    calculateDistance: vi.fn(),
  }
}))

// Helper to call the new engine
const calculate = (payload: any) => UnifiedPricingEngine.calculateTransparentPricing({
  serviceType: payload.serviceType,
  documentCount: payload.documentCount ?? 1,
  signerCount: payload.signerCount ?? 1,
  address: payload.location?.address,
  scheduledDateTime: payload.scheduledDateTime,
  customerType: 'new',
})

describe('UnifiedPricingEngine – surcharges & travel edge cases', () => {
  it('adds time-based surcharges (same-day at minimum)', async () => {
    // Distance inside free radius (10 mi)
    vi.mocked((distanceHelper as any).calculateDistance).mockResolvedValue({
      success: true,
      distance: { miles: 10, kilometers: 16, text: '10 mi' },
      duration: { minutes: 20 },
    } as any)

    const scheduled = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // within 24h -> same-day surcharge
    const result = await calculate({
      serviceType: 'EXTENDED_HOURS',
      location: { address: 'Somewhere' },
      scheduledDateTime: scheduled,
      documentCount: 1,
      signerCount: 1,
    } as any)

    const totalSurcharges = result.breakdown.timeBasedSurcharges.reduce((s, x) => s + x.amount, 0)
    expect(totalSurcharges).toBeGreaterThan(0)
  })

  it('charges no travel fee when exactly at included radius (20 miles standard)', async () => {
    vi.mocked((distanceHelper as any).calculateDistance).mockResolvedValue({
      success: true,
      distance: { miles: 20, kilometers: 32, text: '20 mi' },
      duration: { minutes: 25 },
    } as any)

    const result = await calculate({
      serviceType: 'STANDARD_NOTARY',
      location: { address: 'Edge' },
      scheduledDateTime: '2030-01-02T12:00:00Z',
      documentCount: 1,
      signerCount: 1,
    } as any)

    expect(result.breakdown.travelFee?.amount ?? 0).toBe(0)
  })
}) 
