import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { format, toZonedTime } from 'date-fns-tz';
import { prisma } from '@/lib/prisma';

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
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      date: searchParams.get('date'),
      serviceId: searchParams.get('serviceId'),
      duration: searchParams.get('duration') || searchParams.get('serviceDuration'),
      timezone: searchParams.get('timezone') || undefined,
    };

    console.log('Availability API called with params:', queryParams);

    // Validate input parameters
    const validatedParams = availabilityQuerySchema.parse(queryParams);

    // Get business timezone from settings (default to America/Chicago)
    const businessSettings = await getBusinessSettings();
    const businessTimezone = businessSettings.business_timezone || 'America/Chicago';
    const clientTimezone = validatedParams.timezone;
    
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

    // Get service details
    const service = await prisma.Service.findUnique({
      where: { id: validatedParams.serviceId },
    });

    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      );
    }

    // Get service duration (use override if provided, otherwise service default)
    const serviceDurationMinutes = validatedParams.duration
      ? parseInt(validatedParams.duration)
      : service.durationMinutes;

    // Get business hours for the requested day (using business timezone)
    const dayOfWeek = requestedDateInBusinessTz.getDay();
    const businessHours = await getBusinessHoursForDay(dayOfWeek, businessSettings);

    if (!businessHours) {
      return NextResponse.json({
        date: validatedParams.date,
        availableSlots: [],
        message: 'No business hours configured for this day',
      });
    }

    // Check for blackout dates (holidays, etc.) - check using business timezone
    const isBlackoutDate = await checkBlackoutDate(requestedDateInBusinessTz, businessSettings);
    if (isBlackoutDate) {
      return NextResponse.json({
        date: validatedParams.date,
        availableSlots: [],
        message: 'This date is not available for bookings',
      });
    }

    // Get existing bookings for the date (using business timezone)
    const existingBookings = await getExistingBookings(requestedDateInBusinessTz);

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

    // Include timezone information in the response
    return NextResponse.json({
      date: validatedParams.date,
      availableSlots,
      serviceInfo: {
        name: service.name,
        duration: serviceDurationMinutes,
        price: Number(service.basePrice),
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
    console.error('Availability API error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    // Return more detailed error information in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        error: isDevelopment ? error instanceof Error ? error.message : 'Unknown error' : 'Internal server error',
        ...(isDevelopment && { details: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    );
  }
}

// Helper function to get business settings
async function getBusinessSettings() {
  try {
    const settings = await prisma.BusinessSettings.findMany({
      where: { category: 'booking' },
    });

    const businessSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    console.log('Business settings loaded:', Object.keys(businessSettings));
    return businessSettings;
  } catch (error) {
    console.error('Error fetching business settings:', error);
    // Return empty settings object on error - will use defaults
    return {};
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
    const dateStr = date.toISOString().split('T')[0];
    return blackoutDates.includes(dateStr);
  } catch {
    return false;
  }
}

// Helper function to get existing bookings for a date
async function getExistingBookings(date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.Booking.findMany({
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
        Service: true,
      },
    });

    console.log(`Found ${bookings.length} existing bookings for ${date.toDateString()}`);
    return bookings;
  } catch (error) {
    console.error('Error fetching existing bookings:', error);
    // Return empty array on error - will show all slots as available
    return [];
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
      
      // Use Service duration with buffer time
      const duration = booking.Service?.durationMinutes ?? serviceDurationMinutes;
      bookingEnd.setMinutes(bookingEnd.getMinutes() + duration + bufferTimeMinutes);
      
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