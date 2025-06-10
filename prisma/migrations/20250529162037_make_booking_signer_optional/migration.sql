-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_signerId_fkey";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "signerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
