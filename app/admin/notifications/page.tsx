import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
  RefreshCw, CheckCircle, XCircle, Clock, Send, AlertTriangle
} from "lucide-react";
import { getQueues } from "@/lib/queue/config";

// Helper function to format dates
const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    redirect('/portal'); // Redirect non-admins
  }

  // Fetch notification data
  let scheduledNotifications = [];
  let sentNotifications = [];
  let failedNotifications = [];
  
  try {
    // Fetch scheduled notifications (pending)
    scheduledNotifications = await prisma.scheduledNotification.findMany({
      where: {
        sentAt: null,
        status: 'PENDING',
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      take: 50,
      include: {
        booking: {
          include: {
            client: true,
          }
        }
      }
    });

    // Fetch sent notifications (last 50)
    sentNotifications = await prisma.scheduledNotification.findMany({
      where: {
        sentAt: { not: null },
        status: 'SENT',
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: 50,
      include: {
        booking: {
          include: {
            client: true,
          }
        }
      }
    });

    // Fetch failed notifications
    failedNotifications = await prisma.scheduledNotification.findMany({
      where: {
        status: 'FAILED',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50,
      include: {
        booking: {
          include: {
            client: true,
          }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return <p className="text-red-500">Error loading notifications. Please try again later.</p>;
  }

  // Get queue statistics
  let queueStats = {
    notificationsQueue: 0,
    bookingProcessingQueue: 0,
    paymentProcessingQueue: 0
  };

  try {
    const queues = getQueues();
    if (queues) {
      // These would ideally be async calls to get queue length statistics
      // For now we'll leave them as placeholders
      queueStats = {
        notificationsQueue: 0, // placeholder - would be actual queue length
        bookingProcessingQueue: 0,
        paymentProcessingQueue: 0
      };
    }
  } catch (error) {
    console.error("Failed to get queue stats:", error);
  }

  // Status badge renderer
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'SENT':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Sent</Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications Monitor</h1>
        <form action="/api/admin/notifications/process" method="POST">
          <Button type="submit" variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Process Now
          </Button>
        </form>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pending</CardTitle>
            <CardDescription>Notifications waiting to send</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledNotifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Sent (24h)</CardTitle>
            <CardDescription>Successfully sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{
              sentNotifications.filter(n => 
                n.sentAt && new Date().getTime() - new Date(n.sentAt).getTime() < 24 * 60 * 60 * 1000
              ).length
            }</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Failed</CardTitle>
            <CardDescription>Notifications that failed to send</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedNotifications.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Queue Status</CardTitle>
          <CardDescription>Current background job queues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Notification Queue</div>
              <div className="text-xl font-semibold">{queueStats.notificationsQueue} jobs</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Booking Processing</div>
              <div className="text-xl font-semibold">{queueStats.bookingProcessingQueue} jobs</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Payment Processing</div>
              <div className="text-xl font-semibold">{queueStats.paymentProcessingQueue} jobs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Notifications</CardTitle>
              <CardDescription>Notifications scheduled to be sent</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledNotifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No pending notifications.
                      </TableCell>
                    </TableRow>
                  )}
                  {scheduledNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>{notification.type}</TableCell>
                      <TableCell>
                        {notification.booking?.client?.name || notification.recipient || "-"}
                      </TableCell>
                      <TableCell>{formatDateTime(notification.scheduledFor)}</TableCell>
                      <TableCell>
                        <StatusBadge status={notification.status} />
                      </TableCell>
                      <TableCell>
                        <form action={`/api/admin/notifications/${notification.id}/send-now`} method="POST">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Send className="h-3 w-3" /> Send Now
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Sent Notifications</CardTitle>
              <CardDescription>Recently sent notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sentNotifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No sent notifications.
                      </TableCell>
                    </TableRow>
                  )}
                  {sentNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>{notification.type}</TableCell>
                      <TableCell>
                        {notification.booking?.client?.name || notification.recipient || "-"}
                      </TableCell>
                      <TableCell>{formatDateTime(notification.sentAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={notification.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Notifications</CardTitle>
              <CardDescription>Notifications that failed to send</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Attempted</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedNotifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No failed notifications.
                      </TableCell>
                    </TableRow>
                  )}
                  {failedNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>{notification.type}</TableCell>
                      <TableCell>
                        {notification.booking?.client?.name || notification.recipient || "-"}
                      </TableCell>
                      <TableCell>{formatDateTime(notification.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={notification.error || ''}>
                          {notification.error || 'Unknown error'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <form action={`/api/admin/notifications/${notification.id}/retry`} method="POST">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" /> Retry
                          </Button>
                        </form>
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
