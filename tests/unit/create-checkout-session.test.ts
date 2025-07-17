// @vitest-enforce-coverage
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next/headers early so route can read origin safely
vi.mock('next/headers', () => ({ headers: () => new Map([['origin', 'http://localhost']]) }))

// Mock Stripe SDK (define mock inside factory to avoid TDZ issues)
vi.mock('@/lib/stripe', () => {
  const stripeMock = {
    checkout: {
      sessions: {
        create: vi.fn(async ({ success_url }) => ({ id: 'cs_test_123', url: success_url.replace('{CHECKOUT_SESSION_ID}', 'cs_test_123') }))
      }
    },
    customers: {
      list: vi.fn(async () => ({ data: [] })),
      create: vi.fn(async () => ({ id: 'cus_test_123' }))
    }
  };
  return { stripe: stripeMock };
});

vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/prisma', () => ({ prisma: {} }))

import { POST } from '@/app/api/create-checkout-session/route'

function buildRequest(body: any) {
  return new Request('http://localhost/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }) as unknown as Request
}

const basePayload = {
  customerEmail: 'test@example.com',
  customerName: 'Tester',
  amount: 75,
  description: 'Standard Notary'
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('/api/create-checkout-session route – edge cases', () => {
  it('returns 400 when amount is zero (free booking)', async () => {
    const res = await POST(buildRequest({ ...basePayload, amount: 0 }) as any)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/free bookings/i)
  })

  it('returns Stripe checkout url on success', async () => {
    const res = await POST(buildRequest(basePayload) as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.sessionUrl).toContain('/booking/success')
  })
}) 