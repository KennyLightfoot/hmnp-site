import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { withWebhookSecurity } from '@/lib/security/comprehensive-security';
import { verifyAgentsWebhook } from '@/lib/security/agents-webhook-auth';
import { upsertAgentJob } from '@/lib/services/agent-webhook-service';
import { getErrorMessage } from '@/lib/utils/error-utils';

const jobPayloadSchema = z.object({
  event: z.string().optional(),
  timestamp: z.string().optional(),
  data: z.object({
    jobId: z.string().min(1),
    correlationId: z.string().optional(),
    customerName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    serviceType: z.string().optional(),
    status: z.string().optional(),
    appointmentDateTime: z.string().optional(),
    confirmedPrice: z.union([z.number(), z.string()]).optional(),
    raw: z.record(z.any()).optional(),
  }),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withWebhookSecurity(async (request: NextRequest) => {
  if (!verifyAgentsWebhook(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized webhook' }, { status: 401 });
  }

  let parsed: z.infer<typeof jobPayloadSchema>;
  try {
    const json = await request.json();
    const result = jobPayloadSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error.issues[0]?.message ?? 'Invalid job payload',
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
    const job = await upsertAgentJob(parsed.data);
    return NextResponse.json({ ok: true, id: job.id });
  } catch (error) {
    console.error('[webhook:job-created]', error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
});

