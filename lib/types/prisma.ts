/**
 * TypeScript type definitions that mirror our Prisma schema models
 * This provides type safety when working with database objects
 */

import {
  BookingStatus,
  PaymentStatus,
  PaymentProvider,
  NotificationType,
  NotificationMethod,
  Prisma,
} from '@/lib/prisma-types';

// Derive base model shapes from Prisma's generated types instead of importing
// model types directly from '@/lib/prisma-types'.
type Booking = Prisma.BookingGetPayload<{}>;
type User = Prisma.UserGetPayload<{}>;
type PrismaService = Prisma.ServiceGetPayload<{}>;

/**
 * Booking model with related entities - matches actual Prisma structure
 */
export type BookingWithRelations = Booking & {
  /**
   * Explicitly include the primary key so that downstream files that rely on
   * this composite type (and that may be compiled in isolation by Next.js) can
   * safely access `booking.id` without running into a TypeScript error.
   * Extending `Booking` already brings in the `id` field, but some parts of the
   * code-base (e.g. `app/admin/bookings/page.tsx`) are compiled in an isolated
   * module context which occasionally loses the intersection with the base
   * model.  Declaring it here avoids that edge-case while keeping the type
   * accurate.
   */
  id: string;
  status: BookingStatus;
  updatedAt: Date;
  scheduledDateTime?: Date | null;
  Service?: PrismaService | null;
  User_Booking_signerIdToUser?: User | null;
  Payment?: Payment[] | null;
  notifications?: Notification[] | null;
  // Allow additional dynamic fields that may be attached during queries or response shaping
  [key: string]: unknown;
}

/**
 * Payment model with related entities
 */
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerPaymentId?: string | null;
  providerIntentId?: string | null;
  metadata?: any | null;
  refundedAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  booking: BookingWithRelations;
}

/**
 * Service model with related entities
 */
export type Service = PrismaService & {
  bookings?: BookingWithRelations[] | null;
}

/**
 * Notification model with related entities
 */
export interface Notification {
  id: string;
  type: NotificationType;
  method: NotificationMethod;
  recipientId: string;
  bookingId?: string | null;
  subject?: string | null;
  content?: string | null;
  metadata?: any | null;
  sentAt?: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  booking?: BookingWithRelations | null;
}

/**
 * Recipient type for notifications
 */
export interface NotificationRecipient {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Notification content structure
 */
export interface NotificationContent {
  subject?: string;
  message?: string;
  metadata?: Record<string, any>;
}
