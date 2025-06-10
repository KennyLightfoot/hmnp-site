/*
  Warnings:

  - Made the column `depositAmount` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'LEAD_NURTURING';

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "requiresDeposit" SET DEFAULT true,
ALTER COLUMN "depositAmount" SET NOT NULL,
ALTER COLUMN "depositAmount" SET DEFAULT 25.00;
