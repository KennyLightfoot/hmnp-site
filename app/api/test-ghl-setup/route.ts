import { NextResponse } from 'next/server';
import { validateCalendarMappings } from '@/lib/ghl/calendar-mapping';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  // Check admin authentication
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session?.user || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }
  try {
    // Check GHL environment variables
    const ghlToken = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    
    // Validate calendar mappings
    const calendarValidation = validateCalendarMappings();
    
    const setupStatus = {
      ghlToken: {
        exists: !!ghlToken,
        startsWithPit: ghlToken?.startsWith('pit_') || false,
        length: ghlToken?.length || 0
      },
      ghlLocationId: {
        exists: !!ghlLocationId,
        value: ghlLocationId ? `${ghlLocationId.substring(0, 8)}...` : null
      },
      calendarMappings: {
        valid: calendarValidation.valid,
        errors: calendarValidation.errors,
        totalMappings: Object.keys(calendarValidation.errors).length + (calendarValidation.valid ? 7 : 0)
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGhlApiBaseUrl: !!process.env.GHL_API_BASE_URL
      }
    };
    
    const isSetupComplete = setupStatus.ghlToken.exists && 
                           setupStatus.ghlToken.startsWithPit && 
                           setupStatus.ghlLocationId.exists && 
                           setupStatus.calendarMappings.valid;
    
    return NextResponse.json({
      setupComplete: isSetupComplete,
      status: setupStatus,
      message: isSetupComplete 
        ? 'GHL setup appears to be complete' 
        : 'GHL setup is incomplete - check environment variables'
    });
    
  } catch (error) {
    console.error('Error checking GHL setup:', error);
    return NextResponse.json({
      setupComplete: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}
