import { NextRequest, NextResponse } from 'next/server';
import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service';

/**
 * AI Helper API - Distance Calculation
 * GET /api/_ai/get-distance?zip=77008 or ?address=123 Main St, Houston, TX
 * 
 * Used by Vertex AI function calling to get real-time distance and travel fee
 * calculations for the chatbot.
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
        error: 'Either zip or address parameter is required'
      }, { status: 400 });
    }

    // Build destination string
    const destination = address || zip;
    
    if (!destination) {
      return NextResponse.json({
        error: 'Invalid destination provided'
      }, { status: 400 });
    }

    // Calculate distance using existing service
    const result = await UnifiedDistanceService.calculateDistance(destination, serviceType);

    // Return simplified response for AI consumption
    return NextResponse.json({
      success: true,
      miles: result.distance.miles,
      travelFee: result.travelFee,
      isWithinServiceArea: result.isWithinServiceArea,
      duration: {
        minutes: result.duration.minutes,
        text: result.duration.text
      },
      warnings: result.warnings,
      recommendations: result.recommendations,
      metadata: {
        calculatedAt: result.metadata.calculatedAt,
        apiSource: result.metadata.apiSource,
        serviceType: result.metadata.serviceType
      }
    });

  } catch (error) {
    console.error('AI Distance API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate distance',
      details: error instanceof Error ? error.message : 'Unknown error'
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