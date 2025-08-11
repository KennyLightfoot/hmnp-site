-- Add PaymentMethod enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN
        CREATE TYPE "public"."PaymentMethod" AS ENUM ('PAY_ON_SITE', 'CARD', 'ACH', 'OTHER');
    END IF;
END$$;

-- Add booking-level payment columns (idempotent guards)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'paymentMethod'
    ) THEN
        ALTER TABLE "public"."Booking" ADD COLUMN "paymentMethod" "public"."PaymentMethod" NOT NULL DEFAULT 'PAY_ON_SITE';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'paymentStatus'
    ) THEN
        ALTER TABLE "public"."Booking" ADD COLUMN "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'totalPaid'
    ) THEN
        ALTER TABLE "public"."Booking" ADD COLUMN "totalPaid" DECIMAL(10,2) DEFAULT 0;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'paidAt'
    ) THEN
        ALTER TABLE "public"."Booking" ADD COLUMN "paidAt" TIMESTAMP(3);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'paidMarkedByUserId'
    ) THEN
        ALTER TABLE "public"."Booking" ADD COLUMN "paidMarkedByUserId" TEXT;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'Booking' AND column_name = 'paidNotes'
    ) THEN
        ALTER TABLE "public"."Booking" ADD COLUMN "paidNotes" TEXT;
    END IF;
END$$;

-- Indexes for paymentStatus and paidAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Booking_paymentStatus_idx'
    ) THEN
        CREATE INDEX "Booking_paymentStatus_idx" ON "public"."Booking"("paymentStatus");
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Booking_paidAt_idx'
    ) THEN
        CREATE INDEX "Booking_paidAt_idx" ON "public"."Booking"("paidAt");
    END IF;
END$$;


