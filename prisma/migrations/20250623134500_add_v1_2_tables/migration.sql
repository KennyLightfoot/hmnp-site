-- Migration: Add v1.2 specification tables and enhancements
-- Created: June 23, 2025
-- Purpose: Complete database schema for hybrid mobile/RON notary platform

-- 1. Add witness source enum if not exists
DO $$ BEGIN
    CREATE TYPE witness_source AS ENUM ('customer_provided', 'staff_provided', 'proof_provided');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create notary_profiles table for notary portal functionality
CREATE TABLE IF NOT EXISTS notary_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    commission_number VARCHAR(50),
    commission_expiry DATE,
    base_address TEXT,
    service_radius_miles INTEGER DEFAULT 25,
    is_active BOOLEAN DEFAULT TRUE,
    emergency_contact VARCHAR(20),
    preferred_service_types TEXT[], -- ServiceType array as strings
    daily_capacity INTEGER DEFAULT 8, -- Max bookings per day
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 3. Create notary_journal table for Texas compliance
CREATE TABLE IF NOT EXISTS notary_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES "Booking"(id),
    notary_id UUID NOT NULL REFERENCES "User"(id),
    entry_date DATE NOT NULL,
    journal_number INTEGER, -- Sequential numbering per notary
    document_type VARCHAR(100),
    signer_name VARCHAR(200),
    signer_id_type VARCHAR(50), -- Driver License, Passport, etc.
    signer_id_state VARCHAR(2), -- State abbreviation
    notarial_act_type VARCHAR(50), -- acknowledgment, oath, jurat, etc.
    fee_charged DECIMAL(10,2),
    location TEXT,
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure sequential journal numbering per notary
    UNIQUE(notary_id, journal_number)
);

-- 4. Create service_areas table for admin geofencing
CREATE TABLE IF NOT EXISTS service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    polygon_coordinates JSONB, -- Store as GeoJSON until PostGIS is added
    service_fee_multiplier DECIMAL(3,2) DEFAULT 1.0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create mileage_cache table for performance optimization
CREATE TABLE IF NOT EXISTS mileage_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_address VARCHAR(500),
    destination_address VARCHAR(500),
    distance_miles DECIMAL(5,2),
    duration_minutes INTEGER,
    google_maps_response JSONB, -- Cache full response for debugging
    last_calculated TIMESTAMPTZ DEFAULT NOW(),
    hit_count INTEGER DEFAULT 1,
    
    UNIQUE(origin_address, destination_address)
);

-- 6. Create daily_metrics table for KPI tracking
CREATE TABLE IF NOT EXISTS daily_metrics (
    date DATE PRIMARY KEY,
    total_bookings INTEGER DEFAULT 0,
    mobile_bookings INTEGER DEFAULT 0,
    ron_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    mobile_revenue DECIMAL(10,2) DEFAULT 0,
    ron_revenue DECIMAL(10,2) DEFAULT 0,
    proof_costs DECIMAL(10,2) DEFAULT 0,
    mileage_costs DECIMAL(10,2) DEFAULT 0,
    stripe_fees DECIMAL(10,2) DEFAULT 0,
    net_revenue DECIMAL(10,2) DEFAULT 0,
    margin_percentage DECIMAL(5,2),
    average_booking_value DECIMAL(10,2),
    conversion_rate DECIMAL(5,2), -- visitors to completed bookings
    customer_satisfaction DECIMAL(3,2), -- average rating
    new_customers INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create feature_flags table for LaunchDarkly integration
CREATE TABLE IF NOT EXISTS feature_flags (
    key VARCHAR(100) PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_roles TEXT[], -- Role enum values as strings
    target_users UUID[], -- Specific user IDs for testing
    environment VARCHAR(20) DEFAULT 'development', -- development, staging, production
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES "User"(id)
);

-- 8. Add missing columns to existing Booking table
ALTER TABLE "Booking" 
ADD COLUMN IF NOT EXISTS witness_type witness_source,
ADD COLUMN IF NOT EXISTS witness_fee DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS mileage_miles DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS mileage_fee DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(20) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS urgency_fee DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_completion_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notary_travel_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS google_maps_distance_matrix JSONB,
ADD COLUMN IF NOT EXISTS service_area_id UUID REFERENCES service_areas(id);

-- 9. Add customer preferences and notary availability to User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS customer_preferences JSONB,
ADD COLUMN IF NOT EXISTS notary_availability JSONB,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS push_notification_token VARCHAR(500);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notary_profiles_user_id ON notary_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_notary_profiles_active ON notary_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_notary_journal_booking_id ON notary_journal(booking_id);
CREATE INDEX IF NOT EXISTS idx_notary_journal_notary_date ON notary_journal(notary_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_service_areas_active ON service_areas(active);
CREATE INDEX IF NOT EXISTS idx_mileage_cache_addresses ON mileage_cache(origin_address, destination_address);
CREATE INDEX IF NOT EXISTS idx_mileage_cache_calculated ON mileage_cache(last_calculated);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);
CREATE INDEX IF NOT EXISTS idx_booking_witness_type ON "Booking"(witness_type);
CREATE INDEX IF NOT EXISTS idx_booking_urgency ON "Booking"(urgency_level);
CREATE INDEX IF NOT EXISTS idx_booking_service_area ON "Booking"(service_area_id);

-- 11. Create function to auto-increment journal numbers
CREATE OR REPLACE FUNCTION get_next_journal_number(notary_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(journal_number), 0) + 1 
    INTO next_number 
    FROM notary_journal 
    WHERE notary_id = notary_user_id;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to auto-assign journal numbers
CREATE OR REPLACE FUNCTION auto_assign_journal_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.journal_number IS NULL THEN
        NEW.journal_number := get_next_journal_number(NEW.notary_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_journal_number
    BEFORE INSERT ON notary_journal
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_journal_number();

-- 13. Insert default service areas (Houston Metro)
INSERT INTO service_areas (id, name, description, polygon_coordinates, active) VALUES
(
    gen_random_uuid(),
    'Houston Metro Core',
    'Primary service area covering downtown Houston and immediate suburbs',
    '{"type":"Polygon","coordinates":[[[-95.7,29.5],[-95.1,29.5],[-95.1,30.1],[-95.7,30.1],[-95.7,29.5]]]}',
    true
),
(
    gen_random_uuid(),
    'Extended Houston Area',
    'Secondary service area with additional travel fees',
    '{"type":"Polygon","coordinates":[[[-96.0,29.2],[-94.8,29.2],[-94.8,30.4],[-96.0,30.4],[-96.0,29.2]]]}',
    true
);

-- 14. Insert default feature flags
INSERT INTO feature_flags (key, enabled, description, rollout_percentage, environment) VALUES
('ron_service_toggle', true, 'Enable/disable RON services globally', 100, 'production'),
('mobile_service_toggle', true, 'Enable/disable mobile notary services', 100, 'production'),
('advanced_pricing_engine', false, 'Use advanced real-time pricing calculations', 0, 'development'),
('proof_integration', true, 'Enable Proof.co integration for RON services', 100, 'production'),
('google_maps_integration', true, 'Enable Google Maps for distance calculations', 100, 'production'),
('sms_notifications', true, 'Enable SMS notifications via Twilio', 100, 'production'),
('push_notifications', false, 'Enable PWA push notifications', 0, 'development'),
('admin_analytics_dashboard', true, 'Show advanced analytics in admin portal', 100, 'production'),
('customer_portal_v2', false, 'New customer portal interface', 0, 'development'),
('notary_mobile_app', false, 'Mobile app features for notaries', 0, 'development');

-- 15. Add constraints for data integrity
ALTER TABLE notary_profiles 
ADD CONSTRAINT check_service_radius CHECK (service_radius_miles > 0 AND service_radius_miles <= 100),
ADD CONSTRAINT check_commission_expiry CHECK (commission_expiry >= CURRENT_DATE);

ALTER TABLE notary_journal
ADD CONSTRAINT check_fee_charged CHECK (fee_charged >= 0),
ADD CONSTRAINT check_entry_date CHECK (entry_date >= '2020-01-01');

ALTER TABLE service_areas
ADD CONSTRAINT check_fee_multiplier CHECK (service_fee_multiplier >= 0.5 AND service_fee_multiplier <= 5.0);

ALTER TABLE daily_metrics
ADD CONSTRAINT check_margin_percentage CHECK (margin_percentage >= -100 AND margin_percentage <= 100),
ADD CONSTRAINT check_conversion_rate CHECK (conversion_rate >= 0 AND conversion_rate <= 100),
ADD CONSTRAINT check_satisfaction CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 5);

-- 16. Add comments for documentation
COMMENT ON TABLE notary_profiles IS 'Extended profile information for notary users including commission details and service preferences';
COMMENT ON TABLE notary_journal IS 'Texas-compliant notary journal entries tracking all notarial acts performed';
COMMENT ON TABLE service_areas IS 'Geographic service areas with polygon boundaries and pricing multipliers';
COMMENT ON TABLE mileage_cache IS 'Cache for Google Maps distance calculations to reduce API calls and improve performance';
COMMENT ON TABLE daily_metrics IS 'Daily aggregated business metrics for KPI tracking and reporting';
COMMENT ON TABLE feature_flags IS 'Feature flag configuration for controlled rollouts and A/B testing';

COMMENT ON COLUMN notary_journal.journal_number IS 'Sequential number unique per notary for Texas compliance requirements';
COMMENT ON COLUMN "Booking".witness_type IS 'Source of witness: customer provided, staff provided, or Proof.co on-demand';
COMMENT ON COLUMN "Booking".urgency_level IS 'Service urgency: standard, same-day, or emergency';
COMMENT ON COLUMN "User".customer_preferences IS 'JSON object storing customer communication and service preferences';
COMMENT ON COLUMN "User".notary_availability IS 'JSON object storing notary work hours and availability preferences'; 