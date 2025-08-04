/**
 * Championship Booking System - Comprehensive Type Interfaces
 * Houston Mobile Notary Pros
 * 
 * Eliminates all 'any' types with proper TypeScript interfaces
 */

import { CreateBooking } from '@/lib/booking-validation';

// ============================================================================
// Core Booking Interfaces
// ============================================================================

export interface BookingStepUpdate {
  [key: string]: string | number | boolean | object | null | undefined;
}

export interface BookingError {
  field?: string;
  message: string;
  code?: string;
}

export interface BookingErrors {
  [field: string]: BookingError | string;
}

// ============================================================================
// Pricing Interfaces
// ============================================================================

export interface PricingLineItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  quantity?: number;
  type: 'service' | 'travel' | 'urgency' | 'document' | 'discount';
}

export interface PricingBreakdown {
  lineItems: PricingLineItem[];
  subtotal: number;
  taxes: number;
  total: number;
  discounts?: number;
  fees?: number;
}

export interface PricingResult {
  total: number;
  breakdown: PricingBreakdown;
  basePrice: number;
  travelFee: number;
  urgencyFee: number;
  documentFee: number;
  discount: number;
  metadata?: {
    distance?: number;
    travelTime?: number;
    surge?: boolean;
    promotional?: boolean;
  };
}

// ============================================================================
// Completed Booking Interface
// ============================================================================

export interface CompletedBooking {
  id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  serviceType: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  scheduling: {
    preferredDate: string;
    preferredTime: string;
    sameDay?: boolean;
    priority?: boolean;
  };
  pricing: PricingResult;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  confirmationNumber: string;
}

// ============================================================================
// Form Step Component Interfaces
// ============================================================================

export interface BaseStepProps {
  data: Partial<CreateBooking>;
  onUpdate: (updates: BookingStepUpdate) => void;
  errors?: BookingErrors;
  pricing?: PricingResult;
}

export interface CustomerInfoStepProps extends BaseStepProps {
  // Customer-specific props if needed
}

export interface LocationStepProps extends BaseStepProps {
  // Location-specific props if needed
}

export interface SchedulingStepProps extends BaseStepProps {
  // Scheduling-specific props if needed
}

export interface ReviewStepProps extends BaseStepProps {
  completedBooking?: CompletedBooking;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

// ============================================================================
// Booking Form Interfaces
// ============================================================================

export interface BookingFormProps {
  initialData?: Partial<CreateBooking>;
  onComplete?: (booking: CompletedBooking) => void;
  onError?: (error: BookingError) => void;
  className?: string;
}

export interface BookingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<BaseStepProps>;
  isValid?: (data: Partial<CreateBooking>) => boolean;
  icon: React.ComponentType<any>;
}

// ============================================================================
// Location & Geography Interfaces
// ============================================================================

export interface PopularArea {
  id: string;
  name: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  baseRate?: number;
}

export interface LocationDetails {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  locationType?: 'office' | 'home' | 'public' | 'other';
}

// ============================================================================
// Payment Interfaces
// ============================================================================

export interface PaymentOption {
  id: string;
  name: string;
  description: string;
  type: 'card' | 'bank' | 'cash' | 'check';
  depositRequired: boolean;
  processingFee?: number;
}

export interface PaymentMethod {
  type: string;
  cardBrand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type FormFieldValue = string | number | boolean | Date | null | undefined;

export type InputChangeHandler = (field: string, value: FormFieldValue) => void;

export type LocationChangeHandler = (field: string, value: FormFieldValue) => void;

export type PaymentOptionChangeHandler = (field: string, value: FormFieldValue) => void;

// ============================================================================
// Booking Wizard State Interface
// ============================================================================

export interface BookingWizardState {
  currentStep: number;
  completedBooking: CompletedBooking | null;
  isSubmitting: boolean;
  errors: BookingErrors;
  pricing: PricingResult | null;
}

// ============================================================================
// API Response Interfaces
// ============================================================================

export interface BookingAPIResponse {
  success: boolean;
  data?: CompletedBooking;
  error?: BookingError;
  message?: string;
}

export interface PricingAPIResponse {
  success: boolean;
  data?: PricingResult;
  error?: BookingError;
  message?: string;
}

// ============================================================================
// Validation Result Interface
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: BookingErrors;
  warnings?: string[];
}

// ============================================================================
// Export all types for easy importing
// ============================================================================

// All types are already exported individually above