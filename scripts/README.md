# 🚀 Critical Booking System Fix - Deployment Scripts

This directory contains all the scripts needed to safely deploy the critical booking system fix to production.

## 🚨 CRITICAL ISSUES BEING FIXED

1. **Database Schema Mismatch**: Missing `travelFee` column causing 503 errors
2. **Deposit Payment Flow**: Bookings auto-confirming without payment verification

## 📋 SCRIPT OVERVIEW

### 🔥 CRITICAL SCRIPTS (Run in Order)

#### 1. Pre-Deployment Validation
```bash
# Comprehensive readiness check before deployment
node scripts/pre-deployment-checklist.js
```
**Purpose**: Validates all components are ready for deployment
**Status**: Must pass all critical checks before proceeding

#### 2. Migration Safety Validation  
```bash
# Validate migration is safe for production
node scripts/validate-migration-safety.js
```
**Purpose**: Ensures database migration won't cause data loss
**Status**: Must show "SAFE TO APPLY" before proceeding

#### 3. Database Migration
```bash
# Apply database schema changes
node scripts/apply-enhanced-pricing-migration.js
```
**Purpose**: Adds missing enhanced pricing columns to production database
**Status**: Creates backup, applies migration, verifies success

#### 4. Service Configuration Verification
```bash
# Ensure all services require deposits
node scripts/verify-service-deposit-config.js
```
**Purpose**: Validates and fixes service deposit requirements
**Status**: Ensures no auto-confirmed bookings

#### 5. Environment Verification
```bash
# Validate production environment configuration
node scripts/verify-environment-config.js
```
**Purpose**: Confirms all environment variables are properly set
**Status**: Ensures Stripe, database, and URLs are production-ready

## 🔧 SCRIPT DETAILS

### `pre-deployment-checklist.js`
**Comprehensive pre-deployment validation**

**What it checks**:
- ✅ Database schema migration files exist and are valid
- ✅ Database connection works
- ✅ Enhanced pricing columns are missing (confirming migration needed)
- ✅ Booking API has deposit enforcement fixes
- ✅ Payment flow uses checkoutUrl instead of clientSecret
- ✅ Payment recovery page exists and is complete
- ✅ Checkout session API is properly implemented
- ✅ All required environment variables are set
- ✅ Stripe keys are live keys (not test) for production
- ✅ All URLs use HTTPS for production
- ✅ Backup procedures are documented
- ✅ All services require deposits
- ✅ Deposit amounts are reasonable

**Exit codes**:
- `0`: All critical checks passed - GO FOR DEPLOYMENT
- `1`: Critical issues found - NO-GO FOR DEPLOYMENT

### `validate-migration-safety.js`
**Database migration safety validator**

**What it validates**:
- ✅ Uses only ADD COLUMN operations (no data loss risk)
- ✅ Uses IF NOT EXISTS for idempotency
- ✅ Provides safe default values for existing data
- ✅ Only nullable or defaulted columns
- ✅ Creates indexes efficiently
- ✅ No foreign key constraint conflicts
- ✅ No data manipulation (schema changes only)
- ✅ Appropriate data types

**Migration characteristics**:
- **SAFE**: Only adds new columns, never removes or modifies existing data
- **IDEMPOTENT**: Can be run multiple times safely
- **REVERSIBLE**: Changes can be undone if needed
- **FAST**: Minimal downtime, no table locks

### `apply-enhanced-pricing-migration.js`
**Production-safe database migration**

**What it does**:
1. **Backup**: Creates safety backup of current schema
2. **Validation**: Confirms migration is needed
3. **Migration**: Applies enhanced pricing columns in transaction
4. **Verification**: Confirms all columns were added correctly
5. **Cleanup**: Removes temporary backup files

**Columns added**:
- `calculatedDistance` (REAL) - Distance in miles from service center
- `travelFee` (DECIMAL(10,2)) - Travel fee based on distance  
- `serviceAreaValidated` (BOOLEAN) - Location validation status
- `pricingBreakdown` (JSONB) - Complete pricing breakdown
- `distanceCalculationMeta` (JSONB) - Distance calculation metadata
- `pricingVersion` (VARCHAR(10)) - Pricing engine version

**Safety features**:
- ✅ Full transaction rollback on any error
- ✅ Backup creation before changes
- ✅ Verification of successful application
- ✅ Detailed logging of all operations

### `verify-service-deposit-config.js`
**Service configuration validator and fixer**

**What it checks**:
- ✅ All active services have `requiresDeposit: true`
- ✅ Deposit amounts are reasonable (not too high/low)
- ✅ Deposit amounts don't exceed base prices
- ✅ Minimum deposit requirements met

**Auto-fixes**:
- Sets `requiresDeposit: true` for all active services
- Adjusts deposit amounts to reasonable values (typically 50% of base price)
- Ensures minimum $25 deposit requirement

### `verify-environment-config.js`
**Environment configuration validator**

**Required variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Must be `sk_live_*` for production
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Must be `pk_live_*` for production
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret
- `NEXT_PUBLIC_BASE_URL` - Must use HTTPS in production
- `NEXTAUTH_URL` - Must use HTTPS in production
- `NEXTAUTH_SECRET` - Minimum 32 characters
- `GHL_LOCATION_ID` - GoHighLevel location
- `GHL_API_KEY` - GoHighLevel API access

**Production checks**:
- ✅ Stripe keys are live (not test) keys
- ✅ URLs use HTTPS protocol
- ✅ Secrets meet security requirements
- ✅ All integrations properly configured

## 🚀 DEPLOYMENT WORKFLOW

### Phase 1: Pre-Deployment (5 minutes)
```bash
# 1. Run comprehensive validation
node scripts/pre-deployment-checklist.js

# 2. Validate migration safety
node scripts/validate-migration-safety.js

# 3. Verify environment
node scripts/verify-environment-config.js
```
**Goal**: Confirm system is ready for deployment
**Success Criteria**: All scripts exit with code 0

### Phase 2: Database Migration (5 minutes)
```bash
# 1. Apply database migration
node scripts/apply-enhanced-pricing-migration.js

# 2. Verify service configuration
node scripts/verify-service-deposit-config.js
```
**Goal**: Update database schema and service settings
**Success Criteria**: All columns added, all services require deposits

### Phase 3: Code Deployment (10 minutes)
1. Deploy updated application code
2. Monitor application startup
3. Verify no database connection errors
4. Test booking creation flow

### Phase 4: Verification (10 minutes)
1. Create test booking → should be `PAYMENT_PENDING`
2. Complete payment → should update to `CONFIRMED`
3. Test payment recovery for existing `PAYMENT_PENDING` bookings
4. Monitor error rates and performance

## 🆘 TROUBLESHOOTING

### Migration Fails
```bash
# Check database connection
node scripts/verify-environment-config.js

# Validate migration syntax
node scripts/validate-migration-safety.js

# Check database permissions
# Ensure user has ALTER TABLE privileges
```

### Service Configuration Issues
```bash
# Fix service configuration
node scripts/verify-service-deposit-config.js

# Manual fix if needed:
# UPDATE "Service" SET "requiresDeposit" = true WHERE "isActive" = true;
```

### Environment Problems
```bash
# Check all environment variables
node scripts/verify-environment-config.js

# Common issues:
# - DATABASE_URL not set
# - Test Stripe keys in production
# - HTTP URLs instead of HTTPS
```

## 📞 SUPPORT

### Before Deployment
- Run all validation scripts
- Ensure all checks pass
- Create database backup via Supabase dashboard

### During Deployment  
- Monitor application logs
- Watch for database connection errors
- Verify booking creation works

### After Deployment
- Monitor booking success rates
- Check payment completion rates
- Verify no auto-confirmed bookings

### Emergency Contacts
- **Database**: Supabase Dashboard
- **Payments**: Stripe Dashboard  
- **Hosting**: Vercel Dashboard

## ✅ SUCCESS CRITERIA

**Technical Metrics**:
- ✅ 0% booking creation errors
- ✅ All new bookings start as `PAYMENT_PENDING`
- ✅ >90% payment completion rate
- ✅ Enhanced pricing fields populate correctly

**Business Metrics**:
- ✅ No bookings confirmed without payment
- ✅ All `PAYMENT_PENDING` bookings can complete payment
- ✅ Customer payment experience is smooth
- ✅ No loss of existing bookings or data

## 🎉 DEPLOYMENT COMPLETE

After successful deployment:
1. ✅ Database schema fixed (no more column errors)
2. ✅ Deposit payment system enforced (no auto-confirmations)  
3. ✅ Payment recovery system functional
4. ✅ Enhanced pricing ready for future features

**Result**: Fully functional booking system where all appointments require confirmed deposit payments before being marked as CONFIRMED.