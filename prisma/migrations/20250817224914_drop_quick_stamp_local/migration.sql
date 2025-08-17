/*
  Warnings:

  - The values [QUICK_STAMP_LOCAL] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
-- Reassign any existing QUICK_STAMP_LOCAL rows to a supported value before enum change
UPDATE "public"."Service"
SET "serviceType" = 'STANDARD_NOTARY'
WHERE "serviceType" = 'QUICK_STAMP_LOCAL';

CREATE TYPE "public"."ServiceType_new" AS ENUM ('STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH', 'ESTATE_PLANNING', 'SPECIALTY_NOTARY', 'BUSINESS_SOLUTIONS');
ALTER TABLE "public"."Service" ALTER COLUMN "serviceType" TYPE "public"."ServiceType_new" USING ("serviceType"::text::"public"."ServiceType_new");
ALTER TYPE "public"."ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "public"."ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "public"."ServiceType_old";
COMMIT;
