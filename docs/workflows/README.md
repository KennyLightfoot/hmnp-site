# 📂 Workflow JSON Templates

This folder contains **import-ready** GoHighLevel (private integration) workflow exports that match the current codebase.

| File | Workflow Name | Trigger Tag |
|------|---------------|-------------|
| `payment-follow-up.json` | Payment Follow-Up | `status:booking_pendingpayment` |
| `confirmation-reminders.json` | Confirmation + Reminders | `status:booking_confirmed` |
| `stripe-webhook-processor.json` | Stripe Webhook Processor | `stripe:payment_completed` / `stripe:payment_failed` / `stripe:refund_processed` |
| `cancellation-handler.json` | Booking Cancellation Handler | `action:cancel_booking` |
| `reschedule-handler.json` | Booking Rescheduling Handler | `action:reschedule_booking` |
| `new-booking-notification.json` | New Booking Notification | `status:booking_created` |
| `phone-to-booking.json` | Phone-to-Booking Conversion | `lead:phone_qualified` |
| `emergency-service.json` | Emergency Service Response | `Service:Emergency` / `Priority:Same_Day` |
| `no-show-recovery.json` | No-Show Recovery | `status:no_show` |
| `post-service-follow-up.json` | Post-Service Follow-up & Review | `status:service_completed` |

> Each JSON contains nodes and settings exactly as described in the **2025 setup guide**.  If you tweak a workflow in the UI, re-export and overwrite the corresponding JSON here so the repo stays the single source of truth. 