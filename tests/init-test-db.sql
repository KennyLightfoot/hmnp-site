-- Test Database Initialization Script
-- Houston Mobile Notary Pros
-- 
-- Sets up test database with proper permissions and extensions

-- Create test database if it doesn't exist (handled by POSTGRES_DB env var)
-- But we can set up additional configuration here

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create additional test-specific schemas if needed
CREATE SCHEMA IF NOT EXISTS test_data;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE hmnp_test_db TO hmnp_test;
GRANT ALL PRIVILEGES ON SCHEMA public TO hmnp_test;
GRANT ALL PRIVILEGES ON SCHEMA test_data TO hmnp_test;

-- Create test data cleanup function
CREATE OR REPLACE FUNCTION test_data.cleanup_test_data()
RETURNS void AS $$
BEGIN
    -- Disable triggers to speed up cleanup
    SET session_replication_role = replica;
    
    -- Truncate all tables in correct order (respecting foreign keys)
    TRUNCATE TABLE "NewBookingAuditLog" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "NewPayment" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "NewBooking" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "Service" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "Calendar" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;
    
    -- Re-enable triggers
    SET session_replication_role = DEFAULT;
    
    RAISE NOTICE 'Test data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Create function to seed basic test data
CREATE OR REPLACE FUNCTION test_data.seed_basic_data()
RETURNS void AS $$
BEGIN
    -- Insert basic service types for testing
    INSERT INTO "Service" (id, name, description, "serviceType", "durationMinutes", "basePrice", "isActive")
    VALUES 
        ('test-std-notary', 'Standard Notary Service', 'Test standard notary service', 'STANDARD_NOTARY', 60, 75.00, true),
        ('test-ext-hours', 'Extended Hours Service', 'Test extended hours service', 'EXTENDED_HOURS', 60, 100.00, true),
        ('test-loan-sign', 'Loan Signing Service', 'Test loan signing service', 'LOAN_SIGNING', 90, 150.00, true),
        ('test-ron-service', 'RON Service', 'Test remote online notarization', 'RON_SERVICES', 30, 35.00, true)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Basic test data seeded';
END;
$$ LANGUAGE plpgsql;

-- Make functions available to test user
GRANT EXECUTE ON FUNCTION test_data.cleanup_test_data() TO hmnp_test;
GRANT EXECUTE ON FUNCTION test_data.seed_basic_data() TO hmnp_test;

-- Create indexes for faster test queries
CREATE INDEX IF NOT EXISTS idx_test_booking_email ON "NewBooking"("customerEmail");
CREATE INDEX IF NOT EXISTS idx_test_booking_status ON "NewBooking"("status");
CREATE INDEX IF NOT EXISTS idx_test_booking_created ON "NewBooking"("createdAt");

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'HMNP Test database initialized successfully at %', now();
END $$;