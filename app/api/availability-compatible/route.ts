/**
 * DIAGNOSTIC ENDPOINT: Mock availability for GHL integration testing
 * 
 * This endpoint provides mock availability data to test if incomplete GHL integration
 * is the root cause of booking system failures. When /api/availability fails due to
 * database issues, this provides fallback data to keep the booking flow working.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addMinutes, format, startOfDay } from 'date-fns';

// Input validation schema matching the main availability endpoint
const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  serviceId: z.string().min(1, 'Service ID is required'),
  duration: z.string().optional().nullable(),
  timezone: z.string().optional().default('America/Chicago'),
});

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🔧 MOCK AVAILABILITY API [${requestId}] Starting...`);
  
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      date: searchParams.get('date'),
      serviceId: searchParams.get('serviceId'),
      duration: searchParams.get('duration') || searchParams.get('serviceDuration'),
      timezone: searchParams.get('timezone') || undefined,
    };

    console.log(`🔧 MOCK AVAILABILITY [${requestId}] Query params:`, queryParams);

    // Try main availability endpoint first
    try {
      const mainEndpointUrl = new URL('/api/availability', new URL(request.url).origin);
      mainEndpointUrl.search = new URL(request.url).search;
      
      console.log(`🔧 MOCK AVAILABILITY [${requestId}] Trying main endpoint:`, mainEndpointUrl.toString());
      
      const response = await fetch(mainEndpointUrl.toString(), {
        headers: {
          'User-Agent': 'Compatibility-Layer-Mock'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ MOCK AVAILABILITY [${requestId}] Main endpoint succeeded, returning real data`);
        return NextResponse.json({
          ...data,
          _source: 'MAIN_ENDPOINT',
          _compatibility_layer: true
        });
      } else {
        console.log(`⚠️ MOCK AVAILABILITY [${requestId}] Main endpoint failed (${response.status}), falling back to mock`);
      }
    } catch (mainEndpointError) {
      console.log(`⚠️ MOCK AVAILABILITY [${requestId}] Main endpoint error:`, mainEndpointError.message);
    }

    // Validate input
    const validatedParams = availabilityQuerySchema.parse(queryParams);
    
    // Generate mock availability based on service type
    const mockSlots = generateMockTimeSlots(
      validatedParams.date,
      validatedParams.serviceId,
      validatedParams.duration
    );

    console.log(`🔧 MOCK AVAILABILITY [${requestId}] Generated ${mockSlots.length} mock slots`);
    
    return NextResponse.json({
      date: validatedParams.date,
      availableSlots: mockSlots,
      serviceInfo: getMockServiceInfo(validatedParams.serviceId),
      businessHours: getMockBusinessHours(validatedParams.serviceId),
      timezoneInfo: {
        businessTimezone: 'America/Chicago',
        clientTimezone: validatedParams.timezone,
        timezoneSupported: true,
      },
      _source: 'MOCK_DATA',
      _message: 'Mock availability data - GHL integration not complete',
      _compatibility_layer: true,
      _requestId: requestId
    });

  } catch (error) {
    console.error(`❌ MOCK AVAILABILITY [${requestId}] Error:`, error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters', 
          details: error.errors,
          _source: 'MOCK_DATA_ERROR',
          _requestId: requestId
        },
        { status: 400 }
      );
    }

    // Return minimal fallback even on error
    return NextResponse.json(
      {
        date: new Date().toISOString().split('T')[0],
        availableSlots: [],
        message: 'Mock availability temporarily unavailable',
        _source: 'MOCK_DATA_ERROR',
        _requestId: requestId
      },
      { status: 503 }
    );
  }
}

function generateMockTimeSlots(date: string, serviceId: string, duration?: string | null) {
  const slots = [];
  const requestedDate = new Date(`${date}T00:00:00`);
  const today = new Date();
  
  // Don't show past dates
  if (requestedDate < startOfDay(today)) {
    return [];
  }
  
  // Service-specific business hours
  const { startHour, endHour, slotInterval } = getServiceHours(serviceId);
  const serviceDuration = duration ? parseInt(duration) : getServiceDuration(serviceId);
  
  // Generate time slots based on service type
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotInterval) {
      const slotStart = new Date(requestedDate);
      slotStart.setHours(hour, minute, 0, 0);
      
      const slotEnd = addMinutes(slotStart, serviceDuration);
      
      // Don't create slots that extend past business hours
      if (slotEnd.getHours() >= endHour) {
        break;
      }
      
      // Don't show slots in the past (same day)
      const now = new Date();
      if (requestedDate.toDateString() === now.toDateString() && slotStart <= now) {
        continue;
      }
      
      // Mock availability - about 70% of slots available
      const isAvailable = Math.random() > 0.3;
      
      slots.push({
        startTime: format(slotStart, 'HH:mm'),
        endTime: format(slotEnd, 'HH:mm'),
        available: isAvailable,
        appointmentStartTime: slotStart.toISOString(),
        appointmentEndTime: slotEnd.toISOString(),
        appointmentFormattedTime: format(slotStart, 'h:mm a'),
        calendarId: `mock-calendar-${serviceId}`,
        _mock: true
      });
    }
  }
  
  return slots;
}

function getServiceHours(serviceId: string) {
  switch (serviceId) {
    case 'extended-hours-notary':
    case 'EXTENDED_HOURS_NOTARY':
      return { startHour: 7, endHour: 21, slotInterval: 30 }; // 7am-9pm
    case 'loan-signing-specialist':
    case 'LOAN_SIGNING_SPECIALIST':
      return { startHour: 8, endHour: 18, slotInterval: 60 }; // 8am-6pm, longer slots
    case 'standard-notary':
    case 'STANDARD_NOTARY':
    default:
      return { startHour: 9, endHour: 17, slotInterval: 30 }; // 9am-5pm
  }
}

function getServiceDuration(serviceId: string): number {
  switch (serviceId) {
    case 'extended-hours-notary':
    case 'EXTENDED_HOURS_NOTARY':
      return 90;
    case 'loan-signing-specialist':
    case 'LOAN_SIGNING_SPECIALIST':
      return 90;
    case 'standard-notary':
    case 'STANDARD_NOTARY':
    default:
      return 60;
  }
}

function getMockServiceInfo(serviceId: string) {
  const services = {
    'standard-notary': {
      name: 'Standard Notary',
      duration: 60,
      price: 75,
    },
    'extended-hours-notary': {
      name: 'Extended Hours Notary',
      duration: 90,
      price: 100,
    },
    'loan-signing-specialist': {
      name: 'Loan Signing Specialist',
      duration: 90,
      price: 150,
    }
  };
  
  return services[serviceId as keyof typeof services] || services['standard-notary'];
}

function getMockBusinessHours(serviceId: string) {
  const hours = getServiceHours(serviceId);
  return {
    startTime: `${hours.startHour.toString().padStart(2, '0')}:00`,
    endTime: `${hours.endHour.toString().padStart(2, '0')}:00`,
  };
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json({
    error: 'Method not allowed',
    _source: 'MOCK_DATA'
  }, { status: 405 });
}