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

    CONSTRAINT "MessageReview_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MessageReview_messageId_key" UNIQUE ("messageId")
);

-- AddForeignKey
ALTER TABLE "OutboundMessage" ADD CONSTRAINT "OutboundMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReview" ADD CONSTRAINT "MessageReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReview" ADD CONSTRAINT "MessageReview_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "OutboundMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "OutboundMessage_bookingId_idx" ON "OutboundMessage"("bookingId");
CREATE INDEX "OutboundMessage_messageType_idx" ON "OutboundMessage"("messageType");
CREATE INDEX "OutboundMessage_status_idx" ON "OutboundMessage"("status");
CREATE INDEX "OutboundMessage_sendAt_idx" ON "OutboundMessage"("sendAt");

