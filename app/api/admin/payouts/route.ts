import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { getPayoutSummary } from '@/lib/payouts/payout-service'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role
    if (!session?.user || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const periodStartParam = searchParams.get('periodStart')
    const periodEndParam = searchParams.get('periodEnd')
    const limitParam = searchParams.get('limit')

    const periodStart = periodStartParam ? new Date(periodStartParam) : undefined
    const periodEnd = periodEndParam ? new Date(periodEndParam) : undefined
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 20, 1), 100) : 20

    const payouts = await getPayoutSummary({
      periodStart,
      periodEnd,
      limit,
    })

    logger.info('Admin payout summary generated', 'ADMIN_PAYOUTS', {
      count: payouts.length,
      periodStart: periodStart?.toISOString(),
      periodEnd: periodEnd?.toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: payouts,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Failed to fetch payout summary', 'ADMIN_PAYOUTS', error as Error)
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    )
  }
}

