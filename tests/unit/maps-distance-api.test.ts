import { describe, it, expect, vi } from 'vitest'
import { GET } from '@/app/api/maps/distance/route'
import { NextRequest } from 'next/server'

// Mock distance helper
vi.mock('@/lib/maps/distance', () => ({
  calculateDistanceWithCache: vi.fn().mockResolvedValue({
    distance: { miles: 12, kilometers: 19.3, text: '12 mi' },
    duration: { minutes: 25, seconds: 1500, text: '25 mins' },
    travelFee: 0,
    isWithinServiceArea: true,
    calculatedAt: new Date().toISOString(),
    source: 'cache',
    cacheHit: true
  })
}))

const buildRequest = (url: string) => new NextRequest(url)

describe('GET /api/maps/distance', () => {
  it('returns distance info for a valid zip', async () => {
    const req = buildRequest('http://localhost/api/maps/distance?zip=77008')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.miles).toBe(12)
    expect(data.travelFee).toBe(0)
  })

  it('returns 400 when required params are missing', async () => {
    const req = buildRequest('http://localhost/api/maps/distance')
    const res = await GET(req)

    expect(res.status).toBe(400)
  })
}) 