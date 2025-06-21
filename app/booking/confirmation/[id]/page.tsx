"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface BookingDetails {
  id: string;
  reference: string;
  status: string;
  service: {
    name: string;
    duration: number;
  };
  scheduledDateTime: string;
  customer: {
    name: string;
    email: string;
  };
  location: {
    type: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    } | null;
  };
  pricing: {
    finalPrice: number;
    depositAmount: number;
    depositStatus: string;
  };
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const bookingId = params?.id as string;
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      
      if (data.success) {
        setBooking(data.booking);
      } else {
        setError('Booking not found');
      }
    } catch (error) {
      setError('Failed to load booking details');
      console.error('Error fetching booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PAYMENT_PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Your booking is confirmed! We will contact you 24 hours before your appointment.';
      case 'PAYMENT_PENDING':
        return 'Your booking is pending payment. Please complete payment to confirm your appointment.';
      case 'SCHEDULED':
        return 'Your booking is scheduled. We will send you a confirmation email soon.';
      default:
        return 'Your booking has been submitted successfully.';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A52A2A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Booking Not Found</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link 
            href="/booking" 
            className="bg-[#A52A2A] text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Make a New Booking
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002147] to-[#A52A2A] text-white p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-lg opacity-90">Reference: {booking.reference}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.replace(/_/g, ' ')}
            </div>
            <p className="text-gray-600 mt-2">{getStatusMessage(booking.status)}</p>
          </div>

          {/* Booking Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{booking.service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{formatDateTime(booking.scheduledDateTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{booking.service.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">
                    {booking.location.type.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
                {booking.location.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right">
                      {booking.location.address.street}<br />
                      {booking.location.address.city}, {booking.location.address.state} {booking.location.address.zip}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{booking.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{booking.customer.email}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Pricing</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">${booking.pricing.finalPrice}</span>
                </div>
                {booking.pricing.depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="font-medium">
                      ${booking.pricing.depositAmount} 
                      <span className={`ml-2 text-sm ${
                        booking.pricing.depositStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        ({booking.pricing.depositStatus.toLowerCase()})
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Action */}
          {booking.status === 'PAYMENT_PENDING' && (
            <div className="mt-8 text-center">
              <Link
                href={`/payment/${booking.id}`}
                className="bg-[#A52A2A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 inline-block"
              >
                Complete Payment
              </Link>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What Happens Next?</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• You will receive a confirmation email with all details</li>
              <li>• We will send you a reminder 24 hours before your appointment</li>
              <li>• Our notary will contact you on the day of service</li>
              <li>• Please have your documents and valid ID ready</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="mt-6 text-center text-gray-600">
            <p className="mb-2">Questions about your booking?</p>
            <p>Call us at <a href="tel:+17132345678" className="text-[#A52A2A] font-medium">(713) 234-5678</a></p>
            <p>Or email <a href="mailto:info@houstonmobilenotarypros.com" className="text-[#A52A2A] font-medium">info@houstonmobilenotarypros.com</a></p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/booking"
              className="border border-[#A52A2A] text-[#A52A2A] px-6 py-2 rounded hover:bg-red-50"
            >
              Book Another Service
            </Link>
            <Link
              href="/"
              className="bg-[#A52A2A] text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 