# 🚀 GHL Master Workflow Setup Guide

**The Complete Guide to GoHighLevel Integration for Houston Mobile Notary Pros**

---

## 🎯 **Overview**

This is your **single source of truth** for setting up GoHighLevel workflows. This guide consolidates all GHL documentation and provides step-by-step instructions for complete automation setup.

---

## 📋 **Prerequisites**

### **Environment Variables Required**
```bash
# Add to your .env file
GHL_API_KEY=your_private_integration_token_here
GHL_LOCATION_ID=your_location_id_here
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28
GHL_WEBHOOK_SECRET=your_secure_webhook_secret
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 🚀 **Quick Setup (Automated)**

### **Step 1: Run Complete Setup**
```bash
# This runs everything automatically
node scripts/setup-ghl-complete.js
```

This creates:
- ✅ 7 Custom fields
- ✅ 10+ Automation tags  
- ✅ Complete sales pipeline
- ✅ Webhook configuration
- ✅ API connection verification

### **Step 2: Import Workflows**
1. Go to GHL → Automation → Workflows
2. Import each JSON file from `docs/workflows/`
3. Activate each workflow after import

---

## 📱 **Core Workflows to Import**

### **1. Payment Follow-Up** (`payment-follow-up.json`)
- **Trigger:** `status:booking_pendingpayment`
- **Purpose:** Automated payment reminders
- **Actions:**
  - Send payment reminder email
  - Schedule follow-up SMS
  - Escalate to phone call after 48 hours
  - Cancel booking after 72 hours

### **2. Booking Confirmation** (`confirmation-reminders.json`)
- **Trigger:** `status:booking_confirmed`
- **Purpose:** Confirmation and reminder system
- **Actions:**
  - Send booking confirmation email
  - Schedule 24-hour reminder
  - Schedule 2-hour reminder
  - Prepare for service completion

### **3. Phone-to-Booking Conversion** (`phone-to-booking.json`)
- **Trigger:** `lead:phone_qualified`
- **Purpose:** Convert phone calls to bookings
- **Actions:**
  - Create booking record via API
  - Send payment link
  - Schedule follow-up
  - Track conversion metrics

### **4. Emergency Service Response** (`emergency-service.json`)
- **Trigger:** `Service:Emergency` or `Service:Extended_Hours_Same_Day`
- **Purpose:** Handle urgent requests
- **Actions:**
  - Immediate notification to notary
  - Priority scheduling
  - Rush fee application
  - Expedited confirmation

### **5. No-Show Recovery** (`no-show-recovery.json`)
- **Trigger:** `status:no_show`
- **Purpose:** Re-engage missed appointments
- **Actions:**
  - Send apology email
  - Offer rescheduling discount
  - Track no-show patterns
  - Follow up for feedback

### **6. Post-Service Follow-Up** (`post-service-follow-up.json`)
- **Trigger:** `status:service_completed`
- **Purpose:** Customer satisfaction and reviews
- **Actions:**
  - Send service completion email
  - Request Google review
  - Offer future service discount
  - Track customer satisfaction

---

## 🔄 **Key API Integration Points**

### **Website → GHL Flow**
1. **Booking Form Submission** → Creates contact with `new_lead` tag
2. **Payment Completion** → Triggers `status:booking_confirmed`
3. **Payment Pending** → Triggers `status:booking_pendingpayment`

### **Phone Call → GHL Flow**
1. **Phone Qualification** → Add `lead:phone_qualified` tag
2. **Booking Creation** → API creates booking via `/api/bookings/sync`
3. **Payment Link** → Automatic payment link generation

---

## 🎯 **Expected Results**

### **Revenue Impact**
- **85-95% payment completion rate** (vs 70% without automation)
- **80-95% phone/form conversion rate**
- **50% reduction in manual follow-up time**

### **Customer Experience**
- **Automated 24/7 response** to inquiries
- **Consistent communication** at every touchpoint
- **Professional follow-up** after service completion

---

## 🚨 **Troubleshooting**

### **Test API Connection**
```bash
node scripts/test-ghl-connection.js
```

### **Check Custom Fields**
```bash
node scripts/check-ghl-custom-fields.js
```

### **Re-run Setup**
```bash
node scripts/setup-ghl-complete.js
```

---

**🎉 You're Ready!**

This guide provides everything you need for complete GHL automation. Follow the quick setup for automated installation, then import the workflow templates from `docs/workflows/`.

Your Houston Mobile Notary business will now run with enterprise-level automation! 🚀 