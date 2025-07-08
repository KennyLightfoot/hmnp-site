# Houston Mobile Notary Pros - Service Implementation Plan

## 🎯 Overview

This plan outlines the complete implementation needed to make all 6 services from the website fully functional in the booking system.

## 🔍 Current State Analysis

### ✅ What's Working:
- Core booking system with database schema
- Pricing engine (simple and dynamic)
- GHL calendar integration with proper mapping
- Payment processing via Stripe
- Basic service types: `STANDARD_NOTARY`, `EXTENDED_HOURS`, `LOAN_SIGNING`, `RON_SERVICES`

### ❌ Critical Issues:

#### Service Definition Mismatch
**Services Page Shows (6):**
- Quick-Stamp Local ($50) ❌ **NOT IN DATABASE**
- Standard Mobile Notary ($75) ✅ 
- Extended Hours Mobile ($100) ✅
- Loan Signing Specialist ($150) ✅
- RON ($25 + $5) ✅
- Business Subscription ($125/$349) ❌ **NOT IMPLEMENTED**

## 📋 Implementation Phases

### Phase 1: Database Services (CRITICAL) 🚨

**Problem:** Missing services in database that exist on website

**Solution:** Create complete services seed file

#### 1.1 Create `prisma/complete-services-seed.ts`

```typescript
/**
 * Complete Services Setup - Houston Mobile Notary Pros
 */
import * as dotenv from 'dotenv';
import { PrismaClient, ServiceType } from '@prisma/client';

dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  const allServices = [
    // 1. Quick-Stamp Local (NEW - missing from backend)
    {
      id: 'hmnp_quick_stamp_local',
      name: 'Quick-Stamp Local',
      type: ServiceType.MOBILE,
      description: 'Fast & simple local signings. ≤ 1 document, ≤ 2 stamps, 1 signer included.',
      basePrice: 50.00,
      depositRequired: false,
      depositAmount: null,
      duration: 30,
      maxSigners: 1,
      maxDocuments: 1,
      isActive: true,
      serviceRadius: 10,
      travelFeeRate: 0.50
    },
    
    // 2. Business Subscription Essentials (NEW)
    {
      id: 'hmnp_business_essentials',
      name: 'Business Subscription - Essentials',
      type: ServiceType.RON,
      description: 'Monthly subscription: Up to 10 RON seals/month + 10% off mobile rates.',
      basePrice: 125.00,
      depositRequired: false,
      depositAmount: null,
      duration: 30,
      maxSigners: 1,
      maxDocuments: 10,
      isActive: true,
      serviceRadius: null,
      travelFeeRate: null
    },
    
    // 3. Business Subscription Growth (NEW)
    {
      id: 'hmnp_business_growth',
      name: 'Business Subscription - Growth',
      type: ServiceType.RON,
      description: 'Monthly subscription: Up to 40 RON seals/month + 10% off mobile rates + 1 free loan signing.',
      basePrice: 349.00,
      depositRequired: false,
      depositAmount: null,
      duration: 30,
      maxSigners: 1,
      maxDocuments: 40,
      isActive: true,
      serviceRadius: null,
      travelFeeRate: null
    }
  ];

  for (const service of allServices) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
    console.log(`✅ ${service.name}`);
  }
}

main().catch(console.error);
```

#### 1.2 Run Seed Command
```bash
npx tsx prisma/complete-services-seed.ts
```

### Phase 2: Service Type Validation (HIGH) 🔥

**Update `lib/booking-validation.ts`:**

```typescript
// Add missing service types
export const ServiceTypeSchema = z.enum([
  'QUICK_STAMP_LOCAL',      // NEW
  'STANDARD_NOTARY',
  'EXTENDED_HOURS', 
  'LOAN_SIGNING',
  'RON_SERVICES',
  'BUSINESS_ESSENTIALS',    // NEW  
  'BUSINESS_GROWTH'         // NEW
]);
```

### Phase 3: GHL Calendar Mapping (HIGH) 🔥

**Update `lib/ghl/calendar-mapping.ts`:**

```typescript
const CALENDAR_MAPPING = {
  'QUICK_STAMP_LOCAL': 'GHL_STANDARD_NOTARY_CALENDAR_ID',
  'STANDARD_NOTARY': 'GHL_STANDARD_NOTARY_CALENDAR_ID',
  'EXTENDED_HOURS': 'GHL_EXTENDED_HOURS_CALENDAR_ID',
  'LOAN_SIGNING': 'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID',
  'RON_SERVICES': 'GHL_BOOKING_CALENDAR_ID',
  'BUSINESS_ESSENTIALS': 'GHL_BOOKING_CALENDAR_ID',
  'BUSINESS_GROWTH': 'GHL_BOOKING_CALENDAR_ID'
} as const;
```

### Phase 4: Pricing Engine Updates (HIGH) 🔥

**Update `lib/pricing-engine.ts`:**

```typescript
export const SERVICES = {
  QUICK_STAMP_LOCAL: {
    price: 50,
    hours: "9am-5pm Mon-Fri",
    included: "≤ 1 doc, 1 signer, ≤ 10 miles travel",
    maxDocuments: 1,
    includedRadius: 10,
    feePerMile: 0.50
  },
  
  BUSINESS_ESSENTIALS: {
    price: 125, // Monthly subscription
    hours: "24/7 RON availability",
    included: "Up to 10 RON seals/month + 10% off mobile",
    subscription: true,
    ronSealsIncluded: 10,
    mobileDiscount: 0.10
  },
  
  BUSINESS_GROWTH: {
    price: 349, // Monthly subscription  
    hours: "24/7 RON availability",
    included: "Up to 40 RON seals/month + 10% off mobile + 1 free loan signing",
    subscription: true,
    ronSealsIncluded: 40,
    mobileDiscount: 0.10,
    freeLoanSigning: 1
  }
} as const;
```

### Phase 5: Frontend Service Integration (MEDIUM) 🔶

#### 5.1 Update Service Selector
**Update `components/booking/ServiceSelector.tsx`**
- Add Quick-Stamp Local service card
- Add Business Subscription options
- Handle subscription-specific UI

#### 5.2 Update Booking Forms
**Update `components/booking/SimpleBookingForm.tsx`**
- Handle subscription services differently
- Add subscription signup flow
- Validate subscription-specific requirements

#### 5.3 Add Subscription Components
**Create `components/subscriptions/`**
- `SubscriptionSelector.tsx` - Choose plan
- `SubscriptionBilling.tsx` - Billing setup
- `SubscriptionDashboard.tsx` - Usage tracking

### Phase 6: Analytics & Tracking (LOW) 🔷

**Create `lib/analytics/service-analytics.ts`:**

```typescript
export class ServiceAnalytics {
  static async trackServiceSelection(serviceType: string, customerEmail?: string) {
    // Track which services customers choose
  }

  static async getServiceUsageStats() {
    // Return usage analytics for admin dashboard
  }

  static async getConversionRates() {
    // Track conversion rates by service type
  }
}
```

### Phase 7: Business Subscription System (LOW) 🔷

#### 7.1 Database Schema Updates
**Add to `prisma/schema.prisma`:**

```prisma
model Subscription {
  id              String           @id @default(cuid())
  customerId      String
  planType        SubscriptionPlan
  status          SubscriptionStatus
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  ronSealsUsed    Int              @default(0)
  ronSealsIncluded Int
  stripeSubscriptionId String?
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

enum SubscriptionPlan {
  ESSENTIALS
  GROWTH
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  PAUSED
}
```

#### 7.2 API Routes
- `/api/subscriptions/create` - Create business subscription
- `/api/subscriptions/usage` - Track RON usage
- `/api/subscriptions/billing` - Handle billing

### Phase 8: RON Integration Completion (LOW) 🔷

**Proof.com Integration:**
1. Complete RON session creation
2. Document upload/processing  
3. Session recording/storage
4. Compliance reporting

## 🚨 Priority Implementation Order

### Week 1 (CRITICAL)
1. ✅ **Phase 1** - Fix database services
2. ✅ **Phase 2** - Update service validation
3. ✅ **Phase 3** - Update calendar mapping
4. ✅ **Phase 4** - Update pricing engine

### Week 2 (HIGH)
5. ✅ **Phase 5** - Frontend integration

### Week 3-4 (MEDIUM/LOW)
6. ✅ **Phase 6** - Analytics & tracking
7. ✅ **Phase 7** - Business subscriptions
8. ✅ **Phase 8** - RON completion

## 🎯 Expected Outcomes

After completion:

✅ **All 6 services from UI will be functional**
✅ **Customers can book any service type**  
✅ **Proper pricing calculation for each service**
✅ **GHL integration tracks all bookings**
✅ **Analytics show service preferences**
✅ **Business subscriptions generate recurring revenue**
✅ **RON services fully compliant and operational**

## 🔧 Quick Start Commands

```bash
# 1. Seed missing services
npx tsx prisma/complete-services-seed.ts

# 2. Test booking system
npm run dev

# 3. Verify services in database
npx prisma studio

# 4. Run tests
npm run test:booking
```

## 📊 Success Metrics

- **Booking Completion Rate**: Target 95%+
- **Service Coverage**: 100% of website services functional
- **Customer Satisfaction**: Track service-specific ratings
- **Revenue Growth**: Monitor subscription vs one-time bookings

---

**Next Step:** Start with Phase 1 (Database Services) - this is the foundation that enables everything else! 🚀 