/**
 * Payment Retry Button Component
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Customer-facing component for retrying failed payments
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';

interface PaymentRetryProps {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency?: string;
  className?: string;
}

interface PaymentRetryStatus {
  currentStatus: string;
  retryCount: number;
  nextRetryAt?: string;
  canRetry: boolean;
  retryHistory: Array<{
    attempt: number;
    timestamp: string;
    reason: string;
    wasSuccessful: boolean;
  }>;
}

export function PaymentRetryButton({ 
  paymentId, 
  bookingId, 
  amount, 
  currency = 'USD',
  className 
}: PaymentRetryProps) {
  const [retryStatus, setRetryStatus] = useState<PaymentRetryStatus | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRetryStatus();
    
    // Refresh status every 30 seconds if retry is scheduled
    const interval = setInterval(() => {
      if (retryStatus?.currentStatus === 'RETRY_SCHEDULED') {
        loadRetryStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [paymentId]);

  const loadRetryStatus = async () => {
    try {
      const response = await fetch(`/api/payments/retry?paymentId=${paymentId}`);
      if (response.ok) {
        const data = await response.json();
        setRetryStatus(data.data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load payment status');
      }
    } catch (err) {
      setError('Failed to load payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    setIsRetrying(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          bookingId,
          reason: 'Customer initiated retry'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refresh status
        await loadRetryStatus();
        
        // If the retry requires action, show appropriate message
        if (result.data.requiresAction) {
          setError('Payment requires additional verification. Please complete the authentication process.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to retry payment');
      }
    } catch (err) {
      setError('Failed to retry payment. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FAILED': return 'destructive';
      case 'RETRY_SCHEDULED': return 'secondary';
      case 'REQUIRES_CUSTOMER_ACTION': return 'default';
      case 'PERMANENTLY_FAILED': return 'destructive';
      case 'PROCESSING': return 'secondary';
      case 'PAID': return 'default';
      default: return 'default';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'FAILED': 
        return 'Payment failed. You can retry using the button below.';
      case 'RETRY_SCHEDULED': 
        return 'Payment retry is scheduled. We\'ll automatically attempt to process your payment again.';
      case 'REQUIRES_CUSTOMER_ACTION': 
        return 'Your payment requires additional verification. Please update your payment method or contact your bank.';
      case 'PERMANENTLY_FAILED': 
        return 'Payment could not be processed after multiple attempts. Please use a different payment method or contact support.';
      case 'PROCESSING': 
        return 'Your payment is currently being processed.';
      case 'PAID': 
        return 'Payment completed successfully!';
      default: 
        return 'Payment status unknown.';
    }
  };

  const formatNextRetryTime = (nextRetryAt: string) => {
    const retryTime = new Date(nextRetryAt);
    const now = new Date();
    const diffMs = retryTime.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Retry pending...';
    }
    
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `Next retry in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
    
    const diffHours = Math.ceil(diffMinutes / 60);
    return `Next retry in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading payment status...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!retryStatus) {
    return null;
  }

  // Don't show retry options for successful payments
  if (retryStatus.currentStatus === 'PAID') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Payment completed successfully</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Payment Status</span>
          <Badge variant={getStatusColor(retryStatus.currentStatus)}>
            {retryStatus.currentStatus.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Amount */}
        <div className="text-center">
          <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
          <p className="text-sm text-gray-600">Booking: {bookingId}</p>
        </div>

        {/* Status Message */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {getStatusMessage(retryStatus.currentStatus)}
          </AlertDescription>
        </Alert>

        {/* Next Retry Time */}
        {retryStatus.nextRetryAt && retryStatus.currentStatus === 'RETRY_SCHEDULED' && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatNextRetryTime(retryStatus.nextRetryAt)}</span>
          </div>
        )}

        {/* Retry History */}
        {retryStatus.retryCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Retry History ({retryStatus.retryCount} attempts)</p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {retryStatus.retryHistory.slice(-3).map((attempt, index) => (
                <div key={index} className="text-xs text-gray-600 flex justify-between">
                  <span>Attempt #{attempt.attempt}</span>
                  <span>{new Date(attempt.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {retryStatus.canRetry && (
            <Button
              onClick={handleRetryPayment}
              disabled={isRetrying || retryStatus.currentStatus === 'PROCESSING'}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying Payment...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Payment
                </>
              )}
            </Button>
          )}

          {retryStatus.currentStatus === 'REQUIRES_CUSTOMER_ACTION' && (
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Update Payment Method
            </Button>
          )}

          {retryStatus.currentStatus === 'PERMANENTLY_FAILED' && (
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Use Different Payment Method
              </Button>
              <Button variant="ghost" className="w-full text-sm">
                Contact Support
              </Button>
            </div>
          )}
        </div>

        {/* Retry count warning */}
        {retryStatus.retryCount >= 3 && retryStatus.canRetry && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This payment has failed {retryStatus.retryCount} times. 
              If the next retry fails, you may need to use a different payment method.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}