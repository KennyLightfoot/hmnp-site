# GHL Manual Pipeline Setup for Ad Campaigns

This guide outlines the steps to manually create the necessary pipelines in your GoHighLevel (GHL) account to manage leads generated from your advertising campaigns. Since API-based pipeline creation encountered IAM issues, manual setup is required.

## Accessing Pipeline Settings

1.  Log in to your GoHighLevel account.
2.  Navigate to **CRM** from the left-hand sidebar.
3.  Click on **Pipelines** (it might be under an "Opportunities" tab or section).
4.  Look for **Pipeline Settings** or a gear icon (⚙️) or a button like "Manage Pipelines" or "+ Create Pipeline". The exact location can vary slightly based on GHL UI updates.

## Pipeline 1: Advertising Leads (Recommended)

This pipeline is dedicated to managing all leads coming directly from your ad campaigns.

1.  **Create the Pipeline:**
    *   Click on "**+ Create New Pipeline**" or similar button.
    *   **Pipeline Name:** `Advertising Leads` (or `Ad Campaign Leads`)
    *   Click **Save** or **Create**.

2.  **Add Stages to the "Advertising Leads" Pipeline:**
    *   Select the newly created "Advertising Leads" pipeline to edit its stages.
    *   Click "**+ Add Stage**" or similar for each stage below, in order:

    1.  **Stage Name:** `New Ad Lead (Awaiting Contact)`
        *   **Description (Optional):** Initial stage for all new leads from ad platforms. Awaiting first contact/qualification.
        *   **Probability (Optional):** e.g., 10%

    2.  **Stage Name:** `Contact Attempted (Ad Lead)`
        *   **Description (Optional):** Initial contact (SMS/email/call) has been made or attempted.
        *   **Probability (Optional):** e.g., 25%

    3.  **Stage Name:** `Qualified (Ad Lead)`
        *   **Description (Optional):** Lead has responded and shown interest; requirements understood.
        *   **Probability (Optional):** e.g., 50%

    4.  **Stage Name:** `Quote Sent (Ad Lead)`
        *   **Description (Optional):** A quote or service proposal has been sent to the lead.
        *   **Probability (Optional):** e.g., 65%

    5.  **Stage Name:** `Booked (Ad Lead)`
        *   **Description (Optional):** Lead has booked a service and payment may be pending or completed.
        *   **Probability (Optional):** Set to 100% if this means "Won".
        *   **Deal Status:** Mark as "Won" if GHL allows setting this per stage.

    6.  **Stage Name:** `Service Completed (Ad Lead)`
        *   **Description (Optional):** Service has been delivered to the ad lead.
        *   **Probability (Optional):** 100%
        *   **Deal Status:** "Won"

    7.  **Stage Name:** `Not Interested (Ad Lead)`
        *   **Description (Optional):** Lead has explicitly stated they are not interested, or has gone cold after multiple follow-ups.
        *   **Probability (Optional):** 0%
        *   **Deal Status:** Mark as "Lost".

    8.  **Stage Name:** `On Hold (Ad Lead)`
        *   **Description (Optional):** Lead needs more time, or follow-up is paused for a specific reason.
        *   **Probability (Optional):** Adjust as needed.

3.  **Get Pipeline and Stage IDs (CRITICAL FOR `.env`):**
    *   Once the "Advertising Leads" pipeline and its stages are created, you need their unique IDs for your `.env` file (`GHL_AD_LEADS_PIPELINE_ID` and `GHL_NEW_AD_LEAD_STAGE_ID`).
    *   **How to find them:**
        *   Often, when you click to edit a pipeline or a specific stage, the ID will be visible in the URL of your browser.
        *   Example Pipeline URL: `https://app.gohighlevel.com/pipelines/settings/PIPELINE_ID_HERE`
        *   Example Stage URL (might be part of pipeline edit page): Look for attributes or IDs when inspecting the stage element or in URLs if editing stages individually.
        *   If GHL has an API explorer or developer mode, you might be able to list pipelines/stages and their IDs there.
    *   Record the ID for the entire "Advertising Leads" pipeline.
    *   Record the ID for the first stage: "New Ad Lead (Awaiting Contact)".

## Other Pipelines (from Master Setup Guide - Create if not existing)

Your `setup-ghl-complete.js` script was intended to create these. Since it faced issues with pipeline creation, verify if they exist. If not, create them manually following a similar process as above. The stages for these were outlined in the script output and `GHL_MASTER_SETUP_GUIDE.md`.

1.  **Pipeline Name:** `HMNP - Lead to Service Pipeline` (Your main service pipeline)
    *   Stages likely include: New Lead, Contacted, Quote Sent, Booked, Service Scheduled, Service Complete, Follow-up.

2.  **Pipeline Name:** `HMNP - Support Ticket Pipeline`
    *   Stages likely include: New Ticket, Under Review, In Progress, Pending Client, Resolved, Closed.

3.  **Pipeline Name:** `HMNP - Affiliate & Referral Pipeline`
    *   Stages likely include: New Application, Review & Verification, Onboarding, Active Affiliate, Commission Calculation, Payment Processed.

4.  **Pipeline Name:** `HMNP - Remote Online Notarization Pipeline`
    *   Stages likely include: RON Request, Document Prep, ID Verification, Session Scheduled, Session Completed, Documentation Complete.

**Note on these additional pipelines:** For now, your immediate focus for ads is the "Advertising Leads" pipeline. You can prioritize creating the others as needed for your overall business operations.

## Important Considerations

*   **Stage Order:** Ensure stages are in a logical flow representing the customer journey.
*   **Deal Status:** For stages like "Booked" or "Not Interested", ensure GHL's deal status (Open, Won, Lost) is appropriately set if the option is available at the stage level. This helps with reporting.
*   **User Permissions:** Ensure users who will manage these opportunities have the correct permissions to view and move opportunities through these pipelines.

After creating the "Advertising Leads" pipeline and its initial stage, update your `.env.local` file with:

```env
GHL_AD_LEADS_PIPELINE_ID=ID_OF_THE_ADVERTISING_LEADS_PIPELINE
GHL_NEW_AD_LEAD_STAGE_ID=ID_OF_THE_NEW_AD_LEAD_AWAITING_CONTACT_STAGE
```

This manual setup will enable your `/api/submit-ad-lead` endpoint to correctly place new ad leads into the designated pipeline and stage in GHL. 