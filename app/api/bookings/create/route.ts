/**
 * 🚀 LEGACY BOOKING CREATE API - V2 MIGRATION HANDLER
 * 
 * This endpoint is deprecated. All booking creation now routes through V2.
 * Maintained for backward compatibility during transition period.
 */

import { NextRequest, NextResponse } from 'next/server';

const MIGRATION_HEADERS = {
  'X-API-Version': '2.0',
  'X-Migration-Status': 'ACTIVE',
  'X-Legacy-API': 'DEPRECATED',
  'X-Redirect-To': '/api/v2/bookings',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

export async function POST(request: NextRequest) {
  console.log('🔄 Legacy Booking Create: Migrating to V2...');
  
  try {
    const body = await request.text();
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400, headers: MIGRATION_HEADERS });
    }
    
    // Transform legacy create format to V2 format
    const v2Body = {
      serviceId: parsedBody.serviceId,
      customerEmail: parsedBody.customerEmail,
      customerName: parsedBody.customerName,
      customerPhone: parsedBody.customerPhone,
      scheduledDateTime: parsedBody.scheduledDateTime,
      
      // Location handling
      locationType: parsedBody.locationType,
      address: parsedBody.addressStreet ? {
        street: parsedBody.addressStreet,
        city: parsedBody.addressCity || '',
        state: parsedBody.addressState || 'TX',
        zip: parsedBody.addressZip || ''
      } : undefined,
      locationNotes: parsedBody.locationNotes,
      
      // Optional fields
      specialInstructions: parsedBody.notes || parsedBody.specialInstructions,
      promoCode: parsedBody.promoCode,
      
      // Required V2 fields
      termsAccepted: true,
      smsNotifications: false,
      emailUpdates: true,
      
      // Migration metadata
      _legacyData: {
        ...parsedBody,
        migrationSource: 'legacy-booking-create',
        migrationTimestamp: new Date().toISOString()
      }
    };
    
    // Forward to V2 API
    const v2Response = await fetch(new URL('/api/v2/bookings', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'User-Agent': 'Legacy-Create-Migration/1.0',
        'X-Forwarded-From': '/api/bookings/create'
      },
      body: JSON.stringify(v2Body)
    });
    
    const v2Data = await v2Response.json();
    
    if (v2Response.ok) {
      console.log('✅ Legacy booking create migrated to V2 successfully');
      return NextResponse.json(v2Data, {
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    } else {
      console.error('❌ V2 booking create failed:', v2Data);
      return NextResponse.json({
        success: false,
        error: 'Migration to V2 API failed',
        details: v2Data,
        legacyBody: parsedBody,
        transformedBody: v2Body
      }, { 
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    }
    
  } catch (error) {
    console.error('❌ Booking create migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'MIGRATION_ERROR',
        message: 'Failed to migrate booking creation to V2 API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      migration: {
        status: 'FAILED',
        recommendedAction: 'Use POST /api/v2/bookings directly'
      }
    }, { 
      status: 500,
      headers: MIGRATION_HEADERS
    });
  }
}

// ============================================================================
// 🚫 DEPRECATED METHODS
// ============================================================================

export async function GET() {
  return NextResponse.json({
    success: false,
    error: {
      code: 'DEPRECATED_ENDPOINT',
      message: 'GET /api/bookings/create is deprecated',
      migration: {
        recommendedAction: 'Use GET /api/v2/bookings for listing bookings'
      }
    }
  }, { status: 410, headers: MIGRATION_HEADERS });
}

console.log('🔄 Legacy Booking Create API - Migration Handler Loaded');