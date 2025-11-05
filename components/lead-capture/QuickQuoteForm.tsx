'use client';

/**
 * Quick Quote Form - Homepage Variant
 * Simple lead capture for cold traffic
 * Progressive enhancement with analytics
 */

import React, { useEffect } from 'react';
import { LeadCaptureCard } from './LeadCaptureCard';
import { LeadCaptureForm } from './LeadCaptureForm';
import { leadQuickQuoteViewed, leadQuickQuoteSubmitted } from '@/lib/analytics/lead-events';

interface QuickQuoteFormProps {
  className?: string;
}

export function QuickQuoteForm({ className = '' }: QuickQuoteFormProps) {
  // Track form view on mount
  useEffect(() => {
    leadQuickQuoteViewed({ 
      source_component: 'quick_quote_home',
      service_type: 'unknown'
    });
  }, []);
  
  const handleSuccess = (data: any) => {
    // Track lead submission with event_id for future server-side dedupe
    const eventId = leadQuickQuoteSubmitted({
      source_component: 'quick_quote_home',
      service_type: data.serviceType || 'unknown',
      name: data.name,
      email: data.email,
      phone: data.phone,
    });
    
    console.log('[QuickQuote] Lead submitted successfully:', { data, eventId });
  };
  
  const handleError = (error: string) => {
    console.error('[QuickQuote] Submission error:', error);
  };
  
  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <LeadCaptureCard
        title="Need a Quote First?"
        description="Get your personalized quote in 5 minutes. No commitment required."
        variant="blue"
      >
        <LeadCaptureForm
          source="quick_quote"
          onSuccess={handleSuccess}
          onError={handleError}
          submitButtonText="Get My Free Quote"
        />
      </LeadCaptureCard>
      
      {/* Trust Indicators */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>No obligation</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>5-minute response</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Transparent pricing</span>
        </div>
      </div>
    </div>
  );
}

