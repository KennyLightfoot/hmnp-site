#!/bin/bash

# Clean Environment Variables for Vercel
# This script removes newlines and uploads clean variables to Vercel

echo "🧹 Cleaning and uploading environment variables to Vercel..."

# Critical variables with cleaned values (remove \n)
declare -A CLEAN_VARS=(
    # Database
    ["DATABASE_URL"]="postgresql://postgres.unnyhvuhobnmxnpffore:8Q06UmhlcQyAtzch@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
    ["DATABASE_URL_UNPOOLED"]="postgresql://postgres.unnyhvuhobnmxnpffore:8Q06UmhlcQyAtzch@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
    
    # NextAuth
    ["NEXTAUTH_SECRET"]="BoE/DaOyE7XJk2np0rDNmk7qXJq0ssgbsG4qMmCZ1Ic="
    ["NEXTAUTH_URL"]="https://houstonmobilenotarypros.com"
    ["NEXTAUTH_URL_INTERNAL"]="https://houstonmobilenotarypros.com"
    
    # Stripe (CRITICAL - These are corrupted)
    ["STRIPE_SECRET_KEY"]="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"
    ["STRIPE_WEBHOOK_SECRET"]="whsec_D1PVCJxGGtjGUmGBCsUtfJGy31n8zRrJ"
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]="pk_live_51QMx2aAx8ko8hXd8NSAYNXb4bMcPjIFZF8Gr7GJbrzn9XFxixpxBe07zJsIPgggy7CcpPXfLQY2WIpacZSMoEzfa00k7NSj6r7"
    
    # Google Maps (CRITICAL - These are corrupted)
    ["GOOGLE_MAPS_API_KEY"]="AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw"
    ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"]="AIzaSyBEGc_wacW9IR8_XXY-P0sGn1EOfeUrGCw"
    
    # GHL Core Settings
    ["GHL_API_KEY"]="pit-f7f2fad9-fe5a-4c19-86ff-cb3a4177784a"
    ["GHL_LOCATION_ID"]="oUvYNTw2Wvul7JSJplqQ"
    ["GHL_WEBHOOK_SECRET"]="f1e2d3c4b5a6987654321098765432109876543210987654321098765432109876543210"
    ["GHL_API_BASE_URL"]="https://services.leadconnectorhq.com"
    ["GHL_BASE_URL"]="https://services.leadconnectorhq.com"
    ["GHL_API_VERSION"]="2021-07-28"
    ["GHL_CLIENT_ID"]="67e38186c1722c498c0eeca2-m8q5mmfz"
    ["GHL_CLIENT_SECRET"]="bb2f7408-44fb-4a3b-8ca7-c92607be71b7"
    
    # GHL Workflow IDs (Critical for booking system)
    ["GHL_BOOKING_CONFIRMATION_WORKFLOW_ID"]="40e0dde5-7b6b-4a5e-9e11-8747e21d15d4"
    ["GHL_BOOKING_CONFIRMED_WORKFLOW_ID"]="40e0dde5-7b6b-4a5e-9e11-8747e21d15d4"
    ["GHL_NEW_BOOKING_WORKFLOW_ID"]="40e0dde5-7b6b-4a5e-9e11-8747e21d15d4"
    ["GHL_PAYMENT_PENDING_WORKFLOW_ID"]="8216c46e-bbec-45f5-aa21-c4422bea119d"
    ["GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID"]="8216c46e-bbec-45f5-aa21-c4422bea119d"
    ["GHL_PAYMENT_COMPLETED_WORKFLOW_ID"]="92af220e-293d-4c3a-9c69-404ce17340a0"
    ["GHL_PAYMENT_FAILED_WORKFLOW_ID"]="8216c46e-bbec-45f5-aa21-c4422bea119d"
    ["GHL_24HR_REMINDER_WORKFLOW_ID"]="52fa10e9-301e-44af-8ba7-94f9679d6ffb"
    ["GHL_POST_SERVICE_WORKFLOW_ID"]="f5a9a454-91a4-497e-b918-ed5634b4c85e"
    ["GHL_NO_SHOW_RECOVERY_WORKFLOW_ID"]="64bd5585-04dc-4e9f-98b3-8480a2d34463"
    ["GHL_EMERGENCY_SERVICE_WORKFLOW_ID"]="cfd22e83-b636-4c51-937b-2849fb69da0e"
    ["GHL_NEW_CONTACT_WORKFLOW_ID"]="b612c5ea-6ee9-4c8c-b891-412d424653f3"
    ["GHL_CONTACT_FORM_WORKFLOW_ID"]="05b9b32e-d240-4599-96fb-994190174204"
    ["GHL_CALL_REQUEST_WORKFLOW_ID"]="8fb116ba-1cf8-4241-97b5-d2f424128487"
    ["GHL_BOOKING_CANCELLED_WORKFLOW_ID"]="64bd5585-04dc-4e9f-98b3-8480a2d34463"
    ["GHL_BOOKING_REMINDER_WORKFLOW_ID"]="52fa10e9-301e-44af-8ba7-94f9679d6ffb"
    ["GHL_STRIPE_WEBHOOK_WORKFLOW_ID"]="92af220e-293d-4c3a-9c69-404ce17340a0"
    
    # GHL Calendar IDs
    ["GHL_BOOKING_CALENDAR_ID"]="h4X7cZ0mZ3c52XSzvpjU"
    ["GHL_CALLS_CALENDAR_ID"]="UVOw7yFH5il84VRri9Fw"
    ["GHL_ESSENTIAL_CALENDAR_ID"]="r9koQ0kxmuMuWryZkjdo"
    ["GHL_LOAN_CALENDAR_ID"]="EJ5ED9UXPHCjBePUTJ0W"
    ["GHL_PRIORITY_CALENDAR_ID"]="xtHXReq1dfd0wGA7dLc0"
    ["GHL_REVERSE_MORTGAGE_CALENDAR_ID"]="LuOsaPkbmxHBwFnftlop"
    ["GHL_SPECIALTY_CALENDAR_ID"]="Jel3PqtGOkVlxmYikTA2"
    
    # GHL Custom Field IDs - Ad Tracking
    ["GHL_CF_ID_AD_PLATFORM"]="t2gMTw7jLDDGsgprOmxe"
    ["GHL_CF_ID_UTM_SOURCE"]="rPu81rmsXiopvg4Ona4U"
    ["GHL_CF_ID_UTM_MEDIUM"]="anGabiVXZP7XPO9cHMy4"
    ["GHL_CF_ID_UTM_CAMPAIGN"]="ogmvR5klM2INtr0qn97J"
    ["GHL_CF_ID_UTM_TERM"]="W5h6V3rxGh86uoFsmvHV"
    ["GHL_CF_ID_UTM_CONTENT"]="mftgkC0WEtmySeHzkgut"
    ["GHL_CF_ID_AD_CAMPAIGN_ID"]="GPoCLSSPDFDlaRL6NHFT"
    ["GHL_CF_ID_AD_CAMPAIGN_NAME"]="jn0vsVm593wo71owigkT"
    ["GHL_CF_ID_AD_GROUP_ID"]="mMXX4suZWefp1nVqMpye"
    ["GHL_CF_ID_AD_ID"]="4HMJaMAEKdkVYyYfFebC"
    ["GHL_CF_ID_LANDING_PAGE_URL"]="ZUs3WkVfeHJi1wYxAwJa"
    ["GHL_CF_ID_PREFERRED_CALL_TIME"]="f7lyOeQ09sgf2HFZv7X4"
    ["GHL_CF_ID_CALL_REQUEST_REASON"]="S6JxuZNqhaDpfkiwukXz"
    
    # GHL Custom Field IDs - Booking System
    ["GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_TYPE"]="77wL4XfPZJ7jXQzK3pXm"
    ["GHL_CUSTOM_FIELD_ID_BOOKING_APPOINTMENT_DATETIME"]="0gM7pYjK1nO9wJdEaZbD"
    ["GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_ADDRESS"]="RysyO6fl9IyBA8ncuXP6"
    ["GHL_CUSTOM_FIELD_ID_BOOKING_SPECIAL_INSTRUCTIONS"]="S6JxuZNqhaDpfkiwukXz"
    ["GHL_CUSTOM_FIELD_ID_CONSENT_TERMS_CONDITIONS"]="z7Ulsc4uJJNJJx98pUEE"
    ["GHL_CUSTOM_FIELD_ID_LEAD_SOURCE_DETAIL"]="Qu2wK8YhpgMj2PZTVEAu"
    ["GHL_CUSTOM_FIELD_ID_PROMO_CODE_USED"]="Og0C63P8DxWFsiTiEJUn"
    ["GHL_CUSTOM_FIELD_ID_REFERRED_BY_NAME_EMAIL"]="F94JeEK7i9adgBgtxLXX"
    ["GHL_CUSTOM_FIELD_ID_NUMBER_OF_SIGNERS"]="tkhRciHhsuiBtr1bh7ZV"
    ["GHL_CUSTOM_FIELD_ID_BOOKING_DISCOUNT_APPLIED"]="hqsRxYmGVd9vRHD8olQB"
    ["GHL_CUSTOM_FIELD_ID_SMS_NOTIFICATIONS_CONSENT"]="A3I0jWxlCLekVCLG73NU"
    ["GHL_CUSTOM_FIELD_ID_EMAIL_UPDATES_CONSENT"]="TNvRVVkGs4nA8bngYEQ1"
    ["GHL_CUSTOM_FIELD_ID_ADDITIONAL_CHARGES"]="748yFeiLgtKFtYkuquqU"
    ["GHL_CUSTOM_FIELD_ID_CLIENT_TYPE"]="JYneDGrupCmPnd47G0e7"
    ["GHL_CUSTOM_FIELD_ID_DOCUMENT_COUNT"]="EpZJr9bhTIUtZb49iRnJ"
    ["GHL_CUSTOM_FIELD_ID_TRAVEL_MILEAGE"]="SPA1ijelF8cXwvCMi691"
    ["GHL_CUSTOM_FIELD_ID_TRAVEL_FEE"]="o4FnC2htqrczpB7wig3F"
    ["GHL_CUSTOM_FIELD_ID_URGENCY_LEVEL"]="3gdXAb3z3zruDtp873Jw"
    ["GHL_CUSTOM_FIELD_ID_WITNESS_COUNT"]="kDsmgpa1qBxCiayEdMhO"
    ["GHL_CUSTOM_FIELD_ID_DOCUMENT_URL"]="AZdTgjZu3jzhisVcgyPO"
    ["GHL_CUSTOM_FIELD_ID_BOOKING_LOCATION_TYPE"]="petV7NMPpsoR76RXoRa0"
    
    # GHL SMS Configuration
    ["GHL_SMS_ENDPOINT"]="https://services.leadconnectorhq.com/conversations/messages"
    ["GHL_SMS_CONSENT_TAG"]="Consent:SMS_Opt_In"
    ["GHL_REDIRECT_URI"]="https://houstonmobilenotarypros.com/api/auth/callback/gohighlevel"
    ["GHL_PRIVATE_INTEGRATION_TOKEN"]="pit-f7f2fad9-fe5a-4c19-86ff-cb3a4177784a"
    
    # Security
    ["INTERNAL_API_KEY"]="mav+PpkGCyAADIyUlTUBGIk194KCa3U4"
    ["JWT_SECRET"]="6e1dffdc65d5473a4899dd5c98a590be7da94e88cf28f8aac3289e196d5912dd"
    ["JWT_REFRESH_SECRET"]="dce5cf94845bc68fff201b3bd38257d98d61bb63ccc9842196f7f773ff8227dd"
    ["ENCRYPTION_KEY"]="a1b2c3d4e5f6789012345678901234ab"
    ["CRON_SECRET"]="dSnDygbN3YXCEphCFymKyd0TMfuhjXzu"
    ["ADMIN_API_KEY"]="7k9m2n5p8q1s4t7u0v3w6x9y2z5a8b1c4d7e0f3g6h9i2j5k8l1m4n7o0p3q6r9s2t5u8v1w4x7y0z3"
    
    # Business Info
    ["BUSINESS_NAME"]="Houston Mobile Notary Pros"
    ["BUSINESS_PHONE"]="832-617-4285"
    ["BUSINESS_EMAIL"]="info@houstonmobilenotarypros.com"
    ["SERVICE_AREA_RADIUS_MILES"]="25"
    ["PAYMENT_EXPIRATION_HOURS"]="72"
    
    # Site URLs
    ["NEXT_PUBLIC_SITE_URL"]="https://houstonmobilenotarypros.com"
    ["NEXT_PUBLIC_APP_URL"]="https://houstonmobilenotarypros.com"
    ["NEXT_PUBLIC_BASE_URL"]="https://houstonmobilenotarypros.com"
    ["WEBHOOK_URL"]="https://houstonmobilenotarypros.com"
    
    # Feature Flags
    ["ENABLE_GUEST_BOOKINGS"]="true"
    ["ENABLE_PAYMENT_PROCESSING"]="true"
    ["ENABLE_GHL_INTEGRATION"]="true"
    ["ENABLE_SMS_NOTIFICATIONS"]="true"
    ["AD_TRACKING_ENABLED"]="true"
    ["CONVERSION_TRACKING_ENABLED"]="true"
    ["RETARGETING_ENABLED"]="true"
    ["UTM_TRACKING_ENABLED"]="true"
    ["DEVELOPMENT_MODE"]="false"
    ["DEV_MODE"]="false"
    
    # Redis
    ["REDIS_URL"]="redis://default:pnpaQyi2JdOb0GH0SVRGjjXwy0pmapV3@redis-18979.c80.us-east-1-2.ec2.redns.redis-cloud.com:18979"
    ["REDIS_HOST"]="redis-18979.c80.us-east-1-2.ec2.redns.redis-cloud.com"
    ["REDIS_PORT"]="18979"
    ["REDIS_PASSWORD"]="pnpaQyi2JdOb0GH0SVRGjjXwy0pmapV3"
    ["UPSTASH_REDIS_REST_TOKEN"]="pnpaQyi2JdOb0GH0SVRGjjXwy0pmapV3"
    ["UPSTASH_REDIS_REST_URL"]="https://redis-18979.c80.us-east-1-2.ec2.redns.redis-cloud.com"
    
    # Email
    ["RESEND_API_KEY"]="re_LisJRVK9_LbaKdMi8gZNafPvWD2H2Myca"
    ["CONTACT_FORM_RECEIVER_EMAIL"]="houstonmobilenotarypros@gmail.com"
    ["CONTACT_FORM_SENDER_EMAIL"]="no-reply@houstonmobilenotarypros.com"
    ["FROM_EMAIL"]="no-reply@houstonmobilenotarypros.com"
    ["ADMIN_EMAIL"]="houstonmobilenotarypros@gmail.com"
    
    # AWS
    ["AWS_ACCESS_KEY_ID"]="AKIAYWBJYUTW5O6XNZ23"
    ["AWS_SECRET_ACCESS_KEY"]="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"
    ["AWS_REGION"]="us-east-1"
    ["AWS_S3_BUCKET"]="houston-notary-docs"
    ["S3_BUCKET"]="houston-notary-docs"
    ["S3_BUCKET_NAME"]="houston-notary-docs"
    
    # Google Services
    ["GEMINI_API_KEY"]="AIzaSyD9aNz2Y5rrv52YHNtJMjo2ki_mbwffZHU"
    ["GOOGLE_AI_API_KEY"]="AIzaSyD9aNz2Y5rrv52YHNtJMjo2ki_mbwffZHU"
    ["GOOGLE_CALENDAR_ID"]="95d2603ca4bd2614772c7485d63d996455482481629895495d87894dd8147610@group.calendar.google.com"
    ["GOOGLE_SERVICE_ACCOUNT_KEY"]="./google-calendar-key.json"
    
    # Proof RON
    ["PROOF_API_KEY"]="wVc8ni3bWaEvZNQBBM215h1v"
    ["PROOF_API_BASE_URL"]="https://api.proof.com"
    ["PROOF_BASE_URL"]="https://api.proof.com"
    ["PROOF_ORGANIZATION_ID"]="ord7g866b"
    ["PROOF_ENVIRONMENT"]="production"
    ["PROOF_FORCE_REDIRECT"]="true"
    ["PROOF_REDIRECT_URL"]="https://houstonmobilenotarypros.com/ron/thank-you"
    ["PROOF_REDIRECT_MESSAGE"]="Your notarization is complete! Thank you for choosing Houston Mobile Notary Pros."
    
    # Monitoring & Analytics
    ["SENTRY_DSN"]="https://dcf43018a2b7757b6b3677520acc854f@o4508626800803840.ingest.us.sentry.io/4508626801000448"
    ["NEXT_PUBLIC_SENTRY_DSN"]="https://dcf43018a2b7757b6b3677520acc854f@o4508626800803840.ingest.us.sentry.io/4508626801000448"
    ["NEXT_PUBLIC_GA_ID"]="G-EXWGCN0D53"
    ["LOG_LEVEL"]="info"
    ["BETTER_STACK_SOURCE_TOKEN"]="FfpjGHdL3nPKRgW2xN8vYm9c"
    
    # Supabase
    ["NEXT_PUBLIC_SUPABASE_URL"]="https://unnyhvuhobnmxnpffore.supabase.co"
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubnlodnVob2JubXhucGZmb3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjcxNzIsImV4cCI6MjA2NjMwMzE3Mn0.ZeZQ2nE322_bGjHq_lqtl0pEkIDfAA5usdXU1nx9k0Q"
    ["SUPABASE_SERVICE_ROLE_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubnlodnVob2JubXhucGZmb3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcyNzE3MiwiZXhwIjoyMDY2MzAzMTcyfQ.9zbdk4ZqmvSzRaO_a3WMpxcrHTdwpkxJ2JiYJRqO4o0"
    ["SUPABASE_JWT_SECRET"]="83QV4zkNr2Vw0nmbj6aBDyXQM38Q6nl9Rzbo8/Zy7h2VUAD72LV0aRiW4uSiQRmUt8Fzf5zCOZJFVih9V0tLuQ=="
    
    # LaunchDarkly
    ["LAUNCHDARKLY_SERVER_SDK_KEY"]="sdk-633cb12d-2e9c-4a93-b399-e3657a1bff19"
    ["NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SDK_KEY"]="685b3910af9e34098d580deb"
    
    # Sanity CMS
    ["NEXT_PUBLIC_SANITY_PROJECT_ID"]="8t38ph2l"
    ["NEXT_PUBLIC_SANITY_DATASET"]="hmnp-blog"
    ["NEXT_PUBLIC_SANITY_API_VERSION"]="2025-04-21"
    
    # Rate Limiting
    ["RATE_LIMIT_WINDOW_MS"]="900000"
    ["RATE_LIMIT_MAX_REQUESTS"]="100"
    ["ALLOWED_ORIGINS"]="https://houstonmobilenotarypros.com,https://houstonmobilenotarypros.vercel.app"
    
    # Upstash QStash
    ["QSTASH_TOKEN"]="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1qazVNVEk1TmprNU9EYzVOVE0wTURVMU1qZzVPVE0xTVRVM01qVXhNakEzTnpBM05EazNPUT09In0.eyJpc3MiOiJodHRwczovL3FzdGFzaC51cHN0YXNoLmlvIiwic3ViIjoiYjhlOGE2NzUtYjVkOC00OGY3LWJjYjYtOTI1M2M3Mzk5NjJhIiwiYXVkIjpbImh0dHBzOi8vcXN0YXNoLnVwc3Rhc2guaW8iXSwiaWF0IjoxNzM1NDI5MjM5LCJleHAiOjIwNTA3ODkyMzl9"
    ["QSTASH_URL"]="https://qstash.upstash.io"
    
    # Playwright Testing
    ["PLAYWRIGHT_BASE_URL"]="https://houstonmobilenotarypros.com"
    ["PLAYWRIGHT_LOGIN_URL"]="/login"
    ["PLAYWRIGHT_EMAIL_SELECTOR"]="#email"
    ["PLAYWRIGHT_PASSWORD_SELECTOR"]="#password"
    ["PLAYWRIGHT_SUBMIT_SELECTOR"]="button[type=\"submit\"]"
    ["PLAYWRIGHT_TEST_USERNAME"]="testuser@example.com"
    ["PLAYWRIGHT_TEST_PASSWORD"]="password123"
    
    # Revalidation
    ["NEXT_PUBLIC_REVALIDATE_TOKEN"]="8f2a1e94c7b3d5609e7f2a1c3b5d8e7f9a2c4b6d8e0f2a4c6b8d0e2f4a6c8b0"
    ["REVALIDATE_TOKEN"]="8f2a1e94c7b3d5609e7f2a1c3b5d8e7f9a2c4b6d8e0f2a4c6b8d0e2f4a6c8b0"
    
    # Legacy SMTP (if needed)
    ["SMTP_HOST"]="smtp.gmail.com"
    ["SMTP_PORT"]="587"
    ["SMTP_USER"]="houstonmobilenotarypros@gmail.com"
    ["SMTP_PASS"]="your_gmail_app_password_if_needed"
    
    # Miscellaneous
    ["API_PORT"]="3001"
    ["PORT"]="3000"
    ["STORE_WEBHOOK_DATA"]="false"
    ["SKIP_ENV_VALIDATION"]="false"
    ["GMB_REVIEWS_ENABLED"]="true"
    ["GMB_REVIEW_NOTIFICATION_EMAIL"]="houstonmobilenotarypros@gmail.com"
    ["FACEBOOK_REVIEWS_ENABLED"]="true"
    ["FACEBOOK_REVIEW_NOTIFICATION_EMAIL"]="houstonmobilenotarypros@gmail.com"
)

# Function to clean and upload environment variable
upload_env_var() {
    local var_name=$1
    local var_value=$2
    
    echo "📤 Uploading $var_name..."
    
    # Remove existing variable first
    vercel env rm "$var_name" production --yes 2>/dev/null || true
    
    # Add clean variable
    echo "$var_value" | vercel env add "$var_name" production --stdin
    
    if [ $? -eq 0 ]; then
        echo "✅ $var_name uploaded successfully"
    else
        echo "❌ Failed to upload $var_name"
    fi
}

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login check
echo "🔐 Checking Vercel login..."
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Please login to Vercel first:"
    echo "vercel login"
    exit 1
fi

# Upload all clean variables
echo "🚀 Starting environment variable upload..."
for var_name in "${!CLEAN_VARS[@]}"; do
    upload_env_var "$var_name" "${CLEAN_VARS[$var_name]}"
done

echo ""
echo "🎉 Environment variables cleaning complete!"
echo "🔄 Your next deployment should work without corruption issues."
echo ""
echo "⚠️  Still Missing (Optional Features):"
echo "   - Google My Business API credentials"
echo "   - Social media API tokens (if needed)"
echo "   - Additional monitoring tools"
echo ""
echo "🚀 Ready to deploy! Run: vercel --prod" 