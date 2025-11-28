import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { withWebhookSecurity } from '@/lib/security/comprehensive-security';
import { verifyAgentsWebhook } from '@/lib/security/agents-webhook-auth';
import { upsertAgentLead } from '@/lib/services/agent-webhook-service';
import { getErrorMessage } from '@/lib/utils/error-utils';

const leadPayloadSchema = z.object({
  event: z.string().optional(),
  timestamp: z.string().optional(),
  data: z.object({
    correlationId: z.string().min(1),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    message: z.string().optional(),
    serviceType: z.string().optional(),
    urgency: z.string().optional(),
    status: z.string().optional(),
    source: z.string().optional(),
    raw: z.record(z.any()).optional(),
  }),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withWebhookSecurity(async (request: NextRequest) => {
  if (!verifyAgentsWebhook(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized webhook' }, { status: 401 });
  }

  let parsed: z.infer<typeof leadPayloadSchema>;
  try {
    const json = await request.json();
    const result = leadPayloadSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error.issues[0]?.message ?? 'Invalid lead payload',
        },
        { status: 400 },
      );
    }
    parsed = result.data;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 400 },
    );
  }

  try {
    const lead = await upsertAgentLead(parsed.data);
    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error('[webhook:lead-created]', error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
});

