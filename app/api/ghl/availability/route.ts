import { NextRequest, NextResponse } from 'next/server';
import { format, parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  console.log('GET /api/ghl/availability called');
  // TODO: Implement actual GHL availability logic
  // For now, returning a mock response
  try {
    const searchParams = request.nextUrl.searchParams;
    const calendarId = searchParams.get('calendarId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Received params:', { calendarId, startDate, endDate });

    if (!calendarId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required query parameters: calendarId, startDate, endDate' },
        { status: 400 }
      );
    }

    // Mock available slots
    // Ensure startDate is not null before parsing
    if (!startDate) {
      // This case should ideally be caught by the check above,
      // but as a fallback:
      return NextResponse.json(
        { success: false, message: 'startDate query parameter is missing or invalid.' },
        { status: 400 }
      );
    }
    const dateKey = format(parseISO(startDate), 'yyyy-MM-dd');
    const mockSlots = {
      [dateKey]: [
        { startTime: '09:00', endTime: '09:30', formattedTime: '09:00 AM' }, // Added formattedTime for consistency with frontend
        { startTime: '10:00', endTime: '10:30', formattedTime: '10:00 AM' }, // Added formattedTime for consistency with frontend
      ],
      // Add more dates and slots as needed for testing
    };

    return NextResponse.json({ success: true, slots: mockSlots });
  } catch (error) {
    console.error('Error in /api/ghl/availability:', error);
    return NextResponse.json(
      { success: false, message: `Error fetching availability: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
