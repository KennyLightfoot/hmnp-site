import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/webhooks/ghl/route'

function buildRequest(body: any, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/webhooks/ghl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  }) as unknown as Request
}

describe('/api/webhooks/ghl – basic contract', () => {
  it('rejects invalid JSON payloads with 400', async () => {
    const req = new Request('http://localhost/api/webhooks/ghl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Intentionally send invalid JSON
      body: '{ invalid json',
    } as any)

    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('acknowledges a simple contact.created webhook in setup mode', async () => {
    ;(process.env as any).GHL_SETUP_MODE = 'true'

    const payload = {
      type: 'contact.created',
      contactId: 'contact-123',
      timestamp: new Date().toISOString(),
    }

    const res = await POST(buildRequest(payload) as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('acknowledged')
    expect(data.setupMode).toBe(true)
  })
})


