import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { PaymentStatus } from '@/lib/prisma-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key') || request.nextUrl.searchParams.get('key')
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const bookingId: string | undefined = body?.bookingId
    const amountCents: number | undefined = typeof body?.amountCents === 'number' ? body.amountCents : undefined
    const paidNotes: string | undefined = typeof body?.notes === 'string' ? body.notes : undefined
    if (!bookingId) {
      return NextResponse.json({ message: 'bookingId is required' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }

    const totalPaid = typeof booking.totalPaid === 'object' ? Number(booking.totalPaid) : (booking.totalPaid ?? 0)
    const delta = typeof amountCents === 'number' ? amountCents / 100 : Number(booking.priceAtBooking)
    const newTotalPaid = totalPaid + delta
    const newStatus = newTotalPaid >= Number(booking.priceAtBooking) ? PaymentStatus.COMPLETED : PaymentStatus.PARTIALLY_REFUNDED // using PARTIALLY_REFUNDED to indicate partial paid; if you prefer add PARTIAL enum later

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        totalPaid: newTotalPaid,
        paymentStatus: newStatus,
        paidAt: new Date(),
        paidMarkedByUserId: 'admin',
        paidNotes,
      },
    })

    return NextResponse.json({ success: true, booking: { id: updated.id, paymentStatus: updated.paymentStatus, totalPaid: updated.totalPaid, paidAt: updated.paidAt } })
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', error: getErrorMessage(error) }, { status: 500 })
  }
}


