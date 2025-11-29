import { formatDistanceToNow } from "date-fns";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ClipboardList, ListChecks } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminJson } from "@/lib/utils/server-fetch";
import type { AdminOperationsMetrics } from "@/lib/services/admin-metrics";
import { ReviewQueueCard } from "@/components/admin/ReviewQueueCard";

export const dynamic = "force-dynamic";

interface OperationsApiResponse {
  success: boolean;
  data: AdminOperationsMetrics;
}

export default async function AdminOperationsOverviewPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role as string | undefined;

  // Allow ADMIN and STAFF into the admin operations area, reuse existing portal for everyone else
  if (!session?.user || (userRole !== Role.ADMIN && userRole !== "STAFF")) {
    redirect("/portal");
  }

  const { data } = await fetchAdminJson<OperationsApiResponse>("/api/admin/operations");

  const automationCards = [
    {
      title: "Automation Leads (24h)",
      value: data.totals.automationLeads24h,
      description: `${data.totals.totalAutomationLeads} captured overall`,
    },
    {
      title: "Agent Jobs Created (24h)",
      value: data.totals.automationJobs24h,
      description: `${data.totals.automationJobsPending} waiting in queue`,
    },
    {
      title: "Pricing Quotes Needing Review",
      value: data.totals.pricingQuotesNeedingReview,
      description: "Quotes flagged by automation for manual approval",
    },
  ];

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations</h1>
          <p className="text-sm text-muted-foreground">
            High-level view of today&apos;s work: assignments, bookings, and network jobs.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/admin/operations/assignments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-medium">Assignments</CardTitle>
                <CardDescription>View and manage customer assignments from the owner portal.</CardDescription>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                <ClipboardList className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Open assignments
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/bookings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-medium">Bookings & QA</CardTitle>
                <CardDescription>See recent bookings and the QA queue.</CardDescription>
              </div>
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-800">
                <CalendarDays className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Open bookings
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/network">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-medium">Network jobs</CardTitle>
                <CardDescription>Monitor open network jobs and coverage.</CardDescription>
              </div>
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-800">
                <ListChecks className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Open network dashboard
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Automation pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Snapshot of what the agents service generated in the last 24 hours.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {automationCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>AI Autopilot</CardTitle>
            <CardDescription>Low-risk outreach handled automatically</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-2xl font-bold">{data.autopilot.sentLast24h}</p>
              <p className="text-xs text-muted-foreground">Sent last 24h</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data.autopilot.pendingReview}</p>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data.autopilot.failedLast24h}</p>
              <p className="text-xs text-muted-foreground">Failed last 24h</p>
            </div>
            <div className="col-span-3 text-xs text-muted-foreground">
              {data.autopilot.lastRunAt
                ? `Last run ${formatDistanceToNow(new Date(data.autopilot.lastRunAt), {
                    addSuffix: true,
                  })}`
                : "Autopilot has not run yet."}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest automation jobs</CardTitle>
            <CardDescription>
              High signal view of the most recent jobs routed through the agents pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.latestJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs have been synced yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead className="text-right">Quoted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.latestJobs.map((job) => (
                    <TableRow key={job.jobId ?? job.createdAt}>
                      <TableCell>
                        <div className="text-sm font-medium">{job.jobId || "n/a"}</div>
                        <div className="text-xs text-muted-foreground">
                          Created {dateFormatter.format(new Date(job.createdAt))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            job.status?.includes("FAIL")
                              ? "bg-red-100 text-red-700"
                              : job.status?.includes("PENDING")
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {job.status || "UNKNOWN"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {job.serviceType ? job.serviceType : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.appointmentDateTime
                          ? dateFormatter.format(new Date(job.appointmentDateTime))
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {job.confirmedPrice
                          ? currencyFormatter.format(Number(job.confirmedPrice))
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <ReviewQueueCard reviews={data.reviewQueue} />
    </div>
  );
}
