#!/bin/bash

# Detect Proof.com Environment
# Tests API credentials against both production and sandbox

echo "🔍 Detecting Proof.com Environment..."
echo "API Key: wVc8ni3bWaEvZNQBBM215h1v"
echo "Org ID: ord7g866b"
echo ""

# Test Production
echo "📡 Testing Production API..."
PROD_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
  -H "Content-Type: application/json" \
  "https://api.proof.com/v2/organizations/ord7g866b" 2>/dev/null)

PROD_HTTP_CODE=$(echo $PROD_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
PROD_BODY=$(echo $PROD_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

echo "   Status Code: $PROD_HTTP_CODE"

if [ "$PROD_HTTP_CODE" -eq 200 ]; then
    echo "   ✅ PRODUCTION ENVIRONMENT DETECTED!"
    echo "   Organization found in production"
    echo ""
    echo "🎯 RECOMMENDED SETTINGS:"
    echo "   PROOF_API_BASE_URL=https://api.proof.com"
    echo "   PROOF_ENVIRONMENT=production"
    echo ""
    echo "🔗 Dashboard: https://app.proof.com"
    echo "📚 Docs: https://dev.proof.com"
    exit 0
elif [ "$PROD_HTTP_CODE" -eq 401 ]; then
    echo "   ❌ Authentication failed on production"
elif [ "$PROD_HTTP_CODE" -eq 404 ]; then
    echo "   ❌ Organization not found in production"
else
    echo "   ⚠️  Unexpected response: $PROD_HTTP_CODE"
fi

echo ""

# Test Sandbox
echo "🧪 Testing Sandbox API..."
SANDBOX_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
  -H "Content-Type: application/json" \
  "https://api.fairfax.proof.com/v1/organizations/ord7g866b" 2>/dev/null)

SANDBOX_HTTP_CODE=$(echo $SANDBOX_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
SANDBOX_BODY=$(echo $SANDBOX_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

echo "   Status Code: $SANDBOX_HTTP_CODE"

if [ "$SANDBOX_HTTP_CODE" -eq 200 ]; then
    echo "   ✅ SANDBOX ENVIRONMENT DETECTED!"
    echo "   Organization found in sandbox"
    echo ""
    echo "🎯 RECOMMENDED SETTINGS:"
    echo "   PROOF_API_BASE_URL=https://api.fairfax.proof.com"
    echo "   PROOF_ENVIRONMENT=sandbox"
    echo ""
    echo "🔗 Dashboard: https://app.fairfax.proof.com"
    echo "📚 Docs: https://dev.proof.com/v2-Fairfax/docs"
elif [ "$SANDBOX_HTTP_CODE" -eq 401 ]; then
    echo "   ❌ Authentication failed on sandbox"
elif [ "$SANDBOX_HTTP_CODE" -eq 404 ]; then
    echo "   ❌ Organization not found in sandbox"
else
    echo "   ⚠️  Unexpected response: $SANDBOX_HTTP_CODE"
fi

echo ""
echo "🚨 NEXT STEPS:"
echo "1. If neither worked, contact Proof support: support@proof.com"
echo "2. If one worked, update your .env.local with the correct settings"
echo "3. Find webhooks in your dashboard to get the webhook secret"
echo "4. Update PROOF_WEBHOOK_SECRET in .env.local"
echo ""
echo "📞 Proof Support Info:"
echo "   Organization ID: ord7g866b"
echo "   API Key: wVc8ni3bWaEvZNQBBM215h1v"
echo "   Need help with: Webhook configuration" 