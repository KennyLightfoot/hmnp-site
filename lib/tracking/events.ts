/**
 * Analytics Event Tracking
 * GA4 + Meta Pixel Integration
 * 
 * Provides centralized tracking for all user interactions
 * with proper attribution and device context
 */

interface TrackingContext {
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  page?: string;
  [key: string]: any;
}

/**
 * Get device type from window
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get UTM parameters from URL
 */
function getUTMParams(): Partial<TrackingContext> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

/**
 * Get full tracking context
 */
function getTrackingContext(additionalData: TrackingContext = {}): TrackingContext {
  return {
    device: getDeviceType(),
    page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    ...getUTMParams(),
    ...additionalData,
    timestamp: new Date().toISOString(),
  };
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
    
    // Also push to dataLayer for GTM
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
 * Track page view
 */
export function trackPageView(url?: string) {
  const context = getTrackingContext({ page: url });
  
  sendToGA4('page_view', context);
  sendToMetaPixel('PageView', context);
}

/**
 * Track button click
 */
export function trackButtonClick(buttonName: string, additionalData: TrackingContext = {}) {
  const context = getTrackingContext({
    button_name: buttonName,
    ...additionalData,
  });
  
  sendToGA4('button_click', context);
}

/**
 * Track form view
 */
export function trackFormView(formName: string, additionalData: TrackingContext = {}) {
  const context = getTrackingContext({
    form_name: formName,
    ...additionalData,
  });
  
  sendToGA4('form_view', context);
}

/**
 * Track form submission start
 */
export function trackFormStart(formName: string, additionalData: TrackingContext = {}) {
  const context = getTrackingContext({
    form_name: formName,
    ...additionalData,
  });
  
  sendToGA4('form_start', context);
  sendToMetaPixel('InitiateCheckout', { content_name: formName });
}

/**
 * Track form submission success
 */
export function trackFormSubmit(formName: string, additionalData: TrackingContext = {}) {
  const context = getTrackingContext({
    form_name: formName,
    ...additionalData,
  });
  
  sendToGA4('form_submit', context);
}

/**
 * Track CTA click
 */
export function trackCTAClick(ctaLocation: string, ctaText: string, additionalData: TrackingContext = {}) {
  const context = getTrackingContext({
    cta_location: ctaLocation,
    cta_text: ctaText,
    ...additionalData,
  });
  
  sendToGA4('cta_click', context);
}

/**
 * Track phone call
 */
export function trackPhoneCall(source: string, additionalData: TrackingContext = {}) {
  const context = getTrackingContext({
    source,
    ...additionalData,
  });
  
  sendToGA4('phone_call', context);
  sendToMetaPixel('Contact', { content_name: 'phone_call', source });
}

/**
 * Track error
 */
export function trackError(errorType: string, errorMessage: string, additionalData: TrackingContext = {}) {
  const context = getTrackingContext({
    error_type: errorType,
    error_message: errorMessage,
    ...additionalData,
  });
  
  sendToGA4('error', context);
}

/**
 * Export context getters for use in other tracking modules
 */
export { getTrackingContext, getDeviceType, getUTMParams };

