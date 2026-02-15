-- CreateEnum
CREATE TYPE "OutboundMessageType" AS ENUM ('APPOINTMENT_REMINDER', 'PAYMENT_REMINDER', 'MISSED_CALL_FOLLOWUP', 'BOOKING_CONFIRMATION', 'BOOKING_NUDGE');

-- CreateEnum
CREATE TYPE "OutboundChannel" AS ENUM ('SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "OutboundMessageStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'REVIEW_REQUIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "MessageReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContentJobType" AS ENUM ('BLOG', 'AD', 'REVIEW_REPLY', 'CUSTOMER_REPLY', 'DOCUMENT_SUMMARY');

-- CreateEnum
CREATE TYPE "ContentJobStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH', 'ESTATE_PLANNING', 'SPECIALTY_NOTARY', 'BUSINESS_SOLUTIONS');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('CLIENT_SPECIFIED_ADDRESS', 'OUR_OFFICE', 'REMOTE_ONLINE_NOTARIZATION', 'PUBLIC_PLACE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('REQUESTED', 'PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED', 'AWAITING_CLIENT_ACTION', 'READY_FOR_SERVICE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF', 'REQUIRES_RESCHEDULE', 'ARCHIVED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'VOIDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'SQUARE', 'PAYPAL', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAY_ON_SITE', 'CARD', 'ACH', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractorPayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "ContractorPayoutEntryType" AS ENUM ('BASE', 'TRAVEL_SHARE', 'URGENCY_BONUS', 'WITNESS_SPLIT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "QAStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'FLAGGED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMATION', 'PAYMENT_CONFIRMATION', 'APPOINTMENT_REMINDER_24HR', 'APPOINTMENT_REMINDER_2HR', 'APPOINTMENT_REMINDER_1HR', 'APPOINTMENT_REMINDER_NOW', 'BOOKING_CANCELLED', 'BOOKING_RESCHEDULED', 'PAYMENT_FAILED', 'PAYMENT_REMINDER', 'NO_SHOW_CHECK', 'POST_SERVICE_FOLLOWUP', 'REVIEW_REQUEST', 'DOCUMENT_READY', 'DOCUMENT_REMINDER', 'NOTARY_ASSIGNMENT', 'EMERGENCY_NOTIFICATION', 'LEAD_NURTURING', 'PAYMENT_UPDATE');

-- CreateEnum
CREATE TYPE "NotificationMethod" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'PARTNER', 'SIGNER', 'NOTARY');

-- CreateEnum
CREATE TYPE "SupportIssueType" AS ENUM ('booking_question', 'payment_issue', 'reschedule_request', 'cancellation_request', 'service_issue', 'technical_support', 'billing_inquiry', 'general_inquiry', 'complaint', 'feedback');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'ACKNOWLEDGED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'SIGNED', 'RETURNED_TO_TITLE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('ERROR', 'WARN', 'INFO', 'DEBUG');

-- CreateEnum
CREATE TYPE "witness_source" AS ENUM ('customer_provided', 'staff_provided', 'proof_provided');

-- CreateEnum
CREATE TYPE "NotaryApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "NotaryOnboardingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DOCUMENTS_PENDING', 'COMPLETE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotaryAvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'UNAVAILABLE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "JobOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresDeposit" BOOLEAN NOT NULL DEFAULT true,
    "depositAmount" DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalCalendarId" TEXT,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "signerId" TEXT,
    "serviceId" TEXT NOT NULL,
    "notaryId" TEXT,
    "scheduledDateTime" TIMESTAMP(3),
    "actualEndDateTime" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "locationType" "LocationType",
    "addressStreet" TEXT,
    "addressCity" TEXT,
    "addressState" TEXT,
    "addressZip" TEXT,
    "locationNotes" TEXT,
    "priceAtBooking" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "dailyRoomUrl" TEXT,
    "dailyRecordingId" TEXT,
    "kbaStatus" TEXT,
    "idVerificationStatus" TEXT,
    "notaryJournalEntry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmationEmailSentAt" TIMESTAMP(3),
    "confirmationSmsSentAt" TIMESTAMP(3),
    "followUpSentAt" TIMESTAMP(3),
    "lastReminderSentAt" TIMESTAMP(3),
    "noShowCheckPerformedAt" TIMESTAMP(3),
    "reminder1hrSentAt" TIMESTAMP(3),
    "reminder24hrSentAt" TIMESTAMP(3),
    "reminder2hrSentAt" TIMESTAMP(3),
    "depositAmount" DECIMAL(10,2),
    "depositStatus" "PaymentStatus" DEFAULT 'PENDING',
    "googleCalendarEventId" TEXT,
    "promoCodeDiscount" DECIMAL(10,2),
    "promoCodeId" TEXT,
    "campaignName" TEXT,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "ghlContactId" TEXT,
    "leadSource" TEXT,
    "stripePaymentUrl" TEXT,
    "workflowId" TEXT,
    "witness_type" "witness_source",
    "witness_fee" DECIMAL(5,2) DEFAULT 0,
    "mileage_miles" DECIMAL(5,2),
    "mileage_fee" DECIMAL(5,2) DEFAULT 0,
    "urgency_level" VARCHAR(20) DEFAULT 'standard',
    "urgency_fee" DECIMAL(5,2) DEFAULT 0,
    "estimated_completion_time" TIMESTAMPTZ(6),
    "notary_travel_time_minutes" INTEGER,
    "google_maps_distance_matrix" JSONB,
    "service_area_id" TEXT,
    "calculatedDistance" REAL,
    "distanceCalculationMeta" JSONB,
    "pricingBreakdown" JSONB,
    "pricingVersion" VARCHAR(10) DEFAULT '2.0.0',
    "serviceAreaValidated" BOOLEAN DEFAULT false,
    "travelFee" DECIMAL(10,2) DEFAULT 0.00,
    "stripeSessionId" TEXT,
    "proofSessionUrl" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PAY_ON_SITE',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "totalPaid" DECIMAL(10,2) DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "paidMarkedByUserId" TEXT,
    "paidNotes" TEXT,
    "sendToNetwork" BOOLEAN DEFAULT false,
    "networkOfferExpiresAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingUploadedDocument" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT,
    "sizeBytes" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingUploadedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingQARecord" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "qaUserId" TEXT,
    "status" "QAStatus" NOT NULL DEFAULT 'PENDING',
    "journalEntryVerified" BOOLEAN NOT NULL DEFAULT false,
    "sealPhotoVerified" BOOLEAN NOT NULL DEFAULT false,
    "documentCountVerified" BOOLEAN NOT NULL DEFAULT false,
    "clientConfirmationVerified" BOOLEAN NOT NULL DEFAULT false,
    "closeoutFormVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "followUpAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingQARecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PaymentProvider" NOT NULL,
    "transactionId" TEXT,
    "paymentIntentId" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAmount" DECIMAL(10,2),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorPayout" (
    "id" TEXT NOT NULL,
    "notaryId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "ContractorPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "ContractorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorPayoutEntry" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "bookingId" TEXT,
    "entryType" "ContractorPayoutEntryType" NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractorPayoutEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "issueType" "SupportIssueType" NOT NULL,
    "priority" "SupportPriority" NOT NULL DEFAULT 'medium',
    "description" TEXT NOT NULL,
    "status" "SupportStatus" NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "customerSatisfaction" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportResponse" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "responseTime" INTEGER NOT NULL,
    "nextSteps" TEXT[],
    "escalationNeeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SupportResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSupportHistory" (
    "id" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "CustomerSupportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minimumAmount" DECIMAL(10,2),
    "maxDiscountAmount" DECIMAL(10,2),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "perCustomerLimit" INTEGER DEFAULT 1,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableServices" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PARTNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardedAt" TIMESTAMP(3),
    "password" TEXT,
    "customer_preferences" JSONB,
    "notary_availability" JSONB,
    "marketing_consent" BOOLEAN DEFAULT false,
    "sms_consent" BOOLEAN DEFAULT false,
    "push_notification_token" VARCHAR(500),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundMessage" (
    "id" TEXT NOT NULL,
    "messageType" "OutboundMessageType" NOT NULL,
    "riskLevel" "MessageRiskLevel" NOT NULL DEFAULT 'LOW',
    "templateKey" TEXT NOT NULL,
    "bookingId" TEXT,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "channel" "OutboundChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "sendAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "status" "OutboundMessageStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReview" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "scenario" "OutboundMessageType" NOT NULL,
    "riskLevel" "MessageRiskLevel" NOT NULL,
    "status" "MessageReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentJob" (
    "id" TEXT NOT NULL,
    "type" "ContentJobType" NOT NULL,
    "status" "ContentJobStatus" NOT NULL DEFAULT 'NEW',
    "title" TEXT,
    "instructions" TEXT,
    "targetCity" TEXT,
    "serviceType" TEXT,
    "tonePreset" TEXT,
    "agentJobId" TEXT,
    "draft" JSONB,
    "approvedContent" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "leadsCaptured" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTwoFactor" (
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTwoFactor_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "business_rules_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_type" VARCHAR(50) NOT NULL,
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_rules_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_change_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID NOT NULL,
    "old_config" JSONB,
    "new_config" JSONB NOT NULL,
    "change_reason" TEXT,
    "changed_by" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "category" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "reference" TEXT,
    "title" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "partnerAssignedToId" TEXT,
    "propertyAddress" TEXT,
    "borrowerName" TEXT,
    "closingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "allowPartnerComments" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentDocument" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT,

    CONSTRAINT "AssignmentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundError" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackgroundError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadLog" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotarizationDocument" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "signedS3Key" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceAssignmentDocumentId" TEXT,
    "bookingId" TEXT NOT NULL,

    CONSTRAINT "NotarizationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "method" "NotificationMethod" NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingAuditLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "serviceType" TEXT NOT NULL,
    "calculationInputs" JSONB NOT NULL,
    "pricingResult" JSONB NOT NULL,
    "distanceData" JSONB,
    "version" VARCHAR(10) NOT NULL DEFAULT '2.0.0',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT,
    "userId" TEXT,

    CONSTRAINT "PricingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAreaCache" (
    "id" TEXT NOT NULL,
    "addressHash" VARCHAR(64) NOT NULL,
    "originalAddress" TEXT NOT NULL,
    "normalizedAddress" TEXT NOT NULL,
    "distanceMiles" REAL NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "isWithinStandardArea" BOOLEAN NOT NULL,
    "isWithinExtendedArea" BOOLEAN NOT NULL,
    "travelFeeStandard" DECIMAL(10,2) NOT NULL,
    "travelFeeExtended" DECIMAL(10,2) NOT NULL,
    "apiSource" VARCHAR(20) NOT NULL DEFAULT 'google_maps',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAreaCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL,
    "note" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAlert" (
    "id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "detail" JSONB,

    CONSTRAINT "SystemAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "userId" TEXT,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "entity" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB,
    "prevHash" TEXT,
    "hash" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_metrics" (
    "date" DATE NOT NULL,
    "total_bookings" INTEGER DEFAULT 0,
    "mobile_bookings" INTEGER DEFAULT 0,
    "ron_bookings" INTEGER DEFAULT 0,
    "completed_bookings" INTEGER DEFAULT 0,
    "cancelled_bookings" INTEGER DEFAULT 0,
    "total_revenue" DECIMAL(10,2) DEFAULT 0,
    "mobile_revenue" DECIMAL(10,2) DEFAULT 0,
    "ron_revenue" DECIMAL(10,2) DEFAULT 0,
    "proof_costs" DECIMAL(10,2) DEFAULT 0,
    "mileage_costs" DECIMAL(10,2) DEFAULT 0,
    "stripe_fees" DECIMAL(10,2) DEFAULT 0,
    "net_revenue" DECIMAL(10,2) DEFAULT 0,
    "margin_percentage" DECIMAL(5,2),
    "average_booking_value" DECIMAL(10,2),
    "conversion_rate" DECIMAL(5,2),
    "customer_satisfaction" DECIMAL(3,2),
    "new_customers" INTEGER DEFAULT 0,
    "repeat_customers" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_metrics_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "gmb_activity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "data" JSONB,
    "gmbPostId" TEXT,
    "bookingId" TEXT,
    "reviewId" TEXT,
    "ghlContactId" TEXT,
    "engagement" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gmb_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "reviewerName" VARCHAR(200) NOT NULL,
    "reviewerEmail" VARCHAR(255),
    "rating" SMALLINT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "serviceType" VARCHAR(100),
    "platform" VARCHAR(50),
    "externalId" VARCHAR(255),
    "externalUrl" VARCHAR(500),
    "bookingId" TEXT,
    "ghlContactId" VARCHAR(100),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "responseText" TEXT,
    "responseDate" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citations" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "address_street" TEXT,
    "address_city" TEXT,
    "address_state" TEXT,
    "address_zip" TEXT,
    "address_formatted" TEXT,
    "business_hours" JSONB,
    "categories" TEXT[],
    "rating" DOUBLE PRECISION,
    "review_count" INTEGER,
    "photos" TEXT[],
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discovered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "nap_consistency" INTEGER NOT NULL DEFAULT 0,
    "domain_authority" INTEGER,
    "platform_category" TEXT,
    "importance" TEXT,
    "submission_method" TEXT,
    "managed_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citation_audits" (
    "id" TEXT NOT NULL,
    "citation_id" TEXT NOT NULL,
    "audit_type" TEXT NOT NULL,
    "previous_data" JSONB,
    "current_data" JSONB,
    "consistency_score" INTEGER NOT NULL,
    "inconsistencies" JSONB,
    "recommendations" TEXT[],
    "audit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "audited_by" TEXT,

    CONSTRAINT "citation_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directory_submissions" (
    "id" TEXT NOT NULL,
    "directory_name" TEXT NOT NULL,
    "directory_url" TEXT NOT NULL,
    "submission_status" TEXT NOT NULL DEFAULT 'pending',
    "submission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approval_date" TIMESTAMP(3),
    "business_data" JSONB NOT NULL,
    "submission_method" TEXT NOT NULL,
    "tracking_id" TEXT,
    "notes" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "directory_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_seo_metrics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_citations" INTEGER NOT NULL DEFAULT 0,
    "verified_citations" INTEGER NOT NULL DEFAULT 0,
    "claimed_citations" INTEGER NOT NULL DEFAULT 0,
    "consistent_citations" INTEGER NOT NULL DEFAULT 0,
    "avg_consistency_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "google_citations" INTEGER NOT NULL DEFAULT 0,
    "yelp_citations" INTEGER NOT NULL DEFAULT 0,
    "facebook_citations" INTEGER NOT NULL DEFAULT 0,
    "local_citations" INTEGER NOT NULL DEFAULT 0,
    "niche_citations" INTEGER NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "new_reviews" INTEGER NOT NULL DEFAULT 0,
    "local_search_clicks" INTEGER NOT NULL DEFAULT 0,
    "local_search_views" INTEGER NOT NULL DEFAULT 0,
    "local_ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "directory_submissions" INTEGER NOT NULL DEFAULT 0,
    "approved_submissions" INTEGER NOT NULL DEFAULT 0,
    "pending_submissions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_seo_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "key" VARCHAR(100) NOT NULL,
    "enabled" BOOLEAN DEFAULT false,
    "description" TEXT,
    "rollout_percentage" INTEGER DEFAULT 0,
    "target_roles" TEXT[],
    "target_users" TEXT[],
    "environment" VARCHAR(20) DEFAULT 'development',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "mileage_cache" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "origin_address" VARCHAR(500),
    "destination_address" VARCHAR(500),
    "distance_miles" DECIMAL(5,2),
    "duration_minutes" INTEGER,
    "google_maps_response" JSONB,
    "last_calculated" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "hit_count" INTEGER DEFAULT 1,

    CONSTRAINT "mileage_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notary_journal" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "booking_id" TEXT,
    "notary_id" TEXT NOT NULL,
    "entry_date" DATE NOT NULL,
    "journal_number" INTEGER,
    "document_type" VARCHAR(100),
    "signer_name" VARCHAR(200),
    "signer_id_type" VARCHAR(50),
    "signer_id_state" VARCHAR(2),
    "notarial_act_type" VARCHAR(50),
    "fee_charged" DECIMAL(10,2),
    "location" TEXT,
    "additional_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notary_journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notary_profiles" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "user_id" TEXT NOT NULL,
    "commission_number" VARCHAR(50),
    "commission_expiry" DATE,
    "base_address" TEXT,
    "base_zip" VARCHAR(10),
    "service_radius_miles" INTEGER DEFAULT 25,
    "is_active" BOOLEAN DEFAULT true,
    "emergency_contact" VARCHAR(20),
    "preferred_service_types" TEXT[],
    "preferred_zip_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferred_start_hour" INTEGER DEFAULT 8,
    "preferred_end_hour" INTEGER DEFAULT 20,
    "daily_capacity" INTEGER DEFAULT 8,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "onboarding_status" "NotaryOnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "eo_insurance_provider" VARCHAR(200),
    "eo_insurance_policy" VARCHAR(100),
    "eo_insurance_expiry" DATE,
    "eo_insurance_document_url" TEXT,
    "background_check_status" "BackgroundCheckStatus" NOT NULL DEFAULT 'PENDING',
    "background_check_date" DATE,
    "background_check_document_url" TEXT,
    "w9_on_file" BOOLEAN DEFAULT false,
    "w9_document_url" TEXT,
    "states_licensed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "counties_served" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages_spoken" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "years_experience" INTEGER,
    "special_certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability_status" "NotaryAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "notary_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchAssignment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "notaryId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "DispatchAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaryApplication" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "commissionNumber" TEXT,
    "commissionState" TEXT,
    "commissionExpiry" DATE,
    "statesLicensed" TEXT[],
    "countiesServed" TEXT[],
    "yearsExperience" INTEGER,
    "serviceTypes" TEXT[],
    "languagesSpoken" TEXT[],
    "specialCertifications" TEXT[],
    "eoInsuranceProvider" TEXT,
    "eoInsurancePolicy" TEXT,
    "eoInsuranceExpiry" DATE,
    "baseAddress" TEXT,
    "baseZip" TEXT,
    "serviceRadiusMiles" INTEGER DEFAULT 25,
    "availabilityNotes" TEXT,
    "whyInterested" TEXT,
    "references" TEXT,
    "resumeUrl" TEXT,
    "status" "NotaryApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "convertedToUserId" TEXT,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "NotaryApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOffer" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "notaryId" TEXT NOT NULL,
    "status" "JobOfferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_areas" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "polygon_coordinates" JSONB,
    "service_fee_multiplier" DECIMAL(3,2) DEFAULT 1.0,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentBlog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "metaDescription" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "filePath" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'agents',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentBlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLead" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "message" TEXT,
    "serviceType" TEXT,
    "urgency" TEXT,
    "status" TEXT,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "correlationId" TEXT,
    "customerName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "serviceType" TEXT,
    "status" TEXT,
    "appointmentDateTime" TIMESTAMP(3),
    "confirmedPrice" DECIMAL(10,2),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPricingQuote" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "baseFee" DECIMAL(10,2),
    "travelFee" DECIMAL(10,2),
    "rushFee" DECIMAL(10,2),
    "metadata" JSONB,
    "pricingVersion" TEXT,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentPricingQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Service_externalCalendarId_key" ON "Service"("externalCalendarId");

-- CreateIndex
CREATE INDEX "Service_isActive_idx" ON "Service"("isActive");

-- CreateIndex
CREATE INDEX "Service_serviceType_idx" ON "Service"("serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_googleCalendarEventId_key" ON "Booking"("googleCalendarEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeSessionId_key" ON "Booking"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Booking_scheduledDateTime_idx" ON "Booking"("scheduledDateTime");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_depositStatus_idx" ON "Booking"("depositStatus");

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");

-- CreateIndex
CREATE INDEX "Booking_paidAt_idx" ON "Booking"("paidAt");

-- CreateIndex
CREATE INDEX "Booking_lastReminderSentAt_idx" ON "Booking"("lastReminderSentAt");

-- CreateIndex
CREATE INDEX "Booking_locationType_idx" ON "Booking"("locationType");

-- CreateIndex
CREATE INDEX "Booking_noShowCheckPerformedAt_idx" ON "Booking"("noShowCheckPerformedAt");

-- CreateIndex
CREATE INDEX "Booking_notaryId_idx" ON "Booking"("notaryId");

-- CreateIndex
CREATE INDEX "Booking_priceAtBooking_idx" ON "Booking"("priceAtBooking");

-- CreateIndex
CREATE INDEX "Booking_promoCodeId_idx" ON "Booking"("promoCodeId");

-- CreateIndex
CREATE INDEX "Booking_serviceId_idx" ON "Booking"("serviceId");

-- CreateIndex
CREATE INDEX "Booking_signerId_idx" ON "Booking"("signerId");

-- CreateIndex
CREATE INDEX "idx_booking_calculated_distance" ON "Booking"("calculatedDistance");

-- CreateIndex
CREATE INDEX "idx_booking_pricing_version" ON "Booking"("pricingVersion");

-- CreateIndex
CREATE INDEX "idx_booking_service_area" ON "Booking"("service_area_id");

-- CreateIndex
CREATE INDEX "idx_booking_service_area_validated" ON "Booking"("serviceAreaValidated");

-- CreateIndex
CREATE INDEX "idx_booking_travel_fee" ON "Booking"("travelFee");

-- CreateIndex
CREATE INDEX "idx_booking_urgency" ON "Booking"("urgency_level");

-- CreateIndex
CREATE INDEX "idx_booking_witness_type" ON "Booking"("witness_type");

-- CreateIndex
CREATE INDEX "idx_booking_send_to_network" ON "Booking"("sendToNetwork");

-- CreateIndex
CREATE INDEX "idx_booking_network_offer_expires" ON "Booking"("networkOfferExpiresAt");

-- CreateIndex
CREATE INDEX "BookingUploadedDocument_bookingId_idx" ON "BookingUploadedDocument"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingQARecord_bookingId_key" ON "BookingQARecord"("bookingId");

-- CreateIndex
CREATE INDEX "BookingQARecord_qaUserId_idx" ON "BookingQARecord"("qaUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_paymentIntentId_idx" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_provider_idx" ON "Payment"("provider");

-- CreateIndex
CREATE INDEX "ContractorPayout_notaryId_periodStart_periodEnd_idx" ON "ContractorPayout"("notaryId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "ContractorPayout_notaryId_periodStart_periodEnd_key" ON "ContractorPayout"("notaryId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "ContractorPayoutEntry_payoutId_idx" ON "ContractorPayoutEntry"("payoutId");

-- CreateIndex
CREATE INDEX "ContractorPayoutEntry_bookingId_idx" ON "ContractorPayoutEntry"("bookingId");

-- CreateIndex
CREATE INDEX "SupportTicket_customerEmail_idx" ON "SupportTicket"("customerEmail");

-- CreateIndex
CREATE INDEX "SupportTicket_bookingId_idx" ON "SupportTicket"("bookingId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE INDEX "SupportTicket_issueType_idx" ON "SupportTicket"("issueType");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedTo_idx" ON "SupportTicket"("assignedTo");

-- CreateIndex
CREATE INDEX "SupportResponse_ticketId_idx" ON "SupportResponse"("ticketId");

-- CreateIndex
CREATE INDEX "CustomerSupportHistory_customerEmail_idx" ON "CustomerSupportHistory"("customerEmail");

-- CreateIndex
CREATE INDEX "CustomerSupportHistory_ticketId_idx" ON "CustomerSupportHistory"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "PromoCode_createdById_idx" ON "PromoCode"("createdById");

-- CreateIndex
CREATE INDEX "PromoCode_isActive_idx" ON "PromoCode"("isActive");

-- CreateIndex
CREATE INDEX "PromoCode_validFrom_validUntil_idx" ON "PromoCode"("validFrom", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "OutboundMessage_bookingId_idx" ON "OutboundMessage"("bookingId");

-- CreateIndex
CREATE INDEX "OutboundMessage_messageType_idx" ON "OutboundMessage"("messageType");

-- CreateIndex
CREATE INDEX "OutboundMessage_status_idx" ON "OutboundMessage"("status");

-- CreateIndex
CREATE INDEX "OutboundMessage_sendAt_idx" ON "OutboundMessage"("sendAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReview_messageId_key" ON "MessageReview"("messageId");

-- CreateIndex
CREATE INDEX "ContentJob_status_idx" ON "ContentJob"("status");

-- CreateIndex
CREATE INDEX "ContentJob_agentJobId_idx" ON "ContentJob"("agentJobId");

-- CreateIndex
CREATE INDEX "UserTwoFactor_isEnabled_idx" ON "UserTwoFactor"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "business_rules_config_rule_type_key" ON "business_rules_config"("rule_type");

-- CreateIndex
CREATE INDEX "business_rules_config_active_idx" ON "business_rules_config"("is_active");

-- CreateIndex
CREATE INDEX "rule_change_log_rule_id_idx" ON "rule_change_log"("rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSettings_key_key" ON "BusinessSettings"("key");

-- CreateIndex
CREATE INDEX "BusinessSettings_category_idx" ON "BusinessSettings"("category");

-- CreateIndex
CREATE INDEX "BusinessSettings_key_idx" ON "BusinessSettings"("key");

-- CreateIndex
CREATE INDEX "BusinessSettings_updatedById_idx" ON "BusinessSettings"("updatedById");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_reference_key" ON "Assignment"("reference");

-- CreateIndex
CREATE INDEX "Comment_assignmentId_idx" ON "Comment"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationToken_token_key" ON "InvitationToken"("token");

-- CreateIndex
CREATE INDEX "InvitationToken_email_idx" ON "InvitationToken"("email");

-- CreateIndex
CREATE INDEX "InvitationToken_userId_idx" ON "InvitationToken"("userId");

-- CreateIndex
CREATE INDEX "NotarizationDocument_bookingId_idx" ON "NotarizationDocument"("bookingId");

-- CreateIndex
CREATE INDEX "NotarizationDocument_sourceAssignmentDocumentId_idx" ON "NotarizationDocument"("sourceAssignmentDocumentId");

-- CreateIndex
CREATE INDEX "NotarizationDocument_uploadedById_idx" ON "NotarizationDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "NotificationLog_bookingId_idx" ON "NotificationLog"("bookingId");

-- CreateIndex
CREATE INDEX "NotificationLog_method_idx" ON "NotificationLog"("method");

-- CreateIndex
CREATE INDEX "NotificationLog_notificationType_idx" ON "NotificationLog"("notificationType");

-- CreateIndex
CREATE INDEX "NotificationLog_recipientEmail_idx" ON "NotificationLog"("recipientEmail");

-- CreateIndex
CREATE INDEX "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");

-- CreateIndex
CREATE INDEX "PricingAuditLog_bookingId_idx" ON "PricingAuditLog"("bookingId");

-- CreateIndex
CREATE INDEX "PricingAuditLog_calculatedAt_idx" ON "PricingAuditLog"("calculatedAt");

-- CreateIndex
CREATE INDEX "PricingAuditLog_requestId_idx" ON "PricingAuditLog"("requestId");

-- CreateIndex
CREATE INDEX "PricingAuditLog_serviceType_idx" ON "PricingAuditLog"("serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAreaCache_addressHash_key" ON "ServiceAreaCache"("addressHash");

-- CreateIndex
CREATE INDEX "ServiceAreaCache_addressHash_idx" ON "ServiceAreaCache"("addressHash");

-- CreateIndex
CREATE INDEX "ServiceAreaCache_distanceMiles_idx" ON "ServiceAreaCache"("distanceMiles");

-- CreateIndex
CREATE INDEX "ServiceAreaCache_expiresAt_idx" ON "ServiceAreaCache"("expiresAt");

-- CreateIndex
CREATE INDEX "ServiceAreaCache_lastAccessedAt_idx" ON "ServiceAreaCache"("lastAccessedAt");

-- CreateIndex
CREATE INDEX "SystemAlert_createdAt_idx" ON "SystemAlert"("createdAt");

-- CreateIndex
CREATE INDEX "SystemAlert_severity_idx" ON "SystemAlert"("severity");

-- CreateIndex
CREATE INDEX "SystemAlert_status_idx" ON "SystemAlert"("status");

-- CreateIndex
CREATE INDEX "SystemLog_component_idx" ON "SystemLog"("component");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX "SystemLog_timestamp_idx" ON "SystemLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_bookingId_timestamp_idx" ON "AuditLog"("bookingId", "timestamp");

-- CreateIndex
CREATE INDEX "idx_daily_metrics_date" ON "daily_metrics"("date");

-- CreateIndex
CREATE INDEX "idx_gmb_activity_type" ON "gmb_activity"("type");

-- CreateIndex
CREATE INDEX "idx_gmb_activity_status" ON "gmb_activity"("status");

-- CreateIndex
CREATE INDEX "idx_gmb_activity_created_at" ON "gmb_activity"("createdAt");

-- CreateIndex
CREATE INDEX "idx_gmb_activity_booking_id" ON "gmb_activity"("bookingId");

-- CreateIndex
CREATE INDEX "idx_gmb_activity_ghl_contact_id" ON "gmb_activity"("ghlContactId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_externalId_key" ON "reviews"("externalId");

-- CreateIndex
CREATE INDEX "idx_reviews_rating" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "idx_reviews_platform" ON "reviews"("platform");

-- CreateIndex
CREATE INDEX "idx_reviews_approved" ON "reviews"("isApproved");

-- CreateIndex
CREATE INDEX "idx_reviews_featured" ON "reviews"("isFeatured");

-- CreateIndex
CREATE INDEX "idx_reviews_created_at" ON "reviews"("createdAt");

-- CreateIndex
CREATE INDEX "idx_reviews_booking_id" ON "reviews"("bookingId");

-- CreateIndex
CREATE INDEX "idx_reviews_ghl_contact" ON "reviews"("ghlContactId");

-- CreateIndex
CREATE INDEX "citations_platform_idx" ON "citations"("platform");

-- CreateIndex
CREATE INDEX "citations_nap_consistency_idx" ON "citations"("nap_consistency");

-- CreateIndex
CREATE INDEX "citations_status_idx" ON "citations"("status");

-- CreateIndex
CREATE INDEX "citation_audits_citation_id_idx" ON "citation_audits"("citation_id");

-- CreateIndex
CREATE INDEX "citation_audits_audit_date_idx" ON "citation_audits"("audit_date");

-- CreateIndex
CREATE INDEX "directory_submissions_submission_status_idx" ON "directory_submissions"("submission_status");

-- CreateIndex
CREATE INDEX "directory_submissions_submission_date_idx" ON "directory_submissions"("submission_date");

-- CreateIndex
CREATE INDEX "local_seo_metrics_date_idx" ON "local_seo_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "local_seo_metrics_date_key" ON "local_seo_metrics"("date");

-- CreateIndex
CREATE INDEX "idx_feature_flags_environment" ON "feature_flags"("environment");

-- CreateIndex
CREATE INDEX "idx_mileage_cache_addresses" ON "mileage_cache"("origin_address", "destination_address");

-- CreateIndex
CREATE INDEX "idx_mileage_cache_calculated" ON "mileage_cache"("last_calculated");

-- CreateIndex
CREATE UNIQUE INDEX "mileage_cache_origin_address_destination_address_key" ON "mileage_cache"("origin_address", "destination_address");

-- CreateIndex
CREATE INDEX "idx_notary_journal_booking_id" ON "notary_journal"("booking_id");

-- CreateIndex
CREATE INDEX "idx_notary_journal_notary_date" ON "notary_journal"("notary_id", "entry_date");

-- CreateIndex
CREATE UNIQUE INDEX "notary_journal_notary_id_journal_number_key" ON "notary_journal"("notary_id", "journal_number");

-- CreateIndex
CREATE UNIQUE INDEX "notary_profiles_user_id_key" ON "notary_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_notary_profiles_active" ON "notary_profiles"("is_active");

-- CreateIndex
CREATE INDEX "idx_notary_profiles_user_id" ON "notary_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_notary_profiles_onboarding" ON "notary_profiles"("onboarding_status");

-- CreateIndex
CREATE INDEX "idx_notary_profiles_availability" ON "notary_profiles"("availability_status");

-- CreateIndex
CREATE INDEX "DispatchAssignment_bookingId_idx" ON "DispatchAssignment"("bookingId");

-- CreateIndex
CREATE INDEX "DispatchAssignment_notaryId_idx" ON "DispatchAssignment"("notaryId");

-- CreateIndex
CREATE INDEX "DispatchAssignment_assignedAt_idx" ON "DispatchAssignment"("assignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotaryApplication_email_key" ON "NotaryApplication"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NotaryApplication_convertedToUserId_key" ON "NotaryApplication"("convertedToUserId");

-- CreateIndex
CREATE INDEX "idx_notary_application_status" ON "NotaryApplication"("status");

-- CreateIndex
CREATE INDEX "idx_notary_application_email" ON "NotaryApplication"("email");

-- CreateIndex
CREATE INDEX "idx_notary_application_created" ON "NotaryApplication"("createdAt");

-- CreateIndex
CREATE INDEX "idx_job_offer_booking" ON "JobOffer"("bookingId");

-- CreateIndex
CREATE INDEX "idx_job_offer_notary" ON "JobOffer"("notaryId");

-- CreateIndex
CREATE INDEX "idx_job_offer_status" ON "JobOffer"("status");

-- CreateIndex
CREATE INDEX "idx_job_offer_expires" ON "JobOffer"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "unique_booking_notary_offer" ON "JobOffer"("bookingId", "notaryId");

-- CreateIndex
CREATE UNIQUE INDEX "service_areas_name_key" ON "service_areas"("name");

-- CreateIndex
CREATE INDEX "idx_service_areas_active" ON "service_areas"("active");

-- CreateIndex
CREATE UNIQUE INDEX "AgentBlog_jobId_key" ON "AgentBlog"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentBlog_slug_key" ON "AgentBlog"("slug");

-- CreateIndex
CREATE INDEX "AgentBlog_publishedAt_idx" ON "AgentBlog"("publishedAt");

-- CreateIndex
CREATE INDEX "AgentBlog_createdAt_idx" ON "AgentBlog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentLead_correlationId_key" ON "AgentLead"("correlationId");

-- CreateIndex
CREATE INDEX "AgentLead_status_idx" ON "AgentLead"("status");

-- CreateIndex
CREATE INDEX "AgentLead_source_idx" ON "AgentLead"("source");

-- CreateIndex
CREATE INDEX "AgentLead_createdAt_idx" ON "AgentLead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentJob_jobId_key" ON "AgentJob"("jobId");

-- CreateIndex
CREATE INDEX "AgentJob_status_idx" ON "AgentJob"("status");

-- CreateIndex
CREATE INDEX "AgentJob_appointmentDateTime_idx" ON "AgentJob"("appointmentDateTime");

-- CreateIndex
CREATE INDEX "AgentJob_createdAt_idx" ON "AgentJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPricingQuote_correlationId_key" ON "AgentPricingQuote"("correlationId");

-- CreateIndex
CREATE INDEX "AgentPricingQuote_needsReview_idx" ON "AgentPricingQuote"("needsReview");

-- CreateIndex
CREATE INDEX "AgentPricingQuote_createdAt_idx" ON "AgentPricingQuote"("createdAt");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_service_area_id_fkey" FOREIGN KEY ("service_area_id") REFERENCES "service_areas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingUploadedDocument" ADD CONSTRAINT "BookingUploadedDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingQARecord" ADD CONSTRAINT "BookingQARecord_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingQARecord" ADD CONSTRAINT "BookingQARecord_qaUserId_fkey" FOREIGN KEY ("qaUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayout" ADD CONSTRAINT "ContractorPayout_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayoutEntry" ADD CONSTRAINT "ContractorPayoutEntry_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "ContractorPayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayoutEntry" ADD CONSTRAINT "ContractorPayoutEntry_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportResponse" ADD CONSTRAINT "SupportResponse_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSupportHistory" ADD CONSTRAINT "CustomerSupportHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundMessage" ADD CONSTRAINT "OutboundMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReview" ADD CONSTRAINT "MessageReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReview" ADD CONSTRAINT "MessageReview_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "OutboundMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentJob" ADD CONSTRAINT "ContentJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTwoFactor" ADD CONSTRAINT "UserTwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_change_log" ADD CONSTRAINT "rule_change_log_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "business_rules_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessSettings" ADD CONSTRAINT "BusinessSettings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_partnerAssignedToId_fkey" FOREIGN KEY ("partnerAssignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentDocument" ADD CONSTRAINT "AssignmentDocument_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentDocument" ADD CONSTRAINT "AssignmentDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadLog" ADD CONSTRAINT "DownloadLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "AssignmentDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadLog" ADD CONSTRAINT "DownloadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationToken" ADD CONSTRAINT "InvitationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotarizationDocument" ADD CONSTRAINT "NotarizationDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotarizationDocument" ADD CONSTRAINT "NotarizationDocument_sourceAssignmentDocumentId_fkey" FOREIGN KEY ("sourceAssignmentDocumentId") REFERENCES "AssignmentDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotarizationDocument" ADD CONSTRAINT "NotarizationDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingAuditLog" ADD CONSTRAINT "PricingAuditLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingAuditLog" ADD CONSTRAINT "PricingAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citation_audits" ADD CONSTRAINT "citation_audits_citation_id_fkey" FOREIGN KEY ("citation_id") REFERENCES "citations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notary_journal" ADD CONSTRAINT "notary_journal_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notary_journal" ADD CONSTRAINT "notary_journal_notary_id_fkey" FOREIGN KEY ("notary_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notary_profiles" ADD CONSTRAINT "notary_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DispatchAssignment" ADD CONSTRAINT "DispatchAssignment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchAssignment" ADD CONSTRAINT "DispatchAssignment_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchAssignment" ADD CONSTRAINT "DispatchAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaryApplication" ADD CONSTRAINT "NotaryApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaryApplication" ADD CONSTRAINT "NotaryApplication_convertedToUserId_fkey" FOREIGN KEY ("convertedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

