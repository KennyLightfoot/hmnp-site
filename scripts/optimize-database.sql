-- Database Performance Optimization for HMNP Booking System
-- Run this in your production database after deployment

-- 1. Booking Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_scheduled_datetime 
  ON "Booking" ("scheduledDateTime");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_status 
  ON "Booking" ("status");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_signer_id 
  ON "Booking" ("signerId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_service_id 
  ON "Booking" ("serviceId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_created_at 
  ON "Booking" ("createdAt");

-- Composite index for common booking queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_status_datetime 
  ON "Booking" ("status", "scheduledDateTime");

-- 2. User Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email 
  ON "User" ("email");

CREATE INDEX CONCURRALLY IF NOT EXISTS idx_user_role 
  ON "User" ("role");

-- 3. Service Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_active 
  ON "Service" ("isActive");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_category 
  ON "Service" ("category");

-- 4. Availability Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_availability_datetime 
  ON "Availability" ("dateTime");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_availability_available 
  ON "Availability" ("isAvailable");

-- 5. Payment Performance Indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_booking_id 
  ON "Payment" ("bookingId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_status 
  ON "Payment" ("status");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_created_at 
  ON "Payment" ("createdAt");

-- 6. Notification Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_booking_id 
  ON "Notification" ("bookingId") WHERE "bookingId" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_sent_at 
  ON "Notification" ("sentAt");

-- 7. Business Settings Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_settings_key 
  ON "BusinessSettings" ("key");

-- 8. Promo Code Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_promo_code_active 
  ON "PromoCode" ("isActive", "validFrom", "validTo");

-- 9. Full-text search indexes (for advanced search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_notes_fts 
  ON "Booking" USING gin(to_tsvector('english', coalesce("notes", '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_name_fts 
  ON "User" USING gin(to_tsvector('english', coalesce("name", '')));

-- 10. Cleanup old data (optional - uncomment if needed)
-- DELETE FROM "Notification" WHERE "createdAt" < NOW() - INTERVAL '90 days';
-- DELETE FROM "Booking" WHERE "status" = 'CANCELLED' AND "createdAt" < NOW() - INTERVAL '1 year';

-- 11. Update table statistics for query planner
ANALYZE "Booking";
ANALYZE "User";
ANALYZE "Service";
ANALYZE "Payment";
ANALYZE "Notification";

-- 12. Check index usage (run this to verify indexes are being used)
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY idx_scan DESC; 