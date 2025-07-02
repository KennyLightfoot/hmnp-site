# 🚀 HMNP Booking System V2 API Architecture
**Bulletproof Design for Production Excellence**

## 🎯 Core Design Principles

### **Single Responsibility**
- One endpoint per business function
- Clear separation of concerns
- No overlapping functionality

### **Atomic Operations**
- All booking operations are transactional
- Rollback on any failure
- Data consistency guaranteed

### **Fail-Fast Design**
- Validate everything upfront
- Return errors immediately
- No silent failures

---

## 🛠️ V2 API Endpoints

### **Core Booking API**
```typescript
// SINGLE SOURCE OF TRUTH
POST /api/v2/bookings
GET  /api/v2/bookings
GET  /api/v2/bookings/[id]
PUT  /api/v2/bookings/[id]
DELETE /api/v2/bookings/[id]
```

### **Supporting Services**
```typescript
// Service Management
GET /api/v2/services              // List all active services
GET /api/v2/services/[id]         // Get service details
GET /api/v2/services/pricing      // Calculate pricing with address

// Availability Management  
GET /api/v2/availability          // Check time slots
POST /api/v2/availability/hold    // Reserve time slot (5min hold)

// Payment Processing
POST /api/v2/payments/intent      // Create Stripe payment intent
POST /api/v2/payments/confirm     // Confirm payment + finalize booking
GET  /api/v2/payments/[id]        // Payment status

// Integration Webhooks
POST /api/v2/webhooks/stripe      // Stripe payment webhooks
POST /api/v2/webhooks/ghl         // GoHighLevel integration
POST /api/v2/webhooks/proof       // Proof.com RON updates
```

---

## 📊 Data Flow Architecture

### **Booking Creation Flow**
```
1. Service Selection     → /api/v2/services
2. Availability Check    → /api/v2/availability  
3. Time Slot Hold        → /api/v2/availability/hold
4. Payment Intent        → /api/v2/payments/intent
5. Booking Creation      → /api/v2/bookings (ATOMIC)
6. Payment Confirmation  → /api/v2/payments/confirm (ATOMIC)
7. Integration Sync      → Background jobs
```

### **Atomic Booking Transaction**
```typescript
// ALL-OR-NOTHING OPERATION
BEGIN TRANSACTION
  1. Validate service + availability
  2. Create booking record
  3. Create payment record  
  4. Update time slot availability
  5. Queue integration jobs (GHL, Calendar, RON)
COMMIT OR ROLLBACK
```

---

## 💼 Business Logic Centralization

### **Service Definition Engine**
```typescript
interface ServiceDefinition {
  id: string;
  name: string;
  type: 'MOBILE' | 'RON';
  basePrice: number;
  depositRequired: boolean;
  depositAmount?: number;
  duration: number;         // minutes
  maxSigners: number;
  maxDocuments: number;
  serviceArea: ServiceArea;
  businessRules: BusinessRule[];
  integrations: Integration[];
}

interface ServiceArea {
  centerPoint: Coordinates;
  standardRadius: number;   // miles
  extendedRadius?: number;  // miles
  travelFeeRate: number;    // per mile
}
```

### **Pricing Engine**
```typescript
interface PricingCalculation {
  serviceId: string;
  basePrice: number;
  travelFee: number;
  timeSurcharge: number;    // weekend/after-hours
  emergencyFee?: number;
  promoDiscount: number;
  taxes: number;
  finalPrice: number;
  depositRequired: number;
  breakdown: PriceBreakdown[];
}

// SINGLE FUNCTION FOR ALL PRICING
function calculatePricing(
  serviceId: string,
  address: Address,
  scheduledDateTime: Date,
  promoCode?: string
): PricingCalculation
```

### **Integration Management**
```typescript
interface BookingIntegration {
  name: 'stripe' | 'ghl' | 'proof' | 'calendar';
  required: boolean;
  priority: number;
  retryPolicy: RetryPolicy;
  rollbackAction?: string;
}

// Managed integration queue
class IntegrationOrchestrator {
  async executeBookingIntegrations(booking: Booking): Promise<void>
  async rollbackOnFailure(booking: Booking, failedAt: string): Promise<void>
}
```

---

## 🔒 Security & Validation

### **Input Validation**
```typescript
// Zod schemas for bulletproof validation
const BookingRequestSchema = z.object({
  serviceId: z.string().uuid(),
  customerEmail: z.string().email(),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().phone(),
  scheduledDateTime: z.date().future(),
  address: AddressSchema,
  promoCode: z.string().optional(),
  specialInstructions: z.string().max(500).optional()
});
```

### **Rate Limiting**
```typescript
// Service-specific rate limits
const rateLimits = {
  bookingCreation: '5 requests per minute per IP',
  pricingCalculation: '20 requests per minute per IP',
  availabilityCheck: '30 requests per minute per IP'
};
```

### **Audit Trail**
```typescript
interface BookingAuditLog {
  bookingId: string;
  action: 'created' | 'updated' | 'cancelled' | 'payment_processed';
  actorType: 'customer' | 'admin' | 'system';
  actorId: string;
  changes: Record<string, any>;
  metadata: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

---

## 📈 Performance Optimization

### **Caching Strategy**
```typescript
// Redis cache keys
const cacheKeys = {
  services: 'services:active',              // 1 hour TTL
  serviceArea: 'area:${zipCode}',          // 24 hour TTL  
  pricing: 'pricing:${serviceId}:${zip}',  // 30 min TTL
  availability: 'slots:${date}:${service}' // 15 min TTL
};
```

### **Database Optimization**
```sql
-- Strategic indexes for performance
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date_time);
CREATE INDEX idx_bookings_service_status ON bookings(service_id, status);
CREATE INDEX idx_payments_booking_status ON payments(booking_id, status);
CREATE INDEX idx_services_active ON services(is_active, service_type);
```

---

## 🚨 Error Handling Strategy

### **Error Response Format**
```typescript
interface ApiError {
  error: {
    code: string;           // 'INVALID_SERVICE' | 'PAYMENT_FAILED' etc
    message: string;        // Human-readable message
    field?: string;         // For validation errors
    requestId: string;      // For support tracking
    timestamp: string;
    details?: any;          // Additional context
  }
}
```

### **Failure Recovery**
```typescript
class BookingFailureRecovery {
  async handlePaymentFailure(booking: Booking): Promise<void> {
    // Release time slot hold
    // Send customer notification
    // Update booking status
    // Log for analysis
  }
  
  async handleIntegrationFailure(booking: Booking, service: string): Promise<void> {
    // Mark integration for retry
    // Continue with other integrations
    // Alert admin if critical
  }
}
```

---

## 📊 Monitoring & Analytics

### **Key Metrics Tracking**
```typescript
interface BookingMetrics {
  // Performance metrics
  responseTime: number;
  errorRate: number;
  throughput: number;
  
  // Business metrics  
  conversionRate: number;        // visitors to bookings
  paymentSuccessRate: number;
  integrationSuccessRate: Record<string, number>;
  
  // Operational metrics
  systemUptime: number;
  databaseHealth: boolean;
  cacheHitRate: number;
}
```

### **Real-time Alerts**
```typescript
const alertThresholds = {
  responseTime: 500,           // ms
  errorRate: 1,               // percent
  paymentFailureRate: 5,      // percent
  integrationFailureRate: 10  // percent
};
```

---

## 🎯 Migration Strategy

### **Phase 1: Infrastructure (Week 1)**
1. Deploy V2 API alongside V1 (feature flag)
2. Database schema migration
3. Update environment configuration
4. Setup monitoring and alerting

### **Phase 2: Core Features (Week 2)**  
1. Implement V2 booking creation
2. Migrate payment processing
3. Add integration orchestration
4. Comprehensive testing

### **Phase 3: Frontend Migration (Week 3)**
1. Update booking form to use V2 API
2. Implement new error handling
3. Add progress indicators
4. Mobile optimization

### **Phase 4: Full Cutover (Week 4)**
1. Route 100% traffic to V2
2. Remove V1 endpoints
3. Performance optimization
4. Documentation update

---

## ✅ Success Criteria

### **Technical KPIs**
- [ ] Single booking endpoint (down from 3)
- [ ] <200ms average response time
- [ ] 99.9% uptime
- [ ] <0.1% error rate
- [ ] 95%+ cache hit rate

### **Business KPIs**
- [ ] 99%+ payment success rate
- [ ] 95%+ integration success rate  
- [ ] 90%+ booking completion rate
- [ ] <5 second booking time
- [ ] Zero data integrity issues

### **Code Quality**
- [ ] 100% TypeScript coverage
- [ ] 90%+ test coverage
- [ ] Zero security vulnerabilities
- [ ] <500 lines per API file
- [ ] Single source of truth for all business logic

---

**This architecture will transform the chaos into a bulletproof system that just works.** 🚀