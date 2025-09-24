import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/utils/error-utils'
import type { PricingCalculationParams, PricingResult } from './types'

export async function cacheResult(params: PricingCalculationParams, result: PricingResult): Promise<void> {
  try {
    const cacheKey = `pricing_${hashParams(params)}`
    if (typeof redis.setex === 'function') await redis.setex(cacheKey, 300, JSON.stringify(result))
    else if (typeof redis.set === 'function') await redis.set(cacheKey, JSON.stringify(result), 300)
    logger.info('Pricing result cached successfully', { cacheKey, ttl: 300, method: typeof redis.setex === 'function' ? 'setex' : 'set-EX' })
  } catch (error) {
    logger.warn('Failed to cache pricing result', { error: getErrorMessage(error), redisClient: Object.getOwnPropertyNames(redis).join(', ') })
  }
}

function hashParams(params: PricingCalculationParams): string {
  return Buffer.from(JSON.stringify(params)).toString('base64').slice(0, 32)
}


