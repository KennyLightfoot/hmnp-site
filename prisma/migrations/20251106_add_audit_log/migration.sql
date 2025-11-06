-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "bookingId" TEXT,
  "entity" VARCHAR(100) NOT NULL,
  "action" VARCHAR(100) NOT NULL,
  "performedBy" TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "data" JSONB,
  "prevHash" TEXT,
  "hash" TEXT NOT NULL,
  CONSTRAINT "AuditLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_auditlog_booking_timestamp" ON "AuditLog" ("bookingId", "timestamp");


