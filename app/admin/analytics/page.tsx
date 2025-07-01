"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  MapPin,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    conversionRate: number;
    trends: {
      bookings: number;
      revenue: number;
      conversion: number;
    };
  };
  serviceBreakdown: {
    serviceType: string;
    bookings: number;
    revenue: number;
    percentage: number;
  }[];
  locationAnalytics: {
    city: string;
    bookings: number;
    averageDistance: number;
    totalTravelFees: number;
  }[];
  timeAnalytics: {
    period: string;
    bookings: number;
    revenue: number;
  }[];
  pricingMetrics: {
    averageBasePrice: number;
    averageTravelFee: number;
    averageSignerFees: number;
    totalDiscounts: number;
  };
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use mock data since the analytics API isn't implemented yet
      const mockData: AnalyticsData = {
        overview: {
          totalBookings: 342,
          totalRevenue: 28750,
          averageBookingValue: 84.06,
          conversionRate: 73.2,
          trends: {
            bookings: 12.5,
            revenue: 18.3,
            conversion: -2.1
          }
        },
        serviceBreakdown: [
          { serviceType: 'Standard Notary', bookings: 156, revenue: 11700, percentage: 45.6 },
          { serviceType: 'Extended Hours', bookings: 98, revenue: 9800, percentage: 28.7 },
          { serviceType: 'Loan Signing', bookings: 88, revenue: 13200, percentage: 25.7 }
        ],
        locationAnalytics: [
          { city: 'Houston', bookings: 145, averageDistance: 12.3, totalTravelFees: 2150 },
          { city: 'League City', bookings: 67, averageDistance: 8.1, totalTravelFees: 890 },
          { city: 'Pearland', bookings: 54, averageDistance: 10.5, totalTravelFees: 1200 },
          { city: 'Sugar Land', bookings: 43, averageDistance: 15.2, totalTravelFees: 1890 },
          { city: 'Katy', bookings: 33, averageDistance: 18.7, totalTravelFees: 1620 }
        ],
        timeAnalytics: [
          { period: 'Monday', bookings: 52, revenue: 4380 },
          { period: 'Tuesday', bookings: 48, revenue: 4020 },
          { period: 'Wednesday', bookings: 51, revenue: 4290 },
          { period: 'Thursday', bookings: 49, revenue: 4110 },
          { period: 'Friday', bookings: 56, revenue: 4710 },
          { period: 'Saturday', bookings: 45, revenue: 3780 },
          { period: 'Sunday', bookings: 41, revenue: 3460 }
        ],
        pricingMetrics: {
          averageBasePrice: 92.50,
          averageTravelFee: 12.75,
          averageSignerFees: 8.25,
          totalDiscounts: 3450
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const exportData = () => {
    // Implement CSV export functionality
    console.log('Exporting analytics data...');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load analytics data</p>
            <Button onClick={loadAnalytics} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Analytics</h1>
            <p className="text-gray-600">Business intelligence and performance metrics</p>
          </div>
          
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalBookings}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data.overview.trends.bookings > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                {formatPercentage(data.overview.trends.bookings)} from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data.overview.trends.revenue > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                {formatPercentage(data.overview.trends.revenue)} from last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.overview.averageBookingValue)}</div>
              <div className="text-xs text-muted-foreground">
                Per completed booking
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.conversionRate}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data.overview.trends.conversion > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                )}
                {formatPercentage(data.overview.trends.conversion)} from last period
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Service Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Service Type Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.serviceBreakdown.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" style={{
                        backgroundColor: `hsl(${220 + index * 60}, 70%, 50%)`
                      }}></div>
                      <div>
                        <p className="font-medium">{service.serviceType}</p>
                        <p className="text-sm text-gray-500">{service.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(service.revenue)}</p>
                      <p className="text-sm text-gray-500">{service.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.timeAnalytics.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 text-sm font-medium">{day.period.slice(0, 3)}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${(day.bookings / Math.max(...data.timeAnalytics.map(d => d.bookings))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-semibold">{day.bookings}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(day.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.locationAnalytics.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{location.city}</p>
                      <p className="text-sm text-gray-500">
                        {location.bookings} bookings • Avg {location.averageDistance.toFixed(1)} miles
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {formatCurrency(location.totalTravelFees)} travel fees
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Average Base Price</span>
                  <span className="text-lg font-semibold">{formatCurrency(data.pricingMetrics.averageBasePrice)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Average Travel Fee</span>
                  <span className="text-lg font-semibold">{formatCurrency(data.pricingMetrics.averageTravelFee)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Average Signer Fees</span>
                  <span className="text-lg font-semibold">{formatCurrency(data.pricingMetrics.averageSignerFees)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-700">Total Discounts</span>
                  <span className="text-lg font-semibold text-red-700">-{formatCurrency(data.pricingMetrics.totalDiscounts)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}