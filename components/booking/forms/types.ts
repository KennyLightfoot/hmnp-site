import { z } from 'zod';

// Unified booking form schema
export const unifiedBookingSchema = z.object({
  // Step 1: Service Selection
  serviceId: z.string().min(1, 'Please select a service'),
  numberOfSigners: z.coerce.number().min(1).max(10, 'Maximum 10 signers allowed'),
  promoCode: z.string().optional(),

  // Step 2: Calendar Selection
  calendarId: z.string().min(1, 'Internal error: Calendar ID missing'),
  appointmentStartTime: z.string().min(1, 'Please select an appointment time'),
  appointmentEndTime: z.string().min(1, 'Internal error: End time missing'),
  appointmentFormattedTime: z.string().min(1, 'Internal error: Formatted time missing'),

  // Step 3: Contact Information
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().min(10, 'Please enter a valid phone number'),

  // Step 4: Location Details
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'PUBLIC_PLACE']),
  addressStreet: z.string().min(5, 'Please enter a valid street address'),
  addressCity: z.string().min(2, 'Please enter a valid city'),
  addressState: z.string().min(2, 'Please enter a valid state'),
  addressZip: z.string().min(5, 'Please enter a valid ZIP code'),
  locationNotes: z.string().optional(),

  // Step 5: Additional Information
  notes: z.string().optional(),
  referredBy: z.string().optional(),
  
  // Consent and Agreements
  consent_terms_conditions: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
  emailUpdates: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
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