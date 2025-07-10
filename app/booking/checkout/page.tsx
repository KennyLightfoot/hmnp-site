'use client';

/**
 * Booking Checkout Page - Payment Collection
 * Houston Mobile Notary Pros
 * 
 * CRITICAL: This page ensures payment is collected before booking creation
 * Fixes the missing payment flow in SimpleBookingForm
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface BookingData {
  serviceType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  locationAddress: string;
  totalPrice: string;
}

export default function BookingCheckoutPage() {
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    // Extract booking data from URL parameters
    const data: BookingData = {
      serviceType: searchParams.get('serviceType') || '',
      customerName: searchParams.get('customerName') || '',
      customerEmail: searchParams.get('customerEmail') || '',
      customerPhone: searchParams.get('customerPhone') || '',
      bookingDate: searchParams.get('bookingDate') || '',
      bookingTime: searchParams.get('bookingTime') || '',
      locationAddress: searchParams.get('locationAddress') || '',
      totalPrice: searchParams.get('totalPrice') || '0'
    };

    if (!data.serviceType || !data.customerEmail || !data.bookingTime) {
      setError('Missing required booking information. Please go back and complete the form.');
      return;
    }

    setBookingData(data);
  }, [searchParams]);

  const getServiceDisplayName = (serviceType: string) => {
    const serviceNames = {
      'STANDARD_NOTARY': 'Standard Notary Service',
      'EXTENDED_HOURS': 'Extended Hours Service', 
      'LOAN_SIGNING': 'Loan Signing Service',
      'RON_SERVICES': 'Remote Online Notarization'
    };
    return serviceNames[serviceType as keyof typeof serviceNames] || serviceType;
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date || !time) return 'TBD';
    
    try {
      const dateTime = new Date(time);
      return dateTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return `${date} at ${time}`;
    }
  };

  const handlePayment = async () => {
    if (!bookingData) return;

    setIsProcessing(true);
    setError('');

    try {
      // Step 1: Create Stripe Payment Intent
      const paymentResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(bookingData.totalPrice) * 100, // Convert to cents
          currency: 'usd',
          metadata: {
            service_type: bookingData.serviceType,
            customer_email: bookingData.customerEmail,
            customer_name: bookingData.customerName,
            scheduled_date: bookingData.bookingTime
          }
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment session');
      }

      const { sessionId } = await paymentResponse.json();

      // Step 2: Redirect to Stripe Checkout
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

    } catch (error) {
      console.error('Payment failed:', error);
      setError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBookWithoutPayment = async () => {
    setError('⚠️ Payment is required to secure your booking. We cannot process bookings without payment.');
  };

  if (error && !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back to Booking Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading checkout...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Booking
          </h1>
          <p className="text-gray-600">
            Secure payment required to confirm your notary service
          </p>
        </div>

        {/* Booking Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Booking Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{bookingData.customerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{bookingData.customerEmail}</span>
                </div>
                {bookingData.customerPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{bookingData.customerPhone}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formatDateTime(bookingData.bookingDate, bookingData.bookingTime)}</span>
                </div>
                {bookingData.locationAddress && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{bookingData.locationAddress}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{getServiceDisplayName(bookingData.serviceType)}</div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {bookingData.serviceType}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${bookingData.totalPrice}
                </div>
                <div className="text-sm text-gray-500">Total Amount</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Secure Payment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                SSL Encrypted
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Secure Processing
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Instant Confirmation
              </Badge>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Payment Button */}
            <div className="space-y-4">
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Pay ${bookingData.totalPrice} & Confirm Booking</span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Your payment is processed securely through Stripe
                </p>
                <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
                  <span>• No hidden fees</span>
                  <span>• Instant confirmation</span>
                  <span>• 100% secure</span>
                </div>
              </div>
            </div>

            {/* Alternative Options */}
            <Separator />
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Need help or have questions?
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call (832) 617-4285
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By completing this payment, you agree to our Terms of Service and Privacy Policy.
            You will receive confirmation via email and SMS.
          </p>
        </div>
      </div>

      {/* Stripe Script */}
      <script src="https://js.stripe.com/v3/" async />
    </div>
  );
} 