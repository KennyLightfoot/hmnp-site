import { NextRequest, NextResponse } from 'next/server';
import { getCalendarSlots } from '@/lib/ghl/management';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * DEBUG: Test GHL availability fetching with detailed logging
 * GET /api/debug-ghl-availability?serviceType=STANDARD_NOTARY&date=2025-08-08
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  // Check admin authentication
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session?.user || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType') || 'STANDARD_NOTARY';
    const date = searchParams.get('date') || '2025-08-08';

    console.log('🔍 [DEBUG] Starting GHL availability test');
    console.log('🔍 [DEBUG] Service Type:', serviceType);
    console.log('🔍 [DEBUG] Date:', date);

    // Step 1: Get calendar ID
    let calendarId: string;
    try {
      calendarId = getCalendarIdForService(serviceType);
      console.log('✅ [DEBUG] Calendar ID resolved:', calendarId);
    } catch (error) {
      console.error('❌ [DEBUG] Failed to get calendar ID:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to get calendar ID',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 400 });
    }

    // Step 2: Check environment variables
    const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;
    
    const isJWT = token && !token.startsWith('pit_');
    
    console.log('🔍 [DEBUG] Token exists:', !!token);
    console.log('🔍 [DEBUG] Token prefix:', token?.substring(0, 4));
    console.log('🔍 [DEBUG] Token length:', token?.length);
    console.log('🔍 [DEBUG] Token type:', isJWT ? 'JWT (OAuth)' : 'Private Integration Token');
    console.log('🔍 [DEBUG] Will use Bearer prefix:', isJWT);
    console.log('🔍 [DEBUG] Location ID exists:', !!locationId);
    console.log('🔍 [DEBUG] Location ID:', locationId?.substring(0, 8) + '...');

    // Step 3: Test GHL API call
    try {
      const slots = await getCalendarSlots(calendarId, date, date);
      
      console.log('✅ [DEBUG] GHL API call successful');
      console.log('✅ [DEBUG] Response type:', typeof slots);
      console.log('✅ [DEBUG] Response keys:', slots ? Object.keys(slots) : 'null');
      
      if (Array.isArray(slots)) {
        console.log('✅ [DEBUG] Response is array, length:', slots.length);
      } else if (slots && typeof slots === 'object') {
        console.log('✅ [DEBUG] Response is object, stringified:', JSON.stringify(slots).slice(0, 300));
      }

      return NextResponse.json({
        success: true,
        serviceType,
        date,
        calendarId,
        response: slots,
        debug: {
          tokenExists: !!token,
          tokenPrefix: token?.substring(0, 4),
          tokenLength: token?.length,
          locationIdExists: !!locationId,
          responseType: typeof slots,
          isArray: Array.isArray(slots),
          responseKeys: slots ? Object.keys(slots) : null
        }
      });

    } catch (ghlError) {
      console.error('❌ [DEBUG] GHL API call failed:', ghlError);
      
      return NextResponse.json({
        success: false,
        error: 'GHL API call failed',
        details: ghlError instanceof Error ? ghlError.message : String(ghlError),
        debug: {
          tokenExists: !!token,
          tokenPrefix: token?.substring(0, 4),
          locationIdExists: !!locationId,
          calendarId
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ [DEBUG] Debug endpoint failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
