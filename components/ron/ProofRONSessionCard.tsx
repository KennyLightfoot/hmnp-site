'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Upload, CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react';

interface ProofRONSessionCardProps {
  booking: {
    id: string;
    status: string;
    finalPrice: number;
    depositStatus?: string;
    stripePaymentUrl?: string;
    proofTransactionId?: string;
    proofAccessLink?: string;
    proofStatus?: string;
    service?: {
      name: string;
    };
    NotarizationDocument?: Array<{
      id: string;
      originalFilename: string;
      isSigned: boolean;
    }>;
    createdAt: string;
    notes?: string;
  };
  onRefresh: () => void;
}

export default function ProofRONSessionCard({ booking, onRefresh }: ProofRONSessionCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getStatusDisplay = (status: string, proofStatus?: string) => {
    if (proofStatus) {
      const proofStatusMap: { [key: string]: string } = {
        'started': 'Documents Being Prepared',
        'sent': 'Invitation Sent',
        'received': 'Documents Viewed',
        'meeting_in_progress': 'Notary Session Active',
        'completed': 'Notarization Complete',
        'completed_with_rejections': 'Completed with Issues',
        'expired': 'Session Expired',
        'failed': 'Session Failed'
      };
      return proofStatusMap[proofStatus] || proofStatus;
    }

    const statusMap: { [key: string]: string } = {
      'PAYMENT_PENDING': 'Payment Required',
      'AWAITING_CLIENT_ACTION': 'Awaiting Documents',
      'READY_FOR_SERVICE': 'Ready for Notarization',
      'IN_PROGRESS': 'Session in Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'EXPIRED': 'Expired'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string, proofStatus?: string) => {
    if (proofStatus) {
      const proofColorMap: { [key: string]: string } = {
        'started': 'bg-blue-100 text-blue-800',
        'sent': 'bg-purple-100 text-purple-800',
        'received': 'bg-yellow-100 text-yellow-800',
        'meeting_in_progress': 'bg-orange-100 text-orange-800',
        'completed': 'bg-green-100 text-green-800',
        'completed_with_rejections': 'bg-yellow-100 text-yellow-800',
        'expired': 'bg-gray-100 text-gray-800',
        'failed': 'bg-red-100 text-red-800'
      };
      return proofColorMap[proofStatus] || 'bg-gray-100 text-gray-800';
    }

    const colorMap: { [key: string]: string } = {
      'PAYMENT_PENDING': 'bg-red-100 text-red-800',
      'AWAITING_CLIENT_ACTION': 'bg-yellow-100 text-yellow-800',
      'READY_FOR_SERVICE': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-orange-100 text-orange-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'EXPIRED': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const canStartRONSession = () => {
    // Can start if payment is complete (or service is free) and no Proof transaction exists yet
    return (booking.finalPrice === 0 || booking.depositStatus === 'COMPLETED') && 
           !booking.proofTransactionId;
  };

  const canJoinSession = () => {
    // Can join if Proof transaction exists and it's ready
    return booking.proofTransactionId && 
           booking.proofAccessLink && 
           ['sent', 'received', 'meeting_in_progress'].includes(booking.proofStatus || '');
  };

  const needsPayment = () => {
    return booking.finalPrice > 0 && booking.depositStatus !== 'COMPLETED';
  };

  const createProofTransaction = async () => {
    setLoading('creating-transaction');
    setError(null);

    try {
      const response = await fetch('/api/proof/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Proof transaction');
      }

      const data = await response.json();
      console.log('Proof transaction created:', data);
      
      // Refresh the booking data
      onRefresh();
      
    } catch (error) {
      console.error('Error creating Proof transaction:', error);
      setError(error instanceof Error ? getErrorMessage(error) : 'Failed to create session');
    } finally {
      setLoading(null);
    }
  };

  const getActionButton = () => {
    if (needsPayment()) {
      return (
        <Button 
          onClick={() => window.open(booking.stripePaymentUrl, '_blank')}
          className="w-full"
          variant="default"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Complete Payment (${booking.finalPrice})
        </Button>
      );
    }

    if (canStartRONSession()) {
      return (
        <Button 
          onClick={createProofTransaction}
          disabled={loading === 'creating-transaction'}
          className="w-full"
        >
          {loading === 'creating-transaction' ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Creating Session...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Start RON Session
            </>
          )}
        </Button>
      );
    }

    if (canJoinSession()) {
      return (
        <Button 
          onClick={() => window.open(booking.proofAccessLink, '_blank')}
          className="w-full"
          variant="default"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Join Notary Session
        </Button>
      );
    }

    if (booking.proofStatus === 'completed') {
      return (
        <Button disabled className="w-full" variant="outline">
          <CheckCircle className="mr-2 h-4 w-4" />
          Session Completed
        </Button>
      );
    }

    return (
      <Button disabled className="w-full" variant="outline">
        Session Not Available
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              RON Session {booking.id.slice(-8)}
            </CardTitle>
            <CardDescription>
              Created: {new Date(booking.createdAt).toLocaleDateString()} · Documents uploaded here go directly to Proof and are not stored on our servers.
            </CardDescription>
          </div>
          <Badge className={getStatusColor(booking.status, booking.proofStatus)}>
            {getStatusDisplay(booking.status, booking.proofStatus)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {needsPayment() && (
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              Payment of ${booking.finalPrice} is required before starting your RON session.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Service</p>
            <p className="text-sm text-gray-600">
              {booking.service?.name || 'Remote Online Notarization'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Price</p>
            <p className="text-sm text-gray-600">${booking.finalPrice}</p>
          </div>
        </div>

        {booking.proofTransactionId && (
          <div>
            <p className="text-sm font-medium">Proof Transaction</p>
            <p className="text-sm text-gray-600 font-mono">{booking.proofTransactionId}</p>
          </div>
        )}

        {booking.NotarizationDocument && booking.NotarizationDocument.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              Documents ({booking.NotarizationDocument.length})
            </p>
            <div className="space-y-1">
              {booking.NotarizationDocument.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{doc.originalFilename}</span>
                  <Badge variant={doc.isSigned ? "default" : "secondary"}>
                    {doc.isSigned ? 'Signed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {booking.notes && (
          <div>
            <p className="text-sm font-medium">Notes</p>
            <p className="text-sm text-gray-600">{booking.notes}</p>
          </div>
        )}

        <div className="pt-4">
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
} 
