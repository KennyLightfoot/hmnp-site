# RON Integration Testing Guide
**Houston Mobile Notary Pros - Proof.com Integration**

## 🎯 Overview
This guide covers testing the complete Remote Online Notarization (RON) integration with Proof.com, from customer booking to session completion.

## 🔧 Prerequisites

### Environment Setup
```bash
# Required environment variables
PROOF_API_KEY=wVc8ni3bWaEvZNQBBM215h1v
PROOF_API_URL=https://api.proof.com
PROOF_ENVIRONMENT=production
PROOF_ORGANIZATION_ID=caokn9zdg
```

### Test Credentials
- **Organization ID**: `caokn9zdg`
- **API Key**: `wVc8ni3bWaEvZNQBBM215h1v` (Full Access)
- **Environment**: Production

## 🧪 Automated Testing

### Run Complete Test Suite
```bash
# Install dependencies if needed
npm install chalk node-fetch

# Run comprehensive RON test suite
node scripts/test-ron-flow.js

# View help
node scripts/test-ron-flow.js --help
```

### Expected Test Results
```
🚀 Starting RON Integration Test Suite

🔍 Testing RON Service Selection in UI
✅ Booking page loads
✅ RON_SERVICES option present
✅ $35 pricing displayed

🔍 Testing RON Availability API
✅ RON availability API call
✅ RON availability returns slots
✅ RON slots marked as 24/7 available

🔍 Testing Proof.com API Connection
✅ Proof.com API connection

🔍 Testing Proof.com Webhook Handler
✅ Proof webhook endpoint exists
✅ Webhook handler processes requests

🔍 Testing RON Booking Creation
✅ RON booking creation API call
✅ Booking has proper structure
✅ Service type is RON_SERVICES
✅ RON session details included
✅ Proof.com transaction ID exists
✅ Proof.com access link exists
✅ Proof.com status exists

📊 Test Results Summary
══════════════════════════════════════════════════
✅ Tests Passed: 13
❌ Tests Failed: 0
📊 Total Tests: 13
📈 Success Rate: 100%

🔐 RON Session Details:
Transaction ID: txn_abc123...
Access Link: https://proof.com/session/...
Status: pending
Instructions: Check your email for RON session access link from Proof.com
```

## 📋 Manual Testing Checklist

### 1. Customer RON Booking Flow
- [ ] **Navigate to**: `/booking`
- [ ] **Select Service**: "Remote Online Notarization - $35"
- [ ] **Fill Customer Info**:
  ```
  Name: Test Customer
  Email: test@example.com
  Phone: 713-555-0123
  ```
- [ ] **Skip Location**: RON services don't require location
- [ ] **Select Time**: Any 24/7 available slot
- [ ] **Review & Submit**: Complete booking
- [ ] **Verify**: Booking creation includes RON session details

### 2. Proof.com Session Creation
- [ ] **Check Response**: Booking API returns `ron` object
- [ ] **Verify Fields**:
  ```json
  {
    "ron": {
      "transactionId": "txn_...",
      "accessLink": "https://proof.com/session/...",
      "status": "pending",
      "instructions": "Check your email..."
    }
  }
  ```
- [ ] **Database Check**: Booking record contains Proof transaction ID

### 3. Customer Experience
- [ ] **Email Notification**: Customer receives Proof.com invitation
- [ ] **Access Link**: Link redirects to Proof.com platform
- [ ] **Identity Verification**: Customer can complete ID verification
- [ ] **Document Upload**: Customer can upload documents
- [ ] **Session Ready**: Status shows ready for notary

### 4. Notary Dashboard
- [ ] **RON Bookings List**: Shows pending RON sessions
- [ ] **Session Details**: Displays Proof.com transaction info
- [ ] **Join Session**: Notary can access Proof.com session
- [ ] **Session Controls**: Start, pause, complete options available

### 5. Webhook Processing
- [ ] **Status Updates**: Proof.com sends status webhooks
- [ ] **Database Updates**: Booking status reflects Proof status
- [ ] **Completion**: Final status marked as completed

## 🔍 Debugging & Troubleshooting

### Check API Connection
```bash
# Test Proof.com API directly
curl -X GET "https://api.proof.com/v1/transactions" \
  -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
  -H "Content-Type: application/json"
```

### Verify Environment Variables
```bash
# Check in Next.js app
curl http://localhost:3000/api/debug/proof-connection
```

### Database Inspection
```sql
-- Check RON bookings
SELECT 
  id, 
  customerEmail, 
  serviceId,
  dailyRoomUrl as proofSessionUrl,
  kbaStatus as proofTransactionId,
  idVerificationStatus as proofStatus,
  status,
  createdAt
FROM "Booking" 
WHERE serviceId = (
  SELECT id FROM "Service" WHERE serviceType = 'RON_SERVICES'
)
ORDER BY createdAt DESC
LIMIT 5;
```

### Log Monitoring
```bash
# Watch for RON session creation logs
tail -f logs/app.log | grep "Proof\|RON"
```

## 🚨 Common Issues & Solutions

### Issue: "Proof API not enabled"
**Solution**: Check environment variables
```bash
echo $PROOF_API_KEY
echo $PROOF_ORGANIZATION_ID
```

### Issue: "Authentication failed"
**Solution**: Verify API key format
- Use `ApiKey` header, not `Authorization: Bearer`
- Ensure key is: `wVc8ni3bWaEvZNQBBM215h1v`

### Issue: "No RON session created"
**Solution**: Check booking creation logs
```bash
# Look for RON integration logs
grep "Creating Proof.com RON session" logs/*
```

### Issue: "Customer not receiving invitation"
**Solution**: Check Proof.com dashboard
- Verify transaction was created
- Check customer email in transaction
- Ensure Proof.com email delivery

## 📊 Performance Monitoring

### Key Metrics to Track
- **RON Booking Success Rate**: >95%
- **Proof Session Creation Time**: <5 seconds
- **Customer Email Delivery**: <2 minutes
- **Session Completion Rate**: >90%

### Monitoring Queries
```sql
-- RON booking success rate (last 7 days)
SELECT 
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN kbaStatus LIKE 'proof_transaction:%' THEN 1 END) as successful_proof_sessions,
  ROUND(
    100.0 * COUNT(CASE WHEN kbaStatus LIKE 'proof_transaction:%' THEN 1 END) / COUNT(*),
    2
  ) as success_rate_percent
FROM "Booking" 
WHERE serviceId = (SELECT id FROM "Service" WHERE serviceType = 'RON_SERVICES')
  AND createdAt >= NOW() - INTERVAL '7 days';
```

## 🎯 Success Criteria

### Automated Tests: 100% Pass Rate
- [ ] All 13 automated tests pass
- [ ] No errors in test output
- [ ] RON session details returned

### Manual Tests: Complete Customer Journey
- [ ] Customer can book RON service
- [ ] Proof.com session automatically created
- [ ] Customer receives access email
- [ ] Identity verification works
- [ ] Document upload functions
- [ ] Notary can join session
- [ ] Session completion tracked

### Integration Health
- [ ] Proof.com API connection stable
- [ ] Webhook processing functional
- [ ] Database updates correct
- [ ] Error handling graceful

---

## 📞 Support

If you encounter issues during testing:

1. **Check logs**: Look for Proof.com integration errors
2. **Verify credentials**: Ensure API key is valid
3. **Test connection**: Use debug endpoint
4. **Contact Proof.com**: For platform-specific issues

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team 