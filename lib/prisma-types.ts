/**
 * Centralized Prisma exports for app/lib code.
 *
 * Use this instead of importing directly from '@prisma/client' in most places.
 *
 * IMPORTANT:
 * - We import the Prisma client module as a whole so we can access both
 *   the `PrismaClient`/`Prisma` exports and the `$Enums` container that
 *   actually holds the enum runtime values.
 * - Enum *values* come from `PrismaModule.$Enums.X`.
 * - Enum *types* are derived from the runtime values, so they stay in sync.
 */

import * as PrismaModule from '@prisma/client'

export const PrismaClient = PrismaModule.PrismaClient
export const Prisma = PrismaModule.Prisma

// Convenience handle for the enum container Prisma attaches at runtime.
// In generated JS, enums live on `exports.$Enums`, e.g. `$Enums.Role.ADMIN`.
const Enums = (PrismaModule as any).$Enums ?? {}

// ---- Enum runtime values re-exported from $Enums ----

export const BookingStatus = Enums.BookingStatus
export const ServiceType = Enums.ServiceType
export const LocationType = Enums.LocationType
export const PaymentStatus = Enums.PaymentStatus
export const PaymentProvider = Enums.PaymentProvider
export const PaymentMethod = Enums.PaymentMethod
export const NotificationType = Enums.NotificationType
export const NotificationMethod = Enums.NotificationMethod
export const NotificationStatus = Enums.NotificationStatus
export const Role = Enums.Role
export const ContractorPayoutStatus = Enums.ContractorPayoutStatus
export const ContractorPayoutEntryType = Enums.ContractorPayoutEntryType
export const QAStatus = Enums.QAStatus
export const DiscountType = Enums.DiscountType
export const SupportIssueType = Enums.SupportIssueType
export const SupportPriority = Enums.SupportPriority
export const SupportStatus = Enums.SupportStatus
export const AlertSeverity = Enums.AlertSeverity
export const AlertStatus = Enums.AlertStatus
export const AssignmentStatus = Enums.AssignmentStatus
export const LogLevel = Enums.LogLevel
export const witness_source = Enums.witness_source
export const NotaryApplicationStatus = Enums.NotaryApplicationStatus
export const NotaryOnboardingStatus = Enums.NotaryOnboardingStatus
export const BackgroundCheckStatus = Enums.BackgroundCheckStatus
export const NotaryAvailabilityStatus = Enums.NotaryAvailabilityStatus
export const JobOfferStatus = Enums.JobOfferStatus

// ---- Enum *types* re-exported for use in type positions ----
// These derive from the runtime values so they stay in sync even if
// Prisma's internal representation changes, and they don't depend on
// '.prisma/client' being directly imported in app code.

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]
export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType]
export type LocationType = (typeof LocationType)[keyof typeof LocationType]
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider]
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]
export type NotificationMethod = (typeof NotificationMethod)[keyof typeof NotificationMethod]
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus]
export type Role = (typeof Role)[keyof typeof Role]
export type ContractorPayoutStatus = (typeof ContractorPayoutStatus)[keyof typeof ContractorPayoutStatus]
export type ContractorPayoutEntryType = (typeof ContractorPayoutEntryType)[keyof typeof ContractorPayoutEntryType]
export type QAStatus = (typeof QAStatus)[keyof typeof QAStatus]
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType]
export type SupportIssueType = (typeof SupportIssueType)[keyof typeof SupportIssueType]
export type SupportPriority = (typeof SupportPriority)[keyof typeof SupportPriority]
export type SupportStatus = (typeof SupportStatus)[keyof typeof SupportStatus]
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity]
export type AlertStatus = (typeof AlertStatus)[keyof typeof AlertStatus]
export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus]
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]
export type witness_source = (typeof witness_source)[keyof typeof witness_source]
export type NotaryApplicationStatus = (typeof NotaryApplicationStatus)[keyof typeof NotaryApplicationStatus]
export type NotaryOnboardingStatus = (typeof NotaryOnboardingStatus)[keyof typeof NotaryOnboardingStatus]
export type BackgroundCheckStatus = (typeof BackgroundCheckStatus)[keyof typeof BackgroundCheckStatus]
export type NotaryAvailabilityStatus = (typeof NotaryAvailabilityStatus)[keyof typeof NotaryAvailabilityStatus]
export type JobOfferStatus = (typeof JobOfferStatus)[keyof typeof JobOfferStatus]

