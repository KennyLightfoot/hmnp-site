/**
 * 🚀 LEGACY BOOKING DETAIL API - V2 MIGRATION HANDLER
 * 
 * This endpoint is deprecated. All booking operations now route through V2.
 * Maintained for backward compatibility during transition period.
 */

import { NextRequest, NextResponse } from 'next/server';

const MIGRATION_HEADERS = {
  'X-API-Version': '2.0',
  'X-Migration-Status': 'ACTIVE', 
  'X-Legacy-API': 'DEPRECATED',
  'X-Redirect-To': '/api/v2/bookings/[id]',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('🔄 Legacy Booking Detail: Migrating to V2...');
  
  try {
    const params = await context.params;
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400, headers: MIGRATION_HEADERS });
    }

    // Forward to V2 API
    const v2Response = await fetch(new URL(`/api/v2/bookings/${bookingId}`, request.url).toString(), {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'User-Agent': 'Legacy-Detail-Migration/1.0',
        'X-Forwarded-From': `/api/bookings/${bookingId}`
      }
    });

    const v2Data = await v2Response.json();

    if (v2Response.ok) {
      console.log(`✅ Legacy booking detail (${bookingId}) migrated to V2 successfully`);
      return NextResponse.json(v2Data, {
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    } else {
      console.error(`❌ V2 booking detail failed for ${bookingId}:`, v2Data);
      return NextResponse.json({
        success: false,
        error: 'Migration to V2 API failed',
        details: v2Data,
        bookingId
      }, { 
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    }

  } catch (error) {
    console.error('❌ Booking detail migration error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'MIGRATION_ERROR',
        message: 'Failed to migrate booking detail to V2 API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      migration: {
        status: 'FAILED',
        recommendedAction: 'Use GET /api/v2/bookings/[id] directly'
      }
    }, { 
      status: 500,
      headers: MIGRATION_HEADERS
    });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('🔄 Legacy Booking Update: Migrating to V2...');
  
  try {
    const params = await context.params;
    const bookingId = params.id;
    const body = await request.text();

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400, headers: MIGRATION_HEADERS });
    }

    // Forward to V2 API
    const v2Response = await fetch(new URL(`/api/v2/bookings/${bookingId}`, request.url).toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'User-Agent': 'Legacy-Update-Migration/1.0',
        'X-Forwarded-From': `/api/bookings/${bookingId}`
      },
      body
    });

    const v2Data = await v2Response.json();

    if (v2Response.ok) {
      console.log(`✅ Legacy booking update (${bookingId}) migrated to V2 successfully`);
      return NextResponse.json(v2Data, {
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Migration to V2 API failed',
        details: v2Data,
        bookingId
      }, { 
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'MIGRATION_ERROR',
        message: 'Failed to migrate booking update to V2 API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { 
      status: 500,
      headers: MIGRATION_HEADERS
    });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('🔄 Legacy Booking Delete: Migrating to V2...');
  
  try {
    const params = await context.params;
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: 'Booking ID is required'
      }, { status: 400, headers: MIGRATION_HEADERS });
    }

    // Forward to V2 API
    const v2Response = await fetch(new URL(`/api/v2/bookings/${bookingId}`, request.url).toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'User-Agent': 'Legacy-Delete-Migration/1.0',
        'X-Forwarded-From': `/api/bookings/${bookingId}`
      }
    });

    const v2Data = await v2Response.json();

    if (v2Response.ok) {
      console.log(`✅ Legacy booking delete (${bookingId}) migrated to V2 successfully`);
      return NextResponse.json(v2Data, {
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Migration to V2 API failed',
        details: v2Data,
        bookingId
      }, { 
        status: v2Response.status,
        headers: MIGRATION_HEADERS
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'MIGRATION_ERROR',
        message: 'Failed to migrate booking delete to V2 API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { 
      status: 500,
      headers: MIGRATION_HEADERS
    });
  }
}

console.log('🔄 Legacy Booking Detail API - Migration Handler Loaded');