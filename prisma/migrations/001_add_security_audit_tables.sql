-- SECURITY: Add security audit tables for tracking pricing manipulation attempts
-- and other security events

-- Create PromoCodeUsage table to track individual usage instances
CREATE TABLE "promo_code_usage" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "promo_code_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "booking_id" TEXT,
    "used_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,

    CONSTRAINT "promo_code_usage_pkey" PRIMARY KEY ("id")
);

-- Create SecurityAuditLog table for comprehensive security event tracking
CREATE TABLE "security_audit_log" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "user_email" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "severity" TEXT NOT NULL CHECK ("severity" IN ('INFO', 'WARN', 'ERROR', 'CRITICAL')),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "session_id" TEXT,
    "request_id" TEXT,

    CONSTRAINT "security_audit_log_pkey" PRIMARY KEY ("id")
);

-- Create StripeWebhookLog table for webhook idempotency
CREATE TABLE "stripe_webhook_log" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "stripe_event_id" TEXT NOT NULL UNIQUE,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "status" TEXT NOT NULL CHECK ("status" IN ('PROCESSED', 'FAILED', 'SKIPPED')),
    "booking_id" TEXT,
    "error_message" TEXT,
    "metadata" JSONB,

    CONSTRAINT "stripe_webhook_log_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "promo_code_usage" 
ADD CONSTRAINT "promo_code_usage_promo_code_id_fkey" 
FOREIGN KEY ("promo_code_id") REFERENCES "PromoCode"("id") ON DELETE CASCADE;

ALTER TABLE "promo_code_usage" 
ADD CONSTRAINT "promo_code_usage_booking_id_fkey" 
FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE SET NULL;

ALTER TABLE "security_audit_log" 
ADD CONSTRAINT "security_audit_log_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "stripe_webhook_log" 
ADD CONSTRAINT "stripe_webhook_log_booking_id_fkey" 
FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE SET NULL;

-- Create performance indexes
CREATE INDEX "idx_promo_code_usage_promo_code_id" ON "promo_code_usage"("promo_code_id");
CREATE INDEX "idx_promo_code_usage_user_email" ON "promo_code_usage"("user_email");
CREATE INDEX "idx_promo_code_usage_used_at" ON "promo_code_usage"("used_at");

CREATE INDEX "idx_security_audit_log_timestamp" ON "security_audit_log"("timestamp");
CREATE INDEX "idx_security_audit_log_user_email" ON "security_audit_log"("user_email");
CREATE INDEX "idx_security_audit_log_action" ON "security_audit_log"("action");
CREATE INDEX "idx_security_audit_log_severity" ON "security_audit_log"("severity");

CREATE INDEX "idx_stripe_webhook_log_event_id" ON "stripe_webhook_log"("stripe_event_id");
CREATE INDEX "idx_stripe_webhook_log_processed_at" ON "stripe_webhook_log"("processed_at");
CREATE INDEX "idx_stripe_webhook_log_booking_id" ON "stripe_webhook_log"("booking_id");

-- Add new fields to Booking table for payment security
ALTER TABLE "Booking" 
ADD COLUMN "price_snapshot_cents" INTEGER,
ADD COLUMN "payment_intent_id" TEXT,
ADD COLUMN "pricing_calculated_at" TIMESTAMPTZ,
ADD COLUMN "security_flags" JSONB DEFAULT '{}';

-- Create index for payment intent tracking
CREATE INDEX "idx_booking_payment_intent_id" ON "Booking"("payment_intent_id");

-- Add unique constraint to prevent double bookings (Vulnerability #4 fix)
CREATE UNIQUE INDEX "idx_booking_unique_notary_time_slot" 
ON "Booking"("notaryId", "scheduledDateTime") 
WHERE "status" IN ('PAYMENT_PENDING', 'CONFIRMED', 'SCHEDULED') AND "notaryId" IS NOT NULL;

COMMENT ON TABLE "promo_code_usage" IS 'Tracks individual promo code usage instances for security and analytics';
COMMENT ON TABLE "security_audit_log" IS 'Comprehensive security event logging for threat detection and compliance';
COMMENT ON TABLE "stripe_webhook_log" IS 'Stripe webhook processing log for idempotency and debugging';
COMMENT ON INDEX "idx_booking_unique_notary_time_slot" IS 'Prevents double bookings for same notary at same time - SECURITY FIX';