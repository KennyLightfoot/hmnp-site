import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
// We'll dynamically import SlotReservationEngine after mocks are in place

let engine: any; // SlotReservationEngine instance will be assigned in beforeAll

// Mock redis with in-memory Map
vi.mock('@/lib/redis', () => {
  const store = new Map<string, any>()
  return {
    redis: {
      get: vi.fn(async (k: string) => store.get(k)),
      setex: vi.fn(async (k: string, _ttl: number, v: any) => { store.set(k, v) }),
      pipeline: vi.fn(() => {
        const ops: any[] = []
        return {
          setex: (k: string, _ttl: number, v: any) => { store.set(k, v); return this },
          exec: async () => ops
        }
      })
    }
  }
})

// Silence logger & realtime
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/realtime/websocket-manager', () => ({ webSocketManager: { broadcast: vi.fn() } }))

// Dynamically load the engine after mocks are registered
beforeAll(async () => {
  const { SlotReservationEngine } = await import('@/lib/slot-reservation');
  engine = new SlotReservationEngine();
});

describe('SlotReservationEngine', () => {
  beforeEach(async () => {
    // Access mocked redis and reset call counts between tests
    const { redis } = await import('@/lib/redis');
    (redis.get as any).mockClear();
  });

  it('reserves a new slot successfully', async () => {
    const res = await engine.reserveSlot({
      datetime: '2025-01-01T10:00:00.000Z',
      serviceType: 'STANDARD_NOTARY',
      userId: 'user1'
    } as any)
    expect(res.success).toBe(true)
  })

  it('prevents double booking of same slot for different user', async () => {
    await engine.reserveSlot({
      datetime: '2025-01-01T11:00:00.000Z',
      serviceType: 'STANDARD_NOTARY',
      userId: 'userA'
    } as any)

    const res2 = await engine.reserveSlot({
      datetime: '2025-01-01T11:00:00.000Z',
      serviceType: 'STANDARD_NOTARY',
      userId: 'userB'
    } as any)

    expect(res2.success).toBe(false)
    expect(res2.conflictingReservation).toBeDefined()
  })
}) 