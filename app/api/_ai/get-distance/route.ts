import { NextRequest, NextResponse } from 'next/server';
import { calculateDistanceWithCache } from '@/lib/maps/distance';

/**
 * AI Helper API - Distance Calculation
 * GET /api/_ai/get-distance?zip=77008 or ?address=123 Main St, Houston, TX
 * 
 * Used by Vertex AI function calling to get real-time distance and travel fee
 * calculations for the chatbot.
 * 
 * Now uses Redis caching for improved performance and reduced API calls.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');
    const address = searchParams.get('address');
    const serviceType = searchParams.get('serviceType') || 'STANDARD_NOTARY';

    // Validate input
    if (!zip && !address) {
      return NextResponse.json({
        success: false,
        error: 'ZIP code or address is required'
      }, { status: 400 });
    }

    const destination = zip || address!;

    try {
      // Calculate distance using Redis-cached distance helper
      const result = await calculateDistanceWithCache(destination, {
        serviceType,
        forceFresh: false // Use cache when available
      });
      
      // Return simplified response for AI consumption
      return NextResponse.json({
        success: true,
        miles: result.distance.miles,
        travelFee: result.travelFee,
        duration: result.duration.minutes,
        withinServiceArea: result.isWithinServiceArea,
        cacheHit: result.cacheHit,
        source: result.source
      });

    } catch (error) {
      console.error('Distance calculation error:', error);
      
      return NextResponse.json({
        success: false,
        error: 'Distance calculation service unavailable'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Distance calculation service unavailable'
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 