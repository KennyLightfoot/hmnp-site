#!/bin/bash

echo "🎯 Adding Critical Missing Environment Variables to Vercel"
echo "========================================================"

# Function to add environment variable to Vercel (simplified)
add_env() {
    local key=$1
    local value=$2
    echo "Adding $key..."
    vercel env add "$key" <<< "$value"
}

echo "📋 Adding GHL Workflow IDs from automation guide..."

# Critical GHL Workflow IDs for automation (from your setup guide)
add_env "GHL_BOOKING_CONFIRMATION_WORKFLOW_ID" "40e0dde5-7b6b-4a5e-9e11-8747e21d15d4"
add_env "GHL_PAYMENT_FOLLOWUP_WORKFLOW_ID" "8216c46e-bbec-45f5-aa21-c4422bea119d"
add_env "GHL_24HR_REMINDER_WORKFLOW_ID" "52fa10e9-301e-44af-8ba7-94f9679d6ffb"
add_env "GHL_POST_SERVICE_WORKFLOW_ID" "f5a9a454-91a4-497e-b918-ed5634b4c85e"
add_env "GHL_NO_SHOW_RECOVERY_WORKFLOW_ID" "64bd5585-04dc-4e9f-98b3-8480a2d34463"
add_env "GHL_EMERGENCY_SERVICE_WORKFLOW_ID" "cfd22e83-b636-4c51-937b-2849fb69da0e"

echo ""
echo "📊 Adding GHL Custom Field IDs for ad tracking..."

# GHL Custom Field IDs for Ad Tracking (essential for marketing)
add_env "GHL_CF_ID_AD_PLATFORM" "t2gMTw7jLDDGsgprOmxe"
add_env "GHL_CF_ID_UTM_SOURCE" "rPu81rmsXiopvg4Ona4U"
add_env "GHL_CF_ID_UTM_MEDIUM" "anGabiVXZP7XPO9cHMy4"
add_env "GHL_CF_ID_UTM_CAMPAIGN" "ogmvR5klM2INtr0qn97J"
add_env "GHL_CF_ID_UTM_TERM" "W5h6V3rxGh86uoFsmvHV"
add_env "GHL_CF_ID_UTM_CONTENT" "mftgkC0WEtmySeHzkgut"

echo ""
echo "📝 Adding critical GHL form field IDs..."

# Essential form field IDs (already have many, adding key missing ones)
add_env "GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_TYPE" "77wL4XfPZJ7jXQzK3pXm"
add_env "GHL_CUSTOM_FIELD_ID_BOOKING_APPOINTMENT_DATETIME" "0gM7pYjK1nO9wJdEaZbD"
add_env "GHL_CUSTOM_FIELD_ID_BOOKING_SERVICE_ADDRESS" "RysyO6fl9IyBA8ncuXP6"

echo ""
echo "🌐 Adding essential site variables..."

# Key missing site variables
add_env "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "AIzaSyBvMhEDQAejT3zt1VHZ8oF-KbufDf0AJkw"
add_env "WEBHOOK_URL" "https://houstonmobilenotarypros.com"
add_env "INTERNAL_API_KEY" "mav+PpkGCyAADIyUlTUBGIk194KCa3U4"

echo ""
echo "✅ CRITICAL VARIABLES ADDED!"
echo "============================"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Test your automation workflows"
echo "2. Verify ad tracking is working"  
echo "3. Test form submissions"
echo "4. Deploy again: vercel --prod"
echo ""
echo "🔗 Your site: https://v0-hmnp-site-nx667gqnu-kennylightfoots-projects.vercel.app" 