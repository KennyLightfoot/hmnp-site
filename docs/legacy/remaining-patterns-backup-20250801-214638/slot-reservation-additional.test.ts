import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'

// In-memory Redis mock with TTL
const store = new Map<string, { value: any; expiresAt: number }>()

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
      del: vi.fn(async (...keys: string[]) => {
        keys.forEach(k => store.delete(k))
      }),
      pipeline: vi.fn(() => {
        return {
          setex: (k: string, ttl: number, v: any) => {
            store.set(k, { value: v, expiresAt: Date.now() + ttl * 1000 })
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
  vi.useRealTimers()
})

describe('SlotReservationEngine – collision & expiry', () => {
  it('prevents double-booking the same slot', async () => {
    const datetime = '2030-01-01T10:00:00.000Z'
    await engine.reserveSlot({ datetime, serviceType: 'STANDARD_NOTARY', userId: 'u1' } as any)
    const res2 = await engine.reserveSlot({ datetime, serviceType: 'STANDARD_NOTARY', userId: 'u2' } as any)
    expect(res2.success).toBe(false)
    expect(res2.conflictingReservation).toBeDefined()
  })

  it('marks reservation expired after TTL', async () => {
    vi.useFakeTimers()
    const datetime = '2030-01-02T12:00:00.000Z'
    const res = await engine.reserveSlot({ datetime, serviceType: 'STANDARD_NOTARY', userId: 'expire-user' } as any)
    const reservationId = res.reservation!.id

    // Fast-forward 16 minutes (defaultHoldDuration is 15)
    vi.setSystemTime(Date.now() + 16 * 60 * 1000)

    const status = await engine.getReservationStatus(reservationId)
    expect(status.active).toBe(false)
    expect(status.timeRemaining).toBe(0)
    vi.useRealTimers()
  })
}) 