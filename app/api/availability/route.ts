import { type NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { z } from 'zod';
import { isPreviewUiOnly } from '@/lib/preview'

// Fallback mock function if GHL is not available
type TimeSlot = {
  startTime: string
  endTime: string
  duration: number
  available: boolean
  demand?: 'low' | 'moderate' | 'high'
}

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

export const GET = async (request: NextRequest) => {
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
  
  // In UI preview, return a deterministic mock and avoid any external clients
  if (isPreviewUiOnly) {
    const requestedDate = DateTime.fromISO(dateStr, { zone: "America/Chicago" });
    const availableSlots = generateMockSlots(requestedDate)
    return NextResponse.json({ availableSlots, metadata: { source: 'preview-mock' } })
  }
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
    // Dynamically import heavy modules only when not in preview
    const [{ withRateLimit }, { getAvailableSlots, testCalendarConnection }, { getCalendarIdForService }] = await Promise.all([
      import('@/lib/security/rate-limiting'),
      import('@/lib/ghl-calendar'),
      import('@/lib/ghl/calendar-mapping'),
    ])

    const handler = withRateLimit('public', 'availability')(async () => {
      let availableSlots: TimeSlot[] = [];
      let source: 'ghl' | 'mock' = 'mock';

      try {
        console.log('🔍 Testing GHL connection...');
        const isConnected = await Promise.race([
          testCalendarConnection(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000))
        ]);

        console.log(`🔍 GHL connection result: ${isConnected}`);
        if (isConnected) {
          const svcType = searchParams.get("serviceType") || "STANDARD_NOTARY";
          try {
            const calendarId = getCalendarIdForService(svcType);
            console.log(`📅 Using calendar ID for ${svcType}: ${calendarId}`);
            const startOfDay = requestedDate.startOf('day');
            const endOfDay = requestedDate.endOf('day');
            const ghlSlots = await Promise.race([
              getAvailableSlots(calendarId, startOfDay.toISO(), endOfDay.toISO(), 60),
              new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 10000))
            ]);
            availableSlots = ghlSlots.map((slot: any) => ({
              startTime: slot.startTime || slot.start,
              endTime: slot.endTime || slot.end,
              duration: slot.duration || 60,
              demand: slot.demand || 'low',
              available: slot.available !== false
            }));
            source = availableSlots.length > 0 ? 'ghl' : 'mock';
            if (availableSlots.length === 0) {
              availableSlots = generateMockSlots(requestedDate);
              source = 'mock';
            }
          } catch (calendarError) {
            console.warn(`Calendar mapping failed for ${svcType}, falling back to mock data:`, calendarError);
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
      cache.set(cacheKey, { data: response, expires: now + (5 * 60 * 1000) });
      for (const [key, value] of cache.entries()) if (value.expires <= now) cache.delete(key);
      return NextResponse.json(response);
    })

    return handler(request as any)
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}