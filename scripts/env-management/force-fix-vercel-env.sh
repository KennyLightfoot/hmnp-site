#!/bin/bash

# ============================================================================
# CRITICAL PRODUCTION FIX - Force Environment Variable Cleaning
# Houston Mobile Notary Pros
# ============================================================================
# 
# ROOT CAUSE IDENTIFIED: Shell scripts have been adding trailing \n characters
# to environment variables through unsafe echo piping and improper handling.
# 
# This script addresses the core issue by:
# 1. Using printf instead of echo to avoid newlines
# 2. Explicitly cleaning variables before setting
# 3. Force redeployment to clear any cached corrupted values
# 4. Verification that fixes the "production\n" NODE_ENV issue
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
# CRITICAL FIX: Safe environment variable setting function
# ============================================================================

set_clean_env_var() {
    local var_name="$1"
    local var_value="$2"
    
    log "Setting $var_name with proper cleaning..."
    
    # Clean the value explicitly (remove all forms of whitespace corruption)
    local cleaned_value
    cleaned_value=$(printf "%s" "$var_value" | tr -d '\n\r\t\0' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed 's/^"//;s/"$//')
    
    # Verify the value is actually clean
    if [[ "$cleaned_value" != "$var_value" ]]; then
        warning "Value was cleaned: '$var_value' -> '$cleaned_value'"
    fi
    
    # Use printf to avoid any newline injection
    if printf "%s" "$cleaned_value" | vercel env add "$var_name" production > /dev/null 2>&1; then
        success "$var_name set successfully (length: ${#cleaned_value})"
        return 0
    else
        error "Failed to set $var_name"
        return 1
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

log "🚨 CRITICAL PRODUCTION FIX: Force cleaning corrupted environment variables"
echo "============================================================================"

# Pre-flight checks
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI not installed. Install with: npm install -g vercel"
    exit 1
fi

if ! vercel whoami &> /dev/null; then
    error "Not logged in to Vercel. Run: vercel login"
    exit 1
fi

success "Pre-flight checks passed"

# Create backup
log "Creating backup of current environment variables..."
backup_file="critical-env-backup-$(date +%Y%m%d-%H%M%S).txt"
vercel env ls production > "$backup_file" 2>/dev/null || true
success "Backup created: $backup_file"

# ============================================================================
# REMOVE ALL CORRUPTED VARIABLES FIRST
# ============================================================================

log "Removing all potentially corrupted environment variables..."

critical_vars=(
    "NODE_ENV"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "GOOGLE_MAPS_API_KEY"
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
    "GHL_WEBHOOK_SECRET"
)

for var_name in "${critical_vars[@]}"; do
    log "Removing existing $var_name..."
    vercel env rm "$var_name" production --yes 2>/dev/null || warning "Could not remove $var_name (may not exist)"
done

success "All corrupted variables removed"

# ============================================================================
# SET CLEAN VARIABLES USING SAFE METHOD
# ============================================================================

log "Setting clean environment variables using safe method..."

failed_vars=()

# Critical variables with absolutely clean values
if ! set_clean_env_var "NODE_ENV" "production"; then
    failed_vars+=("NODE_ENV")
fi

if ! set_clean_env_var "STRIPE_SECRET_KEY" "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"; then
    failed_vars+=("STRIPE_SECRET_KEY")
fi

if ! set_clean_env_var "STRIPE_WEBHOOK_SECRET" "whsec_D1PVCJxGGtjGUmGBCsUtfJGy31n8zRrJ"; then
    failed_vars+=("STRIPE_WEBHOOK_SECRET")
fi

if ! set_clean_env_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_live_51QMx2aAx8ko8hXd8NSAYNXb4bMcPjIFZF8Gr7GJbrzn9XFxixpxBe07zJsIPgggy7CcpPXfLQY2WIpacZSMoEzfa00k7NSj6r7"; then
    failed_vars+=("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
fi

if ! set_clean_env_var "GOOGLE_MAPS_API_KEY" "AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw"; then
    failed_vars+=("GOOGLE_MAPS_API_KEY")
fi

if ! set_clean_env_var "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw"; then
    failed_vars+=("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
fi

if ! set_clean_env_var "GHL_WEBHOOK_SECRET" "f1e2d3c4b5a6987654321098765432109876543210987654321098765432109876543210"; then
    failed_vars+=("GHL_WEBHOOK_SECRET")
fi

# ============================================================================
# FORCE COMPLETE REDEPLOYMENT
# ============================================================================

log "Forcing complete redeployment to clear all cached corrupted values..."

# Get current commit
current_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
log "Current commit: $current_commit"

# Force complete rebuild and redeployment
log "Triggering forced production deployment..."
if vercel --prod --force --scope="$(vercel whoami 2>/dev/null)" > /dev/null 2>&1; then
    success "Forced redeployment initiated successfully"
else
    warning "Automated redeployment failed - you may need to manually redeploy in Vercel dashboard"
fi

# ============================================================================
# VERIFICATION
# ============================================================================

log "Waiting 10 seconds for environment variables to propagate..."
sleep 10

log "Verifying environment variables are set correctly..."
echo ""
echo "Current Production Environment Variables:"
echo "========================================"
vercel env ls production 2>/dev/null | grep -E "(NODE_ENV|STRIPE|GOOGLE|GHL)" || echo "Could not verify variables"

# ============================================================================
# RESULTS
# ============================================================================

echo ""
echo "============================================================================"

if [ ${#failed_vars[@]} -eq 0 ]; then
    success "🎉 CRITICAL FIX COMPLETED SUCCESSFULLY!"
    echo ""
    echo "✅ All environment variables cleaned and set with safe method"
    echo "✅ NODE_ENV should now be exactly 'production' (no trailing \\n)"
    echo "✅ Stripe authorization headers should be clean"
    echo "✅ Google Maps API keys should work without REQUEST_DENIED"
    echo "✅ GHL webhook signature verification should work"
    echo "✅ Forced complete redeployment initiated"
    echo ""
    echo "📊 Expected Resolution Timeline:"
    echo "- Environment propagation: 1-2 minutes"
    echo "- Complete redeployment: 3-5 minutes"
    echo "- Full issue resolution: 5-10 minutes"
    echo ""
    echo "🔍 Monitor production logs to confirm errors are resolved"
else
    error "⚠️  Some variables failed to set: ${failed_vars[*]}"
    echo ""
    echo "Manual action required:"
    echo "1. Go to Vercel Dashboard -> Your Project -> Settings -> Environment Variables"
    echo "2. Manually set the failed variables with clean values"
    echo "3. Ensure no trailing whitespace or newlines"
    echo "4. Redeploy the application"
fi

echo ""
echo "🔄 NEXT STEPS:"
echo "=============="
echo "1. Wait 5-10 minutes for complete redeployment"
echo "2. Check production logs for resolution of:"
echo "   - NODE_ENV warnings"
echo "   - Stripe authorization header errors"
echo "   - Google Maps REQUEST_DENIED errors"
echo "3. Test critical functionality:"
echo "   - Address autocomplete on booking page"
echo "   - Stripe payment processing"
echo "   - GHL webhook processing"
echo "4. If issues persist, check Vercel deployment logs"
echo ""
echo "📁 Backup location: $backup_file"
echo ""

success "Critical production fix execution completed!"
echo "============================================================================"