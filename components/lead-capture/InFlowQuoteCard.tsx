'use client';

/**
 * In-Flow Quote Card - Booking Flow Variant
 * Captures leads mid-booking before they complete full form
 * Uses partial booking data already entered
 */

import React, { useState, useEffect, useRef } from 'react';
import { LeadCaptureCard } from './LeadCaptureCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { leadInflowRequested } from '@/lib/analytics/lead-events';
import { getTrackingContext } from '@/lib/analytics/events';

interface InFlowQuoteCardProps {
  bookingData: {
    name?: string;
    email?: string;
    phone?: string;
    serviceType?: string;
    currentStep?: number;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  };
  className?: string;
}

export function InFlowQuoteCard({ bookingData, className = '' }: InFlowQuoteCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  
  // Track impression via IntersectionObserver (only when ~50% visible for ≥ 750ms)
  useEffect(() => {
    if (!cardRef.current || hasTrackedView) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Card is 50%+ visible, wait 750ms before tracking
            timeoutId = setTimeout(() => {
              if (!hasTrackedView) {
                leadInflowRequested({
                  source_component: 'inflow_quote_card',
                  service_type: bookingData.serviceType as any || 'unknown',
                  partial_fields: Object.keys(bookingData).filter(k => bookingData[k as keyof typeof bookingData]),
                });
                setHasTrackedView(true);
              }
            }, 750);
          } else {
            // Card moved out of view, cancel pending tracking
            if (timeoutId) clearTimeout(timeoutId);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(cardRef.current);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [bookingData, hasTrackedView]);
  
  const handleQuoteRequest = async () => {
    // Track the submit action with event_id
    const eventId = leadInflowRequested({
      source_component: 'inflow_quote_card',
      service_type: bookingData.serviceType as any || 'unknown',
      partial_fields: Object.keys(bookingData).filter(k => bookingData[k as keyof typeof bookingData]),
    });
    
    // Validate we have contact info
    if (!bookingData.email && !bookingData.phone) {
      setSubmitStatus('error');
      setErrorMessage('Please provide your email or phone number in the form above first');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      // Get attribution data
      const ctx = getTrackingContext();
      
      // Submit partial booking data as a quote request
      const response = await fetch('/api/submit-ad-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: bookingData.name || 'Booking in progress',
          email: bookingData.email,
          phone: bookingData.phone,
          serviceType: bookingData.serviceType,
          message: `Quote requested mid-booking (Step ${bookingData.currentStep}). Location: ${bookingData.location?.address || 'Not provided yet'}`,
          event_id: eventId,
          utm_source: ctx.utm?.utm_source,
          utm_medium: ctx.utm?.utm_medium,
          utm_campaign: ctx.utm?.utm_campaign,
          device: ctx.device,
          page: ctx.path,
          referrer: ctx.ref,
          source: 'in_flow_quote',
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit quote request');
      }
      
      // Success!
      setSubmitStatus('success');
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setSubmitStatus('error');
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Don't show if we don't have contact info yet
  if (!bookingData.email && !bookingData.phone) {
    return null;
  }
  
  return (
    <div className={className} ref={cardRef}>
      <LeadCaptureCard
        title="Need a Quote Before You Finish?"
        description="We'll text/email your estimate based on what you've entered so far. You can continue booking or wait for our response."
        variant="blue"
      >
        <div className="space-y-4">
          {/* Summary of what we have */}
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Contact:</strong> {bookingData.email || bookingData.phone}</p>
            {bookingData.serviceType && (
              <p><strong>Service:</strong> {bookingData.serviceType}</p>
            )}
            {bookingData.location?.address && (
              <p><strong>Location:</strong> {bookingData.location.address}</p>
            )}
          </div>
          
          {/* Success Message */}
          {submitStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Quote request sent! We'll contact you at {bookingData.email || bookingData.phone} within 5 minutes. 
                Feel free to continue booking or wait for our response.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Error Message */}
          {submitStatus === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Request Button */}
          {submitStatus !== 'success' && (
            <Button
              onClick={handleQuoteRequest}
              disabled={isSubmitting}
              className="w-full bg-[#A52A2A] hover:bg-[#8B0000] text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Quote Now
            </Button>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            You can continue booking afterward - we save your progress
          </p>
        </div>
      </LeadCaptureCard>
    </div>
  );
}

