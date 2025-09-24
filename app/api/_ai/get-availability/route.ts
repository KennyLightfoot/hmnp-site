import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { getCalendarSlots } from '@/lib/ghl/management';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

/**
 * AI Helper API - Availability Check
 * GET /api/_ai/get-availability?datetime=2025-01-17T15:00&serviceType=STANDARD_NOTARY
 * 
 * Used by Vertex AI function calling to check if a specific datetime slot
 * is available for booking. Returns simple boolean response.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  datetime: z.string().min(1),
  serviceType: z.string().optional(),
});

export const GET = withRateLimit('public', 'ai_get_availability')(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = schema.safeParse({
      datetime: searchParams.get('datetime'),
      serviceType: searchParams.get('serviceType') || 'STANDARD_NOTARY',
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid parameters' }, { status: 400 });
    }
    const { datetime, serviceType } = parsed.data as any;

    // Validate input
    if (!datetime) {
      return NextResponse.json({
        error: 'datetime parameter is required (ISO format: 2025-01-17T15:00)'
      }, { status: 400 });
    }

    // Parse and validate datetime
    const requestedDateTime = new Date(datetime);
    if (isNaN(requestedDateTime.getTime())) {
      return NextResponse.json({
        error: 'Invalid datetime format. Use ISO format: 2025-01-17T15:00'
      }, { status: 400 });
    }

    // Don't allow past dates
    const now = new Date();
    if (requestedDateTime < now) {
      return NextResponse.json({
        success: true,
        available: false,
        reason: 'Cannot book appointments in the past',
        requestedDateTime: datetime,
        currentTime: now.toISOString()
      });
    }

    // Get calendar ID for service type
    let calendarId: string;
    try {
      calendarId = getCalendarIdForService(serviceType);
    } catch (error) {
      return NextResponse.json({
        error: `Unsupported service type: ${serviceType}`,
        supportedTypes: ['STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH']
      }, { status: 400 });
    }

    // At this point calendarId is guaranteed to be defined since getCalendarIdForService 
    // either returns a string or throws an error (which we handle above)

    // Get the date for the requested datetime
    const requestedDate = requestedDateTime.toISOString().split('T')[0]!; // YYYY-MM-DD

    // Validate requestedDate is properly extracted
    if (!requestedDate) {
      return NextResponse.json({
        error: 'Failed to extract date from requested datetime',
        requestedDateTime: requestedDateTime.toISOString()
      }, { status: 500 });
    }

    // Fetch available slots from GHL for that day
    // Both calendarId and requestedDate are now guaranteed to be defined
    const ghlResponse = await getCalendarSlots(calendarId!, requestedDate, requestedDate);

    // Extract slots from response
    let slots = [];
    if (ghlResponse) {
      if (Array.isArray(ghlResponse)) {
        slots = ghlResponse;
      } else if (ghlResponse.slots && Array.isArray(ghlResponse.slots)) {
        slots = ghlResponse.slots;
      } else if (ghlResponse.data && Array.isArray(ghlResponse.data)) {
        slots = ghlResponse.data;
      } else if (ghlResponse.freeSlots && Array.isArray(ghlResponse.freeSlots)) {
        slots = ghlResponse.freeSlots;
      }
    }

    // Check if requested time matches any available slot
    const requestedTimestamp = Math.floor(requestedDateTime.getTime() / 1000);
    
    const isAvailable = slots.some((slot: any) => {
      const slotStart = slot.startTime || slot.start || slot.time;
      const slotEnd = slot.endTime || slot.end || (slotStart + 3600); // Default 1 hour
      
      // Convert to timestamps if needed
      const startTimestamp = typeof slotStart === 'number' ? slotStart : Math.floor(new Date(slotStart).getTime() / 1000);
      const endTimestamp = typeof slotEnd === 'number' ? slotEnd : Math.floor(new Date(slotEnd).getTime() / 1000);
      
      // Check if requested time falls within this slot
      return requestedTimestamp >= startTimestamp && requestedTimestamp < endTimestamp;
    });

    // If not available, suggest next available slot
    let nextSlot = null;
    if (!isAvailable && slots.length > 0) {
      // Find the next available slot after the requested time
      const futureSlots = slots.filter((slot: any) => {
        const slotStart = slot.startTime || slot.start || slot.time;
        const startTimestamp = typeof slotStart === 'number' ? slotStart : Math.floor(new Date(slotStart).getTime() / 1000);
        return startTimestamp > requestedTimestamp;
      });

      if (futureSlots.length > 0) {
        const nextSlotData = futureSlots[0];
        const nextSlotStart = nextSlotData.startTime || nextSlotData.start || nextSlotData.time;
        const nextSlotTimestamp = typeof nextSlotStart === 'number' ? nextSlotStart : Math.floor(new Date(nextSlotStart).getTime() / 1000);
        
        nextSlot = {
          datetime: new Date(nextSlotTimestamp * 1000).toISOString(),
          displayTime: new Date(nextSlotTimestamp * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/Chicago'
          })
        };
      }
    }

    return NextResponse.json({
      success: true,
      available: isAvailable,
      requestedDateTime: datetime,
      serviceType,
      nextSlot,
      metadata: {
        totalSlotsFound: slots.length,
        checkedAt: new Date().toISOString(),
        calendarId
      }
    });

  } catch (error) {
    console.error('AI Availability API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check availability',
      details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
    }, { status: 500 });
  }
});

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 
