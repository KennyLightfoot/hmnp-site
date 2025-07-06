# Booking Calculator Architecture
## Houston Mobile Notary Pros - Championship Pricing System

### Overview
This document outlines the comprehensive booking calculator architecture designed to maximize conversion rates while maintaining transparency and accuracy in pricing calculations.

---

## 🏗️ Core Architecture Components

### 1. Pricing Engine (`lib/pricing-engine.ts`)
**Purpose**: Centralized pricing calculation with real-time accuracy

#### Key Features:
- **Service-Based Pricing**: Different base prices for service types
- **Dynamic Travel Calculation**: Real-time distance-based fees
- **Surcharge Management**: Priority, weather, after-hours fees
- **Discount Engine**: Promo codes, first-time customer, referral discounts
- **Upsell Detection**: Smart suggestions for service upgrades

#### Service Types & Base Pricing:
```typescript
SERVICES = {
  STANDARD_NOTARY: {
    price: 75,
    includedRadius: 15, // miles
    feePerMile: 0.50,
    maxDocuments: 2
  },
  EXTENDED_HOURS: {
    price: 100,
    includedRadius: 20,
    feePerMile: 0.50,
    maxDocuments: 5
  },
  LOAN_SIGNING: {
    price: 150,
    includedRadius: 20,
    feePerMile: 0.50,
    maxDocuments: 999
  },
  RON_SERVICES: {
    price: 35, // $25 RON + $10 notarial (Texas compliance)
    includedRadius: 0, // No travel for RON
    feePerMile: 0
  }
}
```

### 2. Distance Calculation System
**Purpose**: Accurate travel fee calculation using Google Maps API

#### Features:
- **Real-time Distance**: Google Maps Distance Matrix API
- **Caching System**: Redis-based caching for performance
- **Fallback Logic**: Graceful degradation if API fails
- **Service Area Validation**: Automatic area verification

#### Travel Fee Formula:
```
Travel Fee = max(0, (Distance - Included Radius)) × Fee Per Mile
```

### 3. Surcharge Management
**Purpose**: Handle additional fees for special circumstances

#### Surcharge Types:
- **Priority Service**: $25 (next available slot within 2 hours)
- **After Hours**: $30 (outside extended hours with 24h notice)
- **Weekend Service**: $40 (Saturday/Sunday essential services)
- **Weather Alert**: $0.65 per mile during severe weather
- **Same Day**: $0 (limited availability, no charge)

### 4. Discount Engine
**Purpose**: Apply various discounts while maintaining profitability

#### Discount Types:
- **First-Time Customer**: $15 off
- **Referral Discount**: $20 off
- **Volume Discount**: 10% for 3+ documents in STANDARD service
- **Promo Codes**: Dynamic percentage or fixed amount discounts

---

## 💰 Pricing Calculation Flow

### Step 1: Base Price Calculation
```typescript
const basePrice = SERVICES[serviceType].price;
```

### Step 2: Travel Fee Calculation
```typescript
const distance = await calculateDistance(baseLocation, customerAddress);
const excessDistance = Math.max(0, distance - includedRadius);
const travelFee = excessDistance * feePerMile;
```

### Step 3: Surcharge Application
```typescript
const surcharges = calculateSurcharges(serviceType, scheduledDateTime, options);
```

### Step 4: Discount Application
```typescript
const discounts = await calculateDiscounts(promoCode, customerEmail, referralCode);
```

### Step 5: Final Price Calculation
```typescript
const subtotal = basePrice + travelFee + surcharges;
const finalPrice = subtotal - discounts;
```

---

## 🎯 User Experience Optimization

### 1. Real-Time Price Updates
- **Smart Debouncing**: 2-second delay to prevent excessive API calls
- **Progressive Disclosure**: Show base price first, then add fees
- **Transparent Breakdown**: Clear line-item pricing display

### 2. Upsell Opportunities
- **Service Upgrades**: Suggest higher-tier services based on needs
- **Add-on Services**: Witness fees, copy certification, etc.
- **Urgency Indicators**: Highlight time-sensitive benefits

### 3. Confidence Building
- **Price Guarantee**: Locked pricing for 15 minutes
- **No Hidden Fees**: Complete transparency in breakdown
- **Competitive Comparison**: Show value vs. competitors

---

## 📊 Data Models & Interfaces

### Pricing Calculation Parameters
```typescript
interface PricingCalculationParams {
  serviceType: 'STANDARD_NOTARY' | 'EXTENDED_HOURS' | 'LOAN_SIGNING' | 'RON_SERVICES';
  location?: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  scheduledDateTime: string;
  documentCount: number;
  signerCount: number;
  options: {
    priority: boolean;
    weatherAlert: boolean;
    sameDay: boolean;
  };
  customerEmail?: string;
  promoCode?: string;
  referralCode?: string;
}
```

### Pricing Result
```typescript
interface PricingResult {
  basePrice: number;
  travelFee: number;
  surcharges: number;
  discounts: number;
  total: number;
  breakdown: PricingBreakdown;
  upsellSuggestions: UpsellSuggestion[];
  confidence: PricingConfidence;
  metadata: PricingMetadata;
}
```

### Pricing Breakdown
```typescript
interface PricingBreakdown {
  lineItems: Array<{
    description: string;
    amount: number;
    type: 'base' | 'travel' | 'surcharge' | 'discount';
  }>;
  transparency: {
    travelCalculation?: string;
    surchargeExplanation?: string;
    discountSource?: string;
  };
}
```

---

## 🔧 Technical Implementation

### 1. API Endpoints
- **POST `/api/booking/calculate-price`**: Main pricing calculation
- **POST `/api/booking/reserve-slot`**: Time slot reservation
- **GET `/api/booking/validate-promo`**: Promo code validation

### 2. Caching Strategy
- **Redis Caching**: 30-second cache for identical requests
- **Distance Caching**: 30-day cache for distance calculations
- **Promo Code Caching**: 1-hour cache for active promo codes

### 3. Error Handling
- **Graceful Degradation**: Fallback pricing if APIs fail
- **User-Friendly Messages**: Clear error explanations
- **Retry Logic**: Automatic retry for transient failures

### 4. Performance Optimization
- **Request Deduplication**: Prevent duplicate calculations
- **Rate Limiting**: Protect against abuse
- **Async Processing**: Non-blocking price calculations

---

## 📈 Conversion Optimization Features

### 1. Psychological Pricing
- **Anchoring**: Show higher-tier services first
- **Decoy Effect**: Include premium options to make standard look better
- **Urgency**: Limited-time pricing guarantees

### 2. Trust Signals
- **Price Transparency**: Complete breakdown visible
- **Guarantee Display**: "Price locked for 15 minutes"
- **Social Proof**: "Booked X times today"

### 3. Friction Reduction
- **Progressive Form**: Step-by-step booking process
- **Auto-Save**: Preserve progress across sessions
- **Smart Defaults**: Pre-filled common options

---

## 🛡️ Security & Validation

### 1. Input Validation
- **Zod Schemas**: Type-safe parameter validation
- **Address Normalization**: Standardize address formats
- **Range Validation**: Prevent extreme values

### 2. Rate Limiting
- **IP-based Limits**: Prevent API abuse
- **User-based Limits**: Per-customer restrictions
- **Time-based Limits**: Prevent rapid-fire requests

### 3. Data Protection
- **PII Handling**: Secure customer data processing
- **Audit Logging**: Track all pricing calculations
- **Encryption**: Secure transmission of sensitive data

---

## 📊 Monitoring & Analytics

### 1. Pricing Metrics
- **Conversion Rates**: Track booking completion by price point
- **Abandonment Analysis**: Identify where users drop off
- **Upsell Performance**: Measure upgrade conversion rates

### 2. Performance Metrics
- **API Response Times**: Monitor calculation speed
- **Cache Hit Rates**: Track caching effectiveness
- **Error Rates**: Monitor system reliability

### 3. Business Intelligence
- **Price Sensitivity**: Analyze demand vs. price changes
- **Geographic Patterns**: Identify high-value service areas
- **Seasonal Trends**: Track pricing patterns over time

---

## 🔄 Future Enhancements

### 1. Dynamic Pricing
- **Demand-Based**: Adjust prices based on availability
- **Competitive**: Monitor competitor pricing
- **Seasonal**: Holiday and event-based adjustments

### 2. AI-Powered Features
- **Predictive Pricing**: ML-based price optimization
- **Smart Upselling**: AI-driven service recommendations
- **Fraud Detection**: ML-based promo code abuse prevention

### 3. Advanced Features
- **Bulk Pricing**: Volume discounts for multiple bookings
- **Subscription Models**: Recurring service pricing
- **Loyalty Programs**: Points-based discount systems

---

## 📋 Implementation Checklist

### Phase 1: Core Calculator
- [x] Base pricing engine
- [x] Travel fee calculation
- [x] Surcharge management
- [x] Discount application
- [x] Real-time updates

### Phase 2: Optimization
- [ ] Advanced caching
- [ ] Upsell detection
- [ ] Performance monitoring
- [ ] A/B testing framework

### Phase 3: Advanced Features
- [ ] Dynamic pricing
- [ ] AI recommendations
- [ ] Predictive analytics
- [ ] Advanced reporting

---

## 🎯 Success Metrics

### Primary KPIs
- **Booking Conversion Rate**: Target 95%+
- **Average Order Value**: Track upsell effectiveness
- **Customer Satisfaction**: Price transparency scores

### Secondary KPIs
- **Calculation Speed**: < 2 seconds average
- **Cache Hit Rate**: > 80%
- **Error Rate**: < 1%

---

*This architecture is designed to maximize conversion while maintaining pricing accuracy and transparency. Regular review and optimization based on real-world performance data is essential for continued success.* 