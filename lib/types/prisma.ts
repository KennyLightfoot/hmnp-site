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
  User,
  Booking,
  Service as PrismaService
} from '@prisma/client';

/**
 * Booking model with related entities - matches actual Prisma structure
 */
export type BookingWithRelations = Booking & {
  service?: PrismaService | null;
  User_Booking_signerIdToUser?: User | null;
  Payment?: Payment[] | null;
  notifications?: Notification[] | null;
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
