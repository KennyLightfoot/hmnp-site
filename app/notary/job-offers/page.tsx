import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, DollarSign, Calendar, User, FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/date-utils'
import JobOfferActions from '@/components/notary/JobOfferActions'

export default async function NotaryJobOffersPage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role

  if (!session?.user || userRole !== Role.NOTARY) {
    redirect('/portal')
  }

  const offers = await prisma.jobOffer.findMany({
    where: {
      notaryId: session.user.id,
      status: 'PENDING',
      expiresAt: {
        gte: new Date(),
      },
    },
    include: {
      Booking: {
        include: {
          service: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const acceptedOffers = await prisma.jobOffer.findMany({
    where: {
      notaryId: session.user.id,
      status: 'ACCEPTED',
    },
    include: {
      Booking: {
        include: {
          service: true,
        },
      },
    },
    orderBy: {
      acceptedAt: 'desc',
    },
    take: 10,
  })

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Job Offers</h1>
        <p className="text-gray-600 mt-1">Accept jobs that fit your schedule</p>
      </div>

      {/* Available Offers */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Available Offers ({offers.length})</h2>
        {offers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No available job offers at this time.</p>
              <p className="text-sm mt-2">New offers will appear here when they become available.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {offers.map((offer) => {
              const booking = offer.Booking
              const timeUntilExpiry = Math.max(0, Math.floor((offer.expiresAt.getTime() - Date.now()) / 1000 / 60))

              return (
                <Card key={offer.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {booking.service.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Booking #{booking.id.slice(0, 8)}
                        </CardDescription>
                      </div>
                      <Badge variant={timeUntilExpiry < 5 ? 'destructive' : 'default'}>
                        {timeUntilExpiry} min left
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Scheduled</p>
                            <p className="text-sm text-gray-600">
                              {booking.scheduledDateTime
                                ? formatDateTime(booking.scheduledDateTime)
                                : 'Not scheduled yet'}
                            </p>
                          </div>
                        </div>
                        {booking.addressStreet && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-gray-600">
                                {booking.addressStreet}
                                {booking.addressCity && `, ${booking.addressCity}`}
                                {booking.addressState && ` ${booking.addressState}`}
                                {booking.addressZip && ` ${booking.addressZip}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Price</p>
                            <p className="text-sm text-gray-600">
                              ${booking.priceAtBooking.toNumber().toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {booking.customerName && (
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Customer</p>
                              <p className="text-sm text-gray-600">{booking.customerName}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{booking.notes}</p>
                      </div>
                    )}
                    <JobOfferActions offerId={offer.id} bookingId={booking.id} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Accepted Offers */}
      {acceptedOffers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Recently Accepted ({acceptedOffers.length})</h2>
          <div className="grid gap-4">
            {acceptedOffers.map((offer) => {
              const booking = offer.Booking
              return (
                <Card key={offer.id} className="bg-green-50 border-green-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {booking.service.name}
                          <Badge variant="default" className="bg-green-600">Accepted</Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Accepted {offer.acceptedAt ? formatDateTime(offer.acceptedAt) : 'Recently'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Scheduled</p>
                        <p className="text-sm text-gray-600">
                          {booking.scheduledDateTime
                            ? formatDateTime(booking.scheduledDateTime)
                            : 'Not scheduled yet'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Price</p>
                        <p className="text-sm text-gray-600">
                          ${booking.priceAtBooking.toNumber().toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4"
                      asChild
                    >
                      <a href={`/notary/bookings/${booking.id}`}>View Booking Details</a>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

