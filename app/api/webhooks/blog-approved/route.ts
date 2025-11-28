import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { withWebhookSecurity } from '@/lib/security/comprehensive-security';
import { verifyAgentsWebhook } from '@/lib/security/agents-webhook-auth';
import { persistAgentBlog } from '@/lib/services/agent-webhook-service';
import { getErrorMessage } from '@/lib/utils/error-utils';

const blogPayloadSchema = z.object({
  event: z.string().optional(),
  timestamp: z.string().optional(),
  data: z.object({
    jobId: z.string().optional(),
    job: z.record(z.any()).optional(),
    blogData: z.object({
      title: z.string().min(1),
      slug: z.string().optional(),
      summary: z.string().optional(),
      metaDescription: z.string().optional(),
      author: z.string().optional(),
      body: z.string().min(1),
      publishedAt: z.string().optional(),
    }),
  }),
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withWebhookSecurity(async (request: NextRequest) => {
  if (!verifyAgentsWebhook(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized webhook' }, { status: 401 });
  }

  let parsed: z.infer<typeof blogPayloadSchema>;
  try {
    const json = await request.json();
    const result = blogPayloadSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error.issues[0]?.message ?? 'Invalid blog payload',
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
    const result = await persistAgentBlog({
      jobId: parsed.data.jobId,
      blogData: parsed.data.blogData,
      job: parsed.data.job,
      timestamp: parsed.timestamp,
    });

    return NextResponse.json({
      ok: true,
      slug: result.slug,
      filePath: result.filePath,
    });
  } catch (error) {
    console.error('[webhook:blog-approved]', error);
    return NextResponse.json(
      {
        ok: false,
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
});

