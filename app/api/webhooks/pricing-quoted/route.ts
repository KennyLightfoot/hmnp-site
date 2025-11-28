import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { withWebhookSecurity } from '@/lib/security/comprehensive-security';
import { verifyAgentsWebhook } from '@/lib/security/agents-webhook-auth';
import { upsertAgentPricingQuote } from '@/lib/services/agent-webhook-service';
import { getErrorMessage } from '@/lib/utils/error-utils';

const pricingPayloadSchema = z.object({
  event: z.string().optional(),
  timestamp: z.string().optional(),
  data: z.object({
    correlationId: z.string().min(1),
    total: z.union([z.number(), z.string()]),
    baseFee: z.union([z.number(), z.string()]).optional(),
    travelFee: z.union([z.number(), z.string()]).optional(),
    rushFee: z.union([z.number(), z.string()]).optional(),
    pricingVersion: z.string().optional(),
    needsReview: z.boolean().optional(),
    raw: z.record(z.any()).optional(),
  }),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withWebhookSecurity(async (request: NextRequest) => {
  if (!verifyAgentsWebhook(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized webhook' }, { status: 401 });
  }

  let parsed: z.infer<typeof pricingPayloadSchema>;
  try {
    const json = await request.json();
    const result = pricingPayloadSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error.issues[0]?.message ?? 'Invalid pricing payload',
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
    const quote = await upsertAgentPricingQuote(parsed.data);
    return NextResponse.json({ ok: true, id: quote.id });
  } catch (error) {
    console.error('[webhook:pricing-quoted]', error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
});

