import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Download, 
  CreditCard, 
  Bell, 
  MapPin, 
  Clock, 
  FileText,
  ExternalLink,
  Smartphone,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { CustomerPortalActions } from "@/components/dashboard/customer-portal-actions"

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  // Fetch user's bookings
  const [upcomingBookings, pastBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        signerId: session.user.id,
        scheduledDateTime: {
          gte: new Date()
        }
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
        payments: true
      },
      orderBy: {
        scheduledDateTime: 'asc'
      }
    }),
    prisma.booking.findMany({
      where: {
        signerId: session.user.id,
        scheduledDateTime: {
          lt: new Date()
        }
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
        payments: true
      },
      orderBy: {
        scheduledDateTime: 'desc'
      },
      take: 20 // Last 20 bookings
    })
  ])

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "TBD"
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, label: string, color: string }> = {
      'REQUESTED': { variant: 'secondary', label: 'Requested', color: 'bg-blue-100 text-blue-800' },
      'PAYMENT_PENDING': { variant: 'destructive', label: 'Payment Required', color: 'bg-red-100 text-red-800' },
      'AWAITING_CLIENT_ACTION': { variant: 'secondary', label: 'Action Required', color: 'bg-yellow-100 text-yellow-800' },
      'READY_FOR_SERVICE': { variant: 'default', label: 'Ready', color: 'bg-green-100 text-green-800' },
      'CONFIRMED': { variant: 'default', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
      'IN_PROGRESS': { variant: 'default', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
      'COMPLETED': { variant: 'default', label: 'Completed', color: 'bg-green-100 text-green-800' },
      'CANCELLED_BY_CLIENT': { variant: 'destructive', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
      'CANCELLED_BY_STAFF': { variant: 'destructive', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
    }
    const config = variants[status] || { variant: 'secondary', label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getServiceIcon = (serviceType: string) => {
    if (serviceType?.toLowerCase().includes('ron') || serviceType?.toLowerCase().includes('remote')) {
      return <Smartphone className="h-4 w-4" />
    }
    return <MapPin className="h-4 w-4" />
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name || session.user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/booking" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              New Booking
            </Link>
          </Button>
          <CustomerPortalActions />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length + pastBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pastBookings.filter(b => b.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...upcomingBookings, ...pastBookings].filter(b => {
                const bookingMonth = new Date(b.createdAt).getMonth()
                const currentMonth = new Date().getMonth()
                return bookingMonth === currentMonth
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                <p className="text-muted-foreground mb-4">Book your next notary service to get started</p>
                <Button asChild>
                  <Link href="/booking">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(booking.service?.name || '')}
                      <div>
                        <CardTitle className="text-lg">{booking.service?.name || 'Notary Service'}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(booking.scheduledDateTime)}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Location/Service Type */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {booking.service?.name?.toLowerCase().includes('ron') ? (
                        <>
                          <Smartphone className="h-3 w-3" />
                          Remote Online Notarization
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3" />
                          {booking.addressStreet && booking.addressCity 
                            ? `${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState}` 
                            : 'Mobile Service'}
                        </>
                      )}
                    </div>

                    {/* Price */}
                    {booking.priceAtBooking && (
                      <div className="text-sm">
                        <span className="font-medium">${booking.priceAtBooking?.toNumber() || 0}</span>
                      </div>
                    )}

                    <Separator />

                    {/* Action buttons */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Booking #{booking.id.slice(-8)}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'PAYMENT_PENDING' && (
                          <Button size="sm" asChild>
                            <Link href={`/checkout/${booking.id}`}>
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay Now
                            </Link>
                          </Button>
                        )}
                        {booking.status === 'READY_FOR_SERVICE' && booking.service?.name?.toLowerCase().includes('ron') && (
                          <Button size="sm" asChild>
                            <Link href={`/ron/session/${booking.id}`}>
                              <Smartphone className="h-3 w-3 mr-1" />
                              Join Session
                            </Link>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/booking/${booking.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No past bookings</h3>
                <p className="text-muted-foreground">Your booking history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            pastBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(booking.service?.name || '')}
                      <div>
                        <CardTitle className="text-lg">{booking.service?.name || 'Notary Service'}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(booking.scheduledDateTime)}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Location/Service Type */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {booking.service?.name?.toLowerCase().includes('ron') ? (
                        <>
                          <Smartphone className="h-3 w-3" />
                          Remote Online Notarization
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3" />
                          {booking.addressStreet && booking.addressCity 
                            ? `${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState}` 
                            : 'Mobile Service'}
                        </>
                      )}
                    </div>

                    {/* Price */}
                    {booking.priceAtBooking && (
                      <div className="text-sm">
                        <span className="font-medium">${booking.priceAtBooking?.toNumber() || 0}</span>
                      </div>
                    )}

                    <Separator />

                    {/* Action buttons */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Booking #{booking.id.slice(-8)}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'COMPLETED' && (
                          <>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/api/bookings/${booking.id}/download`}>
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={booking.stripePaymentUrl || `/api/payments/${booking.id}/receipt`}>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Receipt
                              </Link>
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/booking/${booking.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* PWA Install Prompt (will be shown by the client component) */}
      <div id="pwa-install-prompt" className="hidden"></div>
    </div>
  )
}
