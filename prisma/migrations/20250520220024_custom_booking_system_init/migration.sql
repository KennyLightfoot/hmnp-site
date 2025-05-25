/*
  Warnings:

  - You are about to drop the column `sessionId` on the `NotarizationDocument` table. All the data in the column will be lost.
  - You are about to drop the `NotarizationSession` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bookingId` to the `NotarizationDocument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('REQUESTED', 'PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED', 'AWAITING_CLIENT_ACTION', 'READY_FOR_SERVICE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF', 'REQUIRES_RESCHEDULE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('MOBILE_NOTARY', 'RON', 'APOSTILLE', 'LOAN_SIGNING', 'OTHER');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('CLIENT_ADDRESS', 'PUBLIC_PLACE', 'VIRTUAL_RON', 'OUR_OFFICE');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'SQUARE', 'PAYPAL', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'VOIDED');

-- DropForeignKey
ALTER TABLE "NotarizationDocument" DROP CONSTRAINT "NotarizationDocument_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "NotarizationSession" DROP CONSTRAINT "NotarizationSession_notaryId_fkey";

-- DropForeignKey
ALTER TABLE "NotarizationSession" DROP CONSTRAINT "NotarizationSession_signerId_fkey";

-- DropIndex
DROP INDEX "NotarizationDocument_sessionId_idx";

-- AlterTable
ALTER TABLE "NotarizationDocument" DROP COLUMN "sessionId",
ADD COLUMN     "bookingId" TEXT NOT NULL;

-- DropTable
DROP TABLE "NotarizationSession";

-- DropEnum
DROP TYPE "NotarizationStatus";

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresDeposit" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
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

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE INDEX "Service_serviceType_idx" ON "Service"("serviceType");

-- CreateIndex
CREATE INDEX "Service_isActive_idx" ON "Service"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_provider_idx" ON "Payment"("provider");

-- CreateIndex
CREATE INDEX "Payment_paymentIntentId_idx" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Booking_serviceId_idx" ON "Booking"("serviceId");

-- CreateIndex
CREATE INDEX "Booking_signerId_idx" ON "Booking"("signerId");

-- CreateIndex
CREATE INDEX "Booking_notaryId_idx" ON "Booking"("notaryId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_scheduledDateTime_idx" ON "Booking"("scheduledDateTime");

-- CreateIndex
CREATE INDEX "Booking_locationType_idx" ON "Booking"("locationType");

-- CreateIndex
CREATE INDEX "NotarizationDocument_bookingId_idx" ON "NotarizationDocument"("bookingId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotarizationDocument" ADD CONSTRAINT "NotarizationDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
