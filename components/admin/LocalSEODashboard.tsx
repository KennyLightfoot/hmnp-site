'use client';

/**
 * 📊 Local SEO Analytics Dashboard - Phase 5 Enhancement
 * Houston Mobile Notary Pros - Citation Performance & Local SEO Tracking
 * 
 * Comprehensive dashboard for monitoring citation health, NAP consistency,
 * and local search performance.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Star,
  TrendingUp,
  AlertTriangle,
  Target,
  Globe,
  BarChart3,
  Users,
  RefreshCw
} from 'lucide-react';

interface CitationHealth {
  totalCitations: number;
  verifiedCitations: number;
  claimedCitations: number;
  consistentCitations: number;
  averageConsistencyScore: number;
  platformDistribution: {
    major: number;
    local: number;
    niche: number;
    social: number;
  };
  recentChanges: {
    newCitations: number;
    updatedCitations: number;
    removedCitations: number;
  };
}

interface LocalSEOMetrics {
  localSearchClicks: number;
  localSearchViews: number;
  localCTR: number;
  averageRating: number;
  totalReviews: number;
  newReviews: number;
  directorySubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
}

interface TopPlatform {
  name: string;
  citations: number;
  verified: boolean;
  claimed: boolean;
  consistency: number;
  importance: 'high' | 'medium' | 'low';
}

interface Inconsistency {
  platform: string;
  field: string;
  currentValue: string;
  standardValue: string;
  severity: 'high' | 'medium' | 'low';
  impact: string;
}

export default function LocalSEODashboard() {
  const [citationHealth, setCitationHealth] = useState<CitationHealth | null>(null);
  const [localMetrics, setLocalMetrics] = useState<LocalSEOMetrics | null>(null);
  const [topPlatforms, setTopPlatforms] = useState<TopPlatform[]>([]);
  const [inconsistencies, setInconsistencies] = useState<Inconsistency[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, this would fetch from API
      const mockCitationHealth: CitationHealth = {
        totalCitations: 47,
        verifiedCitations: 38,
        claimedCitations: 42,
        consistentCitations: 44,
        averageConsistencyScore: 94,
        platformDistribution: {
          major: 8,
          local: 24,
          niche: 12,
          social: 3
        },
        recentChanges: {
          newCitations: 5,
          updatedCitations: 3,
          removedCitations: 1
        }
      };

      const mockLocalMetrics: LocalSEOMetrics = {
        localSearchClicks: 1247,
        localSearchViews: 8935,
        localCTR: 13.95,
        averageRating: 4.8,
        totalReviews: 156,
        newReviews: 12,
        directorySubmissions: 23,
        approvedSubmissions: 18,
        pendingSubmissions: 5
      };

      const mockTopPlatforms: TopPlatform[] = [
        {
          name: 'Google My Business',
          citations: 1,
          verified: true,
          claimed: true,
          consistency: 100,
          importance: 'high'
        },
        {
          name: 'Yelp',
          citations: 1,
          verified: true,
          claimed: true,
          consistency: 95,
          importance: 'high'
        },
        {
          name: 'Facebook',
          citations: 1,
          verified: true,
          claimed: true,
          consistency: 90,
          importance: 'high'
        },
        {
          name: 'Yellow Pages',
          citations: 1,
          verified: false,
          claimed: true,
          consistency: 85,
          importance: 'medium'
        },
        {
          name: '123Notary',
          citations: 1,
          verified: true,
          claimed: true,
          consistency: 98,
          importance: 'high'
        }
      ];

      const mockInconsistencies: Inconsistency[] = [
        {
          platform: 'Yellow Pages',
          field: 'phone',
          currentValue: '(713) 364-4066',
          standardValue: '(713) 364-4065',
          severity: 'high',
          impact: 'Confuses customers and search engines'
        },
        {
          platform: 'Superpages',
          field: 'website',
          currentValue: 'http://houstonmobilenotarypros.com',
          standardValue: 'https://houstonmobilenotarypros.com',
          severity: 'medium',
          impact: 'Reduces website traffic and SEO value'
        }
      ];

      setCitationHealth(mockCitationHealth);
      setLocalMetrics(mockLocalMetrics);
      setTopPlatforms(mockTopPlatforms);
      setInconsistencies(mockInconsistencies);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleRunAudit = async () => {
    try {
      setLoading(true);
      // In real implementation, this would trigger NAP audit
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadDashboardData();
    } catch (error) {
      console.error('Error running audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDirectories = async () => {
    try {
      setLoading(true);
      // In real implementation, this would trigger directory submissions
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadDashboardData();
    } catch (error) {
      console.error('Error submitting to directories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Local SEO Dashboard</h1>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Local SEO Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={handleRunAudit}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Run NAP Audit
          </Button>
          <Button 
            onClick={handleSubmitDirectories}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Submit to Directories
          </Button>
        </div>
      </div>

      {/* Citation Health Overview */}
      {citationHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Citations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{citationHealth.totalCitations}</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-3 w-3" />
                +{citationHealth.recentChanges.newCitations} new
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Verified Citations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{citationHealth.verifiedCitations}</div>
              <div className="text-sm text-gray-600">
                {Math.round((citationHealth.verifiedCitations / citationHealth.totalCitations) * 100)}% verified
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                NAP Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{citationHealth.averageConsistencyScore}%</div>
              <Progress value={citationHealth.averageConsistencyScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Claimed Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{citationHealth.claimedCitations}</div>
              <div className="text-sm text-gray-600">
                {Math.round((citationHealth.claimedCitations / citationHealth.totalCitations) * 100)}% claimed
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Local SEO Performance */}
      {localMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Local Search Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localMetrics.localSearchClicks.toLocaleString()}</div>
              <div className="text-sm text-gray-600">This month</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Local Search CTR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localMetrics.localCTR}%</div>
              <div className="text-sm text-green-600">Above average</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                <div className="text-2xl font-bold">{localMetrics.averageRating}</div>
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              </div>
              <div className="text-sm text-gray-600">
                {localMetrics.totalReviews} reviews
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Directory Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localMetrics.approvedSubmissions}</div>
              <div className="text-sm text-gray-600">
                {localMetrics.pendingSubmissions} pending
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="inconsistencies">Issues</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            {citationHealth && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Platform Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Major Platforms</span>
                    <span className="font-semibold">{citationHealth.platformDistribution.major}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Local Directories</span>
                    <span className="font-semibold">{citationHealth.platformDistribution.local}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Niche Directories</span>
                    <span className="font-semibold">{citationHealth.platformDistribution.niche}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Social Platforms</span>
                    <span className="font-semibold">{citationHealth.platformDistribution.social}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {citationHealth && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {citationHealth.recentChanges.newCitations} new citations added
                      </div>
                      <div className="text-sm text-gray-600">In the last 30 days</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {citationHealth.recentChanges.updatedCitations} citations updated
                      </div>
                      <div className="text-sm text-gray-600">Recent data changes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {citationHealth.recentChanges.removedCitations} citations removed
                      </div>
                      <div className="text-sm text-gray-600">Expired or invalid listings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Citation Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPlatforms.map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-sm text-gray-600">
                          {platform.citations} citation{platform.citations !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={platform.importance === 'high' ? 'default' : 'secondary'}>
                        {platform.importance}
                      </Badge>
                      {platform.verified && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {platform.claimed && (
                        <Badge variant="outline" className="text-blue-600">
                          <Users className="h-3 w-3 mr-1" />
                          Claimed
                        </Badge>
                      )}
                      <div className="text-sm font-medium">{platform.consistency}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inconsistencies Tab */}
        <TabsContent value="inconsistencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                NAP Inconsistencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inconsistencies.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-gray-600">No NAP inconsistencies found across your citations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inconsistencies.map((issue, index) => (
                    <Alert key={index} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <strong>{issue.platform}</strong>
                            <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Current:</span> {issue.currentValue}
                            </div>
                            <div>
                              <span className="font-medium">Should be:</span> {issue.standardValue}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Field:</strong> {issue.field} | <strong>Impact:</strong> {issue.impact}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Local Search Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {localMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {localMetrics.localSearchViews.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Local Search Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {localMetrics.localSearchClicks.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Local Search Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {localMetrics.localCTR}%
                    </div>
                    <div className="text-sm text-gray-600">Click-Through Rate</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 