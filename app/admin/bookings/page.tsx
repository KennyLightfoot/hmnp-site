import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Prisma } from '@/lib/prisma-types'

type BookingListItem = Prisma.BookingGetPayload<{
  select: {
    id: true
    customerName: true
    customerEmail: true
    scheduledDateTime: true
    status: true
    paymentStatus: true
    paymentMethod: true
    priceAtBooking: true
    totalPaid: true
  }
}>

type QACandidate = Prisma.BookingGetPayload<{
  select: {
    id: true
    customerName: true
    scheduledDateTime: true
    service: {
      select: {
        name: true
      }
    }
    User_Booking_notaryIdToUser: {
      select: {
        name: true
        email: true
      }
    }
  }
}>

type QARecordItem = {
  bookingId: string
  qa: {
    status: string
    updatedAt: Date
    journalEntryVerified: boolean
    sealPhotoVerified: boolean
    documentCountVerified: boolean
    clientConfirmationVerified: boolean
    closeoutFormVerified: boolean
  } | null
}

type QAQueueItem = QACandidate & {
  qaRecord: QARecordItem['qa']
}

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as string | undefined
  if (!session?.user || (role !== 'ADMIN' && role !== 'STAFF')) {
    redirect('/portal')
  }

  const bookings: BookingListItem[] = await prisma.booking.findMany({
    orderBy: [{ createdAt: 'desc' }],
    take: 25,
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      scheduledDateTime: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      priceAtBooking: true,
      totalPaid: true,
    }
  })

  const qaCandidates: QACandidate[] = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
    },
    orderBy: [{ scheduledDateTime: 'desc' }],
    take: 25,
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
          name: true,
          email: true,
        },
      },
    },
  })

  // Fetch QA records separately using raw query to avoid Prisma type issues
  const qaRecords: QARecordItem[] = await Promise.all(
    qaCandidates.map(async (booking: QACandidate): Promise<QARecordItem> => {
      try {
        const qa = await prisma.bookingQARecord.findUnique({
          where: { bookingId: booking.id },
          select: {
            status: true,
            updatedAt: true,
            journalEntryVerified: true,
            sealPhotoVerified: true,
            documentCountVerified: true,
            clientConfirmationVerified: true,
            closeoutFormVerified: true,
          },
        })
        return { bookingId: booking.id, qa }
      } catch {
        return { bookingId: booking.id, qa: null }
      }
    })
  )

  const qaMap = new Map(qaRecords.map((r: QARecordItem) => [r.bookingId, r.qa]))
  const qaQueue: QAQueueItem[] = qaCandidates
    .map((booking: QACandidate): QAQueueItem => ({ ...booking, qaRecord: qaMap.get(booking.id) || null }))
    .filter((booking: QAQueueItem) => !booking.qaRecord || booking.qaRecord.status !== 'COMPLETE')
    .slice(0, 10)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4">Bookings</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>QA Queue</CardTitle>
          <CardDescription>Completed bookings awaiting QA sign-off</CardDescription>
        </CardHeader>
        <CardContent>
          {qaQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground">All completed bookings have passed QA.</p>
          ) : (
            <div className="grid gap-3">
              {qaQueue.map((booking: QAQueueItem) => {
                const qa = booking.qaRecord
                const checklistCompleted = qa
                  ? [
                      qa.journalEntryVerified,
                      qa.sealPhotoVerified,
                      qa.documentCountVerified,
                      qa.clientConfirmationVerified,
                      qa.closeoutFormVerified,
                    ].filter(Boolean).length
                  : 0

                const scheduled = booking.scheduledDateTime?.toLocaleString?.() ?? booking.scheduledDateTime?.toISOString() ?? 'Unknown'
                const updatedLabel = qa?.updatedAt ? qa.updatedAt.toLocaleString() : null

                return (
                  <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {booking.customerName || 'Client'}
                        {booking.service?.name ? <span className="text-muted-foreground"> · {booking.service.name}</span> : null}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completed: {scheduled} · QA Status: {qa?.status ?? 'PENDING'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Notary: {booking.User_Booking_notaryIdToUser?.name || 'Unassigned'} ({booking.User_Booking_notaryIdToUser?.email || '—'})
                      </div>
                      <div className="text-xs">
                        Checklist progress: {checklistCompleted}/5{updatedLabel ? ` · updated ${updatedLabel}` : ''}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Link href={`/admin/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">Review</Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Last 25 bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {bookings.map((b: BookingListItem) => {
              const price = Number(b.priceAtBooking)
              const paid = Number(b.totalPaid ?? 0)
              const remaining = Math.max(price - paid, 0)
              return (
                <div key={b.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3">
                  <div className="space-y-1">
                    <div className="font-medium">{b.customerName || 'Unknown'} <span className="text-muted-foreground">({b.customerEmail || '—'})</span></div>
                    <div className="text-sm text-muted-foreground">{b.scheduledDateTime?.toISOString() || 'Unscheduled'} • {b.status}</div>
                    <div className="text-sm">Payment: <span className="uppercase">{b.paymentMethod}</span> • Status: {b.paymentStatus} • Total: ${price.toFixed(2)} • Paid: ${paid.toFixed(2)} • Due: ${remaining.toFixed(2)}</div>
                  </div>
                  <div className="mt-2 md:mt-0 flex gap-2">
                    <Link href={`/admin/bookings/${b.id}`}> <Button variant="outline" size="sm">Details</Button> </Link>
                    {remaining > 0 && (
                      <form action={`/api/admin/bookings/${b.id}/mark-paid`} method="post" className="flex items-center gap-2">
                        <input type="hidden" name="amountCents" value={Math.round(remaining * 100)} />
                        <Button type="submit" size="sm">Mark Paid</Button>
                      </form>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


