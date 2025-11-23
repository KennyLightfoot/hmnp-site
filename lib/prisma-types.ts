/**
 * Centralized Prisma type exports
 *
 * This module re-exports Prisma types, enums, and the client in a way that works
 * reliably with Next.js isolated compilation. Instead of importing directly from
 * '@prisma/client', import from this module.
 *
 * Usage:
 *   import { PrismaClient, Prisma, BookingStatus, User, Booking } from '@/lib/prisma-types'
 *
 * IMPORTANT: Run `pnpm prisma:generate` to generate the Prisma client before using these types.
 * The Prisma client must be generated from your schema.prisma file for these exports to work.
 * 
 * In Prisma 6.x, enums are exported as runtime values and model types are exported as TypeScript types
 * directly from @prisma/client once the client is generated.
 */

// Export PrismaClient and Prisma namespace first
export { PrismaClient, Prisma } from '@prisma/client'

// Import Prisma namespace to access types
import type { Prisma } from '@prisma/client'

// Import enums as values (they are runtime values in Prisma 6.x)
// Try importing directly - if this fails, the client hasn't been generated or the shim isn't working
import {
  BookingStatus,
  ServiceType,
  LocationType,
  PaymentStatus,
  PaymentProvider,
  PaymentMethod,
  NotificationType,
  NotificationMethod,
  NotificationStatus,
  Role,
  ContractorPayoutStatus,
  ContractorPayoutEntryType,
  QAStatus,
  DiscountType,
  SupportIssueType,
  SupportPriority,
  SupportStatus,
  AlertSeverity,
  AlertStatus,
  AssignmentStatus,
  LogLevel,
  witness_source,
  NotaryApplicationStatus,
  NotaryOnboardingStatus,
  BackgroundCheckStatus,
  NotaryAvailabilityStatus,
  JobOfferStatus,
} from '@prisma/client'

// Import and re-export model types
export type {
  User,
  Booking,
  Service,
  Payment,
  Account,
  Session,
  Assignment,
  NotificationLog,
  SystemAlert,
  SystemLog,
  AuditLog,
  SupportTicket,
  SupportResponse,
  CustomerSupportHistory,
  PromoCode,
  ContractorPayout,
  ContractorPayoutEntry,
  NotaryApplication,
  JobOffer,
  notary_profiles,
  BookingUploadedDocument,
  BookingQARecord,
  NotarizationDocument,
  Review,
  GMBActivity,
  StatusHistory,
  Comment,
  AssignmentDocument,
} from '@prisma/client'

// Re-export enums as runtime values (Prisma 6.x exports enums as values)
export {
  BookingStatus,
  ServiceType,
  LocationType,
  PaymentStatus,
  PaymentProvider,
  PaymentMethod,
  NotificationType,
  NotificationMethod,
  NotificationStatus,
  Role,
  ContractorPayoutStatus,
  ContractorPayoutEntryType,
  QAStatus,
  DiscountType,
  SupportIssueType,
  SupportPriority,
  SupportStatus,
  AlertSeverity,
  AlertStatus,
  AssignmentStatus,
  LogLevel,
  witness_source,
  NotaryApplicationStatus,
  NotaryOnboardingStatus,
  BackgroundCheckStatus,
  NotaryAvailabilityStatus,
  JobOfferStatus,
}
