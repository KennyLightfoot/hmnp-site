#!/bin/bash

echo "🔍 Getting webhook details..."
echo ""

# Get all webhooks
echo "📋 All webhooks:"
curl -s -X GET "https://api.proof.com/v2/webhooks" \
  -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
  -H "accept: application/json" | jq '.'

echo ""
echo "🔍 Getting specific webhook (whmdrprpd):"
curl -s -X GET "https://api.proof.com/v2/webhooks/whmdrprpd" \
  -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
  -H "accept: application/json" | jq '.' 