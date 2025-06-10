# GHL Practical Setup Guide - Houston Mobile Notary Pros

**Everything you need to set up in GoHighLevel for your booking system automation**

---

## 🎯 **PART 1: Required GHL Setup (Do This First)**

### **Step 1: Create Required Tags**
**Location:** Settings → Tags

Create these exact tags (your booking system uses them):

**Service Tags:**
- `Service:Standard_Mobile_Notary`
- `Service:Loan_Signing_Specialist`
- `Service:Extended_Hours_Notary`

**Status Tags:**
- `Status:Booking_PendingPayment`
- `Status:Booking_Confirmed`
- `Status:Referred_Client`

**Business Intelligence Tags:**
- `Source:Website_Booking`
- `Client:First_Time`
- `Promo:FIRST25`
- `Location:CLIENT_SPECIFIED_ADDRESS`
- `Discount:Applied`

**Marketing Consent Tags:**
- `Consent:SMS_Opt_In`
- `Consent:Marketing_Opt_In`

**Additional Tags for Workflows:**
- `Service:Completed` (you'll add this manually after appointments)
- `Client:Returning` (for repeat customers)

### **Step 2: Create Pipeline** 
**Location:** CRM → Opportunities → Pipeline Settings

**Create Pipeline:** "HMNP Lead Pipeline"

**Add These Stages (in order):**
1. **New Lead** - Initial lead capture
2. **Contacted** - First contact made
3. **Quote Sent** - Pricing provided
4. **Booked** - Service scheduled
5. **Service Complete** - Job finished
6. **Follow-up** - Post-service activities

### **Step 3: Verify Your API Connection**
Your booking system should be working already, but verify:
- Contacts are being created when bookings are made
- Tags are being applied automatically
- Standard fields (name, email, phone, address) are populated

---

## 🚀 **PART 2: Essential Workflows (Set Up in Priority Order)**

### **WORKFLOW 1: New Booking Confirmation** ⭐⭐⭐
**Priority:** CRITICAL - Set up first

#### **How to Create:**
1. **Go to:** Automation → Workflows
2. **Click:** Create Workflow
3. **Name:** "Booking Confirmation - Immediate"
4. **Trigger:** Contact Tagged → `Status:Booking_Confirmed`

#### **Workflow Steps:**
```
TRIGGER: Contact gets tag "Status:Booking_Confirmed"
↓
STEP 1: Send Email - Booking Confirmation
↓
STEP 2: If/Else - Check SMS Consent
├── IF has tag "Consent:SMS_Opt_In"
│   └── Send SMS - Booking Confirmation
└── ELSE: Skip SMS
↓
STEP 3: Create Task - "New booking needs scheduling review"
↓
STEP 4: Add Tag - "Workflow:Confirmation_Sent"
```

#### **Email Template:**
**Subject:** "Your Houston Mobile Notary appointment is confirmed!"
**Body:**
```
Hi {{contact.first_name}},

Great news! Your notary appointment is confirmed.

APPOINTMENT DETAILS:
• Service: {{contact.tags}} (filter for Service: tags)
• Date & Time: [You'll add this manually for now]
• Location: {{contact.address1}}, {{contact.city}}, {{contact.state}}

WHAT TO EXPECT:
• We'll contact you 24 hours before to confirm
• Please have valid photo ID ready
• Bring all documents that need notarization

Questions? Reply to this email or call 832-617-4285.

Thank you for choosing Houston Mobile Notary Pros!

Best regards,
Kenneth Lightfoot
Certified Mobile Notary
```

#### **SMS Template:**
```
Hi {{contact.first_name}}! Your notary appointment is confirmed. We'll send details and reminder 24hrs before. Questions? Call 832-617-4285. -HMNP
```

---

### **WORKFLOW 2: Payment Pending Follow-Up** ⭐⭐⭐
**Priority:** CRITICAL - Money recovery

#### **How to Create:**
1. **Name:** "Payment Pending - Recovery Sequence"
2. **Trigger:** Contact Tagged → `Status:Booking_PendingPayment`

#### **Workflow Steps:**
```
TRIGGER: Contact gets tag "Status:Booking_PendingPayment"
↓
STEP 1: Wait - 30 minutes
↓
STEP 2: Send Email - Payment Reminder #1
↓
STEP 3: Wait - 2 hours
↓
STEP 4: If/Else - Check SMS Consent
├── IF has tag "Consent:SMS_Opt_In"
│   └── Send SMS - Payment Reminder
└── ELSE: Skip to next step
↓
STEP 5: Wait - 24 hours
↓
STEP 6: If/Else - Check if still has "Status:Booking_PendingPayment"
├── IF still has tag
│   ├── Send Email - Final Payment Reminder
│   └── Create Task - "URGENT: Call for payment"
└── ELSE: End workflow (payment completed)
↓
STEP 7: Wait - 48 hours
↓
STEP 8: If/Else - Check if still pending
├── IF still has tag
│   ├── Remove Tag - "Status:Booking_PendingPayment"  
│   ├── Add Tag - "Status:Payment_Expired"
│   └── Create Task - "Follow up on expired booking"
└── ELSE: End workflow
```

#### **Email Templates:**

**Payment Reminder #1:**
**Subject:** "Complete your booking payment - Houston Mobile Notary"
**Body:**
```
Hi {{contact.first_name}},

Your notary service booking is almost complete! We just need your payment to secure your appointment.

Complete payment here: [Your payment link]

Service: {{contact.tags}} (filter for Service: tags)
Amount: [Add amount manually]

Questions? Call us at 832-617-4285.

Thanks!
Houston Mobile Notary Pros
```

**Final Payment Reminder:**
**Subject:** "Final reminder - Secure your notary appointment"
**Body:**
```
Hi {{contact.first_name}},

This is a final reminder to complete your payment for notary services.

If you no longer need our services, no action is required.
If you still need notary services, please complete payment or call us at 832-617-4285.

Payment link: [Your payment link]

Thank you,
Houston Mobile Notary Pros
```

---

### **WORKFLOW 3: 24-Hour Appointment Reminder** ⭐⭐⭐
**Priority:** HIGH - Prevents no-shows

#### **How to Create:**
1. **Name:** "24 Hour Appointment Reminder"
2. **Trigger:** Date/Time Based → 24 hours before appointment
   - **Note:** You'll need to manually trigger this or set up calendar integration

#### **Alternative Trigger Setup:**
Since automated date triggers are complex, use this approach:
1. **Trigger:** Contact Tagged → `Reminder:24hr_Needed`
2. **You manually add this tag** 24 hours before appointments

#### **Workflow Steps:**
```
TRIGGER: Contact gets tag "Reminder:24hr_Needed"
↓
STEP 1: Send Email - 24 Hour Reminder
↓
STEP 2: If/Else - Check SMS Consent
├── IF has tag "Consent:SMS_Opt_In"
│   └── Send SMS - 24 Hour Reminder
└── ELSE: Skip SMS
↓
STEP 3: Remove Tag - "Reminder:24hr_Needed"
↓
STEP 4: Add Tag - "Reminder:24hr_Sent"
```

#### **Email Template:**
**Subject:** "Tomorrow: Your notary appointment with Houston Mobile Notary Pros"
**Body:**
```
Hi {{contact.first_name}},

This is a friendly reminder about your notary appointment TOMORROW.

APPOINTMENT DETAILS:
• Date: [Manual entry]
• Time: [Manual entry]  
• Location: {{contact.address1}}, {{contact.city}}, {{contact.state}}
• Service: {{contact.tags}} (filter for Service: tags)

IMPORTANT REMINDERS:
✓ Have valid photo ID ready
✓ Gather all documents for notarization
✓ Be available 15 minutes before appointment time

TO CONFIRM: Reply "CONFIRM" to this email
TO RESCHEDULE: Call 832-617-4285

We look forward to serving you!

Best regards,
Houston Mobile Notary Pros
```

#### **SMS Template:**
```
Reminder: Your notary appointment is TOMORROW. Have ID ready. Reply CONFIRM or call 832-617-4285 if changes needed. -HMNP
```

---

### **WORKFLOW 4: 2-Hour Final Reminder** ⭐⭐
**Priority:** HIGH - Last chance to prevent no-show

#### **How to Create:**
1. **Name:** "2 Hour Final Reminder"
2. **Trigger:** Contact Tagged → `Reminder:2hr_Needed`

#### **Workflow Steps:**
```
TRIGGER: Contact gets tag "Reminder:2hr_Needed"
↓
STEP 1: If/Else - Check SMS Consent
├── IF has tag "Consent:SMS_Opt_In"
│   └── Send SMS - 2 Hour Reminder
└── ELSE: Send Email instead
↓
STEP 2: Remove Tag - "Reminder:2hr_Needed"
↓
STEP 3: Add Tag - "Reminder:2hr_Sent"
```

#### **SMS Template:**
```
Final reminder: Your notary appointment is in 2 HOURS. Address: {{contact.address1}}. Have your ID ready. Any issues call 832-617-4285 NOW. -HMNP
```

---

### **WORKFLOW 5: First-Time Client Welcome** ⭐⭐
**Priority:** MEDIUM - Great customer experience

#### **How to Create:**
1. **Name:** "First Time Client Welcome"
2. **Trigger:** Contact Tagged → `Client:First_Time`

#### **Workflow Steps:**
```
TRIGGER: Contact gets tag "Client:First_Time"
↓
STEP 1: Wait - 5 minutes
↓
STEP 2: Send Email - First Time Welcome
↓
STEP 3: Add Tag - "Workflow:Welcome_Sent"
```

#### **Email Template:**
**Subject:** "Welcome to Houston Mobile Notary Pros!"
**Body:**
```
Hi {{contact.first_name}},

Welcome to Houston Mobile Notary Pros! We're excited to serve you.

Since this is your first time using our services, here's what to expect:

BEFORE YOUR APPOINTMENT:
✓ We'll confirm 24 hours in advance
✓ We'll send a final reminder 2 hours before
✓ Have your valid photo ID ready

DURING YOUR APPOINTMENT:
✓ Our certified notary will verify your identity
✓ We'll notarize your documents professionally
✓ Average appointment time: 15-30 minutes

AFTER YOUR APPOINTMENT:
✓ You'll receive notarized documents immediately
✓ We'll follow up to ensure satisfaction
✓ Ask about our referral program!

Questions before your appointment? 
Call/text: 832-617-4285
Email: info@houstonmobilenotarypros.com

Thank you for choosing us!

Kenneth Lightfoot
Certified Mobile Notary
Houston Mobile Notary Pros
```

---

### **WORKFLOW 6: Post-Appointment Follow-Up** ⭐⭐⭐
**Priority:** HIGH - Generates reviews and referrals

#### **How to Create:**
1. **Name:** "Post Service Follow Up"
2. **Trigger:** Contact Tagged → `Service:Completed`
   - **Note:** You manually add this tag after completing appointments

#### **Workflow Steps:**
```
TRIGGER: Contact gets tag "Service:Completed"
↓
STEP 1: Wait - 2 hours
↓
STEP 2: Send Email - Thank You Message
↓
STEP 3: Wait - 1 day
↓
STEP 4: Send Email - Review Request
↓
STEP 5: Wait - 1 week
↓
STEP 6: If/Else - Check if they're a first-time client
├── IF has tag "Client:First_Time"
│   └── Send Email - Referral Incentive
└── ELSE: Send Email - General Referral Program
```

#### **Email Templates:**

**Thank You Message:**
**Subject:** "Thank you - Houston Mobile Notary Pros"
**Body:**
```
Hi {{contact.first_name}},

Thank you for choosing Houston Mobile Notary Pros today!

I hope our notary service met your expectations. It was a pleasure serving you.

If you need any copies of your notarized documents or have questions, please don't hesitate to reach out.

Best regards,
Kenneth Lightfoot
Houston Mobile Notary Pros
832-617-4285
```

**Review Request:**
**Subject:** "How was your notary experience?"
**Body:**
```
Hi {{contact.first_name}},

I hope you're doing well! It's been a day since we provided notary services for you.

Would you mind taking 30 seconds to share your experience?

⭐ Google Review: [Your Google Business link]
⭐ Yelp Review: [Your Yelp link]

Your feedback helps other customers find reliable notary services and helps us improve.

If you had any concerns about your experience, please reply to this email so I can address them personally.

Thank you!

Kenneth Lightfoot
Houston Mobile Notary Pros
```

**Referral Incentive:**
**Subject:** "Thanks + $25 off for your friends!"
**Body:**
```
Hi {{contact.first_name}},

Thanks again for being our customer!

SPECIAL OFFER: When you refer a friend who books our services, you BOTH get $25 off your next appointment!

HOW IT WORKS:
1. Share our website: houstonmobilenotarypros.com
2. Have them mention your name when booking
3. You both save $25!

There's no limit - refer 5 friends, save $125!

Questions? Just reply to this email.

Thanks for spreading the word!

Kenneth Lightfoot
Houston Mobile Notary Pros
```

---

## 🔧 **PART 3: Additional GHL Setup**

### **Custom Fields (Optional - for future)**
Your system works without these, but you can add later:
- `Last Appointment Date`
- `Total Bookings`
- `Preferred Contact Method`

### **Pipelines for Lead Management**
If you get leads from other sources:
1. Create "General Leads" pipeline
2. Stages: New Lead → Contacted → Qualified → Quoted → Booked

### **Forms (if needed)**
- Contact form integration
- Quote request form
- Newsletter signup

---

## 📋 **PART 4: Your Daily Workflow**

### **When You Get a Booking:**
1. ✅ **Automatic:** Contact created, tags applied
2. ✅ **Automatic:** Confirmation workflow triggers
3. 📝 **Manual:** Review booking details, confirm appointment time
4. 📝 **Manual:** Add calendar entry

### **24 Hours Before Appointment:**
1. 📝 **Manual:** Add tag `Reminder:24hr_Needed` to contact
2. ✅ **Automatic:** 24-hour reminder workflow triggers

### **2 Hours Before Appointment:**
1. 📝 **Manual:** Add tag `Reminder:2hr_Needed` to contact
2. ✅ **Automatic:** 2-hour reminder workflow triggers

### **After Completing Service:**
1. 📝 **Manual:** Add tag `Service:Completed` to contact
2. ✅ **Automatic:** Follow-up workflow triggers
3. 📝 **Manual:** Add tag `Client:Returning` for repeat customers

---

## ⚡ **Quick Setup Checklist**

**Week 1 - Revenue Critical:**
- [ ] Create all required tags
- [ ] Set up Workflow 1: Booking Confirmation
- [ ] Set up Workflow 2: Payment Follow-up
- [ ] Test with a dummy booking

**Week 2 - Customer Experience:**
- [ ] Set up Workflow 3: 24-hour reminder
- [ ] Set up Workflow 4: 2-hour reminder
- [ ] Set up Workflow 5: First-time welcome
- [ ] Test reminder workflows

**Week 3 - Growth:**
- [ ] Set up Workflow 6: Post-service follow-up
- [ ] Create pipeline for other leads
- [ ] Test complete customer journey

---

## 🎯 **Success Metrics to Track**

- **Booking confirmation rate:** Target >95%
- **Payment completion rate:** Target >90% 
- **No-show rate:** Target <5%
- **Review response rate:** Target >30%
- **Referral rate:** Target >10%

This setup will automate 80% of your customer communication while you focus on growing your business! 