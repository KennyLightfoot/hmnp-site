import redis from '@/lib/redis'
import { logger } from '@/lib/logger'

export const RUM_SLO_THRESHOLDS: Record<string, number> = {
  LCP: 2500,
  INP: 200,
  CLS: 0.1,
}

function isPass(metricName: string, value: number): boolean {
  const threshold = RUM_SLO_THRESHOLDS[metricName]
  if (threshold === undefined) return true
  if (metricName === 'CLS') {
    return value <= threshold
  }
  return value <= threshold
}

export interface RumMetricSummary {
  name: string
  count: number
  average: number
  passRate: number
  sloThreshold: number | null
  ratings: Record<string, number>
}

export interface RumSummary {
  metrics: RumMetricSummary[]
  sampleCount: number
  timeWindowDays: number
}

export async function getRumSummary(): Promise<RumSummary> {
  const keys = await redis.keys('rum:*')
  if (!keys || keys.length === 0) {
    return { metrics: [], sampleCount: 0, timeWindowDays: 7 }
  }

  const entries = await Promise.all(keys.map(async (key) => {
    try {
      const raw = await redis.get(key)
      return raw ? JSON.parse(raw) : null
    } catch (error) {
      logger.error('Failed to parse RUM metric', error as Error, { key })
      return null
    }
  }))

  const filtered = entries.filter(Boolean) as Array<{ name: string; value: number; rating?: string }>

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, metric) => {
    if (!acc[metric.name]) acc[metric.name] = []
    acc[metric.name]!.push(metric)
    return acc
  }, {})

  const metrics = Object.entries(grouped).map(([name, records]) => {
    const values = records.map((record) => record.value)
    const count = values.length
    const average = values.reduce((sum, value) => sum + value, 0) / count
    const passCount = records.filter((record) => isPass(name, record.value)).length
    const passRate = count > 0 ? passCount / count : 0
    const ratings = records.reduce<Record<string, number>>((acc, record) => {
      if (!record.rating) return acc
      acc[record.rating] = (acc[record.rating] || 0) + 1
      return acc
    }, {})

    return {
      name,
      count,
      average,
      passRate,
      sloThreshold: RUM_SLO_THRESHOLDS[name] ?? null,
      ratings,
    }
  })

  return {
    metrics,
    sampleCount: filtered.length,
    timeWindowDays: 7,
  }
}
