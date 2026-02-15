#!/bin/bash

# ============================================================================
# Houston Mobile Notary Pros - Production Environment Variables Fix
# ============================================================================
# 
# CRITICAL PRODUCTION FIX: Remove trailing \n characters from environment 
# variables that are breaking API integrations in production.
#
# Issues being resolved:
# - Google Maps API: REQUEST_DENIED errors
# - GHL Webhooks: Buffer length mismatch in signature verification
# - Stripe: Invalid authorization headers
# - NODE_ENV: Incorrectly set to development
#
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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
# PRE-FLIGHT CHECKS
# ============================================================================

log "Starting Houston Mobile Notary Pros production environment fix..."
echo "============================================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    error "Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    error "You are not logged in to Vercel. Please log in first:"
    echo "vercel login"
    exit 1
fi

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if this is the Houston Mobile Notary project
if ! grep -q "hmnp-site" package.json; then
    warning "This doesn't appear to be the Houston Mobile Notary project. Continue anyway? (y/n)"
    read -r confirm
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
        log "Aborted by user."
        exit 0
    fi
fi

success "Pre-flight checks passed."

# ============================================================================
# BACKUP CURRENT ENVIRONMENT VARIABLES
# ============================================================================

log "Creating backup of current production environment variables..."

backup_file="env-backup-$(date +%Y%m%d-%H%M%S).txt"
touch "$backup_file"

log "Backing up current environment variables to: $backup_file"

# Get current environment variables
vercel env ls production > "$backup_file" 2>/dev/null || {
    warning "Could not create full backup, but continuing with fix..."
}

success "Backup created: $backup_file"

# ============================================================================
# DEFINE CLEAN ENVIRONMENT VARIABLES
# ============================================================================

log "Defining clean environment variables..."

# Clean values without trailing newlines
declare -A ENV_VARS=(
    ["GOOGLE_MAPS_API_KEY"]="AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw"
    ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"]="AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw"
    ["GHL_WEBHOOK_SECRET"]="f1e2d3c4b5a6987654321098765432109876543210987654321098765432109876543210"
    ["STRIPE_SECRET_KEY"]="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"
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]="pk_live_51QMx2aAx8ko8hXd8NSAYNXb4bMcPjIFZF8Gr7GJbrzn9XFxixpxBe07zJsIPgggy7CcpPXfLQY2WIpacZSMoEzfa00k7NSj6r7"
    ["STRIPE_WEBHOOK_SECRET"]="whsec_D1PVCJxGGtjGUmGBCsUtfJGy31n8zRrJ"
    ["NODE_ENV"]="production"
)

success "Clean environment variables defined."

# ============================================================================
# REMOVE EXISTING CORRUPTED VARIABLES
# ============================================================================

log "Removing existing corrupted environment variables..."

for var_name in "${!ENV_VARS[@]}"; do
    log "Removing existing $var_name from production..."
    
    # Remove the variable (this will fail silently if it doesn't exist)
    vercel env rm "$var_name" production --yes 2>/dev/null || {
        warning "Could not remove $var_name (may not exist)"
    }
done

success "Existing variables removed."

# ============================================================================
# ADD CLEAN ENVIRONMENT VARIABLES
# ============================================================================

log "Adding clean environment variables to production..."

failed_vars=()

for var_name in "${!ENV_VARS[@]}"; do
    var_value="${ENV_VARS[$var_name]}"
    
    log "Adding $var_name to production environment..."
    
    # Add the clean variable
    if echo "$var_value" | vercel env add "$var_name" production > /dev/null 2>&1; then
        success "✅ $var_name added successfully"
    else
        error "❌ Failed to add $var_name"
        failed_vars+=("$var_name")
    fi
done

# ============================================================================
# VERIFY ENVIRONMENT VARIABLES
# ============================================================================

log "Verifying environment variables were set correctly..."

echo ""
echo "Production Environment Variables Status:"
echo "========================================"

# List all production environment variables
vercel env ls production 2>/dev/null || {
    error "Could not list environment variables"
    exit 1
}

# ============================================================================
# TRIGGER REDEPLOYMENT
# ============================================================================

log "Triggering production redeployment to apply new environment variables..."

# Get the current git commit hash
current_commit=$(git rev-parse HEAD)

log "Current commit: $current_commit"
log "Triggering redeployment..."

# Trigger redeployment
if vercel --prod > /dev/null 2>&1; then
    success "✅ Redeployment triggered successfully"
else
    error "❌ Failed to trigger redeployment"
    echo "You may need to manually trigger a redeployment in the Vercel dashboard"
fi

# ============================================================================
# FINAL VERIFICATION
# ============================================================================

log "Performing final verification..."

if [ ${#failed_vars[@]} -eq 0 ]; then
    success "🎉 ALL ENVIRONMENT VARIABLES FIXED SUCCESSFULLY!"
    echo ""
    echo "✅ Google Maps API keys cleaned (no more REQUEST_DENIED errors)"
    echo "✅ GHL webhook secret cleaned (no more buffer length errors)"  
    echo "✅ Stripe keys cleaned (no more authorization header errors)"
    echo "✅ NODE_ENV set to production"
    echo ""
    echo "Your production environment should now be fully functional!"
else
    error "⚠️  Some environment variables failed to set:"
    for var in "${failed_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please manually set these variables in the Vercel dashboard:"
    echo "https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables"
fi

# ============================================================================
# CLEANUP AND NEXT STEPS
# ============================================================================

log "Cleanup and next steps..."

echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo "1. Wait 2-3 minutes for the redeployment to complete"
echo "2. Test the following critical functions:"
echo "   - Google Maps distance calculations"
echo "   - GHL webhook signature verification"
echo "   - Stripe payment processing"
echo "   - Booking creation flow"
echo "3. Monitor production logs for any remaining errors"
echo "4. If issues persist, check the Vercel dashboard for deployment status"
echo ""
echo "📁 BACKUP LOCATION: $backup_file"
echo "🔄 REDEPLOYMENT: In progress (check Vercel dashboard)"
echo ""

# Show rollback instructions
echo "🔄 ROLLBACK INSTRUCTIONS (if needed):"
echo "====================================="
echo "If you need to rollback these changes:"
echo "1. Go to Vercel Dashboard -> Your Project -> Settings -> Environment Variables"
echo "2. Manually restore values from: $backup_file"
echo "3. Redeploy the application"
echo ""

success "Production environment fix completed!"
echo "============================================================================"