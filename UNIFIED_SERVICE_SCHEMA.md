# **UNIFIED SERVICE SCHEMA - SINGLE SOURCE OF TRUTH**
## Houston Mobile Notary Pros - Service Standardization

### **🎯 UNIFIED SERVICE STRUCTURE (7 Services)**

Based on the comprehensive ServiceSelector frontend component, these 7 services will be the **single source of truth** across the entire system:

---

#### **1. QUICK_STAMP_LOCAL**
- **ID**: `QUICK_STAMP_LOCAL`
- **Name**: Quick-Stamp Local
- **Price**: $50.00
- **Description**: Fast & simple local signings for routine documents
- **Hours**: 9am-5pm Mon-Fri
- **Features**:
  - ≤ 1 document
  - 1 signer included
  - 10-mile travel radius
  - Same-day available (before 3pm)
  - Fast turnaround
- **Badge**: Value

---

#### **2. STANDARD_NOTARY**
- **ID**: `STANDARD_NOTARY`
- **Name**: Standard Notary
- **Price**: $75.00
- **Description**: Perfect for routine document notarization during business hours
- **Hours**: 9am-5pm Mon-Fri
- **Features**:
  - Up to 2 documents
  - 1-2 signers included
  - 30-mile travel radius
  - Professional notary service
  - Same-day available (before 3pm)
- **Badge**: Popular

---

#### **3. EXTENDED_HOURS**
- **ID**: `EXTENDED_HOURS`
- **Name**: Extended Hours
- **Price**: $100.00
- **Description**: Extended availability for urgent needs and after-hours appointments
- **Hours**: 7am-9pm Daily
- **Features**:
  - Up to 5 documents
  - 2 signers included
  - 30-mile travel radius
  - Same-day guarantee
  - Evening appointments
  - Weekend availability
- **Badge**: Recommended

---

#### **4. LOAN_SIGNING**
- **ID**: `LOAN_SIGNING`
- **Name**: Loan Signing Specialist
- **Price**: $150.00
- **Description**: Specialized expertise for loan documents and real estate transactions
- **Hours**: By appointment
- **Features**:
  - Unlimited documents
  - Up to 4 signers
  - 90-minute session
  - Real estate expertise
  - Title company coordination
  - 30-mile travel radius
- **Badge**: Value

---

#### **5. RON_SERVICES**
- **ID**: `RON_SERVICES`
- **Name**: Remote Online Notarization
- **Price**: $35.00
- **Description**: Secure remote notarization from anywhere, available 24/7
- **Hours**: 24/7 Availability
- **Features**:
  - Remote service
  - No travel required
  - Up to 10 documents
  - Secure digital process
  - Immediate availability
  - Proof.com platform

---

#### **6. BUSINESS_ESSENTIALS**
- **ID**: `BUSINESS_ESSENTIALS`
- **Name**: Business Subscription - Essentials
- **Price**: $125.00
- **Description**: Monthly subscription for regular business notarization needs
- **Hours**: 24/7 RON availability
- **Features**:
  - Up to 10 RON seals/month
  - 10% off mobile rates
  - Monthly billing
  - Priority support
  - Remote service
  - No travel required
- **Badge**: Recommended

---

#### **7. BUSINESS_GROWTH**
- **ID**: `BUSINESS_GROWTH`
- **Name**: Business Subscription - Growth
- **Price**: $349.00
- **Description**: Premium monthly subscription for high-volume business needs
- **Hours**: 24/7 RON availability
- **Features**:
  - Up to 40 RON seals/month
  - 10% off mobile rates
  - 1 free loan signing/month
  - Monthly billing
  - Priority support
  - Remote service
  - Account manager
- **Badge**: Value

---

## **🔧 IMPLEMENTATION REQUIREMENTS**

### **Database Schema Updates**
1. **Update ServiceType enum** to include all 7 service IDs
2. **Remove unused enum values** (SPECIALTY_NOTARY_SERVICE, BUSINESS_SOLUTIONS, SUPPORT_SERVICE)
3. **Update existing services** to match unified schema
4. **Add missing services** (QUICK_STAMP_LOCAL, BUSINESS_ESSENTIALS, BUSINESS_GROWTH)

### **API Updates**
1. **Update availability API** to support all 7 service types
2. **Update pricing API** to calculate correctly for all services
3. **Update GHL calendar mapping** for each service type
4. **Update business rules** to handle subscription services

### **Frontend Updates**
1. **Update SimpleBookingForm** to show all 7 services (optional)
2. **Ensure ServiceSelector** remains the master reference
3. **Update any hardcoded service references**
4. **Test all booking flows** for each service type

---

## **📋 MIGRATION PLAN**

### **Phase 1: Database Schema**
- [ ] Update Prisma schema ServiceType enum
- [ ] Generate and apply migration
- [ ] Update seed script with 7 services

### **Phase 2: API Integration**
- [ ] Update availability endpoint validation
- [ ] Update pricing calculations
- [ ] Update GHL calendar mappings
- [ ] Test all service types

### **Phase 3: Frontend Consistency**
- [ ] Audit all service references
- [ ] Update SimpleBookingForm (if desired)
- [ ] Test complete booking flows
- [ ] Verify pricing displays correctly

### **Phase 4: Testing & Validation**
- [ ] End-to-end testing for each service
- [ ] Verify GHL integration works
- [ ] Confirm pricing accuracy
- [ ] Document final service structure

---

## **🚨 BREAKING CHANGES**

**ServiceType Enum Changes:**
- `EXTENDED_HOURS_NOTARY` → `EXTENDED_HOURS`
- `LOAN_SIGNING_SPECIALIST` → `LOAN_SIGNING`
- Remove: `SPECIALTY_NOTARY_SERVICE`, `BUSINESS_SOLUTIONS`, `SUPPORT_SERVICE`
- Add: `QUICK_STAMP_LOCAL`, `BUSINESS_ESSENTIALS`, `BUSINESS_GROWTH`

**Service ID Standardization:**
All service IDs will match exactly between frontend, database, and API endpoints.

---

## **✅ SUCCESS CRITERIA**

1. **Single Source of Truth**: All components use identical service definitions
2. **API Consistency**: All endpoints support the same 7 service types  
3. **Database Alignment**: Database services match frontend exactly
4. **GHL Integration**: All services have proper calendar mappings
5. **End-to-End Testing**: Complete booking flow works for all 7 services

---

*This document serves as the definitive reference for service standardization across the Houston Mobile Notary Pros platform.* 