-- Notary network schema additions (applications + job offers)

-- Create enums only if they do not already exist to keep reruns idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'NotaryApplicationStatus'
  ) THEN
    CREATE TYPE "NotaryApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CONVERTED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'JobOfferStatus'
  ) THEN
    CREATE TYPE "JobOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');
  END IF;
END $$;

-- Notary applications table
CREATE TABLE IF NOT EXISTS "NotaryApplication" (
  "id" TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "commissionNumber" TEXT,
  "commissionState" TEXT,
  "commissionExpiry" DATE,
  "statesLicensed" TEXT[] NOT NULL,
  "countiesServed" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "yearsExperience" INTEGER,
  "serviceTypes" TEXT[] NOT NULL,
  "languagesSpoken" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "specialCertifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "eoInsuranceProvider" TEXT,
  "eoInsurancePolicy" TEXT,
  "eoInsuranceExpiry" DATE,
  "baseAddress" TEXT,
  "baseZip" TEXT,
  "serviceRadiusMiles" INTEGER DEFAULT 25,
  "availabilityNotes" TEXT,
  "whyInterested" TEXT,
  "references" TEXT,
  "resumeUrl" TEXT,
  "status" "NotaryApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMPTZ(6),
  "reviewNotes" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "convertedToUserId" TEXT UNIQUE,
  "convertedAt" TIMESTAMPTZ(6)
);

CREATE UNIQUE INDEX IF NOT EXISTS "NotaryApplication_email_key"
  ON "NotaryApplication"("email");

CREATE INDEX IF NOT EXISTS "NotaryApplication_status_idx"
  ON "NotaryApplication"("status");

CREATE INDEX IF NOT EXISTS "NotaryApplication_createdAt_idx"
  ON "NotaryApplication"("createdAt");

ALTER TABLE "NotaryApplication"
  ADD CONSTRAINT "NotaryApplication_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NotaryApplication"
  ADD CONSTRAINT "NotaryApplication_convertedToUserId_fkey"
  FOREIGN KEY ("convertedToUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Job offer table for notary network dispatching
CREATE TABLE IF NOT EXISTS "JobOffer" (
  "id" TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL,
  "notaryId" TEXT NOT NULL,
  "status" "JobOfferStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMPTZ(6) NOT NULL,
  "notifiedAt" TIMESTAMPTZ(6),
  "acceptedAt" TIMESTAMPTZ(6),
  "declinedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "JobOffer_booking_notary_unique"
  ON "JobOffer"("bookingId", "notaryId");

CREATE INDEX IF NOT EXISTS "JobOffer_bookingId_idx"
  ON "JobOffer"("bookingId");

CREATE INDEX IF NOT EXISTS "JobOffer_notaryId_idx"
  ON "JobOffer"("notaryId");

CREATE INDEX IF NOT EXISTS "JobOffer_status_idx"
  ON "JobOffer"("status");

CREATE INDEX IF NOT EXISTS "JobOffer_expiresAt_idx"
  ON "JobOffer"("expiresAt");

ALTER TABLE "JobOffer"
  ADD CONSTRAINT "JobOffer_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobOffer"
  ADD CONSTRAINT "JobOffer_notaryId_fkey"
  FOREIGN KEY ("notaryId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

