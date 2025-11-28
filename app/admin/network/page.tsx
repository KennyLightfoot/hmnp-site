import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ClipboardList,
  FileText,
  Gauge,
  MapPin,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils/date-utils";
import { fetchAdminJson } from "@/lib/utils/server-fetch";
import type { NetworkDashboardMetrics } from "@/lib/services/admin-metrics";

const relativeHours = (date: Date) => {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const timeUntil = (date: Date | null | undefined) => {
  if (!date) return "-";
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  if (diffMinutes === 0) return "now";
  if (diffMinutes > 0) {
    return diffMinutes >= 60
      ? `in ${Math.round(diffMinutes / 60)}h`
      : `in ${diffMinutes}m`;
  }
  const pastMinutes = Math.abs(diffMinutes);
  return pastMinutes >= 60
    ? `${Math.round(pastMinutes / 60)}h ago`
    : `${pastMinutes}m ago`;
};

interface NetworkApiResponse {
  success: boolean;
  data: NetworkDashboardMetrics;
}

export default async function AdminNetworkDashboard() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect("/portal")
  }

  const { data } = await fetchAdminJson<NetworkApiResponse>("/api/admin/network/dashboard");

  const pendingApplicationsCount = data.applications.statuses["PENDING"] ?? 0;
  const underReviewApplicationsCount = data.applications.statuses["UNDER_REVIEW"] ?? 0;
  const approvedReadyCount = data.applications.approvedReady;
  const convertedRecentCount = data.applications.convertedLast30Days;
  const applicationsSevenDayCount = data.applications.newLast7Days;
  const activeNotariesCount = data.notaries.active;
  const totalNotariesCount = data.notaries.totalOnboarded;
  const unavailableNotariesCount = data.notaries.unavailable;
  const openNetworkJobsCount = data.jobs.openNetworkJobs;
  const pendingJobOffersCount = data.jobs.pendingOffers;
  const expiringJobOffersSoonCount = data.jobs.expiringSoon;
  const expiredOffersLast24hCount = data.jobs.expiredLast24h;
  const jobOfferAcceptanceRate = data.jobs.acceptanceRate7d;
  const openJobs = data.jobs.open;
  const recentApplications = data.applications.recent;
  const automationJobs24hCount = data.automation.jobs24h;
  const automationJobsPendingCount = data.automation.jobsPending;
  const recentAutomationJobs = data.automation.recentJobs;

  const kpiCards = [
    {
      title: "New Applications (7d)",
      value: applicationsSevenDayCount.toString(),
      description: `${pendingApplicationsCount} pending review`,
      icon: FileText,
    },
    {
      title: "Under Review",
      value: underReviewApplicationsCount.toString(),
      description: `${approvedReadyCount} approved & waiting conversion`,
      icon: ClipboardList,
    },
    {
      title: "Converted (30d)",
      value: convertedRecentCount.toString(),
      description: `${jobOfferAcceptanceRate}% job offer acceptance (7d)`,
      icon: Activity,
    },
    {
      title: "Active Notaries",
      value: activeNotariesCount.toString(),
      description: `of ${totalNotariesCount} onboarded • ${unavailableNotariesCount} unavailable`,
      icon: UserCheck,
    },
    {
      title: "Open Network Jobs",
      value: openNetworkJobsCount.toString(),
      description: `${pendingJobOffersCount} pending offers • ${expiringJobOffersSoonCount} expiring <15m`,
      icon: MapPin,
    },
    {
      title: "Expired Offers (24h)",
      value: expiredOffersLast24hCount.toString(),
      description: `${pendingJobOffersCount} offers waiting for action`,
      icon: Gauge,
    },
    {
      title: "Automation Jobs (24h)",
      value: automationJobs24hCount.toString(),
      description: `${automationJobsPendingCount} pending in pipeline`,
      icon: Activity,
    },
  ]

  const applicationPipeline = [
    { label: "Pending", value: pendingApplicationsCount },
    { label: "Under Review", value: underReviewApplicationsCount },
    { label: "Approved (ready)", value: approvedReadyCount },
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Network Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Hiring pipeline, coverage health, and open job flow across the
          notary network.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card, index) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                {card.title}
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Open Network Jobs</CardTitle>
                <CardDescription>
                  Bookings sent to the network without an accepted offer
                </CardDescription>
              </div>
              <Link
                href="/admin/network/jobs"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all jobs →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {openJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open network jobs right now. All bookings have an assigned
                notary.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Offers</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {openJobs.map((job) => {
                    return (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/bookings/${job.id}`}
                            className="text-primary hover:underline"
                          >
                            #{job.id.slice(-6)}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {job.customerName || job.status}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {job.serviceName ?? "—"}
                          </div>
                          <p className="text-xs text-muted-foreground">{job.status}</p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {job.scheduledDateTime
                              ? formatDateTime(new Date(job.scheduledDateTime))
                              : "—"}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {job.locationType?.toLowerCase() ?? "—"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{job.offers} offers</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {job.networkOfferExpiresAt
                              ? formatDateTime(new Date(job.networkOfferExpiresAt))
                              : "—"}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {job.networkOfferExpiresAt
                              ? timeUntil(new Date(job.networkOfferExpiresAt))
                              : "n/a"}
                          </p>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Pipeline</CardTitle>
            <CardDescription>
              Snapshot of candidates moving through the hiring funnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {applicationPipeline.map((stage) => (
                <div
                  key={stage.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{stage.label}</span>
                  <span className="font-semibold">{stage.value}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Recent Applications</h4>
                <Link
                  href="/admin/notary-applications"
                  className="text-xs text-primary hover:underline"
                >
                  Manage all →
                </Link>
              </div>
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div key={application.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {application.firstName} {application.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {application.statesLicensed.slice(0, 2).join(", ") ||
                            "States not provided"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {application.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {application.serviceTypes.slice(0, 2).join(", ") ||
                        "Service types not provided"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Applied {relativeHours(new Date(application.createdAt))}
                    </p>
                  </div>
                ))}
                {recentApplications.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No applications in the queue.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent automation jobs</CardTitle>
          <CardDescription>
            Jobs generated by the agents service for monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAutomationJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No automation jobs have been synced yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Quoted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAutomationJobs.map((job) => (
                  <TableRow key={job.jobId ?? job.createdAt}>
                    <TableCell>{job.jobId ?? "n/a"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          job.status?.includes("FAIL")
                            ? "border-red-200 text-red-700"
                            : job.status?.includes("PENDING")
                            ? "border-amber-200 text-amber-700"
                            : "border-emerald-200 text-emerald-700"
                        }
                      >
                        {job.status ?? "UNKNOWN"}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.serviceType ?? "-"}</TableCell>
                    <TableCell>{formatDateTime(new Date(job.createdAt))}</TableCell>
                    <TableCell className="text-right">
                      {job.confirmedPrice
                        ? `$${Number(job.confirmedPrice).toFixed(2)}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

