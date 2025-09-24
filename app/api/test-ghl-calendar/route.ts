import { NextResponse } from "next/server";
import { 
  testCalendarConnection, 
  getCalendars, 
  getCalendarById,
  getCalendarCacheStats,
  clearCalendarCache 
} from "@/lib/ghl-calendar";

export async function GET() {
  try {
    console.log('🧪 Testing GHL Calendar Integration...');
    
    // Test 1: Connection test
    const connectionTest = await testCalendarConnection();
    
    // Test 2: Get calendars
    const calendars = await getCalendars();
    
    // Test 3: Get details of first calendar (if any)
    let firstCalendarDetails = null;
    if (calendars.length > 0) {
      firstCalendarDetails = await getCalendarById(calendars[0].id);
    }
    
    // Test 4: Get cache stats
    const cacheStats = getCalendarCacheStats();
    
    const results = {
      timestamp: new Date().toISOString(),
      connectionTest: {
        success: connectionTest,
        message: connectionTest ? 'GHL Calendar connection successful' : 'GHL Calendar connection failed'
      },
      calendars: {
        count: calendars.length,
        data: calendars.map(cal => ({
          id: cal.id,
          name: cal.name,
          type: cal.type
        }))
      },
      firstCalendarDetails: firstCalendarDetails ? {
        id: firstCalendarDetails.id,
        name: firstCalendarDetails.name,
        type: firstCalendarDetails.type,
        // Don't include sensitive data
      } : null,
      cacheStats,
      environment: {
        hasGhlToken: !!process.env.GHL_PRIVATE_INTEGRATION_TOKEN || !!process.env.GHL_API_KEY,
        hasLocationId: !!process.env.GHL_LOCATION_ID,
        baseUrl: process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com'
      }
    };
    
    console.log('✅ GHL Calendar test completed:', results);
    
    return NextResponse.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('❌ GHL Calendar test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'clear-cache') {
      clearCalendarCache();
      return NextResponse.json({
        success: true,
        message: 'Calendar cache cleared'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 