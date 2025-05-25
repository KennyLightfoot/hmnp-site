/*
  Warnings:

  - The values [SCHEDULED,AWAITING_CLIENT_ACTION,READY_FOR_SERVICE,IN_PROGRESS,CANCELLED_BY_CLIENT,CANCELLED_BY_STAFF,REQUIRES_RESCHEDULE,ARCHIVED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLIENT_ADDRESS,PUBLIC_PLACE,VIRTUAL_RON] on the enum `LocationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'PAYMENT_PENDING', 'PAYMENT_FAILED');
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "LocationType_new" AS ENUM ('CLIENT_SPECIFIED_ADDRESS', 'OUR_OFFICE', 'REMOTE_ONLINE_NOTARIZATION');
ALTER TABLE "Booking" ALTER COLUMN "locationType" TYPE "LocationType_new" USING ("locationType"::text::"LocationType_new");
ALTER TYPE "LocationType" RENAME TO "LocationType_old";
ALTER TYPE "LocationType_new" RENAME TO "LocationType";
DROP TYPE "LocationType_old";
COMMIT;
