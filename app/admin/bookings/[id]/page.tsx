import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Role, type BookingQARecord } from '@prisma/client'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DeleteUploadedDocButton from '@/components/admin/DeleteUploadedDocButton'
import { QAChecklistCard } from '@/components/admin/QAChecklistCard'

export default async function AdminBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as Role | undefined
  if (!session?.user || (role !== Role.ADMIN && role !== Role.STAFF)) {
    redirect('/portal')
  }
  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      uploadedDocuments: {
        orderBy: { uploadedAt: 'desc' }
      },
    }
  })
  if (!booking) return notFound()

  const qaRecord = await (prisma as any).bookingQARecord.findUnique({
    where: { bookingId: id }
  }) as BookingQARecord | null

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Booking {booking.id.slice(-8)}</h1>
        <p className="text-sm text-muted-foreground">{booking.service?.name} · {booking.status}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <QAChecklistCard
          bookingId={booking.id}
          initialQa={qaRecord ? {
            status: qaRecord.status,
            journalEntryVerified: qaRecord.journalEntryVerified,
            sealPhotoVerified: qaRecord.sealPhotoVerified,
            documentCountVerified: qaRecord.documentCountVerified,
            clientConfirmationVerified: qaRecord.clientConfirmationVerified,
            closeoutFormVerified: qaRecord.closeoutFormVerified,
            notes: qaRecord.notes,
            followUpAction: qaRecord.followUpAction,
            updatedAt: qaRecord.updatedAt?.toISOString()
          } : null}
        />

        <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>Files provided during booking (in-person)</CardDescription>
        </CardHeader>
        <CardContent>
          {booking.uploadedDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
          ) : (
            <div className="space-y-2">
              {booking.uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <div className="truncate max-w-[70%]" title={doc.filename}>
                    {doc.filename}
                    <span className="ml-2 text-muted-foreground">{new Date(doc.uploadedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/api/admin/bookings/${booking.id}/documents/${doc.id}/download`}>
                      <Button size="sm" variant="outline">Download</Button>
                    </Link>
                    <DeleteUploadedDocButton bookingId={booking.id} docId={doc.id} filename={doc.filename} />
                  </div>
                </div>
              ))}
              {/* Skeleton row shown during refresh via button state handled locally */}
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}


