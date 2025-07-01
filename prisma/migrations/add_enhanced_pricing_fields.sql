-- Enhanced Pricing and Distance Tracking Schema
-- Implements SOP_ENHANCED.md database requirements

-- Add enhanced pricing and distance fields to Booking table
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "calculatedDistance" REAL;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "travelFee" DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "serviceAreaValidated" BOOLEAN DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "pricingBreakdown" JSONB;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "distanceCalculationMeta" JSONB;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "pricingVersion" VARCHAR(10) DEFAULT '2.0.0';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_booking_calculated_distance" ON "Booking"("calculatedDistance");
CREATE INDEX IF NOT EXISTS "idx_booking_service_area_validated" ON "Booking"("serviceAreaValidated");
CREATE INDEX IF NOT EXISTS "idx_booking_travel_fee" ON "Booking"("travelFee");

-- Create PricingAuditLog table for tracking pricing calculations
CREATE TABLE IF NOT EXISTS "PricingAuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "bookingId" TEXT,
  "serviceType" TEXT NOT NULL,
  "calculationInputs" JSONB NOT NULL,
  "pricingResult" JSONB NOT NULL,
  "distanceData" JSONB,
  "version" VARCHAR(10) DEFAULT '2.0.0',
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "requestId" TEXT,
  "userId" TEXT,
  
  CONSTRAINT "PricingAuditLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for PricingAuditLog
CREATE INDEX IF NOT EXISTS "idx_pricing_audit_booking_id" ON "PricingAuditLog"("bookingId");
CREATE INDEX IF NOT EXISTS "idx_pricing_audit_service_type" ON "PricingAuditLog"("serviceType");
CREATE INDEX IF NOT EXISTS "idx_pricing_audit_calculated_at" ON "PricingAuditLog"("calculatedAt");
CREATE INDEX IF NOT EXISTS "idx_pricing_audit_request_id" ON "PricingAuditLog"("requestId");

-- Create ServiceAreaCache table for caching distance calculations
CREATE TABLE IF NOT EXISTS "ServiceAreaCache" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "addressHash" VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash of normalized address
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
  "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  "hitCount" INTEGER NOT NULL DEFAULT 1,
  "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for ServiceAreaCache
CREATE INDEX IF NOT EXISTS "idx_service_area_cache_address_hash" ON "ServiceAreaCache"("addressHash");
CREATE INDEX IF NOT EXISTS "idx_service_area_cache_distance" ON "ServiceAreaCache"("distanceMiles");
CREATE INDEX IF NOT EXISTS "idx_service_area_cache_expires_at" ON "ServiceAreaCache"("expiresAt");
CREATE INDEX IF NOT EXISTS "idx_service_area_cache_last_accessed" ON "ServiceAreaCache"("lastAccessedAt");

-- Add comments for documentation
COMMENT ON COLUMN "Booking"."calculatedDistance" IS 'Distance in miles from service center (ZIP 77591) to booking location';
COMMENT ON COLUMN "Booking"."travelFee" IS 'Travel fee charged based on distance per SOP requirements';
COMMENT ON COLUMN "Booking"."serviceAreaValidated" IS 'Whether booking location has been validated against service area limits';
COMMENT ON COLUMN "Booking"."pricingBreakdown" IS 'JSON object containing complete pricing breakdown per SOP_ENHANCED.md';
COMMENT ON COLUMN "Booking"."distanceCalculationMeta" IS 'Metadata about distance calculation (API source, accuracy, etc.)';
COMMENT ON COLUMN "Booking"."pricingVersion" IS 'Version of pricing engine used for calculation';

COMMENT ON TABLE "PricingAuditLog" IS 'Audit trail for all pricing calculations performed by the enhanced pricing engine';
COMMENT ON TABLE "ServiceAreaCache" IS 'Cache for Google Maps distance calculations to improve performance and reduce API costs';

-- Create function to automatically update lastAccessedAt and hitCount
CREATE OR REPLACE FUNCTION update_service_area_cache_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW."lastAccessedAt" = CURRENT_TIMESTAMP;
  NEW."hitCount" = OLD."hitCount" + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cache access updates
DROP TRIGGER IF EXISTS trigger_update_cache_access ON "ServiceAreaCache";
CREATE TRIGGER trigger_update_cache_access
  BEFORE UPDATE ON "ServiceAreaCache"
  FOR EACH ROW
  EXECUTE FUNCTION update_service_area_cache_access();

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_service_area_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM "ServiceAreaCache" 
  WHERE "expiresAt" < CURRENT_TIMESTAMP;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup
  INSERT INTO "PricingAuditLog" (
    "id",
    "serviceType", 
    "calculationInputs",
    "pricingResult",
    "version",
    "requestId"
  ) VALUES (
    'cache_cleanup_' || extract(epoch from now())::text,
    'CACHE_CLEANUP',
    jsonb_build_object('operation', 'cleanup', 'deletedCount', deleted_count),
    jsonb_build_object('success', true, 'deletedEntries', deleted_count),
    '2.0.0',
    'auto_cleanup_' || extract(epoch from now())::text
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;