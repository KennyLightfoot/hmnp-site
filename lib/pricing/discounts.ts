import { PRICING_CONFIG, SERVICES } from './base'
import { redis } from '@/lib/redis'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { logger } from '@/lib/logger'

export async function calculateDiscounts(
  promoCode?: string,
  customerEmail?: string,
  referralCode?: string,
  documentCount?: number,
  serviceType?: string
): Promise<number> {
  let total = 0
  try {
    if (customerEmail && await isFirstTimeCustomer(customerEmail)) total += PRICING_CONFIG.discounts.firstTime
  } catch (e) { logger.warn('First-time check failed', { e: getErrorMessage(e) }) }

  if (referralCode) total += PRICING_CONFIG.discounts.referral

  if (serviceType === 'STANDARD_NOTARY' && documentCount && documentCount >= 3) {
    const basePrice = SERVICES['STANDARD_NOTARY']?.price ?? 0
    total += Math.round(basePrice * PRICING_CONFIG.discounts.volume)
  }

  if (promoCode) total += await getPromoCodeDiscount(promoCode)
  return total
}

async function isFirstTimeCustomer(email: string): Promise<boolean> {
  const cacheKey = `first_time_${email}`
  const cached = await redis.get(cacheKey)
  if (cached !== null) return cached === 'true'
  const isFirstTime = true
  await redis.setex(cacheKey, 3600, isFirstTime.toString())
  return isFirstTime
}

async function getPromoCodeDiscount(code: string): Promise<number> {
  try {
    const cacheKey = `promo_${code}`
    const cached = await redis.get(cacheKey)
    if (cached !== null) return parseInt(cached, 10)
    const commonCodes: Record<string, number> = { WELCOME15: 15, NEWCLIENT: 20, SAVE10: 10 }
    const discount = commonCodes[code.toUpperCase()] || 0
    await redis.setex(cacheKey, 1800, discount.toString())
    return discount
  } catch (error) {
    logger.warn('Promo code check failed', { code, error: getErrorMessage(error) })
    return 0
  }
}


