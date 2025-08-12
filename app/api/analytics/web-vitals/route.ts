import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  metric: z.string().min(1),
  value: z.number(),
  rating: z.string().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
});

export const POST = withRateLimit('public', 'analytics_web_vitals')(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid payload' }, { status: 400 });
    }
    const data = parsed.data;
    
    // Log the web vitals metrics
    logger.info('Web vitals metrics received:', 'WEB_VITALS', {
      metric: data.metric,
      value: data.value,
      rating: data.rating,
      url: data.url,
      userAgent: data.userAgent?.substring(0, 100)
    });
    
    // In the future, you could store these in Supabase:
    // await supabase.from('web_vitals').insert({
    //   metric: body.metric,
    //   value: body.value,
    //   rating: body.rating,
    //   timestamp: new Date(body.timestamp),
    //   url: body.url,
    //   user_agent: body.userAgent
    // });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Failed to process web vitals metrics:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to process web vitals metrics' },
      { status: 500 }
    );
  }
});

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 