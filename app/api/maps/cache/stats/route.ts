import { getDistanceCacheStats } from '@/lib/maps/distance'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const stats = await getDistanceCacheStats()
    return NextResponse.json({ success: true, stats })
  } catch (err) {
    console.error('Failed to fetch distance cache stats', err)
    return NextResponse.json({ success: false, error: 'Unable to fetch stats' }, { status: 500 })
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