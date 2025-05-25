# GoHighLevel Master Setup & Integration Guide
**Houston Mobile Notary Pros - Complete Implementation Documentation**

---

## 📋 Table of Contents

### Part 1: Initial Setup & Configuration
1. [Prerequisites & Environment Setup](#prerequisites)
2. [GHL Account Configuration](#ghl-configuration)
3. [Custom Fields Setup](#custom-fields)
4. [Tags Configuration](#tags-configuration)
5. [Pipeline Creation](#pipeline-creation)

### Part 2: Integration & Webhooks
6. [Webhook Setup (Workflow-Based)](#webhook-setup)
7. [API Integration](#api-integration)
8. [Form Integration Strategy](#form-integration)

### Part 3: Workflow Automation
9. [Core Workflows Implementation](#core-workflows)
10. [Communication Templates](#communication-templates)
11. [SMS & Scheduling Setup](#sms-scheduling)

### Part 4: Testing & Deployment
12. [Testing Procedures](#testing)
13. [Go-Live Checklist](#go-live-checklist)
14. [Monitoring & Maintenance](#monitoring)

---

## Part 1: Initial Setup & Configuration

### 1. Prerequisites & Environment Setup {#prerequisites}

#### Required Environment Variables
```env
# GoHighLevel Configuration
GHL_API_KEY=your_private_integration_key
GHL_LOCATION_ID=your_location_id
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-04-15
GHL_WEBHOOK_SECRET=your_webhook_secret

# SMS Configuration
GHL_SMS_ENDPOINT=https://services.leadconnectorhq.com/conversations/messages
GHL_SMS_CONSENT_TAG=Consent:SMS_Opt_In

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://houstonmobilenotarypros.com
NEXT_PUBLIC_BASE_URL=https://houstonmobilenotarypros.com

# Cron Security
CRON_SECRET=your_secure_cron_secret

# Database
DATABASE_URL=your_postgres_connection_string
```

#### Required Access & Permissions
- GoHighLevel account with admin access
- Private Integration enabled in GHL Labs
- API permissions for:
  - Contacts (read/write)
  - Opportunities (read/write)
  - Calendars (read/write)
  - Webhooks (read/write)
  - Workflows (read/write)
  - Conversations (send messages)

### 2. GHL Account Configuration {#ghl-configuration}

#### Enable Required Features
1. **Navigate to**: Settings → Labs
2. **Enable**:
   - Private Integrations
   - Premium Actions & Triggers (for Custom Webhook action)
   - Any other beta features needed

#### Create Private Integration
1. **Navigate to**: Settings → Other Settings → Private Integrations
2. **Create Integration**:
   - Name: `Houston Mobile Notary Automation`
   - Description: `Complete automation integration for HMNP`
3. **Select Scopes**:
   - `contacts.readonly` & `contacts.write`
   - `opportunities.readonly` & `opportunities.write`
   - `calendars.readonly` & `calendars.write`
   - `webhooks.readonly` & `webhooks.write`
   - `workflows.readonly` & `workflows.write`
   - `conversations.write`
4. **Copy Token**: Save immediately to `.env` file

### 3. Custom Fields Setup {#custom-fields}

#### Automated Setup
```bash
node scripts/create-ghl-custom-fields.js
```

#### Key Custom Fields Categories

**Contact & Inquiry Fields**
- `cf_contact_inquiry_subject` - Subject line from contact form
- `cf_contact_inquiry_message` - Detailed message
- `cf_preferred_call_time` - Callback preference
- `cf_call_request_notes` - Call request details

**Booking & Appointment Fields**
- `cf_booking_service_type` - Service selected
- `cf_booking_number_of_signers` - Number of signers
- `cf_booking_appointment_datetime` - Appointment date/time
- `cf_booking_service_address` - Service location
- `cf_booking_special_instructions` - Special notes
- `cf_booking_discount_applied` - Discount details
- `cf_promo_code_used` - Promo code used
- `cf_referred_by_name_or_email` - Referrer information

**Payment & Billing Fields**
- `cf_payment_invoice_number` - Invoice reference
- `cf_payment_amount_paid` - Payment amount
- `cf_payment_status` - Payment status
- `cf_payment_reminders_sent` - Reminder count

**Consent & Compliance Fields**
- `cf_consent_terms_conditions` - Terms accepted
- `cf_consent_sms_communications` - SMS opt-in
- `cf_consent_email_marketing` - Email opt-in
- `cf_consent_display_testimonial` - Testimonial consent

**Complete list**: See [Custom Fields Reference](#custom-fields-reference)

### 4. Tags Configuration {#tags-configuration}

#### Automated Setup
```bash
node scripts/create-ghl-tags.js
```

#### Tag Categories & Naming Convention

**Source Tags** (Where leads come from)
- `Source:Website_Contact_Form`
- `Source:Website_Service_Booking_Form`
- `Source:Website_Newsletter_Signup`
- `Source:GMB_Listing`
- `Source:Referral_[Name]`

**Status Tags** (Lead/booking status)
- `Status:New_Lead`
- `Status:Booking_Requested`
- `Status:Payment_Pending`
- `Status:Payment_Received`
- `Status:Service_Completed`

**Service Tags** (Service types)
- `Service:STANDARD_NOTARY`
- `Service:LOAN_SIGNING_SPECIALIST`
- `Service:EXTENDED_HOURS_NOTARY`

**Complete list**: See [Tags Reference](#tags-reference)

### 5. Pipeline Creation {#pipeline-creation}

#### Manual Pipeline Setup (Required)

**Pipeline: Houston Mobile Notary Pros - Lead Pipeline**

1. **Navigate to**: CRM → Opportunities → Pipeline Settings
2. **Create Pipeline**: Click "+ Create Pipeline"
3. **Pipeline Name**: `Houston Mobile Notary Pros - Lead Pipeline`
4. **Add Stages** (in order):
   - New Lead
   - Contacted
   - Quote Sent
   - Booked
   - Service Complete
   - Follow-up

**Note**: Pipeline creation via API is limited. Manual setup takes 2-3 minutes.

---

## Part 2: Integration & Webhooks

### 6. Webhook Setup (Workflow-Based) {#webhook-setup}

#### Modern Approach: Using Workflows with Custom Webhook Action

**Why Workflows Instead of Traditional Webhooks:**
- Available on all GHL plans
- More flexible and reliable
- No separate webhook configuration needed
- Better error handling and retry logic

#### Creating Webhook Workflows

**Step 1: Access Workflows**
1. Navigate to: Automation → Workflows
2. Click: "+ Create Workflow"

**Step 2: Create Contact Created Webhook**
```
Workflow Name: Webhook - Contact Created
Trigger: Contact Created

Action: Custom Webhook
- URL: https://houstonmobilenotarypros.com/api/webhooks/ghl
- Method: POST
- Headers: Content-Type: application/json
- Body:
{
  "type": "ContactCreate",
  "contactId": "{{contact.id}}",
  "contact": {
    "firstName": "{{contact.first_name}}",
    "lastName": "{{contact.last_name}}",
    "email": "{{contact.email}}",
    "phone": "{{contact.phone}}"
  },
  "timestamp": "{{right_now.date}}"
}
```

**Additional Webhook Workflows to Create:**
- Tag Updated
- Opportunity Status Changed
- Appointment Created
- Form Submitted

See [Webhook Templates](#webhook-templates) for all configurations.

### 7. API Integration {#api-integration}

#### API Utilities Setup

**Core API Functions** (`lib/ghl.ts`):
```typescript
// Contact Management
upsertContact(contactData)
getContactByEmail(email)
addTagsToContact(contactId, tags)
removeTagsFromContact(contactId, tags)

// Custom Fields
getLocationCustomFields()
updateContactCustomFields(contactId, fields)

// Opportunities
createOpportunity(opportunityData)
updateOpportunityStage(opportunityId, stage)

// Workflows
triggerWorkflow(workflowId, contactId)
```

#### Webhook Handler Setup

**Main Handler** (`app/api/webhooks/ghl/route.ts`):
- Handles all incoming webhooks from GHL
- Routes to appropriate business logic
- Includes error handling and logging
- Supports multiple event types

### 8. Form Integration Strategy {#form-integration}

#### Website Forms → GHL Integration Flow

1. **User submits form** on website
2. **Next.js API route** processes submission
3. **API calls GHL** to:
   - Create/update contact
   - Apply tags
   - Update custom fields
   - Trigger workflows
4. **GHL workflows** handle follow-up automation

#### AI-Powered Code Integration

**NEW**: Leverage GHL's "Code with AI" feature for advanced integrations:
- Generate custom code snippets using natural language
- Connect workflows with your web app API
- Transform data between systems
- Implement complex business logic

See [GHL Code with AI Integration Guide](./GHL_CODE_WITH_AI_INTEGRATION_GUIDE.md) for detailed examples and best practices.

#### Key Form Integrations

**Contact Form** (`/api/contact`)
- Creates/updates contact
- Tags: `Source:Website_Contact_Form`, `Status:New_Lead`
- Triggers welcome workflow

**Booking Form** (`/api/bookings`)
- Processes payment via Stripe
- Updates all booking custom fields
- Tags: `Source:Website_Service_Booking`, `Status:Booking_Requested`
- Triggers booking confirmation workflow

**Complete form list**: See [Form Integration Reference](#form-integration-reference)

---

## Part 3: Workflow Automation

### 9. Core Workflows Implementation {#core-workflows}

#### Workflow Categories

**Lead Management Workflows**
1. New Lead Welcome Sequence
2. Hot Prospect Follow-up
3. Quote Follow-up Automation
4. Long-term Nurture

**Booking & Service Workflows**
1. Booking Confirmation & Preparation
2. Appointment Reminders (24hr, 2hr, 1hr)
3. Service Completion Follow-up
4. No-Show Handling

**Payment Workflows**
1. Payment Confirmation
2. Payment Reminders
3. Failed Payment Recovery (Revised)
4. Refund Processing (New & Clarified)

**Review & Feedback Workflows**
1. Post-Service Feedback Request
2. Review Request Sequence
3. Testimonial Collection

**NEW: Advanced Client & Business Growth Workflows**
1. Client Onboarding Workflow (for complex/multi-step services)
2. Referral Program Workflow
3. Inactive Client Re-engagement Workflow
4. Internal Alert & Escalation Workflow Framework (Conceptual)

#### Implementation Approach

**For each workflow:**
1. Create in GHL Workflows
2. Add trigger (tag, status change, etc.)
3. Configure actions:
   - Send communications
   - Update tags/fields
   - Create tasks
   - HTTP POST to API
   - Wait steps
   - Conditional logic

**Detailed workflow configurations**: See [Workflow Templates](#workflow-templates)

#### Detailed Workflow Setup Instructions

##### Lead Management Workflows

**1. New Lead Welcome Sequence**
- **Trigger**: Tag Added → `Status:New_Lead`
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app about the new lead.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "NewLeadReceived",
         "contactId": "{{contact.id}}",
         "timestamp": "{{right_now.date}}",
         "source": "{{contact.source}}",
         "inquirySubject": "{{contact.cf_contact_inquiry_subject}}",
         "inquiryMessagePreview": "{{contact.cf_contact_inquiry_message | truncate: 100}}"
       }
       ```
  2. **If/Else Condition**: Based on `cf_contact_inquiry_subject` or other lead scoring fields for segmentation (e.g., urgency, service type).
     - **Path A (Standard Lead)**: Continue with standard sequence.
     - **Path B (High Priority/Specific Service Lead)**: Adjust task assignment, potentially trigger different initial communication.
  3. **Wait**: 5 minutes
  4. **Send SMS** (if consent given):
     ```
     Hi {{contact.first_name}}! Thanks for reaching out to Houston Mobile Notary Pros. 
     I'll review your inquiry and get back to you within 24 hours. 
     What type of document do you need notarized?
     ```
  5. **Send Email**:
     - Subject: "Thank you for contacting Houston Mobile Notary Pros"
     - Use welcome email template
  6. **Custom Webhook / HTTP POST to webhook**: Notify web app that initial contact messages have been sent.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "LeadWelcomeMessageSent",
         "contactId": "{{contact.id}}",
         "smsSent": "true", // or based on actual send status if available
         "emailSent": "true", // or based on actual send status if available
         "segment": "Standard", // or "HighPriority" based on If/Else
         "timestamp": "{{right_now.date}}"
       }
       ```
  7. **Create Task**: "Follow up with new lead"
     - Assigned to: Team member (or specialized team member based on segmentation).
     - Due: 24 hours
  8. **Add Tag**: `Workflow:Welcome_Sequence_Started`
  9. **Wait**: 24 hours
  10. **If/Else Condition**: Check if tag `Status:Contacted` exists
      - If NO: 
        - Send follow-up SMS/Email
        - **Custom Webhook / HTTP POST to webhook**: Notify web app about follow-up attempt.
          - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
          - Body:
            ```json
            {
              "type": "LeadFollowUpAttempted",
              "contactId": "{{contact.id}}",
              "attemptNumber": "1", // or increment
              "timestamp": "{{right_now.date}}"
            }
            ```
      - If YES: End workflow

**2. Hot Prospect Follow-up**
- **Trigger**: Tag Added → `Status:Hot_Prospect`
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app about a hot prospect.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "HotProspectIdentified",
         "contactId": "{{contact.id}}",
         "timestamp": "{{right_now.date}}"
       }
       ```
  2. **Send SMS** (immediate):
     ```
     Hi {{contact.first_name}}! I noticed you're looking for urgent notary services. 
     I'm available today. Call me at 832-617-4285 or reply with your preferred time.
     ```
  3. **Create Task**: "Call hot prospect immediately: {{contact.first_name}}"
     - Priority: High
     - Due: 1 hour
     - **Escalation**: If task not marked complete in 30 minutes, send internal notification (SMS/Email) to Sales Manager: "Hot Prospect {{contact.first_name}} needs immediate attention."
  4. **Wait**: 2 hours (allow time for call, if no contact made then proceed)
  5. **If/Else**: Check if tag `Status:Contacted` exists
     - If NO: Send second SMS attempt: "Hi {{contact.first_name}}, just checking in. Are you still looking for urgent notary help? Let me know."
  6. **Add to Campaign**: Fast-track booking sequence (if applicable, or specific high-touch actions).
  7. **Custom Webhook / HTTP POST to webhook**: Notify web app that prospect added to fast-track campaign.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "HotProspectCampaignAdd",
         "contactId": "{{contact.id}}",
         "campaignName": "Fast-track booking sequence",
         "timestamp": "{{right_now.date}}"
       }
       ```

**3. Quote Follow-up Automation**
- **Trigger**: Tag Added → `Status:Quote_Sent`
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app that a quote was sent.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "QuoteSent",
         "contactId": "{{contact.id}}",
         // "quoteId": "{{opportunity.quote_id}}" // If available
         "quoteAmount": "{{opportunity.value}}", // If available
         "timestamp": "{{right_now.date}}"
       }
       ```
  2. **Wait**: 24 hours
  3. **Send Email**: Quote follow-up template (e.g., "Any questions about your notary quote?").
  4. **Wait**: 2 days
  5. **If/Else**: Check if tag `Status:Booking_Requested` exists OR Opportunity Stage changed to "Booked".
     - If NO: Send SMS reminder about quote: "Hi {{contact.first_name}}, following up on the notary quote we sent. Let me know if you'd like to proceed or have questions!"
  6. **Wait**: 3 days
  7. **If/Else**: Still no booking (check tags/opportunity stage again)?
     - If NO: Send "Special Offer" email with a small, time-sensitive incentive (e.g., 5-10% discount if booked in 48 hours).
     - Add Tag: `Marketing:Quote_Offer_Sent`
  8. **Wait**: 2 days
  9. **If/Else**: Still no booking?
     - If NO (Deal Potentially Lost):
       - Send Final Follow-up Email: "Checking in one last time on your notary quote. If you've decided to go another way or your needs have changed, we understand. We'd appreciate any brief feedback if you're open to sharing (e.g., price, found alternative, timing not right?). This helps us improve."
       - **Add Tag**: `Status:Deal_Lost_FollowUpSent`
       - Create Task: "Review unresponsive quote for {{contact.first_name}} - consider closing opportunity."
       - **Custom Webhook / HTTP POST to webhook**: Notify web app of potential lost deal.
         - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
         - Body:
           ```json
           {
             "type": "DealLostFollowUpSent",
             "contactId": "{{contact.id}}",
             "quoteId": "{{opportunity.quote_id}}",
             "timestamp": "{{right_now.date}}"
           }
           ```
     - If YES (Booked at any stage): End this follow-up workflow here.
  10. **Add Tag**: `Marketing:Quote_Follow_Up_Complete` (if not booked after all attempts).
  11. **Custom Webhook / HTTP POST to webhook**: Notify web app quote follow-up sequence completed status.
      - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
      - Body:
        ```json
        {
          "type": "QuoteFollowUpComplete",
          "contactId": "{{contact.id}}",
          "booked": "{{contact.tags contains 'Status:Booking_Requested' or opportunity.status == 'won'}}",
          "timestamp": "{{right_now.date}}"
        }
        ```

**4. Long-term Nurture**
- **Trigger**: Tag Added → `Status:Long_Term_Nurture` (e.g., for leads not ready to book, past clients without recent activity).
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app contact added to long-term nurture.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "LongTermNurtureStart",
         "contactId": "{{contact.id}}",
         "timestamp": "{{right_now.date}}"
       }
       ```
  2. **Add to Segmented Campaign/Workflow**: Based on past service types (`{{contact.cf_booking_service_type}}`), interests, or lead source.
     - Example Segments: `Nurture:General_Notary`, `Nurture:Loan_Signing_Info`, `Nurture:Business_Clients`.
  3. **Wait**: 30 days (adjust frequency based on segment).
  4. **Send Segmented Email**: Educational content, tips, or service reminders relevant to their segment.
     - E.g., Loan Signing segment: "Tips for a Smooth Loan Closing."
     - E.g., General Notary segment: "Common Documents That Require Notarization."
  5. **Wait**: 30-60 days (adjust frequency).
  6. **Send Segmented Email**: Different content piece, seasonal reminder, or soft offer.
  7. **Repeat**: Cycle through relevant content periodically (e.g., every 30-90 days for 6-12 months, or until they re-engage).
  8. **Monitor Engagement**: If high engagement (opens, clicks) on a specific topic, consider adding more specific interest tags. If no engagement after several attempts, consider reducing frequency or adding `Status:Dormant_Nurture` tag.

##### Booking & Service Workflows

**1. Booking Confirmation & Preparation**
- **Trigger**: Tag Added → `Status:Booking_Confirmed` (or Opportunity Stage "Booked" AND Payment Received if pre-payment required)
- **Actions**:
  1. **Send SMS** (immediate):
     ```
     Booking confirmed! Your notary appointment with Houston Mobile Notary Pros is scheduled for 
     {{contact.cf_booking_appointment_datetime}}. 
     I'll send you a reminder 24 hours before. Any questions, just reply here!
     ```
  2. **Send Email**: Detailed booking confirmation.
     - Subject: "Your Notary Appointment is Confirmed: {{contact.cf_booking_appointment_datetime}}"
     - Body: Include all details: service, date/time, address, price, what to prepare (e.g., "Please have valid Photo ID for all signers. For Loan Signings, ensure all documents are printed and ready."). Link to FAQ.
  3. **Update Custom Fields**:
     - `cf_booking_status`: "Confirmed"
     - `cf_confirmation_sent_at`: {{current_timestamp}}
  4. **Create Calendar Event** (if not already created by booking system).
  5. **Add Tag**: `Workflow:Booking_Confirmation_Sent`
  6. **Custom Webhook / HTTP POST to webhook**: Notify web app about booking confirmation and details.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "BookingConfirmed",
         "contactId": "{{contact.id}}",
         "bookingIdGHL": "{{appointment.id}}", // or relevant booking ID from GHL
         "bookingDateTime": "{{contact.cf_booking_appointment_datetime}}",
         "serviceAddress": "{{contact.cf_booking_service_address}}",
         "serviceType": "{{contact.cf_booking_service_type}}",
         "numberOfSigners": "{{contact.cf_booking_number_of_signers}}",
         "specialInstructions": "{{contact.cf_booking_special_instructions}}",
         "timestamp": "{{right_now.date}}"
       }
       ```

**2. Appointment Reminders**
- **Trigger**: Appointment Status → Scheduled (This workflow might have branches triggered by the main booking confirmation, or run independently based on appointment time).
- **Actions**:
  
  *24-Hour Reminder Branch:*
  1. **Wait Until**: 24 hours before `{{contact.cf_booking_appointment_datetime}}`.
  2. **Send SMS**: 
      ```
      Reminder: Your notary appointment with Houston Mobile Notary Pros is tomorrow at {{contact.cf_booking_appointment_time_only}} at {{contact.cf_booking_service_address}}. Please reply YES to confirm or call 832-617-4285 if you need to reschedule.
      ```
  3. **Send Email**: Appointment preparation checklist, reiterate ID requirements, link to map/directions if complex.
  4. **Add Tag**: `Reminder:24hr_Sent`
  5. **Custom Webhook / HTTP POST to webhook**: Log 24hr reminder sent.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "AppointmentReminderSent",
         "contactId": "{{contact.id}}",
         "appointmentId": "{{appointment.id}}",
         "reminderType": "24hr",
         "confirmationRequested": "true",
         "timestamp": "{{right_now.date}}"
       }
       ```
  6. **Wait for Reply (SMS)**: For "YES" confirmation (if GHL supports this).
     - If "YES" received: Add Tag `Status:Appointment_Confirmed_24hr`.
     - If NO reply within 12 hours: Create Task: "Manual check-in for {{contact.first_name}} - 24hr reminder unconfirmed."
  
  *2-Hour Reminder Branch:*
  1. **Wait Until**: 2 hours before `{{contact.cf_booking_appointment_datetime}}`.
  2. **Send SMS**: 
     ```
     Friendly Reminder: Your notary appointment is in 2 hours at 
     {{contact.cf_booking_service_address}}. 
     Please have your ID and all documents ready. See you soon!
     ```
  3. **Add Tag**: `Reminder:2hr_Sent`
  4. **Custom Webhook / HTTP POST to webhook**: Log 2hr reminder sent.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "AppointmentReminderSent",
         "contactId": "{{contact.id}}",
         "appointmentId": "{{appointment.id}}",
         "reminderType": "2hr",
         "timestamp": "{{right_now.date}}"
       }
       ```
  
  *1-Hour Reminder Branch (Optional - Consider if necessary based on client type/service)*:
  1. **Wait Until**: 1 hour before `{{contact.cf_booking_appointment_datetime}}`.
  2. **Send SMS**: "Final reminder: Your notary appointment is in 1 hour. If you're running late or need to contact your notary directly, call/text [Notary_Assigned_Phone_Number_If_Variable_Else_Main_Number]."
  3. **Add Tag**: `Reminder:1hr_Sent`
  4. **Custom Webhook / HTTP POST to webhook**: Log 1hr reminder sent.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "AppointmentReminderSent",
         "contactId": "{{contact.id}}",
         "appointmentId": "{{appointment.id}}",
         "reminderType": "1hr",
         "timestamp": "{{right_now.date}}"
       }
       ```

**3. Service Completion Follow-up**
- **Trigger**: Tag Added → `Status:Service_Completed` (Applied by notary/staff post-appointment).
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app service is marked complete.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "ServiceCompleted",
         "contactId": "{{contact.id}}",
         "appointmentId": "{{appointment.id}}", // If available, or booking ID
         "serviceType": "{{contact.cf_booking_service_type}}",
         "completionTimestamp": "{{right_now.date}}"
         // Potentially add custom fields like cf_notary_assigned, cf_service_outcome_notes
       }
       ```
  2. **Wait**: 2 hours (allow for notary to clear location, update notes).
  3. **Send SMS**: "Hi {{contact.first_name}}, thanks for using Houston Mobile Notary Pros today! We appreciate your business. You'll receive an email with a summary shortly."
  4. **Send Email**: Service summary, thank you, and (if applicable) link to invoice or payment receipt. "What's Next?" guide if relevant (e.g., where to file documents).
  5. **Wait**: 24 hours (before asking for review, to allow client to process the service).
  6. **Trigger "Post-Service Feedback Request" Workflow** (e.g., by adding a tag like `Action:RequestFeedback`). This separates the feedback/review process into its own workflow for clarity.
  7. **Remove Tag**: `Workflow:Booking_Confirmation_Sent`, `Reminder:24hr_Sent` etc. (cleanup).
  8. **Add Tag**: `Workflow:Service_FollowUp_Sent`.

**4. No-Show Handling**
- **Trigger**: Tag Added → `Status:No_Show` (Applied by notary/staff if client is not available).
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app of no-show.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "AppointmentNoShow",
         "contactId": "{{contact.id}}",
         "appointmentId": "{{appointment.id}}", // If available
         "scheduledDateTime": "{{contact.cf_booking_appointment_datetime}}",
         "reasonRecorded": "{{contact.cf_no_show_reason}}", // If staff adds a note
         "timestamp": "{{right_now.date}}"
       }
       ```
  2. **Send SMS** (immediate, empathetic tone):
     ```
     Hi {{contact.first_name}}, we missed you at your notary appointment today with Houston Mobile Notary Pros. Is everything okay? Please reply or call us at 832-617-4285 if you'd like to reschedule or discuss.
     ```
  3. **Update Custom Field**: `cf_no_show_count` (increment).
  4. **Create Task**: "Follow up on no-show: {{contact.first_name}}. Attempt to reschedule or understand reason."
     - Assigned to: Customer Service / Scheduler.
     - Due: 4 hours.
  5. **Wait**: 1 hour (allow for immediate client response to SMS).
  6. **Send Email**: More formal, reiterating missed appointment and offering rescheduling options. Clearly state any no-show fee policy if applicable, or if the fee is waived for this instance.
  7. **If/Else**: Check `cf_no_show_count`.
     - If `cf_no_show_count` > 1 (or as per policy): Add Tag `Risk:Frequent_No_Show`. Consider requiring prepayment for future bookings or adjusting client status.
     - If policy includes a No-Show Fee and it's not the first time (or first time fee is applied): Add Tag `Action:Process_No_Show_Fee`. This could trigger another small workflow or task for billing.
     - If first time and fee waived: Add Tag: `Status:No_Show_Fee_Waived_First_Time` for tracking goodwill.

##### Payment Workflows

**1. Payment Confirmation**
- **Trigger**: Tag Added → `Status:Payment_Received` (e.g., from Stripe integration webhook, manual update, or website booking form if payment is upfront).
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app payment received.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "PaymentReceived",
         "contactId": "{{contact.id}}",
         "invoiceId": "{{payment.invoice_id}}", // Example from GHL payment object if available
         "orderId": "{{order.id}}", // Or your system's order ID
         "amount": "{{payment.amount}}", // Example
         "paymentDate": "{{right_now.date}}",
         "paymentMethodType": "{{payment.method_type}}", // e.g., card, bank_transfer
         "timestamp": "{{right_now.date}}"
       }
       ```
  2. **Send SMS**: "Hi {{contact.first_name}}, we've successfully received your payment for Houston Mobile Notary Pros. Thank you! Your service is confirmed." (Adjust if service was already confirmed and this is post-service payment).
  3. **Send Email**: Official Receipt and Invoice.
     - Subject: "Your Payment Receipt from Houston Mobile Notary Pros - Invoice #[{{payment.invoice_id}}]"
     - Body: Detailed receipt, link to PDF invoice.
  4. **Update Custom Fields**:
     - `cf_payment_status`: "Completed" / "Paid"
     - `cf_payment_date`: {{right_now.date}}
     - `cf_payment_invoice_number`: {{payment.invoice_id}}
     - `cf_payment_amount_paid`: {{payment.amount}}
  5. **Remove Tag**: `Status:Payment_Pending` (if it was applied).
  6. **Add Tag**: `Status:Ready_For_Service` (if payment is pre-requisite and not yet applied) or `Status:Service_Paid` (if post-service).
  7. **If booking not yet confirmed and payment is prerequisite**: Trigger "Booking Confirmation & Preparation" workflow (e.g., by adding `Status:Booking_Confirmed` tag).

**2. Payment Reminders** (For services billed *after* completion or for outstanding invoices)
- **Trigger**: Tag Added → `Status:Payment_Pending` AND Invoice Due Date is approaching/past. (Or Opportunity Stage "Invoice Sent").
- **Actions**:
  1. **Wait Until**: 3 days before Invoice Due Date (`{{contact.cf_invoice_due_date}}`).
  2. **Send Email**: Gentle payment reminder with link to pay online.
     - Subject: "Friendly Reminder: Your Houston Mobile Notary Pros Invoice is due soon"
  3. **Add Tag**: `Payment:Reminder1_Sent`
  4. **Wait Until**: Invoice Due Date.
  5. **If/Else**: Check if tag `Status:Payment_Received` exists.
     - If NO:
       - Send SMS: "Hi {{contact.first_name}}, a quick reminder that your payment for Houston Mobile Notary Pros is due today. You can pay online here: [link_to_payment_portal]"
       - Send Email: "Payment Due Today: Houston Mobile Notary Pros Invoice #[{{payment.invoice_id}}]"
       - Add Tag: `Payment:Reminder2_Sent`
  6. **Wait**: 3 days after Invoice Due Date.
  7. **If/Else**: Check if tag `Status:Payment_Received` exists.
     - If NO:
       - Send Email: "Invoice Overdue: Please Settle Your Houston Mobile Notary Pros Payment" (firmer tone).
       - Add Tag: `Risk:Payment_Overdue`
       - Add Tag: `Payment:OverdueNotice1_Sent`
       - Create Task: "Manual payment follow-up required for {{contact.first_name}} (Invoice #[{{payment.invoice_id}}]). Discuss payment options if client is responsive."
         - Assigned to: Billing Team.
  8. **Wait**: 7 days after Invoice Due Date (Total 10 days overdue).
  9. **If/Else**: Check if tag `Status:Payment_Received` exists.
     - If NO:
       - Send Final Notice Email (Consider implications before automating registered mail or similar).
       - Add Tag: `Payment:FinalNotice_Sent`
       - Change Opportunity Stage: "Collections"
       - Trigger "Failed Payment Recovery" workflow or parts of it if it involves collection agency steps later.
       - **Custom Webhook / HTTP POST to webhook**: Notify web app final payment notice sent.
         - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
         - Body:
           ```json
           {
             "type": "PaymentFinalNoticeSent",
             "contactId": "{{contact.id}}",
             "invoiceId": "{{payment.invoice_id}}",
             "timestamp": "{{right_now.date}}"
           }
           ```

**3. Failed Payment Recovery** (For declined cards during booking, or failed scheduled payments)
- **Trigger**: Tag Added → `Status:Payment_Failed` (e.g., from Stripe integration webhook indicating a card decline) OR Payment Gateway Webhook indicating failure.
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app of payment failure.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "PaymentFailedNotification",
         "contactId": "{{contact.id}}",
         "reason": "{{payment.failure_reason}}", // If available from gateway
         "invoiceId": "{{payment.invoice_id}}", // If applicable
         "orderId": "{{order.id}}", // If applicable
         "amount": "{{payment.amount}}",
         "timestamp": "{{right_now.date}}"
       }
       ```
  2. **Send SMS** (immediate):
     ```
     Hi {{contact.first_name}}, we encountered an issue processing your payment for Houston Mobile Notary Pros. Your card was declined. Please update your payment method here: [link_to_secure_payment_update_page] or call us at 832-617-4285 to resolve this.
     ```
  3. **Send Email**: Detailed payment failure notification.
     - Subject: "Action Required: Payment Failed for Houston Mobile Notary Pros"
     - Body: Explain the issue, amount, service. Provide clear link to update payment method. Mention if service/booking is on hold.
  4. **Add Tag**: `Payment:Failed_Attempt_1`
  5. **Create Task**: "Follow up on failed payment for {{contact.first_name}}. Service/Booking: [Details]."
     - Assigned to: Billing Team / Customer Service.
     - Due: 24 hours.
  6. **Wait**: 24 hours.
  7. **If/Else Condition**: Check if tag `Status:Payment_Received` exists OR `Status:Payment_Method_Updated` tag exists.
     - If NO:
       - Send Follow-up SMS: "Gentle reminder: Your payment for HMNP is still pending due to a card issue. Please update your details: [link] or call us."
       - Send Follow-up Email: Similar to SMS, more detail.
       - Add Tag: `Payment:Failed_Attempt_2`
  8. **Wait**: 48 hours (total 72 hours since initial failure).
  9. **If/Else Condition**: Check if tag `Status:Payment_Received` exists.
     - If NO:
       - **Add Tag**: `Risk:Payment_Default_Candidate`
       - **Update Opportunity Stage** (if applicable): "Collections Review" or "On Hold - Payment Issue"
       - **Create Task**: "HIGH PRIORITY: Persistent payment failure for {{contact.first_name}}. Managerial review needed. Consider service suspension or alternative collection."
         - Assigned to: Manager / Senior Billing.
       - **Custom Webhook / HTTP POST to webhook**: Notify web app of escalation.
         - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
         - Body:
           ```json
           {
             "type": "PaymentFailedEscalation",
             "contactId": "{{contact.id}}",
             "invoiceId": "{{payment.invoice_id}}", // If applicable
             "orderId": "{{order.id}}", // If applicable
             "timestamp": "{{right_now.date}}"
           }
           ```
       - *Consider next steps: manual outreach, restricting service, or moving to formal collections based on amount/client history.*

**4. Refund Processing** (This workflow is distinct from failed payments)
- **Trigger**: Tag Added → `Status:Refund_Requested` (e.g., set manually by staff after verifying refund eligibility, or by an API call from your web app if a user requests it there and it's approved).
- **Actions**:
  1. **Custom Webhook / HTTP POST to webhook**: Notify web app that a refund has been formally requested and is pending processing.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "RefundRequested",
         "contactId": "{{contact.id}}",
         "amount": "{{contact.cf_refund_request_amount}}", // Custom field for requested refund amount
         "reason": "{{contact.cf_refund_request_reason}}", // Custom field for reason
         "originalInvoiceId": "{{contact.cf_original_invoice_id}}", // Custom field
         "timestamp": "{{right_now.date}}"
       }
       ```
  2. **Create Task**: "Process Refund: {{contact.first_name}} ({{contact.email}}). Amount: {{contact.cf_refund_request_amount}}. Reason: {{contact.cf_refund_request_reason}}. Original Inv: {{contact.cf_original_invoice_id}}."
     - Assigned to: Billing Team / Manager.
     - Due: 24-48 hours (depending on SLA).
     - Description: "Verify eligibility, process refund via [Payment_Gateway_Name], and then update GHL tags/fields."
  3. **Wait (Manual Step Indication)**: This workflow effectively pauses here. Staff performs the refund in the payment gateway (e.g., Stripe Dashboard). After successfully processing it, they apply the next tag in GHL.
  4. **Trigger (New, Separate Workflow Branch or linked from Task Completion):** Tag Added → `Status:Refund_Processed_Gateway` (Staff applies this tag MANUALLY after processing refund in the gateway).
     - **Send Email** to Client:
       - Subject: "Your Refund from Houston Mobile Notary Pros Has Been Processed"
       - Body: "Hi {{contact.first_name}}, we've processed your refund of ${{contact.cf_refund_processed_amount}}. Please allow 5-10 business days for it to reflect in your account, depending on your bank. Details: Refund ID [{{contact.cf_refund_gateway_transaction_id}}]."
     - **Update Custom Fields**:
       - `cf_refund_processed_amount`: (Enter actual amount refunded)
       - `cf_refund_processed_date`: {{right_now.date}}
       - `cf_refund_gateway_transaction_id`: (Staff enters this from gateway)
       - `cf_refund_status`: "Processed"
     - **Remove Tag**: `Status:Refund_Requested`
     - **Add Tag**: `Status:Refund_Completed`
     - **Custom Webhook / HTTP POST to webhook**: Notify web app refund was processed in the payment platform.
       - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
       - Body:
         ```json
         {
           "type": "RefundProcessedPlatform",
           "contactId": "{{contact.id}}",
           "amountRefunded": "{{contact.cf_refund_processed_amount}}",
           "gatewayTransactionId": "{{contact.cf_refund_gateway_transaction_id}}",
           "originalInvoiceId": "{{contact.cf_original_invoice_id}}",
           "timestamp": "{{right_now.date}}"
         }
         ```
     - **Remove Tag**: `Status:Refund_Processed_Gateway` (as this part of the workflow is now complete).
     - Optionally, update related Opportunity to "Closed Lost" or a specific "Refunded" stage.

##### Review & Feedback Workflows

**1. Post-Service Feedback Request**
- **Trigger**: Tag Added → `Action:RequestFeedback` (This tag is added by the "Service Completion Follow-up" workflow).
- **Actions**:
  1. **Wait**: 1 hour (short delay after `Action:RequestFeedback` tag is added).
  2. **Send SMS**:
     ```
     Hi {{contact.first_name}}! Thanks again for choosing Houston Mobile Notary Pros. To help us improve, could you rate your experience on a scale of 1-10 (10 being excellent)? Just reply with the number.
     ```
  3. **Add Tag**: `Feedback:Score_Request_Sent`
  4. **Wait for Reply (SMS - GHL Feature)**: Configure GHL to listen for a numeric reply for 24-48 hours.
     - **If Reply Received (Numeric 1-10)**:
       - `{{trigger.body}}` should contain the score.
       - **Update Custom Field**: `cf_satisfaction_score` = `{{trigger.body}}`.
       - **Custom Webhook / HTTP POST to webhook**: Notify web app of score.
         - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
         - Body:
           ```json
           {
             "type": "InternalFeedbackScoreReceived",
             "contactId": "{{contact.id}}",
             "score": "{{trigger.body}}",
             "channel": "SMS",
             "timestamp": "{{right_now.date}}"
           }
           ```
       - **If/Else Based on Score**:
         - If Score 9-10: Add Tag `Feedback:Positive`. Trigger "Review Request Sequence" (e.g., by adding tag `Action:RequestPublicReview`).
         - If Score 7-8: Add Tag `Feedback:Neutral`. Send follow-up SMS/Email: "Thanks for your feedback! Is there anything specific we could do to make your experience a 10 next time?" Create Task for manager to review neutral feedback.
         - If Score 1-6: Add Tag `Feedback:Negative`. Send follow-up SMS/Email (carefully worded): "Thank you for your honest feedback. We're sorry your experience wasn't perfect. A manager will reach out to you shortly to discuss how we can make things right." Create HIGH PRIORITY Task for Manager: "Address Negative Feedback - Score {{trigger.body}} from {{contact.first_name}}." Trigger Internal Alert (see framework).
       - **Add Tag**: `Feedback:Score_Received`.
     - **If NO Reply Received within 48 hours**:
       - Send Email: Same feedback request (1-10 scale).
       - If Email Reply (requires different GHL setup, e.g., form link): Process similarly.
       - Add Tag: `Feedback:Score_Request_FollowUpEmailSent`.
  5. **Original Webhook (TestimonialReceived) in documentation was misplaced here. It belongs in Testimonial Collection.**

**2. Review Request Sequence**
- **Trigger**: Tag Added → `Action:RequestPublicReview` (Added by "Post-Service Feedback Request" for positive scores).
- **Actions**:
  1. **Wait**: 1 hour (after positive internal feedback).
  2. **Send SMS**:
     ```
     That's fantastic to hear, {{contact.first_name}}! Since you had a great experience, would you mind sharing it on Google? It truly helps our small business reach others. Link: [your_google_review_link]
     ```
  3. **Send Email** (1 hour after SMS or simultaneously):
     - Subject: "Share Your Great Experience with Houston Mobile Notary Pros!"
     - Body: Thank them again. Provide direct links to Google Review, Yelp, and any other relevant platforms. Make it easy.
  4. **Add Tag**: `Review:Request1_Sent`
  5. **Wait**: 3 days.
  6. **If/Else**: Check if tag `Review:Completed` exists (staff adds this if they see a review, or use a review monitoring tool that integrates).
     - If NO:
       - Send Gentle Reminder Email: "Hi {{contact.first_name}}, just a friendly nudge. If you have a moment, a quick review would mean a lot! Google: [link], Yelp: [link]."
       - Add Tag: `Review:Request2_Sent`
  7. **Wait**: 4 days.
  8. **If/Else**: Still no `Review:Completed` tag?
     - If NO:
       - Send Final Request Email (optional, can be softer): "Hi {{contact.first_name}}, one last quick reminder if you're able to share your thoughts. We value your business! [links]." Consider offering a small, non-monetary incentive for *leaving* feedback (not for a *positive* review, to comply with platform policies), like entry into a draw, if appropriate for your business.
       - Add Tag: `Review:Request3_Sent`
  9. **Add Tag**: `Workflow:Review_Sequence_Complete`.

**3. Testimonial Collection**
- **Trigger**: Tag Added → `Review:Completed` (and review sentiment is positive) OR `Feedback:Positive` (and score is 9-10, even if no public review left yet) OR Manually by staff (`Action:RequestTestimonial`).
- **Actions**:
  1. **Wait**: 1 day (after review or high internal feedback).
  2. **Send Email**:
     - Subject: "Could We Feature Your Experience, {{contact.first_name}}?"
     - Body: "Hi {{contact.first_name}}, we were so pleased with your positive feedback/review! We'd be honored if you'd allow us to feature your comments (and perhaps first name/last initial) as a testimonial on our website. If you're open to this, please reply YES. If you have a specific quote you'd like us to use, feel free to send it over! You can also submit it here: [link_to_testimonial_submission_form_on_your_site]."
  3. **Wait for Reply / Form Submission**:
  4. **If/Else**: Check custom field `cf_consent_display_testimonial` = YES (updated by reply or form) OR if they reply YES to email (manual update of CF by staff).
     - If YES:
       - **Add Tag**: `Marketing:Testimonial_Approved`
       - **Update Custom Field**: `cf_testimonial_text` (copy paste from email/form).
       - **Custom Webhook / HTTP POST to webhook**: Notify web app testimonial received and approved.
         - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
         - Body:
           ```json
           {
             "type": "TestimonialReceived",
             "contactId": "{{contact.id}}",
             "testimonialText": "{{contact.cf_testimonial_text}}",
             "consentGiven": "true",
             "timestamp": "{{right_now.date}}"
           }
           ```
       - Create Task: "Add new testimonial from {{contact.first_name}} to website."
     - If NO reply or NO consent: End.
  5. **Original Webhook (TestimonialReceived) in documentation was specified multiple times, this is its correct conceptual placement.**

#### NEW: Advanced Client & Business Growth Workflows

##### 1. Client Onboarding Workflow (for complex/multi-step services)
- **Purpose**: Ensure clients are fully prepared for specialized services (e.g., Loan Signings, Apostilles), reducing friction, errors, and improving service delivery efficiency.
- **Trigger**: Tag Added → `Status:Booking_Confirmed` AND Custom Field `cf_booking_service_type` IS `Service:LOAN_SIGNING_SPECIALIST` (or other designated complex services identified by a list or specific tags).
- **Actions**:
  1. **Send Email**: "Welcome & Next Steps for Your {{contact.cf_booking_service_type}}"
     - Includes:
       - Personalized greeting.
       - Reconfirm appointment details.
       - Detailed checklist of required documents (e.g., "Valid, unexpired government-issued Photo ID for ALL signers," "ALL pages of the loan documents printed single-sided").
       - What to expect during the appointment.
       - Link to an FAQ page on your website for this service type.
  2. **If Document Review/Submission is Required PRE-APPOINTMENT**:
     - Send Email/SMS: "Action Required: Please submit your documents for review via our Secure Portal: [Secure_Portal_Link] at least 24 hours before your {{contact.cf_booking_service_type}} appointment. This ensures a smooth process."
     - Add Tag: `Onboarding:Docs_Requested`
     - Wait 24 hours (or until 48 hours before appointment).
     - If/Else: Check if custom field `cf_onboarding_documents_received` is YES (updated manually or via portal integration).
       - If NO: Send Reminder SMS/Email for document submission. Create Task for staff: "Follow up: {{contact.first_name}} - Documents for {{contact.cf_booking_service_type}} not yet received."
  3. **Custom Webhook / HTTP POST to webhook**: Notify web app client onboarding process has started.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "ClientOnboardingStarted",
         "contactId": "{{contact.id}}",
         "bookingIdGHL": "{{appointment.id}}",
         "serviceType": "{{contact.cf_booking_service_type}}",
         "timestamp": "{{right_now.date}}"
       }
       ```
  4. **Wait Until**: 48 hours before appointment (if a brief prep call is offered or beneficial for this service type).
  5. **Optional Prep Call Offer**:
     - Send Email/SMS: "Getting Ready for Your {{contact.cf_booking_service_type}}? If you have any final questions, feel free to reply here or book a quick 10-minute prep call: [link_to_prep_call_calendar_for_this_service]."
  6. **Add Tag**: `Workflow:Client_Onboarding_In_Progress`
  7. **After all prerequisite steps are met (e.g., documents received, prep call done if booked) or by 24hrs before appointment**:
     - Add Tag: `Status:Client_Ready_For_Service` (Notary can see this)
     - Remove Tag: `Onboarding:Docs_Requested`
  8. **Custom Webhook / HTTP POST to webhook**: Notify web app client is confirmed ready.
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "ClientDeclaredReadyForService",
         "contactId": "{{contact.id}}",
         "bookingIdGHL": "{{appointment.id}}",
         "timestamp": "{{right_now.date}}"
       }
       ```

##### 2. Referral Program Workflow
- **Purpose**: Systematically encourage, track, and reward client referrals to drive new business.
- **Part A: Offering Referral Opportunity**
  - **Trigger**: Tag Added → `Feedback:Positive` (e.g., after high satisfaction score of 9-10) OR `Review:Completed` (with positive sentiment) OR Manually by staff adding `Potential:Referrer` tag.
  - **Actions**:
    1. **Wait**: 1-2 days (to not overwhelm immediately after review/feedback).
    2. **Send Email**:
       - Subject: "Share the Love for Houston Mobile Notary Pros & Get Rewarded!"
       - Body: "Hi {{contact.first_name}}, we're thrilled you had a great experience! Know someone else who could benefit from our notary services? Refer them, and when they complete their first service, **you'll receive [Your_Referral_Incentive_For_Referrer - e.g., a $10 Amazon Gift Card / 15% off your next service]** and **they'll get [Incentive_For_Referred_Friend - e.g., 10% off their first service]!**
       How to refer:
         1. Tell them to mention your name: **{{contact.full_name}}** when they book.
         2. Or, share this unique code with them: **{{contact.cf_unique_referral_code}}** (Requires GHL to generate/store this, or use a simpler name mention).
         We appreciate your support!"
    3. **Update Custom Field**: `cf_referral_code_assigned` = {{contact.cf_unique_referral_code}} (if using codes).
    4. **Add Tag**: `Marketing:Referral_Program_Offered`
    5. **Custom Webhook / HTTP POST to webhook**: Notify web app referral offer made.
       - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
       - Body:
         ```json
         {
           "type": "ReferralOfferSent",
           "contactId": "{{contact.id}}",
           "referralCodeOffered": "{{contact.cf_unique_referral_code}}", // If applicable
           "incentiveDetails": "Referrer: [Your_Incentive], Referred: [Friend_Incentive]",
           "timestamp": "{{right_now.date}}"
         }
         ```

- **Part B: Tracking New Referred Leads**
  - *(This relies on your website forms having a "Referred by?" field mapping to `cf_referred_by_name_or_email` or `cf_referral_code_used`)*
  - **Workflow Name**: New Lead - Referral Check
  - **Trigger**: Contact Created AND (`cf_referred_by_name_or_email` is not empty OR `cf_referral_code_used` is not empty).
  - **Actions**:
    1. **Add Tag to New Lead**: `Source:Referral`, `Status:New_Lead`
    2. **Attempt to Link Referrer**:
       - If `cf_referral_code_used` is present: Search for contact with matching `cf_unique_referral_code`.
       - If `cf_referred_by_name_or_email` is present: Search for contact matching name/email.
       - If Referrer Found:
         - Update New Lead's custom field `cf_referrer_contact_id` = {{found_referrer_contact.id}}.
         - Add Tag to Referrer: `Referral:Lead_Generated_By_Me`
         - Create Task for Staff (Optional, for verification): "Verify referral: New lead {{contact.full_name}} referred by {{found_referrer_contact.full_name}}."
    3. **Custom Webhook / HTTP POST to webhook**: Notify web app of new referred lead.
       - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
       - Body:
         ```json
         {
           "type": "NewReferralReceived",
           "newLeadContactId": "{{contact.id}}",
           "referredByText": "{{contact.cf_referred_by_name_or_email}}",
           "referralCodeUsed": "{{contact.cf_referral_code_used}}",
           "linkedReferrerContactId": "{{contact.cf_referrer_contact_id}}", // If successfully linked
           "timestamp": "{{right_now.date}}"
         }
         ```
    4. **Apply Discount to New Lead (if applicable)**: If referral includes discount for the new lead, update opportunity value or add a "Referral Discount Applied" tag/note.

- **Part C: Referral Conversion & Reward Fulfillment**
  - **Workflow Name**: Referral Conversion Reward
  - **Trigger**: Tag Added to **Referred Lead** → `Status:Service_Completed` (or `Status:Payment_Received`) AND `cf_referrer_contact_id` is not empty.
  - **Actions**:
    1. **Identify Referrer**: Use `{{contact.cf_referrer_contact_id}}` (the ID of the original referrer, stored on the new lead's contact record).
    2. **Add Tag to Referrer**: `Referral:Conversion_Achieved`
    3. **Fulfill Incentive for Referrer**:
       - If $X Gift Card: Send Email to Referrer: "Great news! Your referral {{contact.full_name}} completed their service. As a thank you, here's your [Gift_Card_Details_or_Code].". Create Task for staff to manually send code if not automated.
       - If Discount on Next Service: Update custom field `cf_account_credit_referrer` for Referrer, or add tag `Discount:Referral_Bonus_Available`. Send Email: "Your referral {{contact.full_name}} completed their service! A [Discount_Details] has been applied to your account for your next service."
    4. **Add Tag to Referred Lead**: `Referral:Converted_Client` (for tracking).
    5. **Custom Webhook / HTTP POST to webhook**: Notify web app of successful referral conversion and reward.
       - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
       - Body:
         ```json
         {
           "type": "ReferralConvertedAndRewarded",
           "referredClientContactId": "{{contact.id}}", // This is the new client
           "referrerContactId": "{{contact.cf_referrer_contact_id}}", // This is the original referrer
           "incentiveAppliedToReferrer": "Details of incentive provided",
           "timestamp": "{{right_now.date}}"
         }
         ```

##### 3. Inactive Client Re-engagement Workflow
- **Purpose**: Re-activate past clients who haven't booked or significantly interacted for a defined period.
- **Trigger**: Workflow entry via a Smart List (e.g., "Clients with Last Appointment Date > 6 months ago AND No Open Opportunity AND No Recent Email Engagement"). GHL Smart Lists can add contacts to workflows.
  - Alternative Trigger: Based on a "Last Service Date" custom field, check periodically.
- **Actions**:
  1. **Initial Check**: Contact enters workflow. Wait 1 day (buffer).
  2. **Segment (Optional but Recommended)**: If possible, segment based on past service type (`cf_last_service_type`) or value (`cf_lifetime_value`).
  3. **Send Re-engagement Email #1**:
     - Subject (Varies by segment): "We Miss You, {{contact.first_name}}! Need Notary Services Again?" or "A Quick Hello from Houston Mobile Notary Pros"
     - Body: Personalized, friendly. "It's been a while since your last {{contact.cf_last_service_type_friendly_name | default: 'service with us'}}." Briefly mention any new services or a small, time-sensitive "welcome back" offer (e.g., 10% off next service booked in 30 days).
  4. **Add Tag**: `Marketing:ReEngagement_Email1_Sent`
  5. **Custom Webhook / HTTP POST to webhook**:
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "ClientReEngagementAttempt",
         "contactId": "{{contact.id}}",
         "attemptNumber": 1,
         "segment": "{{contact.cf_reengagement_segment}}", // If segmented
         "offerDetails": "10% off welcome back",
         "timestamp": "{{right_now.date}}"
       }
       ```
  6. **Wait**: 30 days.
  7. **If/Else Condition**: Check for re-engagement signals: New Opportunity Created OR Tag `Status:Booking_Requested` added OR significant Email Click/Reply (if trackable).
     - If YES Re-engaged:
       - Add Tag: `Status:Client_ReEngaged`
       - Remove from this re-engagement workflow.
       - Webhook: `ClientReEngaged` (details similar to above, but indicating success).
     - If NO Re-engagement:
       - **Send Re-engagement Email #2** (Different content/offer):
         - Subject: "A Notary Tip from Your Friends at HMNP" or "Still Thinking About Notary Needs?"
         - Body: Provide a piece of valuable content (e.g., "When is notarization legally required?") or a different, perhaps softer offer or reminder of core services.
       - Add Tag: `Marketing:ReEngagement_Email2_Sent`
       - Webhook (attemptNumber: 2, different offer details).
  8. **Wait**: 30-60 days.
  9. **If/Else Condition**: Check for re-engagement signals again.
     - If YES Re-engaged: (Same as above - tag, remove, webhook).
     - If NO Re-engagement:
       - **Add Tag**: `Status:Dormant_Client` (or `Status:Inactive_LongTerm`)
       - **Reduce Communication Frequency**: Potentially move to a very infrequent "Annual Check-in" list or exclude from most marketing.
       - Webhook:
         ```json
         {
           "type": "ClientMarkedDormant",
           "contactId": "{{contact.id}}",
           "reason": "Failed re-engagement sequence",
           "timestamp": "{{right_now.date}}"
         }
         ```
       - Remove from active re-engagement workflow.

##### 4. Internal Alert & Escalation Workflow Framework (Conceptual Guide)
- **Purpose**: This isn't a single, standalone GHL workflow but a standardized set of actions and principles to incorporate into *other* workflows where critical events require immediate internal attention or escalation.
- **Common Scenarios for Alerts/Escalations**:
  - **Payments**: Multiple `Status:Payment_Failed` tags for a high-value client (e.g., `cf_client_tier` = VIP or `cf_lifetime_value` > $X).
  - **Feedback**: `InternalFeedbackScoreReceived` with a score of 1-3.
  - **Leads**: New lead with `cf_service_type` containing "URGENT" or "LEGAL EMERGENCY" and `cf_preferred_call_time` = "ASAP".
  - **Opportunities**: High-value opportunity (`opportunity.value` > $Y) stagnant in "Quote Sent" stage for > Z days.
  - **Service Issues**: Tag `Service:Issue_Reported` applied by notary/staff.
- **Standard Components for an Alert/Escalation Step (to be added within relevant workflows)**:
  1. **Trigger Condition**: Defined within the parent workflow (e.g., If Score < 4...).
  2. **Send Internal Notification (Email and/or SMS via GHL)**:
     - To: Designated manager, team lead, or specific user/alias (e.g., `escalations@yourdomain.com`).
     - Subject/SMS Prefix: "URGENT GHL ALERT:" or "ESCALATION:"
     - Body: "CRITICAL ALERT: [Specific_Alert_Type] for Client: {{contact.full_name}} (ID: {{contact.id}}). Details: [Provide key data like opportunity name, feedback score, payment amount, issue description from custom fields]. Please investigate immediately."
  3. **Create High-Priority Task in GHL**:
     - Title: "ESCALATION: [Alert_Type] - {{contact.full_name}}"
     - Description: Full context of the issue, link to the contact record, opportunity, and any relevant notes. "Action: Review and resolve. Update status within X hours."
     - Assigned to: Specific manager or escalation team.
     - Due Date: Immediate or within 1-4 hours.
  4. **Update Opportunity (if applicable)**:
     - Change Stage to "Escalated Review" or "Urgent Action Required".
     - Add a Note to the Opportunity with alert details.
  5. **Add Specific Escalation Tag**: e.g., `Alert:Escalated_VIP_Payment`, `Alert:Escalated_NegativeFeedback`, `Alert:Escalated_UrgentLead`. This helps in tracking types and frequency of escalations.
  6. **Custom Webhook / HTTP POST to webhook (Optional but Recommended for advanced tracking)**:
     - URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
     - Body:
       ```json
       {
         "type": "CriticalAlertTriggered",
         "contactId": "{{contact.id}}",
         "opportunityId": "{{opportunity.id}}", // If relevant
         "alertType": "[Specific_Alert_Type_e.g.,VIP_Payment_Failed_Escalation]",
         "priority": "High",
         "description": "Brief description of issue from GHL.",
         "triggeringWorkflow": "[Name_Of_Parent_Workflow_That_Triggered_It]",
         "relevantData": { // Include key fields that triggered alert
           "feedbackScore": "{{contact.cf_satisfaction_score}}",
           "paymentAttempts": "{{contact.cf_payment_failed_attempts}}"
         },
         "timestamp": "{{right_now.date}}"
       }
       ```
- **Implementation Note**: When designing each primary workflow (Leads, Bookings, Payments, Feedback), identify points where failure to meet a standard or a critical event occurs. At these points, insert the above alert/escalation actions.

---

### 10. Communication Templates {#communication-templates}

#### SMS Templates

**Welcome SMS**
```
Hi {{contact.first_name}}! Thanks for your interest in Houston Mobile Notary Pros. I'll be reaching out within 24 hours to discuss your notary needs. Quick question - what type of document do you need notarized?
```

**Booking Confirmation SMS**
```
Great! Your notary appointment is confirmed for {{contact.cf_appointment_date}} at {{contact.cf_appointment_time}}. I'll send a reminder 1 hour before our meeting.
```

**Complete template list**: See [Communication Templates Reference](#communication-templates-reference)

### 11. SMS & Scheduling Setup {#sms-scheduling}

#### SMS Configuration

**SMS Service** (`lib/sms.ts`):
- GHL API integration for SMS
- Consent checking before sending
- Template management
- Error handling

**Key Functions:**
```typescript
sendSms(to, message)
checkSmsConsent(contactId)
sendAppointmentReminderSms(booking)
```

#### Automated Scheduling

**Cron Jobs** (External Scheduler like cron-job.org):
```json
{
  "crons": [
    {
      "path": "/api/cron/appointment-reminders?type=24hr",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/appointment-reminders?type=2hr",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/cron/booking-automation",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## Part 4: Testing & Deployment

### 12. Testing Procedures {#testing}

#### Component Testing

**1. Test API Connection**
```bash
node scripts/test-ghl-connection.js
```

**2. Test Custom Fields**
```bash
node scripts/check-ghl-custom-fields.js
```

**3. Test Webhook Endpoints**
```bash
curl -X POST https://localhost:3000/api/webhooks/ghl \
  -H "Content-Type: application/json" \
  -d '{"type":"ContactCreate","contactId":"test123"}'
```

#### End-to-End Testing

**Test Scenarios:**
1. New lead flow (form → GHL → workflows)
2. Booking flow (form → payment → confirmation)
3. Appointment reminders (all intervals)
4. Payment workflows (success/failure)
5. Review request sequence

### 13. Go-Live Checklist {#go-live-checklist}

#### Pre-Launch
- [ ] All environment variables set
- [ ] Custom fields created in GHL
- [ ] Tags created in GHL
- [ ] Pipeline created with all stages
- [ ] Workflows created and activated
- [ ] Webhook endpoints tested
- [ ] SMS consent process verified
- [ ] Payment integration tested
- [ ] Communication templates approved

#### Launch Day
- [ ] Deploy application
- [ ] Activate all workflows
- [ ] Test with real contact
- [ ] Monitor logs for errors
- [ ] Verify webhook delivery
- [ ] Check SMS/email delivery

#### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Review automation metrics
- [ ] Gather team feedback
- [ ] Document any issues
- [ ] Plan optimizations

### 14. Monitoring & Maintenance {#monitoring}

#### Daily Monitoring
- Check cron job execution logs
- Review webhook success rates
- Monitor SMS/email delivery
- Check for failed payments

#### Weekly Tasks
- Review automation metrics
- Analyze conversion rates
- Check for stuck workflows
- Update team on performance

#### Monthly Tasks
- Audit custom fields usage
- Review and clean up tags
- Optimize workflow performance
- Update documentation

---

## Appendices

### A. Custom Fields Reference {#custom-fields-reference}
[Complete list of 150+ custom fields with descriptions, types, and usage]

### B. Tags Reference {#tags-reference}
[Complete list of 118 tags organized by category]

### C. Webhook Templates {#webhook-templates}
[JSON templates for all webhook configurations]

### D. Workflow Templates {#workflow-templates}
[Step-by-step workflow configurations]

### E. Communication Templates Reference {#communication-templates-reference}
[All SMS and email templates]

### F. Form Integration Reference {#form-integration-reference}
[Detailed form-to-GHL field mappings]

### G. Troubleshooting Guide
[Common issues and solutions]

---

**IMPORTANT NOTE ON APPENDICES**: Appendices A (Custom Fields Reference), B (Tags Reference), C (Webhook Templates), D (Workflow Templates - Detailed Step-by-Step GHL Configurations), E (Communication Templates Reference), and F (Form Integration Reference) are referenced throughout this guide and are **CRITICAL** for the full implementation of this GoHighLevel setup.

They currently serve as placeholders (e.g., "[Complete list of...]") and **MUST BE POPULATED** with the specific, detailed configurations, JSON bodies, template texts, and field mappings they describe. Without this detailed content, the workflows, integrations, and setup steps outlined in this master guide cannot be fully executed in GoHighLevel. This detailed documentation is essential for current setup, future maintenance, and team training.

---

**Last Updated**: January 2025
**Version**: 2.0
**Maintained By**: HMNP Development Team 