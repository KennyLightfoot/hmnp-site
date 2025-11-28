import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/stripe', () => {
  const Stripe = vi.fn()
  return {
    stripe: {
      webhooks: {
        constructEvent: vi.fn((body: string, signature: string, secret: string) => ({
          id: 'evt_123',
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_123',
              amount: 1000,
            },
          },
        })),
      },
    },
    StripeService: Stripe,
  }
})

vi.mock('@/lib/webhook-processor', () => ({
  webhookProcessor: {
    processWebhook: vi.fn(async () => ({
      success: true,
      processingTime: 10,
    })),
  },
}))

import { POST } from '@/app/api/webhooks/stripe/route'
import { stripe } from '@/lib/stripe'
import { webhookProcessor } from '@/lib/webhook-processor'

function buildRequest(body: string, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig_test', ...headers },
    body,
  }) as unknown as Request
}

describe('/api/webhooks/stripe – basic contract', () => {
  it('returns 400 when signature is missing', async () => {
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    } as any)
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('processes a handled Stripe event via webhookProcessor', async () => {
    ;(process.env as any).STRIPE_WEBHOOK_SECRET = 'whsec_test'
    const payload = JSON.stringify({ id: 'pi_123' })
    const res = await POST(buildRequest(payload) as any)
    expect(stripe.webhooks.constructEvent).toHaveBeenCalled()
    expect(webhookProcessor.processWebhook).toHaveBeenCalled()
    expect(res.status).toBe(200)
  })
})


