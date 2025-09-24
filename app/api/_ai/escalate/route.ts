import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limiting';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRateLimit('public', 'ai_escalate')(async (request: NextRequest) => {
  try {
    const schema = z.object({
      contactId: z.string().optional(),
      reason: z.string().min(3),
      customerEmail: z.string().email().optional(),
      customerPhone: z.string().optional(),
    });
    const body = schema.parse(await request.json());

    // Add a basic notification path (email or GHL note)
    let noteCreated: any = null;
    if (body.contactId) {
      const apiKey = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY;
      const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
      if (apiKey) {
        const res = await fetch(`${baseUrl}/contacts/${body.contactId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            Version: '2021-07-28'
          },
          body: JSON.stringify({ body: `Escalation requested: ${body.reason}` })
        });
        noteCreated = await res.json().catch(() => ({}));
      }
    }

    // TODO: add email/SMS to ops if configured
    return NextResponse.json({ success: true, noteCreated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Invalid request' }, { status: 400 });
  }
});


