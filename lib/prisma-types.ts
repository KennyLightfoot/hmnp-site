/**
 * Centralized Prisma exports for app/lib code.
 *
 * Use this instead of importing directly from '@prisma/client' in most places.
 *
 * IMPORTANT:
 * - We import only `PrismaClient` and `Prisma` from '@prisma/client'.
 * - We then re-expose enum runtime values and enum *types* via the `Prisma` namespace.
 * - This avoids depending on individual enum symbols being exported at the top level
 *   of '@prisma/client', which can vary between environments.
 */

import { PrismaClient, Prisma } from '@prisma/client'

export { PrismaClient, Prisma }

// ---- Enum runtime values re-exported from Prisma namespace ----

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

// ---- Enum *types* re-exported for use in type positions ----

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


