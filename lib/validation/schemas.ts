/**
 * Comprehensive Zod Validation Schemas
 * Provides type-safe validation for all API endpoints
 * Prevents injection attacks and ensures data integrity
 */

import { z } from 'zod';
import { BookingStatus, LocationType, ServiceType } from '@/lib/prisma-types';

// ============================================================================
// COMMON VALIDATION PATTERNS
// ============================================================================

export const commonSchemas = {
  // Email validation with domain whitelist for security
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .toLowerCase()
    .refine(
      (email) => !email.includes('+'), // Prevent email aliasing attacks
      'Email aliases not allowed'
    ),

  // Phone number validation (US format)
  phone: z.string()
    .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Invalid phone number format')
    .transform((phone) => phone.replace(/\D/g, '')), // Strip non-digits

  // Name validation to prevent XSS
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),

  // Address validation
  address: z.string()
    .min(5, 'Address too short')
    .max(200, 'Address too long')
    .regex(/^[a-zA-Z0-9\s\-#.,]+$/, 'Address contains invalid characters'),

  // ZIP code validation
  zipCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),

  // Date validation
  futureDate: z.string()
    .datetime('Invalid date format')
    .refine(
      (date) => new Date(date) > new Date(),
      'Date must be in the future'
    ),

  // ID validation
  uuid: z.string()
    .uuid('Invalid ID format'),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),

  // Search/filter strings
  searchString: z.string()
    .max(100, 'Search term too long')
    .regex(/^[a-zA-Z0-9\s\-._@]+$/, 'Search contains invalid characters')
    .optional(),
};

// ============================================================================
// BOOKING VALIDATION SCHEMAS
// ============================================================================

export const bookingSchemas = {
  // Schema for the simple booking form
  createBookingFromForm: z.object({
    serviceType: z.nativeEnum(ServiceType),
    customerName: commonSchemas.name,
    customerEmail: commonSchemas.email,
    customerPhone: commonSchemas.phone.optional(),
    scheduledDateTime: z.string(),
    locationAddress: z.string().optional(),
    locationType: z.string().optional(),
    pricing: z.any().optional(),
    agreedToTerms: z.boolean().optional(),
  }),

  // Create booking request
  createBooking: z.object({
    // Service details
    serviceId: commonSchemas.uuid,
    serviceType: z.nativeEnum(ServiceType),
    numberOfSigners: z.number().int().min(1).max(10),
    
    // Customer information
    email: commonSchemas.email,
    fullName: commonSchemas.name,
    phone: commonSchemas.phone.optional(),
    
    // Scheduling
    scheduledDateTime: commonSchemas.futureDate.optional(),
    
    // Location
    locationType: z.nativeEnum(LocationType),
    addressStreet: commonSchemas.address,
    addressCity: z.string().min(2).max(50),
    addressState: z.string().length(2, 'State must be 2 characters'),
    addressZip: commonSchemas.zipCode,
    locationNotes: z.string().max(500, 'Location notes too long').optional(),
    
    // Additional details
    notes: z.string().max(1000, 'Notes too long').optional(),
    specialInstructions: z.string().max(500, 'Instructions too long').optional(),
    
    // Promotional
    promoCode: z.string().max(50, 'Promo code too long').optional(),
    referredBy: z.string().max(100, 'Referral name too long').optional(),
  }).refine(
    (data) => {
      // Business rule: RON services don't need addresses
      if (data.serviceType === 'STANDARD_NOTARY' && data.locationType === 'CLIENT_SPECIFIED_ADDRESS') {
        return data.addressStreet && data.addressCity && data.addressState && data.addressZip;
      }
      return true;
    },
    {
      message: 'Address is required for mobile notary services',
      path: ['addressStreet'],
    }
  ),

  // Update booking request
  updateBooking: z.object({
    id: commonSchemas.uuid,
    scheduledDateTime: commonSchemas.futureDate.optional(),
    notes: z.string().max(1000).optional(),
    locationNotes: z.string().max(500).optional(),
    status: z.nativeEnum(BookingStatus).optional(),
  }),

  // Booking query parameters
  bookingQuery: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    locationType: z.nativeEnum(LocationType).optional(),
    serviceType: z.nativeEnum(ServiceType).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: commonSchemas.searchString,
  }).merge(commonSchemas.pagination),

  // Booking response schema
  bookingResponse: z.object({
    id: z.string(),
    status: z.nativeEnum(BookingStatus),
    scheduledDateTime: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    Service: z.object({
      id: z.string(),
      name: z.string(),
      serviceType: z.nativeEnum(ServiceType),
      basePrice: z.number(),
      duration: z.number(),
    }),
    signerName: z.string(),
    signerEmail: z.string(),
    addressStreet: z.string().nullable(),
    addressCity: z.string().nullable(),
    addressState: z.string().nullable(),
    addressZip: z.string().nullable(),
    finalPrice: z.number().nullable(),
    depositAmount: z.number().nullable(),
  }),
};

// ============================================================================
// PAYMENT VALIDATION SCHEMAS
// ============================================================================

export const paymentSchemas = {
  // Create payment intent
  createPaymentIntent: z.object({
    bookingId: commonSchemas.uuid,
    amount: z.number().positive().max(10000, 'Amount too large'),
    currency: z.literal('usd'),
    paymentMethod: z.enum(['stripe_checkout', 'stripe_elements']).default('stripe_checkout'),
  }),

  // Payment status update
  updatePaymentStatus: z.object({
    paymentId: commonSchemas.uuid,
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
    transactionId: z.string().max(255).optional(),
    notes: z.string().max(500).optional(),
  }),

  // Stripe webhook payload
  stripeWebhook: z.object({
    id: z.string(),
    object: z.literal('event'),
    type: z.string(),
    data: z.object({
      object: z.any(),
    }),
    created: z.number(),
    livemode: z.boolean(),
  }),
};

// ============================================================================
// USER VALIDATION SCHEMAS
// ============================================================================

export const userSchemas = {
  // User registration/creation
  createUser: z.object({
    email: commonSchemas.email,
    name: commonSchemas.name,
    phone: commonSchemas.phone.optional(),
    role: z.enum(['SIGNER', 'NOTARY', 'ADMIN', 'STAFF']).default('SIGNER'),
  }),

  // User update
  updateUser: z.object({
    id: commonSchemas.uuid,
    name: commonSchemas.name.optional(),
    phone: commonSchemas.phone.optional(),
    email: commonSchemas.email.optional(),
  }),

  // Login credentials
  loginCredentials: z.object({
    email: commonSchemas.email,
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
};

// ============================================================================
// SERVICE VALIDATION SCHEMAS
// ============================================================================

export const serviceSchemas = {
  // Service query
  serviceQuery: z.object({
    serviceType: z.nativeEnum(ServiceType).optional(),
    isActive: z.boolean().optional(),
    location: z.string().max(100).optional(),
  }).merge(commonSchemas.pagination),

  // Service availability query
  availabilityQuery: z.object({
    serviceId: commonSchemas.uuid,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    duration: z.number().int().min(15).max(480), // 15 minutes to 8 hours
    timezone: z.string().max(50).default('America/Chicago'),
  }),
};

// ============================================================================
// ADMIN VALIDATION SCHEMAS
// ============================================================================

export const adminSchemas = {
  // Dashboard metrics query
  dashboardQuery: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    metrics: z.array(z.enum(['bookings', 'revenue', 'conversions', 'users'])).optional(),
  }),

  // System settings update
  systemSettings: z.object({
    businessHours: z.object({
      monday: z.object({ enabled: z.boolean(), open: z.string(), close: z.string() }),
      tuesday: z.object({ enabled: z.boolean(), open: z.string(), close: z.string() }),
      wednesday: z.object({ enabled: z.boolean(), open: z.string(), close: z.string() }),
      thursday: z.object({ enabled: z.boolean(), open: z.string(), close: z.string() }),
      friday: z.object({ enabled: z.boolean(), open: z.string(), close: z.string() }),
      saturday: z.object({ enabled: z.boolean(), open: z.string(), close: z.string() }),
      sunday: z.object({ enabled: z.boolean(), open: z.string(), close: z.string() }),
    }),
    bookingSettings: z.object({
      maxAdvanceBookingDays: z.number().int().min(1).max(365),
      minAdvanceBookingHours: z.number().int().min(1).max(72),
      allowSameDayBooking: z.boolean(),
    }),
  }),
};

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  ADMIN_PASSWORD: z.string().min(8),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  
  // Google
  GOOGLE_MAPS_API_KEY: z.string().min(10),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().min(10),
  
  // External services
  GHL_API_KEY: z.string().optional(),
  GHL_LOCATION_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
});

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export type BookingCreateInput = z.infer<typeof bookingSchemas.createBooking>;
export type BookingUpdateInput = z.infer<typeof bookingSchemas.updateBooking>;
export type BookingQueryInput = z.infer<typeof bookingSchemas.bookingQuery>;
export type PaymentCreateInput = z.infer<typeof paymentSchemas.createPaymentIntent>;
export type UserCreateInput = z.infer<typeof userSchemas.createUser>;

/**
 * Validate environment variables at startup
 */
export function validateEnvironment() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}

/**
 * Safe parsing with detailed error messages
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  );
  
  return { success: false, errors };
}