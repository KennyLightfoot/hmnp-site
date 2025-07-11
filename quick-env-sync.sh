#!/bin/bash

# Quick Environment Sync - Automated alignment without manual intervention
# Uses .env.local as the source of truth for Vercel environment variables

echo "⚡ QUICK ENVIRONMENT SYNC"
echo "========================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found! Please create it first."
    exit 1
fi

# Check if user is logged into Vercel
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it: npm i -g vercel"
    exit 1
fi

echo "🔍 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Please login to Vercel first: vercel login"
    exit 1
fi

echo "✅ Vercel CLI ready"
echo ""

# Function to extract and sync environment variable
sync_env_var() {
    local key=$1
    local environments=("production" "preview" "development")
    
    # Extract value from .env.local
    local value=$(grep "^$key=" .env.local | head -1 | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    
    if [ -n "$value" ]; then
        echo "📝 Syncing $key..."
        
        # Sync to all environments
        for env in "${environments[@]}"; do
            echo "$value" | vercel env add "$key" "$env" --force &> /dev/null
        done
        
        echo "✅ $key synced to all environments"
        return 0
    else
        echo "⚠️  $key not found in .env.local"
        return 1
    fi
}

# Critical variables that MUST be synced
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

echo "🚀 Syncing critical environment variables..."
echo ""

success_count=0
total_count=${#CRITICAL_VARS[@]}

for var in "${CRITICAL_VARS[@]}"; do
    if sync_env_var "$var"; then
        ((success_count++))
    fi
done

echo ""
echo "📊 SYNC RESULTS"
echo "==============="
echo "✅ Successfully synced: $success_count/$total_count variables"

if [ $success_count -eq $total_count ]; then
    echo ""
    echo "🎉 PERFECT! All critical variables are now synchronized!"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Deploy your application: vercel --prod"
    echo "2. Test the booking system functionality"
    echo "3. Monitor logs for any remaining issues"
else
    echo ""
    echo "⚠️  Some variables were not found in .env.local"
    echo "Check your .env.local file and add missing variables"
    echo ""
    echo "💡 TIP: Use .env.example as a reference for required variables"
fi

echo ""
echo "🔍 To verify sync was successful:"
echo "vercel env ls production" 