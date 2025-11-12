import { NextResponse } from 'next/server'

import { getRumSummary } from '@/lib/analytics/rum-service'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const summary = await getRumSummary()
    return NextResponse.json(summary)
  } catch (error) {
    logger.error('Failed to build RUM summary', error as Error)
    return NextResponse.json({ error: 'Failed to build RUM summary' }, { status: 500 })
  }
}
