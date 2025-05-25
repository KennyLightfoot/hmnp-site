# Workflow Automation Technical Reference
**Houston Mobile Notary Pros - Implementation Details & Code Examples**

---

## 📋 Table of Contents

### Part 1: Current Implementation Status
1. [Completed Features](#completed-features)
2. [In-Progress Features](#in-progress)
3. [Planned Features](#planned)

### Part 2: Technical Architecture
4. [System Architecture](#architecture)
5. [Database Schema](#database)
6. [API Endpoints](#api-endpoints)
7. [Service Classes](#services)

### Part 3: Code Implementation
8. [Notification System](#notifications)
9. [Booking Automation](#booking-automation)
10. [Payment Processing](#payment)
11. [Lead Nurturing](#lead-nurturing)

### Part 4: Integration Details
12. [GHL API Integration](#ghl-api)
13. [Stripe Integration](#stripe)
14. [Cron Jobs](#cron-jobs)
15. [Webhook Handlers](#webhooks)

---

## Part 1: Current Implementation Status

### 1. Completed Features {#completed-features}

#### ✅ Notification System with Duplicate Prevention
**Status**: Production Ready

**Components**:
- `lib/notifications.ts` - Core notification service
- `NotificationLog` table - Audit trail
- Booking timestamp fields - Prevent duplicates

**Features**:
- Intelligent duplicate prevention
- SMS consent validation
- Multi-channel support (Email/SMS)
- Complete audit logging
- Status-based filtering

**Code Example**:
```typescript
// Send appointment reminder with duplicate prevention
await notificationService.sendAppointmentReminder(
  booking,
  'reminder_24hr',
  {
    email: emailTemplates.reminder24Hr,
    sms: smsTemplates.reminder24Hr
  }
);
```

#### ✅ Booking Status Automation
**Status**: Production Ready

**Components**:
- `lib/booking-automation.ts` - Status management
- `app/api/cron/booking-automation/route.ts` - Automated processing
- `app/api/bookings/[id]/status/route.ts` - Manual override

**Status Flow**:
```
REQUESTED → PAYMENT_PENDING → CONFIRMED → SCHEDULED → 
READY_FOR_SERVICE → IN_SERVICE → COMPLETED → ARCHIVED
                               ↘ NO_SHOW (if late)
```

**Business Rules**:
```typescript
const STATUS_RULES = {
  REQUESTED: ['PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['READY_FOR_SERVICE', 'CANCELLED', 'RESCHEDULED'],
  READY_FOR_SERVICE: ['IN_SERVICE', 'NO_SHOW', 'CANCELLED'],
  // ... etc
};
```

#### ✅ Contact Form Integration
**Status**: Complete

**Endpoint**: `POST /api/contact`

**GHL Integration**:
- Creates/updates contact
- Applies tags: `Source:Website_Contact_Form`, `Status:New_Lead`
- Updates custom fields dynamically
- Triggers GHL workflow
- Creates contact note

**Implementation**:
```typescript
// Dynamic field mapping
const customFieldMap = customFields.reduce((acc, field) => {
  acc[field.key] = field.id;
  return acc;
}, {});

// Update contact with form data
await ghlClient.updateContact(contact.id, {
  customFields: [
    { id: customFieldMap.cf_lead_source_detail, value: 'Website General Inquiry' },
    { id: customFieldMap.cf_preferred_call_time, value: formData.preferredTime },
    // ... etc
  ]
});
```

### 2. In-Progress Features {#in-progress}

#### 🔄 Stripe Payment Integration
**Status**: 90% Complete

**Remaining Tasks**:
- SMS notifications on payment events
- Refund processing automation
- Failed payment retry logic

**Current Implementation**:
```typescript
// Webhook handler
switch (event.type) {
  case 'payment_intent.succeeded':
    await updatePaymentStatus(paymentId, 'COMPLETED');
    await updateBookingStatus(bookingId, 'CONFIRMED');
    await ghlClient.addTagsToContact(contactId, [
      'Status:Payment_Received',
      'Status:Booking_Confirmed'
    ]);
    break;
  
  case 'payment_intent.payment_failed':
    await updatePaymentStatus(paymentId, 'FAILED', failureReason);
    await ghlClient.addTagsToContact(contactId, ['Status:Payment_Failed']);
    break;
}
```

### 3. Planned Features {#planned}

#### 📅 Advanced Features Roadmap

**Cancellation/Rescheduling Workflows**
- Automated refund calculations
- Waitlist management
- Rescheduling availability check

**Lead Nurturing Sequences**
- Abandoned booking recovery
- Quote follow-up automation
- Educational email series
- Re-engagement campaigns

**Payment Automation**
- Progressive reminder sequences
- Auto-cancellation for non-payment
- Partial payment handling
- Revenue recovery workflows

---

## Part 2: Technical Architecture

### 4. System Architecture {#architecture}

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js App    │────▶│  API Routes      │────▶│  Services       │
│  (Frontend)     │     │  (Controllers)   │     │  (Business)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                          │
                                ▼                          ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │  External APIs   │     │  Database       │
                        │  (GHL, Stripe)   │     │  (PostgreSQL)   │
                        └──────────────────┘     └─────────────────┘
```

### 5. Database Schema {#database}

#### NotificationLog Table
```prisma
model NotificationLog {
  id               String   @id @default(cuid())
  bookingId        String
  notificationType String   // 'reminder_24hr', 'confirmation', etc.
  method           String   // 'EMAIL', 'SMS'
  recipientEmail   String?
  recipientPhone   String?
  subject          String?
  message          String
  sentAt           DateTime @default(now())
  status           String   @default("SENT")
  errorMessage     String?
  metadata         Json?
  createdAt        DateTime @default(now())
  
  booking          Booking  @relation(fields: [bookingId], references: [id])
}
```

#### Booking Notification Fields
```prisma
model Booking {
  // ... existing fields
  
  // Notification tracking
  lastReminderSentAt      DateTime?
  reminder24hrSentAt      DateTime?
  reminder2hrSentAt       DateTime?
  reminder1hrSentAt       DateTime?
  confirmationEmailSentAt DateTime?
  confirmationSmsSentAt   DateTime?
  followUpSentAt          DateTime?
  noShowCheckPerformedAt  DateTime?
  
  notificationLogs        NotificationLog[]
}
```

### 6. API Endpoints {#api-endpoints}

#### Booking Management
```typescript
// Get booking status
GET /api/bookings/[id]/status

// Update booking status manually
PATCH /api/bookings/[id]/status
{
  "status": "CONFIRMED",
  "reason": "Payment received manually"
}

// Cancel booking
POST /api/bookings/[id]/cancel
{
  "reason": "Client request",
  "requestedBy": "CLIENT",
  "cancellationFeeWaived": false
}

// Reschedule booking
POST /api/bookings/[id]/reschedule
{
  "newDateTime": "2024-01-15T14:00:00Z",
  "reason": "Client conflict"
}
```

#### Lead Management
```typescript
// Contact form submission
POST /api/contact
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "subject": "Need notary services",
  "message": "Looking for loan signing",
  "preferredTime": "Morning",
  "consent": true
}

// Nurture sequence enrollment
POST /api/nurture/enroll
{
  "email": "client@example.com",
  "sequenceId": "abandoned-booking",
  "metadata": {
    "bookingId": "booking_123",
    "serviceType": "LOAN_SIGNING"
  }
}
```

### 7. Service Classes {#services}

#### NotificationService
```typescript
class NotificationService {
  async sendNotification(
    booking: Booking,
    type: NotificationType,
    templates: NotificationTemplates
  ): Promise<void> {
    // Check for duplicates
    if (await this.isDuplicateNotification(booking, type)) {
      return;
    }
    
    // Send notifications
    const results = await Promise.allSettled([
      this.sendEmail(booking, templates.email),
      this.sendSms(booking, templates.sms)
    ]);
    
    // Log results
    await this.logNotifications(booking, type, results);
  }
  
  private async isDuplicateNotification(
    booking: Booking,
    type: NotificationType
  ): Promise<boolean> {
    const timestampField = `${type}SentAt`;
    return booking[timestampField] !== null;
  }
}
```

#### BookingAutomationService
```typescript
class BookingAutomationService {
  async processBookingStatus(booking: Booking): Promise<void> {
    const newStatus = await this.determineNewStatus(booking);
    
    if (newStatus && this.canTransition(booking.status, newStatus)) {
      await this.updateBookingStatus(booking.id, newStatus);
      await this.triggerStatusActions(booking, newStatus);
    }
  }
  
  private async determineNewStatus(booking: Booking): Promise<BookingStatus | null> {
    // Business logic for status determination
    if (booking.status === 'CONFIRMED' && booking.assignedNotaryId) {
      return 'SCHEDULED';
    }
    
    if (booking.status === 'SCHEDULED' && this.isServiceDay(booking)) {
      return 'READY_FOR_SERVICE';
    }
    
    // ... more logic
  }
}
```

---

## Part 3: Code Implementation

### 8. Notification System {#notifications}

#### Email Templates
```typescript
export const emailTemplates = {
  reminder24Hr: {
    subject: 'Reminder: Your notary appointment is tomorrow',
    html: (booking: Booking) => `
      <h2>Appointment Reminder</h2>
      <p>Hi ${booking.client.firstName},</p>
      <p>This is a reminder that your notary appointment is scheduled for tomorrow:</p>
      <ul>
        <li><strong>Date:</strong> ${formatDate(booking.scheduledFor)}</li>
        <li><strong>Time:</strong> ${formatTime(booking.scheduledFor)}</li>
        <li><strong>Service:</strong> ${booking.serviceType}</li>
      </ul>
    `
  }
};
```

#### SMS Templates
```typescript
export const smsTemplates = {
  reminder24Hr: (booking: Booking) => 
    `Hi ${booking.client.firstName}! Reminder: Your notary appointment is tomorrow at ${formatTime(booking.scheduledFor)}. Please have your documents and ID ready.`,
  
  noShowCheck: (booking: Booking) =>
    `Hi ${booking.client.firstName}, we're at your scheduled appointment location but haven't connected yet. Are you on your way? Please call 832-617-4285 if you need help.`
};
```

### 9. Booking Automation {#booking-automation}

#### Status Transition Logic
```typescript
const transitionBooking = async (booking: Booking, newStatus: BookingStatus) => {
  // Validate transition
  if (!isValidTransition(booking.status, newStatus)) {
    throw new Error(`Invalid transition from ${booking.status} to ${newStatus}`);
  }
  
  // Update booking
  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { 
      status: newStatus,
      [`${newStatus.toLowerCase()}At`]: new Date()
    }
  });
  
  // Trigger side effects
  await triggerStatusActions(updated, newStatus);
  
  return updated;
};
```

### 10. Payment Processing {#payment}

#### Payment Automation Service
```typescript
class PaymentAutomationService {
  async processPaymentReminders(): Promise<void> {
    const overduePayments = await this.getOverduePayments();
    
    for (const payment of overduePayments) {
      const reminderCount = payment.remindersSent || 0;
      
      if (reminderCount < this.MAX_REMINDERS) {
        await this.sendPaymentReminder(payment, reminderCount + 1);
      } else {
        await this.handleMaxRemindersReached(payment);
      }
    }
  }
  
  private async sendPaymentReminder(
    payment: Payment,
    reminderNumber: number
  ): Promise<void> {
    const template = this.getReminderTemplate(reminderNumber);
    await notificationService.sendNotification(
      payment.booking,
      `payment_reminder_${reminderNumber}`,
      template
    );
    
    await this.updatePaymentReminderCount(payment.id, reminderNumber);
  }
}
```

### 11. Lead Nurturing {#lead-nurturing}

#### Nurture Sequence Implementation
```typescript
interface NurtureSequence {
  id: string;
  name: string;
  steps: NurtureStep[];
}

interface NurtureStep {
  delayHours: number;
  subject: string;
  template: string;
  condition?: (contact: Contact) => boolean;
}

const NURTURE_SEQUENCES: Record<string, NurtureSequence> = {
  'abandoned-booking': {
    id: 'abandoned-booking',
    name: 'Abandoned Booking Recovery',
    steps: [
      {
        delayHours: 1,
        subject: 'Complete your notary booking',
        template: 'abandoned-booking-1hr'
      },
      {
        delayHours: 24,
        subject: 'Save $10 on your notary service',
        template: 'abandoned-booking-24hr'
      },
      {
        delayHours: 72,
        subject: 'Everything you need to know about notarization',
        template: 'abandoned-booking-72hr'
      }
    ]
  }
};
```

---

## Part 4: Integration Details

### 12. GHL API Integration {#ghl-api}

#### Core GHL Client
```typescript
class GHLClient {
  private apiKey: string;
  private locationId: string;
  private baseUrl: string;
  
  async upsertContact(data: ContactData): Promise<GHLContact> {
    const existing = await this.getContactByEmail(data.email);
    
    if (existing) {
      return this.updateContact(existing.id, data);
    }
    
    return this.createContact(data);
  }
  
  async addTagsToContact(contactId: string, tags: string[]): Promise<void> {
    await this.request(`/contacts/${contactId}/tags`, {
      method: 'POST',
      body: { tags }
    });
  }
  
  async triggerWorkflow(workflowId: string, contactId: string): Promise<void> {
    await this.request(`/workflows/${workflowId}/trigger`, {
      method: 'POST',
      body: { contactId }
    });
  }
}
```

### 13. Stripe Integration {#stripe}

#### Webhook Processing
```typescript
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      webhookSecret
    );
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
    }
    
    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return Response.json({ error: 'Webhook error' }, { status: 400 });
  }
}
```

### 14. Cron Jobs {#cron-jobs}

#### Cron Job Implementation
```typescript
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    const results = await processReminders(type);
    
    return Response.json({
      success: true,
      processed: results.processed,
      sent: results.sent,
      errors: results.errors
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

### 15. Webhook Handlers {#webhooks}

#### GHL Webhook Handler
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Log webhook
  console.log('GHL Webhook:', {
    type: body.type,
    contactId: body.contactId,
    timestamp: new Date().toISOString()
  });
  
  try {
    switch (body.type) {
      case 'ContactCreate':
        await handleContactCreate(body);
        break;
      
      case 'ContactTagUpdate':
        await handleTagUpdate(body);
        break;
      
      case 'OpportunityStatusUpdate':
        await handleOpportunityUpdate(body);
        break;
      
      // Referral credit webhook
      case 'TagAdded':
        if (body.tag === 'Status:Service_Completed') {
          await processReferralCredit(body.contactId);
        }
        break;
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

---

## Appendices

### A. Error Handling Patterns
```typescript
// Consistent error handling across services
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Usage
throw new ServiceError(
  'Payment processing failed',
  'PAYMENT_FAILED',
  400,
  { reason: 'Insufficient funds' }
);
```

### B. Testing Utilities
```typescript
// Test data factories
export const createTestBooking = (overrides?: Partial<Booking>): Booking => ({
  id: 'test_booking_123',
  status: 'CONFIRMED',
  serviceType: 'STANDARD_NOTARY',
  scheduledFor: addDays(new Date(), 1),
  client: createTestClient(),
  ...overrides
});

// API testing helpers
export const testWebhook = async (
  endpoint: string,
  payload: any
): Promise<Response> => {
  return fetch(`http://localhost:3000${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
};
```

### C. Monitoring & Logging
```typescript
// Structured logging
const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  
  error: (message: string, error: Error, meta?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};
```

---

**Last Updated**: January 2025
**Version**: 2.0
**Maintained By**: HMNP Development Team 