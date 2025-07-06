#!/bin/bash

# ============================================================================
# Houston Mobile Notary Pros - Production Environment Rollback
# ============================================================================
# 
# EMERGENCY ROLLBACK SCRIPT: Use this if the environment variable fix
# caused issues and you need to quickly restore the previous state.
#
# ⚠️  WARNING: This should only be used in emergency situations
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ SUCCESS:${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
}

# ============================================================================
# ROLLBACK CONFIRMATION
# ============================================================================

echo ""
echo "🚨 EMERGENCY ROLLBACK SCRIPT 🚨"
echo "============================================================================"
warning "This script will restore the ORIGINAL (corrupted) environment variables"
warning "that were causing the API failures. This should only be used in"
warning "emergency situations where the fix caused worse issues."
echo ""
echo "Are you sure you want to proceed with the rollback? (type 'ROLLBACK' to confirm)"
read -r confirmation

if [ "$confirmation" != "ROLLBACK" ]; then
    log "Rollback cancelled."
    exit 0
fi

log "Starting emergency rollback..."

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI is not installed"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    error "Not logged in to Vercel"
    exit 1
fi

success "Pre-flight checks passed"

# ============================================================================
# RESTORE ORIGINAL (CORRUPTED) ENVIRONMENT VARIABLES
# ============================================================================

log "Restoring original environment variables..."

# Original corrupted values (with trailing newlines)
declare -A ORIGINAL_ENV_VARS=(
    ["GOOGLE_MAPS_API_KEY"]="AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw\n"
    ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"]="AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw\n"
    ["GHL_WEBHOOK_SECRET"]="f1e2d3c4b5a6987654321098765432109876543210987654321098765432109876543210\n"
    ["STRIPE_SECRET_KEY"]="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"
    ["STRIPE_WEBHOOK_SECRET"]="whsec_D1PVCJxGGtjGUmGBCsUtfJGy31n8zRrJ"
    ["NODE_ENV"]="development"
)

# Remove current variables
for var_name in "${!ORIGINAL_ENV_VARS[@]}"; do
    log "Removing current $var_name..."
    vercel env rm "$var_name" production --yes 2>/dev/null || {
        warning "Could not remove $var_name (may not exist)"
    }
done

# Restore original variables
for var_name in "${!ORIGINAL_ENV_VARS[@]}"; do
    var_value="${ORIGINAL_ENV_VARS[$var_name]}"
    
    log "Restoring original $var_name..."
    
    if echo -e "$var_value" | vercel env add "$var_name" production > /dev/null 2>&1; then
        success "$var_name restored"
    else
        error "Failed to restore $var_name"
    fi
done

# ============================================================================
# TRIGGER REDEPLOYMENT
# ============================================================================

log "Triggering redeployment with original environment variables..."

if vercel --prod > /dev/null 2>&1; then
    success "Redeployment triggered"
else
    error "Failed to trigger redeployment"
fi

# ============================================================================
# RESULTS
# ============================================================================

echo ""
echo "============================================================================"
warning "🚨 ROLLBACK COMPLETED 🚨"
echo "============================================================================"
echo ""
echo "⚠️  Your production environment has been restored to the original state"
echo "⚠️  This means the following issues will return:"
echo "   - Google Maps API: REQUEST_DENIED errors"
echo "   - GHL Webhooks: Buffer length mismatch errors"
echo "   - Stripe: Authorization header errors"
echo "   - NODE_ENV: Set to 'development' in production"
echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo "1. Wait for the redeployment to complete"
echo "2. Identify and fix the root cause of why the original fix failed"
echo "3. Re-run the fix script: ./fix-production-env-vars.sh"
echo "4. Test thoroughly before deploying again"
echo ""
echo "💡 DEBUGGING SUGGESTIONS:"
echo "========================="
echo "1. Check Vercel deployment logs for specific error messages"
echo "2. Verify that all API keys are still valid"
echo "3. Test individual API endpoints manually"
echo "4. Check for any code changes that might conflict with the fixed environment"
echo ""

success "Rollback script completed"
echo "============================================================================"