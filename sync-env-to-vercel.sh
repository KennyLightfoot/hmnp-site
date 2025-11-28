#!/bin/bash

# Critical environment variables sync script for Vercel
# Based on your .env.local file - syncs only the most important variables

echo "🚀 Syncing critical environment variables to Vercel..."
echo "⚠️  Make sure you're in the correct Vercel project context first!"
echo ""

# Optionally load values from .env.local to avoid hard-coding secrets in this script
if [ -f ./.env.local ]; then
    echo "Loading variables from .env.local..."
    set -a
    # shellcheck disable=SC1091
    . ./.env.local
    set +a
fi

# Function to add environment variable to all environments
add_env_var() {
    local name=$1
    local value=$2
    echo "Adding $name to production, preview, and development..."
    
    echo "$value" | vercel env add "$name" production
    echo "$value" | vercel env add "$name" preview  
    echo "$value" | vercel env add "$name" development
    echo "✅ $name added to all environments"
    echo ""
}

# Helper: add env var by reading its value from current environment
add_env_var_from_env() {
    local name=$1
    local value=${!name}
    if [ -z "$value" ]; then
        echo "⚠️  Skipping $name (no value set in environment)"
        return 0
    fi
    add_env_var "$name" "$value"
}

# Database Configuration (CRITICAL) - read from environment
add_env_var_from_env "DATABASE_URL"
add_env_var_from_env "DATABASE_URL_UNPOOLED"

# Supabase Configuration (CRITICAL) - read from environment
add_env_var_from_env "NEXT_PUBLIC_SUPABASE_URL"
add_env_var_from_env "NEXT_PUBLIC_SUPABASE_ANON_KEY"
add_env_var_from_env "SUPABASE_SERVICE_ROLE_KEY"

# NextAuth Configuration (CRITICAL) - read from environment
add_env_var_from_env "NEXTAUTH_SECRET"
add_env_var "NEXTAUTH_URL" "${NEXTAUTH_URL:-https://houstonmobilenotarypros.com}"
add_env_var "NEXTAUTH_URL_INTERNAL" "${NEXTAUTH_URL_INTERNAL:-https://houstonmobilenotarypros.com}"

# 🔥 STRIPE CONFIGURATION (CRITICAL FOR BOOKING FIX!) - read from environment
echo "🔥 Adding Stripe configuration - THIS IS CRITICAL FOR THE BOOKING FIX!"
add_env_var_from_env "STRIPE_SECRET_KEY"
add_env_var_from_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
add_env_var_from_env "STRIPE_WEBHOOK_SECRET"

# Redis Configuration (CRITICAL for rate limiting) - read from environment
add_env_var_from_env "REDIS_URL"
add_env_var_from_env "REDIS_HOST"
add_env_var_from_env "REDIS_PORT"
add_env_var_from_env "REDIS_PASSWORD"

# API Security (CRITICAL) - read from environment
add_env_var_from_env "INTERNAL_API_KEY"
add_env_var_from_env "CRON_SECRET"
add_env_var_from_env "ADMIN_API_KEY"

# GoHighLevel Integration (CRITICAL for CRM) - read from environment
add_env_var_from_env "GHL_API_KEY"
add_env_var_from_env "GHL_LOCATION_ID"
add_env_var "GHL_API_BASE_URL" "${GHL_API_BASE_URL:-https://services.leadconnectorhq.com}"

# Google Maps (CRITICAL for booking location validation)
# Use values from current environment (loaded from .env.local if present)
add_env_var_from_env "GOOGLE_MAPS_API_KEY"
add_env_var_from_env "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"

# Vertex AI (Gemini)
add_env_var_from_env "GOOGLE_SERVICE_ACCOUNT_JSON"
add_env_var_from_env "GOOGLE_PROJECT_ID"
add_env_var_from_env "GOOGLE_REGION"
add_env_var_from_env "VERTEX_MODEL_ID"

# Email Services (CRITICAL for notifications) - read from environment
add_env_var_from_env "RESEND_API_KEY"
add_env_var "FROM_EMAIL" "${FROM_EMAIL:-no-reply@houstonmobilenotarypros.com}"
add_env_var "ADMIN_EMAIL" "${ADMIN_EMAIL:-houstonmobilenotarypros@gmail.com}"

# AWS S3 (CRITICAL for file uploads) - read from environment
add_env_var_from_env "AWS_ACCESS_KEY_ID"
add_env_var_from_env "AWS_SECRET_ACCESS_KEY"
add_env_var "AWS_REGION" "${AWS_REGION:-us-east-1}"
add_env_var "S3_BUCKET" "${S3_BUCKET:-houston-notary-docs}"

# Monitoring (CRITICAL for error tracking) - read from environment
add_env_var_from_env "SENTRY_DSN"
add_env_var_from_env "NEXT_PUBLIC_SENTRY_DSN"

# Feature Flags (CRITICAL for production control)
add_env_var "ENABLE_GUEST_BOOKINGS" "true"
add_env_var "ENABLE_PAYMENT_PROCESSING" "true"
add_env_var "ENABLE_GHL_INTEGRATION" "true"
add_env_var "ENABLE_SMS_NOTIFICATIONS" "true"

# Site URLs (CRITICAL for redirects and webhooks)
add_env_var "NEXT_PUBLIC_SITE_URL" "https://houstonmobilenotarypros.com"
add_env_var "NEXT_PUBLIC_APP_URL" "https://houstonmobilenotarypros.com"
add_env_var "NEXT_PUBLIC_BASE_URL" "https://houstonmobilenotarypros.com"
add_env_var "WEBHOOK_URL" "https://houstonmobilenotarypros.com"

echo ""
echo "🎉 Critical environment variables have been synced to Vercel!"
echo "🔍 Next steps:"
echo "   1. Run 'vercel env ls production' to verify all variables are set"
echo "   2. Deploy your app to test the Stripe booking fix"
echo "   3. Monitor the logs for any remaining environment variable issues"
echo ""
echo "✅ SECURITY: This script now reads from .env.local - no hardcoded secrets!" 