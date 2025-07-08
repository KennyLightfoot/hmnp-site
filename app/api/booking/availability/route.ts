/**
 * Booking Availability API - Houston Mobile Notary Pros
 * Phase 2: Real-time availability using GHL calendars
 * 
 * Returns available time slots for a specific service and date
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { getCalendarSlots } from '@/lib/ghl/management';

// Validation schema for availability request
const AvailabilityRequestSchema = z.object({
  serviceType: z.enum(['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timezone: z.string().default('America/Chicago')
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Parse and validate query parameters
    const queryData = {
      serviceType: searchParams.get('serviceType'),
      date: searchParams.get('date'),
      timezone: searchParams.get('timezone') || 'America/Chicago'
    };
    
    const validatedData = AvailabilityRequestSchema.parse(queryData);
    
    console.log(`🔍 Fetching availability for ${validatedData.serviceType} on ${validatedData.date}`);
    
    // Get the appropriate calendar ID for this service
    const calendarId = getCalendarIdForService(validatedData.serviceType);
    console.log(`📅 Using calendar: ${calendarId}`);
    
    // Pass date strings - conversion to Unix timestamps happens in getCalendarSlots
    const startDate = validatedData.date;  // "2025-01-20"
    const endDate = validatedData.date;    // "2025-01-20" (same day)
    
    console.log(`📊 Requesting slots for date: ${startDate} (timezone: ${validatedData.timezone})`);
    
    // Fetch available slots from GHL
    const ghlResponse = await getCalendarSlots(
      calendarId, 
      startDate,
      endDate
    );
    
    console.log(`✅ GHL Response:`, JSON.stringify(ghlResponse, null, 2));
    
    // Extract slots from the GHL response structure
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
    
    console.log(`✅ Found ${slots.length} available slots`);
    
    // Transform slots into user-friendly format (only if we have actual slots)
    const availableSlots = slots.map(slot => {
      // Handle different slot data structures from GHL
      const startTime = slot.startTime || slot.start || slot.time;
      const endTime = slot.endTime || slot.end || (startTime + 3600); // Default 1 hour
      
      // Convert Unix timestamp to ISO string if needed
      const startTimeISO = typeof startTime === 'number' 
        ? new Date(startTime * 1000).toISOString()
        : startTime;
      const endTimeISO = typeof endTime === 'number'
        ? new Date(endTime * 1000).toISOString() 
        : endTime;
      
      return {
        startTime: startTimeISO,
        endTime: endTimeISO,
        available: true,
        duration: typeof startTime === 'number' && typeof endTime === 'number'
          ? Math.round((endTime - startTime) / 60) // Duration in minutes
          : 60, // Default 60 minutes
        displayTime: typeof startTime === 'number'
          ? new Date(startTime * 1000).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: validatedData.timezone
            })
          : 'Time TBD'
      };
    });
    
    // Business hours filtering (optional - GHL should handle this)
    const businessHours = getBusinessHours(validatedData.serviceType);
    const filteredSlots = availableSlots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      const slotHour = slotDate.getHours();
      return slotHour >= businessHours.start && slotHour < businessHours.end;
    });
    
    return NextResponse.json({
      success: true,
      serviceType: validatedData.serviceType,
      date: validatedData.date,
      timezone: validatedData.timezone,
      calendarId,
      totalSlots: filteredSlots.length,
      availableSlots: filteredSlots,
      metadata: {
        businessHours,
        fetchedAt: new Date().toISOString(),
        source: 'GHL Calendar API',
        rawSlotsFound: slots.length,
        rawResponse: process.env.NODE_ENV === 'development' ? ghlResponse : undefined
      }
    });
    
  } catch (error) {
    console.error('❌ Availability fetch error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      );
    }
    
    // Handle calendar mapping errors
    if (error.message.includes('Unsupported service type')) {
      return NextResponse.json(
        { 
          error: 'Unsupported service type',
          message: error.message
        },
        { status: 400 }
      );
    }
    
    // Handle GHL API errors
    if (error.message.includes('GHL API request failed')) {
      return NextResponse.json(
        { 
          error: 'Calendar service unavailable',
          message: 'Unable to fetch availability at this time',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Availability lookup failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get business hours for a service type
 */
function getBusinessHours(serviceType: string): { start: number; end: number } {
  const businessHours = {
    'STANDARD_NOTARY': { start: 8, end: 18 },      // 8 AM - 6 PM
    'EXTENDED_HOURS': { start: 6, end: 22 },       // 6 AM - 10 PM
    'LOAN_SIGNING': { start: 8, end: 20 },         // 8 AM - 8 PM
    'RON_SERVICES': { start: 8, end: 18 }          // 8 AM - 6 PM (online)
  };
  
  return businessHours[serviceType as keyof typeof businessHours] || { start: 8, end: 18 };
}