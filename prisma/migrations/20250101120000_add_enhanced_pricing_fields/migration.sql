-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_booking_pricing_version" ON "Booking"("pricingVersion");

-- AddColumn
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "calculatedDistance" REAL;

-- AddColumn
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "distanceCalculationMeta" JSONB;

-- AddColumn
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "pricingBreakdown" JSONB;

-- AddColumn
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "pricingVersion" VARCHAR(10) DEFAULT '2.0.0';

-- AddColumn
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "serviceAreaValidated" BOOLEAN DEFAULT false;

-- AddColumn
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "travelFee" DECIMAL(10,2) DEFAULT 0.00;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PricingAuditLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "serviceType" TEXT NOT NULL,
    "calculationInputs" JSONB NOT NULL,
    "pricingResult" JSONB NOT NULL,
    "distanceData" JSONB,
    "version" VARCHAR(10) NOT NULL DEFAULT '2.0.0',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT,
    "userId" TEXT,

    CONSTRAINT "PricingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ServiceAreaCache" (
    "id" TEXT NOT NULL,
    "addressHash" VARCHAR(64) NOT NULL,
    "originalAddress" TEXT NOT NULL,
    "normalizedAddress" TEXT NOT NULL,
    "distanceMiles" REAL NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "isWithinStandardArea" BOOLEAN NOT NULL,
    "isWithinExtendedArea" BOOLEAN NOT NULL,
    "travelFeeStandard" DECIMAL(10,2) NOT NULL,
    "travelFeeExtended" DECIMAL(10,2) NOT NULL,
    "apiSource" VARCHAR(20) NOT NULL DEFAULT 'google_maps',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAreaCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PricingAuditLog_bookingId_idx" ON "PricingAuditLog"("bookingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PricingAuditLog_serviceType_idx" ON "PricingAuditLog"("serviceType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PricingAuditLog_calculatedAt_idx" ON "PricingAuditLog"("calculatedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PricingAuditLog_requestId_idx" ON "PricingAuditLog"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceAreaCache_addressHash_key" ON "ServiceAreaCache"("addressHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceAreaCache_addressHash_idx" ON "ServiceAreaCache"("addressHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceAreaCache_distanceMiles_idx" ON "ServiceAreaCache"("distanceMiles");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceAreaCache_expiresAt_idx" ON "ServiceAreaCache"("expiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceAreaCache_lastAccessedAt_idx" ON "ServiceAreaCache"("lastAccessedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_booking_calculated_distance" ON "Booking"("calculatedDistance");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_booking_service_area_validated" ON "Booking"("serviceAreaValidated");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_booking_travel_fee" ON "Booking"("travelFee");

-- AddForeignKey
ALTER TABLE "PricingAuditLog" ADD CONSTRAINT IF NOT EXISTS "PricingAuditLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingAuditLog" ADD CONSTRAINT IF NOT EXISTS "PricingAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add Column Comments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Booking') THEN
        EXECUTE 'COMMENT ON COLUMN "Booking"."calculatedDistance" IS ''Distance in miles from service center (ZIP 77591) to booking location''';
        EXECUTE 'COMMENT ON COLUMN "Booking"."travelFee" IS ''Travel fee charged based on distance per SOP requirements''';
        EXECUTE 'COMMENT ON COLUMN "Booking"."serviceAreaValidated" IS ''Whether booking location has been validated against service area limits''';
        EXECUTE 'COMMENT ON COLUMN "Booking"."pricingBreakdown" IS ''JSON object containing complete pricing breakdown per SOP_ENHANCED.md''';
        EXECUTE 'COMMENT ON COLUMN "Booking"."distanceCalculationMeta" IS ''Metadata about distance calculation (API source, accuracy, etc.)''';
        EXECUTE 'COMMENT ON COLUMN "Booking"."pricingVersion" IS ''Version of pricing engine used for calculation''';
    END IF;
END $$;