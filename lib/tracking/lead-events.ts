/**
 * Lead-Specific Tracking Events
 * Focused on lead generation and conversion metrics
 */

import { getTrackingContext, getDeviceType, getUTMParams } from './events';

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  serviceType?: string;
  source?: string;
  [key: string]: any;
}

/**
 * Send event to Google Analytics 4
 */
function sendToGA4(eventName: string, eventData: any = {}) {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('event', eventName, eventData);
    }
    
    // @ts-ignore
    if (window.dataLayer) {
      // @ts-ignore
      window.dataLayer.push({
        event: eventName,
        ...eventData,
      });
    }
  } catch (error) {
    console.error('GA4 tracking error:', error);
  }
}

/**
 * Send event to Meta Pixel
 */
function sendToMetaPixel(eventName: string, eventData: any = {}) {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore
    if (window.fbq) {
      // @ts-ignore
      window.fbq('track', eventName, eventData);
    }
  } catch (error) {
    console.error('Meta Pixel tracking error:', error);
  }
}

/**
 * Track quick quote form view
 */
export function trackQuickQuoteView(location: 'homepage' | 'modal' | 'other' = 'homepage') {
  const context = getTrackingContext({
    form_type: 'quick_quote',
    form_location: location,
  });
  
  sendToGA4('quick_quote_view', context);
  
  console.log('[Analytics] Quick quote form viewed', context);
}

/**
 * Track quick quote form interaction
 */
export function trackQuickQuoteClick(location: 'homepage' | 'modal' | 'other' = 'homepage') {
  const context = getTrackingContext({
    form_type: 'quick_quote',
    form_location: location,
    interaction: 'click',
  });
  
  sendToGA4('quick_quote_click', context);
  sendToMetaPixel('InitiateCheckout', { content_name: 'quick_quote' });
  
  console.log('[Analytics] Quick quote form clicked', context);
}

/**
 * Track lead submission (from quick quote or in-flow)
 */
export function trackLeadSubmit(source: 'quick_quote' | 'in_flow_quote' | 'contact_form', leadData: LeadData) {
  const context = getTrackingContext({
    lead_source: source,
    has_email: !!leadData.email,
    has_phone: !!leadData.phone,
    service_type: leadData.serviceType,
    ...leadData,
  });
  
  // Remove PII before sending to analytics
  const sanitized = {
    ...context,
    name: undefined,
    email: undefined,
    phone: undefined,
  };
  
  sendToGA4('lead_submit', sanitized);
  sendToMetaPixel('Lead', {
    content_name: source,
    source: context.utm_source || 'direct',
    value: 75, // Approximate lead value
    currency: 'USD',
  });
  
  console.log('[Analytics] Lead submitted', { source, sanitized });
}

/**
 * Track in-flow quote request (mid-booking)
 */
export function trackInFlowQuoteRequest(bookingContext: any = {}) {
  const context = getTrackingContext({
    quote_type: 'in_flow',
    booking_step: bookingContext.currentStep,
    service_type: bookingContext.serviceType,
    has_location: !!bookingContext.location?.address,
  });
  
  sendToGA4('in_flow_quote_request', context);
  sendToMetaPixel('Lead', {
    content_name: 'in_flow_quote',
    source: context.utm_source || 'booking_flow',
  });
  
  console.log('[Analytics] In-flow quote requested', context);
}

/**
 * Track booking form abandonment
 */
export function trackBookingAbandonment(step: number, stepName: string, reason?: string) {
  const context = getTrackingContext({
    form_type: 'booking',
    abandoned_step: step,
    step_name: stepName,
    abandonment_reason: reason,
  });
  
  sendToGA4('booking_abandonment', context);
  
  console.log('[Analytics] Booking abandoned', context);
}

/**
 * Track pricing calculator interaction
 */
export function trackPricingCalculator(action: 'view' | 'calculate' | 'change', details: any = {}) {
  const context = getTrackingContext({
    calculator_action: action,
    ...details,
  });
  
  sendToGA4('pricing_calculator', context);
  
  console.log('[Analytics] Pricing calculator', { action, context });
}

/**
 * Track location skip (for attribution)
 */
export function trackLocationSkipped(reason: 'browsing' | 'quote_request' | 'other') {
  const context = getTrackingContext({
    skip_reason: reason,
    booking_step: 'location',
  });
  
  sendToGA4('location_step_skipped', context);
  
  console.log('[Analytics] Location step skipped', context);
}

/**
 * Track availability widget view
 */
export function trackAvailabilityView(slotsAvailable: number | null, source: 'live' | 'cached' | 'error') {
  const context = getTrackingContext({
    slots_available: slotsAvailable,
    data_source: source,
  });
  
  sendToGA4('availability_view', context);
  
  console.log('[Analytics] Availability viewed', context);
}

/**
 * Track mobile CTA interaction
 */
export function trackMobileCTA(action: 'book' | 'call', location: string) {
  const context = getTrackingContext({
    cta_action: action,
    cta_location: location,
    is_mobile: getDeviceType() === 'mobile',
  });
  
  sendToGA4('mobile_cta_click', context);
  
  if (action === 'call') {
    sendToMetaPixel('Contact', { content_name: 'mobile_call_cta' });
  }
  
  console.log('[Analytics] Mobile CTA clicked', context);
}

/**
 * Get lead attribution data for server-side use
 */
export function getLeadAttributionData(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  device: string;
  page?: string;
  referrer?: string;
} {
  const utm = getUTMParams();
  const device = getDeviceType();
  
  return {
    ...utm,
    device,
    page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
  };
}

