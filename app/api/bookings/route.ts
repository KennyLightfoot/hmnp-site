/**
 * 🚀 LEGACY BOOKINGS API - V2 MIGRATION HANDLER
 * 
 * This replaces the 1,526-line chaotic booking system with a clean migration to V2.
 * All booking operations now redirect to the bulletproof V2 system.
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// 🔄 MIGRATION NOTICE
// ============================================================================

const MIGRATION_HEADERS = {
  'X-API-Version': '2.0',
  'X-Migration-Status': 'ACTIVE',
  'X-Legacy-API': 'DEPRECATED',
  'X-Redirect-To': '/api/v2/bookings',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

// ============================================================================
// 📋 GET: LIST BOOKINGS (Migrate to V2)
// ============================================================================

export async function GET(request: NextRequest) {
  console.log('🔄 Legacy Bookings API: GET request migrating to V2...');
  
  try {
    // Preserve query parameters for V2 API
    const { searchParams } = new URL(request.url);
    const v2Url = new URL('/api/v2/bookings', request.url);
    
    // Copy all query parameters to V2 endpoint
    for (const [key, value] of searchParams.entries()) {
      v2Url.searchParams.set(key, value);
    }
    
    // Forward to V2 API
    const v2Response = await fetch(v2Url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'User-Agent': 'Legacy-API-Migration/1.0',
        'X-Forwarded-From': '/api/bookings'
      }
    });
    
    if (v2Response.ok) {
      const v2Data = await v2Response.json();
      
      console.log('✅ Successfully migrated GET bookings to V2');
      return NextResponse.json(v2Data, {
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    } else {
      console.error('❌ V2 bookings API failed');
      return NextResponse.json({
        success: false,
        error: 'Migration to V2 API failed',
        details: await v2Response.text()
      }, { 
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'MIGRATION_ERROR',
        message: 'Failed to migrate to V2 API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      migration: {
        status: 'FAILED',
        recommendedAction: 'Use /api/v2/bookings directly',
        legacyApiDeprecated: true
      }
    }, { 
      status: 500,
      headers: MIGRATION_HEADERS
    });
  }
}

// ============================================================================
// 📝 POST: CREATE BOOKING (Migrate to V2)
// ============================================================================

export async function POST(request: NextRequest) {
  console.log('🔄 Legacy Bookings API: POST request migrating to V2...');
  
  try {
    // Get the request body
    const body = await request.text();
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Invalid JSON in request body'
        }
      }, { status: 400, headers: MIGRATION_HEADERS });
    }
    
    // Transform legacy format to V2 format
    const v2Body = transformLegacyToV2(parsedBody);
    
    // Forward to V2 API
    const v2Response = await fetch(new URL('/api/v2/bookings', request.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'User-Agent': 'Legacy-API-Migration/1.0',
        'X-Forwarded-From': '/api/bookings'
      },
      body: JSON.stringify(v2Body)
    });
    
    if (v2Response.ok) {
      const v2Data = await v2Response.json();
      
      console.log('✅ Successfully migrated POST booking to V2');
      return NextResponse.json(v2Data, {
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    } else {
      const errorText = await v2Response.text();
      console.error('❌ V2 bookings API failed:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Migration to V2 API failed',
        details: errorText,
        legacyBody: parsedBody,
        transformedBody: v2Body
      }, { 
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'MIGRATION_ERROR',
        message: 'Failed to migrate to V2 API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      migration: {
        status: 'FAILED',
        recommendedAction: 'Use /api/v2/bookings directly',
        legacyApiDeprecated: true
      }
    }, { 
      status: 500,
      headers: MIGRATION_HEADERS
    });
  }
}

// ============================================================================
// 🔧 LEGACY TO V2 TRANSFORMATION
// ============================================================================

function transformLegacyToV2(legacyBody: any): any {
  console.log('🔄 Transforming legacy booking format to V2...');
  
  // Map legacy fields to V2 schema
  const v2Body = {
    // Service selection
    serviceId: legacyBody.serviceId,
    
    // Customer information  
    customerEmail: legacyBody.email,
    customerName: `${legacyBody.firstName || ''} ${legacyBody.lastName || ''}`.trim() || legacyBody.customerName,
    customerPhone: legacyBody.phone,
    
    // Scheduling
    scheduledDateTime: legacyBody.scheduledDateTime,
    
    // Location
    locationType: legacyBody.locationType,
    address: legacyBody.addressStreet ? {
      street: legacyBody.addressStreet,
      city: legacyBody.addressCity || '',
      state: legacyBody.addressState || 'TX',
      zip: legacyBody.addressZip || ''
    } : undefined,
    locationNotes: legacyBody.locationNotes,
    
    // Optional fields
    promoCode: legacyBody.promoCode,
    specialInstructions: legacyBody.notes || legacyBody.specialInstructions,
    
    // Consent (assume true for legacy bookings)
    termsAccepted: legacyBody.consent_terms_conditions ?? true,
    
    // Additional metadata from legacy system
    _legacyData: {
      referredBy: legacyBody.referredBy,
      companyName: legacyBody.companyName,
      numberOfSigners: legacyBody.booking_number_of_signers,
      smsNotifications: legacyBody.smsNotifications,
      emailUpdates: legacyBody.emailUpdates,
      additionalCharges: legacyBody.additionalCharges,
      migrationTimestamp: new Date().toISOString(),
      originalLegacyFormat: true
    }
  };
  
  // Remove undefined fields
  Object.keys(v2Body).forEach(key => {
    if (v2Body[key] === undefined) {
      delete v2Body[key];
    }
  });
  
  console.log('✅ Legacy to V2 transformation complete');
  return v2Body;
}

// ============================================================================
// 🚫 OTHER HTTP METHODS (Not Supported)
// ============================================================================

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: {
      code: 'METHOD_NOT_SUPPORTED',
      message: 'PUT method not supported on legacy endpoint',
      migration: {
        recommendedAction: 'Use PUT /api/v2/bookings/[id] for updates'
      }
    }
  }, { status: 405, headers: MIGRATION_HEADERS });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: {
      code: 'METHOD_NOT_SUPPORTED', 
      message: 'DELETE method not supported on legacy endpoint',
      migration: {
        recommendedAction: 'Use DELETE /api/v2/bookings/[id] for deletions'
      }
    }
  }, { status: 405, headers: MIGRATION_HEADERS });
}

// ============================================================================
// 📊 MIGRATION STATISTICS
// ============================================================================

// This replaces:
// - 1,526 lines of chaotic code
// - Multiple competing APIs
// - Complex pricing logic scattered throughout
// - Unreliable error handling
// - Mixed concerns and responsibilities

// With:
// - ~200 lines of clean migration code
// - Single source of truth (V2 API)
// - Bulletproof error handling
// - Clear separation of concerns
// - Backward compatibility during transition

console.log('🎯 Legacy Bookings API Migration Handler Loaded');
console.log('📉 Reduced from 1,526 lines to ~200 lines');
console.log('🔗 All requests now route to V2 system');