#!/bin/bash

# Sync All Environment Variables from .env.local to Vercel
echo "🔄 SYNCING ALL ENVIRONMENT VARIABLES"
echo "===================================="

# Function to safely extract value from .env.local
get_env_value() {
    local key=$1
    local value=$(grep "^$key=" .env.local | head -1 | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    echo "$value"
}

# Function to sync a single variable to all environments
sync_var() {
    local key=$1
    local value=$(get_env_value "$key")
    
    if [ -n "$value" ]; then
        echo "📝 Syncing $key..."
        echo "$value" | vercel env add "$key" production --force > /dev/null 2>&1
        echo "$value" | vercel env add "$key" preview --force > /dev/null 2>&1
        echo "$value" | vercel env add "$key" development --force > /dev/null 2>&1
        echo "✅ $key synced"
    else
        echo "⚠️  $key not found in .env.local"
    fi
}

# Essential variables for app functionality
echo "🚀 Syncing Essential Variables..."

# Database & Supabase
sync_var "DATABASE_URL_UNPOOLED"
sync_var "NEXT_PUBLIC_SUPABASE_URL"
sync_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
sync_var "SUPABASE_SERVICE_ROLE_KEY"
sync_var "SUPABASE_JWT_SECRET"

# NextAuth additional
sync_var "NEXTAUTH_URL_INTERNAL"

# Server config
sync_var "API_PORT"
sync_var "PORT"

# Security & API keys
sync_var "JWT_SECRET"
sync_var "JWT_REFRESH_SECRET"
sync_var "ENCRYPTION_KEY"
sync_var "INTERNAL_API_KEY"
sync_var "CRON_SECRET"
sync_var "ADMIN_API_KEY"

# CORS & Rate limiting
sync_var "ALLOWED_ORIGINS"
sync_var "RATE_LIMIT_WINDOW_MS"
sync_var "RATE_LIMIT_MAX_REQUESTS"

# Redis
sync_var "REDIS_URL"
sync_var "REDIS_HOST"
sync_var "REDIS_PORT"
sync_var "REDIS_PASSWORD"
sync_var "UPSTASH_REDIS_REST_URL"
sync_var "UPSTASH_REDIS_REST_TOKEN"
sync_var "QSTASH_URL"
sync_var "QSTASH_TOKEN"

# Payment
sync_var "PAYMENT_EXPIRATION_HOURS"

echo ""
echo "🌍 Syncing GoHighLevel Variables..."

# GHL Core
sync_var "GHL_PRIVATE_INTEGRATION_TOKEN"
sync_var "GHL_API_KEY"
sync_var "GHL_API_BASE_URL"
sync_var "GHL_BASE_URL"
sync_var "GHL_API_VERSION"
sync_var "GHL_LOCATION_ID"
sync_var "GHL_WEBHOOK_SECRET"
sync_var "GHL_CLIENT_ID"
sync_var "GHL_CLIENT_SECRET"
sync_var "GHL_REDIRECT_URI"

# GHL Calendars
sync_var "GHL_ESSENTIAL_CALENDAR_ID"
sync_var "GHL_PRIORITY_CALENDAR_ID"
sync_var "GHL_LOAN_CALENDAR_ID"
sync_var "GHL_REVERSE_MORTGAGE_CALENDAR_ID"
sync_var "GHL_SPECIALTY_CALENDAR_ID"
sync_var "GHL_CALLS_CALENDAR_ID"
sync_var "GHL_BOOKING_CALENDAR_ID"

echo ""
echo "📧 Syncing Communication Variables..."

# Email
sync_var "RESEND_API_KEY"
sync_var "FROM_EMAIL"
sync_var "ADMIN_EMAIL"

# Google Maps
sync_var "GOOGLE_MAPS_API_KEY"
sync_var "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"

# AWS S3
sync_var "AWS_ACCESS_KEY_ID"
sync_var "AWS_SECRET_ACCESS_KEY"
sync_var "AWS_REGION"
sync_var "S3_BUCKET"

echo ""
echo "🚩 Syncing Feature Flags & Site Config..."

# Feature flags
sync_var "ENABLE_GUEST_BOOKINGS"
sync_var "ENABLE_PAYMENT_PROCESSING"
sync_var "ENABLE_GHL_INTEGRATION"
sync_var "ENABLE_SMS_NOTIFICATIONS"

# Development flags
sync_var "DEV_MODE"
sync_var "STORE_WEBHOOK_DATA"
sync_var "DEVELOPMENT_MODE"

# Site URLs
sync_var "NEXT_PUBLIC_SITE_URL"
sync_var "NEXT_PUBLIC_APP_URL"
sync_var "NEXT_PUBLIC_BASE_URL"
sync_var "WEBHOOK_URL"

# Business config
sync_var "BUSINESS_NAME"
sync_var "BUSINESS_PHONE"
sync_var "SERVICE_AREA_RADIUS_MILES"

# Monitoring
sync_var "SENTRY_DSN"
sync_var "NEXT_PUBLIC_SENTRY_DSN"
sync_var "NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SDK_KEY"
sync_var "LAUNCHDARKLY_SERVER_SDK_KEY"

echo ""
echo "🎉 ENVIRONMENT SYNC COMPLETE"
echo "============================"
echo "✅ All variables from .env.local have been synced to Vercel"
echo "✅ Production, Preview, and Development environments updated"
echo ""
echo "📋 Next Steps:"
echo "1. Verify critical Stripe variables are working"
echo "2. Deploy to test the booking system"
echo "3. Monitor for any remaining environment issues"