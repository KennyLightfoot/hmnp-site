import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the performance metrics for now
    logger.info('Performance metrics received:', 'ANALYTICS', body);
    
    // In the future, you could store these in Supabase:
    // await supabase.from('web_vitals').insert({
    //   metric: body.metric,
    //   value: body.value,
    //   rating: body.rating,
    //   timestamp: body.timestamp,
    //   url: body.url,
    //   user_agent: body.userAgent
    // });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Failed to process performance metrics:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to process performance metrics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 