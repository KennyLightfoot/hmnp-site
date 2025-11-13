import { BookingStatus, Prisma } from '@prisma/client'
import { endOfWeek, startOfWeek, subWeeks } from 'date-fns'

import { prisma } from '../prisma'
import { logger } from '../logger'

// Define enums locally to work around stale Prisma Client on Vercel
const ContractorPayoutStatusEnum = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
} as const

const ContractorPayoutEntryTypeEnum = {
  BASE: 'BASE',
  TRAVEL_SHARE: 'TRAVEL_SHARE',
  URGENCY_BONUS: 'URGENCY_BONUS',
  WITNESS_SPLIT: 'WITNESS_SPLIT',
  ADJUSTMENT: 'ADJUSTMENT',
} as const

type ContractorPayoutStatus = typeof ContractorPayoutStatusEnum[keyof typeof ContractorPayoutStatusEnum]
type ContractorPayoutEntryType = typeof ContractorPayoutEntryTypeEnum[keyof typeof ContractorPayoutEntryTypeEnum]

const BASE_SPLIT = Number(process.env.CONTRACTOR_BASE_SPLIT ?? 0.5)
const TRAVEL_SPLIT = Number(process.env.CONTRACTOR_TRAVEL_SPLIT ?? 0.7)
const WITNESS_SPLIT = Number(process.env.CONTRACTOR_WITNESS_SPLIT ?? 0.5)

function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  return value.toNumber()
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

export interface PayoutGenerationResult {
  notaryId: string
  payoutId: string
  totalAmount: number
  bookingCount: number
}

export interface PayoutSummary {
  id: string
  notaryId: string
  notaryName: string | null
  notaryEmail: string | null
  periodStart: string
  periodEnd: string
  status: ContractorPayoutStatus
  totalAmount: number
  entryCount: number
  entries: Array<{
    id: string
    bookingId: string | null
    entryType: ContractorPayoutEntryType
    amount: number
    description: string | null
    metadata?: Record<string, any> | null
  }>
}

function getWeeklyWindow(referenceDate: Date = new Date()) {
  // Generate payouts for the previous week (Mon-Sun)
  const previousWeek = subWeeks(referenceDate, 1)
  const periodStart = startOfWeek(previousWeek, { weekStartsOn: 1 })
  const periodEnd = endOfWeek(previousWeek, { weekStartsOn: 1 })
  return { periodStart, periodEnd }
}

async function createOrResetPayout(notaryId: string, periodStart: Date, periodEnd: Date) {
  const payout = await prisma.contractorPayout.upsert({
    where: {
      notaryId_periodStart_periodEnd: {
        notaryId,
        periodStart,
        periodEnd,
      },
    },
    create: {
      notaryId,
      periodStart,
      periodEnd,
      status: ContractorPayoutStatusEnum.PENDING,
      totalAmount: new Prisma.Decimal(0),
    },
    update: {
      status: ContractorPayoutStatusEnum.PENDING,
      totalAmount: new Prisma.Decimal(0),
      notes: null,
      finalizedAt: null,
    },
  })

  await prisma.contractorPayoutEntry.deleteMany({ where: { payoutId: payout.id } })

  return payout
}

function buildEntry(payoutId: string, bookingId: string | null, type: ContractorPayoutEntryType, amount: number, description: string, metadata?: Record<string, any>) {
  return {
    payoutId,
    bookingId,
    entryType: type,
    amount: new Prisma.Decimal(roundCurrency(amount)),
    description,
    metadata: metadata ?? undefined,
  }
}

export async function generateWeeklyContractorPayouts(referenceDate: Date = new Date()): Promise<PayoutGenerationResult[]> {
  const { periodStart, periodEnd } = getWeeklyWindow(referenceDate)

  const completedBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.COMPLETED,
      notaryId: {
        not: null,
      },
      scheduledDateTime: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    select: {
      id: true,
      notaryId: true,
      priceAtBooking: true,
      travelFee: true,
      urgency_fee: true,
      urgency_level: true,
      witness_fee: true,
      witness_type: true,
      service: {
        select: {
          name: true,
          serviceType: true,
        },
      },
    },
  })

  const grouped = completedBookings.reduce<Record<string, typeof completedBookings>>((acc, booking) => {
    const notaryId = booking.notaryId as string
    if (!acc[notaryId]) acc[notaryId] = []
    acc[notaryId].push(booking)
    return acc
  }, {})

  const results: PayoutGenerationResult[] = []

  for (const [notaryId, bookings] of Object.entries(grouped)) {
    const payout = await createOrResetPayout(notaryId, periodStart, periodEnd)

    const entries: ReturnType<typeof buildEntry>[] = []
    let subtotal = 0

    for (const booking of bookings) {
      const bookingId = booking.id
      const total = decimalToNumber(booking.priceAtBooking)
      const travelFee = decimalToNumber(booking.travelFee)
      const urgencyFee = decimalToNumber(booking.urgency_fee)
      const witnessFee = decimalToNumber(booking.witness_fee)

      const baseAmount = Math.max(total - travelFee - urgencyFee - witnessFee, 0)
      const basePay = roundCurrency(baseAmount * BASE_SPLIT)
      const travelShare = roundCurrency(travelFee * TRAVEL_SPLIT)
      const urgencyBonus = roundCurrency(urgencyFee)
      const witnessShareEligible = booking.witness_type && booking.witness_type !== 'customer_provided'
      const witnessShare = witnessShareEligible ? roundCurrency(witnessFee * WITNESS_SPLIT) : 0

      if (basePay > 0) {
        entries.push(buildEntry(payout.id, bookingId, ContractorPayoutEntryTypeEnum.BASE, basePay, 'Base service pay', {
          service: booking.service?.serviceType ?? booking.service?.name,
        }))
        subtotal += basePay
      }

      if (travelShare > 0) {
        entries.push(buildEntry(payout.id, bookingId, ContractorPayoutEntryTypeEnum.TRAVEL_SHARE, travelShare, 'Travel distance share', {
          travelFee,
        }))
        subtotal += travelShare
      }

      if (urgencyBonus > 0) {
        entries.push(buildEntry(payout.id, bookingId, ContractorPayoutEntryTypeEnum.URGENCY_BONUS, urgencyBonus, 'Urgency/after-hours bonus', {
          urgencyLevel: booking.urgency_level,
        }))
        subtotal += urgencyBonus
      }

      if (witnessShare > 0) {
        entries.push(buildEntry(payout.id, bookingId, ContractorPayoutEntryTypeEnum.WITNESS_SPLIT, witnessShare, 'Witness coordination share'))
        subtotal += witnessShare
      }
    }

    if (entries.length === 0) {
      continue
    }

    await prisma.contractorPayoutEntry.createMany({
      data: entries,
    })

    await prisma.contractorPayout.update({
      where: { id: payout.id },
      data: {
        totalAmount: new Prisma.Decimal(roundCurrency(subtotal)),
        notes: `Auto-generated ${new Date().toISOString()}`,
      },
    })

    logger.info(`Generated contractor payout ${payout.id} for notary ${notaryId}`, 'PAYOUT_SERVICE', {
      notaryId,
      bookingCount: bookings.length,
      total: subtotal,
    })

    results.push({
      notaryId,
      payoutId: payout.id,
      totalAmount: roundCurrency(subtotal),
      bookingCount: bookings.length,
    })
  }

  return results
}

export async function getPayoutSummary(options: {
  periodStart?: Date
  periodEnd?: Date
  limit?: number
} = {}): Promise<PayoutSummary[]> {
  const { periodStart, periodEnd, limit = 20 } = options

  const whereClause: Prisma.ContractorPayoutWhereInput = {}
  if (periodStart) {
    whereClause.periodStart = { gte: periodStart }
  }
  if (periodEnd) {
    whereClause.periodEnd = { lte: periodEnd }
  }

  const payouts = await prisma.contractorPayout.findMany({
    where: whereClause,
    orderBy: { periodEnd: 'desc' },
    take: limit,
    include: {
      notary: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      entries: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return payouts.map((payout) => ({
    id: payout.id,
    notaryId: payout.notaryId,
    notaryName: payout.notary?.name ?? null,
    notaryEmail: payout.notary?.email ?? null,
    periodStart: payout.periodStart.toISOString(),
    periodEnd: payout.periodEnd.toISOString(),
    status: payout.status,
    totalAmount: roundCurrency(decimalToNumber(payout.totalAmount)),
    entryCount: payout.entries.length,
    entries: payout.entries.map((entry) => ({
      id: entry.id,
      bookingId: entry.bookingId,
      entryType: entry.entryType,
      amount: roundCurrency(decimalToNumber(entry.amount)),
      description: entry.description,
      metadata: entry.metadata as Record<string, any> | null,
    })),
  }))
}
