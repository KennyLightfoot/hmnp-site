# 📂 Workflow JSON Templates

This folder contains **import-ready** GoHighLevel (private integration) workflow exports that match the current codebase.

| File | Workflow Name | Trigger Tag |
|------|---------------|-------------|
| `payment-follow-up.json` | Payment Follow-Up | `status:booking_pendingpayment` |
| `confirmation-reminders.json` | Confirmation + Reminders | `status:booking_confirmed` |
| `stripe-webhook-processor.json` | Stripe Webhook Processor | `stripe:payment_completed` / `stripe:payment_failed` / `stripe:refund_processed` |

> Each JSON contains nodes and settings exactly as described in the **2025 setup guide**.  If you tweak a workflow in the UI, re-export and overwrite the corresponding JSON here so the repo stays the single source of truth. 
> 
> Additional workflows outlined in `GHL_MASTER_WORKFLOW_SETUP_GUIDE.md` do not yet have export files in this repository. Set those up manually in GHL if needed. 