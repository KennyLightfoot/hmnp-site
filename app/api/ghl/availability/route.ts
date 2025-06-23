import { NextRequest, NextResponse } from 'next/server';
import { getCalendarSlots } from '@/lib/ghl/management';

/**
 * GET /api/ghl/availability
 * Thin wrapper around GHL V2 free-slots endpoint via helper in lib/ghl/management.ts
 * Required query params: calendarId, startDate (ISO), endDate (ISO)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const calendarId = searchParams.get('calendarId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!calendarId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters: calendarId, startDate, endDate' },
        { status: 400 }
      );
    }

    // Call GHL helper to fetch slots
    const slots = await getCalendarSlots(calendarId, startDate, endDate);

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error('GHL availability error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
