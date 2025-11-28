// @vitest-enforce-coverage
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth session before route import
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

// Mock Vertex AI helper BEFORE route import so the route uses the mocked module
vi.mock('@/lib/vertex', () => ({ sendChat: vi.fn() }))
vi.mock('@/lib/agents-client', () => ({ sendAgentsChat: vi.fn(async () => ({ ok: false, reply: '', error: 'agents-down' })) }))
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
    delete (process.env as any).AI_CHAT_BACKEND
    const res = await POST(buildRequest({}) as any)
    expect(res.status).toBe(400)
  })

  it('returns 502 and retry hint when Vertex AI call fails', async () => {
    ;(process.env as any).AI_CHAT_BACKEND = 'vertex'
    vi.mocked(sendChat).mockRejectedValueOnce(new Error('Vertex unavailable'))
    const res = await POST(buildRequest({ message: 'Hello' }) as any)
    expect(res.status).toBe(502)
    expect(res.headers.get('Retry-After')).toBe('30')
  })

  it('allows anonymous access (no session) and returns 200', async () => {
    delete (process.env as any).AI_CHAT_BACKEND
    vi.mocked(getServerSession).mockResolvedValueOnce(null as any)
    vi.mocked(sendChat).mockResolvedValueOnce({ text: 'Hi from AI' } as any)
    const res = await POST(buildRequest({ message: 'Hi' }) as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
}) 