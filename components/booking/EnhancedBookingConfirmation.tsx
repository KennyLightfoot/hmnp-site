// components/booking/EnhancedBookingConfirmation.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar,
  User,
  FileText,
  CreditCard,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Download,
  Share2,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { sendRealTimeStatusUpdate, getBookingStatus } from '@/lib/notifications/real-time-status';
import { createSupportTicket } from '@/lib/customer-support/support-integration';
import { SafeDate } from '@/lib/utils/safe-date';

interface BookingConfirmationProps {
  booking: {
    id: string;
    bookingNumber: string;
    serviceName: string;
    scheduledDateTime: string;
    address: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    specialInstructions?: string;
    numberOfSigners: number;
    notaryName?: string;
  };
  onSupportRequest?: (ticketId: string) => void;
}

interface StatusUpdate {
  status: 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'delayed';
  timestamp: Date;
  message: string;
  notaryName?: string;
}

export default function EnhancedBookingConfirmation({ 
  booking, 
  onSupportRequest 
}: BookingConfirmationProps) {
  const [currentStatus, setCurrentStatus] = useState<StatusUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [supportRequested, setSupportRequested] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportIssue, setSupportIssue] = useState('');
  const [supportDescription, setSupportDescription] = useState('');

  // Status timeline configuration
  const statusTimeline = [
    { key: 'confirmed', label: 'Booking Confirmed', icon: CheckCircle, color: 'text-green-600' },
    { key: 'on_way', label: 'Notary En Route', icon: Clock, color: 'text-blue-600' },
    { key: 'arrived', label: 'Notary Arrived', icon: MapPin, color: 'text-purple-600' },
    { key: 'in_progress', label: 'Service in Progress', icon: FileText, color: 'text-orange-600' },
    { key: 'completed', label: 'Service Completed', icon: Star, color: 'text-green-600' }
  ];

  const currentStatusIndex = statusTimeline.findIndex(status => status.key === currentStatus?.status) + 1;
  const progressPercentage = (currentStatusIndex / statusTimeline.length) * 100;

  useEffect(() => {
    // Fetch current status on component mount
    fetchCurrentStatus();
    
    // Set up polling for status updates
    const interval = setInterval(fetchCurrentStatus, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [booking.id]);

  const fetchCurrentStatus = async () => {
    try {
      const status = await getBookingStatus(booking.id);
      if (status) {
        setCurrentStatus({
          status: status.status,
          timestamp: new Date(),
          message: getStatusMessage(status.status),
          notaryName: status.notaryName
        });
      }
    } catch (error) {
      console.error('Failed to fetch booking status:', error);
    }
  };

  const getStatusMessage = (status: string): string => {
    const messages = {
      confirmed: 'Your booking has been confirmed and is ready for service.',
      on_way: 'Your notary is on the way to your location.',
      arrived: 'Your notary has arrived at your location.',
      in_progress: 'Your notarization service is currently in progress.',
      completed: 'Your service has been completed successfully!',
      delayed: 'There is a slight delay with your appointment.'
    };
    return messages[status as keyof typeof messages] || 'Status update received.';
  };

  const handleSupportRequest = async () => {
    if (!supportIssue || !supportDescription) return;

    setIsLoading(true);
    try {
      const ticket = await createSupportTicket({
        bookingId: booking.id,
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        issueType: supportIssue as any,
        description: supportDescription,
        contactMethod: 'email'
      });

      setSupportRequested(true);
      setShowSupportForm(false);
      onSupportRequest?.(ticket.id);
    } catch (error) {
      console.error('Failed to create support ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    const event = {
      title: `Notary Appointment - ${booking.serviceName}`,
      description: `Notary service appointment with ${booking.notaryName || 'Houston Mobile Notary Pros'}`,
      location: booking.address,
      // Use SafeDate wrapper to avoid RangeError
      startTime: SafeDate.toISOString(booking.scheduledDateTime) ?? '',
      endTime: SafeDate.toISOString(new Date(new Date(booking.scheduledDateTime).getTime() + 60 * 60 * 1000)) ?? ''
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.startTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${event.endTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleDownloadConfirmation = () => {
    const confirmationData = {
      bookingNumber: booking.bookingNumber,
      serviceName: booking.serviceName,
      date: format(new Date(booking.scheduledDateTime), 'PPP'),
      time: format(new Date(booking.scheduledDateTime), 'p'),
      address: booking.address,
      customerName: booking.customerName,
      totalAmount: booking.totalAmount,
      status: booking.status
    };

    const blob = new Blob([JSON.stringify(confirmationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-confirmation-${booking.bookingNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Main Confirmation Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-900">
            Booking Confirmed!
          </CardTitle>
          <p className="text-green-700">
            Your appointment has been successfully scheduled
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Booking Details */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Booking #{booking.bookingNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>{booking.serviceName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{booking.numberOfSigners} signer(s)</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(booking.scheduledDateTime), 'PPP p')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{booking.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span>${booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center justify-between rounded-lg bg-white p-3">
            <span className="font-medium">Payment Status:</span>
            <Badge variant={booking.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
              {booking.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddToCalendar} variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
            <Button onClick={handleDownloadConfirmation} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Status Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Real-Time Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Service Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Status Timeline */}
          <div className="space-y-3">
            {statusTimeline.map((status, index) => {
              const isActive = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex - 1;
              const Icon = status.icon;
              
              return (
                <div key={status.key} className="flex items-center space-x-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${isActive ? status.color : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {status.label}
                    </div>
                    {isCurrent && currentStatus && (
                      <div className="text-sm text-gray-600">
                        {currentStatus.message}
                      </div>
                    )}
                  </div>
                  {isActive && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
              );
            })}
          </div>

          {/* Current Status Alert */}
          {currentStatus && (
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Current Status</span>
              </div>
              <p className="mt-1 text-sm text-blue-700">{currentStatus.message}</p>
              {currentStatus.notaryName && (
                <p className="mt-1 text-sm text-blue-700">
                  <strong>Notary:</strong> {currentStatus.notaryName}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showSupportForm && !supportRequested ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Have questions about your booking? Our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowSupportForm(true)} variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER || '832-617-4285'}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Us
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'support@houstonmobilenotarypros.com'}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Us
                  </a>
                </Button>
              </div>
            </div>
          ) : showSupportForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <select
                  value={supportIssue}
                  onChange={(e) => setSupportIssue(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select an issue type</option>
                  <option value="booking_question">Booking Question</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="reschedule_request">Reschedule Request</option>
                  <option value="cancellation_request">Cancellation Request</option>
                  <option value="service_issue">Service Issue</option>
                  <option value="general_inquiry">General Inquiry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={supportDescription}
                  onChange={(e) => setSupportDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Please describe your issue or question..."
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSupportRequest} 
                  disabled={isLoading || !supportIssue || !supportDescription}
                  size="sm"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button 
                  onClick={() => setShowSupportForm(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Support Request Submitted</span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                We've received your support request and will respond within 24 hours.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              <div>
                <h4 className="font-medium">What to Bring</h4>
                <p className="text-sm text-gray-600">
                  Valid government-issued photo ID for all signers and all documents to be notarized.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              <div>
                <h4 className="font-medium">Cancellation Policy</h4>
                <p className="text-sm text-gray-600">
                  Free cancellation up to 24 hours before your appointment. Late cancellations may incur a fee.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              <div>
                <h4 className="font-medium">Contact Information</h4>
                <p className="text-sm text-gray-600">
                  Phone: (832) 617-4285 | Email: support@houstonmobilenotarypros.com
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 