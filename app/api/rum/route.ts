import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import redis from '@/lib/redis'
import { logger } from '@/lib/logger'

const metricSchema = z.object({
  name: z.string(),
  value: z.number(),
  id: z.string().optional(),
  delta: z.number().optional(),
  rating: z.string().optional(),
  label: z.string().optional(),
  navigationType: z.string().optional(),
  path: z.string().optional(),
  href: z.string().optional(),
  ts: z.number().optional(),
  userAgent: z.string().optional(),
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => null)
    if (!json) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const result = metricSchema.safeParse(json)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid metric payload', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const metric = result.data
    const enableStorage = process.env.ENABLE_RUM_STORAGE === 'true'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
    const enrichedMetric = {
      ...metric,
      receivedAt: Date.now(),
      ip: clientIp,
    }

    let stored = false
    if (enableStorage) {
      try {
        await redis.ping()
        const key = `rum:${metric.name}:${metric.id ?? randomUUID()}`
        stored = (await redis.set(key, JSON.stringify(enrichedMetric), 'EX', 60 * 60 * 24 * 7)) === 'OK'
      } catch (error) {
        logger.error('Failed to persist RUM metric', error as Error)
      }
    } else if (process.env.NODE_ENV !== 'production') {
      logger.info('RUM metric received', enrichedMetric)
    }

    return NextResponse.json({ success: true, stored })
  } catch (error) {
    logger.error('RUM ingestion error', error as Error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

