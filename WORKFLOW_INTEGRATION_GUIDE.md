# 🚀 GHL Workflow Integration Guide for Houston Mobile Notary Pros

**A consolidated guide for setting up, configuring, and testing GoHighLevel (GHL) workflows to integrate seamlessly with the web application's booking and scheduling system.**

This guide synthesizes information from existing internal documentation and GoHighLevel's official help articles to provide a single source of truth for workflow management.

---

## 📋 **Prerequisites**

Before you begin, ensure you have the following:

1.  **GHL Private Integration Token**: Find this in your GHL account under **Settings > Company > API Keys**.
2.  **Location ID**: Found in your GHL sub-account settings.
3.  **Stripe Account**: Connected to both your web app and your GHL account.
4.  **Environment Variables**: Your `.env` file must be populated with the correct GHL and Stripe API keys and secrets.

```bash
# Required .env variables for GHL Integration
GHL_API_KEY=your_private_integration_token_here
GHL_LOCATION_ID=your_location_id_here
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28
GHL_WEBHOOK_SECRET=your_secure_webhook_secret

# Workflow IDs (get these after creating/importing workflows in GHL)
GHL_BOOKING_CONFIRMED_WORKFLOW_ID=your-booking-confirmed-workflow-id
GHL_PAYMENT_PENDING_WORKFLOW_ID=your-payment-pending-workflow-id
GHL_NEW_BOOKING_WORKFLOW_ID=your-new-booking-workflow-id

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ⚙️ **Core Integration Components**

The integration between the web app and GHL relies on three main components: API Endpoints, Webhooks, and GHL Actions.

### **1. Key API Endpoints**

Our web application exposes several API endpoints that GHL workflows can call to fetch data or trigger actions.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/bookings/pending-payments?contactId={id}` | Retrieves bookings with a `PAYMENT_PENDING` status for a specific GHL contact. Used in the **Payment Follow-Up** workflow. |
| `POST` | `/api/bookings/sync` | Creates a new booking in our database. Used by the **Phone-to-Booking** workflow to sync appointments made over the phone. |

### **2. Webhook Configuration**

Webhooks are the primary mechanism for real-time communication from external services to our app.

- **Stripe Webhook**:
    - **URL**: `https://yourdomain.com/api/webhooks/stripe`
    - **Events to Listen For**:
        - `checkout.session.completed`
        - `payment_intent.succeeded`
        - `payment_intent.payment_failed`
        - `charge.refunded`
    - **Purpose**: Informs our app about payment status changes, which then updates booking status and GHL tags.

- **GHL Webhook**:
    - **URL**: `https://yourdomain.com/api/webhooks/ghl`
    - **Purpose**: Receives events from GHL, such as form submissions or survey responses, to be processed by our application.

As per the [HighLevel Support Portal](https://help.gohighlevel.com/support/solutions), webhooks are crucial for real-time data synchronization.

### **3. GHL Triggers and Actions**

Workflows in GHL are initiated by **Triggers** (e.g., a tag is added) and perform **Actions** (e.g., send an email, call a webhook).

- **Triggers**: Mostly based on contact tags. For example, the `status:booking_confirmed` tag starts the **Booking Confirmation** workflow.
- **Actions**:
    - **Internal GHL Actions**: Sending emails, SMS, or adding notes.
    - **External Actions (Webhooks)**: Calling our API endpoints (like `/api/bookings/sync`) to push or pull data from our application.

---

## 🛠️ **Workflow Setup: Step-by-Step**

Follow these steps to import and configure the essential workflows for the web application.

### **Step 1: Import Workflow Templates**

The `docs/workflows/` directory contains JSON files for each required workflow.

1.  Navigate to the **Automation** tab in your GHL sub-account.
2.  Click **Create workflow**, then select **Import from file**.
3.  Import the following JSON files one by one:
    - `stripe-webhook-processor.json`
    - `new-booking-notification.json`
    - `confirmation-reminders.json`
    - `payment-follow-up.json`
    - `cancellation-handler.json`
    - `reschedule-handler.json`
    - `phone-to-booking.json`

### **Step 2: Configure Critical Workflows**

#### **1. Stripe Webhook Processor** (`stripe-webhook-processor.json`)
- **Trigger**: Listens for incoming webhook events from Stripe.
- **Purpose**: This is the most critical workflow for payment processing. It translates Stripe payment events into GHL tags that drive the entire booking lifecycle.
- **Actions**:
    1.  **On `checkout.session.completed`**:
        - Removes tag `status:booking_pendingpayment`.
        - Adds tag `status:booking_confirmed`.
        - Adds tag `status:payment_completed`.
        - Updates custom field `cf_booking_status` to "Confirmed".
    2.  **On `payment_intent.payment_failed`**:
        - Adds tag `status:payment_failed`.
        - Sends an internal notification to the admin.

#### **2. Booking Confirmation & Reminders** (`confirmation-reminders.json`)
- **Trigger**: Tag Added - `status:booking_confirmed`.
- **Purpose**: To communicate with the client after a successful payment.
- **Actions**:
    1.  **Immediate**: Send "Booking Confirmed" email to the client.
    2.  **Wait**: Wait until 24 hours before the appointment.
    3.  **Send**: Send 24-hour reminder SMS/email.
    4.  **Wait**: Wait until 2 hours before the appointment.
    5.  **Send**: Send 2-hour reminder SMS/email.

#### **3. Payment Follow-Up** (`payment-follow-up.json`)
- **Trigger**: Tag Added - `status:booking_pendingpayment`.
- **Purpose**: To recover potentially lost revenue from abandoned checkouts.
- **Actions**:
    1.  **Wait 1 Hour**: Send first payment reminder email with the checkout link.
    2.  **Webhook Action**: Use a webhook to `GET /api/bookings/pending-payments?contactId={{contact.id}}` to retrieve the payment link and details.
    3.  **Wait 23 Hours**: Send second SMS reminder.
    4.  **Wait 48 Hours**: Create a manual call task for an admin to follow up.

#### **4. Phone-to-Booking Conversion** (`phone-to-booking.json`)
- **Trigger**: Tag Added - `lead:phone_qualified`.
- **Purpose**: To create a formal booking in our system from a qualified phone lead.
- **Actions**:
    1.  **GHL Form**: A GHL form should be filled out internally to gather booking details.
    2.  **Webhook Action**: On form submission, the workflow triggers a `POST` request to `/api/bookings/sync` with the form data.
    3.  **App Backend**: The web app creates the booking, generates a payment link, and applies the `status:booking_pendingpayment` tag.
    4.  **Tag Change**: The `Payment Follow-Up` workflow is automatically initiated.

### **Step 3: Verify Custom Fields**

Your GHL instance must have the following custom fields to support the integration. These are automatically populated by the web app's booking API.

| Field Name | Type | Purpose |
| :--- | :--- | :--- |
| `cf_booking_id` | Text | Stores the unique booking ID from our database. |
| `cf_payment_url`| Text | Stores the Stripe checkout URL. |
| `cf_booking_status`| Text | Tracks the current status of the booking. |
| `cf_appointment_date`| Date | The scheduled date of the appointment. |
| `cf_appointment_time`| Text | The scheduled time of the appointment. |

---

## ✅ **Testing the Integration**

1.  **End-to-End Test**:
    - Create a test booking on the website.
    - Verify a new contact is created in GHL with the `status:booking_pendingpayment` tag.
    - Check that the "Payment Follow-Up" workflow has started for that contact.
    - Complete the payment using the Stripe checkout link.
    - Verify the tags are updated to `status:booking_confirmed` and the "Booking Confirmation" workflow begins.

2.  **Stripe CLI Test**:
    - Use the Stripe CLI to forward events to your local development server to test the `/api/webhooks/stripe` endpoint directly.
    - Command: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

3.  **Phone Booking Test**:
    - Manually add the `lead:phone_qualified` tag to a test contact.
    - Fill out the associated GHL form.
    - Verify the "Phone-to-Booking" workflow calls the `/api/bookings/sync` endpoint and that a new booking appears in your database.

---

This guide provides the necessary steps to align your GHL workflows with the web application's logic. For more advanced configurations, always refer to the official [GoHighLevel Support Portal](https://help.gohighlevel.com/support/solutions). 