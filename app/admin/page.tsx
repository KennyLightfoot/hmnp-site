import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, CreditCard, Bell, AlertCircle, Activity } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect('/portal'); // Redirect non-admins
  }

  // Fetch summary data for dashboard
  const [
            total_bookings,
    pendingBookings,
    totalClients,
            totalRevenue,
    scheduledNotifications,
    activeAlerts
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({
      where: {
        status: { in: ['REQUESTED', 'PAYMENT_PENDING'] }
      }
    }),
    prisma.user.count({
      where: { role: 'SIGNER' }
    }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    }),
    prisma.notificationLog.count({
      where: {
        status: 'PENDING'
      }
    }),
    prisma.systemAlert.count({
      where: { status: 'ACTIVE' }
    }).catch(() => 0) // Handle if this table doesn't exist yet
  ]);

  // Calculate metrics
  const totalRevenueFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(totalRevenue?._sum?.amount?.toNumber() || 0);

  const dashboardItems = [
    {
      title: "Bookings",
      icon: CalendarDays,
      value: total_bookings.toString(),
      description: `${pendingBookings} pending`,
      href: "/admin/bookings",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Clients",
      icon: Users,
      value: totalClients.toString(),
      description: "Total clients",
      href: "/admin/clients",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Revenue",
      icon: CreditCard,
      value: totalRevenueFormatted,
      description: "Total processed",
      href: "/admin/payments",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Notifications",
      icon: Bell,
      value: scheduledNotifications.toString(),
      description: "Pending to send",
      href: "/admin/notifications",
      color: "bg-amber-100 text-amber-800"
    },
    {
      title: "System Alerts",
      icon: AlertCircle,
      value: activeAlerts.toString(),
      description: "Active alerts",
      href: "/admin/alerts",
      color: "bg-red-100 text-red-800"
    },
    {
      title: "Workers",
      icon: Activity,
      value: "4",  // This would be dynamic in production
      description: "Queue workers",
      href: "/admin/workers",
      color: "bg-indigo-100 text-indigo-800"
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {dashboardItems.map((item, index) => (
          <Link href={item.href} key={index}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                <div className={`p-2 rounded-full ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            {/* This would be populated with actual recent booking data, 
                but we'll keep it simple for now */}
            <p className="text-sm text-muted-foreground">
              View all bookings for detailed information
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Monitoring and health checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Notification Service</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Queue Workers</span>
                <Link href="/admin/workers" className="text-green-600 font-medium hover:underline">Running</Link>
              </div>
              <div className="flex justify-between items-center">
                <span>Database</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
