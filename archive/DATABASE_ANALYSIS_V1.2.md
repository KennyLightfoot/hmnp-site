# Database Schema Analysis for v1.2 Specification

## Current State vs. v1.2 Requirements

### ✅ **COMPLETE - Core Models**

#### 1. **User Management**
- ✅ `User` model with proper roles (ADMIN, STAFF, PARTNER, SIGNER, NOTARY, CLIENT)
- ✅ `Account` for NextAuth integration
- ✅ `Session` for auth sessions
- ✅ `InvitationToken` for admin invites
- ✅ `VerificationToken` for email verification

#### 2. **Booking System**
- ✅ `Booking` model covers both mobile and RON paths
- ✅ Proper booking statuses and lifecycle management
- ✅ Payment integration with Stripe (`paymentIntentId`, `stripePaymentUrl`)
- ✅ Location types including `REMOTE_ONLINE_NOTARIZATION`
- ✅ Proof.co integration fields (`proofTransactionId`, `proofAccessLink`, `proofStatus`)
- ✅ Texas RON compliance pricing already implemented

#### 3. **Service Management**
- ✅ `Service` model with proper service types
- ✅ Pricing, deposits, duration configuration
- ✅ `BusinessSettings` for dynamic configuration
- ✅ `PromoCode` system for discounts

#### 4. **Document Management**
- ✅ `AssignmentDocument` for file storage
- ✅ `NotarizationDocument` for notarized docs
- ✅ `DownloadLog` for audit trails

#### 5. **Payment System**
- ✅ `Payment` model with multiple providers
- ✅ Refund tracking and status management
- ✅ Stripe webhook integration ready

#### 6. **Notifications & Logging**
- ✅ `NotificationLog` with comprehensive notification types
- ✅ `SystemLog` for application logging
- ✅ `SystemAlert` for operational alerts
- ✅ Multiple notification methods (EMAIL, SMS, PUSH, IN_APP)

### 🚧 **GAPS IDENTIFIED - Missing for v1.2**

#### 1. **Notary Portal Requirements**
```sql
-- MISSING: Notary profile extensions
CREATE TABLE notary_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  commission_number VARCHAR,
  commission_expiry DATE,
  base_address VARCHAR,  -- For mobile route optimization
  service_radius_miles INTEGER DEFAULT 25,
  is_active BOOLEAN DEFAULT TRUE,
  emergency_contact VARCHAR,
  preferred_service_types ServiceType[]
);

-- MISSING: Notary journal (Texas compliance requirement)
CREATE TABLE notary_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  notary_id UUID REFERENCES users(id),
  entry_date DATE NOT NULL,
  document_type VARCHAR,
  signer_name VARCHAR,
  signer_id_type VARCHAR,
  signer_id_number VARCHAR, -- Encrypted/hashed for privacy
  notarial_act_type VARCHAR, -- acknowledgment, oath, etc.
  fee_charged DECIMAL(10,2),
  location VARCHAR,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **Service Area Management**
```sql
-- MISSING: Service area polygons for admin portal
CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  polygon GEOMETRY(POLYGON, 4326), -- PostGIS for geographic data
  service_fee_multiplier DECIMAL(3,2) DEFAULT 1.0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MISSING: Mileage calculation cache
CREATE TABLE mileage_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_address VARCHAR,
  destination_address VARCHAR,
  distance_miles DECIMAL(5,2),
  duration_minutes INTEGER,
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(origin_address, destination_address)
);
```

#### 3. **Advanced Analytics Tables**
```sql
-- MISSING: KPI tracking for admin dashboard
CREATE TABLE daily_metrics (
  date DATE PRIMARY KEY,
  total_bookings INTEGER DEFAULT 0,
  mobile_bookings INTEGER DEFAULT 0,
  ron_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  proof_costs DECIMAL(10,2) DEFAULT 0,
  mileage_costs DECIMAL(10,2) DEFAULT 0,
  margin_percentage DECIMAL(5,2),
  average_booking_value DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  customer_satisfaction DECIMAL(3,2)
);

-- MISSING: Feature flag tracking
CREATE TABLE feature_flags (
  key VARCHAR PRIMARY KEY,
  enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0,
  target_roles Role[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 🔧 **ENHANCEMENTS NEEDED**

#### 1. **Booking Model Extensions**
```sql
-- ADD to existing Booking model:
ALTER TABLE bookings ADD COLUMN witness_type witness_source;
ALTER TABLE bookings ADD COLUMN witness_fee DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN mileage_miles DECIMAL(5,2);
ALTER TABLE bookings ADD COLUMN mileage_fee DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN urgency_level VARCHAR DEFAULT 'standard';
ALTER TABLE bookings ADD COLUMN urgency_fee DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN estimated_completion_time TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN notary_travel_time_minutes INTEGER;
```

#### 2. **User Extensions for Personas**
```sql
-- ADD customer preferences
ALTER TABLE users ADD COLUMN customer_preferences JSONB;
-- Example: {"preferred_time_slots": ["morning", "evening"], "communication_preference": "sms"}

-- ADD notary availability
ALTER TABLE users ADD COLUMN notary_availability JSONB;
-- Example: {"monday": {"start": "09:00", "end": "17:00"}, "emergency_available": true}
```

### 🎯 **PRIORITY IMPLEMENTATION ORDER**

#### **Phase 0 - Immediate (Current Sprint)**
1. ✅ **Database is 85% ready** - Core functionality exists
2. 🔧 Add missing `notary_profiles` table
3. 🔧 Add `notary_journal` for Texas compliance
4. 🔧 Extend `Booking` model with witness and mileage fields

#### **Phase 1-2 - Core UX & RON MVP**
1. 🔧 Add `service_areas` table for admin polygon editor
2. 🔧 Add `mileage_cache` for performance optimization
3. 🔧 Customer preference extensions to `User` model

#### **Phase 3-5 - Advanced Features**
1. 🔧 Add `daily_metrics` for KPI dashboard
2. 🔧 Add `feature_flags` for LaunchDarkly integration
3. 🔧 Performance indexes and query optimization

### 📊 **Current Schema Strengths**

1. **Comprehensive Booking Lifecycle** - Handles both mobile and RON paths
2. **Texas RON Compliance** - Proof.co integration fields already present
3. **Payment System** - Multi-provider support with Stripe primary
4. **Notification System** - Complete notification lifecycle tracking
5. **Security Ready** - Proper user roles and audit logging
6. **Extensible Design** - JSONB fields for flexible data storage

### 🚨 **Critical Missing Pieces for v1.2**

1. **Notary Journal Table** - Required for Texas notary law compliance
2. **Service Area Polygons** - Required for admin portal geofencing
3. **Notary Profile Extensions** - Required for notary portal functionality
4. **Mileage Calculation Cache** - Required for performance at scale

### 💡 **Recommendation**

**The database is 85% ready for the v1.2 specification.** The core booking, payment, and user management systems are solid. We need to add 3-4 tables and extend 2 existing tables to reach 100% compliance.

**Immediate Action Items:**
1. Create migration for `notary_profiles` table
2. Create migration for `notary_journal` table  
3. Extend `Booking` model with witness/mileage fields
4. Add PostGIS extension for geographic service areas

**Timeline**: These changes can be implemented in 1-2 days without breaking existing functionality. 