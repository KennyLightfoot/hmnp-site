'use client';

/**
 * Shared Lead Capture Form Logic
 * Progressive enhancement - works without JS
 * Used by QuickQuoteForm and InFlowQuoteCard
 */

import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getTrackingContext } from '@/lib/analytics/events';

interface LeadCaptureFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  source: 'quick_quote' | 'in_flow_quote' | 'contact_form';
  defaultData?: {
    name?: string;
    email?: string;
    phone?: string;
    serviceType?: string;
    message?: string;
  };
  submitButtonText?: string;
  className?: string;
}

export function LeadCaptureForm({
  onSuccess,
  onError,
  source,
  defaultData = {},
  submitButtonText = 'Get Your Quote',
  className = '',
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: defaultData.name || '',
    email: defaultData.email || '',
    phone: defaultData.phone || '',
    serviceType: defaultData.serviceType || '',
    message: defaultData.message || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate that at least email or phone is provided
    if (!formData.email && !formData.phone) {
      setSubmitStatus('error');
      setErrorMessage('Please provide either an email or phone number');
      onError?.('Please provide either an email or phone number');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      // Get attribution data with event_id
      const ctx = getTrackingContext();
      
      // Submit to API
      const response = await fetch('/api/submit-ad-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          event_id: ctx.event_id,
          utm_source: ctx.utm?.utm_source,
          utm_medium: ctx.utm?.utm_medium,
          utm_campaign: ctx.utm?.utm_campaign,
          utm_term: ctx.utm?.utm_term,
          utm_content: ctx.utm?.utm_content,
          device: ctx.device,
          page: ctx.path,
          referrer: ctx.ref,
          source,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit quote request');
      }
      
      // Success!
      setSubmitStatus('success');
      onSuccess?.(result.data);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          serviceType: '',
          message: '',
        });
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setSubmitStatus('error');
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Name Field */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name *
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="John Doe"
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>
      
      {/* Email Field */}
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email {!formData.phone && '*'}
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          className="mt-1"
          disabled={isSubmitting}
        />
      </div>
      
      {/* Phone Field */}
      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Phone {!formData.email && '*'}
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(713) 555-0123"
          className="mt-1"
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          Provide at least email or phone
        </p>
      </div>
      
      {/* Service Type (Optional) */}
      {source === 'quick_quote' && (
        <div>
          <Label htmlFor="serviceType" className="text-sm font-medium text-gray-700">
            Service Type (Optional)
          </Label>
          <Input
            id="serviceType"
            name="serviceType"
            type="text"
            value={formData.serviceType}
            onChange={handleChange}
            placeholder="e.g., Mobile Notary, Loan Signing"
            className="mt-1"
            disabled={isSubmitting}
          />
        </div>
      )}
      
      {/* Message (Optional) */}
      {source === 'quick_quote' && (
        <div>
          <Label htmlFor="message" className="text-sm font-medium text-gray-700">
            Additional Details (Optional)
          </Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about your notary needs..."
            className="mt-1"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      )}
      
      {/* Success Message */}
      {submitStatus === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Thanks! We'll text/email your quote within 5 minutes.
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
      
      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || submitStatus === 'success'}
        className="w-full bg-[#002147] hover:bg-[#001a38] text-white"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitStatus === 'success' ? 'Quote Request Sent!' : submitButtonText}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree to receive quote information via email/SMS
      </p>
    </form>
  );
}

