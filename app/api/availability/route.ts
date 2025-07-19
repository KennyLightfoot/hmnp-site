import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DateTime } from 'luxon';
import { prisma } from '@/lib/prisma';
import { generateAvailableSlots } from '@/lib/availability/generateSlots';
import { redis } from '@/lib/redis';

// Input validation schema
const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  serviceId: z.string().min(1, 'Service ID is required'),
  duration: z.string().optional().nullable(), // Optional override for service duration
  timezone: z.string().optional().default('America/Chicago'), // Client timezone, default to business timezone
});

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  clientStartTime?: string;
  clientEndTime?: string;
  clientTimezone?: string;
  businessTimezone?: string;
}

interface BusinessHours {
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

// Default business hours if not configured in BusinessSettings
const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 1 }, // Monday
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 2 }, // Tuesday
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 3 }, // Wednesday
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 4 }, // Thursday
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 5 }, // Friday
  { startTime: '10:00', endTime: '15:00', dayOfWeek: 6 }, // Saturday (Limited hours)
  { startTime: '10:00', endTime: '15:00', dayOfWeek: 0 }, // Sunday (Limited hours)
];

// ---------------------------------------------------------------------------
// ⏰ Service-specific hour overrides (SOP compliant)
// ---------------------------------------------------------------------------
const SERVICE_HOUR_OVERRIDES: Record<string, { start: string; end: string }> = {
  EXTENDED_HOURS: { start: '07:00', end: '21:00' }, // 7 AM – 9 PM daily
  RON_SERVICES: { start: '00:00', end: '23:59' },  // 24/7 availability
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');
  const clientTimezone = searchParams.get('timezone') || 'America/Chicago';

  if (!date || !serviceId) {
    return NextResponse.json({ error: 'Date and serviceId are required' }, { status: 400 });
  }

  const cacheKey = `availability:${serviceId}:${date}`;
  const cachedSlots = await redis.get(cacheKey);

  if (cachedSlots) {
    return NextResponse.json(JSON.parse(cachedSlots));
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      date: searchParams.get('date'),
      serviceId: searchParams.get('serviceId'),
      duration: searchParams.get('duration') || searchParams.get('serviceDuration'),
      timezone: searchParams.get('timezone') || undefined,
    };

    console.log('[AVAILABILITY API] Query params:', queryParams);

    // Validate input parameters
    const validatedParams = availabilityQuerySchema.parse(queryParams);

    // Get business timezone from settings (default to America/Chicago)
    const businessSettings = await getBusinessSettings();
    const businessTimezone = businessSettings.business_timezone || 'America/Chicago';
    const requestedDate = DateTime.fromISO(date, { zone: businessTimezone });
    
    console.log('[AVAILABILITY API] Business timezone:', businessTimezone);
    
    // Convert requested date to business timezone for proper availability calculations
    const today = DateTime.now().setZone(businessTimezone);
    today.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    // Don't allow booking for past dates (compare in business timezone)
    if (requestedDate < today) {
      return NextResponse.json(
        { error: 'Cannot book appointments for past dates' },
        { status: 400 }
      );
    }

    // Get service details
    console.log('[AVAILABILITY API] Looking up service:', validatedParams.serviceId);
    const service = await prisma.service.findUnique({
      where: { id: validatedParams.serviceId },
    });

    if (!service || !service.isActive) {
      console.log('[AVAILABILITY API] Service not found or inactive:', service);
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      );
    }

    console.log('[AVAILABILITY API] Service found:', service.name);

    // Defensive duration parsing – fall back to service default or 60 mins
    const serviceDurationMinutes = intOrDefault(
      validatedParams.duration,
      service.durationMinutes || 60
    );

    // Get business hours for the requested day (using business timezone)
    const dayOfWeek = requestedDate.weekday;
    console.log('[DEBUG] Date:', validatedParams.date, 'Day of week:', dayOfWeek);
    console.log('[DEBUG] Business settings keys:', Object.keys(businessSettings).filter(k => k.includes('hours')));
    
    let businessHours = await getBusinessHoursForDay(dayOfWeek, businessSettings);

    // Override with service-specific hours if defined
    const override = SERVICE_HOUR_OVERRIDES[service.serviceType as string];
    if (override) {
      businessHours = {
        startTime: override.start,
        endTime: override.end,
        dayOfWeek,
      };
    }
    console.log('[DEBUG] Business hours result:', businessHours);

    if (!businessHours) {
      console.log('[DEBUG] No business hours found for day', dayOfWeek);
      return NextResponse.json({
        date: validatedParams.date,
        availableSlots: [],
        message: 'No business hours configured for this day',
      });
    }

    // Check for blackout dates (holidays, etc.) - check using business timezone
    const isBlackoutDate = await checkBlackoutDate(requestedDate.toJSDate(), businessSettings);
    if (isBlackoutDate) {
      return NextResponse.json({
        date: validatedParams.date,
        availableSlots: [],
        message: 'This date is not available for bookings',
      });
    }

    // Get existing bookings for the date (using business timezone)
    const existingBookings = await getExistingBookings(requestedDate.toJSDate());

    // Calculate lead time (minimum hours before booking)
    const leadTimeHours = getLeadTime(businessSettings);
    const minimumBookingTime = DateTime.now().setZone(businessTimezone).plus({ hours: leadTimeHours });

    // Calculate available slots (with timezone support)
    const availableSlots = await generateAvailableSlots({
      businessHours,
      requestedDate,
      serviceId: validatedParams.serviceId,
      existingBookings,
      minimumBookingTime,
      businessTimezone,
      clientTimezone,
    });

    console.log('[AVAILABILITY API] Calculated', availableSlots.length, 'time slots');

    // Include timezone information in the response
    const response = {
      date: validatedParams.date,
      availableSlots,
      serviceInfo: {
        name: service.name,
        duration: serviceDurationMinutes,
        price: service.basePrice,
      },
      businessHours: {
        startTime: businessHours.startTime,
        endTime: businessHours.endTime,
      },
      timezoneInfo: {
        businessTimezone,
        clientTimezone,
        timezoneSupported: true,
      },
    };
    await redis.set(cacheKey, JSON.stringify(response), 60); // AC-4

    return NextResponse.json(response);

  } catch (error) {
    console.error('[AVAILABILITY API] Error occurred:', error);
    console.error('[AVAILABILITY API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[AVAILABILITY API] Request URL:', request.url);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    // singleton - do not disconnect
  }
}

// Helper function to get business settings
async function getBusinessSettings() {
  const settings = await prisma.businessSettings.findMany({
    where: { category: 'booking' },
  });

  return settings.reduce((acc: Record<string, string>, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);
}

// Helper function to get business hours for a specific day
async function getBusinessHoursForDay(dayOfWeek: number, businessSettings: Record<string, string>): Promise<BusinessHours | null> {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek - 1]; // Luxon weekday is 1-7, array is 0-6
  
  const startTimeKey = `business_hours_${dayName}_start`;
  const endTimeKey = `business_hours_${dayName}_end`;
  
  const startTime = businessSettings[startTimeKey];
  const endTime = businessSettings[endTimeKey];
  
  // If no custom hours set, use defaults
  if (!startTime || !endTime) {
    const defaultHours = DEFAULT_BUSINESS_HOURS.find(h => h.dayOfWeek === dayOfWeek);
    return defaultHours || null;
  }
  
  return {
    startTime,
    endTime,
    dayOfWeek,
  };
}

// Helper function to check if date is a blackout date
async function checkBlackoutDate(date: Date, businessSettings: Record<string, string>): Promise<boolean> {
  const blackoutDatesStr = businessSettings.blackout_dates || '';
  if (!blackoutDatesStr) return false;
  
  try {
    const blackoutDates = JSON.parse(blackoutDatesStr);
    const dateStr = DateTime.fromJSDate(date).toISODate();
    return blackoutDates.includes(dateStr);
  } catch {
    return false;
  }
}

// Helper function to get existing bookings for a date
async function getExistingBookings(date: Date) {
  const startOfDay = DateTime.fromJSDate(date).startOf('day').toJSDate();
  
  const endOfDay = DateTime.fromJSDate(date).endOf('day').toJSDate();

  return await prisma.booking.findMany({
    where: {
      scheduledDateTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        notIn: ['CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF', 'NO_SHOW', 'ARCHIVED'],
      },
    },
      include: {
    service: true,
  },
  });
}

// Helper function to get lead time
function getLeadTime(businessSettings: Record<string, string>): number {
  return intOrDefault(businessSettings.minimum_lead_time_hours, 2);
}

// ---------------------------------------------------------------------------
// 🛡️ Utility helpers (defensive parsing)
// ---------------------------------------------------------------------------

function intOrDefault(raw: unknown, fallback: number): number {
  const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}