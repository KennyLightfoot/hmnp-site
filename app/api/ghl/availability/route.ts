import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getCalendarSlots } from '@/lib/ghl/management';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limiting';

/**
 * GET /api/ghl/availability
 * Thin wrapper around GHL V2 free-slots endpoint via helper in lib/ghl/management.ts
 * Required query params: calendarId, startDate (ISO), endDate (ISO)
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  calendarId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export const GET = withRateLimit('public', 'ghl_availability')(async (request: NextRequest) => {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = querySchema.safeParse({
      calendarId: searchParams.get('calendarId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid parameters' }, { status: 400 });
    }
    const { calendarId, startDate, endDate } = parsed.data;

    // Call GHL helper to fetch slots
    const slots = await getCalendarSlots(calendarId, startDate, endDate);

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error('GHL availability error:', error);
    const message = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
});
