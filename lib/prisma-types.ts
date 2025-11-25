/**
 * Centralized Prisma exports for app/lib code.
 *
 * Use this instead of importing directly from '@prisma/client' in most places.
 */

export {
  PrismaClient,
  Prisma,
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
