/*
  Warnings:

  - You are about to drop the `campaign_performance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `promo_code_usage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `promotional_campaigns` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."campaign_performance" DROP CONSTRAINT "campaign_performance_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."promo_code_usage" DROP CONSTRAINT "promo_code_usage_campaign_id_fkey";

-- DropTable
DROP TABLE "public"."campaign_performance";

-- DropTable
DROP TABLE "public"."promo_code_usage";

-- DropTable
DROP TABLE "public"."promotional_campaigns";

-- CreateTable
CREATE TABLE "public"."BookingUploadedDocument" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT,
    "sizeBytes" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingUploadedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingUploadedDocument_bookingId_idx" ON "public"."BookingUploadedDocument"("bookingId");

-- AddForeignKey
ALTER TABLE "public"."BookingUploadedDocument" ADD CONSTRAINT "BookingUploadedDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
