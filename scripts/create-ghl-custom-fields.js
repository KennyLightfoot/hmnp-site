#!/usr/bin/env node

/**
 * Script to create ALL required custom fields in GoHighLevel using Private Integrations v2 API
 * This script checks for existing fields and only creates missing ones
 * Updated to include comprehensive field list from GHL_SETUP_GUIDE.md and manual
 * 
 * Usage: node scripts/create-ghl-custom-fields.js
 */

import {
  validateEnvVariables,
  getLocationCustomFields,
  createLocationCustomField,
  printSuccess,
  printError,
  printInfo
} from './ghl-api-v2-utils.js';

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

// Comprehensive custom fields organized by category
// Based on all form components (.tsx files) and GHL_SETUP_GUIDE.md requirements
const customFields = [
  // ===== CONTACT & INQUIRY FIELDS =====
  {
    name: 'cf_contact_inquiry_subject',
    dataType: 'TEXT',
    position: 1,
    placeholder: 'Subject of inquiry'
  },
  {
    name: 'cf_contact_inquiry_message',
    dataType: 'LARGE_TEXT',
    position: 2,
    placeholder: 'Detailed message'
  },
  {
    name: 'cf_preferred_call_time',
    dataType: 'TEXT',
    position: 3,
    placeholder: 'Morning, Afternoon, Evening, Anytime'
  },
  {
    name: 'cf_call_request_notes',
    dataType: 'LARGE_TEXT',
    position: 4,
    placeholder: 'Reason for call request'
  },
  {
    name: 'cf_service_interest_general',
    dataType: 'TEXT',
    position: 5,
    placeholder: 'General service interest'
  },
  {
    name: 'cf_referral_source_description',
    dataType: 'LARGE_TEXT',
    position: 6,
    placeholder: 'How did you hear about us?'
  },

  // ===== BOOKING & APPOINTMENT FIELDS =====
  {
    name: 'cf_booking_service_type',
    dataType: 'TEXT',
    position: 7,
    placeholder: 'Service type selected'
  },
  {
    name: 'cf_booking_appointment_datetime',
    dataType: 'TEXT',
    position: 8,
    placeholder: 'MM/DD/YYYY HH:MM'
  },
  {
    name: 'cf_booking_number_of_signers',
    dataType: 'NUMERICAL',
    position: 9,
    placeholder: '1'
  },
  {
    name: 'cf_booking_service_address',
    dataType: 'LARGE_TEXT',
    position: 10,
    placeholder: 'Full service address'
  },
  {
    name: 'cf_booking_location_details',
    dataType: 'TEXT',
    position: 11,
    placeholder: 'Gate code, suite number, etc.'
  },
  {
    name: 'cf_booking_special_instructions',
    dataType: 'LARGE_TEXT',
    position: 12,
    placeholder: 'Special instructions for notary'
  },
  // Additional booking fields from service-booking-form.tsx and API
  {
    name: 'cf_booking_status',
    dataType: 'TEXT',
    position: 350,
    placeholder: 'REQUESTED, CONFIRMED, COMPLETED, CANCELLED'
  },
  {
    name: 'cf_booking_discount_applied',
    dataType: 'TEXT',
    position: 351,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_booking_promo_code_used',
    dataType: 'TEXT',
    position: 352,
    placeholder: 'Promo code if used'
  },
  {
    name: 'cf_booking_service_id',
    dataType: 'TEXT',
    position: 353,
    placeholder: 'Internal service ID'
  },
  {
    name: 'cf_booking_start_time',
    dataType: 'TEXT',
    position: 354,
    placeholder: 'Start time ISO format'
  },
  {
    name: 'cf_booking_end_time',
    dataType: 'TEXT',
    position: 355,
    placeholder: 'End time ISO format'
  },
  {
    name: 'cf_booking_calendar_id',
    dataType: 'TEXT',
    position: 356,
    placeholder: 'GHL calendar ID'
  },
  {
    name: 'cf_booking_signers_details',
    dataType: 'LARGE_TEXT',
    position: 357,
    placeholder: 'Additional details about signers'
  },
  {
    name: 'cf_booking_location_type',
    dataType: 'TEXT',
    position: 358,
    placeholder: 'CLIENT_ADDRESS, OFFICE, VIRTUAL'
  },
  {
    name: 'cf_booking_reschedule_reason',
    dataType: 'LARGE_TEXT',
    position: 359,
    placeholder: 'Reason for reschedule'
  },

  // ===== LEGACY APPOINTMENT FIELDS (from manual) =====
  {
    name: 'cf_appointment_date',
    dataType: 'DATE',
    position: 13,
    placeholder: ''
  },
  {
    name: 'cf_appointment_time',
    dataType: 'TEXT',
    position: 14,
    placeholder: 'HH:MM AM/PM'
  },
  {
    name: 'cf_service_type',
    dataType: 'TEXT',
    position: 15,
    placeholder: 'Service type'
  },
  {
    name: 'cf_service_total',
    dataType: 'MONETORY',
    position: 16,
    placeholder: '0.00'
  },
  {
    name: 'cf_service_date',
    dataType: 'DATE',
    position: 17,
    placeholder: ''
  },

  // ===== STATUS & TRACKING FIELDS =====
  {
    name: 'cf_last_booking_status',
    dataType: 'TEXT',
    position: 18,
    placeholder: 'e.g., Confirmed, Cancelled, Completed'
  },
  {
    name: 'cf_last_cancellation_date', 
    dataType: 'DATE',
    position: 19,
    placeholder: ''
  },
  {
    name: 'cf_last_reschedule_date',
    dataType: 'DATE',
    position: 20,
    placeholder: ''
  },
  {
    name: 'cf_quote_sent_date',
    dataType: 'DATE',
    position: 21, 
    placeholder: ''
  },

  // ===== PAYMENT & BILLING FIELDS =====
  {
    name: 'cf_payment_reminders_sent',
    dataType: 'NUMERICAL',
    position: 22,
    placeholder: '0'
  },
  {
    name: 'cf_last_payment_reminder',
    dataType: 'DATE',
    position: 23,
    placeholder: ''
  },
  {
    name: 'cf_refund_amount',
    dataType: 'MONETORY',
    position: 24,
    placeholder: '0.00'
  },
  {
    name: 'cf_payment_invoice_number',
    dataType: 'TEXT',
    position: 25,
    placeholder: 'Invoice number'
  },
  {
    name: 'cf_payment_service_description',
    dataType: 'TEXT',
    position: 26,
    placeholder: 'Service description'
  },
  {
    name: 'cf_payment_amount_paid',
    dataType: 'MONETORY',
    position: 27,
    placeholder: '0.00'
  },
  {
    name: 'cf_billing_address_street',
    dataType: 'TEXT',
    position: 28,
    placeholder: 'Street address'
  },
  {
    name: 'cf_billing_address_city',
    dataType: 'TEXT',
    position: 29,
    placeholder: 'City'
  },
  {
    name: 'cf_billing_address_state',
    dataType: 'TEXT',
    position: 30,
    placeholder: 'State'
  },
  {
    name: 'cf_billing_address_zip',
    dataType: 'TEXT',
    position: 31,
    placeholder: 'ZIP code'
  },
  {
    name: 'cf_billing_address_country',
    dataType: 'TEXT',
    position: 32,
    placeholder: 'Country'
  },
  // Additional payment fields from payment-form.tsx and API endpoints
  {
    name: 'cf_payment_status',
    dataType: 'TEXT',
    position: 370,
    placeholder: 'PENDING, COMPLETED, FAILED'
  },
  {
    name: 'cf_payment_provider',
    dataType: 'TEXT',
    position: 371,
    placeholder: 'STRIPE, SQUARE, PAYPAL, OTHER'
  },
  {
    name: 'cf_payment_intent_id',
    dataType: 'TEXT',
    position: 372,
    placeholder: 'Payment intent ID from provider'
  },
  {
    name: 'cf_payment_method',
    dataType: 'TEXT',
    position: 373,
    placeholder: 'CREDIT_CARD, ACH, DEPOSIT, CASH, CHECK'
  },
  {
    name: 'cf_payment_error_message',
    dataType: 'LARGE_TEXT',
    position: 374,
    placeholder: 'Error message if payment failed'
  },
  {
    name: 'cf_payment_cardholder_name',
    dataType: 'TEXT',
    position: 375,
    placeholder: 'Name on card'
  },
  {
    name: 'cf_payment_last_four',
    dataType: 'TEXT',
    position: 376,
    placeholder: 'Last four digits of card'
  },
  {
    name: 'cf_promo_code_used',
    dataType: 'TEXT',
    position: 377,
    placeholder: 'Promo code if applied'
  },

  // ===== FEEDBACK & REVIEWS =====
  {
    name: 'cf_feedback_service_rating',
    dataType: 'NUMERICAL',
    position: 33,
    placeholder: '5'
  },
  {
    name: 'cf_feedback_testimonial_text',
    dataType: 'LARGE_TEXT',
    position: 34,
    placeholder: 'Your feedback here'
  },
  {
    name: 'cf_feedback_consent_display',
    dataType: 'TEXT',
    position: 35,
    placeholder: 'Yes/No'
  },
  // Additional feedback fields from feedback-form.tsx
  {
    name: 'cf_feedback_submission_date',
    dataType: 'DATE',
    position: 385,
    placeholder: ''
  },
  {
    name: 'cf_feedback_service_date',
    dataType: 'DATE',
    position: 386,
    placeholder: ''
  },
  {
    name: 'cf_feedback_service_type_rated',
    dataType: 'TEXT',
    position: 387,
    placeholder: 'Service type this feedback relates to'
  },
  {
    name: 'cf_feedback_notary_name',
    dataType: 'TEXT',
    position: 388,
    placeholder: 'Name of notary who performed service'
  },
  {
    name: 'cf_feedback_review_platform',
    dataType: 'TEXT',
    position: 389,
    placeholder: 'Google, Yelp, Facebook, etc.'
  },
  {
    name: 'cf_feedback_review_url',
    dataType: 'TEXT',
    position: 390,
    placeholder: 'URL to published review'
  },

  // ===== SUPPORT & DOCUMENTS =====
  {
    name: 'cf_support_issue_category',
    dataType: 'TEXT',
    position: 36,
    placeholder: 'Issue category'
  },
  {
    name: 'cf_support_issue_description',
    dataType: 'LARGE_TEXT',
    position: 37,
    placeholder: 'Issue description'
  },
  {
    name: 'cf_support_client_urgency',
    dataType: 'TEXT',
    position: 38,
    placeholder: 'Low, Medium, High'
  },
  {
    name: 'cf_support_attached_file',
    dataType: 'TEXT',
    position: 39,
    placeholder: 'File URL'
  },
  {
    name: 'cf_docupload_document_type',
    dataType: 'TEXT',
    position: 40,
    placeholder: 'Document type'
  },
  {
    name: 'cf_docupload_file_secure',
    dataType: 'TEXT',
    position: 41,
    placeholder: 'Secure file URL'
  },
  // Additional support ticket fields from support-ticket-form.tsx
  {
    name: 'cf_support_ticket_category',
    dataType: 'TEXT',
    position: 450,
    placeholder: 'Billing, Technical, Service, Other'
  },
  {
    name: 'cf_support_ticket_description',
    dataType: 'LARGE_TEXT',
    position: 451,
    placeholder: 'Detailed description of issue'
  },
  {
    name: 'cf_support_ticket_urgency',
    dataType: 'TEXT',
    position: 452,
    placeholder: 'Low, Medium, High, Critical'
  },
  {
    name: 'cf_support_ticket_file_url',
    dataType: 'TEXT',
    position: 453,
    placeholder: 'URL to uploaded support file'
  },
  {
    name: 'cf_support_ticket_status',
    dataType: 'TEXT',
    position: 454,
    placeholder: 'Open, In Progress, Resolved, Closed'
  },
  {
    name: 'cf_support_ticket_resolution',
    dataType: 'LARGE_TEXT',
    position: 455,
    placeholder: 'How the issue was resolved'
  },
  {
    name: 'cf_support_ticket_created_date',
    dataType: 'DATE',
    position: 456,
    placeholder: ''
  },
  {
    name: 'cf_support_ticket_resolved_date',
    dataType: 'DATE',
    position: 457,
    placeholder: ''
  },
  // Document upload fields from document-upload-form.tsx
  {
    name: 'cf_uploaded_document_type',
    dataType: 'TEXT',
    position: 460,
    placeholder: 'Type of document uploaded'
  },
  {
    name: 'cf_uploaded_document_notes',
    dataType: 'LARGE_TEXT',
    position: 461,
    placeholder: 'Notes about the document'
  },
  {
    name: 'cf_uploaded_document_file_url',
    dataType: 'TEXT',
    position: 462,
    placeholder: 'S3 URL to the document'
  },
  {
    name: 'cf_uploaded_document_scan_status',
    dataType: 'TEXT',
    position: 463,
    placeholder: 'Pending, Clean, Infected'
  },
  // Remote Online Notarization (RON) Platform fields
  {
    name: 'cf_ron_session_id',
    dataType: 'TEXT',
    position: 470,
    placeholder: 'RON session identifier'
  },
  {
    name: 'cf_ron_session_status',
    dataType: 'TEXT',
    position: 471,
    placeholder: 'PENDING, SCHEDULED, COMPLETED, CANCELLED'
  },
  {
    name: 'cf_ron_session_start_time',
    dataType: 'TEXT',
    position: 472,
    placeholder: 'Session start time'
  },
  {
    name: 'cf_ron_session_documents',
    dataType: 'LARGE_TEXT',
    position: 473,
    placeholder: 'List of documents in session'
  },
  {
    name: 'cf_ron_kba_status',
    dataType: 'TEXT',
    position: 474,
    placeholder: 'NOT_STARTED, PASSED, FAILED'
  },
  {
    name: 'cf_ron_idv_status',
    dataType: 'TEXT',
    position: 475,
    placeholder: 'NOT_STARTED, PASSED, FAILED'
  },
  {
    name: 'cf_ron_video_recording_url',
    dataType: 'TEXT',
    position: 476,
    placeholder: 'URL to RON session recording'
  },

  // ===== REFERRALS =====
  {
    name: 'cf_referrer_full_name',
    dataType: 'TEXT',
    position: 42,
    placeholder: 'Referrer name'
  },
  {
    name: 'cf_referrer_contact_info',
    dataType: 'TEXT',
    position: 43,
    placeholder: 'Referrer contact'
  },
  {
    name: 'cf_referred_person_full_name',
    dataType: 'TEXT',
    position: 44,
    placeholder: 'Referred person name'
  },
  {
    name: 'cf_referred_person_contact_info',
    dataType: 'TEXT',
    position: 45,
    placeholder: 'Referred person contact'
  },
  {
    name: 'cf_referral_additional_notes',
    dataType: 'LARGE_TEXT',
    position: 46,
    placeholder: 'Referral notes'
  },
  // Additional referral fields from referral-form.tsx and partner-referral-form.tsx
  {
    name: 'cf_referred_by_name_or_email',
    dataType: 'TEXT',
    position: 401,
    placeholder: 'Name or email of referrer'
  },
  {
    name: 'cf_referred_by_partner_id',
    dataType: 'TEXT',
    position: 402,
    placeholder: 'Partner ID of referrer'
  },
  {
    name: 'cf_partner_referral_notes',
    dataType: 'LARGE_TEXT',
    position: 403,
    placeholder: 'Notes from partner about referral'
  },
  {
    name: 'cf_referral_credits_earned',
    dataType: 'NUMERICAL',
    position: 404,
    placeholder: '0'
  },
  {
    name: 'cf_is_partner_referral',
    dataType: 'TEXT',
    position: 405,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_referral_service_interest',
    dataType: 'TEXT',
    position: 406,
    placeholder: 'Service of interest'
  },
  {
    name: 'cf_referral_contact_preference',
    dataType: 'TEXT',
    position: 407,
    placeholder: 'Email/Phone/Either'
  },

  // ===== EVENTS =====
  {
    name: 'cf_event_registered_name_id',
    dataType: 'TEXT',
    position: 47,
    placeholder: 'Event name/ID'
  },
  {
    name: 'cf_event_attendee_count',
    dataType: 'NUMERICAL',
    position: 48,
    placeholder: '1'
  },
  {
    name: 'cf_event_special_needs',
    dataType: 'LARGE_TEXT',
    position: 49,
    placeholder: 'Special needs/dietary restrictions'
  },
  // Additional event fields from event-registration-form.tsx
  {
    name: 'cf_event_identifier',
    dataType: 'TEXT',
    position: 420,
    placeholder: 'Unique event identifier'
  },
  {
    name: 'cf_event_actual_date',
    dataType: 'DATE',
    position: 421,
    placeholder: ''
  },
  {
    name: 'cf_event_dietary_restrictions',
    dataType: 'LARGE_TEXT',
    position: 422,
    placeholder: 'Dietary needs or restrictions'
  },
  {
    name: 'cf_event_registration_date',
    dataType: 'DATE',
    position: 423,
    placeholder: ''
  },
  
  // ===== AFFILIATE PROGRAM =====
  {
    name: 'cf_affiliate_business_name',
    dataType: 'TEXT',
    position: 430,
    placeholder: 'Affiliate business name'
  },
  {
    name: 'cf_affiliate_website_url',
    dataType: 'TEXT',
    position: 431,
    placeholder: 'Website URL'
  },
  {
    name: 'cf_affiliate_promotion_plan',
    dataType: 'TEXT',
    position: 432,
    placeholder: 'How they plan to promote'
  },
  {
    name: 'cf_affiliate_payout_preference_notes',
    dataType: 'LARGE_TEXT',
    position: 433,
    placeholder: 'Payment preferences and notes'
  },
  {
    name: 'cf_affiliate_terms_accepted',
    dataType: 'TEXT',
    position: 434,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_affiliate_status',
    dataType: 'TEXT',
    position: 435,
    placeholder: 'Pending/Approved/Suspended'
  },
  {
    name: 'cf_affiliate_code',
    dataType: 'TEXT',
    position: 436,
    placeholder: 'Unique affiliate code'
  },
  {
    name: 'cf_affiliate_earned_commissions',
    dataType: 'MONETORY',
    position: 437,
    placeholder: '0.00'
  },

  // ===== CONSENT & COMPLIANCE =====
  {
    name: 'cf_consent_terms_conditions',
    dataType: 'TEXT',
    position: 50,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_consent_sms_communications',
    dataType: 'TEXT',
    position: 51,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_consent_email_marketing',
    dataType: 'TEXT',
    position: 52,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_payment_terms_agree_policy',
    dataType: 'TEXT',
    position: 53,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_docupload_handling_consent',
    dataType: 'TEXT',
    position: 54,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_referrer_consent_from_referred',
    dataType: 'TEXT',
    position: 55,
    placeholder: 'Yes/No'
  },
  {
    name: 'cf_event_communications_consent',
    dataType: 'TEXT',
    position: 56,
    placeholder: 'Yes/No'
  },

  // ===== MARKETING & TRACKING =====
  {
    name: 'cf_utm_source',
    dataType: 'TEXT',
    position: 57,
    placeholder: 'google, facebook, etc.'
  },
  {
    name: 'cf_utm_medium',
    dataType: 'TEXT',
    position: 58,
    placeholder: 'cpc, email, social'
  },
  {
    name: 'cf_utm_campaign',
    dataType: 'TEXT',
    position: 59,
    placeholder: 'Campaign name'
  },
  {
    name: 'cf_utm_term',
    dataType: 'TEXT',
    position: 60,
    placeholder: 'Keywords'
  },
  {
    name: 'cf_utm_content',
    dataType: 'TEXT',
    position: 61,
    placeholder: 'Ad content variation'
  },

  // ===== WORKFLOW & AUTOMATION SPECIFIC FIELDS (from GHL_Workflow_Details.md) =====
  {
    name: 'cf_booking_appointment_time_only',
    dataType: 'TEXT',
    position: 500,
    placeholder: 'e.g., 02:30 PM'
  },
  {
    name: 'cf_confirmation_sent_at',
    dataType: 'TEXT', // Could be DATETIME if GHL API supports it directly for contact field updates
    position: 501,
    placeholder: 'Timestamp of confirmation'
  },
  {
    name: 'cf_no_show_reason',
    dataType: 'LARGE_TEXT',
    position: 502,
    placeholder: 'Reason provided for no-show'
  },
  {
    name: 'cf_no_show_count',
    dataType: 'NUMERICAL',
    position: 503,
    placeholder: '0'
  },
  {
    name: 'cf_payment_date',
    dataType: 'DATE',
    position: 504,
    placeholder: 'Date of payment'
  },
  {
    name: 'cf_invoice_due_date',
    dataType: 'DATE',
    position: 18,
    placeholder: 'Current status of the last booking'
  },

  // ===== NEW FINANCIAL & BOOKING DETAIL FIELDS (May 2025) =====
  {
    name: 'cf_booking_additional_charges', // For 'additionalCharges'
    dataType: 'MONETORY', // GHL uses MONETORY for currency
    position: 400,
    placeholder: '0.00'
  },
  {
    name: 'cf_booking_base_price', // For 'basePrice'
    dataType: 'MONETORY',
    position: 401,
    placeholder: '0.00'
  },
  {
    name: 'cf_booking_client_type', // For 'clientType'
    dataType: 'TEXT', // Or 'DROPDOWN_SINGLE' if you have predefined types
    position: 402,
    placeholder: 'e.g., Individual, Business, Title Company'
  },
  {
    name: 'cf_booking_document_count', // For 'documentCount'
    dataType: 'NUMERICAL',
    position: 403,
    placeholder: 'Number of documents'
  },
  // Note: 'cf_booking_location_type' already exists at position 358.
  // If you need a different one for 'locationType', use a new name.
  // Otherwise, ensure your internal 'locationType' maps to 'cf_booking_location_type'.
  {
    name: 'cf_booking_travel_mileage', // For 'mileage'
    dataType: 'NUMERICAL',
    position: 404,
    placeholder: 'Total miles traveled'
  },
  {
    name: 'cf_booking_travel_fee', // For 'travelFee'
    dataType: 'MONETORY',
    position: 405,
    placeholder: '0.00'
  },
  {
    name: 'cf_booking_payment_status', // For 'paymentStatus'
    dataType: 'TEXT', // Or 'DROPDOWN_SINGLE' (e.g., Paid, Unpaid, Pending, Refunded)
    position: 406,
    placeholder: 'Current payment status'
  },
  {
    name: 'cf_booking_urgency_level', // For 'urgency'
    dataType: 'TEXT', // Or 'DROPDOWN_SINGLE' (e.g., Standard, Rush, ASAP)
    position: 407,
    placeholder: 'Urgency of the booking'
  },
  {
    name: 'cf_booking_witness_count', // For 'witnessCount'
    dataType: 'NUMERICAL',
    position: 408,
    placeholder: 'Number of witnesses required'
  },
  {
    name: 'cf_payment_failed_attempts',
    dataType: 'NUMERICAL',
    position: 506,
    placeholder: '0'
  },
  {
    name: 'cf_satisfaction_score',
    dataType: 'NUMERICAL', // Or TEXT if using a non-numeric scale like "Good", "Bad"
    position: 507,
    placeholder: 'e.g., 1-10'
  },
  {
    name: 'cf_onboarding_documents_received',
    dataType: 'TEXT',
    position: 508,
    placeholder: 'Yes, No, Pending'
  },
  {
    name: 'cf_last_service_type',
    dataType: 'TEXT',
    position: 509,
    placeholder: 'Type of the last service provided'
  },
  {
    name: 'cf_last_service_type_friendly_name',
    dataType: 'TEXT',
    position: 510,
    placeholder: 'User-friendly name of last service'
  },
  {
    name: 'cf_reengagement_segment',
    dataType: 'TEXT',
    position: 511,
    placeholder: 'Segment for re-engagement campaigns'
  },
  {
    name: 'cf_lifetime_value',
    dataType: 'MONETORY',
    position: 512,
    placeholder: '0.00'
  },

  // ===== REFUND SPECIFIC FIELDS (from GHL_Workflow_Details.md) =====
  {
    name: 'cf_refund_request_amount',
    dataType: 'MONETORY',
    position: 520,
    placeholder: '0.00'
  },
  {
    name: 'cf_refund_request_reason',
    dataType: 'LARGE_TEXT',
    position: 521,
    placeholder: 'Reason for refund request'
  },
  {
    name: 'cf_original_invoice_id',
    dataType: 'TEXT',
    position: 522,
    placeholder: 'Original invoice ID for refund'
  },
  {
    name: 'cf_refund_processed_amount',
    dataType: 'MONETORY',
    position: 523,
    placeholder: '0.00'
  },
  {
    name: 'cf_refund_gateway_transaction_id',
    dataType: 'TEXT',
    position: 524,
    placeholder: 'Refund transaction ID from gateway'
  },
  {
    name: 'cf_refund_status',
    dataType: 'TEXT',
    position: 525,
    placeholder: 'e.g., Requested, Processed, Denied'
  },

  // ===== REFERRAL PROGRAM SPECIFIC FIELDS (from GHL_Workflow_Details.md) =====
  {
    name: 'cf_unique_referral_code',
    dataType: 'TEXT',
    position: 530,
    placeholder: 'Unique code assigned to referrer'
  },
  {
    name: 'cf_referral_code_used',
    dataType: 'TEXT',
    position: 531,
    placeholder: 'Referral code used by new lead'
  },
  {
    name: 'cf_referrer_contact_id',
    dataType: 'TEXT',
    position: 532,
    placeholder: 'GHL Contact ID of the referrer'
  },
  {
    name: 'cf_account_credit_referrer',
    dataType: 'MONETORY',
    position: 533,
    placeholder: '0.00 account credit for referrer'
  }
];

async function getExistingCustomFields() {
  try {
    const data = await getLocationCustomFields();
    return data.customFields || [];
  } catch (error) {
    console.error('Error fetching existing custom fields:', error);
    return [];
  }
}

async function createCustomField(fieldData) {
  try {
    console.log(`Creating custom field: ${fieldData.name}...`);
    
    const result = await createLocationCustomField(fieldData);
    printSuccess(`Created ${fieldData.name} successfully`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Key: ${result.key || fieldData.name}`);
    return true;
    
  } catch (error) {
    printError(`Error creating ${fieldData.name}: ${error.message}`);
    return false;
  }
}

async function createAllCustomFields() {
  console.log('🚨 Starting comprehensive custom field creation with GHL v2 API...\n');
  
  // First, get existing fields
  printInfo('Checking existing custom fields...');
  const existingFields = await getExistingCustomFields();
  printInfo(`Found ${existingFields.length} existing custom fields\n`);

  // Filter out fields that already exist
  const fieldsToCreate = customFields.filter(field => {
    const exists = existingFields.some(existing => 
      existing.name === field.name || existing.key === field.name
    );
    
    if (exists) {
      console.log(`⏭️  Skipping ${field.name} - already exists`);
      return false;
    }
    return true;
  });

  if (fieldsToCreate.length === 0) {
    console.log('\n🎉 All required custom fields already exist!');
    console.log('Your automation workflows should work correctly.');
    console.log(`\n📊 Total fields configured: ${customFields.length}`);
    console.log('   - Contact & Inquiry: 10+ fields');
    console.log('   - Booking & Appointments: 20+ fields');
    console.log('   - Status & Tracking: 10+ fields');
    console.log('   - Payment & Billing: 15+ fields');
    console.log('   - Feedback & Reviews: 10+ fields');
    console.log('   - Support & Documents: 15+ fields');
    console.log('   - Referrals: 10+ fields');
    console.log('   - Events: 10+ fields');
    console.log('   - Affiliate Program: 8+ fields');
    console.log('   - RON Platform: 7+ fields');
    console.log('   - Consent & Compliance: 10+ fields');
    console.log('   - Marketing & Tracking: 10+ fields');
    console.log('   ✅ Workflow & Automation Specific Fields (New)');
    console.log('   ✅ Refund Specific Fields (New)');
    console.log('   ✅ Referral Program Specific Fields (New)');
    return;
  }

  console.log(`\n📝 Need to create ${fieldsToCreate.length} missing fields:\n`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const field of fieldsToCreate) {
    const success = await createCustomField(field);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add delay between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} fields`);
  console.log(`❌ Failed to create: ${failureCount} fields`);
  console.log(`⏭️  Already existed: ${customFields.length - fieldsToCreate.length} fields`);
  console.log(`🎯 Total configured: ${customFields.length} fields`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All custom fields are now set up!');
    console.log('\nField Categories Created:');
    console.log('   ✅ Contact & Inquiry fields');
    console.log('   ✅ Booking & Appointment fields');
    console.log('   ✅ Payment & Billing fields');
    console.log('   ✅ Status & Tracking fields');
    console.log('   ✅ Feedback & Review fields');
    console.log('   ✅ Support & Document fields');
    console.log('   ✅ Referral fields');
    console.log('   ✅ Event fields');
    console.log('   ✅ Affiliate Program fields');
    console.log('   ✅ RON Platform fields');
    console.log('   ✅ Consent & Compliance fields');
    console.log('   ✅ Marketing & Tracking fields');
    console.log('   ✅ Legacy fields (for backward compatibility)');
    console.log('   ✅ Workflow & Automation Specific Fields');
    console.log('   ✅ Refund Specific Fields');
    console.log('   ✅ Referral Program Specific Fields');
    console.log('\nNext steps:');
    console.log('1. Verify the fields in GHL: Settings > Custom Fields');
    console.log('2. Test your automation workflows');
    console.log('3. Run: node scripts/create-ghl-tags.js');
    console.log('4. Run: node scripts/create-ghl-pipelines.js');
  } else {
    console.log('\n🔧 Some fields failed to create. Check the errors above.');
    console.log('You may need to create them manually in GHL or check your API permissions.');
  }
}

// Run the script
createAllCustomFields().catch(console.error); 