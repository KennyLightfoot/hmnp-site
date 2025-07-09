import { NextRequest, NextResponse } from 'next/server';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';

export async function GET(request: NextRequest) {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Debug endpoint disabled in production' }, { status: 403 });
    }
    
    const serviceTypes = [
      'STANDARD_NOTARY',
      'EXTENDED_HOURS', 
      'LOAN_SIGNING',
      'RON_SERVICES',
      'QUICK_STAMP_LOCAL',
      'BUSINESS_ESSENTIALS',
      'BUSINESS_GROWTH'
    ];
    
    const results: Record<string, any> = {};
    
    for (const serviceType of serviceTypes) {
      try {
        const calendarId = getCalendarIdForService(serviceType);
        results[serviceType] = {
          success: true,
          calendarId: calendarId,
          length: calendarId?.length || 0,
          valid: calendarId && calendarId.length > 10
        };
      } catch (error) {
        results[serviceType] = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          calendarId: null
        };
      }
    }
    
    // Also check raw environment variables
    const rawEnvVars = {
      GHL_STANDARD_NOTARY_CALENDAR_ID: process.env.GHL_STANDARD_NOTARY_CALENDAR_ID,
      GHL_EXTENDED_HOURS_CALENDAR_ID: process.env.GHL_EXTENDED_HOURS_CALENDAR_ID,
      GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID: process.env.GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID,
      GHL_BOOKING_CALENDAR_ID: process.env.GHL_BOOKING_CALENDAR_ID,
      GHL_PRIVATE_INTEGRATION_TOKEN: process.env.GHL_PRIVATE_INTEGRATION_TOKEN ? '***SET***' : 'NOT SET',
      GHL_LOCATION_ID: process.env.GHL_LOCATION_ID ? '***SET***' : 'NOT SET'
    };
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      serviceTypeMappings: results,
      rawEnvironmentVars: rawEnvVars,
      recommendations: {
        missing: Object.entries(rawEnvVars).filter(([key, value]) => !value || value === 'NOT SET').map(([key]) => key),
        hasTrailingSpaces: Object.entries(rawEnvVars).filter(([key, value]) => typeof value === 'string' && value !== value.trim()).map(([key]) => key)
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 