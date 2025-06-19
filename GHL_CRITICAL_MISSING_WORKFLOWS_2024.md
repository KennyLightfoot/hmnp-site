# 🚨 **CRITICAL MISSING WORKFLOWS FOR HMNP**
**Essential Workflows to Complete Your Automation System**

> **🎯 PURPOSE:** These workflows fill critical gaps in your current automation, handling payment confirmations, failed payments, cancellations, and service completion tracking.

## 📋 **IMPLEMENTATION PRIORITY**

### **🔴 WEEK 1 - CRITICAL REVENUE WORKFLOWS**
1. **Payment Completed Workflow** ⭐⭐⭐⭐⭐ - Transitions bookings from pending to confirmed
2. **Failed Payment Recovery** ⭐⭐⭐⭐⭐ - Recovers failed Stripe payments
3. **Booking Cancellation Handler** ⭐⭐⭐⭐ - Manages cancellations and refunds

### **🟡 WEEK 2 - OPERATIONAL WORKFLOWS**
4. **Service Completion Tracker** ⭐⭐⭐⭐ - Post-service automation
5. **Booking Rescheduling System** ⭐⭐⭐ - Handles appointment changes
6. **Pre-Appointment Document Collection** ⭐⭐⭐ - Ensures preparedness

### **🟢 WEEK 3 - GROWTH WORKFLOWS**
7. **Expired Quote Recovery** ⭐⭐ - Converts abandoned quotes
8. **Customer Retention Campaign** ⭐⭐ - Encourages repeat business

---

## 💳 **WORKFLOW 1: PAYMENT COMPLETED HANDLER** ⭐⭐⭐⭐⭐
**This is THE most critical missing piece - without it, customers stay in payment_pending forever!**

### **Prerequisites:**
1. Create Stripe webhook endpoint at `/api/webhooks/stripe`
2. Configure webhook in Stripe Dashboard
3. Add webhook secret to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### **Step 1: Create the Workflow**
1. **Go to:** Automations → Workflows → Create New Workflow
2. **Name:** `💳 Payment Completed - Transition to Confirmed`
3. **Trigger:** Contact Tagged
4. **Tag:** `status:payment_completed`

### **Step 2: Remove from Payment Pending Workflow**
1. **Add Action:** Remove from Workflow
2. **Select Workflow:** "💳 Enhanced Payment Follow-up System"
3. **Purpose:** Stop payment reminders immediately

### **Step 3: Update Contact Status**
1. **Add Action:** Remove Tag
2. **Tag:** `status:booking_pendingpayment`

3. **Add Action:** Add Tag
4. **Tag:** `status:booking_confirmed`

### **Step 4: Send Payment Confirmation Email**
1. **Add Action:** Send Email
2. **Subject:** `✅ Payment Received - Your Appointment is Confirmed!`
3. **Email Body:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px;">
    <h2 style="color: #4caf50; margin-top: 0;">✅ Payment Confirmed!</h2>
    
    <p>Hi {{contact.firstName}},</p>
    
    <p>Great news! Your payment has been processed successfully.</p>
    
    <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <h3 style="margin-top: 0;">PAYMENT DETAILS:</h3>
      <p><strong>💰 Amount Paid:</strong> ${{contact.custom_fields.payment_amount}}<br>
      <strong>📋 Service:</strong> {{contact.custom_fields.service_requested}}<br>
      <strong>📅 Date:</strong> {{contact.custom_fields.appointment_date}}<br>
      <strong>🕐 Time:</strong> {{contact.custom_fields.appointment_time}}<br>
      <strong>📍 Location:</strong> {{contact.custom_fields.service_address}}</p>
    </div>
    
    <p><strong>What's Next:</strong></p>
    <ul>
      <li>You'll receive reminders 24 hours and 2 hours before</li>
      <li>I'll text when I'm on my way</li>
      <li>Please have your ID and documents ready</li>
    </ul>
    
    <p>Thank you for your business!</p>
    
    <p>Best regards,<br>
    Kenneth Lightfoot<br>
    Houston Mobile Notary Pros<br>
    832-617-4285</p>
  </div>
</div>
```

### **Step 5: SMS Confirmation (if opted in)**
1. **Add Action:** If/Else
2. **Condition:** Contact has tag `Consent:SMS_Opt_In`
3. **IF YES:** Send SMS
```
✅ Payment confirmed! Your {{contact.custom_fields.service_requested}} appointment is locked in for {{contact.custom_fields.appointment_date}} at {{contact.custom_fields.appointment_time}}.

I'll send reminders as we get closer.

-Kenneth, HMNP
```

### **Step 6: Add to Booking Reminder Workflow**
1. **Add Action:** Add to Workflow
2. **Select Workflow:** "✅ Complete Booking & Reminder System"
3. **Purpose:** Start appointment reminders

### **Step 7: Create Calendar Event Task**
1. **Add Action:** Create Task
2. **Title:** `📅 Add to Calendar: {{contact.firstName}} - PAID`
3. **Description:**
```
Payment completed for:
Client: {{contact.firstName}} {{contact.lastName}}
Service: {{contact.custom_fields.service_requested}}
Date/Time: {{contact.custom_fields.appointment_date}} at {{contact.custom_fields.appointment_time}}
Location: {{contact.custom_fields.service_address}}
Amount Paid: ${{contact.custom_fields.payment_amount}}

☐ Verify calendar event created
☐ Check for any special instructions
```
4. **Due Date:** Now
5. **Assigned To:** Kenneth Lightfoot

### **Step 8: Update Custom Fields**
1. **Add Action:** Update Contact Field
2. **Field:** `cf_payment_date`
3. **Value:** `{{current_date}}`

4. **Add Action:** Update Contact Field
5. **Field:** `cf_booking_status`
6. **Value:** `CONFIRMED`

---

## 🔄 **WORKFLOW 2: FAILED PAYMENT RECOVERY** ⭐⭐⭐⭐⭐
**Critical for recovering revenue from payment failures**

### **Step 1: Create the Workflow**
1. **Name:** `🚨 Failed Payment Recovery System`
2. **Trigger:** Contact Tagged
3. **Tag:** `payment:failed`

### **Step 2: Categorize Urgency**
1. **Add Action:** If/Else (Multiple Branches)
2. **Branch 1:** Appointment date is today → Add tag `payment_failed:urgent`
3. **Branch 2:** Appointment date is tomorrow → Add tag `payment_failed:high`
4. **Default:** Add tag `payment_failed:standard`

### **Step 3: Send Failed Payment Email**
1. **Add Action:** Send Email
2. **Subject:** `⚠️ Payment Failed - Action Required for Your Appointment`
3. **Email Body:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px;">
    <h2 style="color: #856404; margin-top: 0;">⚠️ Payment Issue - Quick Fix Needed</h2>
    
    <p>Hi {{contact.firstName}},</p>
    
    <p>Your payment for the upcoming notary appointment couldn't be processed. This often happens due to:</p>
    <ul>
      <li>Insufficient funds</li>
      <li>Card expiration</li>
      <li>Bank security holds</li>
    </ul>
    
    <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 2px solid #ffc107;">
      <h3 style="margin-top: 0;">🔧 FIX IT NOW:</h3>
      <p style="text-align: center;">
        <a href="{{contact.custom_fields.payment_url}}" style="display: inline-block; background-color: #ffc107; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">RETRY PAYMENT</a>
      </p>
      <p><strong>Appointment:</strong> {{contact.custom_fields.appointment_date}} at {{contact.custom_fields.appointment_time}}<br>
      <strong>Amount:</strong> ${{contact.custom_fields.payment_amount}}</p>
    </div>
    
    <p style="color: #856404;"><strong>⏰ Time Sensitive:</strong> Please complete payment ASAP to keep your appointment.</p>
    
    <p>Need help? Call/text 832-617-4285</p>
    
    <p>Best regards,<br>
    Kenneth Lightfoot</p>
  </div>
</div>
```

### **Step 4: Urgent SMS (if appointment within 48 hours)**
1. **Add Action:** If/Else
2. **Condition:** Contact has tag `payment_failed:urgent` OR `payment_failed:high`
3. **IF YES AND has SMS consent:** Send SMS
```
⚠️ URGENT: Payment failed for your notary appointment {{contact.custom_fields.appointment_date}}.

Fix now to keep your slot: {{contact.custom_fields.payment_url}}

Need help? Call 832-617-4285

-Kenneth, HMNP
```

### **Step 5: Create Urgent Task**
1. **Add Action:** If/Else
2. **Condition:** Contact has tag `payment_failed:urgent`
3. **IF YES:** Create Task
4. **Title:** `🚨 PAYMENT FAILED - TODAY'S APPOINTMENT: {{contact.firstName}}`
5. **Description:**
```
⚡ URGENT: Payment failed for TODAY's appointment!

Client: {{contact.firstName}} {{contact.lastName}}
Phone: {{contact.phone}}
Service: {{contact.custom_fields.service_requested}}
Time: {{contact.custom_fields.appointment_time}}
Amount: ${{contact.custom_fields.payment_amount}}

IMMEDIATE ACTIONS:
1. Call client NOW
2. Process payment over phone
3. Confirm appointment status
```
6. **Due Date:** Now
7. **Priority:** Urgent

### **Step 6: Schedule Follow-ups**
1. **Add Action:** Wait - 2 hours
2. **Add Action:** If/Else
3. **Condition:** Contact does NOT have tag `status:payment_completed`
4. **IF YES:** Send second attempt email/SMS

5. **Add Action:** Wait - 12 hours
6. **Add Action:** If/Else
7. **Condition:** Contact does NOT have tag `status:payment_completed`
8. **IF YES:** 
   - Send final notice
   - Create task to call
   - Add tag `payment:requires_manual_intervention`

---

## ❌ **WORKFLOW 3: BOOKING CANCELLATION HANDLER** ⭐⭐⭐⭐
**Manages cancellations professionally and processes refunds**

### **Step 1: Create the Workflow**
1. **Name:** `❌ Booking Cancellation Handler`
2. **Trigger:** Contact Tagged
3. **Tag:** `action:cancellation_requested`

### **Step 2: Stop All Active Workflows**
1. **Add Action:** Remove from Workflow
2. **Select:** "💳 Enhanced Payment Follow-up System"

3. **Add Action:** Remove from Workflow
4. **Select:** "✅ Complete Booking & Reminder System"

### **Step 3: Send Cancellation Confirmation**
1. **Add Action:** Send Email
2. **Subject:** `Cancellation Confirmed - We're Sorry to See You Go`
3. **Email Body:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 20px;">
    <h2 style="color: #c62828; margin-top: 0;">Cancellation Confirmed</h2>
    
    <p>Hi {{contact.firstName}},</p>
    
    <p>Your notary appointment has been cancelled as requested.</p>
    
    <div style="background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <p><strong>Cancelled Appointment:</strong><br>
      📅 Date: {{contact.custom_fields.appointment_date}}<br>
      🕐 Time: {{contact.custom_fields.appointment_time}}<br>
      📋 Service: {{contact.custom_fields.service_requested}}</p>
    </div>
    
    <p><strong>Refund Information:</strong><br>
    If you paid for this appointment, a refund will be processed within 5-7 business days.</p>
    
    <p>We hope to serve you in the future. If you cancelled due to an issue we could address, please let us know.</p>
    
    <p>Best regards,<br>
    Kenneth Lightfoot<br>
    Houston Mobile Notary Pros</p>
  </div>
</div>
```

### **Step 4: Update Status Tags**
1. **Add Action:** Remove Tag - `status:booking_confirmed`
2. **Add Action:** Remove Tag - `status:booking_pendingpayment`
3. **Add Action:** Add Tag - `status:booking_cancelled`

### **Step 5: Create Refund Task**
1. **Add Action:** Create Task
2. **Title:** `💳 Process Refund: {{contact.firstName}} - ${{contact.custom_fields.payment_amount}}`
3. **Description:**
```
Cancellation processed for:
Client: {{contact.firstName}} {{contact.lastName}}
Original Date: {{contact.custom_fields.appointment_date}}
Amount to Refund: ${{contact.custom_fields.payment_amount}}
Booking ID: {{contact.custom_fields.booking_id}}

Actions Required:
☐ Process refund in Stripe
☐ Update booking status in system
☐ Remove from calendar
☐ Send refund confirmation
```
4. **Due Date:** Now
5. **Priority:** High

### **Step 6: Update Custom Fields**
1. **Add Action:** Update Contact Field
2. **Field:** `cf_last_cancellation_date`
3. **Value:** `{{current_date}}`

---

## ✅ **WORKFLOW 4: SERVICE COMPLETION TRACKER** ⭐⭐⭐⭐
**Triggers post-service workflows and tracks completions**

### **Step 1: Create the Workflow**
1. **Name:** `✅ Service Completion Tracker`
2. **Trigger:** Contact Tagged
3. **Tag:** `status:service_completed`

### **Step 2: Update Booking Status**
1. **Add Action:** Remove Tag - `status:booking_confirmed`
2. **Add Action:** Update Contact Field - `cf_last_booking_status` = `COMPLETED`
3. **Add Action:** Update Contact Field - `cf_service_date` = `{{current_date}}`

### **Step 3: Calculate and Update Stats**
1. **Add Action:** Custom Code
2. **Action Name:** "Update Customer Lifetime Value"
3. **Code:**
```javascript
// Update lifetime value and service count
const currentLTV = parseFloat(contact.customField('cf_lifetime_value') || '0');
const serviceAmount = parseFloat(inputData.service_amount || contact.customField('payment_amount') || '0');
const newLTV = currentLTV + serviceAmount;

if (typeof contact !== 'undefined') {
  contact.customField('cf_lifetime_value', newLTV.toFixed(2));
  
  // Update last service type
  const serviceType = contact.customField('service_requested') || '';
  contact.customField('cf_last_service_type', serviceType);
  contact.customField('cf_last_service_type_friendly_name', serviceType);
}

return {
  success: true,
  previousLTV: currentLTV,
  newLTV: newLTV,
  serviceAmount: serviceAmount
};
```

### **Step 4: Trigger Post-Service Follow-up**
1. **Add Action:** Add to Workflow
2. **Select:** "🔄 Post-Service Follow-up & Review Request"

### **Step 5: Schedule Retention Check**
1. **Add Action:** Wait - 180 days
2. **Add Action:** Add Tag - `retention:6_month_check`
3. **Purpose:** Trigger retention campaign

---

## 🔄 **WORKFLOW 5: BOOKING RESCHEDULING SYSTEM** ⭐⭐⭐
**Handles appointment changes smoothly**

### **Step 1: Create the Workflow**
1. **Name:** `🔄 Booking Reschedule Handler`
2. **Trigger:** Contact Tagged
3. **Tag:** `action:reschedule_requested`

### **Step 2: Pause Current Reminders**
1. **Add Action:** Remove from Workflow
2. **Select:** "✅ Complete Booking & Reminder System"

### **Step 3: Send Reschedule Confirmation**
1. **Add Action:** Send Email
2. **Subject:** `🔄 Reschedule Request Received`
3. **Email Body:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px;">
    <h2 style="color: #1976d2; margin-top: 0;">🔄 Reschedule Request Received</h2>
    
    <p>Hi {{contact.firstName}},</p>
    
    <p>I've received your request to reschedule your notary appointment.</p>
    
    <div style="background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px;">
      <p><strong>Current Appointment:</strong><br>
      📅 {{contact.custom_fields.appointment_date}} at {{contact.custom_fields.appointment_time}}</p>
    </div>
    
    <p><strong>Next Steps:</strong></p>
    <ol>
      <li>I'll call you within 2 hours to discuss new times</li>
      <li>Or you can call me now at 832-617-4285</li>
      <li>Once we agree on a new time, I'll send confirmation</li>
    </ol>
    
    <p>Your payment will automatically apply to the new appointment.</p>
    
    <p>Best regards,<br>
    Kenneth Lightfoot</p>
  </div>
</div>
```

### **Step 4: Create Urgent Task**
1. **Add Action:** Create Task
2. **Title:** `🔄 RESCHEDULE: {{contact.firstName}} - Call Required`
3. **Description:**
```
Client needs to reschedule:
Name: {{contact.firstName}} {{contact.lastName}}
Phone: {{contact.phone}}
Current: {{contact.custom_fields.appointment_date}} at {{contact.custom_fields.appointment_time}}
Service: {{contact.custom_fields.service_requested}}

Actions:
☐ Call within 2 hours
☐ Discuss available times
☐ Update booking in system
☐ Send new confirmation
☐ Re-add to reminder workflow
```
4. **Due Date:** Now + 2 hours
5. **Priority:** High

### **Step 5: Update Fields**
1. **Add Action:** Update Contact Field
2. **Field:** `cf_last_reschedule_date`
3. **Value:** `{{current_date}}`

---

## 📄 **WORKFLOW 6: PRE-APPOINTMENT DOCUMENT COLLECTION** ⭐⭐⭐
**Ensures customers are prepared with required documents**

### **Step 1: Create the Workflow**
1. **Name:** `📄 Pre-Appointment Document Check`
2. **Trigger:** Time-based (3 days before appointment)
3. **Entry:** From booking confirmation workflow

### **Step 2: Send Document Checklist Email**
1. **Add Action:** Send Email
2. **Subject:** `📄 Document Checklist for Your Notary Appointment`
3. **Email Body:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #f3e5f5; border-left: 4px solid #9c27b0; padding: 20px;">
    <h2 style="color: #6a1b9a; margin-top: 0;">📄 Prepare Your Documents</h2>
    
    <p>Hi {{contact.firstName}},</p>
    
    <p>Your notary appointment is in 3 days. Let's make sure you're prepared!</p>
    
    <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <h3>REQUIRED FOR ALL NOTARIZATIONS:</h3>
      <ul>
        <li>✅ Valid government-issued photo ID (driver's license, passport, etc.)</li>
        <li>✅ Documents to be notarized (unsigned)</li>
        <li>✅ All signers must be present</li>
      </ul>
      
      <h3>FOR {{contact.custom_fields.service_requested}}:</h3>
      <p>[Service-specific requirements based on service type]</p>
      
      <h3>IMPORTANT REMINDERS:</h3>
      <ul>
        <li>📝 Do NOT sign documents before the appointment</li>
        <li>👥 All parties must have valid ID</li>
        <li>📱 Have a working phone for identity verification</li>
      </ul>
    </div>
    
    <p><strong>Questions about required documents?</strong><br>
    Reply to this email or call 832-617-4285</p>
    
    <p>See you soon!<br>
    Kenneth Lightfoot</p>
  </div>
</div>
```

### **Step 3: SMS Reminder (if opted in)**
1. **Add Action:** Wait - 1 day
2. **Add Action:** If/Else
3. **Condition:** Contact has tag `Consent:SMS_Opt_In`
4. **IF YES:** Send SMS
```
📄 Quick reminder: Your notary appointment is in 2 days!

Have ready:
✅ Photo ID
✅ Unsigned documents
✅ All signers present

Questions? 832-617-4285
-Kenneth
```

---

## 🎯 **Implementation Checklist**

### **Week 1 Priority Setup:**
- [ ] Create Payment Completed Workflow
- [ ] Set up Stripe webhook endpoint
- [ ] Create Failed Payment Recovery Workflow
- [ ] Create Cancellation Handler Workflow
- [ ] Test payment flow end-to-end

### **Week 2 Setup:**
- [ ] Create Service Completion Tracker
- [ ] Create Rescheduling System
- [ ] Create Document Collection Workflow
- [ ] Test all status transitions

### **Required API Endpoints:**
1. `/api/webhooks/stripe` - Handle payment events
2. `/api/bookings/cancel` - Process cancellations
3. `/api/bookings/reschedule` - Handle reschedules
4. `/api/bookings/complete` - Mark service complete

### **Required Custom Fields (verify these exist):**
- `cf_payment_date` - When payment was received
- `cf_last_cancellation_date` - Track cancellations
- `cf_last_reschedule_date` - Track reschedules
- `cf_lifetime_value` - Customer lifetime value
- `cf_refund_status` - Track refund processing

---

## 💡 **Pro Tips**

1. **Test Mode First:** Use test tags to trigger workflows without real data
2. **Monitor Webhook Failures:** Set up alerts for failed Stripe webhooks
3. **Track Conversion:** Monitor how many failed payments are recovered
4. **Refund SOP:** Document exact refund process for consistency
5. **Calendar Sync:** Ensure cancellations remove calendar events

---

## 🚀 **Expected Results**

After implementing these workflows:
- **100% of successful payments** trigger confirmations
- **70%+ recovery rate** on failed payments
- **<5 minute response** to cancellation requests
- **Zero double-bookings** from poor cancellation handling
- **95%+ customer satisfaction** with smooth rescheduling

Remember: These workflows complete your automation system and handle edge cases that would otherwise require constant manual intervention! 