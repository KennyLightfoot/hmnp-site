# CodeRabbit SOP Reference - Authoritative Requirements

## 🎯 **CRITICAL: Use SOP_ENHANCED.md as Authoritative Source**

This file provides CodeRabbit with the exact requirements from `SOP_ENHANCED.md` for compliance checking.

## 📋 **SERVICE TYPE REQUIREMENTS (SOP Section 1.1)**

### **APPROVED Service Types (ONLY THESE ARE ALLOWED):**
1. **standard-notary**: Standard Notary Services
   - Hours: 9am-5pm Mon-Fri
   - Price: $75 starting
   - Radius: 15-mile from ZIP 77591
   - Capacity: up to 2 documents, 1-2 signers

2. **extended-hours-notary**: Extended Hours Notary  
   - Hours: 7am-9pm Daily
   - Price: $100 flat fee
   - Radius: 20-mile from ZIP 77591
   - Capacity: up to 5 documents, 2 signers

3. **loan-signing-specialist**: Loan Signing Specialist
   - Price: $150 flat fee
   - Capacity: unlimited documents, up to 4 signers
   - Duration: 90-minute session
   - Scheduling: By appointment

4. **specialty-notary-service**: Specialty Notary Service
   - Variable pricing and requirements

### **FORBIDDEN Service Types (MUST BE REMOVED):**
- ❌ "essential" (use "standard-notary" instead)
- ❌ "priority" (use "extended-hours-notary" instead)  
- ❌ "basic" (not SOP compliant)
- ❌ "premium" (not SOP compliant)
- ❌ "loan-signing" (use "loan-signing-specialist" instead)

## 🏗️ **CRITICAL IMPLEMENTATION REQUIREMENTS**

### **1. Enhanced Booking Flow (SOP Section 1.2.1)**
- **REQUIRED**: `/booking/enhanced` directory with real-time pricing
- **REQUIRED**: Multi-step booking flow
- **REQUIRED**: Google Maps API integration for distance calculation
- **REQUIRED**: Service area geofencing

### **2. Service Area Compliance (SOP Section 1.2)**
- **Base Location**: ZIP code 77591
- **Standard Notary**: 15-mile radius
- **Extended Hours**: 20-mile radius  
- **Extended Travel Fee**: $0.50/mile beyond primary service area
- **REQUIRED**: Automated distance calculation

### **3. Pricing Compliance (SOP Section 8.4)**
- **Standard Notary**: $75 starting price
- **Extended Hours**: $100 flat fee
- **Loan Signing**: $150 flat fee
- **Travel Fee**: $0.50/mile beyond included radius

### **4. System Architecture (SOP Section 9)**
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (Upstash)
- **Payments**: Stripe integration
- **CRM**: GoHighLevel (GHL) integration

## 🚨 **BLOCKING DEPLOYMENT CRITERIA**

### **Service Type Violations:**
- Any use of forbidden service types = CRITICAL BLOCKER
- Missing SOP-compliant service types = HIGH PRIORITY
- Incorrect pricing for service types = HIGH PRIORITY

### **Architecture Violations:**
- Missing `/booking/enhanced` = CRITICAL BLOCKER  
- Hardcoded service areas instead of ZIP 77591 calculations = HIGH PRIORITY
- Missing real-time pricing = HIGH PRIORITY
- Duplicate pricing logic across files = MEDIUM PRIORITY

### **Technical Violations:**
- Not using Next.js 15+ App Router = HIGH PRIORITY
- Missing TypeScript strict mode = MEDIUM PRIORITY
- Security vulnerabilities = CRITICAL BLOCKER

## ✅ **SUCCESS CRITERIA**

The system is deployment-ready ONLY when:
1. **100% SOP Compliance**: All service types match SOP_ENHANCED.md
2. **Enhanced Booking**: /booking/enhanced implemented with real-time pricing
3. **Service Areas**: Proper 15/20-mile radius enforcement from ZIP 77591
4. **Pricing**: Exact SOP pricing ($75/$100/$150) implemented
5. **Architecture**: Next.js 15+ with proper patterns
6. **Zero Critical Issues**: No security vulnerabilities or blocking bugs

## 📊 **CODERABBIT ANALYSIS INSTRUCTIONS**

When analyzing this codebase:

1. **First Priority**: Check service type compliance against this reference
2. **Second Priority**: Verify enhanced booking flow exists and works
3. **Third Priority**: Validate service area and pricing calculations
4. **Fourth Priority**: Review architecture and code quality
5. **Final Priority**: Identify duplicate code and optimization opportunities

**Remember**: SOP_ENHANCED.md is the authoritative source. Any deviation from these requirements is a compliance violation that must be flagged. 