/**
 * Enhanced Booking Availability API - Houston Mobile Notary Pros
 * Phase 2: Real-time availability with urgency indicators and demand tracking
 * 
 * Returns available time slots for a specific service and date with enhanced metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { getCalendarSlots } from '@/lib/ghl/management';
import { prisma } from '@/lib/database-connection';

// Enhanced validation schema for availability request
const AvailabilityRequestSchema = z.object({
  serviceType: z.enum(['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timezone: z.string().default('America/Chicago'),
  includeDemand: z.boolean().default(true),
  includeUrgency: z.boolean().default(true)
});

// Business hours configuration per service
const BUSINESS_HOURS = {
  'QUICK_STAMP_LOCAL': { start: 9, end: 17, days: [1, 2, 3, 4, 5] }, // Mon-Fri 9-5
  'STANDARD_NOTARY': { start: 9, end: 17, days: [1, 2, 3, 4, 5] }, // Mon-Fri 9-5
  'EXTENDED_HOURS': { start: 7, end: 21, days: [0, 1, 2, 3, 4, 5, 6] }, // 7 days 7-9
  'LOAN_SIGNING': { start: 8, end: 18, days: [1, 2, 3, 4, 5] }, // Mon-Fri 8-6
  'RON_SERVICES': { start: 0, end: 24, days: [0, 1, 2, 3, 4, 5, 6] }, // 24/7
  'BUSINESS_ESSENTIALS': { start: 9, end: 17, days: [1, 2, 3, 4, 5] }, // Mon-Fri 9-5
  'BUSINESS_GROWTH': { start: 9, end: 17, days: [1, 2, 3, 4, 5] } // Mon-Fri 9-5
};

// Urgency and demand calculation helpers
function calculateDemandLevel(bookingsCount: number, totalSlots: number): 'low' | 'medium' | 'high' {
  const utilizationRate = bookingsCount / totalSlots;
  if (utilizationRate < 0.3) return 'low';
  if (utilizationRate < 0.7) return 'medium';
  return 'high';
}

function calculateUrgency(date: string, time: string, serviceType: string): boolean {
  const slotDate = new Date(`${date}T${time}`);
  const now = new Date();
  const hoursUntilSlot = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Same-day urgency
  if (hoursUntilSlot < 4) return true;
  
  // Service-specific urgency rules
  if (serviceType === 'LOAN_SIGNING' && hoursUntilSlot < 24) return true;
  if (serviceType === 'EXTENDED_HOURS' && hoursUntilSlot < 2) return true;
  
  return false;
}

function isPopularTime(time: string): boolean {
  const hour = parseInt(time.split(':')[0]);
  // Popular times: 9-11 AM, 1-3 PM
  return (hour >= 9 && hour <= 11) || (hour >= 13 && hour <= 15);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Parse and validate query parameters
    const queryData = {
      serviceType: searchParams.get('serviceType'),
      date: searchParams.get('date'),
      timezone: searchParams.get('timezone') || 'America/Chicago',
      includeDemand: searchParams.get('includeDemand') !== 'false',
      includeUrgency: searchParams.get('includeUrgency') !== 'false'
    };
    
    const validatedData = AvailabilityRequestSchema.parse(queryData);
    
    console.log(`🔍 Fetching enhanced availability for ${validatedData.serviceType} on ${validatedData.date}`);
    
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
    
    // Get existing bookings for demand calculation
    let existingBookings: Array<{ scheduledDateTime: Date; serviceId: string }> = [];
    if (validatedData.includeDemand) {
      try {
        existingBookings = await prisma.booking.findMany({
          where: {
            scheduledDateTime: {
              gte: new Date(`${validatedData.date}T00:00:00`),
              lt: new Date(`${validatedData.date}T23:59:59`)
            },
            status: {
              in: ['CONFIRMED', 'PENDING']
            }
          },
          select: {
            scheduledDateTime: true,
            serviceId: true
          }
        });
        console.log(`📊 Found ${existingBookings.length} existing bookings for demand calculation`);
      } catch (error) {
        console.warn('Could not fetch existing bookings for demand calculation:', error);
      }
    }
    
    // Transform slots into enhanced user-friendly format
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
      
      // Extract time for display and calculations
      const slotDate = new Date(startTimeISO);
      const timeString = slotDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: validatedData.timezone
      });
      
      // Calculate enhanced metadata
      const duration = typeof startTime === 'number' && typeof endTime === 'number'
        ? Math.round((endTime - startTime) / 60) // Duration in minutes
        : 60; // Default 60 minutes
      
      const displayTime = slotDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: validatedData.timezone
      });
      
      // Enhanced slot object with urgency and demand indicators
      const enhancedSlot = {
        startTime: startTimeISO,
        endTime: endTimeISO,
        available: true,
        duration,
        displayTime,
        timeString, // For sorting and calculations
        popular: isPopularTime(timeString),
        urgent: validatedData.includeUrgency ? calculateUrgency(validatedData.date, timeString, validatedData.serviceType) : false,
        demand: 'low' as 'low' | 'medium' | 'high',
        bookingCount: 0,
        remainingCapacity: 1, // Default capacity per slot
        recommended: false,
        sameDay: false,
        nextDay: false
      };
      
      // Calculate demand based on existing bookings
      if (validatedData.includeDemand) {
        const slotStart = new Date(startTimeISO);
        const slotEnd = new Date(endTimeISO);
        
        const conflictingBookings = existingBookings.filter(booking => {
          const bookingStart = new Date(booking.scheduledDateTime);
          const bookingEnd = new Date(bookingStart.getTime() + (duration * 60 * 1000));
          return (slotStart < bookingEnd && slotEnd > bookingStart);
        });
        
        enhancedSlot.bookingCount = conflictingBookings.length;
        enhancedSlot.demand = calculateDemandLevel(conflictingBookings.length, 1);
      }
      
      // Same-day and next-day indicators
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const slotDateOnly = new Date(validatedData.date);
      enhancedSlot.sameDay = slotDateOnly.toDateString() === today.toDateString();
      enhancedSlot.nextDay = slotDateOnly.toDateString() === tomorrow.toDateString();
      
      // Recommended slots (popular times with low demand)
      enhancedSlot.recommended = enhancedSlot.popular && enhancedSlot.demand === 'low';
      
      return enhancedSlot;
    });
    
    // Business hours filtering
    const businessHours = BUSINESS_HOURS[validatedData.serviceType as keyof typeof BUSINESS_HOURS];
    const filteredSlots = availableSlots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      const slotHour = slotDate.getHours();
      const dayOfWeek = slotDate.getDay();
      
      // Check business hours
      const withinHours = slotHour >= businessHours.start && slotHour < businessHours.end;
      const withinDays = businessHours.days.includes(dayOfWeek);
      
      return withinHours && withinDays;
    });
    
    // Sort slots by time and priority
    const sortedSlots = filteredSlots.sort((a, b) => {
      // Same-day slots first
      if (a.sameDay && !b.sameDay) return -1;
      if (!a.sameDay && b.sameDay) return 1;
      
      // Next-day slots second
      if (a.nextDay && !b.nextDay) return -1;
      if (!a.nextDay && b.nextDay) return 1;
      
      // Recommended slots third
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      
      // Then by time
      return a.timeString.localeCompare(b.timeString);
    });
    
    // Calculate summary statistics
    const summary = {
      totalSlots: sortedSlots.length,
      sameDaySlots: sortedSlots.filter(s => s.sameDay).length,
      nextDaySlots: sortedSlots.filter(s => s.nextDay).length,
      popularSlots: sortedSlots.filter(s => s.popular).length,
      urgentSlots: sortedSlots.filter(s => s.urgent).length,
      recommendedSlots: sortedSlots.filter(s => s.recommended).length,
      demandBreakdown: {
        low: sortedSlots.filter(s => s.demand === 'low').length,
        medium: sortedSlots.filter(s => s.demand === 'medium').length,
        high: sortedSlots.filter(s => s.demand === 'high').length
      }
    };
    
    return NextResponse.json({
      success: true,
      serviceType: validatedData.serviceType,
      date: validatedData.date,
      timezone: validatedData.timezone,
      calendarId,
      summary,
      totalSlots: sortedSlots.length,
      availableSlots: sortedSlots,
      metadata: {
        businessHours,
        fetchedAt: new Date().toISOString(),
        source: 'Enhanced GHL Calendar API',
        rawSlotsFound: slots.length,
        existingBookingsCount: existingBookings.length,
        includeDemand: validatedData.includeDemand,
        includeUrgency: validatedData.includeUrgency,
        rawResponse: process.env.NODE_ENV === 'development' ? ghlResponse : undefined
      }
    });
    
  } catch (error) {
    console.error('❌ Enhanced availability fetch error:', error);
    
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