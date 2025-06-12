# Plan of Action: Custom Booking & Deposit System

This document outlines the phased development plan for building a custom, on-site booking and payment system for the Houston Mobile Notary Pros website.

### **Project Goals**

1.  **Create a Seamless User Experience:** Allow clients to select a service, choose an available time slot, and pay a deposit in a single, uninterrupted flow on the website.
2.  **Automate Business Logic:** The system must intelligently handle service durations, business hours, buffer times, and prevent double-bookings.
3.  **Increase Conversions:** Secure a commitment from the client by capturing a deposit at the time of booking.
4.  **Maintain Marketing Automation:** Integrate with the existing GoHighLevel (GHL) system to continue leveraging its CRM and marketing features.
5.  **Build a Long-Term Asset:** Create a flexible, ownable system that is not dependent on a specific third-party calendar subscription.

---

### **Core Features & Business Logic**

Our system will be built to handle the following requirements from day one:

*   **Service-Aware Scheduling:** The calendar's availability will be based on the duration of the selected service (e.g., a 90-minute loan signing will block more time than a 30-minute standard notarization).
*   **Dynamic Availability:** We will implement configurable business hours, blackout dates (holidays), and buffer times between appointments to ensure realistic scheduling.
*   **Promo Code Engine:** A complete system for creating, validating, and applying promotional codes (e.g., `10%_OFF`, `$25_DISCOUNT`) to the deposit amount.
*   **Stripe-Powered Deposits:** Secure, on-site payment processing for collecting a mandatory deposit to confirm a booking.
*   **Automated Email Notifications:** A robust email system for appointment confirmations, reminders, and internal alerts.

---

## Phased Development Plan

### **Phase 1: Database & Backend Foundation**

*(Goal: Prepare the application's data structure and core scheduling logic.)*

*   **Step 1.1: Enhance Prisma Schema.**
    *   **Action:** Update `prisma/schema.prisma` with three new models:
        *   `Appointment`: To store all booking details (customer info, service, time, status, price, etc.).
        *   `PromoCode`: To manage discount codes, their rules, and track usage.
        *   `BusinessSettings`: A simple model to store key-value settings like business hours, buffer times, and lead times.
*   **Step 1.2: Update the Database.**
    *   **Action:** Run `pnpm prisma db push` to create the new tables in your database.
*   **Step 1.3: Implement Core Business Logic.**
    *   **Action:** Create a "Settings Service" on the backend that can retrieve your business hours, holidays, and buffer times from the database, making the availability logic configurable.

### **Phase 2: Backend API Development**

*(Goal: Build the secure server-side endpoints that will power the booking experience.)*

*   **Step 2.1: `GET /api/availability`.**
    *   **Function:** Calculates and returns open time slots. It will accept a `date` and `serviceDuration` to provide accurate, conflict-free availability.
*   **Step 2.2: `POST /api/promo-codes/validate`.**
    *   **Function:** Accepts a promo code string, validates it against the database, and returns the discount amount if valid.
*   **Step 2.3: `POST /api/bookings`.**
    *   **Function:** Creates a new `Appointment` with a `PENDING_DEPOSIT` status after re-validating that the chosen time slot is still available.
*   **Step 2.4: `POST /api/create-payment-intent`.**
    *   **Function:** Securely communicates with Stripe to create a payment transaction for the deposit amount (with any promo code discount applied).
*   **Step 2.5: `POST /api/stripe-webhook`.**
    *   **Function:** A secure listener that Stripe calls upon successful payment. This is the critical final step that will update the appointment status to `CONFIRMED` and trigger all post-booking automation.

### **Phase 3: Frontend Implementation**

*(Goal: Build the interactive, user-facing components for the `/booking` page.)*

*   **Step 3.1: `BookingCalendar` Component.**
    *   **Function:** A calendar UI for date selection.
*   **Step 3.2: `TimeSlots` Component.**
    *   **Function:** Fetches and displays available time slots for the selected date and service.
*   **Step 3.3: `BookingForm` Component.**
    *   **Function:** A multi-step form to collect user details and provide an input for applying a promo code.
*   **Step 3.4: `PaymentForm` Component.**
    *   **Function:** A secure, embedded Stripe form for the client to enter payment details.
*   **Step 3.5: Assemble the `/booking` Page.**
    *   **Function:** Orchestrate the entire step-by-step flow on the booking page, guiding the user from date selection to payment confirmation.

### **Phase 4: Post-Booking Automation & Integration**

*(Goal: Automate communications and sync data with GHL after a booking is confirmed.)*

*   **Step 4.1: Implement Email Service.**
    *   **Action:** Integrate a transactional email provider (e.g., Resend, SendGrid) for sending robust, reliable emails.
*   **Step 4.2: Trigger Confirmation & Notification Emails.**
    *   **Action:** In the Stripe webhook, after a booking is confirmed, trigger two emails:
        1.  **To the Customer:** A detailed appointment confirmation.
        2.  **To Admin:** An internal notification of the new booking.
*   **Step 4.3: Implement GHL Sync.**
    *   **Action:** Also within the webhook, make an API call to your GoHighLevel account to create/update the contact and place them in a "Booking Confirmed" pipeline stage.

### **Phase 5: Future Enhancements (Post-MVP)**

*(This plan focuses on the core booking engine. These are logical next steps to consider after the initial version is live.)*

*   **Admin Dashboard:** A secure area to view all appointments, manage promo codes, and configure business settings without touching code.
*   **Client Accounts:** Allow clients to log in to view their appointment history and rebook easily.
*   **Client-Side Cancellation/Rescheduling:** A flow for clients to manage their own appointments within certain business rules (e.g., "no cancellations within 24 hours").
*   **Automated Reminder Emails:** A scheduled task (cron job) that runs daily to send reminders for upcoming appointments.

---

This plan of action provides a clear roadmap for the project. It addresses your requirements and establishes a solid foundation for a powerful, long-term business asset.

If this aligns with your vision, we can begin with **Phase 1, Step 1.1: Enhance Prisma Schema.** 