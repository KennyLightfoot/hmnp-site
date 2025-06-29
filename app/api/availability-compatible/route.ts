import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { format, toZonedTime } from 'date-fns-tz';
import { prisma } from '@/lib/database-connection';
import { handleAPIError, BookingErrors, ErrorCategory, ErrorSeverity, retryWithBackoff } from '@/lib/monitoring/error-handler';

// Input validation schema
const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  serviceId: z.string().min(1, 'Service ID is required'),
  duration: z.string().optional().nullable(),
  timezone: z.string().optional().default('America/Chicago'),
});

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BusinessHours {
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

// Default business hours
const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 1 }, // Monday
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 2 }, // Tuesday
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 3 }, // Wednesday
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 4 }, // Thursday
  { startTime: '09:00', endTime: '17:00', dayOfWeek: 5 }, // Friday
  { startTime: '10:00', endTime: '15:00', dayOfWeek: 6 }, // Saturday
];

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || `avail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[AVAILABILITY COMPATIBLE] Starting request processing: ${requestId}`, new Date().toISOString());
  
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      date: searchParams.get('date'),
      serviceId: searchParams.get('serviceId'),
      duration: searchParams.get('duration') || searchParams.get('serviceDuration'),
      timezone: searchParams.get('timezone') || undefined,
    };

    console.log('[AVAILABILITY COMPATIBLE] Query params:', queryParams);

    // Validate input parameters with enhanced error messages
    let validatedParams;
    try {
      validatedParams = availabilityQuerySchema.parse(queryParams);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const error = validationError.errors[0];
        if (error.path.includes('serviceId')) {
          throw BookingErrors.SERVICE_NOT_FOUND(queryParams.serviceId || 'missing');
        } else if (error.path.includes('date')) {
          throw BookingErrors.INVALID_DATE(queryParams.date || 'missing');
        }
      }
      throw validationError;
    }

    // Check database schema compatibility with retry
    const serviceColumns = await retryWithBackoff(
      () => prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Service'
      ` as Promise<Array<{ column_name: string }>>,
      3,
      1000,
      { requestId, url: request.url }
    );
    
    const columnNames = serviceColumns.map(col => col.column_name);
    const hasIsActive = columnNames.includes('isActive');
    const hasDurationMinutes = columnNames.includes('durationMinutes');
    
    console.log('[AVAILABILITY COMPATIBLE] Schema compatibility:', { hasIsActive, hasDurationMinutes });

    // Get service details with compatibility handling
    let service;
    if (hasIsActive && hasDurationMinutes) {
      // New schema
      service = await prisma.service.findUnique({
        where: { id: validatedParams.serviceId },
      });
      if (!service || !service.isActive) {
        throw BookingErrors.SERVICE_NOT_FOUND(validatedParams.serviceId);
      }
    } else {
      // Legacy schema - use raw SQL
      const services = await prisma.$queryRaw`
        SELECT id, name, 90 as "durationMinutes", true as "isActive"
        FROM "Service" 
        WHERE id = ${validatedParams.serviceId}
        LIMIT 1
      ` as any[];
      
      service = services[0];
      if (!service) {
        throw BookingErrors.SERVICE_NOT_FOUND(validatedParams.serviceId);
      }
    }

    console.log('[AVAILABILITY COMPATIBLE] Service found:', service.name || service.id);

    // Get service duration (use override if provided, otherwise service default)
    const serviceDurationMinutes = validatedParams.duration
      ? parseInt(validatedParams.duration)
      : (service.durationMinutes || 90);

    // Get business timezone (default to America/Chicago since BusinessSettings might not exist)
    const businessTimezone = 'America/Chicago';
    
    // Convert requested date to business timezone
    const requestedDateInClientTz = new Date(`${validatedParams.date}T00:00:00`);
    const requestedDateInBusinessTz = toZonedTime(requestedDateInClientTz, businessTimezone);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow booking for past dates
    if (requestedDateInBusinessTz < today) {
      throw BookingErrors.INVALID_DATE(validatedParams.date);
    }

    // Get business hours for the requested day
    const dayOfWeek = requestedDateInBusinessTz.getDay();
    const businessHours = DEFAULT_BUSINESS_HOURS.find(h => h.dayOfWeek === dayOfWeek);

    if (!businessHours) {
      throw BookingErrors.NO_AVAILABILITY(validatedParams.date);
    }

    // Calculate available slots (simplified for compatibility)
    const availableSlots = calculateSimpleAvailableSlots({
      businessHours,
      requestedDate: requestedDateInBusinessTz,
      serviceDurationMinutes,
      businessTimezone,
    });

    console.log('[AVAILABILITY COMPATIBLE] Calculated', availableSlots.length, 'time slots');

    return NextResponse.json({
      date: validatedParams.date,
      availableSlots,
      serviceInfo: {
        name: service.name || 'Mobile Notary Service',
        duration: serviceDurationMinutes,
        price: service.price || service.basePrice || 75,
      },
      businessHours: {
        startTime: businessHours.startTime,
        endTime: businessHours.endTime,
      },
      timezoneInfo: {
        businessTimezone,
        clientTimezone: validatedParams.timezone,
        timezoneSupported: true,
      },
      compatibility: { hasIsActive, hasDurationMinutes }
    });

  } catch (error) {
    console.error(`[AVAILABILITY COMPATIBLE] Error in request ${requestId}:`, error);
    
    const errorResponse = await handleAPIError(error as Error, {
      requestId,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      additionalData: {
        queryParams: Object.fromEntries(new URL(request.url).searchParams),
        endpoint: 'availability-compatible'
      }
    });

    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
}

// Simplified slot calculation function
function calculateSimpleAvailableSlots({
  businessHours,
  requestedDate,
  serviceDurationMinutes,
  businessTimezone,
}: {
  businessHours: BusinessHours;
  requestedDate: Date;
  serviceDurationMinutes: number;
  businessTimezone: string;
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
  
  // Get minimum booking time (2 hours from now)
  const minimumBookingTime = new Date();
  minimumBookingTime.setHours(minimumBookingTime.getHours() + 2);
  
  // Generate 30-minute time slots
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
    
    // Format times
    const slotStartTime = format(currentSlot, 'HH:mm', { timeZone: businessTimezone });
    const slotEndTime = format(slotEnd, 'HH:mm', { timeZone: businessTimezone });
    
    slots.push({
      startTime: slotStartTime,
      endTime: slotEndTime,
      available: isAfterMinimumTime,
    });
    
    // Move to next 30-minute slot
    currentSlot.setMinutes(currentSlot.getMinutes() + 30);
  }
  
  return slots;
}