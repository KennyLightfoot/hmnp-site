-- Houston Mobile Notary API - Database Migration
-- Creates tables for the GHL workflow integration system

-- Create API bookings table
CREATE TABLE IF NOT EXISTS api_bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    booking_id TEXT UNIQUE NOT NULL,
    
    -- Customer information
    ghl_contact_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Service details
    service_name TEXT NOT NULL,
    service_description TEXT,
    service_price DECIMAL(10,2) NOT NULL,
    
    -- Scheduling
    scheduled_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 30,
    timezone TEXT DEFAULT 'America/Chicago',
    appointment_status TEXT DEFAULT 'scheduled',
    
    -- Location
    location_type TEXT NOT NULL,
    address_street TEXT,
    address_city TEXT DEFAULT 'Houston',
    address_state TEXT DEFAULT 'TX',
    address_zip TEXT,
    address_formatted TEXT,
    location_notes TEXT,
    
    -- Payment information
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'stripe',
    payment_url TEXT,
    payment_intent_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Payment intelligence fields
    urgency_level TEXT DEFAULT 'new',
    hours_old INTEGER DEFAULT 0,
    reminders_sent INTEGER DEFAULT 0,
    last_reminder_at TIMESTAMP WITH TIME ZONE,
    
    -- Lead source and tracking
    lead_source TEXT NOT NULL,
    campaign_name TEXT,
    referral_code TEXT,
    ghl_workflow_id TEXT,
    trigger_source TEXT,
    
    -- Additional data
    notes TEXT,
    internal_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'system'
);

-- Create indexes for api_bookings
CREATE INDEX IF NOT EXISTS idx_api_bookings_ghl_contact_id ON api_bookings(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_api_bookings_payment_status ON api_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_api_bookings_urgency_level ON api_bookings(urgency_level);
CREATE INDEX IF NOT EXISTS idx_api_bookings_scheduled_date_time ON api_bookings(scheduled_date_time);
CREATE INDEX IF NOT EXISTS idx_api_bookings_lead_source ON api_bookings(lead_source);
CREATE INDEX IF NOT EXISTS idx_api_bookings_created_at ON api_bookings(created_at);

-- Create payment actions table
CREATE TABLE IF NOT EXISTS api_payment_actions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    booking_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    reminder_type TEXT,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES api_bookings(booking_id) ON DELETE CASCADE
);

-- Create indexes for api_payment_actions
CREATE INDEX IF NOT EXISTS idx_api_payment_actions_booking_id ON api_payment_actions(booking_id);
CREATE INDEX IF NOT EXISTS idx_api_payment_actions_action_type ON api_payment_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_api_payment_actions_timestamp ON api_payment_actions(timestamp);

-- Create workflow triggers table
CREATE TABLE IF NOT EXISTS api_workflow_triggers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    booking_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    FOREIGN KEY (booking_id) REFERENCES api_bookings(booking_id) ON DELETE CASCADE
);

-- Create indexes for api_workflow_triggers
CREATE INDEX IF NOT EXISTS idx_api_workflow_triggers_booking_id ON api_workflow_triggers(booking_id);
CREATE INDEX IF NOT EXISTS idx_api_workflow_triggers_workflow_name ON api_workflow_triggers(workflow_name);
CREATE INDEX IF NOT EXISTS idx_api_workflow_triggers_status ON api_workflow_triggers(status);
CREATE INDEX IF NOT EXISTS idx_api_workflow_triggers_triggered_at ON api_workflow_triggers(triggered_at);

-- Create booking documents table
CREATE TABLE IF NOT EXISTS api_booking_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    booking_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    
    FOREIGN KEY (booking_id) REFERENCES api_bookings(booking_id) ON DELETE CASCADE
);

-- Create indexes for api_booking_documents
CREATE INDEX IF NOT EXISTS idx_api_booking_documents_booking_id ON api_booking_documents(booking_id);

-- Create business metrics table
CREATE TABLE IF NOT EXISTS api_business_metrics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    date DATE UNIQUE DEFAULT CURRENT_DATE,
    
    -- Daily metrics
    total_bookings INTEGER DEFAULT 0,
    pending_payments INTEGER DEFAULT 0,
    completed_payments INTEGER DEFAULT 0,
    failed_payments INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_booking_value DECIMAL(10,2) DEFAULT 0,
    
    -- Urgency breakdown
    urgency_new INTEGER DEFAULT 0,
    urgency_medium INTEGER DEFAULT 0,
    urgency_high INTEGER DEFAULT 0,
    urgency_critical INTEGER DEFAULT 0,
    
    -- Lead sources
    website_bookings INTEGER DEFAULT 0,
    phone_bookings INTEGER DEFAULT 0,
    form_bookings INTEGER DEFAULT 0,
    referral_bookings INTEGER DEFAULT 0,
    ad_bookings INTEGER DEFAULT 0
);

-- Create indexes for api_business_metrics
CREATE INDEX IF NOT EXISTS idx_api_business_metrics_date ON api_business_metrics(date);

-- Create API request logs table
CREATE TABLE IF NOT EXISTS api_request_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    duration INTEGER, -- milliseconds
    ip TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Request details
    request_size INTEGER,
    response_size INTEGER,
    error_message TEXT
);

-- Create indexes for api_request_logs
CREATE INDEX IF NOT EXISTS idx_api_request_logs_method_url ON api_request_logs(method, url);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_status_code ON api_request_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_timestamp ON api_request_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_ip ON api_request_logs(ip);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on api_bookings
CREATE TRIGGER update_api_bookings_updated_at 
    BEFORE UPDATE ON api_bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO api_bookings (
    booking_id,
    ghl_contact_id,
    customer_name,
    customer_email,
    customer_phone,
    service_name,
    service_price,
    payment_amount,
    scheduled_date_time,
    payment_expires_at,
    location_type,
    lead_source,
    notes
) VALUES (
    'HMNP-SAMPLE-TEST',
    'sample_contact_123',
    'Test Customer',
    'test@example.com',
    '+1-555-123-4567',
    'Standard Mobile Notary',
    85.00,
    85.00,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    'CLIENT_SPECIFIED_ADDRESS',
    'API_Test',
    'Sample booking for API testing'
) ON CONFLICT (booking_id) DO NOTHING;

-- Grant necessary permissions (adjust role name as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_role;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_role;

COMMENT ON TABLE api_bookings IS 'Main bookings table for GHL workflow integration';
COMMENT ON TABLE api_payment_actions IS 'Tracks all payment-related actions and reminders';
COMMENT ON TABLE api_workflow_triggers IS 'Logs workflow executions and their status';
COMMENT ON TABLE api_business_metrics IS 'Daily business intelligence metrics';
COMMENT ON TABLE api_request_logs IS 'API request logging for monitoring and debugging'; 