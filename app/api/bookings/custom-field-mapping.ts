/**
 * GHL Custom Field Mapping
 * 
 * This maps our booking data to GHL custom fields by name.
 * Much simpler than managing environment variables.
 */

export interface CustomFieldMapping {
  [fieldName: string]: string | number | boolean | undefined;
}

/**
 * Build custom fields payload for GHL based on booking data
 */
export function buildBookingCustomFields(bookingData: {
  serviceName?: string;
  scheduledDateTime?: string;
  serviceAddress?: string;
  notes?: string;
  consentTerms?: boolean;
  promoCode?: string;
  referredBy?: string;
  numberOfSigners?: number;
  discountAmount?: number;
  smsConsent?: boolean;
  emailConsent?: boolean;
  locationType?: string;
}): CustomFieldMapping {
  const customFields: CustomFieldMapping = {};

  // Only add fields that have values
  if (bookingData.serviceName) {
    customFields['Booking Service Type'] = bookingData.serviceName;
  }
  
  if (bookingData.scheduledDateTime) {
    customFields['Booking Appointment DateTime'] = bookingData.scheduledDateTime;
  }
  
  if (bookingData.serviceAddress) {
    customFields['Booking Service Address'] = bookingData.serviceAddress;
  }
  
  if (bookingData.notes) {
    customFields['Booking Special Instructions'] = bookingData.notes;
  }
  
  if (bookingData.consentTerms !== undefined) {
    customFields['Consent Terms & Conditions'] = bookingData.consentTerms ? 'Yes' : 'No';
  }
  
  customFields['Lead Source Detail'] = 'HMNP Website Booking';
  
  if (bookingData.promoCode) {
    customFields['Promo Code Used'] = bookingData.promoCode;
  }
  
  if (bookingData.referredBy) {
    customFields['Referred By Name/Email'] = bookingData.referredBy;
  }
  
  if (bookingData.numberOfSigners) {
    customFields['Number of Signers'] = bookingData.numberOfSigners.toString();
  }
  
  if (bookingData.discountAmount && bookingData.discountAmount > 0) {
    customFields['Booking Discount Applied'] = bookingData.discountAmount.toString();
  }
  
  if (bookingData.smsConsent !== undefined) {
    customFields['SMS Notifications Consent'] = bookingData.smsConsent ? 'Yes' : 'No';
  }
  
  if (bookingData.emailConsent !== undefined) {
    customFields['Email Updates Consent'] = bookingData.emailConsent ? 'Yes' : 'No';
  }
  
  if (bookingData.locationType) {
    customFields['Booking Location Type'] = bookingData.locationType;
  }

  return customFields;
}

/**
 * Alternative approach: Just use tags and standard fields
 * This is simpler and works great for automation
 */
export function buildBookingTags(bookingData: {
  serviceName?: string;
  status?: string;
  isFirstTime?: boolean;
  isReferral?: boolean;
  smsConsent?: boolean;
  emailConsent?: boolean;
  discountApplied?: boolean;
  locationType?: string;
}): string[] {
  const tags: string[] = [];

  if (bookingData.serviceName) {
    tags.push(`service:${bookingData.serviceName.replace(/\s+/g, '_').toLowerCase()}`);
  }
  
  if (bookingData.status) {
    tags.push(`status:${bookingData.status.toLowerCase()}`);
  }
  
  if (bookingData.isFirstTime) {
    tags.push('client:first_time');
  }
  
  if (bookingData.isReferral) {
    tags.push('client:referred');
  }
  
  if (bookingData.smsConsent) {
    tags.push('consent:sms_opt_in');
  }
  
  if (bookingData.emailConsent) {
    tags.push('consent:email_opt_in');
  }
  
  if (bookingData.discountApplied) {
    tags.push('discount:applied');
  }
  
  if (bookingData.locationType) {
    tags.push(`location:${bookingData.locationType.toLowerCase()}`);
  }
  
  // Always add source tag
  tags.push('source:website_booking');

  return tags;
} 