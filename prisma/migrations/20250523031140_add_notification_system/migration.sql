-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMATION', 'PAYMENT_CONFIRMATION', 'APPOINTMENT_REMINDER_24HR', 'APPOINTMENT_REMINDER_2HR', 'APPOINTMENT_REMINDER_1HR', 'APPOINTMENT_REMINDER_NOW', 'BOOKING_CANCELLED', 'BOOKING_RESCHEDULED', 'PAYMENT_FAILED', 'PAYMENT_REMINDER', 'NO_SHOW_CHECK', 'POST_SERVICE_FOLLOWUP', 'REVIEW_REQUEST', 'DOCUMENT_READY', 'DOCUMENT_REMINDER', 'NOTARY_ASSIGNMENT', 'EMERGENCY_NOTIFICATION');

-- CreateEnum
CREATE TYPE "NotificationMethod" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "confirmationEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "confirmationSmsSentAt" TIMESTAMP(3),
ADD COLUMN     "followUpSentAt" TIMESTAMP(3),
ADD COLUMN     "lastReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "noShowCheckPerformedAt" TIMESTAMP(3),
ADD COLUMN     "reminder1hrSentAt" TIMESTAMP(3),
ADD COLUMN     "reminder24hrSentAt" TIMESTAMP(3),
ADD COLUMN     "reminder2hrSentAt" TIMESTAMP(3);

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

-- CreateIndex
CREATE INDEX "NotificationLog_bookingId_idx" ON "NotificationLog"("bookingId");

-- CreateIndex
CREATE INDEX "NotificationLog_notificationType_idx" ON "NotificationLog"("notificationType");

-- CreateIndex
CREATE INDEX "NotificationLog_method_idx" ON "NotificationLog"("method");

-- CreateIndex
CREATE INDEX "NotificationLog_recipientEmail_idx" ON "NotificationLog"("recipientEmail");

-- CreateIndex
CREATE INDEX "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");

-- CreateIndex
CREATE INDEX "Booking_lastReminderSentAt_idx" ON "Booking"("lastReminderSentAt");

-- CreateIndex
CREATE INDEX "Booking_noShowCheckPerformedAt_idx" ON "Booking"("noShowCheckPerformedAt");

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
