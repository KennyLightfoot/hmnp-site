/**
 * Type Guards and Safe Type Assertions
 * Replaces unsafe 'as any' assertions with proper type checking
 * Prevents runtime errors from incorrect type assumptions
 */

import { Role } from '@prisma/client';
import { User } from 'next-auth';

/**
 * Type guard for checking if a user has a role
 */
export function isUserWithRole(user: any): user is User & { role: Role } {
  return user && 
         typeof user === 'object' && 
         typeof user.role === 'string' && 
         Object.values(Role).includes(user.role as Role);
}

/**
 * Type guard for checking if a user is an admin
 */
export function isAdminUser(user: any): user is User & { role: 'ADMIN' } {
  return isUserWithRole(user) && user.role === 'ADMIN';
}

/**
 * Type guard for checking if a user has an email
 */
export function isUserWithEmail(user: any): user is User & { email: string } {
  return user && 
         typeof user === 'object' && 
         typeof user.email === 'string' && 
         user.email.length > 0;
}

/**
 * Type guard for checking if a user has an ID
 */
export function isUserWithId(user: any): user is User & { id: string } {
  return user && 
         typeof user === 'object' && 
         typeof user.id === 'string' && 
         user.id.length > 0;
}

/**
 * Type guard for checking if an object has customer information
 */
export interface CustomerInfo {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export function hasCustomerInfo(obj: any): obj is CustomerInfo {
  return obj && typeof obj === 'object';
}

/**
 * Safe getter for customer name from booking data
 */
export function getCustomerName(data: any): string | null {
  if (!hasCustomerInfo(data)) return null;
  
  // Try direct customerName first
  if (typeof data.customerName === 'string') {
    return data.customerName;
  }
  
  // Try firstName + lastName
  if (typeof data.firstName === 'string') {
    const lastName = typeof data.lastName === 'string' ? data.lastName : '';
    return `${data.firstName} ${lastName}`.trim();
  }
  
  return null;
}

/**
 * Safe getter for customer email from booking data
 */
export function getCustomerEmail(data: any): string | null {
  if (!hasCustomerInfo(data)) return null;
  
  if (typeof data.customerEmail === 'string') {
    return data.customerEmail;
  }
  
  if (typeof data.email === 'string') {
    return data.email;
  }
  
  return null;
}

/**
 * Safe getter for customer phone from booking data
 */
export function getCustomerPhone(data: any): string | null {
  if (!hasCustomerInfo(data)) return null;
  
  if (typeof data.customerPhone === 'string') {
    return data.customerPhone;
  }
  
  if (typeof data.phone === 'string') {
    return data.phone;
  }
  
  return null;
}

/**
 * Type guard for Stripe webhook events
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export function isStripeWebhookEvent(obj: any): obj is StripeWebhookEvent {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.type === 'string' &&
         obj.data &&
         typeof obj.data === 'object';
}

/**
 * Type guard for Stripe payment intent
 */
export interface StripePaymentIntent {
  id: string;
  status: string;
  metadata?: Record<string, string>;
}

export function isStripePaymentIntent(obj: any): obj is StripePaymentIntent {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.status === 'string';
}

/**
 * Safe getter for booking ID from Stripe metadata
 */
export function getBookingIdFromStripeMetadata(paymentIntent: any): string | null {
  if (!paymentIntent || typeof paymentIntent !== 'object') return null;
  
  const metadata = paymentIntent.metadata;
  if (!metadata || typeof metadata !== 'object') return null;
  
  const bookingId = metadata.bookingId;
  return typeof bookingId === 'string' ? bookingId : null;
}

/**
 * Type guard for error objects
 */
export function isError(obj: any): obj is Error {
  return obj instanceof Error || 
         (obj && typeof obj === 'object' && typeof obj.message === 'string');
}

/**
 * Safe error message getter
 */
export function getErrorMessage(error: any): string {
  if (isError(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && typeof error.toString === 'function') {
    return error.toString();
  }
  
  return 'Unknown error occurred';
}

/**
 * Type guard for objects with status property
 */
export function hasStatus(obj: any): obj is { status: string } {
  return obj && typeof obj === 'object' && typeof obj.status === 'string';
}

/**
 * Type guard for booking status enums
 */
import { BookingStatus } from '@prisma/client';

export function isValidBookingStatus(status: any): status is BookingStatus {
  return typeof status === 'string' && 
         Object.values(BookingStatus).includes(status as BookingStatus);
}

/**
 * Safe booking status converter
 */
export function toBookingStatus(status: any): BookingStatus | null {
  if (isValidBookingStatus(status)) {
    return status;
  }
  return null;
}

/**
 * Type guard for URL parameters
 */
export function isValidUrlParams(params: any): params is Record<string, string | string[]> {
  return params && typeof params === 'object';
}

/**
 * Safe parameter getter
 */
export function getStringParam(params: any, key: string): string | null {
  if (!params || typeof params !== 'object') return null;
  
  const value = params[key];
  if (typeof value === 'string') {
    return value;
  }
  
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0];
  }
  
  return null;
}

/**
 * Type utilities for safer type assertions
 */
export const TypeUtils = {
  // User-related type guards
  isUserWithRole,
  isAdminUser,
  isUserWithEmail,
  isUserWithId,
  
  // Customer data helpers
  getCustomerName,
  getCustomerEmail,
  getCustomerPhone,
  
  // Stripe-related type guards
  isStripeWebhookEvent,
  isStripePaymentIntent,
  getBookingIdFromStripeMetadata,
  
  // Error handling
  isError,
  getErrorMessage,
  
  // Status handling
  hasStatus,
  isValidBookingStatus,
  toBookingStatus,
  
  // URL parameter handling
  isValidUrlParams,
  getStringParam,
}; 