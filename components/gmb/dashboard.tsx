'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Star, TrendingUp, MapPin, Phone, Globe, Eye, MessageSquare, ThumbsUp } from 'lucide-react';

interface GMBDashboardProps {
  isEnabled?: boolean;
  className?: string;
}

interface GMBStats {
  profileOptimized: boolean;
  postsScheduled: number;
  reviewsResponded: number;
  avgRating: number;
  totalViews: number;
  phoneClicks: number;
  websiteClicks: number;
  directionsClicks: number;
  upcomingPosts: Array<{
    id: string;
    scheduledDate: Date;
    content: string;
    location: string;
    type: string;
  }>;
  recentTasks: Array<{
    id: string;
    type: string;
    status: string;
    completedAt: Date;
    description: string;
  }>;
  analytics: {
    weeklyViews: number;
    weeklyClicks: number;
    viewsChange: number;
    clicksChange: number;
  };
}

export default function GMBDashboard({ isEnabled = true, className = '' }: GMBDashboardProps) {
  const [stats, setStats] = useState<GMBStats>({
    profileOptimized: false,
    postsScheduled: 0,
    reviewsResponded: 0,
    avgRating: 0,
    totalViews: 0,
    phoneClicks: 0,
    websiteClicks: 0,
    directionsClicks: 0,
    upcomingPosts: [],
    recentTasks: [],
    analytics: {
      weeklyViews: 0,
      weeklyClicks: 0,
      viewsChange: 0,
      clicksChange: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (!isEnabled) return;

    fetchGMBStats();
    const interval = setInterval(fetchGMBStats, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [isEnabled]);

  const fetchGMBStats = async () => {
    try {
      const response = await fetch('/api/gmb/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch GMB stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeGMB = async () => {
    try {
      setLoading(true);
      await fetch('/api/gmb/initialize', { method: 'POST' });
      await fetchGMBStats();
    } catch (error) {
      console.error('Failed to initialize GMB:', error);
    } finally {
      setLoading(false);
    }
  };

  const schedulePost = async () => {
    try {
      await fetch('/api/gmb/schedule-post', { method: 'POST' });
      await fetchGMBStats();
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={`gmb-dashboard ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Profile Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={stats.profileOptimized ? 'default' : 'secondary'}>
                {stats.profileOptimized ? 'Optimized' : 'Pending'}
              </Badge>
              {!stats.profileOptimized && (
                <Button size="sm" onClick={initializeGMB} disabled={loading}>
                  Initialize
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts Scheduled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.postsScheduled}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Button size="sm" onClick={schedulePost} disabled={loading}>
                Schedule More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats.avgRating.toFixed(1)}
              <Star className="h-4 w-4 text-yellow-500 ml-1" fill="currentColor" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.reviewsResponded} reviews responded
            </p>
          </CardContent>
        </Card>

        {/* Weekly Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analytics.weeklyViews.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.analytics.viewsChange > 0 ? '+' : ''}{stats.analytics.viewsChange}% vs last week
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Action Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Phone Calls</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stats.phoneClicks}</div>
                  <div className="text-xs text-muted-foreground">this week</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Website Visits</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stats.websiteClicks}</div>
                  <div className="text-xs text-muted-foreground">this week</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Directions</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{stats.directionsClicks}</div>
                  <div className="text-xs text-muted-foreground">this week</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingPosts.slice(0, 3).map((post, index) => (
                <div key={post.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {post.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.location}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(post.scheduledDate).toLocaleDateString()} at{' '}
                      {new Date(post.scheduledDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {stats.upcomingPosts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No upcoming posts scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTasks.slice(0, 5).map((task, index) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {task.type === 'POST' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                      {task.type === 'REVIEW_RESPONSE' && <ThumbsUp className="h-4 w-4 text-green-500" />}
                      {task.type === 'QA_RESPONSE' && <MessageSquare className="h-4 w-4 text-purple-500" />}
                      {task.type === 'PROFILE_UPDATE' && <Globe className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{task.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.completedAt).toLocaleDateString()} at{' '}
                        {new Date(task.completedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={task.status === 'COMPLETED' ? 'default' : 
                             task.status === 'FAILED' ? 'destructive' : 'secondary'}
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
              {stats.recentTasks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Bar */}
      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          GMB Automation Status: {stats.profileOptimized ? 'Active' : 'Inactive'}
        </div>
        <div>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 