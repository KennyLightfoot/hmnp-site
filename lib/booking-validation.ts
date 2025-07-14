/**
 * Championship Booking System - Validation Schemas
 * Houston Mobile Notary Pros
 * 
 * Comprehensive Zod validation schemas for the entire booking flow.
 * Built for bulletproof data integrity and superior user experience.
 */

import { z } from 'zod';

// Core Service Types Enum - Updated to include all 6 website services
export const ServiceTypeSchema = z.enum([
  'QUICK_STAMP_LOCAL',        // NEW: Quick-Stamp Local ($50)
  'STANDARD_NOTARY',
  'EXTENDED_HOURS', 
  'LOAN_SIGNING',
  'RON_SERVICES',
  'BUSINESS_ESSENTIALS',      // NEW: Business Subscription - Essentials ($125)
  'BUSINESS_GROWTH'           // NEW: Business Subscription - Growth ($349)
]);

export const LocationTypeSchema = z.enum([
  'CLIENT_ADDRESS',
  'NOTARY_OFFICE', 
  'NEUTRAL_LOCATION',
  'REMOTE_ONLINE'
]);

export const BookingStatusSchema = z.enum([
  'PENDING',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED'
]);

// Custom validation functions
const phoneRegex = /^(\+1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})$/;
const zipCodeRegex = /^\d{5}(-\d{4})?$/;

// Booking Triage Schema - For Smart Service Recommendations
export const BookingTriageSchema = z.object({
  documentType: z.array(z.string()).min(1, "Please select at least one document type"),
  urgency: z.enum(['today', 'this-week', 'next-week', 'flexible']),
  location: z.enum(['in-person', 'remote', 'either']),
  timePreference: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),
  signerCount: z.number().min(1).max(10).default(1),
  specialRequirements: z.array(z.string()).default([])
});

// Location/Address Schema
export const LocationSchema = z.object({
  address: z.string().min(10, "Please provide a complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "Please provide state abbreviation (e.g., TX)"),
  zipCode: z.string().regex(zipCodeRegex, "Please provide a valid ZIP code"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accessInstructions: z.string().max(500).optional(),
  parkingNotes: z.string().max(300).optional()
});

// Customer Information Schema
export const CustomerInfoSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(phoneRegex, "Please provide a valid phone number").optional(),
  companyName: z.string().max(100).optional(),
  
  // Preferences
  preferredContactMethod: z.enum(['email', 'phone', 'sms']).default('email'),
  marketingConsent: z.boolean().default(false),
  smsConsent: z.boolean().default(false)
});

// Service Details Schema
export const ServiceDetailsSchema = z.object({
  serviceType: ServiceTypeSchema,
  documentCount: z.number().min(1, "At least one document is required").max(50),
  documentTypes: z.array(z.string()).min(1, "Please specify document types"),
  signerCount: z.number().min(1, "At least one signer is required").max(10),
  
  // Special requirements
  witnessRequired: z.boolean().default(false),
  witnessProvided: z.enum(['customer', 'notary', 'none']).default('none'),
  identificationRequired: z.boolean().default(true),
  
  // Notes
  specialInstructions: z.string().max(1000).optional(),
  clientNotes: z.string().max(500).optional()
});

// Scheduling Schema with Smart Validation
export const SchedulingSchema = z.object({
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please provide date in YYYY-MM-DD format"),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide time in HH:MM format"),
  timeZone: z.string().default("America/Chicago"),
  flexibleTiming: z.boolean().default(false),
  
  // Urgency indicators
  priority: z.boolean().default(false),
  sameDay: z.boolean().default(false),
  
  // Duration estimate
  estimatedDuration: z.number().min(15).max(180).default(60) // minutes
}).refine((data) => {
  const scheduledTime = new Date(`${data.preferredDate.split('T')[0]}T${data.preferredTime}`);
  const now = new Date();
  return scheduledTime > now;
}, {
  message: "Scheduled time must be in the future"
});

// Payment Information Schema
export const PaymentInfoSchema = z.object({
  paymentMethod: z.enum(['credit-card', 'debit-card', 'cash', 'check', 'invoice']),
  
  // For Stripe integration
  stripePaymentMethodId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  
  // Billing address (can be different from service location)
  billingAddress: LocationSchema.optional(),
  sameBillingAddress: z.boolean().default(true),
  
  // Corporate billing
  corporateBilling: z.boolean().default(false),
  purchaseOrderNumber: z.string().max(50).optional(),
  
  // Payment preferences
  payFullAmount: z.boolean().default(false), // If false, pay deposit only
  savePaymentMethod: z.boolean().default(false)
});

// Promo Code Schema
export const PromoCodeSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  customerEmail: z.string().email()
});

// Complete Booking Schema - The Master Schema
export const CreateBookingSchema = z.object({
  // Triage results (optional if coming from direct booking)
  triageResults: BookingTriageSchema.optional(),
  
  // Core booking information
  serviceType: ServiceTypeSchema,
  locationType: LocationTypeSchema,
  
  // Customer information
  customer: CustomerInfoSchema,
  
  // Location (required except for RON)
  location: LocationSchema.optional(),
  
  // Service details
  serviceDetails: ServiceDetailsSchema,
  
  // Scheduling
  scheduling: SchedulingSchema,
  
  // Payment
  payment: PaymentInfoSchema,
  
  // Optional enhancements
  promoCode: z.string().max(20).optional(),
  referralCode: z.string().max(50).optional(),
  
  // Metadata
  bookingSource: z.string().default('website'),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  utmParameters: z.record(z.string()).optional()
}).refine((data) => {
  // RON services don't need location
  if (data.serviceType === 'RON_SERVICES') {
    return data.locationType === 'REMOTE_ONLINE';
  }
  
  // All other services need location details
  return data.location !== undefined;
}, {
  message: "Location is required for in-person services",
  path: ['location']
}).refine((data) => {
  // Validate document count against service limits - Updated for all 6 services
  const serviceLimits: Record<string, number> = {
    'QUICK_STAMP_LOCAL': 1,       // NEW: Quick-Stamp Local (≤ 1 document)
    'STANDARD_NOTARY': 2,
    'EXTENDED_HOURS': 5,
    'LOAN_SIGNING': 999,
    'RON_SERVICES': 10,
    'BUSINESS_ESSENTIALS': 10,    // NEW: Business Subscription - Essentials (10 RON seals)
    'BUSINESS_GROWTH': 40         // NEW: Business Subscription - Growth (40 RON seals)
  };
  
  const limit = serviceLimits[data.serviceType] || 1; // Default to 1 if service type not found
  return data.serviceDetails.documentCount <= limit;
}, {
  message: "Document count exceeds service limit",
  path: ['serviceDetails', 'documentCount']
});

// Update Booking Schema - using safer partial implementation
export const UpdateBookingSchema = z.object({
  id: z.string().min(1, "Booking ID is required"),
  version: z.number().optional(), // For optimistic locking
  
  // All fields from CreateBookingSchema as optional
  triageResults: BookingTriageSchema.optional(),
  serviceType: ServiceTypeSchema.optional(),
  locationType: LocationTypeSchema.optional(),
  customer: CustomerInfoSchema.optional(),
  location: LocationSchema.optional(),
  serviceDetails: ServiceDetailsSchema.optional(),
  scheduling: SchedulingSchema.optional(),
  payment: PaymentInfoSchema.optional(),
  promoCode: z.string().max(20).optional(),
  referralCode: z.string().max(50).optional(),
  bookingSource: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  utmParameters: z.record(z.string()).optional()
});

// Booking Query/Filter Schema
export const BookingQuerySchema = z.object({
  // Filters
  status: BookingStatusSchema.optional(),
  serviceType: ServiceTypeSchema.optional(),
  customerEmail: z.string().email().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // Sorting
  sortBy: z.enum(['createdAt', 'scheduledDateTime', 'totalPrice', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  // Search
  search: z.string().max(100).optional()
});

// Slot Availability Schema
export const SlotAvailabilitySchema = z.object({
  serviceType: ServiceTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  location: z.object({
    address: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional(),
  duration: z.number().min(15).max(180).default(60) // minutes
});

// Slot Reservation Schema
export const SlotReservationSchema = z.object({
  serviceType: ServiceTypeSchema,
  datetime: z.string().datetime(),
  customerEmail: z.string().email().optional(),
  userId: z.string().optional(),
  estimatedDuration: z.number().min(15).max(180).default(60)
});

// Upsell Response Schema
export const UpsellResponseSchema = z.object({
  suggestionId: z.string(),
  response: z.enum(['accept', 'decline', 'later']),
  originalServiceType: ServiceTypeSchema,
  suggestedServiceType: ServiceTypeSchema.optional(),
  customerFeedback: z.string().max(500).optional()
});

// Payment Intent Schema for Stripe
export const PaymentIntentSchema = z.object({
  bookingId: z.string(),
  amount: z.number().min(1),
  currency: z.string().default('usd'),
  paymentMethodTypes: z.array(z.string()).default(['card']),
  metadata: z.record(z.string()).optional()
});

// Webhook Validation Schema
export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.any())
  }),
  created: z.number(),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z.object({
    id: z.string().nullable(),
    idempotency_key: z.string().nullable()
  }).nullable()
});

// Notification Schema
export const NotificationSchema = z.object({
  bookingId: z.string(),
  type: z.enum([
    'BOOKING_CONFIRMATION',
    'PAYMENT_CONFIRMATION', 
    'APPOINTMENT_REMINDER',
    'BOOKING_CANCELLED',
    'UPSELL_SUGGESTION',
    'TRUST_BUILDING',
    'FOLLOWUP'
  ]),
  method: z.enum(['email', 'sms', 'push', 'in-app']),
  recipient: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    userId: z.string().optional()
  }),
  content: z.object({
    subject: z.string().optional(),
    message: z.string(),
    template: z.string().optional(),
    data: z.record(z.any()).optional()
  }),
  scheduledFor: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

// Analytics Event Schema
export const AnalyticsEventSchema = z.object({
  event: z.string(),
  properties: z.record(z.any()),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  bookingId: z.string().optional()
});

// Trust Signal Schema
export const TrustSignalSchema = z.object({
  type: z.enum(['insurance', 'reviews', 'certification', 'guarantee', 'security']),
  title: z.string().max(100),
  description: z.string().max(500),
  value: z.string().max(50), // e.g., "$100K", "4.9/5"
  icon: z.string().max(50),
  priority: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
});

// Export types for TypeScript
export type BookingTriage = z.infer<typeof BookingTriageSchema>;
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
export type ServiceDetails = z.infer<typeof ServiceDetailsSchema>;
export type Scheduling = z.infer<typeof SchedulingSchema>;
export type PaymentInfo = z.infer<typeof PaymentInfoSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;
export type BookingQuery = z.infer<typeof BookingQuerySchema>;
export type SlotAvailability = z.infer<typeof SlotAvailabilitySchema>;
export type SlotReservation = z.infer<typeof SlotReservationSchema>;
export type UpsellResponse = z.infer<typeof UpsellResponseSchema>;
export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
export type NotificationRequest = z.infer<typeof NotificationSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type TrustSignal = z.infer<typeof TrustSignalSchema>;

// Validation Helper Functions
export const validateBookingData = (data: unknown): CreateBooking => {
  return CreateBookingSchema.parse(data);
};

export const validatePartialBookingData = (data: unknown): Partial<CreateBooking> => {
  return CreateBookingSchema.partial().parse(data);
};

export const validateSlotReservation = (data: unknown): SlotReservation => {
  return SlotReservationSchema.parse(data);
};

export const validatePaymentIntent = (data: unknown): PaymentIntent => {
  return PaymentIntentSchema.parse(data);
};

// Custom validation error formatter
export const formatValidationError = (error: z.ZodError) => {
  const fieldErrors: Record<string, string> = {};

  error.errors.forEach(err => {
    const path = err.path.join('.');
    fieldErrors[path] = err.message;
  });

  const errorsArray = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return {
    message: 'Validation failed',
    errors: errorsArray,
    field_errors: fieldErrors,
    summary: `${errorsArray.length} validation error(s) encountered`,
    error_count: errorsArray.length
  };
};

// Booking state validation
export const validateBookingStateTransition = (
  currentStatus: string, 
  newStatus: string
): boolean => {
  const validTransitions: Record<string, string[]> = {
    'PENDING': ['PAYMENT_PENDING', 'CANCELLED'],
    'PAYMENT_PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['SCHEDULED', 'CANCELLED'],
    'SCHEDULED': ['IN_PROGRESS', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'],
    'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [], // Terminal state
    'CANCELLED': [], // Terminal state
    'NO_SHOW': ['RESCHEDULED'], // Can reschedule after no-show
    'RESCHEDULED': ['SCHEDULED', 'CANCELLED']
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
};

// Service availability validation
export const validateServiceAvailability = (
  serviceType: string,
  requestedDateTime: string
): { available: boolean; reason?: string } => {
  const date = new Date(requestedDateTime);
  const hour = date.getHours();
  const dayOfWeek = date.getDay();

  switch (serviceType) {
    case 'STANDARD_NOTARY':
      // 9am-5pm Mon-Fri
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { available: false, reason: 'Standard notary service not available on weekends' };
      }
      if (hour < 9 || hour >= 17) {
        return { available: false, reason: 'Standard notary service available 9am-5pm only' };
      }
      break;
      
    case 'EXTENDED_HOURS':
      // 7am-9pm Daily
      if (hour < 7 || hour >= 21) {
        return { available: false, reason: 'Extended hours service available 7am-9pm only' };
      }
      break;
      
    case 'LOAN_SIGNING':
      // By appointment, more flexible
      if (hour < 6 || hour >= 22) {
        return { available: false, reason: 'Loan signing available 6am-10pm' };
      }
      break;
      
    case 'RON_SERVICES':
      // 24/7 availability
      return { available: true };
      
    default:
      return { available: false, reason: 'Unknown service type' };
  }

  return { available: true };
};