import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { format, toZonedTime, getTimezoneOffset } from 'date-fns-tz';
import { addMinutes, isBefore, isAfter, isSameDay } from 'date-fns';
import { prisma } from '@/lib/database-connection';

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
  // Sunday closed by default
];

export async function GET(request: NextRequest) {
  const startTime = new Date();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[AVAILABILITY API ${requestId}] Starting request processing:`, {
    timestamp: startTime.toISOString(),
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  });
  
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      date: searchParams.get('date'),
      serviceId: searchParams.get('serviceId'),
      duration: searchParams.get('duration') || searchParams.get('serviceDuration'),
      timezone: searchParams.get('timezone') || undefined,
    };

    console.log(`[AVAILABILITY API ${requestId}] Raw query params:`, queryParams);

    // Input validation with detailed error reporting
    let validatedParams;
    try {
      validatedParams = availabilityQuerySchema.parse(queryParams);
      console.log(`[AVAILABILITY API ${requestId}] Validation successful:`, validatedParams);
    } catch (validationError) {
      console.error(`[AVAILABILITY API ${requestId}] Validation failed:`, {
        error: validationError,
        queryParams,
        validationErrors: validationError instanceof z.ZodError ? validationError.errors : 'Unknown validation error'
      });
      throw validationError;
    }

    // Get business timezone from settings (default to America/Chicago)
    let businessSettings;
    try {
      businessSettings = await getBusinessSettings();
      console.log(`[AVAILABILITY API ${requestId}] Business settings loaded:`, {
        settingsCount: Object.keys(businessSettings).length,
        hasTimezone: !!businessSettings.business_timezone,
        businessTimezone: businessSettings.business_timezone
      });
    } catch (settingsError) {
      console.error(`[AVAILABILITY API ${requestId}] Failed to load business settings:`, settingsError);
      throw new Error('Failed to load business configuration');
    }
    
    const businessTimezone = businessSettings.business_timezone || 'America/Chicago';
    const clientTimezone = validatedParams.timezone;
    
    console.log(`[AVAILABILITY API ${requestId}] Timezone configuration:`, {
      businessTimezone,
      clientTimezone,
      requestedDate: validatedParams.date
    });
    
    // Convert requested date to business timezone for proper availability calculations
    const requestedDateInClientTz = new Date(`${validatedParams.date}T00:00:00`);
    const requestedDateInBusinessTz = toZonedTime(requestedDateInClientTz, businessTimezone);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow booking for past dates (compare in business timezone)
    if (requestedDateInBusinessTz < today) {
      return NextResponse.json(
        { error: 'Cannot book appointments for past dates' },
        { status: 400 }
      );
    }

    // Get service details with comprehensive error handling
    console.log(`[AVAILABILITY API ${requestId}] Looking up service:`, validatedParams.serviceId);
    let service;
    try {
      service = await prisma.service.findUnique({
        where: { id: validatedParams.serviceId },
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          basePrice: true,
          isActive: true,
          serviceType: true,
          requiresDeposit: true,
          depositAmount: true
        }
      });
      
      console.log(`[AVAILABILITY API ${requestId}] Service query result:`, {
        serviceExists: !!service,
        serviceId: validatedParams.serviceId,
        serviceName: service?.name,
        isActive: service?.isActive
      });
    } catch (serviceError) {
      console.error(`[AVAILABILITY API ${requestId}] Database error during service lookup:`, {
        error: serviceError,
        serviceId: validatedParams.serviceId,
        stack: serviceError instanceof Error ? serviceError.stack : 'No stack'
      });
      throw new Error('Database error while looking up service');
    }

    if (!service) {
      console.warn(`[AVAILABILITY API ${requestId}] Service not found:`, {
        requestedServiceId: validatedParams.serviceId,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          error: 'Service not found',
          details: 'The requested service ID does not exist in the system',
          serviceId: validatedParams.serviceId,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }
    
    if (!service.isActive) {
      console.warn(`[AVAILABILITY API ${requestId}] Service inactive:`, {
        serviceId: validatedParams.serviceId,
        serviceName: service.name,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          error: 'Service not available',
          details: 'The requested service is currently inactive',
          serviceId: validatedParams.serviceId,
          serviceName: service.name,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    console.log(`[AVAILABILITY API ${requestId}] Service validated:`, {
      id: service.id,
      name: service.name,
      duration: service.durationMinutes,
      price: service.basePrice
    });

    // Get service duration (use override if provided, otherwise service default)
        const serviceDurationMinutes = validatedParams.duration
      ? parseInt(validatedParams.duration)
      : service.durationMinutes;

    // Get business hours for the requested day (using business timezone)
    const dayOfWeek = requestedDateInBusinessTz.getDay();
    console.log('[DEBUG] Date:', validatedParams.date, 'Day of week:', dayOfWeek);
    console.log('[DEBUG] Business settings keys:', Object.keys(businessSettings).filter(k => k.includes('hours')));
    
    const businessHours = await getBusinessHoursForDay(dayOfWeek, businessSettings);
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
    let isBlackoutDate;
    try {
      isBlackoutDate = await checkBlackoutDate(requestedDateInBusinessTz, businessSettings);
      console.log(`[AVAILABILITY API ${requestId}] Blackout date check:`, {
        date: validatedParams.date,
        isBlackout: isBlackoutDate,
        dayOfWeek: requestedDateInBusinessTz.getDay()
      });
    } catch (blackoutError) {
      console.error(`[AVAILABILITY API ${requestId}] Error checking blackout dates:`, blackoutError);
      // Continue processing, assume not blackout if check fails
      isBlackoutDate = false;
    }
    
    if (isBlackoutDate) {
      console.log(`[AVAILABILITY API ${requestId}] Date blocked - blackout date:`, validatedParams.date);
      return NextResponse.json({
        date: validatedParams.date,
        availableSlots: [],
        message: 'This date is not available for bookings (holiday or blackout date)',
        reason: 'blackout_date',
        timestamp: new Date().toISOString()
      });
    }

    // Get existing bookings for the date (using business timezone)
    let existingBookings;
    try {
      existingBookings = await getExistingBookings(requestedDateInBusinessTz);
      console.log(`[AVAILABILITY API ${requestId}] Existing bookings loaded:`, {
        date: validatedParams.date,
        bookingCount: existingBookings.length,
        bookingIds: existingBookings.map(b => b.id)
      });
    } catch (bookingsError) {
      console.error(`[AVAILABILITY API ${requestId}] Error loading existing bookings:`, bookingsError);
      throw new Error('Failed to load existing bookings');
    }

    // Calculate lead time (minimum hours before booking)
    const leadTimeHours = getLeadTime(businessSettings);
    const minimumBookingTime = new Date();
    minimumBookingTime.setHours(minimumBookingTime.getHours() + leadTimeHours);

    // Calculate available slots (with timezone support)
    const availableSlots = calculateAvailableSlots({
      businessHours,
      requestedDate: requestedDateInBusinessTz,
      serviceDurationMinutes,
      existingBookings,
      minimumBookingTime,
      businessSettings,
      businessTimezone,
      clientTimezone,
    });

    const processingTime = new Date().getTime() - startTime.getTime();
    console.log(`[AVAILABILITY API ${requestId}] Processing completed:`, {
      availableSlots: availableSlots.length,
      totalSlots: availableSlots.length,
      availableCount: availableSlots.filter(s => s.available).length,
      processingTimeMs: processingTime
    });

    // Include timezone information in the response
    return NextResponse.json({
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
    });

  } catch (error) {
    const processingTime = new Date().getTime() - startTime.getTime();
    
    console.error(`[AVAILABILITY API ${requestId}] ERROR:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack available',
      requestUrl: request.url,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
      errorType: error?.constructor?.name || 'Unknown'
    });

    // Log to database for production monitoring
    try {
      await prisma.backgroundError.create({
        data: {
          id: `avail_${requestId}_${Date.now()}`,
          source: 'availability-api',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : null,
        }
      });
    } catch (logError) {
      console.error(`[AVAILABILITY API ${requestId}] Failed to log error to database:`, logError);
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code
          })),
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Return different error messages based on error type
    if (error instanceof Error && error.message.includes('Service not found')) {
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          details: 'The requested service is not properly configured',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { 
          error: 'Service temporarily unavailable',
          details: 'Please try again in a few moments',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'An unexpected error occurred',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    // singleton - do not disconnect
  }
}

// Helper function to get business settings with error handling
async function getBusinessSettings() {
  try {
    const settings = await prisma.businessSettings.findMany({
      where: { category: 'booking' },
      select: {
        key: true,
        value: true,
        dataType: true
      }
    });

    console.log('[BUSINESS SETTINGS] Loaded settings:', {
      count: settings.length,
      keys: settings.map(s => s.key)
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    // Add default holiday checking for July 4th
    if (!settingsMap.blackout_dates) {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const defaultHolidays = [
        `${currentYear}-07-04`, // July 4th current year
        `${nextYear}-07-04`,    // July 4th next year
        `${currentYear}-12-25`, // Christmas current year
        `${nextYear}-12-25`,    // Christmas next year
        `${currentYear}-01-01`, // New Year current year
        `${nextYear}-01-01`     // New Year next year
      ];
      settingsMap.blackout_dates = JSON.stringify(defaultHolidays);
      console.log('[BUSINESS SETTINGS] Applied default holiday blackout dates:', defaultHolidays);
    }
    
    return settingsMap;
  } catch (error) {
    console.error('[BUSINESS SETTINGS] Error loading settings:', error);
    throw new Error('Failed to load business settings');
  }
}

// Helper function to get business hours for a specific day
async function getBusinessHoursForDay(dayOfWeek: number, businessSettings: Record<string, string>): Promise<BusinessHours | null> {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  const startTimeKey = `business_hours_${dayName}_start`;
  const endTimeKey = `business_hours_${dayName}_end`;
  
  const startTime = businessSettings[startTimeKey];
  const endTime = businessSettings[endTimeKey];
  
  console.log('[BUSINESS HOURS] Checking hours for day:', {
    dayOfWeek,
    dayName,
    startTimeKey,
    endTimeKey,
    startTime,
    endTime,
    hasStartTime: !!startTime,
    hasEndTime: !!endTime
  });
  
  // If no custom hours set, use defaults
  if (!startTime || !endTime) {
    const defaultHours = DEFAULT_BUSINESS_HOURS.find(h => h.dayOfWeek === dayOfWeek);
    console.log('[BUSINESS HOURS] Using default hours:', {
      dayOfWeek,
      defaultHours,
      allDefaults: DEFAULT_BUSINESS_HOURS
    });
    return defaultHours || null;
  }
  
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    console.error('[BUSINESS HOURS] Invalid time format:', {
      startTime,
      endTime,
      dayOfWeek
    });
    // Fall back to defaults
    const defaultHours = DEFAULT_BUSINESS_HOURS.find(h => h.dayOfWeek === dayOfWeek);
    return defaultHours || null;
  }
  
  console.log('[BUSINESS HOURS] Using configured hours:', {
    dayOfWeek,
    startTime,
    endTime
  });
  
  return {
    startTime,
    endTime,
    dayOfWeek,
  };
}

// Helper function to check if date is a blackout date
async function checkBlackoutDate(date: Date, businessSettings: Record<string, string>): Promise<boolean> {
  const blackoutDatesStr = businessSettings.blackout_dates || '';
  if (!blackoutDatesStr) {
    console.log('[BLACKOUT CHECK] No blackout dates configured');
    return false;
  }
  
  try {
    const blackoutDates = JSON.parse(blackoutDatesStr);
    const dateStr = date.toISOString().split('T')[0];
    
    console.log('[BLACKOUT CHECK] Checking date:', {
      requestedDate: dateStr,
      blackoutDates: blackoutDates,
      isBlocked: blackoutDates.includes(dateStr)
    });
    
    // Special handling for July 4th (Independence Day)
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const isJuly4th = month === 7 && day === 4;
    
    if (isJuly4th) {
      console.log('[BLACKOUT CHECK] July 4th detected - Independence Day holiday');
    }
    
    return blackoutDates.includes(dateStr) || isJuly4th;
  } catch (parseError) {
    console.error('[BLACKOUT CHECK] Error parsing blackout dates:', {
      error: parseError,
      blackoutDatesStr
    });
    return false;
  }
}

// Helper function to get existing bookings for a date
async function getExistingBookings(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        scheduledDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF', 'NO_SHOW', 'ARCHIVED'],
        },
      },
      select: {
        id: true,
        scheduledDateTime: true,
        status: true,
        Service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true
          }
        }
      },
    });
    
    console.log('[EXISTING BOOKINGS] Query result:', {
      dateRange: `${startOfDay.toISOString()} to ${endOfDay.toISOString()}`,
      foundBookings: bookings.length,
      bookingDetails: bookings.map(b => ({
        id: b.id,
        time: b.scheduledDateTime?.toISOString(),
        status: b.status,
        service: b.Service?.name
      }))
    });
    
    return bookings;
  } catch (error) {
    console.error('[EXISTING BOOKINGS] Database query failed:', error);
    throw new Error('Failed to retrieve existing bookings');
  }
}

// Helper function to get lead time
function getLeadTime(businessSettings: Record<string, string>): number {
  const leadTimeStr = businessSettings.minimum_lead_time_hours || '2';
  return parseInt(leadTimeStr);
}

// Main function to calculate available slots
function calculateAvailableSlots({
  businessHours,
  requestedDate,
  serviceDurationMinutes,
  existingBookings,
  minimumBookingTime,
  businessSettings,
  businessTimezone = 'America/Chicago',
  clientTimezone,
}: {
  businessHours: BusinessHours;
  requestedDate: Date;
  serviceDurationMinutes: number;
  existingBookings: any[];
  minimumBookingTime: Date;
  businessSettings: Record<string, string>;
  businessTimezone?: string;
  clientTimezone?: string;
}): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Parse business hours
  const [startHour, startMinute] = businessHours.startTime.split(':').map(Number);
  const [endHour, endMinute] = businessHours.endTime.split(':').map(Number);
  
  // Create start and end times for the day
  const dayStart = new Date(requestedDate);
  dayStart.setHours(startHour, startMinute, 0, 0);
  
  const dayEnd = new Date(requestedDate);
  dayEnd.setHours(endHour, endMinute, 0, 0);
  
  // Get slot interval (default 30 minutes)
  const slotIntervalMinutes = parseInt(businessSettings.slot_interval_minutes || '30');
  
  // Get buffer time between appointments (default 15 minutes)
  const bufferTimeMinutes = parseInt(businessSettings.buffer_time_minutes || '15');
  
  // Generate time slots
  const currentSlot = new Date(dayStart);
  
  while (currentSlot < dayEnd) {
    const slotEnd = new Date(currentSlot);
    slotEnd.setMinutes(slotEnd.getMinutes() + serviceDurationMinutes);
    
    // Check if slot would exceed business hours
    if (slotEnd > dayEnd) {
      break;
    }
    
    // Check if slot is after minimum booking time
    const isAfterMinimumTime = currentSlot >= minimumBookingTime;
    
    // Check for conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      if (!booking.scheduledDateTime) return false;
      
      const bookingStart = new Date(booking.scheduledDateTime);
      const bookingEnd = new Date(bookingStart);
              bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.Service.durationMinutes + bufferTimeMinutes);
      
      // Check if there's any overlap
      return (currentSlot < bookingEnd && slotEnd > bookingStart);
    });
    
    const available = isAfterMinimumTime && !hasConflict;
    
    // Format times in proper timezone for client
    const slotStartTime = format(currentSlot, 'HH:mm', {
      timeZone: businessTimezone
    });
    
    const slotEndTime = format(slotEnd, 'HH:mm', {
      timeZone: businessTimezone
    });
    
    // If client timezone is different, include offset information
    let clientStartTime, clientEndTime;
    if (clientTimezone && clientTimezone !== businessTimezone) {
      // Convert time to client's timezone
      const clientSlotStart = toZonedTime(currentSlot, clientTimezone);
      const clientSlotEnd = toZonedTime(slotEnd, clientTimezone);
      
      clientStartTime = format(clientSlotStart, 'HH:mm', {
        timeZone: clientTimezone
      });
      
      clientEndTime = format(clientSlotEnd, 'HH:mm', {
        timeZone: clientTimezone
      });
    }
    
    slots.push({
      startTime: slotStartTime,
      endTime: slotEndTime,
      available,
      ...(clientTimezone && clientTimezone !== businessTimezone ? {
        clientStartTime,
        clientEndTime,
        clientTimezone,
        businessTimezone
      } : {})
    });
    
    // Move to next slot
    currentSlot.setMinutes(currentSlot.getMinutes() + slotIntervalMinutes);
  }
  
  return slots;
}