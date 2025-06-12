// Tracking utilities for Houston Mobile Notary Pros
// Handles conversion tracking across Meta Pixel, Google Analytics, LinkedIn, and Yelp

declare global {
  interface Window {
    fbq: any;
    gtag: any;
    lintrk: any;
    dataLayer: any[];
  }
}

export interface TrackingEvent {
  eventName: string;
  value?: number;
  currency?: string;
  content_name?: string;
  custom_parameters?: Record<string, any>;
}

export interface LeadTrackingData {
  lead_source: string;
  service_type?: string;
  estimated_value?: number;
  campaign_name?: string;
  ad_platform?: string;
}

export interface BookingTrackingData {
  booking_id: string;
  service_type: string;
  booking_value: number;
  customer_type: 'new' | 'returning';
  payment_method?: string;
}

// Meta Pixel tracking functions
export const trackMetaEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (parameters) {
        window.fbq('track', eventName, parameters);
      } else {
        window.fbq('track', eventName);
      }
      console.log(`Meta Pixel: ${eventName} tracked`, parameters);
    } catch (error) {
      console.error('Meta Pixel tracking error:', error);
    }
  }
};

// Google Analytics tracking functions
export const trackGoogleEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, parameters);
      console.log(`Google Analytics: ${eventName} tracked`, parameters);
    } catch (error) {
      console.error('Google Analytics tracking error:', error);
    }
  }
};

// LinkedIn tracking functions
export const trackLinkedInEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.lintrk) {
    try {
      window.lintrk('track', { conversion_id: eventName, ...parameters });
      console.log(`LinkedIn: ${eventName} tracked`, parameters);
    } catch (error) {
      console.error('LinkedIn tracking error:', error);
    }
  }
};

// Yelp tracking functions (placeholder - will be updated when you get Yelp tracking ID)
export const trackYelpEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined') {
    try {
      // Yelp tracking implementation will be added here
      console.log(`Yelp tracking ready for: ${eventName}`, parameters);
    } catch (error) {
      console.error('Yelp tracking error:', error);
    }
  }
};

// Combined tracking functions for specific business events

/**
 * Track lead generation (form submissions)
 */
export const trackLead = (data: LeadTrackingData) => {
  const value = data.estimated_value || 75; // Default estimated value

  // Meta Pixel
  trackMetaEvent('Lead', {
    content_name: data.service_type,
    value: value,
    currency: 'USD',
    custom_parameters: {
      lead_source: data.lead_source,
      campaign_name: data.campaign_name,
      ad_platform: data.ad_platform
    }
  });

  // Google Analytics
  trackGoogleEvent('generate_lead', {
    event_category: 'engagement',
    event_label: data.lead_source,
    value: value,
    currency: 'USD',
    custom_parameters: {
      service_type: data.service_type,
      campaign_name: data.campaign_name
    }
  });

  // LinkedIn
  trackLinkedInEvent('lead', {
    value: value,
    currency: 'USD'
  });

  // Yelp
  trackYelpEvent('lead', data);
};

/**
 * Track booking confirmations (purchases)
 */
export const trackBookingConfirmation = (data: BookingTrackingData) => {
  // Meta Pixel
  trackMetaEvent('Purchase', {
    value: data.booking_value,
    currency: 'USD',
    content_name: data.service_type,
    custom_parameters: {
      booking_id: data.booking_id,
      customer_type: data.customer_type,
      payment_method: data.payment_method
    }
  });

  // Google Analytics
  trackGoogleEvent('purchase', {
    transaction_id: data.booking_id,
    value: data.booking_value,
    currency: 'USD',
    items: [{
      item_id: data.booking_id,
      item_name: data.service_type,
      category: 'notary_service',
      quantity: 1,
      price: data.booking_value
    }]
  });

  // LinkedIn
  trackLinkedInEvent('purchase', {
    value: data.booking_value,
    currency: 'USD'
  });

  // Yelp
  trackYelpEvent('purchase', data);
};

/**
 * Track phone number clicks
 */
export const trackPhoneClick = (source: string) => {
  trackMetaEvent('Contact');
  trackGoogleEvent('phone_call_click', {
    event_category: 'engagement',
    event_label: source
  });
  trackLinkedInEvent('contact');
  trackYelpEvent('phone_click', { source });
};

/**
 * Track service page views
 */
export const trackServiceView = (serviceName: string, serviceValue?: number) => {
  trackMetaEvent('ViewContent', {
    content_name: serviceName,
    value: serviceValue,
    currency: 'USD'
  });

  trackGoogleEvent('view_item', {
    event_category: 'engagement',
    event_label: serviceName,
    value: serviceValue,
    currency: 'USD'
  });

  trackLinkedInEvent('page_view', {
    content_name: serviceName
  });

  trackYelpEvent('service_view', { service_name: serviceName });
};

/**
 * Track appointment scheduling (before payment)
 */
export const trackAppointmentScheduled = (serviceType: string, estimatedValue: number) => {
  trackMetaEvent('Schedule', {
    content_name: serviceType,
    value: estimatedValue,
    currency: 'USD'
  });

  trackGoogleEvent('begin_checkout', {
    event_category: 'ecommerce',
    value: estimatedValue,
    currency: 'USD',
    items: [{
      item_name: serviceType,
      price: estimatedValue
    }]
  });

  trackLinkedInEvent('appointment_scheduled', {
    value: estimatedValue,
    currency: 'USD'
  });

  trackYelpEvent('appointment_scheduled', { 
    service_type: serviceType, 
    value: estimatedValue 
  });
};

/**
 * Track promo code usage
 */
export const trackPromoCodeUsed = (promoCode: string, discountAmount: number, serviceType: string) => {
  trackMetaEvent('PromoCodeUsed', {
    content_name: promoCode,
    value: discountAmount,
    currency: 'USD',
    custom_parameters: {
      service_type: serviceType
    }
  });

  trackGoogleEvent('coupon_used', {
    event_category: 'ecommerce',
    event_label: promoCode,
    value: discountAmount,
    currency: 'USD'
  });
};

// Utility function to safely call tracking (with error handling)
export const safeTrack = (trackingFunction: () => void, eventName: string) => {
  try {
    trackingFunction();
  } catch (error) {
    console.error(`Tracking error for ${eventName}:`, error);
    // Optionally send error to your error tracking service
  }
}; 