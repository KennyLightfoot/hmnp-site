import { BookingStatus, PaymentStatus, Prisma } from '@/lib/prisma-types'
import { endOfWeek, startOfWeek, subWeeks } from 'date-fns'

import { prisma } from '@/lib/prisma'
import { getRumSummary, RumSummary } from '@/lib/analytics/rum-service'

function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  return value.toNumber()
}

export interface WeeklyOwnerReport {
  periodStart: Date
  periodEnd: Date
  bookings: {
    total: number
    completed: number
    completionRate: number
    averageValue: number
  }
  payments: {
    total: number
    successful: number
    successRate: number
  }
  leads: {
    supportTickets: number
  }
  reviews: {
    total: number
  }
  rum: RumSummary
}

function getTargetWindow(referenceDate: Date) {
  const previousWeek = subWeeks(referenceDate, 1)
  const start = startOfWeek(previousWeek, { weekStartsOn: 1 })
  const end = endOfWeek(previousWeek, { weekStartsOn: 1 })
  return { start, end }
}

export async function generateWeeklyOwnerReport(referenceDate: Date = new Date()): Promise<WeeklyOwnerReport> {
  const { start: periodStart, end: periodEnd } = getTargetWindow(referenceDate)

  const [bookings, payments, leads, reviews, rum] = await Promise.all([
    prisma.booking.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        status: true,
        priceAtBooking: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        status: true,
      },
    }),
    prisma.supportTicket.count({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        issueType: 'booking_question',
      },
    }),
    prisma.review.count({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    }),
    getRumSummary(),
  ])

  const totalBookings = bookings.length
  const completedBookings = bookings.filter((booking: { status: BookingStatus }) => booking.status === BookingStatus.COMPLETED).length
  const bookingCompletionRate = totalBookings > 0 ? completedBookings / totalBookings : 0
  const averageBookingValue = totalBookings > 0
    ? bookings.reduce((sum: number, booking: { priceAtBooking: Prisma.Decimal | number | null | undefined }) => sum + decimalToNumber(booking.priceAtBooking), 0) / totalBookings
    : 0

  const totalPayments = payments.length
  const successfulPayments = payments.filter((payment: { status: PaymentStatus }) => payment.status === PaymentStatus.COMPLETED).length
  const paymentSuccessRate = totalPayments > 0 ? successfulPayments / totalPayments : 0

  return {
    periodStart,
    periodEnd,
    bookings: {
      total: totalBookings,
      completed: completedBookings,
      completionRate: bookingCompletionRate,
      averageValue: averageBookingValue,
    },
    payments: {
      total: totalPayments,
      successful: successfulPayments,
      successRate: paymentSuccessRate,
    },
    leads: {
      supportTickets: leads,
    },
    reviews: {
      total: reviews,
    },
    rum,
  }
}
