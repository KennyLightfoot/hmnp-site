import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/lead-nurturing', () => ({
  leadNurturingService: {
    processNurtureSequences: vi.fn(async () => ({
      sequencesProcessed: 1,
      messagesScheduled: 2,
      enrollmentsCompleted: 0,
      errors: [],
    })),
  },
}))

vi.mock('@/lib/security/comprehensive-security', async (orig) => {
  const actual = await orig()
  return {
    ...actual,
    withAdminSecurity:
      (handler: any) =>
      (req: any) =>
        handler(req),
  }
})

import { POST } from '@/app/api/cron/lead-nurturing/route'
import { leadNurturingService } from '@/lib/lead-nurturing'

function buildRequest() {
  return new Request('http://localhost/api/cron/lead-nurturing', {
    method: 'POST',
  }) as unknown as Request
}

describe('/api/cron/lead-nurturing – basic smoke test', () => {
  it('processes nurture sequences and returns success', async () => {
    const res = await POST(buildRequest() as any)
    expect(leadNurturingService.processNurtureSequences).toHaveBeenCalled()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})


