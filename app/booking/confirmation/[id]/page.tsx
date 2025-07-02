/**
 * 🎉 HMNP V2 Booking Confirmation Page
 * Beautiful confirmation experience that builds trust
 * Real-time status updates and next steps
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookingConfirmationView from '@/components/v2/BookingConfirmationView';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    payment_intent?: string;
    payment_intent_client_secret?: string;
    redirect_status?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Booking Confirmation | Houston Mobile Notary Pros`,
    description: 'Your notary service booking has been confirmed. View details and next steps.',
    robots: 'noindex, nofollow', // Private confirmation pages
  };
}

async function getBookingDetails(bookingId: string) {
  try {
    // In a real app, this would fetch from our API
    // For now, we'll use the API endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/v2/bookings/${bookingId}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data.booking : null;
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return null;
  }
}

export default async function BookingConfirmationPage({ params, searchParams }: PageProps) {
  const bookingId = params.id;
  
  // Validate booking ID format
  if (!bookingId || bookingId.length < 10) {
    notFound();
  }

  // Get booking details
  const booking = await getBookingDetails(bookingId);
  
  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <BookingConfirmationView 
        booking={booking}
        paymentIntent={searchParams.payment_intent}
        redirectStatus={searchParams.redirect_status}
      />
    </div>
  );
}