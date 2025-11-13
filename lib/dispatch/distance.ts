import { Prisma } from '@prisma/client'
import { prisma } from '../prisma'
import { getCleanApiKey } from '@/lib/config/maps'
import { getErrorMessage } from '@/lib/utils/error-utils'

const GOOGLE_DISTANCE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json'

const fallbackDistances: Record<string, Record<string, number>> = {
  '77591': {
    '77520': 22,
    '77521': 23,
    '77523': 28,
    '77530': 33,
    '77338': 47,
    '77346': 52,
    '77339': 50,
    '77345': 51,
    '77449': 60,
    '77450': 58,
    '77494': 56,
    '77429': 54,
    '77433': 56,
    '77373': 44,
    '77379': 49,
    '77388': 46,
    '77375': 47,
    '77377': 50,
    '77469': 40,
    '77406': 38,
    '77407': 36,
    '77471': 45,
  },
  '77520': { '77521': 6, '77523': 12 },
  '77521': { '77523': 10 },
  '77530': { '77015': 8, '77049': 7 },
  '77338': { '77346': 7, '77396': 11 },
  '77339': { '77345': 5 },
  '77449': { '77450': 6, '77494': 7 },
  '77429': { '77433': 6 },
  '77373': { '77379': 6, '77388': 5 },
  '77375': { '77377': 5 },
  '77469': { '77406': 4, '77407': 6 },
}

function sanitizeZip(value?: string | null): string | null {
  if (!value) return null
  const match = String(value).match(/(\d{5})/)
  return match?.[1] ?? null
}

function getFallbackDistance(origin: string, destination: string): number {
  if (origin === destination) return 0
  const primary = fallbackDistances[origin]?.[destination]
  if (typeof primary === 'number') return primary
  const reverse = fallbackDistances[destination]?.[origin]
  if (typeof reverse === 'number') return reverse
  return 60 // default to extended distance when unknown
}

async function fetchFromGoogle(originZip: string, destinationZip: string): Promise<number | null> {
  try {
    const apiKey = getCleanApiKey('server')
    if (!apiKey) return null

    const url = `${GOOGLE_DISTANCE_URL}?origins=${encodeURIComponent(originZip)}&destinations=${encodeURIComponent(destinationZip)}&units=imperial&key=${apiKey}`
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    const element = data?.rows?.[0]?.elements?.[0]
    if (data?.status === 'OK' && element?.status === 'OK') {
      const milesText = element?.distance?.text as string
      if (milesText) {
        const miles = parseFloat(milesText.replace(/[^0-9.]/g, ''))
        if (!Number.isNaN(miles)) {
          return miles
        }
      }
    }
    return null
  } catch (error) {
    console.error('Google Maps distance lookup failed', getErrorMessage(error))
    return null
  }
}

async function getCachedDistance(originZip: string, destinationZip: string): Promise<number | null> {
  const existing = await prisma.mileage_cache.findFirst({
    where: {
      origin_address: originZip,
      destination_address: destinationZip,
    },
  })

  if (existing?.distance_miles) {
    return Number(existing.distance_miles)
  }

  return null
}

async function cacheDistance(originZip: string, destinationZip: string, distance: number): Promise<void> {
  try {
    await prisma.mileage_cache.upsert({
      where: {
        origin_address_destination_address: {
          origin_address: originZip,
          destination_address: destinationZip,
        },
      },
      update: {
        distance_miles: new Prisma.Decimal(distance),
        duration_minutes: null,
        google_maps_response: Prisma.JsonNull,
        last_calculated: new Date(),
        hit_count: { increment: 1 },
      },
      create: {
        origin_address: originZip,
        destination_address: destinationZip,
        distance_miles: new Prisma.Decimal(distance),
        duration_minutes: null,
        google_maps_response: Prisma.JsonNull,
      },
    })
  } catch (error) {
    console.error('Failed to cache mileage result', getErrorMessage(error))
  }
}

export async function getDistanceBetweenZips(origin?: string | null, destination?: string | null): Promise<number> {
  const originZip = sanitizeZip(origin)
  const destinationZip = sanitizeZip(destination)

  if (!originZip || !destinationZip) {
    return Number.POSITIVE_INFINITY
  }

  if (originZip === destinationZip) {
    return 0
  }

  const cached = await getCachedDistance(originZip, destinationZip)
  if (cached !== null) {
    return cached
  }

  const googleDistance = await fetchFromGoogle(originZip, destinationZip)
  const distance = googleDistance ?? getFallbackDistance(originZip, destinationZip)

  if (Number.isFinite(distance)) {
    await cacheDistance(originZip, destinationZip, distance)
  }

  return distance
}
