-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "campaignName" TEXT,
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "ghlContactId" TEXT,
ADD COLUMN     "leadSource" TEXT,
ADD COLUMN     "stripePaymentUrl" TEXT,
ADD COLUMN     "workflowId" TEXT;
