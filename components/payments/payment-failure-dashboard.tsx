/**
 * Payment Failure Dashboard
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Dashboard for monitoring and managing payment failures and retries
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  CreditCard,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

interface PaymentFailure {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  retryCount: number;
  lastFailureReason: string;
  nextRetryAt?: string;
  customerEmail: string;
  customerName: string;
  createdAt: string;
  canRetry: boolean;
}

interface PaymentStats {
  totalFailures: number;
  activeRetries: number;
  permanentFailures: number;
  successfulRetries: number;
  failureRate: number;
  totalRetryAmount: number;
}

export function PaymentFailureDashboard() {
  const [paymentFailures, setPaymentFailures] = useState<PaymentFailure[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalFailures: 0,
    activeRetries: 0,
    permanentFailures: 0,
    successfulRetries: 0,
    failureRate: 0,
    totalRetryAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [retryingPayments, setRetryingPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPaymentFailures();
    loadPaymentStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadPaymentFailures();
      loadPaymentStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadPaymentFailures = async () => {
    try {
      const response = await fetch('/api/admin/payments/failures');
      if (response.ok) {
        const data = await response.json();
        setPaymentFailures(data.failures || []);
      }
    } catch (error) {
      console.error('Failed to load payment failures:', error);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const response = await fetch('/api/admin/payments/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to load payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (paymentId: string, bookingId: string) => {
    setRetryingPayments(prev => new Set(prev).add(paymentId));
    
    try {
      const response = await fetch('/api/payments/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          bookingId,
          reason: 'Manual admin retry',
          forceRetry: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh the list
        await loadPaymentFailures();
        await loadPaymentStats();
        
        // Show success message
        alert('Payment retry initiated successfully');
      } else {
        const error = await response.json();
        alert(`Retry failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Payment retry failed:', error);
      alert('Failed to retry payment. Please try again.');
    } finally {
      setRetryingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FAILED': return 'destructive';
      case 'RETRY_SCHEDULED': return 'secondary';
      case 'REQUIRES_CUSTOMER_ACTION': return 'default';
      case 'PERMANENTLY_FAILED': return 'destructive';
      case 'PROCESSING': return 'secondary';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading payment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Total Failures</p>
                <p className="text-2xl font-bold">{stats.totalFailures}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Active Retries</p>
                <p className="text-2xl font-bold">{stats.activeRetries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Successful Retries</p>
                <p className="text-2xl font-bold">{stats.successfulRetries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Retry Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRetryAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failure Rate Alert */}
      {stats.failureRate > 5 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Payment failure rate is {stats.failureRate.toFixed(1)}%, which is above the normal threshold. 
            Consider reviewing payment processing settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Failures Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Failures & Retries</CardTitle>
            <Button 
              onClick={() => {
                loadPaymentFailures();
                loadPaymentStats();
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Failures</TabsTrigger>
              <TabsTrigger value="retryable">Retryable</TabsTrigger>
              <TabsTrigger value="permanent">Permanent</TabsTrigger>
              <TabsTrigger value="action_required">Action Required</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="space-y-4">
                {paymentFailures.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No payment failures found
                  </div>
                ) : (
                  paymentFailures.map((failure) => (
                    <div key={failure.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getStatusColor(failure.status)}>
                            {failure.status.replace('_', ' ')}
                          </Badge>
                          <span className="font-medium">
                            {formatCurrency(failure.amount, failure.currency)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Booking: {failure.bookingId}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {failure.canRetry && (
                            <Button
                              size="sm"
                              onClick={() => handleRetryPayment(failure.id, failure.bookingId)}
                              disabled={retryingPayments.has(failure.id)}
                            >
                              {retryingPayments.has(failure.id) ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Retrying...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Retry
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Customer</p>
                          <p>{failure.customerName}</p>
                          <p className="text-gray-500">{failure.customerEmail}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Failure Reason</p>
                          <p>{failure.lastFailureReason}</p>
                          <p className="text-gray-500">Retry #{failure.retryCount}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Timeline</p>
                          <p>Failed: {formatDate(failure.createdAt)}</p>
                          {failure.nextRetryAt && (
                            <p className="text-gray-500">
                              Next retry: {formatDate(failure.nextRetryAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            {/* Other tab content would filter the same data */}
            <TabsContent value="retryable">
              <div className="text-center py-8 text-gray-500">
                Filtered view for retryable payments
              </div>
            </TabsContent>
            
            <TabsContent value="permanent">
              <div className="text-center py-8 text-gray-500">
                Filtered view for permanent failures
              </div>
            </TabsContent>
            
            <TabsContent value="action_required">
              <div className="text-center py-8 text-gray-500">
                Filtered view for payments requiring customer action
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}