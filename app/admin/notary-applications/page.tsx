import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from 'next/navigation';
import { Role, NotaryApplicationStatus } from "@/lib/prisma-types";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/date-utils";

// Local list item type mirroring the selected Prisma fields to avoid direct
// dependency on the Prisma namespace in this file.
type NotaryApplicationListItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  status: NotaryApplicationStatus;
  statesLicensed: string[];
  reviewedBy: {
    name: string | null;
    email: string | null;
  } | null;
};

const applicationInclude = {
  reviewedBy: {
    select: {
      name: true,
      email: true,
    },
  },
};

type NotaryApplicationStatusValue = (typeof NotaryApplicationStatus)[keyof typeof NotaryApplicationStatus]

const getStatusBadge = (status: NotaryApplicationStatusValue) => {
  const variants: Record<NotaryApplicationStatusValue, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "outline",
    UNDER_REVIEW: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
    CONVERTED: "default",
  }
  return <Badge variant={variants[status]}>{status}</Badge>
}

export default async function AdminNotaryApplicationsPage() {
  const session = await getServerSession(authOptions);

  const userRole = (session?.user as any)?.role
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect('/portal');
  }

  let applications: NotaryApplicationListItem[] = [];
  try {
    applications = await prisma.notaryApplication.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: applicationInclude,
    });
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return <p className="text-red-500">Error loading applications. Please try again later.</p>;
  }

  const pendingCount = applications.filter((application) => application.status === NotaryApplicationStatus.PENDING).length;
  const approvedCount = applications.filter((application) => application.status === NotaryApplicationStatus.APPROVED).length;
  const rejectedCount = applications.filter((application) => application.status === NotaryApplicationStatus.REJECTED).length;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notary Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage notary applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableCaption>List of all notary applications.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>States Licensed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.firstName} {app.lastName}</TableCell>
                <TableCell>{app.email}</TableCell>
                <TableCell>{app.phone}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {app.statesLicensed.slice(0, 3).map((state: string) => (
                      <Badge key={state} variant="outline" className="text-xs">{state}</Badge>
                    ))}
                    {app.statesLicensed.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{app.statesLicensed.length - 3}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(app.status)}</TableCell>
                <TableCell>{formatDateTime(app.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/notary-applications/${app.id}`}>
                    <Button variant="outline" size="sm">Review</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

