# Ad Campaign Readiness Checklist

This checklist outlines the essential configurations and setup steps required across your GoHighLevel (GHL) account, web application, and advertising platforms to successfully run ad campaigns and drive traffic to your site.

## I. GoHighLevel (GHL) Configuration

**Prerequisite:** Ensure your GHL API Key and Location ID are correctly set in your web application's environment variables (`.env.local`).

1.  **Custom Fields for Ad Tracking:**
    *   [ ] Verify/Create `cf_ad_platform` (Text)
    *   [ ] Verify/Create `cf_ad_campaign_name` (Text)
    *   [ ] Verify/Create `cf_ad_campaign_id` (Text)
    *   [ ] Verify/Create `cf_ad_group_id` (Text)
    *   [ ] Verify/Create `cf_ad_id` (Text)
    *   [ ] Verify/Create `cf_ad_keyword` (Text - for Search Ads)
    *   [ ] Verify/Create `cf_landing_page_url` (Text)
    *   [ ] Verify/Create `cf_utm_source` (Text)
    *   [ ] Verify/Create `cf_utm_medium` (Text)
    *   [ ] Verify/Create `cf_utm_campaign` (Text)
    *   [ ] Verify/Create `cf_utm_term` (Text)
    *   [ ] Verify/Create `cf_utm_content` (Text)
    *   **Action:** Note down the GHL Custom Field IDs for each of these and update the `GHL_CUSTOM_FIELD_IDS` map in `pages/api/submit-ad-lead.ts` and the corresponding environment variables (e.g., `GHL_CF_ID_AD_PLATFORM`).

2.  **Tags for Ad Lead Segmentation:**
    *   [ ] Create `AdLead:Facebook`
    *   [ ] Create `AdLead:GoogleAds`
    *   [ ] Create `AdLead:LinkedInAds`
    *   [ ] Create `AdLead:YelpAds`
    *   [ ] Create `Status:New_Ad_Lead`
    *   [ ] Consider campaign-specific tags (e.g., `AdCampaign:SpringPromo2024`)

3.  **Pipelines (Manual Setup - Refer to `GHL_Manual_Pipeline_Setup.md`):**
    *   [ ] Manually create the "Advertising Leads" pipeline.
    *   [ ] Add recommended stages: `New Ad Lead (Awaiting Contact)`, `Contact Attempted`, `Qualified`, `Quote Sent`, `Booked`, `Service Completed`, `Not Interested`, `On Hold`.
    *   [ ] Obtain the **Pipeline ID** for "Advertising Leads" and the **Stage ID** for "New Ad Lead (Awaiting Contact)".
    *   **Action:** Update `.env.local` with `GHL_AD_LEADS_PIPELINE_ID` and `GHL_NEW_AD_LEAD_STAGE_ID`.

4.  **Workflows for Ad Lead Automation:**
    *   [ ] **Design & Create "New Ad Lead - Initial Processing & Follow-Up" Workflow:**
        *   **Trigger:** Form Submission (specific to ad landing page forms) OR Tag Added (e.g., `Status:New_Ad_Lead` if applied by web app).
        *   **Actions:**
            *   [ ] Add relevant tags (e.g., `AdLead:Facebook`, `AdCampaign:[Name]`).
            *   [ ] (Handled by web app API: Create/Update Contact with all custom fields mapped).
            *   [ ] (Handled by web app API: Create Opportunity in "Advertising Leads" pipeline, "New Ad Lead" stage).
            *   [ ] Send immediate Welcome SMS (tailored to ad source/offer).
            *   [ ] Send immediate Welcome Email (tailored to ad source/offer).
            *   [ ] Create Task for sales team follow-up.
            *   [ ] Consider conditional logic (If/Else) based on `cf_ad_platform` or `cf_utm_campaign` for slightly different messaging.
    *   [ ] **Webhook Security:** Ensure your GHL workflows sending data to your web app use a secure method (e.g., a shared secret or signature validation if your endpoint supports it, though your `GHL_Workflow_Details.md` primarily focuses on GHL sending *to* your app, not receiving *from* it for triggers beyond standard ones like form submissions).

5.  **Webhooks (Manual Setup if needed for GHL -> Your App beyond Form Workflows):**
    *   [ ] While your primary ad lead capture sends data *to* GHL via your API, review if any GHL events (e.g., opportunity stage changes *for ad leads*) need to trigger actions *back* in your web app via GHL-initiated webhooks.
    *   [ ] If so, manually create these in GHL: **Settings → Webhooks**. The API script for this failed.
    *   [ ] Ensure your `/api/webhooks/ghl` endpoint can securely process these (validate signature if GHL supports sending one for these event types).

## II. Web Application Setup (Next.js)

1.  **Ad Landing Pages (e.g., in `app/lp/`):**
    *   [x] Create a dedicated landing page for each major ad platform/campaign (e.g., `app/lp/facebook-general-notary/page.tsx`). (Covered: Facebook Spring Promo, Google Loan Signing, Yelp General, LinkedIn B2B)
    *   [x] Ensure each landing page uses the updated `<LeadForm />` component. (Verified by structure copied from example)
    *   [x] **Action:** Configure `LeadForm` props on each landing page:
        *   `apiEndpoint="/api/submit-ad-lead"` (Done)
        *   Pass correct `tags` (e.g., `["AdLead:Facebook", "AdCampaign:SpringPromo"]`). (Done for each created LP)
        *   Pass correct `customFields` (e.g., `{{ cf_ad_platform: "Facebook", cf_ad_campaign_name: "SpringPromo" }}`). These are the friendly keys mapped in your API route. (Done for each created LP)
        *   Pass `campaignName` prop if used by your API logic. (Done for each created LP)
        *   Set `successRedirectUrl` to an appropriate thank-you page. (Done, points to `/thank-you-ads`)

2.  **Lead Form (`components/lead-form.tsx`):**
    *   [x] Confirmed: Updated to submit JSON to `/api/submit-ad-lead`.
    *   [x] Confirmed: Automatically collects UTM parameters from URL.
    *   [x] Confirmed: Sends `tags`, `customFieldsFromProps`, `utmData`, `landingPageUrl`, `campaignName` in payload.

3.  **API Endpoint (`pages/api/submit-ad-lead.ts`):**
    *   [x] Confirmed: Created.
    *   [x] **ACTION (Crucial):** Update the `GHL_CUSTOM_FIELD_IDS` mapping object with your **actual GHL Custom Field IDs** for each friendly key. (You have confirmed the IDs and will update .env.local)
    *   [x] Confirmed: Uses `upsertContact` from `lib/ghl.ts`.
    *   [x] Confirmed: Includes logic to call `createOpportunity` (ensure `GHL_AD_LEADS_PIPELINE_ID` and `GHL_NEW_AD_LEAD_STAGE_ID` are set in `.env.local`). (Verified, relies on .env variables)

4.  **GHL Utilities (`lib/ghl.ts`):**
    *   [x] Confirmed: `upsertContact` function is suitable for receiving contact data including tags and custom fields (ensure `GhlCustomField` interface with `id` and `value` is used correctly by the API endpoint).
    *   [x] Confirmed: `createOpportunity` function is added (ensure it correctly maps to GHL API structure and includes `locationId` if required by your GHL API version for opportunities).

5.  **Thank You Pages (e.g., `app/thank-you-ads/page.tsx` or platform-specific):**
    *   [x] Create relevant thank-you pages. (Created `app/thank-you-ads/page.tsx`)
    *   [ ] **Action:** Install ad platform conversion tracking pixels/tags on these pages (Facebook Lead Event, Google Ads Conversion, LinkedIn Conversion Tag). (Placeholders added, actual implementation pending by user)

6.  **Tracking Pixel Installation (Global & Conversion):**
    *   [x] Add **Facebook Pixel** base code to `app/layout.tsx` (or equivalent global component). (Base code added, Pixel ID needs to be replaced by user)
    *   [x] Add **LinkedIn Insight Tag** base code to `app/layout.tsx`. (Base code added, Partner ID needs to be replaced by user)
    *   [x] Confirm **Google Analytics (GA4)** is present (already done in `app/layout.tsx`). Ensure Google Ads is linked to GA4 for conversion import if using that method. (Confirmed present)
    *   [ ] Implement specific conversion event firing on thank-you pages (e.g., `fbq('track', 'Lead');`, `gtag('event', 'conversion', ...)`). (User to implement based on placeholders)

7.  **Environment Variables (`.env.local`):**
    *   [ ] `GHL_API_KEY` (Your GHL Private Integration Token) - User to set
    *   [ ] `GHL_LOCATION_ID` - User to set
    *   [ ] `GHL_API_BASE_URL` (Defaults to `https://services.leadconnectorhq.com`) - User to verify/set
    *   [ ] `GHL_AD_LEADS_PIPELINE_ID` (From manual GHL setup) - User to set
    *   [ ] `GHL_NEW_AD_LEAD_STAGE_ID` (From manual GHL setup) - User to set
    *   [x] **Action:** Add all `GHL_CF_ID_...` variables for each custom field ID used in `pages/api/submit-ad-lead.ts`. (IDs identified, user to add to .env.local)

## III. Advertising Platform Setup

For each platform (Facebook Ads, Google Ads, LinkedIn Ads, Yelp Ads):

1.  **Campaign Structure:**
    *   [ ] Define clear campaign objectives (e.g., Lead Generation).
    *   [ ] Structure campaigns, ad groups/ad sets, and ads logically.

2.  **Audience Targeting:**
    *   [ ] Define target audiences for each platform.
    *   [ ] Set up any custom audiences or lookalike audiences if applicable.

3.  **Ad Creatives & Copy:**
    *   [ ] Develop compelling ad creatives (images/videos) and copy tailored to each platform and target audience.
    *   [ ] Ensure ad copy aligns with landing page content.

4.  **Destination URLs & UTM Tagging:**
    *   [ ] **Action (Crucial):** For every ad, set the destination URL to your specific landing page.
    *   [ ] **Action (Crucial):** Append consistent UTM parameters to all destination URLs:
        *   `utm_source`: (e.g., `facebook`, `google`, `linkedin`, `yelp`)
        *   `utm_medium`: (e.g., `cpc`, `social_ad`, `search_ad`)
        *   `utm_campaign`: (Your internal campaign name, e.g., `spring_notary_promo`)
        *   `utm_content`: (To differentiate ads, e.g., `blue_banner_video_cta`)
        *   `utm_term`: (For search ads, the keyword. Google Ads can auto-tag this).

5.  **Conversion Tracking Setup:**
    *   [ ] **Facebook Ads:**
        *   [ ] Install Facebook Pixel on your website.
        *   [ ] Set up a "Lead" standard event or custom conversion to fire on your thank-you page.
        *   [ ] Verify pixel and event setup in Facebook Events Manager.
    *   [ ] **Google Ads:**
        *   [ ] Install Google Ads Tag (gtag.js) or link Google Analytics 4 and import GA4 conversions.
        *   [ ] Set up a "Lead" conversion action in Google Ads to fire on your thank-you page.
        *   [ ] Verify conversion tracking.
    *   [ ] **LinkedIn Ads:**
        *   [ ] Install LinkedIn Insight Tag on your website.
        *   [ ] Set up a "Lead" conversion in LinkedIn Campaign Manager to fire on your thank-you page.
        *   [ ] Verify tag and conversion setup.
    *   [ ] **Yelp Ads:** Tracking primarily relies on UTMs and analytics on your landing page, as Yelp has limited off-platform pixel tracking.

6.  **Budget & Bidding:**
    *   [ ] Set appropriate budgets and bidding strategies for your campaigns.

## IV. Testing & Launch

1.  **End-to-End Testing:**
    *   [ ] Test each landing page form submission.
    *   [ ] Verify lead data (contact info, custom fields, tags, opportunity) appears correctly in GHL.
    *   [ ] Confirm automated workflows in GHL trigger as expected (welcome SMS/email, task creation).
    *   [ ] Confirm conversion events fire correctly and are reported in ad platforms.
    *   [ ] Test on different devices/browsers.
2.  **Review & Go Live:**
    *   [ ] Double-check all ad copy, targeting, URLs, and UTMs in ad platforms.
    *   [ ] Launch campaigns.
3.  **Post-Launch Monitoring:**
    *   [ ] Monitor ad performance in each platform.
    *   [ ] Monitor lead flow into GHL.
    *   [ ] Check for any errors in your web app logs or GHL workflow logs.

This checklist should provide a comprehensive path to getting your ad campaigns up and running effectively. Good luck! 