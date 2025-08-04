'use client';

/**
 * Booking Checkout/Confirmation Page
 * Houston Mobile Notary Pros
 * 
 * This page now serves as a confirmation step that creates the booking
 * directly, bypassing the previous Stripe payment flow for debugging and
 * simplified booking.
 */

import React, { useState, useEffect } from 'react';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Loader2,
} from 'lucide-react';

interface BookingData {
  serviceType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  scheduledDateTime: string; // Combined date and time
  locationAddress: string;
  totalPrice: string;
}

export default function BookingCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // A single, combined ISO 8601 datetime string is now expected
    const scheduledDateTime = searchParams.get('scheduledDateTime') || '';

    const data: BookingData = {
      serviceType: searchParams.get('serviceType') || '',
      customerName: searchParams.get('customerName') || '',
      customerEmail: searchParams.get('customerEmail') || '',
      customerPhone: searchParams.get('customerPhone') || '',
      scheduledDateTime: scheduledDateTime,
      locationAddress: searchParams.get('locationAddress') || '',
      totalPrice: searchParams.get('totalPrice') || '0',
    };

    if (!data.serviceType || !data.customerEmail || !data.scheduledDateTime) {
      setError('Missing required booking information. Please go back and complete the form.');
      return;
    }

    setBookingData(data);
  }, [searchParams]);

  const getServiceDisplayName = (serviceType: string) => {
    const serviceNames = {
      STANDARD_NOTARY: 'Standard Notary Service',
      EXTENDED_HOURS: 'Extended Hours Service',
      LOAN_SIGNING: 'Loan Signing Service',
      RON_SERVICES: 'Remote Online Notarization',
    };
    return serviceNames[serviceType as keyof typeof serviceNames] || serviceType;
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'TBD';
    
    try {
      const dateTime = new Date(isoString);
      return dateTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingData) return;

    setIsProcessing(true);
    setError('');

    try {
      // Directly call the booking creation API
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: bookingData.serviceType,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          scheduledDateTime: bookingData.scheduledDateTime,
          addressStreet: bookingData.locationAddress,
          // Other fields the API might expect
          totalPrice: parseFloat(bookingData.totalPrice),
          // Ensure all required fields from your booking schema are present
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to create booking.');
      }

      const responseData = await response.json();

      // Redirect to a success page with booking details
      router.push(`/booking/success?bookingId=${responseData.bookingId}`);

    } catch (error) {
      console.error('Booking creation failed:', getErrorMessage(error));
      setError(error instanceof Error ? getErrorMessage(error) : 'Booking creation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (error && !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => window.history.back()} className="w-full">
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
          <span>Loading confirmation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
          <p className="text-gray-600">Please review the details below and confirm your appointment.</p>
        </div>

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
                  <span className="text-sm">{formatDateTime(bookingData.scheduledDateTime)}</span>
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
                <div className="text-2xl font-bold text-green-600">${bookingData.totalPrice}</div>
                <div className="text-sm text-gray-500">Total Amount</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span>Confirmation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                onClick={handleConfirmBooking}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Confirming Booking...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Confirm Booking</span>
                  </div>
                )}
              </Button>
            </div>

            <Separator />
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Need to make a change?</p>
              <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Form
                </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By confirming, you agree to our Terms of Service. You will receive an email confirmation.
          </p>
        </div>
      </div>
    </div>
  );
} 
