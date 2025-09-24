import { type NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import type { TimeSlot } from "@/lib/types/booking";
import { getAvailableSlots, getCalendars, testCalendarConnection } from "@/lib/ghl-calendar";
import { getCalendarIdForService } from "@/lib/ghl/calendar-mapping";
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

// Fallback mock function if GHL is not available
function generateMockSlots(date: DateTime): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17;
  
  console.log(`🎲 Starting mock generation for ${date.toISODate()}`);
  
  // Generate slots for all future dates
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
      const startTime = date.set({ hour, minute, second: 0, millisecond: 0 });
      const demandLevels = ["low", "moderate", "high"] as const;
      
      slots.push({
        startTime: startTime.toISO(),
        endTime: startTime.plus({ minutes: 60 }).toISO(),
        duration: 60,
        demand: demandLevels[Math.floor(Math.random() * 3)],
        available: true
      } as TimeSlot);
    }
  }
  
  console.log(`🎲 Generated ${slots.length} mock slots for ${date.toISODate()}`);
  return slots;
}

// Simple in-memory cache to prevent duplicate requests
const cache = new Map<string, { data: any; expires: number }>();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceType: z.string().optional(),
});

export const GET = withRateLimit('public', 'availability')(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    date: searchParams.get('date'),
    serviceType: searchParams.get('serviceType') || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid parameters' }, { status: 400 });
  }
  const { date: dateStr, serviceType } = parsed.data;
  
  console.log(`📅 Availability request: date=${dateStr}, serviceType=${serviceType}`);
  
  // centralized rate limiting applied via middleware above
  
  // Create cache key
  const cacheKey = `availability-${dateStr}`;
  const now = Date.now();
  
  // Check cache first (5 minute TTL)
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) {
    return NextResponse.json(cached.data);
  }
  
  // Force timezone to business timezone (Houston = America/Chicago)
  const requestedDate = DateTime.fromISO(dateStr, { zone: "America/Chicago" });
  if (!requestedDate.isValid)
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  
    try {
    let availableSlots: TimeSlot[] = [];
      let source: 'ghl' | 'mock' = 'mock';
    
    // Try to get real availability from GHL calendars with timeout
    try {
      // Test GHL connection first with timeout
      console.log('🔍 Testing GHL connection...');
      const connectionPromise = testCalendarConnection();
      const isConnected = await Promise.race([
        connectionPromise,
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)) // 5 second timeout
      ]);
      
      console.log(`🔍 GHL connection result: ${isConnected}`);
      
      if (isConnected) {
        // Get service type from query params (default to STANDARD_NOTARY)
        const serviceType = searchParams.get("serviceType") || "STANDARD_NOTARY";
        
        try {
          // Get the specific calendar ID for this service type
          const calendarId = getCalendarIdForService(serviceType);
          console.log(`📅 Using calendar ID for ${serviceType}: ${calendarId}`);
          
          // Get start and end of the requested date
          const startOfDay = requestedDate.startOf('day');
          const endOfDay = requestedDate.endOf('day');
          
          // Get available slots from GHL with timeout
          const slotsPromise = getAvailableSlots(
            calendarId,
            startOfDay.toISO(),
            endOfDay.toISO(),
            60 // 60-minute duration
          );
          
          const ghlSlots = await Promise.race([
            slotsPromise,
            new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 10000)) // 10 second timeout
          ]);
          
          // Transform GHL slots to our TimeSlot format
          availableSlots = ghlSlots.map((slot: any) => ({
            startTime: slot.startTime || slot.start,
            endTime: slot.endTime || slot.end,
            duration: slot.duration || 60,
            demand: slot.demand || 'low',
            available: slot.available !== false
          } as TimeSlot));
          source = availableSlots.length > 0 ? 'ghl' : 'mock';
          
          console.log(`✅ GHL availability fetched for ${dateStr} (${serviceType}): ${availableSlots.length} slots`);
          
          // If GHL returns empty slots, fall back to mock data
          if (availableSlots.length === 0) {
            console.log(`⚠️ GHL returned empty slots, falling back to mock data`);
            availableSlots = generateMockSlots(requestedDate);
            source = 'mock';
          }
        } catch (calendarError) {
          console.warn(`Calendar mapping failed for ${serviceType}, falling back to mock data:`, calendarError);
          console.log(`🔧 Calendar error details:`, {
            serviceType,
            error: calendarError instanceof Error ? calendarError.message : String(calendarError),
            stack: calendarError instanceof Error ? calendarError.stack : undefined
          });
          availableSlots = generateMockSlots(requestedDate);
          source = 'mock';
        }
      } else {
        console.warn('GHL connection failed, falling back to mock data');
        availableSlots = generateMockSlots(requestedDate);
        source = 'mock';
      }
    } catch (ghlError) {
      console.warn('GHL availability fetch failed, falling back to mock data:', ghlError);
      availableSlots = generateMockSlots(requestedDate);
    }
    
    const response = { availableSlots, metadata: { source } };
    
    console.log(`✅ Availability response for ${dateStr}:`, {
      serviceType,
      slotCount: availableSlots.length,
      cacheKey,
      response
    });
    
    // Cache the response
    cache.set(cacheKey, {
      data: response,
      expires: now + (5 * 60 * 1000) // 5 minutes
    });
    
    // Clean old entries
    for (const [key, value] of cache.entries()) {
      if (value.expires <= now) {
        cache.delete(key);
      }
    }

  return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});