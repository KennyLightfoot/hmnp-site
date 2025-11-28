import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/follow-up-automation', () => ({
  checkTimeBasedFollowUps: vi.fn(async () => {}),
  processScheduledFollowUps: vi.fn(async () => ({ processed: true })),
}))

import { GET } from '@/app/api/cron/follow-ups/route'
import { checkTimeBasedFollowUps, processScheduledFollowUps } from '@/lib/follow-up-automation'

describe('/api/cron/follow-ups – basic smoke test', () => {
  it('runs follow-up checks and returns ok', async () => {
    const res = await GET()
    expect(checkTimeBasedFollowUps).toHaveBeenCalled()
    expect(processScheduledFollowUps).toHaveBeenCalled()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
  })
})


