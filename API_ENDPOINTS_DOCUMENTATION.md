# 📚 API Endpoints Documentation
**Houston Mobile Notary Pros - Complete API Reference**

## 🔐 Authentication
All API endpoints (except Stripe webhooks) require the `x-api-key` header:
```
x-api-key: ${API_KEY}
```

**Environment Variable Required:**
```bash
API_KEY=your_secure_api_key_here
```

---

## 📋 Table of Contents
1. [Booking Management](#booking-management)
2. [Payment Processing](#payment-processing)
3. [GHL Integration](#ghl-integration)
4. [Webhooks](#webhooks)

---

## 🎯 Booking Management

### 1. Create Booking
**Endpoint:** `POST /api/bookings`
**Description:** Creates a new booking and GHL contact

**Request Body:**
```json
{
  "serviceName": "Standard Mobile Notary",
  "scheduledDateTime": "2024-01-15T14:00:00",
  "locationType": "CLIENT_SPECIFIED_ADDRESS",
  "addressStreet": "123 Main St",
  "addressCity": "Houston",
  "addressState": "TX",
  "addressZip": "77001",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "713-555-0123",
  "notes": "Please call when arriving"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "paymentUrl": "https://checkout.stripe.com/...",
    "totalAmount": 75.00,
    "depositAmount": 75.00,
    "ghlContactId": "contact_456"
  }
}
```

### 2. Cancel Booking ⭐ NEW
**Endpoint:** `POST /api/bookings/cancel`
**Description:** Cancels a booking with automatic refund processing

**Request Body:**
```json
{
  "bookingId": "booking_123",
  "reason": "Customer unable to make appointment",
  "initiatedBy": "customer" // or "provider"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "status": "CANCELLED_BY_CLIENT",
    "refundAmount": 75.00,
    "refundPercentage": 100,
    "cancellationFee": 0,
    "refundId": "re_123456",
    "hoursUntilAppointment": 36,
    "message": "Booking cancelled. Refund of $75.00 will be processed within 5-10 business days."
  }
}
```

**Cancellation Policy:**
- **>24 hours notice:** 100% refund
- **12-24 hours notice:** 50% refund ($25 cancellation fee)
- **<12 hours notice:** No refund (100% cancellation fee)

### 3. Reschedule Booking ⭐ NEW
**Endpoint:** `POST /api/bookings/reschedule`
**Description:** Changes appointment date/time with availability checking

**Request Body:**
```json
{
  "bookingId": "booking_123",
  "newDateTime": "2024-01-16T15:00:00",
  "reason": "Client schedule conflict",
  "skipAvailabilityCheck": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "originalDateTime": "2024-01-15T14:00:00",
    "newDateTime": "2024-01-16T15:00:00",
    "reschedulingFee": 0,
    "reschedulingCount": 1,
    "message": "Booking rescheduled successfully."
  }
}
```

**Rescheduling Policy:**
- **>24 hours notice:** Free rescheduling
- **<24 hours notice:** $25 rescheduling fee
- **Maximum reschedules:** 2 per booking

### 4. Check Available Times
**Endpoint:** `GET /api/bookings/reschedule?bookingId={id}&date={date}`
**Description:** Returns available time slots for rescheduling

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-16",
    "serviceDuration": 60,
    "availableSlots": [
      {
        "time": "9:00 AM",
        "datetime": "2024-01-16T09:00:00",
        "available": true
      }
    ],
    "totalSlots": 12,
    "reschedulingPolicy": {
      "freeRescheduling": "24 hours before appointment",
      "reschedulingFee": "$25 if less than 24 hours notice",
      "maxReschedules": 2
    }
  }
}
```

### 5. Get Pending Payments
**Endpoint:** `GET /api/bookings/pending-payments?contactId={ghlContactId}`
**Description:** Retrieves pending payment information for GHL workflows

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [{
      "bookingId": "booking_123",
      "paymentUrl": "https://checkout.stripe.com/...",
      "serviceName": "Standard Mobile Notary",
      "servicePrice": 75,
      "scheduledDate": "01/15/2024",
      "scheduledTime": "2:00 PM",
      "locationInfo": {
        "address": "123 Main St, Houston, TX 77001"
      },
      "paymentInfo": {
        "amount": 75,
        "urgencyLevel": "high",
        "hoursOld": 36,
        "isExpired": false
      }
    }]
  }
}
```

### 6. Sync Booking from Phone Call
**Endpoint:** `POST /api/bookings/sync`
**Description:** Creates booking from phone call (used by GHL workflow)

**Request Body:**
```json
{
  "contactId": "ghl_contact_123",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "832-555-0123",
  "serviceName": "Standard Mobile Notary",
  "scheduledDateTime": "2024-01-15 14:00",
  "locationType": "CLIENT_SPECIFIED_ADDRESS",
  "addressStreet": "456 Oak St",
  "addressCity": "Houston",
  "addressState": "TX",
  "notes": "Phone booking",
  "leadSource": "Phone_Call"
}
```

---

## 💳 Payment Processing

### 1. Stripe Webhook Handler ⭐ NEW
**Endpoint:** `POST /api/webhooks/stripe`
**Description:** Processes Stripe payment events automatically

**Headers Required:**
```
stripe-signature: t=timestamp,v1=signature
```

**Handled Events:**
- `checkout.session.completed` - Payment successful
- `payment_intent.succeeded` - Direct payment success
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed

**Automatic Actions:**
1. Updates booking status
2. Updates GHL contact tags and custom fields
3. Triggers appropriate workflows
4. Logs all transactions

**Setup in Stripe Dashboard:**
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## 🤝 GHL Integration

### 1. GHL Contact Update Flow
When any booking event occurs, the system automatically:

**For Successful Payment:**
- Removes tag: `status:booking_pendingpayment`
- Adds tags: `status:payment_completed`, `status:booking_confirmed`
- Updates custom fields:
  - `cf_payment_date`
  - `cf_booking_status`
  - `cf_payment_status`

**For Cancellation:**
- Removes tags: `status:booking_confirmed`, `status:payment_completed`
- Adds tags: `status:booking_cancelled`, `cancelled:by_customer/provider`
- Updates custom fields:
  - `cf_booking_status`
  - `cf_cancellation_reason`
  - `cf_cancellation_date`
  - `cf_refund_amount`

**For Rescheduling:**
- Adds tag: `booking:rescheduled`
- Updates custom fields:
  - `cf_appointment_date`
  - `cf_appointment_time`
  - `cf_appointment_datetime`
  - `cf_reschedule_count`
  - `cf_previous_appointment_date`

---

## 🔧 Testing Guide

### 1. Test Stripe Webhook Locally
Use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 2. Test Cancellation
```bash
curl -X POST http://localhost:3000/api/bookings/cancel \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d '{
    "bookingId": "booking_123",
    "reason": "Testing cancellation",
    "initiatedBy": "customer"
  }'
```

### 3. Test Rescheduling
```bash
curl -X POST http://localhost:3000/api/bookings/reschedule \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d '{
    "bookingId": "booking_123",
    "newDateTime": "2024-01-20T10:00:00",
    "reason": "Testing reschedule"
  }'
```

---

## 🚨 Error Handling

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Missing required fields: bookingId and newDateTime"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Booking not found"
}
```

**409 Conflict:**
```json
{
  "error": "The selected time slot is not available",
  "conflicts": [...]
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to process request"
}
```

---

## 📊 Monitoring & Logging

All API endpoints include comprehensive logging:
- `✅` Success operations
- `❌` Errors and failures
- `🎯` Incoming requests
- `💳` Payment events
- `🔄` Status changes
- `🔔` Notifications sent

Check application logs for detailed debugging information.

---

## 🔐 Security Best Practices

1. **Always use HTTPS in production**
2. **Rotate API keys regularly**
3. **Implement rate limiting**
4. **Validate all input data**
5. **Use environment variables for secrets**
6. **Enable Stripe webhook signature verification**
7. **Log all critical operations**
8. **Monitor for unusual activity**

---

## 🚀 Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure Stripe webhook endpoint
- [ ] Test all endpoints in staging
- [ ] Verify GHL integration
- [ ] Set up monitoring/alerts
- [ ] Configure backup procedures
- [ ] Document any customizations
- [ ] Train staff on manual procedures 