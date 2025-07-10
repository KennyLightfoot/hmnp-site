#!/bin/bash
# Quick RON Integration Test
# Houston Mobile Notary Pros

echo "🎯 Testing RON Integration..."
echo "=============================="

# 1. Test Proof.com API connection
echo "1. Testing Proof.com API Connection..."
curl -s -X GET "https://api.proof.com/v1/transactions?limit=1" \
  -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
  -H "Content-Type: application/json" | jq .

echo -e "\n2. Testing Local API Connection..."
curl -s -X GET "http://localhost:3000/api/debug/proof-connection" | jq .

echo -e "\n3. To test RON booking creation:"
echo "   - Start dev server: pnpm dev"
echo "   - Visit: http://localhost:3000/booking"
echo "   - Select RON service"
echo "   - Complete booking with test payment"
echo "   - Check terminal for Proof transaction creation"

echo -e "\n4. Expected Result:"
echo "   - ✅ Payment processed successfully"
echo "   - ✅ Proof transaction created (no more 'Bad Request' errors)"
echo "   - ✅ Customer receives access link from Proof.com"
echo "   - ✅ GHL contact/appointment created"

echo -e "\n🎉 RON Integration should now work correctly!" 