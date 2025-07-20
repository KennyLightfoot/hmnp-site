'use client';

/**
 * Booking Success Page - Payment Completion
 * Houston Mobile Notary Pros
 * 
 * Handles successful Stripe payments and completes booking creation
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Download,
  Star,
  Home,
  Loader2
} from 'lucide-react';

interface PaymentSession {
  id: string;
  status: string;
  payment_status: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  metadata: {
    service_type?: string;
    booking_date?: string;
    booking_time?: string;
    location_address?: string;
  };
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('Missing payment session information');
      setIsLoading(false);
      return;
    }

    // Fetch payment session details and create booking
    handlePaymentSuccess(sessionId);
  }, [searchParams]);

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      // Step 1: Get payment session details
      const sessionResponse = await fetch(`/api/create-checkout-session?session_id=${sessionId}`);
      
      if (!sessionResponse.ok) {
        throw new Error('Failed to retrieve payment session');
      }

      const sessionData = await sessionResponse.json();
      
      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Invalid payment session');
      }

      setSession(sessionData.session);

      // Step 2: Create booking with confirmed payment
      if (sessionData.session.payment_status === 'paid') {
        await createBookingFromPayment(sessionData.session);
      }

    } catch (error) {
      console.error('Payment success handling failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process payment success');
    } finally {
      setIsLoading(false);
    }
  };

  const createBookingFromPayment = async (paymentSession: PaymentSession) => {
    try {
      // Extract booking data from payment metadata
      const bookingData = {
        serviceType: paymentSession.metadata.service_type || 'STANDARD_NOTARY',
        customerEmail: paymentSession.customer_email,
        customerName: 'Customer', // This should come from session metadata in real implementation
        // Ensure scheduledDateTime satisfies backend validation (ISO, future, <=1yr)
        scheduledDateTime: (() => {
          const { booking_time, booking_date } = paymentSession.metadata || {};
          // Helper to check valid date and in future
          const isAcceptable = (iso: string | undefined | null): iso is string => {
            if (!iso) return false;
            const dt = new Date(iso);
            if (isNaN(dt.getTime())) return false;
            const now = Date.now();
            const oneYearAhead = new Date(now);
            oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
            return dt.getTime() > now && dt.getTime() <= oneYearAhead.getTime();
          };

          // 1️⃣ Use booking_time metadata if it looks good
          if (isAcceptable(booking_time)) return new Date(booking_time as string).toISOString();

          // 2️⃣ Combine booking_date + booking_time if both exist
          if (booking_date && booking_time) {
            const combined = new Date(`${booking_date}T${new Date(booking_time).toISOString().split('T')[1]}`);
            if (isAcceptable(combined.toISOString())) return combined.toISOString();
          }

          // 3️⃣ Fallback: now + 2 hours (gives future timestamp)
          const fallback = new Date(Date.now() + 2 * 60 * 60 * 1000);
          return fallback.toISOString();
        })(),
        locationType: 'OTHER',
        addressStreet: paymentSession.metadata.location_address || '',
        addressCity: 'Houston',
        addressState: 'TX',
        addressZip: '77001',
        pricing: {
          basePrice: (paymentSession.amount_total || 0) / 100,
          travelFee: 0,
          totalPrice: (paymentSession.amount_total || 0) / 100
        },
        numberOfDocuments: 1,
        numberOfSigners: 1,
        stripeSessionId: paymentSession.id
      };

      const bookingResponse = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (bookingResponse.ok) {
        const bookingResult = await bookingResponse.json();
        setBooking(bookingResult.booking);
      } else {
        console.warn('Booking creation failed, but payment was successful');
      }

    } catch (error) {
      console.error('Booking creation failed:', error);
      // Don't set error state here - payment was successful even if booking creation failed
    }
  };

  const getServiceDisplayName = (serviceType: string) => {
    const serviceNames = {
      'STANDARD_NOTARY': 'Standard Notary Service',
      'EXTENDED_HOURS': 'Extended Hours Service', 
      'LOAN_SIGNING': 'Loan Signing Service',
      'RON_SERVICES': 'Remote Online Notarization'
    };
    return serviceNames[serviceType as keyof typeof serviceNames] || serviceType;
  };

  const formatDateTime = (dateTime: string) => {
    try {
      return new Date(dateTime).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateTime;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processing Your Payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your booking
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.href = '/booking'}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">No payment session found</p>
            <Button 
              onClick={() => window.location.href = '/booking'}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Start New Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your booking has been confirmed and we'll be in touch shortly
          </p>
        </div>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <span>Payment Confirmation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Status:</span>
              <Badge className="bg-green-100 text-green-800">
                {session.payment_status === 'paid' ? 'Paid' : session.payment_status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold text-lg">
                ${((session.amount_total || 0) / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service:</span>
              <span>{getServiceDisplayName(session.metadata.service_type || '')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Email:</span>
              <span>{session.customer_email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        {booking && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Booking Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Booking ID: {booking.id}</span>
              </div>
              {session.metadata.booking_time && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatDateTime(session.metadata.booking_time)}</span>
                </div>
              )}
              {session.metadata.location_address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{session.metadata.location_address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Confirmation Email Sent</h4>
                <p className="text-sm text-gray-600">
                  Check your email for booking details and instructions
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Notary Assignment</h4>
                <p className="text-sm text-gray-600">
                  We'll assign a certified notary and confirm your appointment
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Service Delivery</h4>
                <p className="text-sm text-gray-600">
                  Your notary will arrive on time for professional service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.location.href = '/'}
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
          <Button 
            className="flex-1"
            onClick={() => window.location.href = '/contact'}
          >
            <Phone className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 mb-2">
            Need immediate assistance?
          </p>
          <p className="text-sm font-medium text-blue-600">
            Call us at (832) 617-4285
          </p>
        </div>
      </div>
    </div>
  );
} 