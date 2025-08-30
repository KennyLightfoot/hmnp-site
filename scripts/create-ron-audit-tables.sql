-- Create RON audit events table
CREATE TABLE IF NOT EXISTS ron_audit_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'session_start', 
        'identity_verification', 
        'document_upload', 
        'signature_capture', 
        'signature_verification', 
        'session_end', 
        'compliance_check'
    )),
    user_id TEXT NOT NULL,
    user_role TEXT NOT NULL CHECK (user_role IN ('notary', 'signer', 'witness')),
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    location JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RON sessions table
CREATE TABLE IF NOT EXISTS ron_sessions (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES bookings(id),
    notary_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 
        'in_progress', 
        'completed', 
        'cancelled', 
        'failed'
    )),
    session_start TIMESTAMPTZ,
    session_end TIMESTAMPTZ,
    recording_url TEXT,
    compliance_score DECIMAL(5,2),
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN (
        'pending', 
        'compliant', 
        'non_compliant'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RON documents table
CREATE TABLE IF NOT EXISTS ron_documents (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES ron_sessions(id),
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    page_count INTEGER DEFAULT 1,
    requires_signature BOOLEAN DEFAULT false,
    signature_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RON signatures table
CREATE TABLE IF NOT EXISTS ron_signatures (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES ron_sessions(id),
    document_id TEXT REFERENCES ron_documents(id),
    signer_id TEXT NOT NULL,
    signer_name TEXT NOT NULL,
    signature_image_url TEXT NOT NULL,
    signature_timestamp TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    location JSONB,
    verified BOOLEAN DEFAULT false,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ron_audit_events_session_id ON ron_audit_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ron_audit_events_timestamp ON ron_audit_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_ron_audit_events_event_type ON ron_audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ron_sessions_status ON ron_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ron_sessions_notary_id ON ron_sessions(notary_id);
CREATE INDEX IF NOT EXISTS idx_ron_documents_session_id ON ron_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_ron_signatures_session_id ON ron_signatures(session_id);

-- Enable Row Level Security
ALTER TABLE ron_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ron_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ron_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ron_signatures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - adjust based on your auth system)
CREATE POLICY "Users can view their own audit events" ON ron_audit_events
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Notaries can view their sessions" ON ron_sessions
    FOR SELECT USING (notary_id = auth.uid()::text);

CREATE POLICY "Users can view session documents" ON ron_documents
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM ron_sessions 
            WHERE notary_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view session signatures" ON ron_signatures
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM ron_sessions 
            WHERE notary_id = auth.uid()::text
        )
    );
