import { z } from 'zod';

// Validation helpers
const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
const zipCodeRegex = /^\d{5}(-\d{4})?$/;
const nameRegex = /^[a-zA-Z\s\-'\.]{2,50}$/;

// Unified booking form schema with comprehensive validation
export const unifiedBookingSchema = z.object({
  // Step 1: Service Selection
  serviceId: z.string().min(1, 'Please select a service'),
  numberOfSigners: z.coerce.number()
    .min(1, 'At least 1 signer is required')
    .max(10, 'Maximum 10 signers allowed')
    .int('Number of signers must be a whole number'),
  promoCode: z.string()
    .optional()
    .refine(
      (val) => !val || val.length >= 3,
      { message: 'Promo code must be at least 3 characters' }
    ),

  // Step 2: Calendar Selection
  calendarId: z.string().min(1, 'Please select an appointment time'),
  appointmentStartTime: z.string()
    .min(1, 'Please select an appointment time')
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      return date > now;
    }, { message: 'Appointment time must be in the future' }),
  appointmentEndTime: z.string().min(1, 'Appointment end time is required'),
  appointmentFormattedTime: z.string().min(1, 'Formatted time is required'),

  // Step 3: Contact Information
  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
    .refine((val) => val.trim().split(' ').length >= 2, {
      message: 'Please enter both first and last name'
    }),
  customerEmail: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase(),
  customerPhone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(phoneRegex, 'Please enter a valid phone number')
    .transform((val) => val.replace(/\D/g, '')), // Remove non-digits

  // Step 4: Location Details
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'PUBLIC_PLACE'], {
    errorMap: () => ({ message: 'Please select a location type' })
  }),
  addressStreet: z.string()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address must be less than 100 characters')
    .refine((val) => /\d/.test(val), {
      message: 'Street address must include a house/building number'
    }),
  addressCity: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'City name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  addressState: z.string()
    .min(2, 'Please enter a valid state')
    .max(2, 'State must be 2 characters (e.g., TX)')
    .regex(/^[A-Z]{2}$/, 'State must be 2 uppercase letters (e.g., TX)')
    .transform((val) => val.toUpperCase()),
  addressZip: z.string()
    .regex(zipCodeRegex, 'Please enter a valid ZIP code (12345 or 12345-6789)')
    .transform((val) => val.replace(/\D/g, '').slice(0, 5)), // Keep only first 5 digits
  locationNotes: z.string()
    .max(500, 'Location notes must be less than 500 characters')
    .optional(),

  // Step 5: Additional Information
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  referredBy: z.string()
    .max(100, 'Referral source must be less than 100 characters')
    .optional(),
  
  // Consent and Agreements
  consent_terms_conditions: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions to proceed'
  }),
  emailUpdates: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
}).refine((data) => {
  // Cross-field validation: If location type is PUBLIC_PLACE, address fields should be minimal
  if (data.locationType === 'PUBLIC_PLACE') {
    return data.addressStreet.toLowerCase().includes('public') || 
           data.addressCity.length > 0;
  }
  return true;
}, {
  message: 'Please provide appropriate location details for the selected location type',
  path: ['addressStreet']
});

export type UnifiedBookingFormData = z.infer<typeof unifiedBookingSchema>;

// Service interface
export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  isActive: boolean;
  requiresDeposit: boolean;
  depositAmount?: number;
}

// Booking form steps
export const BOOKING_STEPS = [
  { id: 1, name: 'Service', description: 'Choose your service' },
  { id: 2, name: 'Date & Time', description: 'Select appointment' },
  { id: 3, name: 'Contact', description: 'Your information' },
  { id: 4, name: 'Location', description: 'Where to meet' },
  { id: 5, name: 'Review', description: 'Confirm details' },
] as const;

// Form step validation groups
export const STEP_FIELDS = {
  1: ['serviceId', 'numberOfSigners', 'promoCode'],
  2: ['calendarId', 'appointmentStartTime', 'appointmentEndTime', 'appointmentFormattedTime'],
  3: ['customerName', 'customerEmail', 'customerPhone'],
  4: ['locationType', 'addressStreet', 'addressCity', 'addressState', 'addressZip'],
  5: ['consent_terms_conditions'],
} as const;

// Location types
export const LOCATION_TYPES = [
  {
    value: 'CLIENT_SPECIFIED_ADDRESS',
    label: 'My Home/Office',
    description: 'We come to your location'
  },
  {
    value: 'PUBLIC_PLACE',
    label: 'Public Location',
    description: 'Coffee shop, library, etc.'
  }
] as const;