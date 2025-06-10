# 📅 HMNP GoHighLevel Calendar Setup Guide
*Complete Configuration for All Service Type Calendars*

## 🗂️ **CALENDAR OVERVIEW**

Based on your service structure, you need **7 specialized calendars**:

1. **Essential/Standard - 1 Signer** (ID: `r9koQ0kxmuMuWryZkjdo`)
2. **Essential/Standard - 2 Signers** (ID: `wkTW5ZX4EMl5hOAbCk9D`) 
3. **Essential/Standard - 3+ Signers** (ID: `Vy3hd6Or6Xi2ogW0mvEG`)
4. **Priority Service Calendar** (ID: `xtHXReq1dfd0wGA7dLc0`)
5. **Loan Signing Specialist** (ID: `EJ5ED9UXPHCjBePUTJ0W`)
6. **Specialty Notary Services** (ID: `h4X7cZ0mZ3c52XSzvpjU`)
7. **Business Solutions Calendar** (NEW - for corporate clients)

---

## 📋 **CALENDAR 1: Essential/Standard - 1 Signer**
**Calendar ID:** `r9koQ0kxmuMuWryZkjdo`

### **Service Details**
- **Calendar Name:** "Essential Mobile Notary - 1 Signer"
- **Calendar Description:** "Standard mobile notary services for one signer with up to 2 documents. Travel within 15-mile radius included."
- **Service Type:** Essential Mobile Notary
- **Duration:** 60 minutes
- **Buffer Time:** 30 minutes after appointment
- **Group Booking:** Disabled
- **Meeting Location:** Client's Location (Mobile Service)

### **Availability**
**Business Hours:**
- **Monday-Friday:** 9:00 AM - 5:00 PM (CST)
- **Saturday:** 10:00 AM - 3:00 PM (CST)
- **Sunday:** Closed
- **Holiday Schedule:** Custom (closed major holidays)

**Availability Rules:**
- **Advance Notice:** Minimum 4 hours
- **Maximum Booking Window:** 60 days in advance
- **Same-Day Cutoff:** 3:00 PM (for Essential service)
- **Time Slot Intervals:** 60 minutes
- **Break Between Appointments:** 30 minutes travel time

### **Forms & Payment**
**Required Information:**
- Full Legal Name
- Email Address
- Phone Number
- Service Address (Street, City, State, ZIP)
- Number of Documents (limit 2 for Essential)
- Type of Documents
- Government ID Type

**Optional Information:**
- Special Instructions
- Preferred Contact Method
- SMS Consent
- Accessibility Requirements

**Payment Settings:**
- **Deposit Required:** $25.00
- **Payment Methods:** Credit Card (Stripe)
- **Auto-Charge:** Yes (upon booking confirmation)
- **Refund Policy:** Displayed in booking form

### **Notifications & Additional Options**
**Email Notifications:**
- **Booking Confirmation:** Immediate
- **24-Hour Reminder:** Yes
- **2-Hour Reminder:** Yes (SMS if opted in)
- **Reschedule/Cancellation:** Immediate

**SMS Notifications (if opted in):**
- **Booking Confirmation:** Yes
- **On-Route Notification:** 15 minutes before arrival
- **Service Complete:** Yes

**Cancellation Policy:**
- **24+ Hours:** Full refund
- **2-24 Hours:** 50% refund
- **<2 Hours:** No refund

### **Connections**
**Integrated Systems:**
- **CRM:** Auto-create contact in GHL
- **Pipeline:** Move to "Booking Confirmed" stage
- **Tags:** Add `Service:Essential`, `Signers:1`, `Status:Confirmed`
- **Custom Fields Update:**
  - `cf_service_type`: "Essential Mobile Notary"
  - `cf_booking_number_of_signers`: "1"
  - `cf_booking_service_address`: [Full Address]
  - `cf_payment_status`: "Deposit Paid"

**Workflow Triggers:**
- Tag: `Status:Booking_Confirmed`
- Workflow: Enhanced Booking Confirmation (ID: f5a7b8c9-d123-4567-8901-234567890abc)

### **Customizations**
**Booking Page Theme:**
- **Primary Color:** #002147 (Navy Blue)
- **Secondary Color:** #A52A2A (Burgundy Red)
- **Logo:** Houston Mobile Notary Pros logo
- **Background:** Clean white with company branding

**Custom Questions:**
1. "What type of documents need notarization?" (Dropdown)
   - Will/Testament
   - Power of Attorney
   - Affidavit
   - Real Estate Document
   - Other (please specify)

2. "Is this a time-sensitive document?" (Yes/No)
3. "Any special instructions for our notary?" (Text Area)

### **Rooms & Equipment**
**Service Location:** Mobile Service
- **Primary Service Area:** 15-mile radius from ZIP 77591
- **Extended Service:** Available with travel fee ($0.50/mile)
- **Equipment Provided:**
  - Professional notary supplies
  - Portable scanner
  - Document printing (if needed)
  - Notary journal and seal

---

## 📋 **CALENDAR 2: Essential/Standard - 2 Signers**
**Calendar ID:** `wkTW5ZX4EMl5hOAbCk9D`

### **Service Details**
- **Calendar Name:** "Essential Mobile Notary - 2 Signers"
- **Calendar Description:** "Standard mobile notary services for two signers with up to 3 documents per signer."
- **Duration:** 75 minutes
- **Buffer Time:** 30 minutes
- **Base Price:** $85.00
- **Deposit:** $25.00

### **Availability**
**Same as Calendar 1** with extended duration

### **Forms & Payment**
**Additional Fields for 2-Signer Service:**
- **Signer 1 Information:**
  - Full Legal Name
  - ID Type
  - Relationship to documents
- **Signer 2 Information:**
  - Full Legal Name  
  - ID Type
  - Relationship to documents

**Payment Settings:**
- **Service Fee:** $85.00
- **Deposit:** $25.00
- **Balance Due:** $60.00 (at service completion)

### **Customizations**
**Additional Questions:**
- "Will both signers be present at the same time?" (Yes/No)
- "Are the documents the same for both signers?" (Yes/No)
- "Any special scheduling requirements?" (Text)

---

## 📋 **CALENDAR 3: Essential/Standard - 3+ Signers**
**Calendar ID:** `Vy3hd6Or6Xi2ogW0mvEG`

### **Service Details**
- **Calendar Name:** "Essential Mobile Notary - 3+ Signers"
- **Calendar Description:** "Standard mobile notary services for three or more signers. Custom pricing based on group size."
- **Duration:** 90 minutes
- **Buffer Time:** 45 minutes
- **Base Price:** $95.00 (3 signers)
- **Additional Signers:** $25.00 each

### **Forms & Payment**
**Dynamic Signer Fields:**
- Number of Signers (3-10 max)
- Individual signer information collected
- Group scheduling coordination

**Payment Calculation:**
- Auto-calculates based on signer count
- Displays total before booking
- Deposit: $25.00
- Balance: Variable based on final count

---

## 📋 **CALENDAR 4: Priority Service Calendar**
**Calendar ID:** `xtHXReq1dfd0wGA7dLc0`

### **Service Details**
- **Calendar Name:** "Priority Mobile Notary Service"
- **Calendar Description:** "Expedited mobile notary service with 2-hour response time. Available 7am-9pm daily."
- **Duration:** 60 minutes
- **Buffer Time:** 15 minutes (faster turnaround)
- **Service Type:** Priority Service
- **Price:** $100.00 flat fee

### **Availability**
**Extended Hours:**
- **Monday-Sunday:** 7:00 AM - 9:00 PM (CST)
- **Holidays:** Available (holiday surcharge may apply)
- **Response Time:** Maximum 2 hours from booking

**Availability Rules:**
- **Advance Notice:** Minimum 30 minutes
- **Same-Day:** Available until 7:00 PM
- **Emergency Slots:** Reserved for urgent needs
- **Priority Booking:** Takes precedence over Essential bookings

### **Forms & Payment**
**Priority Questions:**
- "Reason for urgency?" (Dropdown)
  - Legal deadline
  - Travel schedule
  - Business requirement
  - Medical situation
  - Other emergency

- "Preferred appointment time?" (Time selector)
- "Backup time if primary unavailable?" (Time selector)

**Payment Settings:**
- **Flat Fee:** $100.00
- **Deposit:** $50.00 (higher for priority)
- **Rush Processing:** Included
- **Travel:** Extended 20-mile radius included

### **Notifications & Additional Options**
**Expedited Notifications:**
- **Booking Confirmation:** Immediate + SMS
- **Notary Assignment:** Within 15 minutes
- **En Route:** 15-30 minutes notice
- **Arrival:** 5-minute warning

**Service Level Agreement:**
- **Response:** Confirmed within 15 minutes
- **Arrival:** Within 2 hours maximum
- **Service Guarantee:** On-time or fee waiver

---

## 📋 **CALENDAR 5: Loan Signing Specialist**
**Calendar ID:** `EJ5ED9UXPHCjBePUTJ0W`

### **Service Details**
- **Calendar Name:** "Loan Signing Specialist"
- **Calendar Description:** "Certified loan signing services for real estate transactions, refinances, and reverse mortgages."
- **Duration:** 90 minutes
- **Buffer Time:** 60 minutes (for complex closings)
- **Service Type:** Loan Signing Specialist
- **Price:** $200.00+ (base rate)

### **Availability**
**Professional Hours:**
- **Monday-Friday:** 8:00 AM - 6:00 PM (CST)
- **Saturday:** 9:00 AM - 5:00 PM (CST)
- **Sunday:** By appointment only
- **Evening Closings:** Available until 8:00 PM with surcharge

**Specialized Scheduling:**
- **Title Company Coordination:** Automatic notifications
- **Lender Communication:** Direct contact setup
- **Document Preparation Time:** 24-hour advance notice preferred

### **Forms & Payment**
**Loan-Specific Information:**
- **Transaction Type:** (Dropdown)
  - Purchase
  - Refinance
  - HELOC
  - Reverse Mortgage
  - Commercial Loan

- **Property Details:**
  - Property Address
  - Loan Amount Range
  - Lender Name
  - Title Company
  - Closing Agent Contact

- **Borrower Information:**
  - Primary Borrower Full Name
  - Co-Borrower (if applicable)
  - Phone Numbers
  - Email Addresses

**Document Requirements:**
- "Document package size estimate?" (Dropdown: 50-100, 100-150, 150+ pages)
- "RON (Remote Online Notarization) required?" (Yes/No)
- "Courier service needed?" (Yes/No)
- "Special signing instructions?" (Text area)

**Payment Structure:**
- **Base Fee:** $200.00
- **Additional Signers:** $25.00 each (after 4th)
- **RON Service:** +$50.00
- **Courier Service:** +$35.00
- **Evening/Weekend:** +$50.00

### **Connections**
**Loan Industry Integration:**
- **Title Company Notifications:** Auto-send confirmation
- **Lender Updates:** Status notifications
- **Document Tracking:** Upload completion certificates
- **CRM Pipeline:** "Loan Signing" stage

**Workflow Triggers:**
- Tag: `Service:LoanSigning`
- Workflow: Loan Signing Coordination
- Tasks: Document prep checklist

### **Customizations**
**Professional Branding:**
- **Certified Badge:** Display LSS certification
- **Industry Logos:** Title company partnerships
- **Professional Headshot:** Certified notary photo

**Quality Assurance:**
- **Signing Experience:** Display years of experience
- **Error Rate:** <0.1% guarantee
- **Insurance Coverage:** $100K E&O insurance

---

## 📋 **CALENDAR 6: Specialty Notary Services**
**Calendar ID:** `h4X7cZ0mZ3c52XSzvpjU`

### **Service Details**
- **Calendar Name:** "Specialty Notary Services"
- **Calendar Description:** "Specialized notarial services including apostilles, embassy certifications, translations, and complex document handling."
- **Duration:** 75 minutes
- **Buffer Time:** 45 minutes
- **Service Type:** Specialty Services
- **Price:** $150.00+ (consultation required)

### **Availability**
**Consultation-Based Scheduling:**
- **Monday-Friday:** 9:00 AM - 5:00 PM (CST)
- **Consultation Calls:** 15-minute slots
- **Service Appointments:** After consultation
- **Complex Services:** May require multiple appointments

### **Forms & Payment**
**Specialty Service Selection:**
- **Service Type:** (Multi-select)
  - Apostille Services
  - Embassy Certifications
  - Document Translation Certification
  - International Notarization
  - Medallion Signature Guarantee
  - Background Check Verification
  - Corporate Document Authentication

**Document Details:**
- "Document origin country?" (Dropdown)
- "Destination country?" (Dropdown)
- "Document language?" (Dropdown)
- "Urgency level?" (Standard/Expedited/Rush)

**Consultation Questions:**
- "Describe your specific needs" (Text area)
- "Have you worked with apostilles before?" (Yes/No)
- "Timeline for completion?" (Date selector)

**Payment Structure:**
- **Consultation:** Free 15-minute assessment
- **Base Service:** $150.00
- **Expedited Processing:** +$75.00
- **State/Federal Fees:** Pass-through
- **Translation Services:** $25.00/page

---

## 📋 **CALENDAR 7: Business Solutions (NEW)**
**Calendar ID:** `[NEW_CALENDAR_TO_CREATE]`

### **Service Details**
- **Calendar Name:** "Business Notary Solutions"
- **Calendar Description:** "Corporate accounts, volume signings, and recurring business notary services."
- **Duration:** 120 minutes (for consultation)
- **Service Type:** Business Solutions
- **Price:** $250.00/month base

### **Availability**
**Business Hours:**
- **Monday-Friday:** 8:00 AM - 6:00 PM (CST)
- **Emergency Business Hours:** 24/7 (premium rate)
- **Recurring Appointments:** Scheduled monthly
- **Volume Events:** Advance coordination required

### **Forms & Payment**
**Business Information:**
- **Company Name**
- **Industry Type**
- **Number of Employees**
- **Expected Monthly Volume**
- **Billing Contact**
- **Service Address(es)**

**Service Package Selection:**
- **Basic Business:** $250/month (up to 10 notarizations)
- **Professional:** $500/month (up to 25 notarizations)
- **Enterprise:** Custom pricing (unlimited)

**Special Requirements:**
- "HIPAA compliance needed?" (Yes/No)
- "Multi-location service?" (Yes/No)
- "Dedicated account manager?" (Yes/No)
- "Emergency response requirements?" (Text)

---

## 🔧 **GLOBAL CALENDAR SETTINGS**

### **Universal Configurations**
**Time Zone:** America/Chicago (Central Time)
**Date Format:** MM/DD/YYYY
**Time Format:** 12-hour (AM/PM)
**Language:** English (US)

### **Integration Settings**
**CRM Integration:**
- **Auto-create contacts:** Enabled
- **Pipeline automation:** Enabled
- **Custom field mapping:** Active
- **Duplicate detection:** Enabled

**Payment Integration:**
- **Stripe Connection:** Active
- **Auto-charge deposits:** Enabled
- **Payment failure handling:** Automatic retries
- **Refund processing:** Manual approval

### **Workflow Automation:**
- **Booking confirmation:** Immediate trigger
- **Payment reminders:** 2, 24, 48 hour schedule
- **Appointment reminders:** 24hr, 2hr, 1hr
- **Post-service follow-up:** 24 hours after completion

---

## 📱 **MOBILE OPTIMIZATION**

**Responsive Design:**
- **Mobile-first booking:** Optimized for smartphones
- **Touch-friendly interface:** Large buttons and forms
- **GPS integration:** Auto-detect customer location
- **One-click calling:** Direct dial to business

**Customer Experience:**
- **Booking time:** Under 3 minutes average
- **Payment processing:** Single-page checkout
- **Confirmation:** Immediate SMS + email
- **Calendar sync:** Google/Apple calendar integration

---

## 🎯 **SUCCESS METRICS**

**Booking Conversion Rates:**
- **Essential Services:** Target 85%+
- **Priority Services:** Target 95%+
- **Loan Signings:** Target 90%+
- **Business Solutions:** Target 70%+

**Response Times:**
- **Essential:** 4-hour response
- **Priority:** 15-minute response
- **Specialty:** 1-hour response
- **Business:** 30-minute response

**Customer Satisfaction:**
- **Service Quality:** 4.8+ stars
- **Punctuality:** 95% on-time arrival
- **Communication:** 4.9+ rating
- **Overall Experience:** 4.8+ rating

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Calendar Creation Steps:**
1. ✅ Create all 7 calendars in GHL
2. ✅ Configure service details for each
3. ✅ Set up availability rules
4. ✅ Design custom booking forms
5. ✅ Configure payment integration
6. ✅ Set up notification workflows
7. ✅ Test booking process end-to-end
8. ✅ Train staff on calendar management
9. ✅ Launch and monitor performance
10. ✅ Optimize based on booking data

### **Integration Testing:**
- ✅ Test payment processing
- ✅ Verify CRM integration
- ✅ Check workflow triggers
- ✅ Validate email notifications
- ✅ Test SMS delivery
- ✅ Confirm calendar sync

**Ready to dominate the Houston mobile notary market! 🚀** 