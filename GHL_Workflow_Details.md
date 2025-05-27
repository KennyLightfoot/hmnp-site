## GoHighLevel Workflow Setup

This document outlines the triggers and actions for each workflow, including message content for communications.

---

### If/Else Condition Setup Guide

#### Basic Structure
1. **Add If/Else Action**
   * Click "+" in workflow builder
   * Select "If/Else" action
   * Name branches for clarity (e.g., "High Priority" vs "Standard Lead")

2. **Configure Conditions**
   * **Branch A (Primary Condition)**
     * Select Segment Type:
       * Contact Details (standard fields)
       * Custom Fields (e.g., `cf_contact_inquiry_subject`)
       * Contact Tags (e.g., `Status:Contacted`)
       * Opportunity Details (stage, status, value)
       * Workflow Status
       * Events (email opens, SMS replies)
     * Choose Field/Tag
     * Select Operator:
       * "Is" / "Is not"
       * "Contains" / "Does not contain"
       * "Exists" / "Does not exist"
       * "Greater than" / "Less than"
       * "Is empty" / "Is not empty"
     * Enter Value (if applicable)
     * Add multiple conditions with AND/OR logic

   * **Branch B (Else/Default Path)**
     * Configure if different from default "No" path
     * Often used for standard/default processing

#### Common Examples

1. **Tag-Based Conditions**
   ```plaintext
   If Contact Tags
   - Field: Status:Contacted
   - Operator: Exists
   Then: End Workflow
   Else: Send Follow-up
   ```

2. **Custom Field Conditions**
   ```plaintext
   If Contact Details
   - Field: cf_contact_inquiry_subject
   - Operator: Contains
   - Value: "Urgent"
   Then: High Priority Path
   Else: Standard Path
   ```

3. **Opportunity Stage Conditions**
   ```plaintext
   If Opportunity
   - Field: Pipeline Stage
   - Operator: Is
   - Value: "Booked"
   Then: End Follow-up
   Else: Continue Follow-up
   ```

4. **Combined Conditions**
   ```plaintext
   If (Contact Tags: Status:Booking_Requested Exists)
   OR (Opportunity Stage Is "Booked")
   Then: End Workflow
   Else: Send Reminder
   ```

5. **Time-Based Conditions**
   ```plaintext
   If Contact Details
   - Field: cf_last_contact_date
   - Operator: Is greater than
   - Value: 30 days ago
   Then: Send Re-engagement
   Else: Continue Nurture
   ```

6. **Service Type Conditions**
   ```plaintext
   If Contact Details
   - Field: cf_booking_service_type
   - Operator: Is
   - Value: "LOAN_SIGNING_SPECIALIST"
   Then: Trigger Loan Signing Prep
   Else: Standard Service Prep
   ```

7. **Payment Status Conditions**
   ```plaintext
   If Contact Tags
   - Field: Status:Payment_Received
   - Operator: Exists
   Then: Proceed with Booking
   Else: Send Payment Reminder
   ```

8. **Location-Based Conditions**
   ```plaintext
   If Contact Details
   - Field: cf_service_zip_code
   - Operator: Is in list
   - Value: ["77001", "77002", "77003"]
   Then: Standard Service Area
   Else: Extended Service Area
   ```

9. **Feedback Score Conditions**
   ```plaintext
   If Contact Details
   - Field: cf_satisfaction_score
   - Operator: Is greater than or equal to
   - Value: 9
   Then: Request Review
   Else: Send Improvement Survey
   ```

10. **Multiple AND Conditions**
    ```plaintext
    If (Contact Tags: Status:New_Lead Exists)
    AND (Contact Details: cf_contact_inquiry_subject Contains "Urgent")
    AND (Contact Details: cf_service_type Is "LOAN_SIGNING")
    Then: High Priority Loan Signing Path
    Else: Standard New Lead Path
    ```

11. **No-Show Handling Conditions**
    ```plaintext
    If Contact Details
    - Field: cf_no_show_count
    - Operator: Is greater than
    - Value: 1
    Then: Apply No-Show Fee
    Else: Waive First-Time Fee
    ```

12. **Referral Program Conditions**
    ```plaintext
    If (Contact Tags: Feedback:Positive Exists)
    AND (Contact Details: cf_satisfaction_score Is greater than or equal to 9)
    Then: Offer Referral Program
    Else: Continue Standard Follow-up
    ```

#### Best Practices
1. **Wait Steps**
   * Add appropriate wait times before If/Else
   * Allow time for actions to complete
   * Consider manual intervention time

2. **Testing**
   * Test each branch thoroughly
   * Verify conditions are met
   * Check default paths

3. **Documentation**
   * Name branches clearly
   * Document conditions
   * Note expected outcomes

4. **Maintenance**
   * Review conditions regularly
   * Update as business rules change
   * Monitor workflow performance

---

### Lead Management Workflows

#### 1. New Lead Welcome Sequence 40230ec0-9a2a-4129-83e5-3a2eea2a2aab

*   **Workflow Name**: New Lead Welcome Sequence
*   **Trigger**: Tag Added → `Status:New_Lead`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app about the new lead.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
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
    2.  **If/Else Condition**: Based on `cf_contact_inquiry_subject` or other lead scoring fields.
        *   Path A (Standard Lead): Continue.
        *   Path B (High Priority/Specific Service Lead): Adjust task assignment, potentially trigger different initial communication.
    3.  **Wait**: 5 minutes
    4.  **Send SMS** (if consent given):
        ```
        Hi {{contact.first_name}}! Thanks for reaching out to Houston Mobile Notary Pros.
        I'll review your inquiry and get back to you within 24 hours.
        What type of document do you need notarized?
        ```
    5.  **Send Email**:
        *   Subject: "Thank you for contacting Houston Mobile Notary Pros"
        *   Use welcome email template.
    6.  **Custom Webhook / HTTP POST to webhook**: Notify web app that initial contact messages have been sent.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "LeadWelcomeMessageSent",
              "contactId": "{{contact.id}}",
              "smsSent": "true",
              "emailSent": "true",
              "segment": "Standard",
              "timestamp": "{{right_now.date}}"
            }
            ```
    7.  **Create Task**: "Follow up with new lead"
        *   Assigned to: Team member.
        *   Due: 24 hours.
    8.  **Add Tag**: `Workflow:Welcome_Sequence_Started`
    9.  **Wait**: 24 hours
    10. **If/Else Condition**: Check if tag `Status:Contacted` exists.
        *   If NO:
            *   Send follow-up SMS/Email (Content not specified, use appropriate follow-up message)
            *   **Custom Webhook / HTTP POST to webhook**: Notify web app about follow-up attempt.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "LeadFollowUpAttempted",
                      "contactId": "{{contact.id}}",
                      "attemptNumber": "1",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```
        *   If YES: End workflow.

---

#### 2. Hot Prospect Follow-up  1084e838-1c3a-49ba-ac43-6577afa5271a

*   **Workflow Name**: Hot Prospect Follow-up
*   **Trigger**: Tag Added → `Status:Hot_Prospect`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app about a hot prospect.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "HotProspectIdentified",
              "contactId": "{{contact.id}}",
              "timestamp": "{{right_now.date}}"
            }
            ```
    2.  **Send SMS** (immediate):
        ```
        Hi {{contact.first_name}}! I noticed you're looking for urgent notary services.
        I'm available today. Call me at 832-617-4285 or reply with your preferred time.
        ```
    3.  **Create Task**: "Call hot prospect immediately: {{contact.first_name}}"
        *   Priority: High
        *   Due: 1 hour
        *   Escalation: If task not marked complete in 30 minutes, send internal notification (SMS/Email) to Sales Manager: "Hot Prospect {{contact.first_name}} needs immediate attention."
    4.  **Wait**: 2 hours
    5.  **If/Else**: Check if tag `Status:Contacted` exists.
        *   If NO: Send second SMS attempt: "Hi {{contact.first_name}}, just checking in. Are you still looking for urgent notary help? Let me know."
    6.  **Add to Campaign**: Fast-track booking sequence.
    7.  **Custom Webhook / HTTP POST to webhook**: Notify web app that prospect added to fast-track campaign.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "HotProspectCampaignAdd",
              "contactId": "{{contact.id}}",
              "campaignName": "Fast-track booking sequence",
              "timestamp": "{{right_now.date}}"
            }
            ```

---

#### 3. Quote Follow-up Automation

*   **Workflow Name**: Quote Follow-up Automation
*   **Trigger**: Tag Added → `Status:Quote_Sent`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app that a quote was sent.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "QuoteSent",
              "contactId": "{{contact.id}}",
              "quoteAmount": "{{opportunity.value}}",
              "timestamp": "{{right_now.date}}"
            }
            ```
    2.  **Wait**: 24 hours
    3.  **Send Email**: Quote follow-up template (e.g., "Any questions about your notary quote?").
    4.  **Wait**: 2 days
    5.  **If/Else**: Check if tag `Status:Booking_Requested` exists OR Opportunity Stage changed to "Booked".
        *   If NO: Send SMS reminder about quote: "Hi {{contact.first_name}}, following up on the notary quote we sent. Let me know if you'd like to proceed or have questions!"
    6.  **Wait**: 3 days
    7.  **If/Else**: Still no booking?
        *   If NO: Send "Special Offer" email with a small, time-sensitive incentive (e.g., 5-10% discount if booked in 48 hours).
        *   Add Tag: `Marketing:Quote_Offer_Sent`
    8.  **Wait**: 2 days
    9.  **If/Else**: Still no booking?
        *   If NO (Deal Potentially Lost):
            *   Send Final Follow-up Email: "Checking in one last time on your notary quote. If you've decided to go another way or your needs have changed, we understand. We'd appreciate any brief feedback if you're open to sharing (e.g., price, found alternative, timing not right?). This helps us improve."
            *   **Add Tag**: `Status:Deal_Lost_FollowUpSent`
            *   Create Task: "Review unresponsive quote for {{contact.first_name}} - consider closing opportunity."
            *   **Custom Webhook / HTTP POST to webhook**: Notify web app of potential lost deal.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "DealLostFollowUpSent",
                      "contactId": "{{contact.id}}",
                      "quoteId": "{{opportunity.quote_id}}",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```
        *   If YES (Booked): End workflow.
    10. **Add Tag**: `Marketing:Quote_Follow_Up_Complete` (if not booked).
    11. **Custom Webhook / HTTP POST to webhook**: Notify web app quote follow-up sequence completed status.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "QuoteFollowUpComplete",
              "contactId": "{{contact.id}}",
              "booked": "{{contact.tags contains 'Status:Booking_Requested' or opportunity.status == 'won'}}",
              "timestamp": "{{right_now.date}}"
            }
            ```

---

#### 4. Long-term Nurture

*   **Workflow Name**: Long-term Nurture
*   **Trigger**: Tag Added → `Status:Long_Term_Nurture`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app contact added to long-term nurture.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "LongTermNurtureStart",
              "contactId": "{{contact.id}}",
              "timestamp": "{{right_now.date}}"
            }
            ```
    2.  **Add to Segmented Campaign/Workflow**: Based on past service types, interests, or lead source.
        *   Example Segments: `Nurture:General_Notary`, `Nurture:Loan_Signing_Info`, `Nurture:Business_Clients`.
    3.  **Wait**: 30 days
    4.  **Send Segmented Email**: Educational content, tips, or service reminders.
        *   E.g., Loan Signing segment: "Tips for a Smooth Loan Closing."
        *   E.g., General Notary segment: "Common Documents That Require Notarization."
    5.  **Wait**: 30-60 days
    6.  **Send Segmented Email**: Different content piece, seasonal reminder, or soft offer.
    7.  **Repeat**: Cycle through relevant content periodically.
    8.  **Monitor Engagement**: Adjust tags/frequency based on engagement.

---

### Booking & Service Workflows

#### 1. Booking Confirmation & Preparation

*   **Workflow Name**: Booking Confirmation & Preparation
*   **Trigger**: Tag Added → `Status:Booking_Confirmed` (or Opportunity Stage "Booked" AND Payment Received)
*   **Actions**:
    1.  **Send SMS** (immediate):
        ```
        Booking confirmed! Your notary appointment with Houston Mobile Notary Pros is scheduled for
        {{contact.cf_booking_appointment_datetime}}.
        I'll send you a reminder 24 hours before. Any questions, just reply here!
        ```
    2.  **Send Email**: Detailed booking confirmation.
        *   Subject: "Your Notary Appointment is Confirmed: {{contact.cf_booking_appointment_datetime}}"
        *   Body: Include all details: service, date/time, address, price, what to prepare (e.g., "Please have valid Photo ID for all signers. For Loan Signings, ensure all documents are printed and ready."). Link to FAQ.
    3.  **Update Custom Fields**: `cf_booking_status`: "Confirmed", `cf_confirmation_sent_at`: `{{current_timestamp}}`
    4.  **Create Calendar Event**.
    5.  **Add Tag**: `Workflow:Booking_Confirmation_Sent`
    6.  **Custom Webhook / HTTP POST to webhook**: Notify web app about booking confirmation.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "BookingConfirmed",
              "contactId": "{{contact.id}}",
              "bookingIdGHL": "{{appointment.id}}",
              "bookingDateTime": "{{contact.cf_booking_appointment_datetime}}",
              "serviceAddress": "{{contact.cf_booking_service_address}}",
              "serviceType": "{{contact.cf_booking_service_type}}",
              "numberOfSigners": "{{contact.cf_booking_number_of_signers}}",
              "specialInstructions": "{{contact.cf_booking_special_instructions}}",
              "timestamp": "{{right_now.date}}"
            }
            ```

---

#### 2. Appointment Reminders

*   **Workflow Name**: Appointment Reminders
*   **Trigger**: Appointment Status → Scheduled (or linked from Booking Confirmation)
*   **Actions**:

    *   **24-Hour Reminder Branch**:
        1.  **Wait Until**: 24 hours before `{{contact.cf_booking_appointment_datetime}}`.
        2.  **Send SMS**:
            ```
            Reminder: Your notary appointment with Houston Mobile Notary Pros is tomorrow at {{contact.cf_booking_appointment_time_only}} at {{contact.cf_booking_service_address}}. Please reply YES to confirm or call 832-617-4285 if you need to reschedule.
            ```
        3.  **Send Email**: Appointment preparation checklist, ID requirements, map/directions.
        4.  **Add Tag**: `Reminder:24hr_Sent`
        5.  **Custom Webhook / HTTP POST to webhook**: Log 24hr reminder.
            *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
            *   Body:
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
        6.  **Wait for Reply (SMS)**: For "YES".
            *   If "YES": Add Tag `Status:Appointment_Confirmed_24hr`.
            *   If NO reply within 12 hours: Create Task: "Manual check-in for {{contact.first_name}} - 24hr reminder unconfirmed."

    *   **2-Hour Reminder Branch**:
        1.  **Wait Until**: 2 hours before `{{contact.cf_booking_appointment_datetime}}`.
        2.  **Send SMS**:
            ```
            Friendly Reminder: Your notary appointment is in 2 hours at
            {{contact.cf_booking_service_address}}.
            Please have your ID and all documents ready. See you soon!
            ```
        3.  **Add Tag**: `Reminder:2hr_Sent`
        4.  **Custom Webhook / HTTP POST to webhook**: Log 2hr reminder.
            *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
            *   Body:
                ```json
                {
                  "type": "AppointmentReminderSent",
                  "contactId": "{{contact.id}}",
                  "appointmentId": "{{appointment.id}}",
                  "reminderType": "2hr",
                  "timestamp": "{{right_now.date}}"
                }
                ```

    *   **1-Hour Reminder Branch (Optional)**:
        1.  **Wait Until**: 1 hour before `{{contact.cf_booking_appointment_datetime}}`.
        2.  **Send SMS**: "Final reminder: Your notary appointment is in 1 hour. If you're running late or need to contact your notary directly, call/text [Notary_Assigned_Phone_Number_If_Variable_Else_Main_Number]."
        3.  **Add Tag**: `Reminder:1hr_Sent`
        4.  **Custom Webhook / HTTP POST to webhook**: Log 1hr reminder.
            *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
            *   Body:
                ```json
                {
                  "type": "AppointmentReminderSent",
                  "contactId": "{{contact.id}}",
                  "appointmentId": "{{appointment.id}}",
                  "reminderType": "1hr",
                  "timestamp": "{{right_now.date}}"
                }
                ```

---

#### 3. Service Completion Follow-up

*   **Workflow Name**: Service Completion Follow-up
*   **Trigger**: Tag Added → `Status:Service_Completed`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app service complete.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "ServiceCompleted",
              "contactId": "{{contact.id}}",
              "appointmentId": "{{appointment.id}}",
              "serviceType": "{{contact.cf_booking_service_type}}",
              "completionTimestamp": "{{right_now.date}}"
            }
            ```
    2.  **Wait**: 2 hours.
    3.  **Send SMS**: "Hi {{contact.first_name}}, thanks for using Houston Mobile Notary Pros today! We appreciate your business. You'll receive an email with a summary shortly."
    4.  **Send Email**: Service summary, thank you, link to invoice/receipt. "What's Next?" guide.
    5.  **Wait**: 24 hours.
    6.  **Trigger "Post-Service Feedback Request" Workflow** (e.g., add tag `Action:RequestFeedback`).
    7.  **Remove Tags**: Cleanup (e.g., `Workflow:Booking_Confirmation_Sent`, `Reminder:24hr_Sent`).
    8.  **Add Tag**: `Workflow:Service_FollowUp_Sent`.

---

#### 4. No-Show Handling

*   **Workflow Name**: No-Show Handling
*   **Trigger**: Tag Added → `Status:No_Show`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app of no-show.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "AppointmentNoShow",
              "contactId": "{{contact.id}}",
              "appointmentId": "{{appointment.id}}",
              "scheduledDateTime": "{{contact.cf_booking_appointment_datetime}}",
              "reasonRecorded": "{{contact.cf_no_show_reason}}",
              "timestamp": "{{right_now.date}}"
            }
            ```
    2.  **Send SMS** (immediate, empathetic):
        ```
        Hi {{contact.first_name}}, we missed you at your notary appointment today with Houston Mobile Notary Pros. Is everything okay? Please reply or call us at 832-617-4285 if you'd like to reschedule or discuss.
        ```
    3.  **Update Custom Field**: `cf_no_show_count` (increment).
    4.  **Create Task**: "Follow up on no-show: {{contact.first_name}}. Attempt to reschedule or understand reason."
        *   Assigned to: Customer Service / Scheduler.
        *   Due: 4 hours.
    5.  **Wait**: 1 hour.
    6.  **Send Email**: Formal, reiterating missed appointment, offering rescheduling, state no-show fee policy if applicable.
    7.  **If/Else**: Check `cf_no_show_count`.
        *   If `cf_no_show_count` > 1: Add Tag `Risk:Frequent_No_Show`. Consider prepayment for future bookings.
        *   If policy includes No-Show Fee (not first time or fee applied): Add Tag `Action:Process_No_Show_Fee`.
        *   If first time and fee waived: Add Tag: `Status:No_Show_Fee_Waived_First_Time`.

---

### Payment Workflows

#### 1. Payment Confirmation

*   **Workflow Name**: Payment Confirmation
*   **Trigger**: Tag Added → `Status:Payment_Received`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app payment received.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "PaymentReceived",
              "contactId": "{{contact.id}}",
              "invoiceId": "{{payment.invoice_id}}",
              "orderId": "{{order.id}}",
              "amount": "{{payment.amount}}",
              "paymentDate": "{{right_now.date}}",
              "paymentMethodType": "{{payment.method_type}}",
              "timestamp": "{{right_now.date}}"
            }
            ```
    2.  **Send SMS**: "Hi {{contact.first_name}}, we've successfully received your payment for Houston Mobile Notary Pros. Thank you! Your service is confirmed." (Adjust if post-service).
    3.  **Send Email**: Official Receipt and Invoice.
        *   Subject: "Your Payment Receipt from Houston Mobile Notary Pros - Invoice #[{{payment.invoice_id}}]"
        *   Body: Detailed receipt, link to PDF invoice.
    4.  **Update Custom Fields**: `cf_payment_status`: "Completed" / "Paid", `cf_payment_date`: `{{right_now.date}}`, `cf_payment_invoice_number`: `{{payment.invoice_id}}`, `cf_payment_amount_paid`: `{{payment.amount}}`.
    5.  **Remove Tag**: `Status:Payment_Pending`.
    6.  **Add Tag**: `Status:Ready_For_Service` or `Status:Service_Paid`.
    7.  If booking not yet confirmed and payment is prerequisite: Trigger "Booking Confirmation & Preparation" workflow.

---

#### 2. Payment Reminders

*   **Workflow Name**: Payment Reminders
*   **Trigger**: Tag Added → `Status:Payment_Pending` AND Invoice Due Date approaching/past.
*   **Actions**:
    1.  **Wait Until**: 3 days before Invoice Due Date (`{{contact.cf_invoice_due_date}}`).
    2.  **Send Email**: Gentle payment reminder with link to pay.
        *   Subject: "Friendly Reminder: Your Houston Mobile Notary Pros Invoice is due soon"
    3.  **Add Tag**: `Payment:Reminder1_Sent`
    4.  **Wait Until**: Invoice Due Date.
    5.  **If/Else**: Check if tag `Status:Payment_Received` exists.
        *   If NO:
            *   Send SMS: "Hi {{contact.first_name}}, a quick reminder that your payment for Houston Mobile Notary Pros is due today. You can pay online here: [link_to_payment_portal]"
            *   Send Email: "Payment Due Today: Houston Mobile Notary Pros Invoice #[{{payment.invoice_id}}]"
            *   Add Tag: `Payment:Reminder2_Sent`
    6.  **Wait**: 3 days after Invoice Due Date.
    7.  **If/Else**: Check if tag `Status:Payment_Received` exists.
        *   If NO:
            *   Send Email: "Invoice Overdue: Please Settle Your Houston Mobile Notary Pros Payment" (firmer tone).
            *   Add Tag: `Risk:Payment_Overdue`, `Payment:OverdueNotice1_Sent`
            *   Create Task: "Manual payment follow-up required for {{contact.first_name}} (Invoice #[{{payment.invoice_id}}]). Discuss payment options." (Assigned to Billing)
    8.  **Wait**: 7 days after Invoice Due Date (Total 10 days overdue).
    9.  **If/Else**: Check if tag `Status:Payment_Received` exists.
        *   If NO:
            *   Send Final Notice Email.
            *   Add Tag: `Payment:FinalNotice_Sent`
            *   Change Opportunity Stage: "Collections"
            *   Trigger "Failed Payment Recovery" workflow elements if needed.
            *   **Custom Webhook / HTTP POST to webhook**: Notify web app final notice sent.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "PaymentFinalNoticeSent",
                      "contactId": "{{contact.id}}",
                      "invoiceId": "{{payment.invoice_id}}",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```

---

#### 3. Failed Payment Recovery

*   **Workflow Name**: Failed Payment Recovery
*   **Trigger**: Tag Added → `Status:Payment_Failed` OR Payment Gateway Webhook failure.
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app of payment failure.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "PaymentFailedNotification",
              "contactId": "{{contact.id}}",
              "reason": "{{payment.failure_reason}}",
              "invoiceId": "{{payment.invoice_id}}",
              "orderId": "{{order.id}}",
              "amount": "{{payment.amount}}",
              "timestamp": "{{right_now.date}}"
            }
            ```
    2.  **Send SMS** (immediate):
        ```
        Hi {{contact.first_name}}, we encountered an issue processing your payment for Houston Mobile Notary Pros. Your card was declined. Please update your payment method here: [link_to_secure_payment_update_page] or call us at 832-617-4285 to resolve this.
        ```
    3.  **Send Email**: Detailed payment failure notification.
        *   Subject: "Action Required: Payment Failed for Houston Mobile Notary Pros"
        *   Body: Explain issue, amount, service. Link to update payment. Mention if service/booking on hold.
    4.  **Add Tag**: `Payment:Failed_Attempt_1`
    5.  **Create Task**: "Follow up on failed payment for {{contact.first_name}}. Service/Booking: [Details]." (Assigned to Billing/CS, Due 24 hrs)
    6.  **Wait**: 24 hours.
    7.  **If/Else**: Check tag `Status:Payment_Received` OR `Status:Payment_Method_Updated`.
        *   If NO:
            *   Send Follow-up SMS: "Gentle reminder: Your payment for HMNP is still pending due to a card issue. Please update your details: [link] or call us."
            *   Send Follow-up Email: Similar to SMS.
            *   Add Tag: `Payment:Failed_Attempt_2`
    8.  **Wait**: 48 hours (total 72 hours).
    9.  **If/Else**: Check tag `Status:Payment_Received`.
        *   If NO:
            *   Add Tag: `Risk:Payment_Default_Candidate`
            *   Update Opportunity Stage: "Collections Review" or "On Hold - Payment Issue"
            *   Create Task: "HIGH PRIORITY: Persistent payment failure for {{contact.first_name}}. Managerial review needed. Consider service suspension or alternative collection." (Assigned to Manager/Senior Billing)
            *   **Custom Webhook / HTTP POST to webhook**: Notify web app of escalation.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "PaymentFailedEscalation",
                      "contactId": "{{contact.id}}",
                      "invoiceId": "{{payment.invoice_id}}",
                      "orderId": "{{order.id}}",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```

---

#### 4. Refund Processing

*   **Workflow Name**: Refund Processing
*   **Trigger**: Tag Added → `Status:Refund_Requested`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app refund requested.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "RefundRequested",
              "contactId": "{{contact.id}}",
              "amount": "{{contact.cf_refund_request_amount}}",
              "reason": "{{contact.cf_refund_request_reason}}",
              "originalInvoiceId": "{{contact.cf_original_invoice_id}}",
              "timestamp": "{{right_now.date}}"
            }
            ```
    2.  **Create Task**: "Process Refund: {{contact.first_name}} ({{contact.email}}). Amount: {{contact.cf_refund_request_amount}}. Reason: {{contact.cf_refund_request_reason}}. Original Inv: {{contact.cf_original_invoice_id}}."
        *   Assigned to: Billing Team / Manager.
        *   Due: 24-48 hours.
        *   Description: "Verify eligibility, process refund via [Payment_Gateway_Name], and then update GHL tags/fields."
    3.  **Wait (Manual Step Indication)**: Staff performs refund in payment gateway.
    4.  **(New Trigger/Branch):** Tag Added → `Status:Refund_Processed_Gateway` (Manual tag by staff).
        *   **Send Email** to Client:
            *   Subject: "Your Refund from Houston Mobile Notary Pros Has Been Processed"
            *   Body: "Hi {{contact.first_name}}, we've processed your refund of ${{contact.cf_refund_processed_amount}}. Please allow 5-10 business days for it to reflect in your account, depending on your bank. Details: Refund ID [{{contact.cf_refund_gateway_transaction_id}}]."
        *   **Update Custom Fields**: `cf_refund_processed_amount`, `cf_refund_processed_date`: `{{right_now.date}}`, `cf_refund_gateway_transaction_id`, `cf_refund_status`: "Processed".
        *   **Remove Tag**: `Status:Refund_Requested`.
        *   **Add Tag**: `Status:Refund_Completed`.
        *   **Custom Webhook / HTTP POST to webhook**: Notify web app refund processed.
            *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
            *   Body:
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
        *   **Remove Tag**: `Status:Refund_Processed_Gateway`.
        *   Optionally, update Opportunity.

---

### Review & Feedback Workflows

#### 1. Post-Service Feedback Request

*   **Workflow Name**: Post-Service Feedback Request
*   **Trigger**: Tag Added → `Action:RequestFeedback`
*   **Actions**:
    1.  **Wait**: 1 hour.
    2.  **Send SMS**:
        ```
        Hi {{contact.first_name}}! Thanks again for choosing Houston Mobile Notary Pros. To help us improve, could you rate your experience on a scale of 1-10 (10 being excellent)? Just reply with the number.
        ```
    3.  **Add Tag**: `Feedback:Score_Request_Sent`
    4.  **Wait for Reply (SMS - Numeric 1-10)**: Listen for 24-48 hours.
        *   **If Reply Received**:
            *   Update Custom Field: `cf_satisfaction_score` = `{{trigger.body}}`.
            *   **Custom Webhook / HTTP POST to webhook**: Notify web app of score.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "InternalFeedbackScoreReceived",
                      "contactId": "{{contact.id}}",
                      "score": "{{trigger.body}}",
                      "channel": "SMS",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```
            *   **If/Else Based on Score**:
                *   Score 9-10: Add Tag `Feedback:Positive`. Trigger "Review Request Sequence" (e.g., add tag `Action:RequestPublicReview`).
                *   Score 7-8: Add Tag `Feedback:Neutral`. Send SMS/Email: "Thanks for your feedback! Is there anything specific we could do to make your experience a 10 next time?" Create Task for manager review.
                *   Score 1-6: Add Tag `Feedback:Negative`. Send SMS/Email: "Thank you for your honest feedback. We're sorry your experience wasn't perfect. A manager will reach out to you shortly to discuss how we can make things right." Create HIGH PRIORITY Task for Manager: "Address Negative Feedback - Score {{trigger.body}} from {{contact.first_name}}." Trigger Internal Alert.
            *   Add Tag: `Feedback:Score_Received`.
        *   **If NO Reply within 48 hours**:
            *   Send Email: Same feedback request (1-10 scale).
            *   Add Tag: `Feedback:Score_Request_FollowUpEmailSent`.

---

#### 2. Review Request Sequence

*   **Workflow Name**: Review Request Sequence
*   **Trigger**: Tag Added → `Action:RequestPublicReview`
*   **Actions**:
    1.  **Wait**: 1 hour.
    2.  **Send SMS**:
        ```
        That's fantastic to hear, {{contact.first_name}}! Since you had a great experience, would you mind sharing it on Google? It truly helps our small business reach others. Link: [your_google_review_link]
        ```
    3.  **Send Email** (1 hour after SMS or simultaneously):
        *   Subject: "Share Your Great Experience with Houston Mobile Notary Pros!"
        *   Body: Thank them, provide direct links to Google Review, Yelp, etc.
    4.  **Add Tag**: `Review:Request1_Sent`
    5.  **Wait**: 3 days.
    6.  **If/Else**: Check if tag `Review:Completed` exists.
        *   If NO:
            *   Send Gentle Reminder Email: "Hi {{contact.first_name}}, just a friendly nudge. If you have a moment, a quick review would mean a lot! Google: [link], Yelp: [link]."
            *   Add Tag: `Review:Request2_Sent`
    7.  **Wait**: 4 days.
    8.  **If/Else**: Still no `Review:Completed` tag?
        *   If NO:
            *   Send Final Request Email: "Hi {{contact.first_name}}, one last quick reminder if you're able to share your thoughts. We value your business! [links]."
            *   Add Tag: `Review:Request3_Sent`
    9.  **Add Tag**: `Workflow:Review_Sequence_Complete`.

---

#### 3. Testimonial Collection

*   **Workflow Name**: Testimonial Collection
*   **Trigger**: Tag Added → `Review:Completed` (positive) OR `Feedback:Positive` (score 9-10) OR Manually `Action:RequestTestimonial`.
*   **Actions**:
    1.  **Wait**: 1 day.
    2.  **Send Email**:
        *   Subject: "Could We Feature Your Experience, {{contact.first_name}}?"
        *   Body: "Hi {{contact.first_name}}, we were so pleased with your positive feedback/review! We'd be honored if you'd allow us to feature your comments (and perhaps first name/last initial) as a testimonial on our website. If you're open to this, please reply YES. If you have a specific quote you'd like us to use, feel free to send it over! You can also submit it here: [link_to_testimonial_submission_form_on_your_site]."
    3.  **Wait for Reply / Form Submission**.
    4.  **If/Else**: Check custom field `cf_consent_display_testimonial` = YES OR email reply YES (manual CF update).
        *   If YES:
            *   Add Tag: `Marketing:Testimonial_Approved`
            *   Update Custom Field: `cf_testimonial_text` (copy from email/form).
            *   **Custom Webhook / HTTP POST to webhook**: Notify web app testimonial approved.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "TestimonialReceived",
                      "contactId": "{{contact.id}}",
                      "testimonialText": "{{contact.cf_testimonial_text}}",
                      "consentGiven": "true",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```
            *   Create Task: "Add new testimonial from {{contact.first_name}} to website."
        *   If NO: End.

---

### Advanced Client & Business Growth Workflows

#### 1. Client Onboarding Workflow (Complex Services)

*   **Workflow Name**: Client Onboarding Workflow
*   **Purpose**: Prepare clients for specialized services (e.g., Loan Signings).
*   **Trigger**: Tag Added → `Status:Booking_Confirmed` AND Custom Field `cf_booking_service_type` IS `Service:LOAN_SIGNING_SPECIALIST` (or other complex services).
*   **Actions**:
    1.  **Send Email**: "Welcome & Next Steps for Your {{contact.cf_booking_service_type}}"
        *   Includes: Greeting, appointment details, document checklist, expectations, FAQ link.
    2.  **If Document Review/Submission Required PRE-APPOINTMENT**:
        *   Send Email/SMS: "Action Required: Please submit your documents for review via our Secure Portal: [Secure_Portal_Link] at least 24 hours before your {{contact.cf_booking_service_type}} appointment."
        *   Add Tag: `Onboarding:Docs_Requested`
        *   Wait 24 hours (or until 48 hours before appointment).
        *   If/Else: Check `cf_onboarding_documents_received` = YES.
            *   If NO: Send Reminder SMS/Email. Create Task for staff: "Follow up: {{contact.first_name}} - Documents for {{contact.cf_booking_service_type}} not yet received."
    3.  **Custom Webhook / HTTP POST to webhook**: Notify web app onboarding started.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "ClientOnboardingStarted",
              "contactId": "{{contact.id}}",
              "bookingIdGHL": "{{appointment.id}}",
              "serviceType": "{{contact.cf_booking_service_type}}",
              "timestamp": "{{right_now.date}}"
            }
            ```
    4.  **Wait Until**: 48 hours before appointment.
    5.  **Optional Prep Call Offer**:
        *   Send Email/SMS: "Getting Ready for Your {{contact.cf_booking_service_type}}? If you have any final questions, feel free to reply here or book a quick 10-minute prep call: [link_to_prep_call_calendar_for_this_service]."
    6.  **Add Tag**: `Workflow:Client_Onboarding_In_Progress`
    7.  **After prerequisites met / by 24hrs before appointment**:
        *   Add Tag: `Status:Client_Ready_For_Service`
        *   Remove Tag: `Onboarding:Docs_Requested`
    8.  **Custom Webhook / HTTP POST to webhook**: Notify web app client ready.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "ClientDeclaredReadyForService",
              "contactId": "{{contact.id}}",
              "bookingIdGHL": "{{appointment.id}}",
              "timestamp": "{{right_now.date}}"
            }
            ```

---

#### 2. Referral Program Workflow

*   **Workflow Name**: Referral Program Workflow
*   **Purpose**: Encourage, track, and reward client referrals.

    *   **Part A: Offering Referral Opportunity**
        *   **Trigger**: Tag Added → `Feedback:Positive` OR `Review:Completed` (positive) OR Manually `Potential:Referrer`.
        *   **Actions**:
            1.  **Wait**: 1-2 days.
            2.  **Send Email**:
                *   Subject: "Share the Love for Houston Mobile Notary Pros & Get Rewarded!"
                *   Body: "Hi {{contact.first_name}}, we're thrilled you had a great experience! Know someone else who could benefit from our notary services? Refer them, and when they complete their first service, **you'll receive [Your_Referral_Incentive_For_Referrer]** and **they'll get [Incentive_For_Referred_Friend]!** How to refer: Tell them to mention your name: **{{contact.full_name}}** or share code: **{{contact.cf_unique_referral_code}}**. We appreciate your support!"
            3.  **Update Custom Field**: `cf_referral_code_assigned` = `{{contact.cf_unique_referral_code}}`.
            4.  **Add Tag**: `Marketing:Referral_Program_Offered`
            5.  **Custom Webhook / HTTP POST to webhook**: Notify web app referral offer sent.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "ReferralOfferSent",
                      "contactId": "{{contact.id}}",
                      "referralCodeOffered": "{{contact.cf_unique_referral_code}}",
                      "incentiveDetails": "Referrer: [Your_Incentive], Referred: [Friend_Incentive]",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```

    *   **Part B: Tracking New Referred Leads**
        *   **Workflow Name**: New Lead - Referral Check
        *   **Trigger**: Contact Created AND (`cf_referred_by_name_or_email` is not empty OR `cf_referral_code_used` is not empty).
        *   **Actions**:
            1.  **Add Tag to New Lead**: `Source:Referral`, `Status:New_Lead`
            2.  **Attempt to Link Referrer**: Search by code/name/email.
                *   If Referrer Found: Update New Lead's `cf_referrer_contact_id`. Add Tag to Referrer: `Referral:Lead_Generated_By_Me`. Create Task for staff (Optional verification).
            3.  **Custom Webhook / HTTP POST to webhook**: Notify web app of new referred lead.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "NewReferralReceived",
                      "newLeadContactId": "{{contact.id}}",
                      "referredByText": "{{contact.cf_referred_by_name_or_email}}",
                      "referralCodeUsed": "{{contact.cf_referral_code_used}}",
                      "linkedReferrerContactId": "{{contact.cf_referrer_contact_id}}",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```
            4.  Apply Discount to New Lead if applicable.

    *   **Part C: Referral Conversion & Reward Fulfillment**
        *   **Workflow Name**: Referral Conversion Reward
        *   **Trigger**: Tag Added to **Referred Lead** → `Status:Service_Completed` (or `Status:Payment_Received`) AND `cf_referrer_contact_id` is not empty.
        *   **Actions**:
            1.  Identify Referrer using `{{contact.cf_referrer_contact_id}}`.
            2.  Add Tag to Referrer: `Referral:Conversion_Achieved`
            3.  **Fulfill Incentive for Referrer**:
                *   Gift Card: Send Email to Referrer: "Great news! Your referral {{contact.full_name}} completed their service. Here's your [Gift_Card_Details_or_Code]." Create Task if manual.
                *   Discount: Update `cf_account_credit_referrer` or add tag `Discount:Referral_Bonus_Available`. Send Email: "Your referral {{contact.full_name}} completed service! A [Discount_Details] applied to your account."
            4.  Add Tag to Referred Lead: `Referral:Converted_Client`.
            5.  **Custom Webhook / HTTP POST to webhook**: Notify web app of conversion and reward.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Body:
                    ```json
                    {
                      "type": "ReferralConvertedAndRewarded",
                      "referredClientContactId": "{{contact.id}}",
                      "referrerContactId": "{{contact.cf_referrer_contact_id}}",
                      "incentiveAppliedToReferrer": "Details of incentive",
                      "timestamp": "{{right_now.date}}"
                    }
                    ```

---

#### 3. Inactive Client Re-engagement Workflow

*   **Workflow Name**: Inactive Client Re-engagement Workflow
*   **Purpose**: Re-activate past clients.
*   **Trigger**: Smart List (e.g., "Clients with Last Appointment > 6 months ago AND No Open Opportunity AND No Recent Email Engagement").
*   **Actions**:
    1.  **Initial Check**: Wait 1 day.
    2.  **Segment (Optional)**: Based on `cf_last_service_type` or `cf_lifetime_value`.
    3.  **Send Re-engagement Email #1**:
        *   Subject: "We Miss You, {{contact.first_name}}! Need Notary Services Again?" or "A Quick Hello from Houston Mobile Notary Pros"
        *   Body: Personalized. "It's been a while since your last {{contact.cf_last_service_type_friendly_name | default: 'service with us'}}." Mention new services or small "welcome back" offer (e.g., 10% off).
    4.  **Add Tag**: `Marketing:ReEngagement_Email1_Sent`
    5.  **Custom Webhook / HTTP POST to webhook**:
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "ClientReEngagementAttempt",
              "contactId": "{{contact.id}}",
              "attemptNumber": 1,
              "segment": "{{contact.cf_reengagement_segment}}",
              "offerDetails": "10% off welcome back",
              "timestamp": "{{right_now.date}}"
            }
            ```
    6.  **Wait**: 30 days.
    7.  **If/Else**: Check for re-engagement (New Opportunity, Tag `Status:Booking_Requested`, Email Click/Reply).
        *   If YES: Add Tag `Status:Client_ReEngaged`. Remove from workflow. Webhook `ClientReEngaged`.
        *   If NO:
            *   **Send Re-engagement Email #2**:
                *   Subject: "A Notary Tip from Your Friends at HMNP" or "Still Thinking About Notary Needs?"
                *   Body: Valuable content or different offer.
            *   Add Tag: `Marketing:ReEngagement_Email2_Sent`
            *   Webhook (attemptNumber: 2, different offer).
    8.  **Wait**: 30-60 days.
    9.  **If/Else**: Check for re-engagement again.
        *   If YES: (Same as above - tag, remove, webhook).
        *   If NO:
            *   Add Tag: `Status:Dormant_Client` or `Status:Inactive_LongTerm`
            *   Reduce communication frequency.
            *   Webhook:
                ```json
                {
                  "type": "ClientMarkedDormant",
                  "contactId": "{{contact.id}}",
                  "reason": "Failed re-engagement sequence",
                  "timestamp": "{{right_now.date}}"
                }
                ```
            *   Remove from workflow.

---

#### 4. Internal Alert & Escalation Workflow Framework (Conceptual)

*   **Purpose**: Standardized actions for critical events requiring internal attention.
*   **Common Scenarios**: Multiple payment failures, very negative feedback, urgent lead requests, stagnant high-value opportunities, service issues.
*   **Standard Components (to be added within relevant workflows)**:
    1.  **Trigger Condition**: Defined in parent workflow.
    2.  **Send Internal Notification (Email and/or SMS)**:
        *   To: Designated manager/team.
        *   Subject/SMS Prefix: "URGENT GHL ALERT:" or "ESCALATION:"
        *   Body: "CRITICAL ALERT: [Specific_Alert_Type] for Client: {{contact.full_name}} (ID: {{contact.id}}). Details: [Key data]. Please investigate immediately."
    3.  **Create High-Priority Task in GHL**:
        *   Title: "ESCALATION: [Alert_Type] - {{contact.full_name}}"
        *   Description: Full context, link to contact/opportunity. "Action: Review and resolve. Update status within X hours."
        *   Assigned to: Manager/escalation team.
        *   Due Date: Immediate or 1-4 hours.
    4.  **Update Opportunity (if applicable)**: Change Stage, Add Note.
    5.  **Add Specific Escalation Tag**: e.g., `Alert:Escalated_VIP_Payment`.
    6.  **Custom Webhook / HTTP POST to webhook (Recommended)**:
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Body:
            ```json
            {
              "type": "CriticalAlertTriggered",
              "contactId": "{{contact.id}}",
              "opportunityId": "{{opportunity.id}}",
              "alertType": "[Specific_Alert_Type]",
              "priority": "High",
              "description": "Brief description.",
              "triggeringWorkflow": "[Parent_Workflow_Name]",
              "relevantData": { // Include key fields that triggered alert
                "feedbackScore": "{{contact.cf_satisfaction_score}}",
                "paymentAttempts": "{{contact.cf_payment_failed_attempts}}"
              },
              "timestamp": "{{right_now.date}}"
            }
            ```

---

### Dedicated Webhook-Triggering Workflows

These workflows are designed primarily to send data to your web application (`https://houstonmobilenotarypros.com/api/webhooks/ghl`) as soon as a key event occurs in GoHighLevel. Their configurations are based on Part 2, Section 6 of the `GHL_MASTER_SETUP_GUIDE.md`.

#### 1. Webhook - Contact Created

*   **Workflow Name**: Webhook - Contact Created
*   **Trigger**: Contact Created
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Headers**: Content-Type: application/json
    *   **Body**:
        ```json
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

#### 2. Webhook - Tag Updated

*   **Workflow Name**: Webhook - Tag Updated
*   **Trigger**: Contact Tag Changed (or specific tag added/removed)
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Note**: Detailed JSON body to be defined in Appendix C of `GHL_MASTER_SETUP_GUIDE.md`. It should include contact ID, tag added/removed, and timestamp.

#### 3. Webhook - Opportunity Status Changed

*   **Workflow Name**: Webhook - Opportunity Status Changed
*   **Trigger**: Opportunity Status Changed
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Note**: Detailed JSON body to be defined in Appendix C of `GHL_MASTER_SETUP_GUIDE.md`. It should include contact ID, opportunity ID, old stage, new stage, and timestamp.

#### 4. Webhook - Appointment Created

*   **Workflow Name**: Webhook - Appointment Created
*   **Trigger**: Customer Booked Appointment (or specific calendar)
*   **Action**: Custom Webhook
    *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Note**: Detailed JSON body to be defined in Appendix C of `GHL_MASTER_SETUP_GUIDE.md`. It should include contact ID, appointment details (ID, calendar, time, status), and timestamp.

#### 5. Webhook - Form Submitted

*   **Workflow Name**: Webhook - Form Submitted
*   **Trigger**: Form Submitted (or specific form)
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Note**: Detailed JSON body to be defined in Appendix C of `GHL_MASTER_SETUP_GUIDE.md`. It should include contact ID, form ID, submission data, and timestamp.

--- 