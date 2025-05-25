/*
  Warnings:

  - The values [CANCELLED,PAYMENT_FAILED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('REQUESTED', 'PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED', 'AWAITING_CLIENT_ACTION', 'READY_FOR_SERVICE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF', 'REQUIRES_RESCHEDULE', 'ARCHIVED');
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- AlterEnum
ALTER TYPE "LocationType" ADD VALUE 'PUBLIC_PLACE';
