#!/bin/bash

echo "🔗 Setting up Proof.com Webhook..."

curl -X POST "https://api.proof.com/v2/webhooks" \
  -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://houstonmobilenotarypros.com/api/webhooks/proof",
    "subscriptions": [
      "transaction.created",
      "transaction.status.updated", 
      "transaction.completed",
      "meeting.started",
      "meeting.ended"
    ]
  }'

echo ""
echo "✅ Webhook setup complete!"
echo "📋 Copy the 'secret' from the response above"
echo "🔧 Add it to your .env.local as PROOF_WEBHOOK_SECRET=your_secret_here" 