'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface BookingPaymentData {
  id: string;
  status: string;
  totalAmount?: number;
  depositAmount?: number;
  customerEmail?: string;
  service?: { name: string };
  finalPrice?: number;
  Service?: { 
    name: string;
    depositAmount?: { toNumber?: () => number } | number;
    requiresDeposit?: boolean;
  };
}

interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
  success: boolean;
  error?: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<BookingPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingCheckout, setCreatingCheckout] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError('Invalid booking ID');
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      console.log('Fetching booking data for ID:', bookingId);
      
      const response = await fetch(`/api/bookings/${bookingId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(`Failed to fetch booking: ${response.status}`);
      }

      const data = await response.json();
      console.log('Booking data received:', data);
      
      setBooking(data.booking || data);
      
      // Check if booking is already confirmed or scheduled
      const status = (data.booking || data).status;
      if (status === 'CONFIRMED' || status === 'SCHEDULED') {
        console.log('Booking already confirmed, redirecting to confirmation page');
        router.push(`/booking/confirmation/${bookingId}`);
        return;
      }
      
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async () => {
    if (!booking) return;
    
    setCreatingCheckout(true);
    
    try {
      console.log('Creating checkout session for booking:', booking.id);
      
      // Calculate payment amount
      const amount = calculatePaymentAmount(booking);
      console.log('Payment amount calculated:', amount);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: amount,
          mode: 'payment'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data: CheckoutSessionResponse = await response.json();
      console.log('Checkout session created:', data);
      
      if (data.success && data.checkoutUrl) {
        console.log('Redirecting to Stripe checkout:', data.checkoutUrl);
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
    } catch (err) {
      console.error('Error creating checkout session:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setCreatingCheckout(false);
    }
  };

  const calculatePaymentAmount = (booking: BookingPaymentData): number => {
    // Try multiple ways to get the payment amount
    if (booking.depositAmount && typeof booking.depositAmount === 'number') {
      return booking.depositAmount;
    }
    
    if (booking.Service?.depositAmount) {
      if (typeof booking.Service.depositAmount === 'number') {
        return booking.Service.depositAmount;
      }
      if (booking.Service.depositAmount.toNumber) {
        return booking.Service.depositAmount.toNumber();
      }
    }
    
    if (booking.finalPrice && typeof booking.finalPrice === 'number') {
      // If requires deposit, take 50% of final price
      if (booking.Service?.requiresDeposit) {
        return Math.round(booking.finalPrice * 0.5);
      }
      return booking.finalPrice;
    }
    
    if (booking.totalAmount && typeof booking.totalAmount === 'number') {
      return booking.totalAmount;
    }
    
    // Fallback to a default deposit amount
    console.warn('Unable to determine payment amount, using fallback');
    return 50; // $50 default deposit
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002147] mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payment Information</h2>
            <p className="text-gray-600">Please wait while we retrieve your booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/booking')}
              className="w-full bg-[#002147] text-white py-2 px-4 rounded-md hover:bg-[#003366] transition-colors"
            >
              Return to Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/booking')}
              className="w-full bg-[#002147] text-white py-2 px-4 rounded-md hover:bg-[#003366] transition-colors"
            >
              Create New Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  const paymentAmount = calculatePaymentAmount(booking);
  const serviceName = booking.Service?.name || booking.service?.name || 'Notary Service';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#002147] px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Complete Your Payment</h1>
            <p className="text-blue-100 mt-1">Booking ID: {booking.id}</p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Service Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900">{serviceName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {booking.status}
                  </span>
                </div>
                {booking.customerEmail && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{booking.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Due:</span>
                  <span className="text-2xl font-bold text-[#002147]">
                    ${paymentAmount.toFixed(2)}
                  </span>
                </div>
                {booking.Service?.requiresDeposit && (
                  <p className="text-sm text-gray-600 mt-2">
                    This is a deposit payment. The remaining balance will be due at the time of service.
                  </p>
                )}
              </div>
            </div>

            {/* Payment Status Check */}
            {booking.status === 'PAYMENT_PENDING' && (
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Payment Required
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700">
                        <p>Your booking is confirmed but requires payment to be completed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <div className="space-y-4">
              <button
                onClick={createCheckoutSession}
                disabled={creatingCheckout}
                className="w-full bg-[#002147] text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-[#003366] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {creatingCheckout ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ${paymentAmount.toFixed(2)} Now
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Secure payment powered by Stripe
                </p>
                <div className="flex justify-center items-center mt-2">
                  <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-500">SSL Encrypted</span>
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600">
                If you're experiencing issues with payment, please contact our support team at{' '}
                <a href="tel:+1234567890" className="text-[#002147] hover:underline">
                  (123) 456-7890
                </a>{' '}
                or email{' '}
                <a href="mailto:support@example.com" className="text-[#002147] hover:underline">
                  support@example.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}