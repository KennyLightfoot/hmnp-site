## GoHighLevel Workflow Setup

This document explains how to set up different automatic processes (called workflows) in GoHighLevel. Think of it like giving GoHighLevel a to-do list that it does all by itself when certain things happen!

**A Quick Note on If/Else Steps:**
Sometimes, a workflow needs to make a choice. For example, "IF the person is a new customer, THEN send a welcome email, ELSE (if they are not new) send a different email." We will explain how to set these up step-by-step in each workflow. You'll usually:
1.  Click the "+" button to add a new step.
2.  Choose "If/Else" from the list of actions.
3.  Give a name to each choice (like "Is New Customer?" for the YES path and "Is Returning Customer?" for the NO path).
4.  Set up the rule for the first choice (Branch A). This involves picking what to check (like a contact's tag or a custom field), how to check it (e.g., "is," "contains," "exists"), and what value to check against.
We'll guide you through this in each workflow that needs it!

---

### Standard Webhook Configuration

For all webhook actions in workflows, use these standard headers:
```
Content-Type: application/json
Authorization: Bearer {{location.api_key}}
x-ghl-signature: {{generate_signature(body)}}
```

The `generate_signature` function should use your `GHL_WEBHOOK_SECRET` to create an HMAC SHA-256 signature of the request body.

---

### Lead Management Workflows

These workflows help you manage new people (leads) who show interest in your services.

#### 1. New Lead Welcome Sequence (ID: 40230ec0-9a2a-4129-83e5-3a2eea2a2aab)

*   **What it's called**: New Lead Welcome Sequence
*   **How it starts**: When you add a tag called `Status:New_Lead` to a contact.
*   **What it does (the steps)**:
    1.  **Tell your website about the new lead (Send a Webhook)**:
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "NewLeadReceived",
              "contactId": "{{contact.id}}",
              "timestamp": "{{right_now.date}}",
              "source": "{{contact.source}}",
              "inquirySubject": "{{contact.cf_contact_inquiry_subject}}",
              "inquiryMessagePreview": "{{contact.cf_contact_inquiry_message | truncate: 100}}",
              "metadata": {
                "workflowId": "40230ec0-9a2a-4129-83e5-3a2eea2a2aab",
                "workflowName": "New Lead Welcome Sequence"
              }
            }
            ```
    2.  **Check if the Lead is High Priority (If/Else Condition)**:
        *   We want to see if the lead's inquiry subject (what they wrote they want help with) makes them a high priority.
        *   **How to set it up**:
            *   Add an action: "If/Else".
            *   **Branch A (Name it: "Is High Priority?")**:
                *   Segment: Choose "Contact Details".
                *   Field: Find and select `cf_contact_inquiry_subject`.
                *   Operator: Choose "Contains".
                *   Value: Type a word like "Urgent" or "Important" (decide what words mean high priority for you).
            *   **Path A (If YES, it IS High Priority)**: For now, let's say it just continues to the next step. You could add special actions here later, like sending a notification to your team.
            *   **Path B (If NO, it's a Standard Lead)**: It will also continue to the next step.
    3.  **Wait for 5 minutes**:
        *   Add an action: "Wait".
        *   Set duration: 5 minutes.
    4.  **Send SMS** (if consent given):
        *   Add an action: "Send SMS".
        *   Message:
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
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "LeadWelcomeMessageSent",
              "contactId": "{{contact.id}}",
              "smsSent": "true",
              "emailSent": "true",
              "segment": "Standard",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "40230ec0-9a2a-4129-83e5-3a2eea2a2aab",
                "workflowName": "New Lead Welcome Sequence"
              }
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
                *   Headers: [Standard Webhook Headers]
                *   Body:
                    ```json
                    {
                      "type": "LeadFollowUpAttempted",
                      "contactId": "{{contact.id}}",
                      "attemptNumber": "1",
                      "timestamp": "{{right_now.date}}",
                      "metadata": {
                        "workflowId": "40230ec0-9a2a-4129-83e5-3a2eea2a2aab",
                        "workflowName": "New Lead Welcome Sequence"
                      }
                    }
                    ```
        *   If YES: End workflow.

---

#### 2. Hot Prospect Follow-up (ID: 1084e838-1c3a-49ba-ac43-6577afa5271a)

*   **Workflow Name**: Hot Prospect Follow-up
*   **Trigger**: Tag Added → `Status:Hot_Prospect`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app about a hot prospect.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "HotProspectIdentified",
              "contactId": "{{contact.id}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "1084e838-1c3a-49ba-ac43-6577afa5271a",
                "workflowName": "Hot Prospect Follow-up"
              }
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
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "HotProspectCampaignAdd",
              "contactId": "{{contact.id}}",
              "campaignName": "Fast-track booking sequence",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "1084e838-1c3a-49ba-ac43-6577afa5271a",
                "workflowName": "Hot Prospect Follow-up"
              }
            }
            ```

---

#### 3. Quote Follow-up Automation

*   **Workflow Name**: Quote Follow-up Automation
*   **Trigger**: Tag Added → `Status:Quote_Sent`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app that a quote was sent.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "QuoteSent",
              "contactId": "{{contact.id}}",
              "quoteAmount": "{{opportunity.value}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "quote-follow-up-automation",
                "workflowName": "Quote Follow-up Automation"
              }
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
    8.  **Wait**: 2 days
    9.  **If/Else**: Still no booking?
        *   If NO (Deal Potentially Lost):
            *   Send Final Follow-up Email: "Checking in one last time on your notary quote. If you've decided to go another way or your needs have changed, we understand. We'd appreciate any brief feedback if you're open to sharing (e.g., price, found alternative, timing not right?). This helps us improve."
            *   **Add Tag**: `Status:Deal_Lost_FollowUpSent`
            *   Create Task: "Review unresponsive quote for {{contact.first_name}} - consider closing opportunity."
            *   **Custom Webhook / HTTP POST to webhook**: Notify web app of potential lost deal.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Headers: [Standard Webhook Headers]
                *   Body:
                    ```json
                    {
                      "type": "DealLostFollowUpSent",
                      "contactId": "{{contact.id}}",
                      "quoteId": "{{opportunity.quote_id}}",
                      "timestamp": "{{right_now.date}}",
                      "metadata": {
                        "workflowId": "quote-follow-up-automation",
                        "workflowName": "Quote Follow-up Automation"
                      }
                    }
                    ```
    10. **Add Tag**: `Marketing:Quote_Follow_Up_Complete` (if not booked).
    11. **Custom Webhook / HTTP POST to webhook**: Notify web app quote follow-up sequence completed status.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "QuoteFollowUpComplete",
              "contactId": "{{contact.id}}",
              "booked": "{{contact.tags contains 'Status:Booking_Requested' or opportunity.status == 'won'}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "quote-follow-up-automation",
                "workflowName": "Quote Follow-up Automation"
              }
            }
            ```

---

#### 4. Long-term Nurture

*   **Workflow Name**: Long-term Nurture
*   **Trigger**: Tag Added → `Status:Long_Term_Nurture`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app contact added to long-term nurture.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "LongTermNurtureStart",
              "contactId": "{{contact.id}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "long-term-nurture",
                "workflowName": "Long-term Nurture"
              }
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

These workflows handle what happens after someone books an appointment.

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
        *   Headers: [Standard Webhook Headers]
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
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "booking-confirmation-preparation",
                "workflowName": "Booking Confirmation & Preparation"
              }
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
            *   Headers: [Standard Webhook Headers]
            *   Body:
                ```json
                {
                  "type": "AppointmentReminderSent",
                  "contactId": "{{contact.id}}",
                  "appointmentId": "{{appointment.id}}",
                  "reminderType": "24hr",
                  "confirmationRequested": "true",
                  "timestamp": "{{right_now.date}}",
                  "metadata": {
                    "workflowId": "appointment-reminders",
                    "workflowName": "Appointment Reminders"
                  }
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
            *   Headers: [Standard Webhook Headers]
            *   Body:
                ```json
                {
                  "type": "AppointmentReminderSent",
                  "contactId": "{{contact.id}}",
                  "appointmentId": "{{appointment.id}}",
                  "reminderType": "2hr",
                  "timestamp": "{{right_now.date}}",
                  "metadata": {
                    "workflowId": "appointment-reminders",
                    "workflowName": "Appointment Reminders"
                  }
                }
                ```

    *   **1-Hour Reminder Branch (Optional)**:
        1.  **Wait Until**: 1 hour before `{{contact.cf_booking_appointment_datetime}}`.
        2.  **Send SMS**: "Final reminder: Your notary appointment is in 1 hour. If you're running late or need to contact your notary directly, call/text [Notary_Assigned_Phone_Number_If_Variable_Else_Main_Number]."
        3.  **Add Tag**: `Reminder:1hr_Sent`
        4.  **Custom Webhook / HTTP POST to webhook**: Log 1hr reminder.
            *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
            *   Headers: [Standard Webhook Headers]
            *   Body:
                ```json
                {
                  "type": "AppointmentReminderSent",
                  "contactId": "{{contact.id}}",
                  "appointmentId": "{{appointment.id}}",
                  "reminderType": "1hr",
                  "timestamp": "{{right_now.date}}",
                  "metadata": {
                    "workflowId": "appointment-reminders",
                    "workflowName": "Appointment Reminders"
                  }
                }
                ```

---

#### 3. Service Completion Follow-up

*   **Workflow Name**: Service Completion Follow-up
*   **Trigger**: Tag Added → `Status:Service_Completed`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app service complete.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "ServiceCompleted",
              "contactId": "{{contact.id}}",
              "appointmentId": "{{appointment.id}}",
              "serviceType": "{{contact.cf_booking_service_type}}",
              "completionTimestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "service-completion-follow-up",
                "workflowName": "Service Completion Follow-up"
              }
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
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "AppointmentNoShow",
              "contactId": "{{contact.id}}",
              "appointmentId": "{{appointment.id}}",
              "scheduledDateTime": "{{contact.cf_booking_appointment_datetime}}",
              "reasonRecorded": "{{contact.cf_no_show_reason}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "no-show-handling",
                "workflowName": "No-Show Handling"
              }
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

These help manage payments for your services.

#### 1. Payment Confirmation

*   **Workflow Name**: Payment Confirmation
*   **Trigger**: Tag Added → `Status:Payment_Received`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app payment received.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
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
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "payment-confirmation",
                "workflowName": "Payment Confirmation"
              }
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
                *   Headers: [Standard Webhook Headers]
                *   Body:
                    ```json
                    {
                      "type": "PaymentFinalNoticeSent",
                      "contactId": "{{contact.id}}",
                      "invoiceId": "{{payment.invoice_id}}",
                      "timestamp": "{{right_now.date}}",
                      "metadata": {
                        "workflowId": "payment-reminders",
                        "workflowName": "Payment Reminders"
                      }
                    }
                    ```

---

#### 3. Failed Payment Recovery

*   **Workflow Name**: Failed Payment Recovery
*   **Trigger**: Tag Added → `Status:Payment_Failed` OR Payment Gateway Webhook failure.
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app of payment failure.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "PaymentFailedNotification",
              "contactId": "{{contact.id}}",
              "reason": "{{payment.failure_reason}}",
              "invoiceId": "{{payment.invoice_id}}",
              "orderId": "{{order.id}}",
              "amount": "{{payment.amount}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "failed-payment-recovery",
                "workflowName": "Failed Payment Recovery"
              }
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
                *   Headers: [Standard Webhook Headers]
                *   Body:
                    ```json
                    {
                      "type": "PaymentFailedEscalation",
                      "contactId": "{{contact.id}}",
                      "invoiceId": "{{payment.invoice_id}}",
                      "orderId": "{{order.id}}",
                      "timestamp": "{{right_now.date}}",
                      "metadata": {
                        "workflowId": "failed-payment-recovery",
                        "workflowName": "Failed Payment Recovery"
                      }
                    }
                    ```

---

#### 4. Refund Processing

*   **Workflow Name**: Refund Processing
*   **Trigger**: Tag Added → `Status:Refund_Requested`
*   **Actions**:
    1.  **Custom Webhook / HTTP POST to webhook**: Notify web app refund requested.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "RefundRequested",
              "contactId": "{{contact.id}}",
              "amount": "{{contact.cf_refund_request_amount}}",
              "reason": "{{contact.cf_refund_request_reason}}",
              "originalInvoiceId": "{{contact.cf_original_invoice_id}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "refund-processing",
                "workflowName": "Refund Processing"
              }
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
            *   Headers: [Standard Webhook Headers]
            *   Body:
                ```json
                {
                  "type": "RefundProcessedPlatform",
                  "contactId": "{{contact.id}}",
                  "amountRefunded": "{{contact.cf_refund_processed_amount}}",
                  "gatewayTransactionId": "{{contact.cf_refund_gateway_transaction_id}}",
                  "originalInvoiceId": "{{contact.cf_original_invoice_id}}",
                  "timestamp": "{{right_now.date}}",
                  "metadata": {
                    "workflowId": "refund-processing",
                    "workflowName": "Refund Processing"
                  }
                }
                ```
        *   **Remove Tag**: `Status:Refund_Processed_Gateway`.
        *   Optionally, update Opportunity.

---

### Review & Feedback Workflows

These help you get feedback from clients and ask for reviews.

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
                *   Headers: [Standard Webhook Headers]
                *   Body:
                    ```json
                    {
                      "type": "InternalFeedbackScoreReceived",
                      "contactId": "{{contact.id}}",
                      "score": "{{trigger.body}}",
                      "channel": "SMS",
                      "timestamp": "{{right_now.date}}",
                      "metadata": {
                        "workflowId": "post-service-feedback-request",
                        "workflowName": "Post-Service Feedback Request"
                      }
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
        *   Body: "Hi {{contact.first_name}}, we were so pleased with your positive feedback/review! We'd be honored if you'd allow us to feature your comments (and perhaps your first name and last initial, like 'John D.') as a testimonial on our website. If you're okay with this, please just reply YES to this email. If you have a specific sentence or quote you'd especially like us to use, feel free to send it over! You can also submit it through this quick form if you prefer: [link_to_a_simple_testimonial_submission_form_on_your_site_if_you_have_one]."
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

These are for more specific situations or to help grow your business.

#### 1. Client Onboarding Workflow (for Complex Services like Loan Signings)

*   **Workflow Name**: Client Onboarding Workflow
*   **Purpose**: Prepare clients for specialized services (e.g., Loan Signings).
*   **Trigger**: Tag Added → `Status:Booking_Confirmed` AND Custom Field `cf_booking_service_type` IS `Service:LOAN_SIGNING_SPECIALIST` (or other complex services).
*   **Actions**:
    1.  **Send Email**: "Welcome & Next Steps for Your {{contact.cf_booking_service_type}}"
        *   Includes: Greeting, appointment details, document checklist, expectations, FAQ link.
    2.  **If Document Review/Submission Required PRE-APPOINTMENT**:
        *   Send Email/SMS: "Action Required: Please submit your documents for review through our Secure Portal: [Your_Secure_Document_Portal_Link] at least 24 hours before your {{contact.cf_booking_service_type}} appointment."
        *   Add Tag: `Onboarding:Docs_Requested`
        *   Wait 24 hours (or you can use "Wait Until" 48 hours before the appointment time `{{contact.cf_booking_appointment_datetime}}`).
        *   **Check if Documents Received (If/Else)**:
            *   Add an "If/Else".
            *   **Branch A (Name it: "Docs Received?")**:
                *   Segment: "Contact Details". Field: `cf_onboarding_documents_received`. Operator: "Is". Value: "Yes".
            *   **Path A (If YES, docs received)**: Great! Continue.
            *   **Path B (If NO, docs NOT received)**:
                *   Send Reminder SMS/Email about the documents.
                *   Create Task for staff: "Follow up: {{contact.first_name}} - Documents for {{contact.cf_booking_service_type}} not yet received."
    3.  **Custom Webhook / HTTP POST to webhook**: Notify web app onboarding started.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "ClientOnboardingStarted",
              "contactId": "{{contact.id}}",
              "bookingIdGHL": "{{appointment.id}}",
              "serviceType": "{{contact.cf_booking_service_type}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "client-onboarding-workflow",
                "workflowName": "Client Onboarding Workflow"
              }
            }
            ```
    4.  **Wait Until 48 hours before appointment**:
    5.  **Optional - Offer a Quick Prep Call**:
        *   Send Email/SMS: "Getting Ready for Your {{contact.cf_booking_service_type}}? If you have any final questions, feel free to reply here or book a quick 10-minute prep call with us: [link_to_a_special_calendar_for_these_prep_calls]."
    6.  **Add Tag**: `Workflow:Client_Onboarding_In_Progress`
    7.  **When all checks are done (e.g., docs received) and it's about 24hrs before appointment**:
        *   Add Tag: `Status:Client_Ready_For_Service`
        *   Remove Tag: `Onboarding:Docs_Requested`
    8.  **Custom Webhook / HTTP POST to webhook**: Notify web app client ready.
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "ClientDeclaredReadyForService",
              "contactId": "{{contact.id}}",
              "bookingIdGHL": "{{appointment.id}}",
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "client-onboarding-workflow",
                "workflowName": "Client Onboarding Workflow"
              }
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
                *   Body: "Hi {{contact.first_name}}, we're thrilled you had a great experience! Know someone else who could benefit from our notary services? Refer them, and when they complete their first service, **you'll receive [Describe Your Reward for the Referrer, e.g., a $10 Amazon Gift Card]** and **they'll get [Describe Incentive for the New Person, e.g., 10% off their first service]!** How to refer: Just tell them to mention your name: **{{contact.full_name}}** when they contact us. Or, they can use your unique referral code: **{{contact.cf_unique_referral_code}}** (if you set one up). We really appreciate your support!"
            3.  **Update Custom Field**: `cf_referral_code_assigned` = `{{contact.cf_unique_referral_code}}`.
            4.  **Add Tag**: `Marketing:Referral_Program_Offered`
            5.  **Custom Webhook / HTTP POST to webhook**: Notify web app referral offer sent.
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Headers: [Standard Webhook Headers]
                *   Body:
                    ```json
                    {
                      "type": "ReferralOfferSent",
                      "contactId": "{{contact.id}}",
                      "referralCodeOffered": "{{contact.cf_unique_referral_code}}",
                      "incentiveDetails": "Referrer: [Your Incentive], Referred: [Friend's Incentive]",
                      "timestamp": "{{right_now.date}}",
                      "metadata": {
                        "workflowId": "referral-program-workflow",
                        "workflowName": "Referral Program Workflow"
                      }
                    }
                    ```

    *   **Part B: When a NEW Lead Says Someone Referred Them**
        *   **What it's called**: New Lead - Referral Check
        *   **How it starts**: When a New Contact is Created in GHL AND they filled out a field like "Who referred you?" (e.g., `cf_referred_by_name_or_email`) OR they used a referral code (e.g., `cf_referral_code_used`).
            1.  **Add Tags to the NEW Lead**: `Source:Referral`, `Status:New_Lead`.
            2.  **Try to Find and Link the Original Referrer**:
                *   This is advanced. You'd need to:
                    *   Search your GHL contacts for someone whose name matches `{{contact.cf_referred_by_name_or_email}}` or whose `cf_unique_referral_code` matches `{{contact.cf_referral_code_used}}`.
                    *   If you find a match:
                        *   Update the NEW lead's custom field `cf_referrer_contact_id` with the ID of the person who referred them.
                        *   Add a tag to the ORIGINAL REFERRER like `Referral:Lead_Generated_By_Me`.
                        *   Maybe create a task for your staff to double-check the link is correct.
            3.  **Tell your website about this new referred lead (Webhook)**:
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Headers: [Standard Webhook Headers]
                *   Body:
                    ```json
                    {
                      "type": "NewReferralReceived",
                      "newLeadContactId": "{{contact.id}}",
                      "referredByText": "{{contact.cf_referred_by_name_or_email}}",
                      "referralCodeUsed": "{{contact.cf_referral_code_used}}",
                      "linkedReferrerContactId": "{{contact.cf_referrer_contact_id}}",
                      "timestamp": "{{right_now.date}}",
                      "metadata": {
                        "workflowId": "referral-program-workflow",
                        "workflowName": "Referral Program Workflow"
                      }
                    }
                    ```
            4.  **Apply Discount to the New Lead (if they get one for being referred)**:
                *   E.g., Add a tag `Discount:Referral_Welcome_10_Percent` which your team knows to apply, or update a custom field.

    *   **Part C: When the Referred Person Buys - Rewarding the Original Referrer**
        *   **What it's called**: Referral Conversion Reward
        *   **Trigger**: Tag Added to the **REFERRED LEAD** (the new person) → `Status:Service_Completed` (or `Status:Payment_Received`) AND their custom field `cf_referrer_contact_id` is not empty.
            1.  **Identify the Original Referrer**:
                *   This workflow is running on the NEW (referred) client. You need to tell GHL to do something to the contact whose ID is in `{{contact.cf_referrer_contact_id}}`.
                *   This might require an "Update Contact Field" step where you select the referrer via their ID, or GHL's "Execute Workflow on Related Contact" if available. This is advanced.
                *   *Simplification*: Create a task for staff: "Referral Converted! New client {{contact.full_name}} (referred) just completed service. Referrer ID is {{contact.cf_referrer_contact_id}}. Please issue reward to referrer."
            2.  **If you can automate actions on the Referrer**:
                *   Add Tag to the ORIGINAL REFERRER: `Referral:Conversion_Achieved`.
                *   **Give the Reward to the Referrer**:
                    *   If it's a gift card: Send an Email to the Referrer: "Great news! Your referral {{contact.full_name}} (the new client's name) just completed their service with us. As a thank you, here is your [Details_of_Gift_Card_or_Code]." Create a task if this needs manual sending.
                    *   If it's a discount on their next service: Update a custom field on the Referrer `cf_account_credit_referrer` or add a tag like `Discount:Referral_Bonus_Available`. Send them an email: "Great news! Your referral completed their service. A [Details_of_Discount] has been applied to your account for your next service!"
            3.  **Add Tag to the REFERRED LEAD**: `Referral:Converted_Client`.
            4.  **Tell your website about the conversion and reward (Webhook)**:
                *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
                *   Headers: [Standard Webhook Headers]
                *   Body:
                    ```json
                    {
                      "type": "ReferralConvertedAndRewarded",
                      "referredClientContactId": "{{contact.id}}",
                      "referrerContactId": "{{contact.cf_referrer_contact_id}}",
                      "incentiveAppliedToReferrer": "Details of incentive given",
                      "timestamp": "{{right_now.date}}",
                      "metadata": {
                        "workflowId": "referral-program-workflow",
                        "workflowName": "Referral Program Workflow"
                      }
                    }
                    ```

---

#### 3. Inactive Client Re-engagement Workflow

*   **Workflow Name**: Inactive Client Re-engagement Workflow
*   **Purpose**: To try and win back past clients who haven't used your service in a while.
*   **Trigger**: Smart List (e.g., "Clients whose last appointment was more than 6 months ago AND they don't have an open Opportunity AND they haven't opened an email recently.").
*   **Actions**:
    1.  **Wait 1 day** (just to ensure they are settled in the list).
    2.  **Optional - Try to Segment Them (If/Else)**:
        *   If you know their `cf_last_service_type` or `cf_lifetime_value` (how much they've spent), you could send different messages.
        *   Example If/Else:
            *   Branch A: `cf_last_service_type` IS "Loan Signing". Path A sends a re-engagement email specific to loan signings.
            *   Branch B: `cf_last_service_type` IS "General Notary". Path B sends a different email.
            *   Else: Send a general re-engagement email.
        *   (For simplicity, we'll proceed with a general email for now).
    3.  **Send Re-engagement Email #1**:
        *   Subject: "We Miss You, {{contact.first_name}}! Need Notary Services Again?" or "A Quick Hello from Houston Mobile Notary Pros"
        *   Body: Make it personal. "Hi {{contact.first_name}}, it's been a while since your last {{contact.cf_last_service_type_friendly_name | default: 'service with us'}}." (The `| default: '...'` part adds a fallback if the custom field is empty). Maybe mention any new services you offer or a small "welcome back" discount (e.g., 10% off).
    4.  **Add Tag**: `Marketing:ReEngagement_Email1_Sent`.
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
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "inactive-client-re-engagement",
                "workflowName": "Inactive Client Re-engagement Workflow"
              }
            }
            ```
    6.  **Wait for 30 days**:
    7.  **Check if They Re-engaged (If/Else Condition)**:
        *   How to check? Look for:
            *   A new Opportunity created for them.
            *   A tag like `Status:Booking_Requested` added.
            *   They clicked a link in the re-engagement email (GHL can track this).
            *   They replied to the email.
        *   **How to set it up (this needs "OR" conditions)**:
            *   Add an "If/Else".
            *   **Branch A (Name it: "Re-Engaged?")**:
                *   Condition 1: Opportunity "Exists" AND Opportunity "Status" IS NOT "Lost".
                *   OR Condition 2: Tag `Status:Booking_Requested` "Exists".
                *   OR Condition 3: Email Activity "Clicked Email" (select the re-engagement email) in the last 30 days.
            *   **Path A (If YES, they re-engaged!)**:
                *   Add Tag: `Status:Client_ReEngaged`.
                *   **Important**: Remove them from THIS workflow so they don't get more "inactive" messages.
            *   **Path B (If NO, they didn't re-engage yet)**:
                *   **Send Re-engagement Email #2**:
                    *   Subject: "A Notary Tip from Your Friends at HMNP" or "Still Thinking About Notary Needs?"
                    *   Body: Offer something of value (a tip, a guide) or a different kind of offer.
                *   Add Tag: `Marketing:ReEngagement_Email2_Sent`.
                *   (Optional) Webhook (similar to above, but `attemptNumber: 2`).
    8.  **(Only if Path B in step 7 was taken)** **Wait for 30-60 days** (e.g., 45 days):
    9.  **Check for Re-engagement Again (If/Else - Name it: "Re-Engaged After Email 2?")**:
        *   Same setup as step 7.
        *   **Path A (If YES)**: Add Tag `Status:Client_ReEngaged`, Remove from Workflow.
        *   **Path B (If NO, still no luck)**:
            *   Add Tag: `Status:Dormant_Client` or `Status:Inactive_LongTerm`.
            *   (Strategy: You might want to greatly reduce how often you email them now).
            *   Webhook:
                ```json
                {
                  "type": "ClientMarkedDormant",
                  "contactId": "{{contact.id}}",
                  "reason": "Failed re-engagement sequence",
                  "timestamp": "{{right_now.date}}",
                  "metadata": {
                    "workflowId": "inactive-client-re-engagement",
                    "workflowName": "Inactive Client Re-engagement Workflow"
                  }
                }
                ```
            *   Remove from this workflow.

---

#### 4. Internal Alert & Escalation Workflow Framework (This is a Concept, Not a Standalone Workflow)

*   **Purpose**: Standardized actions for critical events requiring internal attention.
*   **Common Scenarios**: Multiple payment failures, very negative feedback, urgent lead requests, stagnant high-value opportunities, service issues.
*   **Standard Components (to be added within relevant workflows)**:
    1.  **Trigger Condition**: Defined in parent workflow.
    2.  **Send Internal Notification (Email and/or SMS)**:
        *   To: Designated manager/team.
        *   Subject/SMS Prefix: "URGENT GHL ALERT:" or "ESCALATION:"
        *   Body: "CRITICAL ALERT: [Type_of_Alert, e.g., Negative Feedback Score] for Client: {{contact.full_name}} (ID: {{contact.id}}). Details: [Key info like score: {{contact.cf_satisfaction_score}}]. Please investigate immediately."
    3.  **Create High-Priority Task in GHL FOR YOUR TEAM**:
        *   Title: "ESCALATION: [Alert_Type] - {{contact.full_name}}"
        *   Description: Give all context, link to the contact/opportunity. "Action: Review and resolve. Update status within X hours."
        *   Assigned to: Manager or escalation team.
        *   Due Date: Set to "Immediate" or within 1-4 hours.
    4.  **Update an Opportunity (if relevant)**: Change its Stage, Add Note.
    5.  **Add a Specific Tag to the Contact**: e.g., `Alert:Escalated_VIP_Payment` or `Alert:NegativeFeedbackReceived`.
    6.  **Custom Webhook / HTTP POST to webhook (Recommended)**:
        *   URL: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
        *   Headers: [Standard Webhook Headers]
        *   Body:
            ```json
            {
              "type": "CriticalAlertTriggered",
              "contactId": "{{contact.id}}",
              "opportunityId": "{{opportunity.id}}",
              "alertType": "[Specific_Alert_Type_You_Define]",
              "priority": "High",
              "description": "Brief description of why alert triggered.",
              "triggeringWorkflow": "[Name_Of_Workflow_That_Caused_Alert]",
              "relevantData": {
                "feedbackScore": "{{contact.cf_satisfaction_score}}",
                "paymentAttempts": "{{contact.cf_payment_failed_attempts}}"
              },
              "timestamp": "{{right_now.date}}",
              "metadata": {
                "workflowId": "internal-alert-escalation",
                "workflowName": "Internal Alert & Escalation Workflow Framework"
              }
            }
            ```

---

### Dedicated Webhook-Triggering Workflows

These are very simple workflows. Their main job is just to tell your website (`https://houstonmobilenotarypros.com/api/webhooks/ghl`) when something specific happens in GoHighLevel. This is good if your website needs to know about these events right away to do its own tasks.

#### 1. Webhook - Contact Created

*   **Workflow Name**: Webhook - Contact Created
*   **Trigger**: Contact Created
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Headers**: [Standard Webhook Headers]
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
          "timestamp": "{{right_now.date}}",
          "metadata": {
            "workflowId": "webhook-contact-created",
            "workflowName": "Webhook - Contact Created",
            "triggerType": "ContactCreated",
            "source": "GHL"
          }
        }
        ```

#### 2. Webhook - Tag Updated

*   **Workflow Name**: Webhook - Tag Updated
*   **Trigger**: Contact Tag Changed (or specific tag added/removed)
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Headers**: [Standard Webhook Headers]
    *   **Body**:
        ```json
        {
          "type": "ContactTagUpdate",
          "contactId": "{{contact.id}}",
          "tag": {
            "name": "{{tag.name}}",
            "action": "{{tag.action}}"
          },
          "timestamp": "{{right_now.date}}",
          "metadata": {
            "workflowId": "webhook-tag-updated",
            "workflowName": "Webhook - Tag Updated",
            "triggerType": "TagChanged",
            "source": "GHL"
          }
        }
        ```

#### 3. Webhook - Opportunity Status Changed

*   **Workflow Name**: Webhook - Opportunity Status Changed
*   **Trigger**: Opportunity Status Changed
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Headers**: [Standard Webhook Headers]
    *   **Body**:
        ```json
        {
          "type": "OpportunityStatusUpdate",
          "contactId": "{{contact.id}}",
          "opportunity": {
            "id": "{{opportunity.id}}",
            "oldStage": "{{opportunity.old_stage}}",
            "newStage": "{{opportunity.new_stage}}"
          },
          "timestamp": "{{right_now.date}}",
          "metadata": {
            "workflowId": "webhook-opportunity-status",
            "workflowName": "Webhook - Opportunity Status Changed",
            "triggerType": "OpportunityStatusChanged",
            "source": "GHL"
          }
        }
        ```

#### 4. Webhook - Appointment Created

*   **Workflow Name**: Webhook - Appointment Created
*   **Trigger**: Customer Booked Appointment (or specific calendar)
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Headers**: [Standard Webhook Headers]
    *   **Body**:
        ```json
        {
          "type": "AppointmentCreate",
          "contactId": "{{contact.id}}",
          "appointment": {
            "id": "{{appointment.id}}",
            "calendar": "{{appointment.calendar}}",
            "startTime": "{{appointment.start_time}}",
            "endTime": "{{appointment.end_time}}",
            "status": "{{appointment.status}}"
          },
          "timestamp": "{{right_now.date}}",
          "metadata": {
            "workflowId": "webhook-appointment-created",
            "workflowName": "Webhook - Appointment Created",
            "triggerType": "AppointmentCreated",
            "source": "GHL"
          }
        }
        ```

#### 5. Webhook - Form Submitted

*   **Workflow Name**: Webhook - Form Submitted
*   **Trigger**: Form Submitted (or specific form)
*   **Action**: Custom Webhook
    *   **URL**: `https://houstonmobilenotarypros.com/api/webhooks/ghl`
    *   **Method**: POST
    *   **Headers**: [Standard Webhook Headers]
    *   **Body**:
        ```json
        {
          "type": "FormSubmit",
          "contactId": "{{contact.id}}",
          "form": {
            "id": "{{form.id}}",
            "name": "{{form.name}}"
          },
          "submission": {
            "id": "{{submission.id}}",
            "data": "{{submission.data}}"
          },
          "timestamp": "{{right_now.date}}",
          "metadata": {
            "workflowId": "webhook-form-submitted",
            "workflowName": "Webhook - Form Submitted",
            "triggerType": "FormSubmitted",
            "source": "GHL"
          }
        }
        ```

--- 