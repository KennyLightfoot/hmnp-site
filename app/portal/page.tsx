import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { Metadata } from "next";
import { Suspense } from 'react';
import PageAwareDataLoader from '@/components/page-aware-data-loader';
import { prisma } from "@/lib/db";
import { CustomerPortalActions } from "@/components/dashboard/customer-portal-actions";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, Clock, MapPin, Phone, Download } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const dynamic = 'force-dynamic'; // Explicitly set route to dynamic

export const metadata: Metadata = {
  title: "HMNP Portal",
};

// Define the props for the page, including searchParams
interface PortalAssignmentsPageProps {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    status?: string;
    // other params if any
  }>;
}

const PAGE_SIZE = 15; // Define items per page

export default async function CustomerPortal() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's bookings
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { signerId: session.user.id },
        { signerEmail: session.user.email || '' }
      ]
    },
    include: {
      Service: true,
      NotificationLog: {
        take: 3,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const upcomingBookings = bookings.filter(booking => 
    booking.scheduledDateTime && new Date(booking.scheduledDateTime) > new Date() &&
    !['COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF'].includes(booking.status)
  );

  const recentBookings = bookings.filter(booking =>
    ['COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF'].includes(booking.status)
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PAYMENT_PENDING': 'bg-red-100 text-red-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'SCHEDULED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-orange-100 text-orange-800',
      'COMPLETED': 'bg-gray-100 text-gray-800',
      'CANCELLED_BY_CLIENT': 'bg-red-100 text-red-800',
      'CANCELLED_BY_STAFF': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PAYMENT_PENDING': 'Payment Required',
      'CONFIRMED': 'Confirmed',
      'SCHEDULED': 'Scheduled',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Complete',
      'CANCELLED_BY_CLIENT': 'Cancelled',
      'CANCELLED_BY_STAFF': 'Cancelled',
    };
    return labels[status] || status;
  };

  return (
    <>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#002147]">
              Welcome back, {session.user.name || 'Customer'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your notary appointments and documents
            </p>
          </div>
          <CustomerPortalActions />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#A52A2A] rounded-lg">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Book New Service</h3>
                  <p className="text-sm text-gray-600">Schedule your next appointment</p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-[#A52A2A] hover:bg-[#8B0000]" asChild>
                <Link href="/booking">Book Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#002147] rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">My Documents</h3>
                  <p className="text-sm text-gray-600">Download completed docs</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/portal/documents">View All</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Contact Support</h3>
                  <p className="text-sm text-gray-600">Need help with your service?</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/contact">Get Help</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        {upcomingBookings.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#A52A2A]" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Your scheduled notary services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{booking.Service.name}</h4>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                      {booking.scheduledDateTime && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                              {new Date(booking.scheduledDateTime).toLocaleDateString()} at{' '}
                              {new Date(booking.scheduledDateTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {booking.addressStreet && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{booking.addressCity}, {booking.addressState}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/portal/${booking.id}`}>Details</Link>
                      </Button>
                      {booking.status === 'PAYMENT_PENDING' && (
                        <Button size="sm" className="bg-[#A52A2A] hover:bg-[#8B0000]">
                          Complete Payment
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#A52A2A]" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your completed and past services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{booking.Service.name}</h4>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.createdAt && (
                          <span>
                            {formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}
                          </span>
                        )}
                        {booking.finalPrice && (
                          <span className="ml-4 font-medium">
                            ${booking.finalPrice.toString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/portal/${booking.id}`}>View</Link>
                      </Button>
                      {booking.status === 'COMPLETED' && booking.finalPrice && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No services yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Book your first notary service to get started
                </p>
                <Button className="bg-[#A52A2A] hover:bg-[#8B0000]" asChild>
                  <Link href="/booking">Book Service</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </>
  );
}
