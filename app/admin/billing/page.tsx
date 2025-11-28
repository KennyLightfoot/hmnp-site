import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";
import { fetchAdminJson } from "@/lib/utils/server-fetch";
import type { AdminBillingMetrics } from "@/lib/services/admin-metrics";

export const dynamic = "force-dynamic";

interface BillingApiResponse {
  success: boolean;
  data: AdminBillingMetrics;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function AdminBillingPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;

  if (!session?.user || role !== Role.ADMIN) {
    redirect("/portal");
  }

  const { data } = await fetchAdminJson<BillingApiResponse>("/api/admin/billing");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-sm text-muted-foreground">
            High-level revenue view and recent payment activity from Stripe and other providers.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (all time)</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totals.revenueAllTime)}
            </div>
            <p className="text-xs text-muted-foreground">Sum of payments with status COMPLETED.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending payments</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Payments still in PENDING state.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed payments (last 24h)</CardTitle>
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.failedCount}</div>
            <p className="text-xs text-muted-foreground">Payments currently marked FAILED.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent payments</CardTitle>
          <CardDescription>Last 25 payments recorded in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.map((payment) => {
                const isCompleted = payment.status === "COMPLETED";
                const isFailed = payment.status === "FAILED";

                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                    <TableCell className="text-xs">
                      {payment.bookingId ? (
                        <a
                          href={`/admin/bookings/${payment.bookingId}`}
                          className="text-primary hover:underline"
                        >
                          {payment.bookingId}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isCompleted ? "default" : isFailed ? "destructive" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{payment.provider || "—"}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


