import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limiting';

// Minimal helper that logs a note to GHL if possible
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRateLimit('public', 'ai_log_note')(async (request: NextRequest) => {
  try {
    const schema = z.object({
      contactId: z.string().min(1),
      message: z.string().min(1)
    });
    const body = schema.parse(await request.json());

    const apiKey = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY;
    const baseUrl = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GHL credentials not configured' }, { status: 400 });
    }

    const res = await fetch(`${baseUrl}/contacts/${body.contactId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Version: '2021-07-28'
      },
      body: JSON.stringify({ body: body.message })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Failed to create note', details: data }, { status: 502 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Invalid request' }, { status: 400 });
  }
});


