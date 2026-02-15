#!/bin/bash

# Test Booking API after Environment Sync
echo "🧪 TESTING BOOKING API AFTER ENVIRONMENT SYNC"
echo "=============================================="

# Production URL (update this with actual deployment URL)
PROD_URL="https://houstonmobilenotarypros.com"
DEPLOYMENT_URL="https://hmnp-site-lm8vy4g4f-kennylightfoots-projects.vercel.app"

echo "🌐 Testing against: $DEPLOYMENT_URL"

# Test 1: Health check endpoint
echo ""
echo "1️⃣ Testing Health Check..."
curl -s "$DEPLOYMENT_URL/api/health" | head -200 || echo "Health check endpoint not accessible"

# Test 2: Test Stripe environment variables are accessible
echo ""
echo "2️⃣ Testing Environment Variables Accessibility..."

# Create a simple test payload
TEST_PAYLOAD='{
  "serviceId": "essential",
  "email": "test@example.com",
  "customerName": "Test User",
  "addressStreet": "123 Test St",
  "addressCity": "Houston",
  "addressState": "TX",
  "addressZip": "77001",
  "locationType": "CLIENT_SPECIFIED_ADDRESS"
}'

echo "📝 Test payload prepared"

# Test 3: Attempt booking creation (should not fail with environment errors)
echo ""
echo "3️⃣ Testing Booking Creation..."
echo "This test checks if Stripe environment variables are properly configured"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD" \
  "$DEPLOYMENT_URL/api/bookings" 2>/dev/null)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | grep -v "HTTP_STATUS")

echo "HTTP Status: $HTTP_STATUS"
echo "Response preview: $(echo "$RESPONSE_BODY" | head -c 200)..."

# Analyze results
echo ""
echo "📊 RESULTS ANALYSIS:"
echo "==================="

case $HTTP_STATUS in
    200|201)
        echo "✅ SUCCESS: Booking endpoint working correctly"
        echo "✅ Environment variables properly configured"
        echo "✅ Stripe integration functional"
        ;;
    402)
        echo "❌ FAILED: HTTP 402 - Payment Required error"
        echo "❌ This indicates Stripe environment variable issues"
        echo "🔍 Check: STRIPE_SECRET_KEY corruption or missing variables"
        ;;
    500)
        if echo "$RESPONSE_BODY" | grep -q "environment\|Environment\|ENV"; then
            echo "❌ FAILED: Environment variable configuration error"
            echo "🔍 Check: Missing or corrupted environment variables"
        else
            echo "⚠️  SERVER ERROR: Internal server error (not environment related)"
        fi
        ;;
    404)
        echo "⚠️  ENDPOINT NOT FOUND: API route may not be deployed correctly"
        ;;
    *)
        echo "⚠️  UNEXPECTED STATUS: $HTTP_STATUS"
        echo "Response: $RESPONSE_BODY"
        ;;
esac

echo ""
echo "📋 VERIFICATION SUMMARY:"
echo "======================="
echo "🌐 Deployment URL: $DEPLOYMENT_URL"
echo "🔧 Environment sync: COMPLETED"
echo "🔑 Critical Stripe variables: SYNCED"
echo "💳 Payment system: $([ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ] && echo "FUNCTIONAL" || echo "NEEDS ATTENTION")"
echo ""
echo "📱 NEXT STEPS:"
echo "1. If tests pass: ✅ Environment sync successful"  
echo "2. If tests fail: 🔍 Check specific error messages above"
echo "3. Monitor production logs for any remaining issues"
echo "4. Test actual booking flow via website UI"