#!/bin/bash

# Critical environment variables sync script for Vercel
# Based on your .env.local file - syncs only the most important variables

echo "🚀 Syncing critical environment variables to Vercel..."
echo "⚠️  Make sure you're in the correct Vercel project context first!"
echo ""

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

# Database Configuration (CRITICAL)
add_env_var "DATABASE_URL" "postgresql://postgres:cyxI3XCjLTX57VI0@db.unnyhvuhobnmxnpffore.supabase.co:5432/postgres?sslmode=require"
add_env_var "DATABASE_URL_UNPOOLED" "postgresql://postgres:cyxI3XCjLTX57VI0@db.unnyhvuhobnmxnpffore.supabase.co:5432/postgres?sslmode=require"

# Supabase Configuration (CRITICAL)
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "https://unnyhvuhobnmxnpffore.supabase.co"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubnlodnVob2JubXhucGZmb3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjcxNzIsImV4cCI6MjA2NjMwMzE3Mn0.ZeZQ2nE322_bGjHq_lqtl0pEkIDfAA5usdXU1nx9k0Q"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubnlodnVob2JubXhucGZmb3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcyNzE3MiwiZXhwIjoyMDY2MzAzMTcyfQ.9zbdk4ZqmvSzRaO_a3WMpxcrHTdwpkxJ2JiYJRqO4o0"

# NextAuth Configuration (CRITICAL)
add_env_var "NEXTAUTH_SECRET" "BoE/DaOyE7XJk2np0rDNmk7qXJq0ssgbsG4qMmCZ1Ic="
add_env_var "NEXTAUTH_URL" "https://houstonmobilenotarypros.com"
add_env_var "NEXTAUTH_URL_INTERNAL" "https://houstonmobilenotarypros.com"

# 🔥 STRIPE CONFIGURATION (CRITICAL FOR BOOKING FIX!)
echo "🔥 Adding Stripe configuration - THIS IS CRITICAL FOR THE BOOKING FIX!"
add_env_var "STRIPE_SECRET_KEY" "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"
add_env_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_live_51QMx2aAx8ko8hXd8NSAYNXb4bMcPjIFZF8Gr7GJbrzn9XFxixpxBe07zJsIPgggy7CcpPXfLQY2WIpacZSMoEzfa00k7NSj6r7"
add_env_var "STRIPE_WEBHOOK_SECRET" "whsec_D1PVCJxGGtjGUmGBCsUtfJGy31n8zRrJ"

# Redis Configuration (CRITICAL for rate limiting)
add_env_var "REDIS_URL" "redis://default:pnpaQyi2JdOb0GH0SVRGjjXwy0pmapV3@redis-18979.c80.us-east-1-2.ec2.redns.redis-cloud.com:18979"
add_env_var "REDIS_HOST" "redis-18979.c80.us-east-1-2.ec2.redns.redis-cloud.com"
add_env_var "REDIS_PORT" "18979"
add_env_var "REDIS_PASSWORD" "pnpaQyi2JdOb0GH0SVRGjjXwy0pmapV3"

# API Security (CRITICAL)
add_env_var "INTERNAL_API_KEY" "mav+PpkGCyAADIyUlTUBGIk194KCa3U4"
add_env_var "CRON_SECRET" "dSnDygbN3YXCEphCFymKyd0TMfuhjXzu"
add_env_var "ADMIN_API_KEY" "7k9m2n5p8q1s4t7u0v3w6x9y2z5a8b1c4d7e0f3g6h9i2j5k8l1m4n7o0p3q6r9s2t5u8v1w4x7y0z3"

# GoHighLevel Integration (CRITICAL for CRM)
add_env_var "GHL_API_KEY" "pit-f7f2fad9-fe5a-4c19-86ff-cb3a4177784a"
add_env_var "GHL_LOCATION_ID" "oUvYNTw2Wvul7JSJplqQ"
add_env_var "GHL_API_BASE_URL" "https://services.leadconnectorhq.com"

# Google Maps (CRITICAL for booking location validation)
add_env_var "GOOGLE_MAPS_API_KEY" "AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw"
add_env_var "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw"

# Email Services (CRITICAL for notifications)
add_env_var "RESEND_API_KEY" "re_LisJRVK9_LbaKdMi8gZNafPvWD2H2Myca"
add_env_var "FROM_EMAIL" "no-reply@houstonmobilenotarypros.com"
add_env_var "ADMIN_EMAIL" "houstonmobilenotarypros@gmail.com"

# AWS S3 (CRITICAL for file uploads)
add_env_var "AWS_ACCESS_KEY_ID" "AKIAYWBJYUTW5O6XNZ23"
add_env_var "AWS_SECRET_ACCESS_KEY" "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"
add_env_var "AWS_REGION" "us-east-1"
add_env_var "S3_BUCKET" "houston-notary-docs"

# Monitoring (CRITICAL for error tracking)
add_env_var "SENTRY_DSN" "https://dcf43018a2b7757b6b3677520acc854f@o4508626800803840.ingest.us.sentry.io/4508626801000448"
add_env_var "NEXT_PUBLIC_SENTRY_DSN" "https://dcf43018a2b7757b6b3677520acc854f@o4508626800803840.ingest.us.sentry.io/4508626801000448"

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
echo "🚨 IMPORTANT: This script contains sensitive data. Delete it after use!" 