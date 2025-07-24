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
  - ≤1 document
  - ≤2 stamps
  - 1 signer included
  - 10-mile travel radius
  - Same-day available (before 3pm)
  - Fast turnaround
- **Badge**: Value

---

#### **2. STANDARD_NOTARY**
- **ID**: `STANDARD_NOTARY`
- **Name**: Standard Mobile Notary
- **Price**: $75.00
- **Description**: Professional document notarization during business hours
- **Hours**: 9am-5pm Mon-Fri
- **Features**:
  - ≤4 documents
  - ≤2 signers included
  - 20-mile travel radius
  - Professional notary service
  - Same-day available (before 3pm)
- **Badge**: Popular

---

#### **3. EXTENDED_HOURS**
- **ID**: `EXTENDED_HOURS`
- **Name**: Extended Hours Mobile
- **Price**: $100.00
- **Description**: Flexible scheduling & same-day service
- **Hours**: 7am-9pm Daily
- **Features**:
  - ≤4 documents
  - ≤2 signers included
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
- **Description**: Expert real estate closings with comprehensive service
- **Hours**: By appointment
- **Features**:
  - Single package (unlimited documents)
  - ≤4 signers
  - Print 2 sets included
  - ≤2 hours table time
  - FedEx drop included
  - 30-mile travel radius
  - Real estate expertise
  - Title company coordination
- **Badge**: Value

---

#### **5. RON_SERVICES**
- **ID**: `RON_SERVICES`
- **Name**: Remote Online Notarization (RON)
- **Price**: $25/session + $5/seal
- **Description**: Secure online notarization from anywhere
- **Hours**: 24/7 availability
- **Features**:
  - Credential Analysis included
  - KBA verification included
  - Audio-video recording
  - Texas statewide service
  - No travel required
  - Up to 10 documents
  - Proof.com platform
- **Badge**: Convenient

---

#### **6. BUSINESS_ESSENTIALS**
- **ID**: `BUSINESS_ESSENTIALS`
- **Name**: Business Subscription - Essentials
- **Price**: $125/month
- **Description**: Monthly business subscription with RON services
- **Hours**: 24/7 RON availability
- **Features**:
  - Up to 10 RON seals/month
  - 10% off mobile rates
  - Priority scheduling
  - Business support
  - Overage: $5/seal
- **Badge**: Business

---

#### **7. BUSINESS_GROWTH**
- **ID**: `BUSINESS_GROWTH`
- **Name**: Business Subscription - Growth
- **Price**: $349/month
- **Description**: Premium monthly business subscription
- **Hours**: 24/7 RON availability
- **Features**:
  - Up to 40 RON seals/month
  - 10% off mobile rates
  - 1 free loan signing
  - Premium business support
  - Overage: $4/seal
- **Badge**: Premium

---

## **🎯 SERVICE AREA CONFIGURATION**

### **Base Location**
- **ZIP Code**: 77591 (Pearland, TX)
- **Coordinates**: 29.4052, -94.9355

### **Service Radii**
| Service | Free Radius | Max Radius | Travel Fee |
|---------|-------------|------------|------------|
| Quick-Stamp Local | 10 miles | 30 miles | $0.50/mile |
| Standard Mobile | 20 miles | 50 miles | $0.50/mile |
| Extended Hours | 30 miles | 50 miles | $0.50/mile |
| Loan Signing | 30 miles | 50 miles | $0.50/mile |
| RON Services | 0 miles | 0 miles | N/A |

---

## **💰 PRICING STRUCTURE**

### **Base Service Pricing**
| Service | Base Price | Extra Documents | Extra Signers | Travel Fee |
|---------|------------|-----------------|---------------|------------|
| Quick-Stamp Local | $50 | $5/stamp | $10 | $0.50/mile |
| Standard Mobile | $75 | $10 | $5 | $0.50/mile |
| Extended Hours | $100 | $10 | $5 | $0.50/mile |
| Loan Signing | $150 | Unlimited | Included | $0.50/mile |
| RON Services | $25 + $5/seal | $5 | $10 | N/A |

### **Time-Based Surcharges**
- **Same-day service**: +$25 (after 3pm)
- **Weekend service**: +$40
- **Night service (9pm-7am)**: +$50
- **Holiday service**: +$50

### **Business Subscription Pricing**
- **Essentials**: $125/month (10 RON seals, 10% off mobile)
- **Growth**: $349/month (40 RON seals, 10% off mobile, 1 free loan signing)

---

## **📋 DOCUMENT LIMITS**

### **Included Documents by Service**
| Service | Base Documents | Extra Fee | Notes |
|---------|----------------|-----------|-------|
| Quick-Stamp Local | 1 | $5/stamp | ≤2 stamps included |
| Standard Mobile | 4 | $10 | Standard notarization |
| Extended Hours | 4 | $10 | Extended availability |
| Loan Signing | Unlimited | $0 | Within session |
| RON Services | 10 | $5 | Per session |

---

## **🔄 IMPLEMENTATION CHECKLIST**

### **Frontend Components**
- [ ] ServiceSelector component updated
- [ ] PricingCalculator component updated
- [ ] BookingWizard component updated
- [ ] Service cards updated

### **Backend APIs**
- [ ] Pricing engine updated
- [ ] Service mapping updated
- [ ] GHL integration updated
- [ ] Database schema updated

### **Documentation**
- [ ] SOP_ENHANCED.md updated
- [ ] fee-schedule.md updated
- [ ] Blog post updated
- [ ] API documentation updated

### **Testing**
- [ ] Unit tests updated
- [ ] Integration tests updated
- [ ] E2E tests updated
- [ ] Pricing calculations verified

---

## **✅ COMPLIANCE NOTES**

### **Texas Notary Law Compliance**
- All pricing complies with Texas Government Code §406.024
- RON pricing follows Texas Gov't Code §406.111
- Service fees separate from statutory notarial fees
- Clear fee disclosure maintained

### **Business Rules Compliance**
- Service areas match business requirements
- Document limits align with operational capacity
- Pricing structure supports business model
- GHL integration maintains workflow automation

---

**Last Updated**: January 2024
**Version**: 2.0
**Status**: Production Ready 