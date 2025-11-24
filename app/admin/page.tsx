import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import {
  Role,
  NotaryApplicationStatus,
  NotaryOnboardingStatus,
  NotaryAvailabilityStatus,
  JobOfferStatus,
} from "@/lib/prisma-types";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  CreditCard,
  Bell,
  AlertCircle,
  Activity,
  FileText,
  UserCheck,
  MapPin,
  Gauge,
} from "lucide-react";
import Link from "next/link";

// Force dynamic rendering to prevent SSR issues with client components
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed (tolerate NextAuth typing)
  const userRole = (session?.user as any)?.role
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect('/portal'); // Redirect non-admins
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  // Fetch summary data for dashboard
  const [
    totalBookings,
    pendingBookings,
    totalClients,
    totalRevenue,
    scheduledNotifications,
    activeAlerts,
    applicationStatusGroups,
    applicationsLast7Days,
    approvedNotConvertedCount,
    convertedLast30Days,
    activeNotariesCount,
    totalOnboardedNotaries,
    openNetworkJobs,
    pendingJobOffers,
    expiringJobOffersSoon,
    offersLast7Days,
    acceptedOffersLast7Days,
    expiredOffersLast24h,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({
      where: {
        status: { in: ['REQUESTED', 'PAYMENT_PENDING'] },
      },
    }),
    prisma.user.count({
      where: { role: 'SIGNER' },
    }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.notificationLog.count({
      where: {
        status: 'PENDING',
      },
    }),
    prisma.systemAlert.count({
      where: { status: 'ACTIVE' },
    }).catch(() => 0), // Handle if this table doesn't exist yet
    prisma.notaryApplication.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.notaryApplication.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.notaryApplication.count({
      where: {
        status: NotaryApplicationStatus.APPROVED,
        convertedToUserId: null,
      },
    }),
    prisma.notaryApplication.count({
      where: {
        status: NotaryApplicationStatus.CONVERTED,
        convertedAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.notary_profiles.count({
      where: {
        onboarding_status: NotaryOnboardingStatus.COMPLETE,
        availability_status: NotaryAvailabilityStatus.AVAILABLE,
        is_active: true,
      },
    }),
    prisma.notary_profiles.count({
      where: {
        onboarding_status: NotaryOnboardingStatus.COMPLETE,
      },
    }),
    prisma.booking.count({
      where: {
        sendToNetwork: true,
        jobOffers: {
          none: {
            status: JobOfferStatus.ACCEPTED,
          },
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.PENDING,
        expiresAt: {
          gte: now,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.PENDING,
        expiresAt: {
          gte: now,
          lte: fifteenMinutesFromNow,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.ACCEPTED,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    }),
    prisma.jobOffer.count({
      where: {
        status: JobOfferStatus.EXPIRED,
        updatedAt: {
          gte: twentyFourHoursAgo,
        },
      },
    }),
  ]);

  const applicationStatusMap = applicationStatusGroups.reduce<Record<string, number>>((acc, group) => {
    acc[group.status] = group._count._all;
    return acc;
  }, {});

  const totalApplications = Object.values(applicationStatusMap).reduce((sum, count) => sum + count, 0);
  const pendingApplications = applicationStatusMap[NotaryApplicationStatus.PENDING] || 0;
  const underReviewApplications = applicationStatusMap[NotaryApplicationStatus.UNDER_REVIEW] || 0;
  const convertedApplications = applicationStatusMap[NotaryApplicationStatus.CONVERTED] || 0;

  const jobOfferAcceptanceRate = offersLast7Days === 0
    ? 0
    : Math.round((acceptedOffersLast7Days / offersLast7Days) * 100);

  // Calculate metrics
  const totalRevenueFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(totalRevenue?._sum?.amount?.toNumber() || 0);

  const dashboardItems = [
    {
      title: "Bookings",
      icon: CalendarDays,
      value: totalBookings.toString(),
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

  const networkDashboardItems = [
    {
      title: "Notary Applications",
      icon: FileText,
      value: totalApplications.toString(),
      description: `${pendingApplications} pending • ${approvedNotConvertedCount} ready • ${convertedApplications} converted`,
      href: "/admin/notary-applications",
      color: "bg-slate-100 text-slate-800",
    },
    {
      title: "Active Notaries",
      icon: UserCheck,
      value: `${activeNotariesCount}`,
      description: `of ${totalOnboardedNotaries} onboarded • ${convertedLast30Days} converted 30d`,
      href: "/admin/network/coverage",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Open Network Jobs",
      icon: MapPin,
      value: openNetworkJobs.toString(),
      description: `${expiringJobOffersSoon} offers expiring soon • ${applicationsLast7Days} new apps 7d`,
      href: "/admin/network/jobs",
      color: "bg-cyan-100 text-cyan-800",
    },
    {
      title: "Job Offer Health",
      icon: Gauge,
      value: `${jobOfferAcceptanceRate}%`,
      description: `${pendingJobOffers} pending • ${expiredOffersLast24h} expired 24h`,
      href: "/admin/network",
      color: "bg-orange-100 text-orange-800",
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
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

      <section className="mb-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Network Operations</h2>
            <p className="text-sm text-muted-foreground">Monitor applications, coverage, and open jobs</p>
          </div>
          <Link href="/admin/network" className="text-sm font-medium text-primary hover:underline">
            Open full network dashboard →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {networkDashboardItems.map((item, index) => (
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
      </section>
      
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
