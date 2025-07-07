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
  serviceType: z.enum(['STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES']),
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
    
    // Convert date to Unix timestamps (GHL API requirement)
    const startDate = new Date(`${validatedData.date}T00:00:00.000Z`);
    const endDate = new Date(`${validatedData.date}T23:59:59.999Z`);
    
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    
    // Fetch available slots from GHL
    const slots = await getCalendarSlots(
      calendarId, 
      startTimestamp.toString(), 
      endTimestamp.toString()
    );
    
    console.log(`✅ Found ${slots?.length || 0} available slots`);
    
    // Transform slots into user-friendly format
    const availableSlots = (slots || []).map(slot => ({
      startTime: new Date(slot.startTime * 1000).toISOString(),
      endTime: new Date(slot.endTime * 1000).toISOString(),
      available: true,
      duration: Math.round((slot.endTime - slot.startTime) / 60), // Duration in minutes
      displayTime: new Date(slot.startTime * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: validatedData.timezone
      })
    }));
    
    // Business hours filtering (optional - GHL should handle this)
    const businessHours = getBusinessHours(validatedData.serviceType);
    const filteredSlots = availableSlots.filter(slot => {
      const slotHour = new Date(slot.startTime).getHours();
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
        source: 'GHL Calendar API'
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
          message: 'Unable to fetch availability at this time'
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