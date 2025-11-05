// Minimal mock of @prisma/client to let static build pass without schema
// This file is aliased in next.config.mjs during builds

export class PrismaClient {
  constructor() {}
  $disconnect() { return Promise.resolve(); }
  $connect() { return Promise.resolve(); }
  $queryRaw() { return Promise.resolve([]); }
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  SCHEDULED = 'SCHEDULED',
  CANCELLED_BY_CLIENT = 'CANCELLED_BY_CLIENT',
  CANCELLED_BY_STAFF = 'CANCELLED_BY_STAFF',
  AWAITING_CLIENT_ACTION = 'AWAITING_CLIENT_ACTION',
  READY_FOR_SERVICE = 'READY_FOR_SERVICE',
  REQUESTED = 'REQUESTED',
  REQUIRES_RESCHEDULE = 'REQUIRES_RESCHEDULE',
  ARCHIVED = 'ARCHIVED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  MANUAL = 'MANUAL',
  OTHER = 'OTHER',
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
}

export enum NotificationMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export enum AssignmentStatus {
  REQUESTED = 'REQUESTED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum LocationType {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  HOSPITAL = 'HOSPITAL',
  NURSING_HOME = 'NURSING_HOME',
  JAIL = 'JAIL',
  OTHER = 'OTHER',
  CLIENT_SPECIFIED_ADDRESS = 'CLIENT_SPECIFIED_ADDRESS',
}

export enum ServiceType {
  STANDARD_NOTARY = 'STANDARD_NOTARY',
  MOBILE_NOTARY = 'MOBILE_NOTARY',
  LOAN_SIGNING = 'LOAN_SIGNING',
  RON = 'RON',
  WITNESS = 'WITNESS',
  APOSTILLE = 'APOSTILLE',
  TRANSLATION = 'TRANSLATION',
  OTHER = 'OTHER',
}

export enum Role {
  USER = 'USER',
  NOTARY = 'NOTARY',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

// Mock types for common model types
export type User = any;
export type Booking = any;
export type Service = any;
export type Payment = any;
export type Notification = any;
export type Assignment = any;
export type Comment = any;
export type Prisma = any;

export default PrismaClient
