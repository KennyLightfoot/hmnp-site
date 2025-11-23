import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PaymentStatus, Role } from '@/lib/prisma-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role as Role | undefined
    if (!session || !role || (role !== Role.ADMIN && role !== Role.STAFF)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const amountCents: number | undefined = typeof body?.amountCents === 'number' ? body.amountCents : undefined
    const notes: string | undefined = typeof body?.notes === 'string' ? body.notes : undefined

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }

    const priceAtBooking = Number(booking.priceAtBooking)
    const currentPaid = booking.totalPaid ? Number(booking.totalPaid) : 0
    const delta = typeof amountCents === 'number' ? amountCents / 100 : Math.max(priceAtBooking - currentPaid, 0)
    const newTotalPaid = currentPaid + delta
    const completed = newTotalPaid + 1e-6 >= priceAtBooking

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        totalPaid: newTotalPaid,
        paymentStatus: completed ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        paidAt: completed ? new Date() : booking.paidAt,
        paidMarkedByUserId: (session.user as any)?.id ?? 'admin',
        paidNotes: notes,
      }
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: updated.id,
        totalPaid: updated.totalPaid,
        paymentStatus: updated.paymentStatus,
        paidAt: updated.paidAt,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: String(e?.message || e) }, { status: 500 })
  }
}


