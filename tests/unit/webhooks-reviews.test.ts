import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/ghl/contacts', () => ({
  findContactByEmail: vi.fn(async () => null),
  addTagsToContact: vi.fn(async () => {}),
}))

vi.mock('@/lib/ghl/management', () => ({
  createContact: vi.fn(async () => ({ id: 'ghl-contact-1' })),
  searchContacts: vi.fn(async () => []),
}))

vi.mock('@/lib/gmb/automation-service', () => ({
  triggerReviewThankYouPost: vi.fn(async () => {}),
}))

import { POST } from '@/app/api/webhooks/reviews/route'
import { findContactByEmail, addTagsToContact } from '@/lib/ghl/contacts'
import { createContact } from '@/lib/ghl/management'
import { triggerReviewThankYouPost } from '@/lib/gmb/automation-service'

function buildRequest(body: any) {
  return new Request('http://localhost/api/webhooks/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as Request
}

const basePayload = {
  platform: 'google',
  rating: 5,
  reviewer_name: 'Test Reviewer',
  review_text: 'Great service!',
  review_id: 'rev-123',
  review_url: 'https://example.com/review/123',
  timestamp: new Date().toISOString(),
}

describe('/api/webhooks/reviews – review processing', () => {
  beforeEach(() => {
    vi.mocked(findContactByEmail).mockResolvedValue(null as any)
    vi.mocked(createContact).mockResolvedValue({ id: 'ghl-contact-1' } as any)
  })

  it('returns 400 for invalid payload', async () => {
    const res = await POST(buildRequest({}) as any)
    expect(res.status).toBe(400)
  })

  it('creates a contact, tags it, and triggers GMB thank you post', async () => {
    const res = await POST(
      buildRequest({
        ...basePayload,
        reviewer_email: 'reviewer@example.com',
      }) as any,
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.contactId).toBe('ghl-contact-1')
    expect(addTagsToContact).toHaveBeenCalled()
    expect(triggerReviewThankYouPost).toHaveBeenCalled()
  })
})


