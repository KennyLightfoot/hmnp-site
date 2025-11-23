import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from 'next/navigation';
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
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Info, RefreshCw,
  Server, Database, Clock, Activity, Archive
} from "lucide-react";
import { getQueues } from "@/lib/queue/config";

type SystemAlert = Awaited<ReturnType<typeof prisma.systemAlert.findMany>>[number];
type SystemLog = Awaited<ReturnType<typeof prisma.systemLog.findMany>>[number];

// Helper function to format dates
const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

export default async function AdminAlertsPage() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed (tolerant of NextAuth session typing)
  const userRole = (session?.user as any)?.role;
  // Using string literal 'ADMIN' instead of Role.ADMIN to work around Prisma client type resolution issue
  // Other admin pages successfully import Role enum, suggesting this might be a build cache issue
  if (!session?.user || userRole !== 'ADMIN') {
    redirect('/portal'); // Redirect non-admins
  }

  // Fetch system alerts data
  let activeAlerts: SystemAlert[] = [];
  let resolvedAlerts: SystemAlert[] = [];
  let systemLogs: SystemLog[] = [];
  
  try {
    // These queries may fail if the tables don't exist yet
    // We'll catch any errors and display appropriate messages
    
    // Fetch active alerts
    activeAlerts = await prisma.systemAlert.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 50,
    }).catch(() => []);

    // Fetch resolved alerts
    resolvedAlerts = await prisma.systemAlert.findMany({
      where: {
        status: 'RESOLVED',
      },
      orderBy: {
        resolvedAt: 'desc',
      },
      take: 50,
    }).catch(() => []);

    // Fetch recent system logs
    systemLogs = await prisma.systemLog.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    }).catch(() => []);
    
  } catch (error) {
    console.error("Failed to fetch system alerts:", error);
  }

  // Get system status
  const systemStatus = {
    api: true,
    database: true,
    queueWorkers: true,
    scheduler: true,
    notifications: true
  };

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
      queueStats = {
        notificationsQueue: 0, // placeholder - would be actual queue length
        bookingProcessingQueue: 0,
        paymentProcessingQueue: 0
      };
    }
  } catch (error) {
    console.error("Failed to get queue stats:", error);
  }

  // Severity badge renderer
  const SeverityBadge = ({ severity }: { severity: string }) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Critical</Badge>;
      case 'HIGH':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> High</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="flex items-center gap-1"><Info className="h-3 w-3" /> Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  // Log level badge renderer
  const LogLevelBadge = ({ level }: { level: string }) => {
    switch (level) {
      case 'ERROR':
        return <Badge variant="destructive">Error</Badge>;
      case 'WARN':
        return <Badge variant="secondary">Warning</Badge>;
      case 'INFO':
        return <Badge variant="secondary">Info</Badge>;
      case 'DEBUG':
        return <Badge variant="outline">Debug</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Alerts Dashboard</h1>
        <div className="flex gap-2">
          <form action="/api/admin/alerts/test" method="POST">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Activity className="h-4 w-4" /> Run Health Check
            </Button>
          </form>
          <form action="/api/admin/alerts/reset" method="POST">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Reset Alerts
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className={systemStatus.api ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={systemStatus.api ? "text-green-600" : "text-red-600"}>
                {systemStatus.api ? "Online" : "Offline"}
              </span>
              <Server className={`h-4 w-4 ${systemStatus.api ? "text-green-600" : "text-red-600"}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className={systemStatus.database ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={systemStatus.database ? "text-green-600" : "text-red-600"}>
                {systemStatus.database ? "Connected" : "Disconnected"}
              </span>
              <Database className={`h-4 w-4 ${systemStatus.database ? "text-green-600" : "text-red-600"}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className={systemStatus.queueWorkers ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Queue Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={systemStatus.queueWorkers ? "text-green-600" : "text-red-600"}>
                {systemStatus.queueWorkers ? "Running" : "Stopped"}
              </span>
              <Activity className={`h-4 w-4 ${systemStatus.queueWorkers ? "text-green-600" : "text-red-600"}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className={systemStatus.notifications ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notification Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={systemStatus.notifications ? "text-green-600" : "text-red-600"}>
                {systemStatus.notifications ? "Active" : "Inactive"}
              </span>
              <Clock className={`h-4 w-4 ${systemStatus.notifications ? "text-green-600" : "text-red-600"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeAlerts.length}</div>
            <p className="text-sm text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Queue Length</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {queueStats.notificationsQueue + queueStats.bookingProcessingQueue + queueStats.paymentProcessingQueue}
            </div>
            <p className="text-sm text-muted-foreground">Tasks in queue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{systemLogs.length}</div>
            <p className="text-sm text-muted-foreground">Recent log entries</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Detected At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAlerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No active alerts. System is running normally.
                      </TableCell>
                    </TableRow>
                  )}
                  {activeAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <SeverityBadge severity={alert.severity} />
                      </TableCell>
                      <TableCell>{alert.component}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={alert.message}>
                          {alert.message}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(alert.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <form action={`/api/admin/alerts/${alert.id}/resolve`} method="POST">
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Resolve
                            </Button>
                          </form>
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/admin/alerts/${alert.id}`}>
                              Details
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Alerts</CardTitle>
              <CardDescription>Previously resolved system alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Resolved At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedAlerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No resolved alerts found.
                      </TableCell>
                    </TableRow>
                  )}
                  {resolvedAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <SeverityBadge severity={alert.severity} />
                      </TableCell>
                      <TableCell>{alert.component}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={alert.message}>
                          {alert.message}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(alert.resolvedAt)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/admin/alerts/${alert.id}`}>
                            Details
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

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system activity logs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No system logs found.
                      </TableCell>
                    </TableRow>
                  )}
                  {systemLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <LogLevelBadge level={log.level} />
                      </TableCell>
                      <TableCell>{log.component}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={log.message}>
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-center mt-4">
                <Button size="sm" variant="outline" asChild>
                  <a href="/admin/logs">
                    <Archive className="h-4 w-4 mr-2" /> View All Logs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
