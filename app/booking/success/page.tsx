'use client';

/**
 * Booking Success Page - Confirmation
 * Houston Mobile Notary Pros
 * 
 * Displays confirmation details for a successfully created booking.
 */

import React, { useState, useEffect } from 'react';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  Mail,
  Phone,
  Calendar,
  Home,
  Loader2,
  FileText
} from 'lucide-react';

interface BookingDetails {
  id: string;
  serviceType: string;
  customerName: string;
  customerEmail: string;
  scheduledDateTime: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const fallbackBooking: BookingDetails | null = bookingId
      ? null
      : {
          id: 'pending',
          serviceType: searchParams.get('serviceType') || 'STANDARD_NOTARY',
          customerName: searchParams.get('customerName') || 'Customer',
          customerEmail: searchParams.get('customerEmail') || '',
          scheduledDateTime: searchParams.get('scheduledDateTime') || '',
          addressStreet: searchParams.get('locationAddress') || '',
          addressCity: '',
          addressState: '',
          addressZip: ''
        };

    if (bookingId) {
      fetchBookingDetails(bookingId);
    } else if (fallbackBooking) {
      setBooking(fallbackBooking);
      // Parse uploaded docs from notes if present in query (optional)
      const docsParam = searchParams.get('uploadedDocs');
      if (docsParam) {
        try { setUploadedDocs(JSON.parse(decodeURIComponent(docsParam))); } catch {}
      }
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/booking/${bookingId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve booking details');
      }

      const result = await response.json();
      setBooking(result.booking);

    } catch (error) {
      console.error('Failed to fetch booking details:', error);
      setError(error instanceof Error ? getErrorMessage(error) : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceDisplayName = (serviceType: string) => {
    const serviceNames = {
      'STANDARD_NOTARY': 'Standard Notary Service',
      'EXTENDED_HOURS': 'Extended Hours Service', 
      'LOAN_SIGNING': 'Loan Signing Service',
      'RON_SERVICES': 'Remote Online Notarization'
    };
    return serviceNames[serviceType as keyof typeof serviceNames] || serviceType.replace(/_/g, ' ');
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
            Loading Your Booking Confirmation...
          </h2>
          <p className="text-gray-600">
            Please wait a moment.
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
              onClick={() => router.push('/booking')}
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Could not find booking details.</p>
            <Button 
              onClick={() => router.push('/booking')}
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your appointment has been scheduled. We'll be in touch shortly.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Booking Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
             <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><FileText className="h-4 w-4 mr-2" />Service Type:</span>
              <span>{getServiceDisplayName(booking.serviceType)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><Clock className="h-4 w-4 mr-2" />Date & Time:</span>
              <span className="text-right">{formatDateTime(booking.scheduledDateTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><MapPin className="h-4 w-4 mr-2" />Location:</span>
              <span className="text-right">{`${booking.addressStreet}, ${booking.addressCity}, ${booking.addressState} ${booking.addressZip}`}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><User className="h-4 w-4 mr-2" />Name:</span>
              <span>{booking.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><Mail className="h-4 w-4 mr-2" />Email:</span>
              <span>{booking.customerEmail}</span>
            </div>
          </CardContent>
        </Card>

        {uploadedDocs.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Your Uploaded Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <p className="text-sm text-muted-foreground">Thanks! Your documents were received and attached to this booking.</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {uploadedDocs.map((d, idx) => (
                  <li key={idx}>{d.name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Confirmation Email Sent</h4>
                <p className="text-sm text-gray-600">
                  Check your email for booking details and instructions.
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
                  We'll assign a certified notary and confirm your appointment.
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
                  Your notary will arrive on time for professional service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => router.push('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
          <Button 
            className="flex-1"
            onClick={() => router.push('/contact')}
          >
            <Phone className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>

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
