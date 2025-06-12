#!/bin/bash

echo "🚀 Syncing Environment Variables to Vercel..."

# Critical GHL Workflow IDs
echo "Adding GHL Workflow IDs..."
vercel env add GHL_BOOKING_CONFIRMATION_WORKFLOW_ID "40e0dde5-7b6b-4a5e-9e11-8747e21d15d4" production --yes
vercel env add GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID "8216c46e-bbec-45f5-aa21-c4422bea119d" production --yes
vercel env add GHL_24HR_REMINDER_WORKFLOW_ID "52fa10e9-301e-44af-8ba7-94f9679d6ffb" production --yes
vercel env add GHL_POST_SERVICE_WORKFLOW_ID "f5a9a454-91a4-497e-b918-ed5634b4c85e" production --yes
vercel env add GHL_NO_SHOW_RECOVERY_WORKFLOW_ID "64bd5585-04dc-4e9f-98b3-8480a2d34463" production --yes
vercel env add GHL_EMERGENCY_SERVICE_WORKFLOW_ID "cfd22e83-b636-4c51-937b-2849fb69da0e" production --yes

# API Configuration
echo "Adding API Configuration..."
vercel env add INTERNAL_API_KEY "mav+PpkGCyAADIyUlTUBGIk194KCa3U4" production --yes
vercel env add WEBHOOK_URL "https://houstonmobilenotarypros.com" production --yes
vercel env add PAYMENT_EXPIRATION_HOURS "72" production --yes

# Business Configuration
echo "Adding Business Configuration..."
vercel env add BUSINESS_NAME "Houston Mobile Notary Pros" production --yes
vercel env add BUSINESS_PHONE "832-617-4285" production --yes
vercel env add BUSINESS_EMAIL "info@houstonmobilenotarypros.com" production --yes
vercel env add SERVICE_AREA_RADIUS_MILES "25" production --yes

# GHL Custom Field IDs for Ad Tracking
echo "Adding GHL Custom Field IDs..."
vercel env add GHL_CF_ID_AD_PLATFORM "t2gMTw7jLDDGsgprOmxe" production --yes
vercel env add GHL_CF_ID_UTM_SOURCE "rPu81rmsXiopvg4Ona4U" production --yes
vercel env add GHL_CF_ID_UTM_MEDIUM "anGabiVXZP7XPO9cHMy4" production --yes
vercel env add GHL_CF_ID_UTM_CAMPAIGN "ogmvR5klM2INtr0qn97J" production --yes
vercel env add GHL_CF_ID_UTM_TERM "W5h6V3rxGh86uoFsmvHV" production --yes
vercel env add GHL_CF_ID_UTM_CONTENT "mftgkC0WEtmySeHzkgut" production --yes

# Additional GHL Custom Fields
vercel env add GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_TYPE "77wL4XfPZJ7jXQzK3pXm" production --yes
vercel env add GHL_CUSTOM_FIELD_ID_BOOKING_APPOINTMENT_DATETIME "0gM7pYjK1nO9wJdEaZbD" production --yes
vercel env add GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_ADDRESS "RysyO6fl9IyBA8ncuXP6" production --yes
vercel env add GHL_CUSTOM_FIELD_ID_BOOKING_SPECIAL_INSTRUCTIONS "S6JxuZNqhaDpfkiwukXz" production --yes
vercel env add GHL_CUSTOM_FIELD_ID_CONSENT_TERMS_CONDITIONS "z7Ulsc4uJJNJJx98pUEE" production --yes
vercel env add GHL_CUSTOM_FIELD_ID_LEAD_SOURCE_DETAIL "Qu2wK8YhpgMj2PZTVEAu" production --yes

# SMS Configuration
echo "Adding SMS Configuration..."
vercel env add GHL_SMS_ENDPOINT "https://services.leadconnectorhq.com/conversations/messages" production --yes
vercel env add GHL_SMS_CONSENT_TAG "Consent:SMS_Opt_In" production --yes

# Site URLs (Production versions)
echo "Adding Site Configuration..."
vercel env add NEXT_PUBLIC_SITE_URL "https://houstonmobilenotarypros.com" production --yes
vercel env add NEXT_PUBLIC_APP_URL "https://houstonmobilenotarypros.com" production --yes
vercel env add NEXTAUTH_URL "https://houstonmobilenotarypros.com" production --yes

echo "✅ Environment variables sync completed!"
echo "🔄 Run 'vercel env ls' to verify all variables are set"
echo "🚀 Deploy with 'vercel --prod' to apply changes" 