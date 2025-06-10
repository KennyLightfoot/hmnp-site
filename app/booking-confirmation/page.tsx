"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ApiService {
  id: string;
  name: string;
  key: string;
  // Add other relevant service fields if needed for display
}

interface ApiPaymentIntent {
  id: string;
  stripePaymentIntentId: string;
  status: string; // e.g., 'succeeded', 'requires_payment_method' from Stripe
  amount: number;
  currency: string;
  createdAt: string;
}

interface BookingDetailsFromAPI {
  id: string;
  scheduledDateTime: string;
  status: string; // Booking status from DB, e.g., 'CONFIRMED', 'REQUESTED', 'PAYMENT_PENDING'
  service: ApiService;
  paymentIntents: ApiPaymentIntent[]; // API returns an array, usually we're interested in the latest
  locationType?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZip?: string | null;
  notes?: string | null;
  // Add other booking fields if needed for display
}

async function getBookingDetails(bookingId: string): Promise<BookingDetailsFromAPI> {
  console.log(`Fetching details for booking ${bookingId} from API...`);
  const response = await fetch(`/api/bookings/${bookingId}`);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      throw new Error(`Failed to fetch booking details: ${response.status} ${response.statusText}`);
    }
    throw new Error(errorData.error || `Failed to fetch booking details: ${response.status}`);
  }
  return response.json();
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetailsFromAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) {
      setLoading(false);
      setError("Could not load booking confirmation details: Invalid page parameters.");
      return;
    }
    const bid = searchParams.get('bookingId');
    const pStatus = searchParams.get('status'); // e.g., 'succeeded' from Stripe redirect
    const pIntentId = searchParams.get('payment_intent');

    if (bid) {
      setBookingId(bid);
      setPaymentStatus(pStatus);
      setPaymentIntentId(pIntentId);
      
      getBookingDetails(bid)
        .then(details => {
          setBookingDetails(details);
          // Potentially update booking status in your backend if payment succeeded
          // This might be better handled by Stripe webhooks for reliability
          if (pStatus === 'succeeded' && pIntentId) {
            console.log(`Payment successful for booking ${bid}, payment_intent ${pIntentId}. Consider backend update.`);
            // Example: fetch(`/api/bookings/confirm-payment`, { method: 'POST', body: JSON.stringify({ bookingId: bid, paymentIntentId: pIntentId }) });
          }
        })
        .catch(err => {
          console.error("Error fetching booking details:", err);
          setError("Could not load booking details. Please contact support if the issue persists.");
        })
        .finally(() => setLoading(false));
    } else {
      setError("No booking ID found. Cannot display confirmation.");
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[#002147]" />
      </div>
    );
  }

  const isSuccess = !error && bookingDetails && (paymentStatus ? paymentStatus === 'succeeded' : bookingDetails.status === 'CONFIRMED' || bookingDetails.status === 'REQUESTED' || bookingDetails.status === 'PAYMENT_PENDING');
  const latestPaymentIntent = bookingDetails?.paymentIntents?.[0];

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-start min-h-screen">
      <Card className="w-full max-w-lg mt-8">
        <CardHeader className="text-center">
          {isSuccess ? (
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          ) : (
            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          )}
          <CardTitle className="text-2xl">
            {isSuccess ? "Booking Confirmed!" : "Booking Issue"}
          </CardTitle>
          <CardDescription>
            {isSuccess 
              ? `Thank you! Your booking (ID: ${bookingId}) has been successfully processed.`
              : error || "There was an issue with your booking confirmation."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingDetails && (
            <div className="text-sm text-gray-700 space-y-3">
              <p><strong>Booking ID:</strong> {bookingDetails.id}</p>
              <p><strong>Service:</strong> {bookingDetails.service.name}</p>
              <p><strong>Appointment:</strong> {new Date(bookingDetails.scheduledDateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
              <p><strong>Booking Status:</strong> <Badge variant={bookingDetails.status === 'CONFIRMED' ? 'default' : bookingDetails.status === 'PAYMENT_PENDING' ? 'secondary' : 'outline'}>{bookingDetails.status.replace('_', ' ')}</Badge></p>
              
              {paymentIntentId && <p><strong>Stripe Payment ID:</strong> {paymentIntentId}</p>}
              {paymentStatus && 
                <p><strong>Stripe Payment Status:</strong> <Badge variant={paymentStatus === 'succeeded' ? 'default' : 'destructive'}>{paymentStatus}</Badge></p>
              }
              {latestPaymentIntent && !paymentStatus && (
                <p><strong>Latest Payment Status (DB):</strong> <Badge variant={latestPaymentIntent.status === 'succeeded' ? 'default' : 'destructive'}>{latestPaymentIntent.status}</Badge> ({latestPaymentIntent.amount / 100} {latestPaymentIntent.currency.toUpperCase()})</p>
              )}

              {bookingDetails.locationType && (
                <p><strong>Location Type:</strong> {bookingDetails.locationType.replace('_', ' ')}</p>
              )}
              {bookingDetails.addressStreet && (
                <p><strong>Address:</strong> {`${bookingDetails.addressStreet}, ${bookingDetails.addressCity}, ${bookingDetails.addressState} ${bookingDetails.addressZip}`}</p>
              )}
              {bookingDetails.notes && (
                <p><strong>Special Instructions:</strong> {bookingDetails.notes}</p>
              )}

              <hr className="my-3" />
              <p>We've sent a confirmation email with your booking details. Please check your inbox (and spam folder).</p>
              <p>If you have any questions, please contact us at <a href='mailto:support@hmnp.com' className='text-[#002147] hover:underline'>support@hmnp.com</a>.</p>
            </div>
          )}
          {error && !bookingDetails && (
             <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="w-full sm:w-auto bg-[#002147] hover:bg-[#001a38]">
            <Link href="/">Go to Homepage</Link>
          </Button>
          {bookingId && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              {/* Link to a user's dashboard or specific booking view if available */}
              <Link href={`/dashboard/bookings?id=${bookingId}`}>View Booking Details</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
