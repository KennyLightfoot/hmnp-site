# Business Logic Phase Planning Document
## Houston Mobile Notary Pros

**Version:** 1.0  
**Created:** January 24, 2025  
**Status:** Planning Phase

---

## 🎯 **Phase Overview**

This document outlines the planning requirements and implementation roadmap for the Business Logic phase, focusing on four critical areas:

1. **Service Area Validation** 📍
2. **Document Limits** 📄  
3. **Pricing Transparency** 💰
4. **Cancellation Policy** ❌

---

## 📊 **Current System Analysis**

### ✅ **What's Already Implemented**

#### **Service Area Validation**
- ✅ **Distance Calculation**: UnifiedDistanceService with Google Maps integration
- ✅ **Travel Fee Logic**: $0.50/mile beyond free radius (30 miles for most services)
- ✅ **Service Area Config**: Configurable radii per service type
- ✅ **Real-time Validation**: Address validation during booking
- ✅ **Caching System**: ServiceAreaCache for performance optimization

#### **Document Limits**
- ✅ **Service-Specific Limits**: Defined in pricing engine
  - QUICK_STAMP_LOCAL: 1 document
  - STANDARD_NOTARY: 2 documents  
  - EXTENDED_HOURS: 5 documents
  - LOAN_SIGNING: 999 documents (unlimited)
  - RON_SERVICES: 10 documents
- ✅ **Validation Logic**: Booking validation schema enforces limits
- ✅ **Database Schema**: Service model includes maxDocuments field

#### **Pricing Transparency**
- ✅ **Fee Breakdown**: Detailed pricing breakdown in booking flow
- ✅ **Dynamic Pricing**: Time-based surcharges (weekend, after-hours)
- ✅ **Travel Fee Display**: Real-time travel fee calculation
- ✅ **Pricing Audit**: PricingAuditLog for transparency
- ✅ **Service Pricing**: Base prices defined for all services

#### **Cancellation Policy**
- ✅ **Basic Policy**: Defined in FAQ and documentation
- ✅ **Refund Processing**: Payment retry service with refund capabilities
- ✅ **Cancellation Tracking**: GHL custom fields for cancellation data
- ✅ **Rate Limiting**: Protection against abuse

---

## 🔍 **Gap Analysis & Requirements**

### **1. Service Area Validation** 📍

#### **Current State**
- ✅ Distance calculation working
- ✅ Travel fees calculated correctly
- ✅ Basic service area validation

#### **Missing/Needs Enhancement**
- ❌ **Extended Service Area Logic**: What happens beyond 50 miles?
- ❌ **Zone-Based Pricing**: Different rates for different areas
- ❌ **Real-time Availability**: Service area + notary availability
- ❌ **Fallback Options**: When service area validation fails
- ❌ **Customer Communication**: Clear messaging about service area limits

#### **Questions for Business Decision**
1. **Maximum Service Distance**: What's the absolute maximum you'll travel? like 60 miles
2. **Zone Pricing**: Do you want different rates for different areas (e.g., Houston proper vs. suburbs)? no
3. **Extended Service**: Do you offer service beyond normal areas for extra fees? yes
4. **Weather Impact**: How does weather affect service area decisions? i will manually cancel and reach out on extreme weather
5. **Notary Availability**: How does notary location affect service area? it doesnt

### **2. Document Limits** 📄

#### **Current State**
- ✅ Basic limits defined per service
- ✅ Validation during booking
- ✅ Database schema supports limits

#### **Missing/Needs Enhancement**
- ❌ **Over-Limit Handling**: What happens when customers exceed limits? im not sure what you mean by this
- ❌ **Document Type Restrictions**: Any documents you won't notarize? HELOC, I dont have an office space for it
- ❌ **Pricing Tiers**: Different pricing for different document counts? we should have additional pricing for docs over the alloted amount in the tier, like $5-10 per extra stamp or something
- ❌ **Customer Education**: Clear communication about limits
- ❌ **Exception Handling**: Process for special cases will be to have them reach out to me

#### **Questions for Business Decision**
1. **Over-Limit Pricing**: Do you charge extra for additional documents beyond the limit? yes $5-10 
2. **Document Types**: Are there any documents you won't notarize? Any documents you won't notarize? HELOC, I dont have an office space for it
3. **Special Cases**: How do you handle urgent requests that exceed limits? we will need to communicate with the client to find out the request
4. **Customer Communication**: How do you want to communicate limits to customers? we should juse use clear language and be upfront? 
5. **Pricing Tiers**: Should pricing change based on document count? yes

### **3. Pricing Transparency** 💰

#### **Current State**
- ✅ Base pricing defined
- ✅ Travel fees calculated
- ✅ Time-based surcharges
- ✅ Basic fee breakdown

#### **Missing/Needs Enhancement**
- ❌ **Complete Fee Disclosure**: All fees shown upfront
- ❌ **Payment Plan Options**: Installment payments for larger services
- ❌ **Dynamic Pricing**: Real-time pricing based on demand/availability
- ❌ **Discount Logic**: Clear discount application rules
- ❌ **Tax Calculation**: Sales tax handling

#### **Questions for Business Decision**
1. **Payment Plans**: Do you offer payment plans for larger services? not currently, but we can think about what this would look like
2. **Dynamic Pricing**: Should prices change based on demand or time of day? yes we have discussed this
3. **Tax Handling**: How do you handle sales tax? we dont charge it, its included in our pricing
4. **Discount Strategy**: What's your discount strategy (first-time, referrals, etc.)? yeah first time, referrals for now to make it easy
5. **Fee Disclosure**: What fees should be shown vs. calculated later? fees should be clear up front and calculated for the client at the end of the booking process. we dont need to calculate milage or anything until the last steps of the booking process 

### **4. Cancellation Policy** ❌

#### **Current State**
- ✅ Basic policy defined
- ✅ Refund processing capability
- ✅ Cancellation tracking

#### **Missing/Needs Enhancement**
- ❌ **Automated Policy Enforcement**: Automatic fee calculation
- ❌ **Rescheduling Logic**: Clear rescheduling rules and fees
- ❌ **No-Show Handling**: Specific no-show policies
- ❌ **Weather Exceptions**: Weather-related cancellation handling
- ❌ **Customer Communication**: Automated cancellation notifications

#### **Questions for Business Decision**
1. **Cancellation Windows**: What are the specific time windows for different refund levels? clinets can request a refund but we will need to determine the reason for the refund before making a decision 
2. **Rescheduling Fees**: Do you charge for rescheduling? When? no but i dont want to have someone reschedule last minute so lets say the cut off is like 2-4 hours before the appointment 
3. **No-Show Policy**: What's your policy for no-shows? they lose the deposit 
4. **Weather Policy**: How do you handle weather-related cancellations? no charge 
5. **Communication**: How do you want to communicate cancellation policies? be clear and upfront. Cancellations allowed up to 2 hours before appointment without losing deposit

---

## 🛠️ **Implementation Roadmap**

### **Phase 1: Business Rules Definition** (Week 1)
1. **Gather Business Requirements**
   - Schedule planning session to answer key questions
   - Document current business practices
   - Define edge cases and exceptions

2. **Create Business Rules Engine**
   - Design flexible rules engine
   - Implement rule validation
   - Create admin interface for rule management

### **Phase 2: Service Area Enhancement** (Week 2)
1. **Extended Service Area Logic**
   - Implement zone-based pricing
   - Add maximum distance handling
   - Create fallback options

2. **Real-time Availability Integration**
   - Connect service area with notary availability
   - Implement dynamic service area based on notary location
   - Add weather impact logic

### **Phase 3: Document Limits Enhancement** (Week 3)
1. **Over-Limit Handling**
   - Implement pricing tiers for additional documents
   - Create exception handling process
   - Add document type restrictions

2. **Customer Communication**
   - Enhance booking flow with limit explanations
   - Add warning messages for approaching limits
   - Create educational content about document requirements

### **Phase 4: Pricing Transparency** (Week 4)
1. **Complete Fee Disclosure**
   - Show all fees upfront
   - Implement tax calculation
   - Add payment plan options

2. **Dynamic Pricing**
   - Implement demand-based pricing
   - Add time-of-day pricing
   - Create discount application logic

### **Phase 5: Cancellation Policy Automation** (Week 5)
1. **Policy Enforcement**
   - Automate cancellation fee calculation
   - Implement rescheduling logic
   - Add no-show handling

2. **Customer Communication**
   - Automated cancellation notifications
   - Clear policy communication
   - Weather exception handling

---

## 📋 **Required Business Decisions**

### **Immediate Decisions Needed**

#### **Service Area**
- [ ] Maximum service distance
- [ ] Zone-based pricing structure
- [ ] Weather impact on service area
- [ ] Extended service area pricing

#### **Document Limits**
- [ ] Over-limit pricing strategy
- [ ] Document type restrictions
- [ ] Exception handling process
- [ ] Communication strategy

#### **Pricing**
- [ ] Payment plan options
- [ ] Dynamic pricing strategy
- [ ] Tax handling approach
- [ ] Discount strategy

#### **Cancellation**
- [ ] Specific time windows for refunds
- [ ] Rescheduling fee structure
- [ ] No-show policy
- [ ] Weather exception policy

---

## 🎯 **Success Metrics**

### **Business Impact**
- **Reduced Booking Abandonment**: Clear pricing and policies
- **Improved Customer Satisfaction**: Transparent communication
- **Increased Revenue**: Optimized pricing and reduced cancellations
- **Operational Efficiency**: Automated policy enforcement

### **Technical Metrics**
- **System Performance**: <2s response time for pricing calculations
- **Error Rate**: <1% for business rule validation
- **Uptime**: 99.9% availability for booking system
- **Data Accuracy**: 100% accuracy for fee calculations

---

## 🚀 **Next Steps**

1. **Schedule Planning Session**: Meet to discuss business requirements
2. **Document Current Practices**: Capture existing business rules
3. **Define Edge Cases**: Identify special scenarios and exceptions
4. **Create Implementation Plan**: Detailed technical implementation
5. **Begin Development**: Start with business rules engine

---

## 📞 **Contact & Resources**

- **Technical Lead**: Development team
- **Business Stakeholder**: [Your Name]
- **Documentation**: This document and related SOP files
- **Code Repository**: Current implementation in `/lib/` and `/app/api/`

---

## 🔗 **GHL Web App Integration Architecture**

### **🎯 Integration Overview**

The business logic phase will seamlessly integrate with the existing comprehensive GHL infrastructure, creating a unified system where business rules automatically trigger appropriate GHL workflows and data management.

### **📊 Current GHL Infrastructure (Already Built)**

#### **✅ Existing Foundation**
- **4 Service-Specific Calendars**: Real-time availability checking
- **Complete API Layer**: Contact/appointment/workflow management  
- **30+ Automation Tags**: Status tracking and workflow triggers
- **10+ Workflows**: Payment follow-up, reminders, confirmations
- **7 Custom Fields**: Booking data storage and tracking
- **Sales Pipelines**: Lead management and conversion tracking
- **Webhook Processing**: Real-time event handling

#### **✅ Working Integration Points**
- **Contact Management**: Auto-create/update contacts from bookings
- **Appointment Booking**: Real GHL calendar integration
- **Payment Processing**: Stripe → GHL workflow automation  
- **Communication**: Email/SMS sequences via GHL workflows
- **Follow-up Systems**: Automated post-service and review requests

---

### **🛠️ Business Logic → GHL Integration Map**

#### **1. Service Area Validation + GHL** 📍

**Enhanced Integration:**
```typescript
// Service Area Business Logic → GHL Integration
const serviceAreaValidation = {
  maxDistance: 60, // miles (business decision)
  
  // GHL Integration Points:
  ghlIntegration: {
    // Tag customers by service area zone
    zoneTags: [
      'service_area:houston_metro',     // 0-30 miles
      'service_area:extended_range',    // 30-50 miles  
      'service_area:maximum_range'      // 50-60 miles
    ],
    
    // Custom fields for tracking
    customFields: {
      cf_service_distance: 'calculated_miles',
      cf_travel_fee: 'calculated_fee', 
      cf_service_zone: 'zone_classification'
    },
    
    // Workflow triggers
    workflows: {
      'distance_over_50_miles': 'GHL_EXTENDED_SERVICE_WORKFLOW_ID',
      'weather_cancellation': 'GHL_WEATHER_CANCELLATION_WORKFLOW_ID',
      'service_area_exceeded': 'GHL_OUT_OF_AREA_WORKFLOW_ID'
    }
  }
}
```

**GHL Automation:**
- **Distance Calculation** → Custom field update → Pricing workflow trigger
- **Zone Classification** → Automatic tagging → Specialized follow-up sequences
- **Extended Service** → Workflow trigger → Manual approval required
- **Weather Impact** → Manual cancellation → Automatic customer notification

#### **2. Document Limits + GHL** 📄

**Enhanced Integration:**
```typescript
// Document Limits Business Logic → GHL Integration  
const documentLimitsIntegration = {
  serviceLimits: {
    'STANDARD_NOTARY': { base: 2, extraFee: 5 },
    'EXTENDED_HOURS': { base: 5, extraFee: 7 }, 
    'LOAN_SIGNING': { base: 999, extraFee: 0 },
    'RON_SERVICES': { base: 10, extraFee: 5 }
  },
  
  // GHL Integration Points:
  ghlIntegration: {
    // Document tracking tags
    documentTags: [
      'docs:under_limit',
      'docs:over_limit', 
      'docs:restricted_type',
      'docs:extra_fees_applied'
    ],
    
    // Custom fields for tracking
    customFields: {
      cf_document_count: 'actual_count',
      cf_document_type: 'document_category',
      cf_extra_doc_fees: 'additional_charges',
      cf_document_restrictions: 'heloc_declined'
    },
    
    // Workflow triggers  
    workflows: {
      'documents_over_limit': 'GHL_EXTRA_DOCS_WORKFLOW_ID',
      'heloc_restriction': 'GHL_DOCUMENT_RESTRICTION_WORKFLOW_ID',
      'document_education': 'GHL_DOCUMENT_LIMITS_EDUCATION_ID'
    }
  }
}
```

**GHL Automation:**
- **Document Count Validation** → Custom field update → Extra fee calculation
- **HELOC Detection** → Restriction workflow → Alternative service suggestion
- **Limit Exceeded** → Customer education → Pricing adjustment approval
- **Document Type Tracking** → Service optimization → Future service recommendations

#### **3. Pricing Transparency + GHL** 💰

**Enhanced Integration:**
```typescript
// Pricing Transparency Business Logic → GHL Integration
const pricingTransparencyIntegration = {
  feeComponents: {
    baseService: 'service_specific_price',
    travelFee: 'distance_based_calculation', 
    extraDocuments: 'per_document_overage',
    timeBasedSurcharge: 'dynamic_pricing',
    discounts: 'first_time_referral_applied'
  },
  
  // GHL Integration Points:
  ghlIntegration: {
    // Pricing tracking tags
    pricingTags: [
      'pricing:base_service',
      'pricing:travel_fees_applied',
      'pricing:extra_doc_fees', 
      'pricing:discount_applied',
      'pricing:dynamic_pricing_active'
    ],
    
    // Custom fields for fee breakdown
    customFields: {
      cf_base_service_fee: 'service_cost',
      cf_travel_fee_amount: 'calculated_travel',
      cf_extra_doc_fees: 'additional_documents', 
      cf_discount_amount: 'applied_discounts',
      cf_final_total: 'complete_pricing',
      cf_fee_breakdown: 'detailed_calculation'
    },
    
    // Workflow triggers
    workflows: {
      'pricing_calculated': 'GHL_PRICING_CONFIRMATION_WORKFLOW_ID',
      'discount_applied': 'GHL_DISCOUNT_TRACKING_WORKFLOW_ID', 
      'dynamic_pricing': 'GHL_SURGE_PRICING_WORKFLOW_ID'
    }
  }
}
```

**GHL Automation:**
- **Fee Calculation** → Custom fields update → Confirmation email with breakdown
- **Discount Application** → Tag tracking → Referral program management
- **Dynamic Pricing** → Surge notification → Customer communication sequence
- **Payment Tracking** → Revenue analytics → Business intelligence reporting

#### **4. Cancellation Policy + GHL** ❌

**Enhanced Integration:**
```typescript
// Cancellation Policy Business Logic → GHL Integration
const cancellationPolicyIntegration = {
  policyRules: {
    fullRefund: 'more_than_2_hours_before',
    noRefund: 'less_than_2_hours_or_no_show',
    weatherException: 'full_refund_no_penalty',
    rescheduling: 'free_if_more_than_2_hours'
  },
  
  // GHL Integration Points:
  ghlIntegration: {
    // Cancellation tracking tags
    cancellationTags: [
      'cancellation:full_refund',
      'cancellation:no_refund',
      'cancellation:weather_exception',
      'cancellation:rescheduled',
      'cancellation:no_show'
    ],
    
    // Custom fields for tracking
    customFields: {
      cf_cancellation_reason: 'customer_reason',
      cf_cancellation_time: 'hours_before_appointment',
      cf_refund_amount: 'calculated_refund',
      cf_cancellation_fee: 'penalty_applied',
      cf_reschedule_count: 'number_of_reschedules'
    },
    
    // Workflow triggers
    workflows: {
      'cancellation_request': 'GHL_CANCELLATION_HANDLER_WORKFLOW_ID',
      'weather_cancellation': 'GHL_WEATHER_EXCEPTION_WORKFLOW_ID',
      'no_show': 'GHL_NO_SHOW_RECOVERY_WORKFLOW_ID',
      'reschedule_request': 'GHL_RESCHEDULE_HANDLER_WORKFLOW_ID'
    }
  }
}
```

**GHL Automation:**
- **Cancellation Request** → Policy calculation → Automatic refund processing
- **Weather Exception** → Full refund → Rescheduling assistance  
- **No-Show Detection** → Recovery workflow → Future booking prevention logic
- **Reschedule Requests** → Fee calculation → Calendar management automation

---

### **🔄 Implementation Strategy**

#### **Phase 1: Business Rules Engine Integration** (Week 1)
```typescript
// Create unified business rules engine that integrates with GHL
const businessRulesEngine = {
  serviceArea: {
    validate: (distance) => validateAndUpdateGHL(distance),
    updateGHL: (result) => triggerGHLWorkflow(result)
  },
  documentLimits: {
    validate: (count, type) => validateDocsAndUpdateGHL(count, type),
    calculateFees: (overage) => updateGHLPricing(overage)
  },
  pricing: {
    calculate: (components) => calculateAndUpdateGHL(components),
    applyDiscounts: (type) => updateGHLDiscounts(type)
  },
  cancellation: {
    process: (request) => processAndUpdateGHL(request),
    calculateRefund: (timing) => updateGHLRefund(timing)
  }
}
```

#### **Phase 2: Enhanced GHL Workflows** (Week 2-3)
- **Create 8 New Workflows** for business logic automation
- **Update Existing Workflows** to handle business rule decisions
- **Add Custom Fields** for business logic tracking
- **Implement Tags** for rule-based segmentation

#### **Phase 3: Real-time Integration** (Week 4-5)
- **Booking Flow Enhancement**: Real-time business rule validation
- **Dynamic Pricing**: Live fee calculation with GHL updates
- **Policy Enforcement**: Automated cancellation/reschedule handling
- **Customer Communication**: Rule-based messaging sequences

---

### **📊 Expected GHL Integration Benefits**

#### **Operational Efficiency**
- **95% Automation** of business rule enforcement
- **Real-time Policy Updates** without code changes
- **Automatic Customer Communication** for policy changes
- **Centralized Business Intelligence** via GHL reporting

#### **Customer Experience**
- **Transparent Pricing** with detailed breakdowns in GHL emails
- **Instant Policy Communication** via automated sequences  
- **Consistent Service Delivery** through rule enforcement
- **Proactive Issue Resolution** via automated workflows

#### **Business Intelligence**
- **Service Area Analytics** via GHL reporting
- **Document Type Tracking** for service optimization
- **Pricing Strategy Analysis** through GHL data
- **Cancellation Pattern Recognition** for policy refinement

---

### **🎯 Success Metrics**

**Business Logic + GHL Integration Success:**
- **100% Policy Compliance** through automated enforcement
- **<5 second response time** for business rule validation
- **90%+ Customer Satisfaction** with transparent policies  
- **50% Reduction** in manual policy decisions
- **Real-time Business Intelligence** via GHL dashboards

---

*This document will be updated as requirements are clarified and implementation progresses.* 