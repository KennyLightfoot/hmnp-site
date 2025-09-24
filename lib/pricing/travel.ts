import { SERVICES } from './base'
import { UnifiedDistanceService } from '@/lib/maps/unified-distance-service'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { logger } from '@/lib/logger'

export async function calculateTravelFee(
  serviceType: string,
  location: { address: string; latitude?: number; longitude?: number }
): Promise<{ fee: number; distance: number; withinArea: boolean }> {
  try {
    const service = SERVICES[serviceType as keyof typeof SERVICES]
    if (!service) throw new Error(`Invalid service type for travel calc: ${serviceType}`)
    if (serviceType === 'RON_SERVICES') return { fee: 0, distance: 0, withinArea: true }
    const distanceResult = await UnifiedDistanceService.calculateDistance(location.address, serviceType)
    const distance = distanceResult.distance.miles || 0
    const withinArea = distance <= service.includedRadius
    const excessDistance = Math.max(0, distance - service.includedRadius)
    const fee = Math.round(excessDistance * service.feePerMile * 100) / 100
    return { fee, distance, withinArea }
  } catch (error: any) {
    logger.warn('Travel fee calculation failed, using fallback', { serviceType, location: location.address, error: getErrorMessage(error) })
    return { fee: 10, distance: 20, withinArea: false }
  }
}


