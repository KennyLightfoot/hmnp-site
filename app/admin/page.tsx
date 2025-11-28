import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";
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
import { fetchAdminJson } from "@/lib/utils/server-fetch";
import type { AdminDashboardOverview } from "@/lib/services/admin-metrics";

// Force dynamic rendering to prevent SSR issues with client components
export const dynamic = "force-dynamic";

interface DashboardApiResponse {
  success: boolean;
  data: AdminDashboardOverview;
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed (tolerate NextAuth typing)
  const userRole = (session?.user as any)?.role;
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect("/portal"); // Redirect non-admins
  }

  const { data } = await fetchAdminJson<DashboardApiResponse>("/api/admin/dashboard");

  const dashboardItems = [
    {
      title: "Bookings",
      icon: CalendarDays,
      value: data.totals.totalBookings.toString(),
      description: `${data.totals.pendingBookings} pending`,
      href: "/admin/bookings",
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Clients",
      icon: Users,
      value: data.totals.totalClients.toString(),
      description: "Total clients",
      href: "/admin/clients",
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Revenue",
      icon: CreditCard,
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(data.totals.totalRevenue),
      description: "Total processed",
      href: "/admin/payments",
      color: "bg-purple-100 text-purple-800",
    },
    {
      title: "Notifications",
      icon: Bell,
      value: data.notifications.scheduled.toString(),
      description: "Pending to send",
      href: "/admin/notifications",
      color: "bg-amber-100 text-amber-800",
    },
    {
      title: "System Alerts",
      icon: AlertCircle,
      value: data.notifications.activeAlerts.toString(),
      description: "Active alerts",
      href: "/admin/alerts",
      color: "bg-red-100 text-red-800",
    },
    {
      title: "Pending content reviews",
      icon: FileText,
      value: data.content.pendingReviews.toString(),
      description: "PENDING_REVIEW jobs in the AI content queue",
      href: "/admin/content",
      color: "bg-sky-100 text-sky-800",
    },
    {
      title: "Workers",
      icon: Activity,
      value: "4", // Placeholder
      description: "Queue workers",
      href: "/admin/workers",
      color: "bg-indigo-100 text-indigo-800",
    },
  ];

  const networkDashboardItems = [
    {
      title: "Notary Applications",
      icon: FileText,
      value: data.network.totalApplications.toString(),
      description: `${data.network.statusCounts["PENDING"] ?? 0} pending • ${
        data.network.approvedReadyCount
      } ready • ${data.network.statusCounts["CONVERTED"] ?? 0} converted`,
      href: "/admin/notary-applications",
      color: "bg-slate-100 text-slate-800",
    },
    {
      title: "Active Notaries",
      icon: UserCheck,
      value: `${data.network.activeNotaries}`,
      description: `of ${data.network.totalOnboardedNotaries} onboarded • ${data.network.convertedLast30Days} converted 30d`,
      href: "/admin/network/coverage",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Open Network Jobs",
      icon: MapPin,
      value: data.network.openNetworkJobs.toString(),
      description: `${data.network.expiringSoonOffers} offers expiring soon • ${data.network.applicationsLast7Days} new apps 7d`,
      href: "/admin/network/jobs",
      color: "bg-cyan-100 text-cyan-800",
    },
    {
      title: "Job Offer Health",
      icon: Gauge,
      value: `${data.network.jobOfferAcceptanceRate}%`,
      description: `${data.network.pendingJobOffers} pending • ${data.network.expiredOffersLast24h} expired 24h`,
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
