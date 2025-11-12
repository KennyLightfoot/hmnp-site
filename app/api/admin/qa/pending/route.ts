import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, Session } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getErrorMessage } from '@/lib/utils/error-utils'
import { BookingStatus, Role } from '@prisma/client'

type QAStatus = 'PENDING' | 'IN_PROGRESS' | 'FLAGGED' | 'COMPLETE'

function ensureAdmin(session: Session | null) {
  const role = (session?.user as any)?.role as Role | undefined
  if (!session?.user || (role !== Role.ADMIN && role !== Role.STAFF)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const unauthorized = ensureAdmin(session)
    if (unauthorized) return unauthorized

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 50) : 10

    const completed = await prisma.booking.findMany({
      where: {
        status: BookingStatus.COMPLETED,
      },
      orderBy: {
        scheduledDateTime: 'desc',
      },
      take: limit * 2, // Fetch more to filter client-side
      select: {
        id: true,
        customerName: true,
        scheduledDateTime: true,
        service: {
          select: {
            name: true,
          },
        },
        User_Booking_notaryIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Fetch QA records separately
    const qaRecords = await Promise.all(
      completed.map(async (booking) => {
        try {
          const qa = await (prisma as any).bookingQARecord.findUnique({
            where: { bookingId: booking.id },
            select: {
              status: true,
              journalEntryVerified: true,
              sealPhotoVerified: true,
              documentCountVerified: true,
              clientConfirmationVerified: true,
              closeoutFormVerified: true,
              updatedAt: true,
            },
          })
          return { bookingId: booking.id, qa }
        } catch {
          return { bookingId: booking.id, qa: null }
        }
      })
    )

    const qaMap = new Map(qaRecords.map((r) => [r.bookingId, r.qa]))
    const pending = completed
      .map((booking) => ({ ...booking, qaRecord: qaMap.get(booking.id) || null }))
      .filter((booking) => !booking.qaRecord || booking.qaRecord.status !== 'COMPLETE')
      .slice(0, limit)

    const data = pending.map((booking) => ({
      id: booking.id,
      customerName: booking.customerName,
      scheduledDateTime: booking.scheduledDateTime?.toISOString() ?? null,
      serviceName: booking.service?.name ?? null,
      notary: booking.User_Booking_notaryIdToUser
        ? {
            id: booking.User_Booking_notaryIdToUser.id,
            name: booking.User_Booking_notaryIdToUser.name,
            email: booking.User_Booking_notaryIdToUser.email,
          }
        : null,
      qaStatus: (booking.qaRecord?.status as QAStatus) ?? 'PENDING',
      checklist: booking.qaRecord
        ? {
            journalEntryVerified: booking.qaRecord.journalEntryVerified,
            sealPhotoVerified: booking.qaRecord.sealPhotoVerified,
            documentCountVerified: booking.qaRecord.documentCountVerified,
            clientConfirmationVerified: booking.qaRecord.clientConfirmationVerified,
            closeoutFormVerified: booking.qaRecord.closeoutFormVerified,
            updatedAt: booking.qaRecord.updatedAt?.toISOString() ?? null,
          }
        : null,
    }))

    return NextResponse.json({
      success: true,
      data,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    )
  }
}

