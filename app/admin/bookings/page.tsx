import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from 'next/navigation';
import { Role } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, CheckCircle, XCircle, Clock, Calendar, RotateCw, Ban, CalendarCheck, CalendarX
} from "lucide-react";
import { getQueues } from "@/lib/queue/config";
import { BookingWithRelations } from "@/lib/types/prisma";

// Helper function to format dates
const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect('/portal'); // Redirect non-admins
  }

  // Fetch booking data  
  let pendingBookings: BookingWithRelations[] = [];
  let confirmedBookings: BookingWithRelations[] = [];
  let cancelledBookings: BookingWithRelations[] = [];
  
  try {
    // Fetch pending bookings
    pendingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['REQUESTED', 'PAYMENT_PENDING'] },
      },
      orderBy: {
        scheduledDateTime: 'asc',
      },
      take: 50,
      include: {
        User_Booking_signerIdToUser: true,
        service: true,
      }
    });

    // Fetch confirmed bookings (next 50 upcoming)
    confirmedBookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        scheduledDateTime: { gte: new Date() }
      },
      orderBy: {
        scheduledDateTime: 'asc',
      },
      take: 50,
      include: {
        User_Booking_signerIdToUser: true,
        service: true,
      }
    });

    // Fetch cancelled bookings
    cancelledBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF'] },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50,
      include: {
        User_Booking_signerIdToUser: true,
        service: true,
      }
    });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return <p className="text-red-500">Error loading bookings. Please try again later.</p>;
  }

  // Get queue statistics
  let queueStats = {
    bookingProcessingQueue: 0
  };

  try {
    const queues = getQueues();
    if (queues) {
      queueStats = {
        bookingProcessingQueue: 0, // This would be replaced with actual queue length in production
      };
    }
  } catch (error) {
    console.error("Failed to get booking queue stats:", error);
  }

  // Status badge renderer
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Requested</Badge>;
      case 'PAYMENT_PENDING':
        return <Badge variant="secondary" className="flex items-center gap-1"><RotateCw className="h-3 w-3" /> Payment Pending</Badge>;
      case 'CONFIRMED':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Confirmed</Badge>;
      case 'CANCELLED_BY_CLIENT':
      case 'CANCELLED_BY_STAFF':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="flex items-center gap-1"><CalendarCheck className="h-3 w-3" /> Completed</Badge>;
      case 'NO_SHOW':
        return <Badge variant="destructive" className="flex items-center gap-1"><Ban className="h-3 w-3" /> No Show</Badge>;
      case 'REQUIRES_RESCHEDULE':
        return <Badge variant="secondary" className="flex items-center gap-1"><CalendarX className="h-3 w-3" /> Needs Reschedule</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <div className="flex gap-2">
          <form action="/api/admin/bookings/process-all" method="POST">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Process Queue
            </Button>
          </form>
          <Button size="sm" variant="outline" className="flex items-center gap-1" asChild>
            <a href="/admin/bookings/new">
              <Calendar className="h-4 w-4" /> New Booking
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingBookings.length}</div>
            <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {confirmedBookings.filter(booking => {
                if (!booking.scheduledDateTime) return false;
                const today = new Date();
                const bookingDate = new Date(booking.scheduledDateTime);
                return (
                  bookingDate.getDate() === today.getDate() &&
                  bookingDate.getMonth() === today.getMonth() &&
                  bookingDate.getFullYear() === today.getFullYear()
                );
              }).length}
            </div>
            <p className="text-sm text-muted-foreground">Appointments today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Processing Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{queueStats.bookingProcessingQueue}</div>
            <p className="text-sm text-muted-foreground">Tasks in queue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Bookings</CardTitle>
              <CardDescription>Bookings awaiting confirmation or payment</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No pending bookings.
                      </TableCell>
                    </TableRow>
                  )}
                  {pendingBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.User_Booking_signerIdToUser?.name || '-'}</TableCell>
                      <TableCell>{booking.service?.name || '-'}</TableCell>
                      <TableCell>{formatDateTime(booking.scheduledDateTime)}</TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/admin/bookings/${booking.id}`}>
                              View
                            </a>
                          </Button>
                          <form action={`/api/admin/bookings/${booking.id}/confirm`} method="POST">
                            <Button size="sm" variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Confirm
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmed">
          <Card>
            <CardHeader>
              <CardTitle>Confirmed Bookings</CardTitle>
              <CardDescription>Upcoming confirmed bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confirmedBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No confirmed bookings.
                      </TableCell>
                    </TableRow>
                  )}
                  {confirmedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.User_Booking_signerIdToUser?.name || '-'}</TableCell>
                      <TableCell>{booking.service?.name || '-'}</TableCell>
                      <TableCell>{formatDateTime(booking.scheduledDateTime)}</TableCell>
                      <TableCell>{booking.service?.durationMinutes || '-'} min</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/admin/bookings/${booking.id}`}>
                              View
                            </a>
                          </Button>
                          <form action={`/api/admin/bookings/${booking.id}/complete`} method="POST">
                            <Button size="sm" variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Complete
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Bookings</CardTitle>
              <CardDescription>Recently cancelled bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Original Schedule</TableHead>
                    <TableHead>Cancelled At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancelledBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No cancelled bookings.
                      </TableCell>
                    </TableRow>
                  )}
                  {cancelledBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.User_Booking_signerIdToUser?.name || '-'}</TableCell>
                      <TableCell>{booking.service?.name || '-'}</TableCell>
                      <TableCell>{formatDateTime(booking.scheduledDateTime)}</TableCell>
                      <TableCell>{formatDateTime(booking.updatedAt)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/admin/bookings/${booking.id}`}>
                            View
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
