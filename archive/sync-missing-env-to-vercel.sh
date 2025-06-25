#!/bin/bash

echo "🚀 SYNCING MISSING ENVIRONMENT VARIABLES TO VERCEL"
echo "=================================================="

# Function to add environment variable to Vercel
add_to_vercel() {
    local key=$1
    local value=$2
    local environment=${3:-"production,preview"}
    
    echo "Adding $key to Vercel..."
    echo "$value" | vercel env add "$key" "$environment" --force
}

# Critical Database & Infrastructure
echo "📦 1. Database & Infrastructure Variables"
add_to_vercel "SENTRY_DSN" "https://dcf43018a2b7757b6b3677520acc854f@o4508626800803840.ingest.us.sentry.io/4508626801000448"
add_to_vercel "DATABASE_URL" "postgresql://neondb_owner:npg_clS0GqYNbh8d@ep-summer-mode-a4ocsti3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
add_to_vercel "DATABASE_URL_UNPOOLED" "postgresql://neondb_owner:npg_clS0GqYNbh8d@ep-summer-mode-a4ocsti3.us-east-1.aws.neon.tech/neondb?sslmode=require&options=-c%20lock_timeout=30000"
add_to_vercel "PGHOST" "ep-summer-mode-a4ocsti3-pooler.us-east-1.aws.neon.tech"

# Server Configuration (Production Values)
echo "⚙️  2. Server Configuration"
add_to_vercel "NODE_ENV" "production"
add_to_vercel "PORT" "3000"

# Email Configuration
echo "📧 3. Email Configuration"
add_to_vercel "ADMIN_EMAIL" "houstonmobilenotarypros@gmail.com"
add_to_vercel "FROM_EMAIL" "no-reply@houstonmobilenotarypros.com"
add_to_vercel "RESEND_API_KEY" "re_LisJRVK9_LbaKdMi8gZNafPvWD2H2Myca"

# Admin Credentials
echo "🔐 4. Admin Credentials"
add_to_vercel "ADMIN_USERNAME" "HMNP"
add_to_vercel "ADMIN_PASSWORD" "Hmnp128174"

# Critical GoHighLevel Configuration
echo "🎯 5. GoHighLevel Configuration"
add_to_vercel "GHL_REDIRECT_URI" "https://houstonmobilenotarypros.com/api/auth/callback/gohighlevel"
add_to_vercel "GHL_CALL_REQUEST_WORKFLOW_ID" "8fb116ba-1cf8-4241-97b5-d2f424128487"
add_to_vercel "GHL_NEW_CONTACT_WORKFLOW_ID" "b612c5ea-6ee9-4c8c-b891-412d424653f3"
add_to_vercel "GHL_CONTACT_FORM_WORKFLOW_ID" "05b9b32e-d240-4599-96fb-994190174204"
add_to_vercel "GHL_LOCATION_ID" "oUvYNTw2Wvul7JSJplqQ"
add_to_vercel "GHL_CLIENT_ID" "67e38186c1722c498c0eeca2-m8q5mmfz"
add_to_vercel "GHL_CLIENT_SECRET" "bb2f7408-44fb-4a3b-8ca7-c92607be71b7"
add_to_vercel "GHL_API_KEY" "pit-f7f2fad9-fe5a-4c19-86ff-cb3a4177784a"
add_to_vercel "GHL_API_VERSION" "2021-07-28"
add_to_vercel "GHL_API_BASE_URL" "https://services.leadconnectorhq.com"

# GHL Custom Field IDs for Ad Tracking (Missing from Vercel)
echo "📊 6. GHL Ad Tracking Custom Fields"
add_to_vercel "GHL_CF_ID_AD_CAMPAIGN_NAME" "jn0vsVm593wo71owigkT"
add_to_vercel "GHL_CF_ID_AD_CAMPAIGN_ID" "GPoCLSSPDFDlaRL6NHFT"
add_to_vercel "GHL_CF_ID_AD_GROUP_ID" "mMXX4suZWefp1nVqMpye"
add_to_vercel "GHL_CF_ID_AD_ID" "4HMJaMAEKdkVYyYfFebC"
add_to_vercel "GHL_CF_ID_LANDING_PAGE_URL" "ZUs3WkVfeHJi1wYxAwJa"

# Calendar IDs
echo "📅 7. GHL Calendar IDs"
add_to_vercel "GHL_REVERSE_MORTGAGE_CALENDAR_ID" "LuOsaPkbmxHBwFnftlop"
add_to_vercel "GHL_BOOKING_CALENDAR_ID" "h4X7cZ0mZ3c52XSzvpjU"
add_to_vercel "GHL_CALLS_CALENDAR_ID" "UVOw7yFH5il84VRri9Fw"
add_to_vercel "GHL_SPECIALTY_CALENDAR_ID" "Jel3PqtGOkVlxmYikTA2"
add_to_vercel "GHL_LOAN_CALENDAR_ID" "EJ5ED9UXPHCjBePUTJ0W"
add_to_vercel "GHL_PRIORITY_CALENDAR_ID" "xtHXReq1dfd0wGA7dLc0"
add_to_vercel "GHL_ESSENTIAL_CALENDAR_ID" "r9koQ0kxmuMuWryZkjdo"

# Site Configuration (Production URLs)
echo "🌐 8. Site Configuration"
add_to_vercel "NEXT_PUBLIC_BASE_URL" "https://houstonmobilenotarypros.com"

# NextAuth Configuration (Production Values)
echo "🔑 9. NextAuth Configuration"
add_to_vercel "NEXTAUTH_SECRET" "BoE/DaOyE7XJk2np0rDNmk7qXJq0ssgbsG4qMmCZ1Ic="
add_to_vercel "NEXTAUTH_URL_INTERNAL" "https://houstonmobilenotarypros.com"

# Google Analytics
echo "📈 10. Google Analytics"
add_to_vercel "NEXT_PUBLIC_GA_ID" "G-EXWGCN0D53"

# Revalidation Tokens
echo "🔄 11. Revalidation Tokens"
add_to_vercel "NEXT_PUBLIC_REVALIDATE_TOKEN" "8f2a1e94c7b3d5609e7f2a1c3b5d8e7f9a2c4b6d8e0f2a4c6b8d0e2f4a6c8b0"
add_to_vercel "REVALIDATE_TOKEN" "8f2a1e94c7b3d5609e7f2a1c3b5d8e7f9a2c4b6d8e0f2a4c6b8d0e2f4a6c8b0"

# Google Maps
echo "🗺️  12. Google Maps"
add_to_vercel "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "AIzaSyBvMhEDQAejT3zt1VHZ8oF-KbufDf0AJkw"
add_to_vercel "GOOGLE_MAPS_API_KEY" "AIzaSyA5M_i6YGqx8-B5cZ1GFjV_HVUX5CbVZTc"

# Sanity CMS
echo "📝 13. Sanity CMS"
add_to_vercel "NEXT_PUBLIC_SANITY_PROJECT_ID" "8t38ph2l"
add_to_vercel "NEXT_PUBLIC_SANITY_DATASET" "hmnp-blog"

# AWS S3 Configuration
echo "☁️  14. AWS S3 Configuration"
add_to_vercel "AWS_ACCESS_KEY_ID" "AKIAYWBJYUTW5O6XNZ23"
add_to_vercel "AWS_SECRET_ACCESS_KEY" "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"
add_to_vercel "AWS_REGION" "us-east-1"
add_to_vercel "S3_BUCKET_NAME" "houston-notary-docs"

# Stripe Configuration
echo "💳 15. Stripe Configuration"
add_to_vercel "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_test_51RRbaxPhMv5o5kTlYgpkRCLHpfuNX9EEjA9wGhcQwuSggNoB4utcBEGPXRVchEPRVVxfqdLp2CkAKhAX8Va3ntZ300NgjDT3c7"
add_to_vercel "STRIPE_SECRET_KEY" "sk_test_51RRbaxPhMv5o5kTlPtwhLoQ93U5uqaap49ljbti7SX6D6bB96A7nTdqCn8IM9G38P6ZQwRM8FWdFIGFcQZFxsbUD00Wnb4p97H"
add_to_vercel "STRIPE_WEBHOOK_SECRET" "whsec_8e3f40dd8021cf60564f81902ca98851277c6dafcf303d275c78459470ba94fd"

# API Security Keys
echo "🔐 16. API Security"
add_to_vercel "CRON_SECRET" "dSnDygbN3YXCEphCFymKyd0TMfuhjXzu"

# Email Configuration for Notifications
echo "📨 17. SMTP Configuration"
add_to_vercel "SMTP_HOST" "smtp.gmail.com"
add_to_vercel "SMTP_PORT" "587"
add_to_vercel "SMTP_USER" "your_email@gmail.com"
add_to_vercel "SMTP_PASS" "your_app_password"

# Rate Limiting
echo "⏱️  18. Rate Limiting"
add_to_vercel "RATE_LIMIT_WINDOW_MS" "900000"
add_to_vercel "RATE_LIMIT_MAX_REQUESTS" "100"

# Logging
echo "📋 19. Logging Configuration"
add_to_vercel "LOG_LEVEL" "info"
add_to_vercel "LOG_FILE_PATH" "./logs/api.log"

echo ""
echo "✅ SYNC COMPLETE!"
echo "=================="
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Verify all variables were added successfully:"
echo "   vercel env ls"
echo ""
echo "2. Update the production URL values (if needed):"
echo "   NEXTAUTH_URL: Should be https://houstonmobilenotarypros.com (already set correctly)"
echo "   WEBHOOK_URL: Should be https://houstonmobilenotarypros.com (already set correctly)"
echo ""
echo "3. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "⚠️  MANUAL UPDATES NEEDED:"
echo "- Update SMTP_USER and SMTP_PASS with actual Gmail credentials"
echo "- Consider switching to production Stripe keys when ready"
echo "- Review NODE_ENV is set to 'production'"
echo ""
echo "🔍 To verify environment alignment, run the comparison again:"
echo "   node compare-env-variables.js" 