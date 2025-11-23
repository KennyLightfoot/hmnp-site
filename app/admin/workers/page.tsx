import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from 'next/navigation';
import { Role } from "@/lib/prisma-types";
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
  Play, Pause, RefreshCw, Activity, Settings, Clock, ChevronRight,
  Loader2, Check, AlertTriangle, BarChart
} from "lucide-react";
import { getQueues } from "@/lib/queue/config";

// Helper function to format dates
const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

// Helper function to format time duration
const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

export default async function AdminWorkersPage() {
  const session = await getServerSession(authOptions);

  // Authorization Check: Only Admins allowed
  const userRole = (session?.user as any)?.role
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect('/portal'); // Redirect non-admins
  }

  // Define worker types and statuses
  // In a real implementation, this would come from a database or API
  const workers = [
    {
      id: 'notifications-worker',
      name: 'Notifications Worker',
      type: 'notifications',
      status: 'RUNNING',
      lastActive: new Date(),
      uptime: 1824500, // in seconds
      processedItems: 1562,
      failedItems: 8,
      queueLength: 3,
    },
    {
      id: 'booking-worker',
      name: 'Booking Processor',
      type: 'booking-processing',
      status: 'RUNNING',
      lastActive: new Date(),
      uptime: 1051200, // in seconds
      processedItems: 456,
      failedItems: 2,
      queueLength: 0,
    },
    {
      id: 'payment-worker',
      name: 'Payment Processor',
      type: 'payment-processing',
      status: 'STOPPED',
      lastActive: new Date(Date.now() - 3600000), // 1 hour ago
      uptime: 0,
      processedItems: 782,
      failedItems: 15,
      queueLength: 5,
    },
    {
      id: 'system-monitor',
      name: 'System Monitor',
      type: 'system',
      status: 'RUNNING',
      lastActive: new Date(),
      uptime: 2629800, // in seconds
      processedItems: 8640,
      failedItems: 0,
      queueLength: 0,
    }
  ];

  // Get total statistics
  const totalStats = {
    running: workers.filter(w => w.status === 'RUNNING').length,
    stopped: workers.filter(w => w.status === 'STOPPED').length,
    total: workers.length,
    totalProcessed: workers.reduce((acc, w) => acc + w.processedItems, 0),
    totalFailed: workers.reduce((acc, w) => acc + w.failedItems, 0),
    totalQueue: workers.reduce((acc, w) => acc + w.queueLength, 0),
  };

  // Status badge renderer
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'RUNNING':
        return <Badge variant="default" className="flex items-center gap-1"><Activity className="h-3 w-3" /> Running</Badge>;
      case 'STOPPED':
        return <Badge variant="secondary" className="flex items-center gap-1"><Pause className="h-3 w-3" /> Stopped</Badge>;
      case 'PAUSED':
        return <Badge variant="outline" className="flex items-center gap-1"><Pause className="h-3 w-3" /> Paused</Badge>;
      case 'ERROR':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Worker Control Panel</h1>
        <div className="flex gap-2">
          <form action="/api/admin/workers/start-all" method="POST">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Play className="h-4 w-4" /> Start All
            </Button>
          </form>
          <form action="/api/admin/workers/stop-all" method="POST">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Pause className="h-4 w-4" /> Stop All
            </Button>
          </form>
          <form action="/api/admin/workers/status" method="POST">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Refresh Status
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.running} / {totalStats.total}</div>
            <p className="text-sm text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Items Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.totalProcessed}</div>
            <p className="text-sm text-muted-foreground">Total processed items</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Items in Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.totalQueue}</div>
            <p className="text-sm text-muted-foreground">Waiting to be processed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Worker Status</CardTitle>
          <CardDescription>Monitor and control background workers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Queue Length</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.type}</TableCell>
                  <TableCell>
                    <StatusBadge status={worker.status} />
                  </TableCell>
                  <TableCell>{worker.queueLength}</TableCell>
                  <TableCell>{formatDateTime(worker.lastActive)}</TableCell>
                  <TableCell>{worker.status === 'RUNNING' ? formatDuration(worker.uptime) : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {worker.status === 'RUNNING' ? (
                        <form action={`/api/admin/workers/${worker.id}/stop`} method="POST">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Pause className="h-3 w-3" /> Stop
                          </Button>
                        </form>
                      ) : (
                        <form action={`/api/admin/workers/${worker.id}/start`} method="POST">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Play className="h-3 w-3" /> Start
                          </Button>
                        </form>
                      )}
                      
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/admin/workers/${worker.id}/logs`}>
                          Logs
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Processing Performance</CardTitle>
            <CardDescription>Worker performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-12 text-muted-foreground">
              <BarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Performance charts would be displayed here</p>
              <p className="text-sm">Based on actual worker monitoring data</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Worker Settings</CardTitle>
            <CardDescription>Global worker configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-medium">Auto-restart workers</h3>
                  <p className="text-sm text-muted-foreground">Automatically restart failed workers</p>
                </div>
                <div className="flex items-center h-5">
                  <input
                    id="auto-restart"
                    aria-describedby="auto-restart-description"
                    name="auto-restart"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    defaultChecked={true}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-medium">Max concurrent jobs</h3>
                  <p className="text-sm text-muted-foreground">Maximum number of jobs per worker</p>
                </div>
                <div>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border rounded text-right"
                    defaultValue="5"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-medium">Job timeout</h3>
                  <p className="text-sm text-muted-foreground">Maximum time for job execution</p>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border rounded text-right"
                    defaultValue="30"
                    min="5"
                  />
                  <span className="text-sm">seconds</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
