'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  MapPin,
  Star,
  ExternalLink,
  Calendar,
  Target,
  BarChart3,
  AlertCircle,
  Zap
} from 'lucide-react';

interface CitationDashboardProps {
  isEnabled?: boolean;
  className?: string;
}

interface CitationStats {
  totalDirectories: number;
  pendingSubmissions: number;
  approvedListings: number;
  napConsistencyScore: number;
  citationHealthScore: number;
  totalTraffic: number;
  averageRating: number;
  totalReviews: number;
  highPriorityTasks: number;
  estimatedCompletionTime: number;
  recentSubmissions: CitationSubmission[];
  activeAlerts: CitationAlert[];
  maintenanceTasks: MaintenanceTask[];
  performanceMetrics: PerformanceMetrics;
}

interface CitationSubmission {
  id: string;
  directoryName: string;
  category: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submissionDate: Date;
  priority: number;
  domainAuthority?: number;
}

interface CitationAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  directoryName: string;
  message: string;
  actionRequired: string[];
}

interface MaintenanceTask {
  id: string;
  directoryName: string;
  task: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  estimatedTime: number;
  dueDate: Date;
}

interface PerformanceMetrics {
  weeklyTraffic: number;
  trafficGrowth: number;
  newReviews: number;
  reviewGrowth: number;
  rankingImprovements: number;
  topPerformingDirectories: string[];
}

export default function CitationDashboard({ isEnabled = true, className = '' }: CitationDashboardProps) {
  const [stats, setStats] = useState<CitationStats>({
    totalDirectories: 0,
    pendingSubmissions: 0,
    approvedListings: 0,
    napConsistencyScore: 0,
    citationHealthScore: 0,
    totalTraffic: 0,
    averageRating: 0,
    totalReviews: 0,
    highPriorityTasks: 0,
    estimatedCompletionTime: 0,
    recentSubmissions: [],
    activeAlerts: [],
    maintenanceTasks: [],
    performanceMetrics: {
      weeklyTraffic: 0,
      trafficGrowth: 0,
      newReviews: 0,
      reviewGrowth: 0,
      rankingImprovements: 0,
      topPerformingDirectories: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!isEnabled) return;

    fetchCitationStats();
    const interval = setInterval(fetchCitationStats, 10 * 60 * 1000); // Update every 10 minutes

    return () => clearInterval(interval);
  }, [isEnabled]);

  const fetchCitationStats = async () => {
    try {
      const response = await fetch('/api/citations/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch citation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeCitations = async () => {
    try {
      setLoading(true);
      await fetch('/api/citations/initialize', { method: 'POST' });
      await fetchCitationStats();
    } catch (error) {
      console.error('Failed to initialize citations:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      await fetch(`/api/citations/tasks/${taskId}/complete`, { method: 'POST' });
      await fetchCitationStats();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch(`/api/citations/alerts/${alertId}/resolve`, { method: 'POST' });
      await fetchCitationStats();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  if (!isEnabled) {
    return null;
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'default';
      case 'PENDING': return 'secondary';
      case 'SUBMITTED': return 'outline';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className={`citation-dashboard ${className}`}>
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Citation Health Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citation Health</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthScoreColor(stats.citationHealthScore)}`}>
              {stats.citationHealthScore}%
            </div>
            <Progress value={stats.citationHealthScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Overall citation quality
            </p>
          </CardContent>
        </Card>

        {/* Active Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedListings}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalDirectories} total directories
            </p>
            <div className="flex items-center mt-2">
              <Progress 
                value={(stats.approvedListings / stats.totalDirectories) * 100} 
                className="flex-1" 
              />
              <span className="ml-2 text-xs">
                {Math.round((stats.approvedListings / stats.totalDirectories) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* NAP Consistency */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NAP Consistency</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.napConsistencyScore}%</div>
            <Progress value={stats.napConsistencyScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Name, address, phone consistency
            </p>
          </CardContent>
        </Card>

        {/* Monthly Traffic */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Traffic</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTraffic.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats.performanceMetrics.trafficGrowth}% vs last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {stats.activeAlerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Active Alerts ({stats.activeAlerts.length})
          </h3>
          <div className="space-y-2">
            {stats.activeAlerts.slice(0, 3).map((alert, index) => (
              <Alert key={alert.id} className={`${
                alert.severity === 'CRITICAL' ? 'border-red-500' :
                alert.severity === 'HIGH' ? 'border-orange-500' :
                alert.severity === 'MEDIUM' ? 'border-yellow-500' :
                'border-blue-500'
              }`}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{alert.directoryName}</div>
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Actions: {alert.actionRequired.join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submission Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Approved Listings</span>
                    <span className="font-medium">{stats.approvedListings}</span>
                  </div>
                  <Progress value={(stats.approvedListings / stats.totalDirectories) * 100} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Submissions</span>
                    <span className="font-medium">{stats.pendingSubmissions}</span>
                  </div>
                  <Progress value={(stats.pendingSubmissions / stats.totalDirectories) * 100} />
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Estimated completion time</span>
                    <span>{Math.round(stats.estimatedCompletionTime / 60)} hours</span>
                  </div>
                </div>
                
                {stats.pendingSubmissions > 0 && (
                  <Button 
                    className="w-full mt-4" 
                    onClick={initializeCitations}
                    disabled={loading}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Start Batch Submissions
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Review Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Review Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                      <span className="text-sm">Average Rating</span>
                    </div>
                    <span className="font-bold text-lg">{stats.averageRating.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Reviews</span>
                    <span className="font-medium">{stats.totalReviews}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New This Month</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{stats.performanceMetrics.newReviews}</span>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">
                        +{stats.performanceMetrics.reviewGrowth}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentSubmissions.slice(0, 5).map((submission, index) => (
                  <div key={submission.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{submission.directoryName}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {submission.category}
                          </Badge>
                          {submission.domainAuthority && (
                            <span>DA: {submission.domainAuthority}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(submission.status)}>
                        {submission.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(submission.submissionDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {stats.recentSubmissions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent submissions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Directory Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentSubmissions.map((submission, index) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {submission.status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {submission.status === 'PENDING' && <Clock className="h-5 w-5 text-yellow-500" />}
                        {submission.status === 'SUBMITTED' && <Clock className="h-5 w-5 text-blue-500" />}
                        {submission.status === 'REJECTED' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      </div>
                      <div>
                        <p className="font-medium">{submission.directoryName}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{submission.category}</Badge>
                          <span>Priority {submission.priority}</span>
                          {submission.domainAuthority && <span>DA: {submission.domainAuthority}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(submission.status)}>
                        {submission.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tasks ({stats.maintenanceTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.maintenanceTasks.slice(0, 10).map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{task.directoryName}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{task.estimatedTime} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => completeTask(task.id)}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
                {stats.maintenanceTasks.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No pending maintenance tasks
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weekly Traffic</span>
                    <span className="font-bold">{stats.performanceMetrics.weeklyTraffic}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth Rate</span>
                    <span className="font-bold text-green-600">+{stats.performanceMetrics.trafficGrowth}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ranking Improvements</span>
                    <span className="font-bold">{stats.performanceMetrics.rankingImprovements}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Directories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.performanceMetrics.topPerformingDirectories.map((directory, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm">{directory}</span>
                      <BarChart3 className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Status Bar */}
      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Citation Management Status: {stats.approvedListings > 0 ? 'Active' : 'Initializing'}
        </div>
        <div>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 