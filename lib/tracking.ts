// Tracking utilities for Houston Mobile Notary Pros
// Handles conversion tracking across Meta Pixel, Google Analytics, LinkedIn, and Yelp

declare global {
  interface Window {
    fbq: any;
    gtag: any;
    lintrk: any;
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
  service_type: string;
  estimated_value?: number;
  campaign_name?: string;
  ad_platform?: string;
}

export interface BookingTrackingData {
  booking_id: string;
  service_type: string;
  booking_value: number;
  customer_type: string;
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

// 🚀 NEW SOP-SPECIFIC TRACKING EVENTS

/**
 * Track RON completion - SOP Event: ron_completed
 */
export const trackRONCompleted = (data: {
  session_id: string;
  service_value: number;
  signer_count: number;
  document_type: string;
  completion_time_minutes?: number;
}) => {
  // Meta Pixel
  trackMetaEvent('Purchase', {
    content_name: 'Remote Online Notarization',
    value: data.service_value,
    currency: 'USD',
    custom_parameters: {
      session_id: data.session_id,
      signer_count: data.signer_count,
      document_type: data.document_type
    }
  });

  // Google Analytics - SOP Event
  trackGoogleEvent('ron_completed', {
    event_category: 'notary_services',
    event_label: data.document_type,
    value: data.service_value,
    currency: 'USD',
    custom_parameters: {
      session_id: data.session_id,
      signer_count: data.signer_count,
      completion_time: data.completion_time_minutes || 0
    }
  });

  // LinkedIn
  trackLinkedInEvent('purchase', {
    value: data.service_value,
    currency: 'USD'
  });

  // Yelp
  trackYelpEvent('ron_completed', data);
};

/**
 * Track quote requests - SOP Event: quote_requested
 */
export const trackQuoteRequested = (data: {
  service_type: string;
  estimated_value: number;
  lead_source: string;
  location?: string;
  urgency_level?: 'standard' | 'same-day' | 'emergency';
}) => {
  // Meta Pixel
  trackMetaEvent('Lead', {
    content_name: data.service_type,
    value: data.estimated_value,
    currency: 'USD',
    custom_parameters: {
      lead_source: data.lead_source,
      urgency_level: data.urgency_level || 'standard'
    }
  });

  // Google Analytics - SOP Event
  trackGoogleEvent('quote_requested', {
    event_category: 'lead_generation',
    event_label: data.service_type,
    value: data.estimated_value,
    currency: 'USD',
    custom_parameters: {
      lead_source: data.lead_source,
      location: data.location,
      urgency_level: data.urgency_level || 'standard'
    }
  });

  // LinkedIn
  trackLinkedInEvent('lead', {
    value: data.estimated_value,
    currency: 'USD'
  });

  // Yelp
  trackYelpEvent('quote_requested', data);
};

/**
 * Track loan signing bookings - SOP Event: loan_signing_booked
 */
export const trackLoanSigningBooked = (data: {
  booking_id: string;
  booking_value: number;
  loan_type: string;
  title_company?: string;
  signer_count: number;
  rush_service?: boolean;
  scan_back_requested?: boolean;
}) => {
  // Meta Pixel
  trackMetaEvent('Purchase', {
    content_name: 'Loan Signing Specialist',
    value: data.booking_value,
    currency: 'USD',
    custom_parameters: {
      booking_id: data.booking_id,
      loan_type: data.loan_type,
      title_company: data.title_company,
      rush_service: data.rush_service || false
    }
  });

  // Google Analytics - SOP Event
  trackGoogleEvent('loan_signing_booked', {
    event_category: 'loan_signing',
    event_label: data.loan_type,
    value: data.booking_value,
    currency: 'USD',
    custom_parameters: {
      booking_id: data.booking_id,
      signer_count: data.signer_count,
      rush_service: data.rush_service || false,
      scan_back_requested: data.scan_back_requested || false
    }
  });

  // LinkedIn
  trackLinkedInEvent('purchase', {
    value: data.booking_value,
    currency: 'USD'
  });

  // Yelp
  trackYelpEvent('loan_signing_booked', data);
};

/**
 * Track business subscription signups - NEW SOP Event
 */
export const trackBusinessSubscriptionSignup = (data: {
  subscription_tier: 'essentials' | 'growth';
  monthly_value: number;
  company_name: string;
  employee_count?: number;
}) => {
  const tierNames = {
    essentials: 'Business Subscription - Essentials',
    growth: 'Business Subscription - Growth'
  };

  // Meta Pixel
  trackMetaEvent('Subscribe', {
    content_name: tierNames[data.subscription_tier],
    value: data.monthly_value,
    currency: 'USD',
    custom_parameters: {
      subscription_tier: data.subscription_tier,
      company_name: data.company_name
    }
  });

  // Google Analytics - SOP Event
  trackGoogleEvent('business_subscription_signup', {
    event_category: 'subscription',
    event_label: data.subscription_tier,
    value: data.monthly_value,
    currency: 'USD',
    custom_parameters: {
      company_name: data.company_name,
      employee_count: data.employee_count || 0
    }
  });

  // LinkedIn
  trackLinkedInEvent('subscribe', {
    value: data.monthly_value,
    currency: 'USD'
  });

  // Yelp
  trackYelpEvent('business_subscription_signup', data);
};

/**
 * Track same-day service requests - NEW SOP Event
 */
export const trackSameDayServiceRequested = (data: {
  service_type: string;
  base_value: number;
  surcharge_applied: number;
  request_time: string;
  urgency_reason?: string;
}) => {
  // Meta Pixel
  trackMetaEvent('Lead', {
    content_name: `Same-Day ${data.service_type}`,
    value: data.base_value + data.surcharge_applied,
    currency: 'USD',
    custom_parameters: {
      surcharge_applied: data.surcharge_applied,
      urgency_reason: data.urgency_reason
    }
  });

  // Google Analytics - SOP Event
  trackGoogleEvent('same_day_service_requested', {
    event_category: 'urgent_service',
    event_label: data.service_type,
    value: data.base_value + data.surcharge_applied,
    currency: 'USD',
    custom_parameters: {
      base_value: data.base_value,
      surcharge_applied: data.surcharge_applied,
      request_time: data.request_time
    }
  });

  // LinkedIn
  trackLinkedInEvent('lead', {
    value: data.base_value + data.surcharge_applied,
    currency: 'USD'
  });

  // Yelp
  trackYelpEvent('same_day_service_requested', data);
};

/**
 * Track after-hours service requests - NEW SOP Event
 */
export const trackAfterHoursServiceRequested = (data: {
  service_type: string;
  base_value: number;
  after_hours_fee: number;
  requested_time: string;
}) => {
  // Meta Pixel
  trackMetaEvent('Lead', {
    content_name: `After-Hours ${data.service_type}`,
    value: data.base_value + data.after_hours_fee,
    currency: 'USD',
    custom_parameters: {
      after_hours_fee: data.after_hours_fee,
      requested_time: data.requested_time
    }
  });

  // Google Analytics - SOP Event
  trackGoogleEvent('after_hours_service_requested', {
    event_category: 'premium_service',
    event_label: data.service_type,
    value: data.base_value + data.after_hours_fee,
    currency: 'USD',
    custom_parameters: {
      base_value: data.base_value,
      after_hours_fee: data.after_hours_fee,
      requested_time: data.requested_time
    }
  });

  // LinkedIn
  trackLinkedInEvent('lead', {
    value: data.base_value + data.after_hours_fee,
    currency: 'USD'
  });

  // Yelp
  trackYelpEvent('after_hours_service_requested', data);
};

// EXISTING FUNCTIONS (updated for compatibility)

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