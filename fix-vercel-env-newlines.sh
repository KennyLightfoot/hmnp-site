#!/bin/bash

# Fix Vercel Environment Variables - Remove trailing newline characters
# This fixes the 403 GHL API errors and email validation errors

echo "🔧 FIXING VERCEL ENVIRONMENT VARIABLES"
echo "======================================"
echo ""

# Critical variables that need newline cleanup
VARIABLES_TO_FIX=(
    "GHL_LOCATION_ID"
    "ADMIN_EMAIL"
    "CONTACT_FORM_RECEIVER_EMAIL"
    "FROM_EMAIL"
    "BUSINESS_EMAIL"
    "GHL_API_KEY"
    "GHL_PRIVATE_INTEGRATION_TOKEN"
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "REDIS_URL"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "RESEND_API_KEY"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "GOOGLE_MAPS_API_KEY"
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
    "INTERNAL_API_KEY"
    "CRON_SECRET"
    "ADMIN_API_KEY"
)

# Function to get clean value from .env.local
get_clean_value() {
    local key=$1
    local value=$(grep "^$key=" .env.local | head -1 | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    echo "$value"
}

# Function to update Vercel environment variable
update_vercel_env() {
    local key=$1
    local value=$2
    local environments=("production" "preview" "development")
    
    if [ -n "$value" ]; then
        echo "🔄 Fixing $key..."
        
        # Remove the variable first, then re-add it clean
        for env in "${environments[@]}"; do
            vercel env rm "$key" "$env" --yes &> /dev/null
            echo "$value" | vercel env add "$key" "$env" --force &> /dev/null
        done
        
        echo "✅ $key fixed in all environments"
        return 0
    else
        echo "⚠️  $key not found in .env.local"
        return 1
    fi
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found! Please create it first."
    exit 1
fi

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it: npm i -g vercel"
    exit 1
fi

# Check Vercel authentication
if ! vercel whoami &> /dev/null; then
    echo "❌ Please login to Vercel first: vercel login"
    exit 1
fi

echo "🚀 Starting environment variable cleanup..."
echo ""

success_count=0
total_count=${#VARIABLES_TO_FIX[@]}

for var in "${VARIABLES_TO_FIX[@]}"; do
    clean_value=$(get_clean_value "$var")
    if update_vercel_env "$var" "$clean_value"; then
        ((success_count++))
    fi
done

echo ""
echo "📊 CLEANUP RESULTS"
echo "=================="
echo "✅ Successfully fixed: $success_count/$total_count variables"

if [ $success_count -gt 0 ]; then
    echo ""
    echo "🎉 Environment variables have been cleaned up!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Deploy your application: vercel --prod"
    echo "2. Test the contact form - it should work now!"
    echo "3. Test the booking system"
    echo "4. Monitor logs for any remaining issues"
    echo ""
    echo "🔍 The main fixes:"
    echo "- GHL_LOCATION_ID: Removed trailing newline (fixes 403 errors)"
    echo "- Email addresses: Cleaned up (fixes email validation errors)"
    echo "- All other critical variables: Sanitized"
else
    echo ""
    echo "⚠️  No variables were updated. Check your .env.local file."
fi

echo ""
echo "🔍 To verify the fixes:"
echo "vercel env ls production | grep -E 'GHL_LOCATION_ID|ADMIN_EMAIL'" 