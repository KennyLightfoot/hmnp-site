import { NextResponse } from 'next/server'

import { generateWeeklyOwnerReport } from '@/lib/analytics/weekly-report'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const report = await generateWeeklyOwnerReport(new Date())
    return NextResponse.json(report)
  } catch (error) {
    logger.error('Failed to generate weekly owner report', error as Error)
    return NextResponse.json({ error: 'Failed to build weekly report' }, { status: 500 })
  }
}
