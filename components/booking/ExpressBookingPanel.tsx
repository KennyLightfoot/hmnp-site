'use client';

/**
 * Express Booking Panel - Ultra-simple lead capture
 * Houston Mobile Notary Pros
 * 
 * Fast path for users who want a quick callback or quote
 * Uses existing LeadForm infrastructure for consistency
 */

import React, { useState } from 'react';
import LeadForm from '@/components/lead-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { trackBookingFunnel } from '@/app/lib/analytics';

interface ExpressBookingPanelProps {
  onSuccess?: () => void;
  className?: string;
}

export default function ExpressBookingPanel({ 
  onSuccess,
  className = '' 
}: ExpressBookingPanelProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSuccess = (data: any) => {
    setSubmitted(true);
    trackBookingFunnel('express_booking_success', {
      path: 'express',
      leadId: data?.id || 'unknown'
    });
    onSuccess?.();
  };

  if (submitted) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            You're All Set!
          </h3>
          <p className="text-green-700 mb-4">
            We've received your request and will contact you shortly with available times and pricing.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              <Phone className="h-3 w-3 mr-1" />
              We'll call or text you
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Usually within 15 minutes
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 shadow-lg ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Express Booking</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Fast Track
          </Badge>
        </div>
        <CardDescription className="text-sm mt-2">
          Get a quick callback with available times and pricing. No need to pick a time slot right now.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>We'll call or text you within 15 minutes</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Get exact pricing and time options</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>No commitment - just get information</span>
          </div>
        </div>

        <LeadForm
          apiEndpoint="/api/submit-ad-lead"
          tags={['Source:BookingExpress', 'Intent:BookSoon', 'Path:Express']}
          submitButtonText="Request Call Back"
          formTitle=""
          formDescription=""
          onSuccess={handleSuccess}
          trackingOverrides={{
            lead_source: 'booking_express',
            service_type: 'general_notary',
            estimated_value: 75
          }}
        />
      </CardContent>
    </Card>
  );
}

