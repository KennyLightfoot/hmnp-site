import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { format, toZonedTime } from 'date-fns-tz';
import { prisma } from '@/lib/prisma';

// Input validation schema
const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  serviceId: z.string().min(1, 'Service ID is required'),
  duration: z.string().optional().nullable(),
  timezone: z.string().optional().default('America/Chicago'),
});

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    errors: [],
    data: {}
  };

  try {
    debugInfo.steps.push('Starting debug endpoint');
    
    // Step 1: Parse URL parameters
    debugInfo.steps.push('Parsing URL parameters');
    const { searchParams } = new URL(request.url);
    const queryParams = {
      date: searchParams.get('date'),
      serviceId: searchParams.get('serviceId'),
      duration: searchParams.get('duration') || searchParams.get('serviceDuration'),
      timezone: searchParams.get('timezone') || undefined,
    };
    debugInfo.data.rawParams = queryParams;

    // Step 2: Validate parameters
    debugInfo.steps.push('Validating parameters');
    let validatedParams;
    try {
      validatedParams = availabilityQuerySchema.parse(queryParams);
      debugInfo.data.validatedParams = validatedParams;
      debugInfo.steps.push('Parameters validated successfully');
    } catch (error) {
      debugInfo.errors.push({
        step: 'Parameter validation',
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof z.ZodError ? error.errors : undefined
      });
      throw error;
    }

    // Step 3: Test Prisma connection
    debugInfo.steps.push('Testing Prisma connection');
    try {
      await prisma.$connect();
      debugInfo.steps.push('Prisma connection successful');
    } catch (error) {
      debugInfo.errors.push({
        step: 'Prisma connection',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

    // Step 4: Test Service lookup
    debugInfo.steps.push('Looking up service');
    let service;
    try {
      service = await prisma.Service.findUnique({
        where: { id: validatedParams.serviceId },
      });
      debugInfo.data.service = service;
      if (!service) {
        debugInfo.errors.push({
          step: 'Service lookup',
          error: 'Service not found'
        });
        throw new Error('Service not found');
      }
      if (!service.isActive) {
        debugInfo.errors.push({
          step: 'Service lookup',
          error: 'Service not active'
        });
        throw new Error('Service not active');
      }
      debugInfo.steps.push('Service lookup successful');
    } catch (error) {
      debugInfo.errors.push({
        step: 'Service lookup',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

    // Step 5: Test BusinessSettings query
    debugInfo.steps.push('Fetching business settings');
    let businessSettings;
    try {
      const settings = await prisma.BusinessSettings.findMany({
        where: { category: 'booking' },
      });
      businessSettings = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      debugInfo.data.businessSettings = businessSettings;
      debugInfo.data.businessSettingsCount = settings.length;
      debugInfo.steps.push('Business settings fetch successful');
    } catch (error) {
      debugInfo.errors.push({
        step: 'Business settings fetch',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

    // Step 6: Test date calculations
    debugInfo.steps.push('Testing date calculations');
    try {
      const businessTimezone = businessSettings.business_timezone || 'America/Chicago';
      const requestedDateInClientTz = new Date(`${validatedParams.date}T00:00:00`);
      const requestedDateInBusinessTz = toZonedTime(requestedDateInClientTz, businessTimezone);
      const dayOfWeek = requestedDateInBusinessTz.getDay();
      
      debugInfo.data.dateCalculations = {
        businessTimezone,
        requestedDateInClientTz: requestedDateInClientTz.toISOString(),
        requestedDateInBusinessTz: requestedDateInBusinessTz.toISOString(),
        dayOfWeek
      };
      debugInfo.steps.push('Date calculations successful');
    } catch (error) {
      debugInfo.errors.push({
        step: 'Date calculations',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

    // Step 7: Test business hours lookup
    debugInfo.steps.push('Testing business hours lookup');
    try {
      const dayOfWeek = debugInfo.data.dateCalculations.dayOfWeek;
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];
      
      const startTimeKey = `business_hours_${dayName}_start`;
      const endTimeKey = `business_hours_${dayName}_end`;
      
      const startTime = businessSettings[startTimeKey];
      const endTime = businessSettings[endTimeKey];
      
      debugInfo.data.businessHours = {
        dayName,
        startTimeKey,
        endTimeKey,
        startTime,
        endTime,
        hasCustomHours: !!(startTime && endTime)
      };
      debugInfo.steps.push('Business hours lookup successful');
    } catch (error) {
      debugInfo.errors.push({
        step: 'Business hours lookup',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

    // Step 8: Test bookings query
    debugInfo.steps.push('Testing bookings query');
    try {
      const requestedDate = new Date(debugInfo.data.dateCalculations.requestedDateInBusinessTz);
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBookings = await prisma.Booking.findMany({
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

      debugInfo.data.existingBookings = {
        count: existingBookings.length,
        bookings: existingBookings.map(b => ({
          id: b.id,
          scheduledDateTime: b.scheduledDateTime,
          status: b.status,
          serviceName: b.Service?.name
        }))
      };
      debugInfo.steps.push('Bookings query successful');
    } catch (error) {
      debugInfo.errors.push({
        step: 'Bookings query',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

    debugInfo.steps.push('All tests completed successfully');
    debugInfo.success = true;

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'All availability API components tested successfully'
    });

  } catch (error) {
    debugInfo.errors.push({
      step: 'Final catch',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    console.error('Debug availability error:', error);
    console.error('Debug info:', JSON.stringify(debugInfo, null, 2));

    return NextResponse.json({
      success: false,
      debug: debugInfo,
      finalError: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      debugInfo.errors.push({
        step: 'Prisma disconnect',
        error: e instanceof Error ? e.message : String(e)
      });
    }
  }
}