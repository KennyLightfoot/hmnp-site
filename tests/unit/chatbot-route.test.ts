import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth to avoid heavy dependencies like nodemailer
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

// Mock other dependencies
vi.mock('@/lib/vertex', () => ({ sendChat: vi.fn(async () => ({ text: 'Hello there!' })) }))
vi.mock('@/lib/agents-client', () => ({ sendAgentsChat: vi.fn(async () => ({ ok: true, reply: 'Hi from agents!', intent: 'greeting' })) }))
vi.mock('@/lib/conversation-tracker', () => ({ ConversationTracker: { trackInteraction: vi.fn() } }))

import { POST } from '@/app/api/ai/chat/route'
import { getServerSession } from 'next-auth'
import { sendAgentsChat } from '@/lib/agents-client'

function buildRequest(body: any) {
  return new Request('http://localhost/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }) as unknown as Request
}

beforeEach(() => {
  vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
})

describe('/api/ai/chat route – happy path', () => {
  it('returns 200 and success for valid message using default Vertex backend', async () => {
    delete (process.env as any).AI_CHAT_BACKEND
    const req = buildRequest({ message: 'Hi there' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.response).toBeDefined()
  })

  it('delegates to agents backend when AI_CHAT_BACKEND=agents', async () => {
    ;(process.env as any).AI_CHAT_BACKEND = 'agents'
    const req = buildRequest({ message: 'Hi from web' })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.response).toContain('Hi from agents!')
    expect(data.intent).toBe('greeting')
    expect(sendAgentsChat).toHaveBeenCalled()
  })
}) 