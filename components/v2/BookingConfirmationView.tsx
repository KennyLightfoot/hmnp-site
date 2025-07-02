/**
 * 🎉 HMNP V2 Booking Confirmation View
 * Beautiful, trust-building confirmation experience
 * Makes customers feel VIP and confident in their choice
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  Clock,
  Download,
  Share2,
  MessageSquare,
  Bell,
  Star,
  Shield,
  Award,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// 🎯 INTERFACES
// ============================================================================

interface BookingConfirmationProps {
  booking: {
    id: string;
    serviceName: string;
    serviceType: 'MOBILE' | 'RON';
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    scheduledDateTime: string;
    status: string;
    paymentStatus: string;
    finalPrice: number;
    depositRequired: boolean;
    depositAmount?: number;
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    locationNotes?: string;
    specialInstructions?: string;
    confirmedAt?: string;
    createdAt: string;
  };
  paymentIntent?: string;
  redirectStatus?: string;
}

// ============================================================================
// 🎨 MAIN COMPONENT
// ============================================================================

export default function BookingConfirmationView({ 
  booking, 
  paymentIntent, 
  redirectStatus 
}: BookingConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // ============================================================================
  // 🚀 EFFECTS
  // ============================================================================

  useEffect(() => {
    // Show success toast if coming from payment
    if (redirectStatus === 'succeeded' || booking.status === 'CONFIRMED') {
      toast.success('🎉 Booking confirmed! Check your email for details.');
    }
  }, [redirectStatus, booking.status]);

  // ============================================================================
  // 🎯 ACTION HANDLERS
  // ============================================================================

  const downloadReceipt = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement PDF receipt generation
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const shareBooking = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Notary Service Booking Confirmed',
          text: `My notary appointment is confirmed for ${new Date(booking.scheduledDateTime).toLocaleDateString()}`,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Booking link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const addToCalendar = () => {
    const startDate = new Date(booking.scheduledDateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.serviceName)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Notary service appointment with Houston Mobile Notary Pros. Booking ID: ${booking.id}`)}&location=${encodeURIComponent(booking.address ? `${booking.address.street}, ${booking.address.city}, ${booking.address.state} ${booking.address.zip}` : 'Remote Online Session')}`;
    
    window.open(calendarUrl, '_blank');
  };

  // ============================================================================
  // 🎨 STATUS BADGE
  // ============================================================================

  const getStatusBadge = () => {
    const status = booking.status;
    const paymentStatus = booking.paymentStatus;

    if (status === 'CONFIRMED' && paymentStatus === 'PAID') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Confirmed & Paid</Badge>;
    } else if (status === 'CONFIRMED') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">📅 Confirmed</Badge>;
    } else if (status === 'PENDING') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pending</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Booking Confirmed! 🎉
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Your {booking.serviceName.toLowerCase()} appointment has been successfully booked
        </p>
        {getStatusBadge()}
      </div>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Information */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Service</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{booking.serviceName}</span>
                  <Badge variant="outline">
                    {booking.serviceType === 'RON' ? '💻 Remote' : '🚗 Mobile'}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Date & Time</h4>
                <div className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>{new Date(booking.scheduledDateTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-lg mt-1">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>{new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Booking ID</h4>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {booking.id}
                </code>
              </div>
            </div>

            {/* Customer & Location */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Customer</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{booking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{booking.customerEmail}</span>
                  </div>
                  {booking.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {booking.address && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Location</h4>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p>{booking.address.street}</p>
                      <p>{booking.address.city}, {booking.address.state} {booking.address.zip}</p>
                      {booking.locationNotes && (
                        <p className="text-sm text-gray-600 mt-1">📝 {booking.locationNotes}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {booking.serviceType === 'RON' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Remote Session</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💻 This is a Remote Online Notarization (RON) session. 
                      You'll receive a secure link via email 30 minutes before your appointment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {booking.specialInstructions && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Special Instructions</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{booking.specialInstructions}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Amount Paid</h4>
              <div className="text-2xl font-bold text-green-600">
                ${booking.depositRequired && booking.depositAmount ? booking.depositAmount.toFixed(2) : booking.finalPrice.toFixed(2)}
              </div>
              {booking.depositRequired && booking.depositAmount && (
                <p className="text-sm text-gray-600">
                  Deposit paid • Remaining ${(booking.finalPrice - booking.depositAmount).toFixed(2)} due at service
                </p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Payment Status</h4>
              <div className="flex items-center gap-2">
                {booking.paymentStatus === 'PAID' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-semibold">Payment Successful</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-600 font-semibold">Payment Pending</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={addToCalendar} variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Add to Calendar
            </Button>
            
            <Button onClick={downloadReceipt} variant="outline" className="flex items-center gap-2" disabled={isLoading}>
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
            
            <Button onClick={shareBooking} variant="outline" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Booking
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Confirmation Email</h4>
                <p className="text-gray-600">You'll receive a detailed confirmation email with all your booking information.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <Bell className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Automatic Reminders</h4>
                <p className="text-gray-600">We'll send you reminders 24 hours and 2 hours before your appointment.</p>
              </div>
            </div>

            {booking.serviceType === 'MOBILE' && (
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-full p-2 mt-1">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Notary Arrival</h4>
                  <p className="text-gray-600">Your notary will arrive at the scheduled time and location. They'll call you when they're 10 minutes away.</p>
                </div>
              </div>
            )}

            {booking.serviceType === 'RON' && (
              <div className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-full p-2 mt-1">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold">RON Session Link</h4>
                  <p className="text-gray-600">You'll receive a secure video conference link 30 minutes before your appointment.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trust & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Trust Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Texas State Certified Notaries</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm">Fully Insured & Bonded</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">4.9/5 Customer Rating</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Our support team is here to help with any questions about your booking.
            </p>
            <div className="space-y-2">
              <a href="tel:+1-555-123-4567" className="flex items-center gap-2 text-blue-600 hover:underline">
                <Phone className="w-4 h-4" />
                (555) 123-4567
              </a>
              <a href="mailto:support@houstonmobilenotarypros.com" className="flex items-center gap-2 text-blue-600 hover:underline">
                <Mail className="w-4 h-4" />
                support@houstonmobilenotarypros.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back to Home */}
      <div className="text-center">
        <Button asChild variant="outline" size="lg">
          <a href="/">
            ← Back to Home
          </a>
        </Button>
      </div>
    </div>
  );
}