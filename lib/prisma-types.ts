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

// Import and then re-export PrismaClient and Prisma namespace
// so consumers can import from '@/lib/prisma-types'.
import { PrismaClient, Prisma } from '@prisma/client'
export { PrismaClient, Prisma }

// Import and re-export model types from the generated Prisma client.
// Using the direct '.prisma/client' module avoids any issues with how
// '@prisma/client' is augmented or bundled in different environments.
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
} from '.prisma/client'

// Re-export enum *types* so they can be used in type positions.
// These map directly to the underlying Prisma enum types.
export type BookingStatus = Prisma.BookingStatus
export type ServiceType = Prisma.ServiceType
export type LocationType = Prisma.LocationType
export type PaymentStatus = Prisma.PaymentStatus
export type PaymentProvider = Prisma.PaymentProvider
export type PaymentMethod = Prisma.PaymentMethod
export type NotificationType = Prisma.NotificationType
export type NotificationMethod = Prisma.NotificationMethod
export type NotificationStatus = Prisma.NotificationStatus
export type Role = Prisma.Role
export type ContractorPayoutStatus = Prisma.ContractorPayoutStatus
export type ContractorPayoutEntryType = Prisma.ContractorPayoutEntryType
export type QAStatus = Prisma.QAStatus
export type DiscountType = Prisma.DiscountType
export type SupportIssueType = Prisma.SupportIssueType
export type SupportPriority = Prisma.SupportPriority
export type SupportStatus = Prisma.SupportStatus
export type AlertSeverity = Prisma.AlertSeverity
export type AlertStatus = Prisma.AlertStatus
export type AssignmentStatus = Prisma.AssignmentStatus
export type LogLevel = Prisma.LogLevel
export type witness_source = Prisma.witness_source
export type NotaryApplicationStatus = Prisma.NotaryApplicationStatus
export type NotaryOnboardingStatus = Prisma.NotaryOnboardingStatus
export type BackgroundCheckStatus = Prisma.BackgroundCheckStatus
export type NotaryAvailabilityStatus = Prisma.NotaryAvailabilityStatus
export type JobOfferStatus = Prisma.JobOfferStatus

// Re-export enums as runtime values via the Prisma namespace.
// In Prisma 6.x, enums live under `Prisma.<EnumName>` at runtime.
export const BookingStatus = Prisma.BookingStatus
export const ServiceType = Prisma.ServiceType
export const LocationType = Prisma.LocationType
export const PaymentStatus = Prisma.PaymentStatus
export const PaymentProvider = Prisma.PaymentProvider
export const PaymentMethod = Prisma.PaymentMethod
export const NotificationType = Prisma.NotificationType
export const NotificationMethod = Prisma.NotificationMethod
export const NotificationStatus = Prisma.NotificationStatus
export const Role = Prisma.Role
export const ContractorPayoutStatus = Prisma.ContractorPayoutStatus
export const ContractorPayoutEntryType = Prisma.ContractorPayoutEntryType
export const QAStatus = Prisma.QAStatus
export const DiscountType = Prisma.DiscountType
export const SupportIssueType = Prisma.SupportIssueType
export const SupportPriority = Prisma.SupportPriority
export const SupportStatus = Prisma.SupportStatus
export const AlertSeverity = Prisma.AlertSeverity
export const AlertStatus = Prisma.AlertStatus
export const AssignmentStatus = Prisma.AssignmentStatus
export const LogLevel = Prisma.LogLevel
export const witness_source = Prisma.witness_source
export const NotaryApplicationStatus = Prisma.NotaryApplicationStatus
export const NotaryOnboardingStatus = Prisma.NotaryOnboardingStatus
export const BackgroundCheckStatus = Prisma.BackgroundCheckStatus
export const NotaryAvailabilityStatus = Prisma.NotaryAvailabilityStatus
export const JobOfferStatus = Prisma.JobOfferStatus
