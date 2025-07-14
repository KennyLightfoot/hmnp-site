import { describe, it, expect, vi } from 'vitest'
import { PricingEngine } from '@/lib/pricing-engine'
import { SERVICES } from '@/lib/pricing-engine'

import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service'

// Helper to build mock result
const buildResult = (miles: number, fee: number, serviceType = 'STANDARD_NOTARY') => ({
  success: true,
  distance: { miles, kilometers: miles * 1.609, text: `${miles} mi` },
  duration: { minutes: 20, seconds: 1200, text: '20 mins' },
  travelFee: fee,
  isWithinServiceArea: miles <= SERVICES[serviceType as keyof typeof SERVICES].includedRadius,
  serviceArea: {
    isWithinStandardArea: miles <= SERVICES.STANDARD_NOTARY.includedRadius,
    isWithinExtendedArea: miles <= SERVICES.EXTENDED_HOURS.includedRadius,
    isWithinMaxArea: true,
    applicableRadius: SERVICES.STANDARD_NOTARY.includedRadius
  },
  warnings: [],
  recommendations: [],
  metadata: { calculatedAt: new Date().toISOString(), apiSource: 'google_maps' as const, requestId: 'mock', serviceType }
})

vi.mock('@/lib/maps/unified-distance-service', () => ({
  UnifiedDistanceService: {
    calculateDistance: vi.fn()
  }
}))

// Set a default mock value for general tests
vi.mocked(UnifiedDistanceService.calculateDistance).mockResolvedValue(buildResult(10, 0))

describe('PricingEngine – happy path', () => {
  const engine = new PricingEngine('happy')

  it('calculates base price without travel fee inside 30-mile radius', async () => {
    const result = await engine.calculateBookingPrice({
      serviceType: 'STANDARD_NOTARY',
      scheduledDateTime: new Date().toISOString(),
      documentCount: 1,
      signerCount: 1,
      options: { priority: false, weatherAlert: false, sameDay: false }
    } as any)

    expect(result.total).toBe(SERVICES.STANDARD_NOTARY.price)
    expect(result.travelFee).toBe(0)
  })

  it('adds travel fee beyond 30-mile radius', async () => {
    const miles = 45
    const fee = (miles - SERVICES.STANDARD_NOTARY.includedRadius) * SERVICES.STANDARD_NOTARY.feePerMile

    vi.mocked(UnifiedDistanceService.calculateDistance).mockResolvedValueOnce(buildResult(miles, fee))

    const result = await engine.calculateBookingPrice({
      serviceType: 'STANDARD_NOTARY',
      location: { address: 'Far St' },
      scheduledDateTime: new Date().toISOString(),
      documentCount: 1,
      signerCount: 1,
      options: { priority: false, weatherAlert: false, sameDay: false }
    } as any)

    expect(result.travelFee).toBe(fee)
    expect(result.total).toBe(SERVICES.STANDARD_NOTARY.price + fee)
  })
}) 