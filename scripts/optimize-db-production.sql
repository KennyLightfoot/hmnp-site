-- Production Database Optimization Script
-- Houston Mobile Notary Pros - Performance & Index Optimization
-- Run this script on your production database after deployment

-- ====================================================================
-- PERFORMANCE INDEXES FOR CRITICAL QUERIES
-- ====================================================================

-- Booking Performance Indexes (Most Critical)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_scheduled_datetime 
  ON "Booking" ("scheduledDateTime" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_status_active 
  ON "Booking" ("status") WHERE "status" IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_signer_id 
  ON "Booking" ("signerId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_service_id 
  ON "Booking" ("serviceId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_created_at 
  ON "Booking" ("createdAt" DESC);

-- Composite indexes for common booking queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_status_datetime 
  ON "Booking" ("status", "scheduledDateTime" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_signer_status 
  ON "Booking" ("signerId", "status", "scheduledDateTime" DESC);

-- Payment Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_booking_id 
  ON "Payment" ("bookingId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_status 
  ON "Payment" ("status");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_created_at 
  ON "Payment" ("createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_stripe_id 
  ON "Payment" ("stripePaymentIntentId") WHERE "stripePaymentIntentId" IS NOT NULL;

-- User Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email 
  ON "User" ("email");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_role 
  ON "User" ("role");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_active 
  ON "User" ("active") WHERE "active" = true;

-- Service Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_active 
  ON "Service" ("isActive") WHERE "isActive" = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_category 
  ON "Service" ("category");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_price 
  ON "Service" ("basePrice");

-- ====================================================================
-- AVAILABILITY & SCHEDULING OPTIMIZATION
-- ====================================================================

-- Availability indexes for fast scheduling queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_availability_datetime 
  ON "Availability" ("dateTime" ASC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_availability_available 
  ON "Availability" ("isAvailable", "dateTime" ASC) WHERE "isAvailable" = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_availability_notary_datetime 
  ON "Availability" ("notaryId", "dateTime" ASC) WHERE "isAvailable" = true;

-- ====================================================================
-- NOTIFICATION & COMMUNICATION INDEXES
-- ====================================================================

-- Notification indexes for queue processing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_booking_id 
  ON "Notification" ("bookingId") WHERE "bookingId" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_sent_at 
  ON "Notification" ("sentAt") WHERE "sentAt" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_pending 
  ON "Notification" ("status", "scheduledFor") WHERE "status" = 'PENDING';

-- ====================================================================
-- BUSINESS LOGIC INDEXES
-- ====================================================================

-- Promo Code Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_promo_code_active 
  ON "PromoCode" ("isActive", "validFrom", "validTo") WHERE "isActive" = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_promo_code_code 
  ON "PromoCode" ("code") WHERE "isActive" = true;

-- Business Settings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_settings_key 
  ON "BusinessSettings" ("key");

-- ====================================================================
-- AUDIT & LOGGING INDEXES
-- ====================================================================

-- Download Log Performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_download_log_user_id 
  ON "DownloadLog" ("userId", "downloadedAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_download_log_assignment_id 
  ON "DownloadLog" ("assignmentId", "downloadedAt" DESC);

-- ====================================================================
-- FULL-TEXT SEARCH INDEXES
-- ====================================================================

-- Full-text search for bookings (notes, special instructions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_notes_fts 
  ON "Booking" USING gin(to_tsvector('english', coalesce("notes", '')));

-- Full-text search for users (name search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_name_fts 
  ON "User" USING gin(to_tsvector('english', coalesce("name", '')));

-- ====================================================================
-- GEOSPATIAL INDEXES (If using PostGIS)
-- ====================================================================

-- Uncomment if you have location-based queries
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_location_geo 
--   ON "Booking" USING gist("location") WHERE "location" IS NOT NULL;

-- ====================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ====================================================================

-- Booking analytics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS booking_analytics AS
SELECT 
  DATE_TRUNC('day', "scheduledDateTime") as booking_date,
  "status",
  "serviceId",
  COUNT(*) as booking_count,
  AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))) as avg_processing_time,
  SUM(CASE WHEN "status" = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
  SUM(CASE WHEN "status" = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_count
FROM "Booking"
WHERE "createdAt" > NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', "scheduledDateTime"), "status", "serviceId";

-- Index for the materialized view
CREATE INDEX IF NOT EXISTS idx_booking_analytics_date 
  ON booking_analytics (booking_date DESC);

-- Revenue analytics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS revenue_analytics AS
SELECT 
  DATE_TRUNC('month', p."createdAt") as revenue_month,
  s."name" as service_name,
  s."category" as service_category,
  COUNT(p."id") as payment_count,
  SUM(p."amount") as total_revenue,
  AVG(p."amount") as avg_payment_amount
FROM "Payment" p
JOIN "Booking" b ON b."id" = p."bookingId"
JOIN "Service" s ON s."id" = b."serviceId"
WHERE p."status" = 'succeeded' 
  AND p."createdAt" > NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', p."createdAt"), s."name", s."category";

-- Index for revenue analytics
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_month 
  ON revenue_analytics (revenue_month DESC);

-- ====================================================================
-- DATABASE MAINTENANCE FUNCTIONS
-- ====================================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY booking_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY revenue_analytics;
  
  -- Log the refresh
  INSERT INTO "SystemLog" ("level", "message", "createdAt")
  VALUES ('INFO', 'Analytics views refreshed', NOW());
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- PERFORMANCE MONITORING QUERIES
-- ====================================================================

-- Query to monitor index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Query to monitor table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS total_size,
  pg_size_pretty(pg_relation_size(tablename::regclass)) AS table_size,
  pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) AS index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- ====================================================================
-- AUTOMATED CLEANUP PROCEDURES
-- ====================================================================

-- Function to clean up old notification records
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete notifications older than 90 days that are already sent
  DELETE FROM "Notification" 
  WHERE "sentAt" < NOW() - INTERVAL '90 days'
    AND "status" = 'SENT';
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup
  INSERT INTO "SystemLog" ("level", "message", "metadata", "createdAt")
  VALUES (
    'INFO', 
    'Cleaned up old notifications', 
    jsonb_build_object('deleted_count', deleted_count),
    NOW()
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old download logs
CREATE OR REPLACE FUNCTION cleanup_old_download_logs()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete download logs older than 1 year
  DELETE FROM "DownloadLog" 
  WHERE "downloadedAt" < NOW() - INTERVAL '1 year';
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup
  INSERT INTO "SystemLog" ("level", "message", "metadata", "createdAt")
  VALUES (
    'INFO', 
    'Cleaned up old download logs', 
    jsonb_build_object('deleted_count', deleted_count),
    NOW()
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- DATABASE STATISTICS UPDATE
-- ====================================================================

-- Update table statistics for query planner
ANALYZE "Booking";
ANALYZE "Payment";
ANALYZE "User";
ANALYZE "Service";
ANALYZE "Notification";
ANALYZE "Availability";
ANALYZE "PromoCode";
ANALYZE "BusinessSettings";
ANALYZE "DownloadLog";

-- ====================================================================
-- SECURITY ENHANCEMENTS
-- ====================================================================

-- Enable row level security on sensitive tables (if needed)
-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Create policies for data access (example)
-- CREATE POLICY user_own_data ON "User" 
--   FOR ALL TO authenticated 
--   USING (id = current_user_id());

-- ====================================================================
-- CONNECTION POOLING RECOMMENDATIONS
-- ====================================================================

-- For production, consider these settings in your connection string:
-- ?pool_timeout=30&connection_limit=20&pool_mode=transaction

-- ====================================================================
-- MONITORING SETUP
-- ====================================================================

-- Create a monitoring table for tracking performance
CREATE TABLE IF NOT EXISTS "PerformanceMetrics" (
  "id" SERIAL PRIMARY KEY,
  "metric_name" VARCHAR(100) NOT NULL,
  "metric_value" DECIMAL(15,4) NOT NULL,
  "metric_unit" VARCHAR(20) NOT NULL,
  "tags" JSONB,
  "recorded_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_date 
  ON "PerformanceMetrics" ("metric_name", "recorded_at" DESC);

-- Function to log performance metrics
CREATE OR REPLACE FUNCTION log_performance_metric(
  p_metric_name VARCHAR(100),
  p_metric_value DECIMAL(15,4),
  p_metric_unit VARCHAR(20),
  p_tags JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO "PerformanceMetrics" ("metric_name", "metric_value", "metric_unit", "tags")
  VALUES (p_metric_name, p_metric_value, p_metric_unit, p_tags);
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- COMPLETION MESSAGE
-- ====================================================================

DO $$
BEGIN
  RAISE NOTICE 'Database optimization completed successfully!';
  RAISE NOTICE 'Indexes created, materialized views set up, and monitoring enabled.';
  RAISE NOTICE 'Consider setting up a cron job to run refresh_analytics_views() daily.';
  RAISE NOTICE 'Monitor index usage with: SELECT * FROM index_usage_stats;';
  RAISE NOTICE 'Check table sizes with: SELECT * FROM table_sizes;';
END $$; 