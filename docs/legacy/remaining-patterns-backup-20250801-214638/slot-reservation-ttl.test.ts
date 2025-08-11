import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// Mock Redis as simple in-memory store with TTL simulation
const store = new Map<string, { value: any, expiresAt: number }>()

vi.mock('@/lib/redis', () => {
  return {
    redis: {
      get: vi.fn(async (k: string) => {
        const entry = store.get(k)
        if (!entry) return null
        if (Date.now() > entry.expiresAt) return null
        return entry.value
      }),
      setex: vi.fn(async (k: string, ttl: number, v: any) => {
        store.set(k, { value: v, expiresAt: Date.now() + ttl * 1000 })
      }),
      pipeline: vi.fn(() => {
        return {
          setex: (k: string, ttl: number, v: any) => {
            store.set(k, { value: v, expiresAt: Date.now() + ttl * 1000 });
            return this
          },
          exec: async () => []
        }
      })
    }
  }
})

vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() } }))
vi.mock('@/lib/realtime/websocket-manager', () => ({ webSocketManager: { broadcast: vi.fn() } }))

let engine: any

beforeAll(async () => {
  const mod = await import('@/lib/slot-reservation')
  engine = new mod.SlotReservationEngine()
})

beforeEach(() => {
  store.clear()
})

describe('SlotReservationEngine – TTL handling', () => {
  it('returns timeRemaining close to defaultHoldDuration after reservation', async () => {
    const res = await engine.reserveSlot({
      datetime: '2030-01-01T10:00:00.000Z',
      serviceType: 'STANDARD_NOTARY',
      userId: 'user-ttl'
    } as any)

    expect(res.success).toBe(true)

    const reservationId = res.reservation!.id
    const status = await engine.getReservationStatus(reservationId)

    expect(status.active).toBe(true)
    expect(status.timeRemaining).toBeGreaterThanOrEqual(14 * 60) // at least 14 minutes left
    expect(status.timeRemaining).toBeLessThanOrEqual(15 * 60) // not more than default
  })
}) 