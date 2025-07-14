import { NextRequest, NextResponse } from 'next/server'
import { calculateDistanceWithCache } from '@/lib/maps/distance'

/**
 * Distance API
 * GET /api/maps/distance?address=123+Main+St,+Houston,+TX&serviceType=STANDARD_NOTARY
 * Or use ?zip=77008
 *
 * This route is server-side only (runs in Node on Vercel) so it can safely
 * import Redis/ioredis code. The JSON payload is lightweight and designed for
 * direct consumption by client components.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')
  const address = searchParams.get('address')
  const serviceType = searchParams.get('serviceType') || 'STANDARD_NOTARY'

  if (!zip && !address) {
    return NextResponse.json(
      {
        success: false,
        error: 'ZIP code or address query parameter is required'
      },
      { status: 400 }
    )
  }

  const destination = zip || address!

  try {
    const result = await calculateDistanceWithCache(destination, {
      serviceType,
      forceFresh: false
    })

    return NextResponse.json({
      success: true,
      miles: result.distance.miles,
      travelFee: result.travelFee,
      duration: result.duration.minutes,
      withinServiceArea: result.isWithinServiceArea,
      cacheHit: result.cacheHit,
      source: result.source
    })
  } catch (err) {
    console.error('Distance calculation failed', err)
    return NextResponse.json(
      {
        success: false,
        error: 'Distance calculation failed'
      },
      { status: 500 }
    )
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
} 