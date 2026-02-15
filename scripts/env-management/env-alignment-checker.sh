#!/bin/bash

# Environment Alignment Checker
# Compares local .env.local with Vercel environment variables
# Identifies missing or mismatched variables

echo "🔍 ENVIRONMENT ALIGNMENT CHECKER"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to check if variable exists locally
check_local_var() {
    local key=$1
    local value=$(grep "^$key=" .env.local | head -1 | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    if [ -n "$value" ]; then
        echo "$value"
    else
        echo ""
    fi
}

# Function to get Vercel variables (requires manual input from vercel env ls)
echo "📋 Step 1: Get current Vercel environment variables"
echo "Run this command and save the output to a file:"
echo "vercel env ls production > vercel-vars.txt"
echo ""
echo "Press Enter when you've done this..."
read -r

# Check if vercel-vars.txt exists
if [ ! -f "vercel-vars.txt" ]; then
    echo "❌ vercel-vars.txt not found. Please run 'vercel env ls production > vercel-vars.txt' first"
    exit 1
fi

echo "🔍 Step 2: Analyzing differences..."
echo ""

# Critical variables to check
CRITICAL_VARS=(
    "DATABASE_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "REDIS_URL"
    "GHL_API_KEY"
    "GHL_LOCATION_ID"
    "GOOGLE_MAPS_API_KEY"
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
    "RESEND_API_KEY"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "INTERNAL_API_KEY"
    "CRON_SECRET"
    "ADMIN_API_KEY"
)

echo "🚨 CRITICAL VARIABLES CHECK"
echo "=========================="
for var in "${CRITICAL_VARS[@]}"; do
    local_value=$(check_local_var "$var")
    vercel_exists=$(grep -q "$var" vercel-vars.txt && echo "yes" || echo "no")
    
    if [ -n "$local_value" ] && [ "$vercel_exists" = "yes" ]; then
        echo -e "${GREEN}✅ $var${NC} - Present in both"
    elif [ -n "$local_value" ] && [ "$vercel_exists" = "no" ]; then
        echo -e "${RED}❌ $var${NC} - Missing in Vercel"
    elif [ -z "$local_value" ] && [ "$vercel_exists" = "yes" ]; then
        echo -e "${YELLOW}⚠️  $var${NC} - In Vercel but not local"
    else
        echo -e "${RED}❌ $var${NC} - Missing in both"
    fi
done

echo ""
echo "📊 SUMMARY"
echo "=========="
missing_in_vercel=$(for var in "${CRITICAL_VARS[@]}"; do
    local_value=$(check_local_var "$var")
    vercel_exists=$(grep -q "$var" vercel-vars.txt && echo "yes" || echo "no")
    if [ -n "$local_value" ] && [ "$vercel_exists" = "no" ]; then
        echo "$var"
    fi
done)

if [ -n "$missing_in_vercel" ]; then
    echo -e "${RED}Variables missing in Vercel:${NC}"
    echo "$missing_in_vercel"
    echo ""
    echo "🔧 RECOMMENDED ACTIONS:"
    echo "1. Run ./sync-env-to-vercel.sh to sync critical variables"
    echo "2. Or run ./sync-all-env-vars.sh to sync everything"
    echo "3. Verify with 'vercel env ls production' after sync"
else
    echo -e "${GREEN}✅ All critical variables are present in both environments!${NC}"
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "1. If variables are missing, run the sync scripts"
echo "2. Deploy to test the changes"
echo "3. Monitor application logs for any remaining issues"
echo "4. Clean up temporary files: rm vercel-vars.txt" 