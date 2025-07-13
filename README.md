# Houston Mobile Notary Pros

Professional mobile notary and loan signing services in Houston, TX.

## Services
- Standard Notary Services
- Extended Hours Notary Services  
- Loan Signing Specialist Services

## Tech Stack
- Next.js 15+ with App Router
- TypeScript
- PostgreSQL with Prisma
- Stripe Payments
- GoHighLevel CRM Integration

<!-- Test change for CodeRabbit PR review -->

🚀 **Enhanced GHL Integration with Advanced Security & Intelligent Automation**

This API server implements the comprehensive workflow automation system outlined in the `HOUSTON_MOBILE_NOTARY_WORKFLOW_GUIDE.md`. It provides real-time payment intelligence, direct booking creation, and seamless integration with GoHighLevel (GHL).

## 🎯 **Features**

### **🔥 API-Enhanced Revenue Systems**
- **Real-time Payment Intelligence** - Automated monitoring and escalation
- **Direct Booking Creation** - Skip website friction completely
- **Smart Urgency Detection** - AI-powered prioritization
- **Enhanced Security** - Military-grade webhook verification

### **⚡ Core Functionality**
- **Pending Payment Monitoring** - `/api/bookings/pending-payments`
- **Booking Synchronization** - `/api/bookings/sync`
- **Webhook Processing** - GHL and Stripe integration
- **Business Intelligence** - Real-time analytics and alerts
- **Health Monitoring** - Comprehensive system health checks

### **🛡️ Security Features**
- HMAC-SHA256 signature verification
- Rate limiting (100 requests/minute)
- Replay attack prevention
- Comprehensive audit logging
- CORS and Helmet security

## 📋 **Quick Start**

### **Prerequisites**
- Node.js >= 18.0.0
- Neon PostgreSQL database
- pnpm package manager (already configured)
- GoHighLevel account with API access
- (Optional) Stripe account for payment processing

### **Installation**

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp api/env.example .env
   ```
   
   Edit `.env` with your Neon PostgreSQL configuration:
   ```env
   # Required for basic functionality
   API_PORT=3001
   DATABASE_URL=postgresql://username:password@hostname/database_name?sslmode=require
   DATABASE_URL_UNPOOLED=postgresql://username:password@hostname/database_name?sslmode=require&pgbouncer=true
   GHL_API_KEY=your_ghl_api_key_here
   GHL_LOCATION_ID=your_ghl_location_id_here
   GHL_WEBHOOK_SECRET=your_secure_webhook_secret_here
   
   # Optional but recommended
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
   PAYMENT_EXPIRATION_HOURS=72
   ```

3. **Set up database:**
   ```bash
   # Generate Prisma client
   pnpm exec prisma generate --schema=api/schema.prisma
   
   # Run database migration
   psql "$DATABASE_URL" -f api/prisma/migrations/001_create_api_tables.sql
   ```

4. **Start the API server:**
   ```bash
   # Development
   pnpm api:dev
   
   # Production
   pnpm api:start
   ```

5. **Verify installation:**
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3000/api/bookings/pending-payments
   ```

## 🔧 **API Endpoints**

### **Core Booking Endpoints**

#### **GET** `/api/bookings/pending-payments`
**Real-time payment intelligence system**

Query pending payments with intelligent urgency classification:

```bash
# Get all pending payments
curl "http://localhost:3000/api/bookings/pending-payments"

# Filter by urgency level
curl "http://localhost:3000/api/bookings/pending-payments?urgencyLevel=critical"

# Get specific contact's pending payments
curl "http://localhost:3000/api/bookings/pending-payments?contactId=GHL_CONTACT_ID"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "bookingId": "HMNP-123456",
        "ghlContactId": "contact_123",
        "customerName": "John Doe",
        "paymentInfo": {
          "amount": 75,
          "urgencyLevel": "high",
          "hoursOld": 26,
          "remindersSent": 2,
          "paymentUrl": "https://pay.example.com/HMNP-123456"
        }
      }
    ],
    "summary": {
      "totalPending": 5,
      "totalValue": 425,
      "criticalUrgency": 2,
      "urgencyBreakdown": {
        "new": 1,
        "medium": 2,
        "high": 1,
        "critical": 1
      }
    }
  }
}
```

#### **PATCH** `/api/bookings/pending-payments`
**Track payment follow-up actions**

```bash
curl -X PATCH "http://localhost:3000/api/bookings/pending-payments" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "HMNP-123456",
    "action": "send_reminder",
    "reminderType": "email",
    "notes": "High urgency payment reminder sent"
  }'
```

#### **POST** `/api/bookings/sync`
**Direct booking creation from any GHL touchpoint**

```bash
curl -X POST "http://localhost:3000/api/bookings/sync" \
  -H "Content-Type: application/json" \
  -H "x-ghl-signature: sha256=YOUR_SIGNATURE" \
  -d '{
    "contactId": "ghl_contact_123",
    "customerName": "Jane Smith",
    "customerEmail": "jane@example.com",
    "customerPhone": "832-555-0123",
    "serviceName": "Standard Mobile Notary",
    "scheduledDateTime": "2024-01-15T14:00:00.000Z",
    "locationType": "CLIENT_SPECIFIED_ADDRESS",
    "addressStreet": "123 Main St",
    "addressCity": "Houston",
    "addressState": "TX",
    "addressZip": "77001",
    "leadSource": "Phone_Call",
    "notes": "Booking created during phone call"
  }'
```

#### **GET** `/api/bookings`
**Get bookings with filtering options**

```bash
curl "http://localhost:3000/api/bookings?status=CONFIRMED&limit=10"
```

### **Webhook Endpoints**

#### **POST** `/webhooks/ghl`
**GoHighLevel webhook receiver**

Automatically processes GHL events:
- Contact creation/updates
- Tag additions/removals
- Form submissions
- Workflow completions
- Custom field updates

#### **POST** `/webhooks/stripe`
**Stripe webhook receiver**

Handles payment events:
- Payment succeeded
- Payment failed
- Payment processing
- Payment canceled
- Charge disputes

### **Health Check Endpoints**

```bash
# Basic health check
curl "http://localhost:3000/api/health"
```

## 🔗 **GoHighLevel Integration**

### **Required GHL Setup**

1. **Get API Credentials:**
   - Log into GHL
   - Go to Settings → API & Integrations
   - Create new API key with full permissions
   - Copy Location ID from account settings

2. **Configure Webhook URL:**
   - In GHL, go to Settings → Workflows
   - Create new webhook trigger
   - Point to: `https://your-domain.com/webhooks/ghl`
   - Add your webhook secret

3. **Set Up Custom Fields:**
   ```
   booking_id          - Text
   service_type        - Text  
   appointment_date    - Date
   appointment_time    - Text
   appointment_address - Text
   service_price       - Number
   payment_amount      - Number
   payment_status      - Text
   payment_url         - Text
   ```

### **Workflow Integration**

The API automatically integrates with your GHL workflows:

```javascript
// Example: GHL "Code with AI" action
const response = await fetch('/api/bookings/pending-payments?limit=50');
const data = await response.json();

for (const booking of data.bookings) {
  if (booking.paymentInfo.urgencyLevel === 'critical') {
    // Trigger final notice workflow
    await triggerWorkflow('final-payment-notice', booking.ghlContactId);
  }
}
```

## 🚀 **Deployment**

### **Environment Setup**

**Development:**
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/houston-mobile-notary
```

**Production:**
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=your-production-database-url
```

### **Docker Deployment**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile --prod
COPY . .
EXPOSE 3000
CMD ["pnpm", "start"]
```

### **Database Indexes**

The system automatically creates optimal MongoDB indexes:
```javascript
// Performance indexes created on startup
db.bookings.createIndex({ "customer.ghlContactId": 1 })
db.bookings.createIndex({ "payment.status": 1 })
db.bookings.createIndex({ "scheduling.scheduledDateTime": 1 })
db.bookings.createIndex({ "payment.urgencyLevel": 1 })
```

## 📊 **Monitoring & Analytics**

### **Logging**

Comprehensive logging to multiple files:
- `logs/api.log` - General API access logs
- `logs/error.log` - Error logs only
- `logs/webhooks.log` - Webhook processing logs
- `logs/bookings.log` - Booking operations
- `logs/ghl-integration.log` - GHL API interactions

### **Metrics Tracking**

Monitor key business metrics:
```javascript
// Business intelligence metrics
{
  "pendingPayments": {
    "critical": { "count": 2, "totalValue": 150 },
    "high": { "count": 3, "totalValue": 225 }
  },
  "todayBookings": 8,
  "revenue": {
    "totalRevenue": 15750,
    "avgBookingValue": 87.5,
    "totalBookings": 180
  }
}
```

## 🛡️ **Security**

### **Webhook Security**

All webhooks use military-grade HMAC-SHA256 verification:

```javascript
// Signature verification example
const signature = request.headers['x-ghl-signature'];
const payload = request.body;
const secret = process.env.GHL_WEBHOOK_SECRET;

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(`sha256=${expectedSignature}`)
);
```

### **Rate Limiting**

- **Global:** 100 requests per 15 minutes per IP
- **Webhook endpoints:** Enhanced monitoring
- **Failed attempts:** Automatic blocking

### **Data Protection**

- All sensitive fields automatically redacted in logs
- Request/response sanitization
- Secure environment variable handling
- MongoDB connection encryption

## 📚 **Workflow Implementation**

This API server implements all 22 workflows from the guide:

### **Phase 1: Revenue Workflows**
- ✅ API Payment Intelligence System
- ✅ Enhanced Payment Follow-up
- ✅ Direct Booking Creation
- ✅ Booking Confirmation System
- ✅ Failed Payment Recovery
- ✅ Abandoned Booking Recovery

### **Phase 2: Operational Workflows**
- ✅ Webhook Security & Monitoring
- ✅ Automated Reminders
- ✅ No-Show Recovery
- ✅ Emergency Service Response
- ✅ Rescheduling Automation

### **Phase 3: Growth Workflows**
- ✅ Lead Nurturing
- ✅ Review Management
- ✅ Referral Programs
- ✅ Quote Automation
- ✅ Post-Service Follow-up

### **Phase 4: Intelligence Systems**
- ✅ Real-time Business Intelligence
- ✅ Phone-to-Booking Conversion
- ✅ Form-to-Booking Automation
- ✅ Lead Qualification
- ✅ Seasonal Campaigns

## 🔧 **Development**

### **Project Structure**
```
houston-mobile-notary-api/
├── server.js                 # Main application entry
├── package.json             # Dependencies and scripts
├── env.example              # Environment template
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── webhookSecurity.js   # HMAC-SHA256 verification
│   ├── errorHandler.js      # Error management
│   └── requestLogger.js     # Request logging
├── models/
│   └── Booking.js           # Booking data model
├── routes/
│   ├── bookings.js          # Booking API endpoints
│   ├── webhooks.js          # Webhook processors
│   └── health.js            # Health checks
├── services/
│   └── ghlIntegration.js    # GHL API client
└── logs/                    # Application logs
```

### **Testing**

```bash
# Run tests
npm test

# Test specific endpoint
curl -X GET "http://localhost:3000/api/bookings/pending-payments?urgencyLevel=critical"

# Test webhook security
curl -X POST "http://localhost:3000/api/webhooks/ghl" \
  -H "Content-Type: application/json" \
  -H "x-ghl-signature: sha256=test_signature" \
  -d '{"type": "ContactCreate", "contactId": "test"}'
```

## 📞 **Support**

For technical support or questions about implementing the workflow system:

- **Documentation:** See `HOUSTON_MOBILE_NOTARY_WORKFLOW_GUIDE.md`
- **API Issues:** Check logs in `/logs/` directory
- **GHL Integration:** Verify webhook configuration and API keys
- **Database Issues:** Check MongoDB connection and indexes

## 📈 **Expected Results**

Based on the workflow guide implementation:

- **Revenue Recovery:** 85-95% payment completion rate
- **Conversion Improvement:** 80-95% phone/form conversion
- **Operational Efficiency:** 95% automation of customer communication
- **No-Show Reduction:** 80% decrease in missed appointments

---

**🎉 Your Houston Mobile Notary business now has the most advanced automation system in the industry!**# CodeRabbit Health Check Investigation

## Chatbot + Booking Integration

This app exposes a `/api/chat` endpoint that streams responses from Vertex AI with RAG support. When the model returns structured booking data it is forwarded to `/api/booking` which validates the payload and schedules the appointment.

1. **/api/chat** – POST `{ user: string }` and receive Server‑Sent Events.
2. **/api/booking** – POST booking JSON. Required fields are `serviceType`, `meetingDate`, `meetingTime`, `clientName` and `phone`.

Logs are written to `logs/vertex.log` and `logs/bookings.log`.

Run tests with:

```bash
pnpm test
```

To rebuild the RAG source PDFs:

```bash
pip install -r requirements.txt
python3 scripts/build_pdfs.py
```
