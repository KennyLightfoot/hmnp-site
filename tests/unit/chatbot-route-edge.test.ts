// @vitest-enforce-coverage
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth session before route import
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

// Mock Vertex AI helper BEFORE route import so the route uses the mocked module
vi.mock('@/lib/ai/chat-provider', () => ({ getResponse: vi.fn() }))
vi.mock('@/lib/conversation-tracker', () => ({ ConversationTracker: { trackInteraction: vi.fn() } }))
vi.mock('@/lib/redis', () => ({
  redis: {
    isAvailable: () => false,
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn()
  }
}))

import { POST } from '@/app/api/ai/chat/route'
import { getResponse } from '@/lib/ai/chat-provider'
import { getServerSession } from 'next-auth'

function buildRequest(body: any) {
  return new Request('http://localhost/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }) as unknown as Request
}

beforeEach(() => {
  // By default, tests run with an authenticated user
  vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1', email: 'user@example.com' } } as any)
})

describe('/api/ai/chat route – edge cases', () => {
  it('returns 400 when message is missing', async () => {
    const res = await POST(buildRequest({}) as any)
    expect(res.status).toBe(400)
  })

  it('returns 502 and retry hint when provider call fails', async () => {
    vi.mocked(getResponse).mockRejectedValueOnce(new Error('AI unavailable'))
    const res = await POST(buildRequest({ message: 'Hello' }) as any)
    expect(res.status).toBe(502)
    expect(res.headers.get('Retry-After')).toBe('30')
  })

  it('allows anonymous access (no session) and returns 200', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null as any)
    vi.mocked(getResponse).mockResolvedValueOnce({ text: 'Hi from AI' } as any)
    const res = await POST(buildRequest({ message: 'Hi' }) as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
}) 