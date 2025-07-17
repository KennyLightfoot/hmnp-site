// @vitest-enforce-coverage
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth session before route import
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

// Mock Vertex AI helper BEFORE route import so the route uses the mocked module
vi.mock('@/lib/vertex', () => ({ sendChat: vi.fn() }))
vi.mock('@/lib/conversation-tracker', () => ({ ConversationTracker: { trackInteraction: vi.fn() } }))

import { POST } from '@/app/api/ai/chat/route'
import { sendChat } from '@/lib/vertex'
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

  it('returns 502 and retry hint when Vertex AI call fails', async () => {
    vi.mocked(sendChat).mockRejectedValueOnce(new Error('Vertex unavailable'))
    const res = await POST(buildRequest({ message: 'Hello' }) as any)
    expect(res.status).toBe(502)
    expect(res.headers.get('Retry-After')).toBe('30')
  })

  it('returns 401 when Authorization/session is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null as any)
    const res = await POST(buildRequest({ message: 'Hi' }) as any)
    expect(res.status).toBe(401)
  })
}) 