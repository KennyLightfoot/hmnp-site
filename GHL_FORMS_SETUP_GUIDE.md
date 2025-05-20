# GoHighLevel (GHL) Forms Setup Guide

This guide provides detailed instructions and best practices for setting up and integrating your custom website forms with GoHighLevel (GHL). It focuses on the strategy for leveraging your Next.js React components to seamlessly feed data into your GHL account.

---

## 1. Key Custom Website Forms & GHL Integration Strategy

### A. Overview of Custom Website Forms
Your website is the primary channel for client interactions and lead generation. The following custom forms have been developed (or are planned) as React components within the Houston Mobile Notary Pros Next.js application. This section outlines these forms and their intended GHL integration. For detailed API integration steps, refer to the main GHL Setup Guide's section on "Integrate Your Website Forms" or specific API endpoint documentation.

| Form Name (Component Path/Status)         | Purpose                                   | Key GHL Custom Fields Involved (see Section 4 for full list)                                                                                                   | Primary GHL Pipeline(s) Involved |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **General Contact Form** (`components/contact-form.tsx`) | Generic inquiries                         | `cf_contact_inquiry_subject`, `cf_contact_message_details`                                                                                                  | Client Acquisition                  |
| **Service Booking & Calendar** (`components/service-booking-form.tsx` - *with `appointment-calendar.tsx` planned*) | Service booking with calendar integration | `cf_booking_service_type`, `cf_booking_number_of_signers`, `cf_booking_appointment_datetime`, `cf_booking_service_address`, `cf_booking_additional_notes` | Service Booking & Delivery          |
| **Request a Call Form** (`components/request-call-form.tsx`) | Capture callback requests                 | `cf_preferred_call_time`, `cf_call_request_reason`                                                                                                             | Client Acquisition                  |
| **Newsletter Signup Form** (`components/newsletter-signup-form.tsx`) | Collect newsletter subscribers            | `cf_consent_newsletter`                                                                                                                                        | Client Acquisition                  |
| **Feedback/Testimonial Form** (`components/feedback-form.tsx`) | Collect reviews after service             | `cf_feedback_rating`, `cf_feedback_comments`, `cf_consent_display_testimonial`                                                                              | Client Support / Marketing          |
| **Support Ticket Form** (`components/support-ticket-form.tsx`) | Allow users to request support            | `cf_support_issue_category`, `cf_support_issue_description`, `cf_support_client_urgency`, `cf_support_file_attachment_link`                                  | Client Support                      |
| **Document Upload Form** (`components/document-upload-form.tsx`) | Securely collect documents                | `cf_document_type_uploaded`, `cf_document_s3_link`, `cf_document_upload_date`                                                                                | Service Booking & Delivery / Client Support |
| **Event Registration Form** (`components/event-registration-form.tsx`) | Register for events/webinars              | `cf_event_registered_for_name`, `cf_event_attendees_count`, `cf_event_dietary_restrictions`                                                                    | Event Registrations                 |
| **Payment Form** (`components/payment-form.tsx`)           | Accept payments/invoices online           | `cf_payment_invoice_number`, `cf_payment_service_description`, `cf_payment_amount_paid`, `cf_payment_date`, `cf_payment_status`, `cf_payment_transaction_id`      | Service Booking & Delivery          |
| **Affiliate Partner Signup Form** (`components/affiliate-signup-form.tsx`) | Apply to become an affiliate partner | `cf_affiliate_business_name`, `cf_affiliate_website_url`, `cf_affiliate_promotion_plan`, `cf_affiliate_payout_preference_notes`, `cf_affiliate_terms_accepted` | Affiliate Management / Onboarding |
| **Partner Referral Submission Form** (`components/partner-referral-form.tsx`) | Active partners submit new leads   | `cf_referred_by_partner_id` (on new lead), `cf_partner_referral_notes` (on new lead), `cf_is_partner_referral` (tag/field on new lead) | Client Acquisition                  |

*Note: '.tsx' paths indicate components already created. 'Assumed' components are placeholders in planning and may need creation or confirmation of their existence and path. All forms should also capture standard contact info (Name, Email, Phone) and relevant consent fields (e.g., `cf_terms_accepted`, `cf_consent_sms`).*

### B. Integrating Custom Website Forms via API (Strategy Overview)
The primary method for integrating these custom website forms with GHL is via API submissions. This involves:
1.  Your website's frontend form (the `.tsx` component) capturing the user data. This includes ensuring all necessary fields (like name, email, phone, consents, and service-specific data) are present and correctly styled for your brand.
2.  The form submitting data to a specific Next.js API route within your HMNP website's backend (e.g., `/api/feedback`, `/api/calendar/create-appointment`).
3.  This Next.js API route then processes the data and makes the appropriate calls to the GoHighLevel API to:
    *   Create or update a contact.
    *   Add the contact to the relevant pipeline and stage.
    *   Apply appropriate tags.
    *   Populate custom fields (ensure your API payload correctly maps your form fields to GHL custom field IDs/keys).
    *   Trigger workflows if applicable.

While GoHighLevel offers a native form builder (**Sites > Forms** in the GHL platform), for a custom-branded and deeply integrated website experience like HMNP's, direct API integration from your existing `.tsx` components is the recommended and primary strategy. Therefore, rebuilding these forms visually within GHL's native form builder is generally not required for them to function and feed data into GHL. Key considerations for your `.tsx` forms and API backend include:
-   **Field Mapping:** Ensure your Next.js API backend correctly maps data from your `.tsx` form fields to the corresponding GHL custom fields.
-   **Data Validation:** Implement robust validation both on the frontend (in the `.tsx` component using Zod) and backend (in the Next.js API route) before sending data to GHL.
-   **Required Fields:** While validation is handled in your code, ensure that GHL is set up to expect crucial data points.
-   **Consent Capture:** Explicitly capture and send consent data (e.g., terms accepted, SMS consent) to corresponding GHL custom fields or tags.

### C. Best Practices for Forms & GHL Integration
- **Field Mapping:** Ensure all form fields are mapped to GHL custom fields for seamless data capture.
- **Tags:** Use workflows to automatically apply tags based on form submissions (e.g., “Website Lead”, “Booking Lead”). Consider specific tags for lead sources (e.g., `Source:Facebook_Ad`, `Source:GMB_Profile_Visit`).
- **Automation:** Trigger workflows on form submission (e.g., send confirmation, assign pipeline stage, notify staff).
- **Testing:** Submit test entries and verify data in GHL (Contacts, Custom Fields, Tags, Pipeline).
- **Compliance:** Always include terms and consent checkboxes for legal and marketing compliance.
- **Lead Source Tracking:**
    - Implement URL parameters (e.g., UTM parameters like `utm_source`, `utm_medium`, `utm_campaign`, or custom parameters like `ref_platform=yelp`) for links pointing to your website forms from external sources (ads, social media profiles, partner sites).
    - Ensure your Next.js API endpoints that handle form submissions are designed to capture these URL parameters.
    - Create a dedicated custom field in GHL (e.g., `cf_lead_source_detail`) to store this granular source information.
    - Use GHL workflows to apply broader source tags (e.g., `Source:Paid_Ad`, `Source:Social_Media_Organic`) based on the data in `cf_lead_source_detail` or specific URL parameters. This allows for robust reporting and campaign performance analysis.

> **Tip:** For more advanced automation, use GHL’s Workflow Builder to trigger actions, apply tags, and route leads based on form data and lead source.

### D. Configuring GHL to Receive Data from Your Custom Website Forms

Since your website uses custom-coded React (`.tsx`) forms that submit data via your own Next.js API to GoHighLevel, you **do not need to visually rebuild these exact forms using GHL's internal Form Builder** for the data integration to work. Your `.tsx` files define the form's appearance and fields, and your API backend handles the submission to GHL.

However, to ensure GHL can correctly receive, store, and process the data from your custom forms, the following GHL-side configurations are essential:

1.  **Create Corresponding Custom Fields:**
    *   **What:** This is the most critical step. Every piece of information your website form collects (e.g., "Preferred Call Time" from `request-call-form.tsx`, or "Number of Signers" from `service-booking-form.tsx`) must have a corresponding Custom Field created in GHL.
    *   **Why:** GHL needs these defined fields to store the specific data points sent by your API. Without them, the data either won't be saved correctly or will be mismatched. The "Key" for each custom field (auto-generated by GHL when you create the field) is particularly important, as this key is often used in API calls to map your website form data to the correct GHL custom field.
    *   **How-to-in-GHL:**
        *   Navigate to **Settings > Custom Fields** in your GHL account.
        *   Click **+ Add Custom Field**.
        *   Choose the appropriate field type (Text, Phone, Email, Date, Number, Dropdown Select, Radio Select, Checkbox, File Upload, etc.) that best matches the data type of your website form field. For example, a "Preferred Call Time" dropdown on your website should map to a "Dropdown Select" or "Radio Select" custom field in GHL, where you'll define the same options.
        *   Give it a clear, descriptive name (e.g., "CF Preferred Call Time" or "Booking - Number of Signers").
        *   Note the `{{custom_fields.your_field_key}}` or the field ID that GHL provides; your API integration will need this to correctly map data.
        *   Organize fields into folders if desired (e.g., "Booking Details," "Contact Preferences," "Feedback Data").
    *   **Reference:** The table in Section 1.A lists key GHL Custom Fields involved for each form. Ensure all of these, plus any other standard contact fields (First Name, Last Name, Email, Phone) and consent fields (e.g., Terms Accepted, SMS Opt-in), are accurately created in GHL.

2.  **Prepare Tags:**
    *   **What:** Define any tags you want to be applied upon form submission (e.g., `Source:Website_Contact_Form`, `Interest:Service_Booking`, `Lead_Source:Facebook_Ad_XYZ`, `Consent:SMS_Opt_In`).
    *   **Why:** Tags are essential for segmenting contacts, triggering specific workflows, tracking lead origins, and managing communication preferences.
    *   **How-to-in-GHL:** Tags can be created directly in the **Contacts** section (when viewing or editing a contact, there's a field to add/create tags) or within the **Automation (Workflows)** builder when you add an "Add Tag" action. Your Next.js API will instruct GHL to add these pre-defined (or dynamically created, though less common for standard tags) tags when submitting form data.

3.  **Design Workflows for Post-Submission Actions:**
    *   **What:** Plan and build workflows in GHL that will trigger based on the data or tags associated with your custom form submissions.
    *   **Why:** Workflows automate crucial follow-up actions like sending confirmation emails, notifying staff, moving contacts through pipeline stages, or starting nurture sequences.
    *   **How-to-in-GHL:**
        *   Navigate to **Automation (Workflows)**.
        *   Create a new workflow.
        *   The workflow trigger will *not* typically be a "GHL Form Submitted" trigger (as that refers to forms built with GHL's native builder). Instead, for your API-integrated forms, triggers will usually be:
            *   **Contact Tag Added:** (e.g., when your API adds a tag like `Source:Website_Contact_Form`). This is a very common and effective trigger.
            *   **Contact Created:** (Though you'll likely want more specific triggers).
            *   **Custom Field Value Changed:** (e.g., if your API updates a specific custom field like `cf_booking_status` to "Pending Deposit").
            *   **Opportunity Status Changed:** (If your API call also creates or updates an opportunity in a pipeline).
    *   Your Next.js API calls (which send the form data) will provide the data and apply the tags that subsequently initiate these GHL workflows.

4.  **Understanding GHL's Native Forms (For Context, Not Direct Use Here):**
    *   GHL has its own built-in Form Builder found under **Sites > Forms**. Here, you can create forms visually, drag-and-drop standard and custom fields, and style them.
    *   **These GHL-native forms are separate from your custom `.tsx` website forms.** For your primary website integration, you are using the API method, meaning your `.tsx` forms are the source of truth for UI and initial data capture.
    *   You generally *do not* need to recreate your `.tsx` forms within GHL's builder for the API integration to work.
    *   The custom fields you create (as per Step 1 above) are available to *both* GHL-native forms (if you choose to build any for other purposes) *and* your API integrations. This ensures consistency in data storage.

In summary, for your API-integrated custom forms, the "GHL setup" focuses on preparing the data structures (Custom Fields), segmentation tools (Tags), and automated processes (Workflows) to effectively receive, manage, and act upon the information submitted from your website. The visual layout and field logic of the form itself are handled by your Next.js codebase.

### E. Detailed Form-by-Form GHL Setup Recommendations

This section provides specific recommendations for the GHL Custom Fields and Tags to associate with each of your website forms. Remember to create these Custom Fields in GHL (Settings > Custom Fields) *before* your development team finalizes the API integration for each form. The "GHL Field Type" is a suggestion for how to set up the custom field in GHL.

**Standard Fields for (Almost) All Forms:**
*   **First Name:** (GHL Standard Field: `contact.first_name`)
*   **Last Name:** (GHL Standard Field: `contact.last_name`)
*   **Email:** (GHL Standard Field: `contact.email`)
*   **Phone:** (GHL Standard Field: `contact.phone`)
*   **Lead Source Detail:** Custom Field `cf_lead_source_detail` (GHL Field Type: Text) - To store UTM parameters or specific referral platform info.
*   **Terms Accepted:** Custom Field `cf_terms_accepted` (GHL Field Type: Checkbox or Radio Select with "Yes" option) - *If applicable to the form.*
*   **SMS Consent:** Custom Field `cf_sms_consent` (GHL Field Type: Checkbox or Radio Select with "Yes" option) - *If applicable for SMS communication.*

---

**1. General Contact Form (`components/contact-form.tsx`)**
*   **Purpose:** Generic inquiries.
*   **Mapped GHL Fields (in addition to Standard Fields):**
    *   `cf_contact_inquiry_subject`: (GHL Field Type: Text or Dropdown Select with predefined subjects if applicable)
    *   `cf_contact_message_details`: (GHL Field Type: Text - Large/Textarea)
    *   `cf_preferred_call_time`: (GHL Field Type: Dropdown Select - Options: Morning, Afternoon, Evening, Anytime, Specific Time) - *This seems to be part of your contact form based on `contactFormSchema`.*
    *   `cf_call_request_reason`: (GHL Field Type: Text) - *Also from `contactFormSchema`.*
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Contact_Form`
    *   `Lead_Status:New_Inquiry`
    *   (If SMS consent given and `cf_sms_consent` is "Yes"): `Consent:SMS_Opt_In`

---

**2. Service Booking & Calendar (`components/service-booking-form.tsx`)**
*   **Purpose:** Service booking with calendar integration.
*   **Mapped GHL Fields (in addition to Standard Fields):**
    *   `cf_booking_service_type`: (GHL Field Type: Dropdown Select - Populate with your service types)
    *   `cf_booking_number_of_signers`: (GHL Field Type: Number or Dropdown Select)
    *   `cf_booking_appointment_datetime`: (GHL Field Type: Date & Time Picker, or Text if storing as string)
    *   `cf_booking_service_address_street`: (GHL Field Type: Text)
    *   `cf_booking_service_address_city`: (GHL Field Type: Text)
    *   `cf_booking_service_address_state`: (GHL Field Type: Text or Dropdown Select)
    *   `cf_booking_service_address_zip`: (GHL Field Type: Text)
    *   `cf_booking_additional_notes`: (GHL Field Type: Text - Large/Textarea)
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Service_Booking`
    *   `Lead_Status:Booking_Pending_Confirmation` (or `Lead_Status:Booking_Deposit_Pending` if applicable)
    *   `Interest:SERVICE_TYPE_TAG` (e.g., `Interest:Notary_Services`, `Interest:Apostille_Services` - can be set dynamically based on `cf_booking_service_type`)
    *   (If SMS consent given and `cf_sms_consent` is "Yes"): `Consent:SMS_Opt_In`

---

**3. Request a Call Form (`components/request-call-form.tsx`)**
*   **Purpose:** Capture callback requests.
*   **Mapped GHL Fields (in addition to Standard Fields, Email might be optional here as per memory):**
    *   `cf_preferred_call_time`: (GHL Field Type: Dropdown Select - Options: Morning, Afternoon, Evening, Anytime, Specific Time)
    *   `cf_call_request_reason`: (GHL Field Type: Text - Large/Textarea)
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Request_Call`
    *   `Lead_Status:Callback_Requested`
    *   (If SMS consent given and `cf_sms_consent` is "Yes"): `Consent:SMS_Opt_In`

---

**4. Newsletter Signup Form (`components/newsletter-signup-form.tsx`)**
*   **Purpose:** Collect newsletter subscribers.
*   **Mapped GHL Fields (First Name optional, Email primary):**
    *   Email: (GHL Standard Field)
    *   First Name: (GHL Standard Field, optional)
    *   `cf_consent_newsletter`: (GHL Field Type: Checkbox - "Yes, I consent") - *This should be explicitly captured.*
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Newsletter_Signup`
    *   `Interest:Newsletter`
    *   `Consent:Newsletter_Opt_In` (if `cf_consent_newsletter` is "Yes")

---

**5. Feedback/Testimonial Form (`components/feedback-form.tsx`)**
*   **Purpose:** Collect reviews after service.
*   **Mapped GHL Fields (in addition to Standard Fields):**
    *   `cf_feedback_service_received`: (GHL Field Type: Dropdown Select - Populate with your service types, optional)
    *   `cf_feedback_service_date`: (GHL Field Type: Date Picker, optional)
    *   `cf_feedback_rating`: (GHL Field Type: Number - 1-5, or Dropdown Select)
    *   `cf_feedback_comments`: (GHL Field Type: Text - Large/Textarea)
    *   `cf_consent_display_testimonial`: (GHL Field Type: Checkbox or Radio Select - "Yes, you can use my feedback")
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Feedback_Form`
    *   `Feedback_Received`
    *   `Rating_SCORE` (e.g., `Rating_5_Star` - can be set by workflow based on `cf_feedback_rating`)
    *   (If consent to display is "Yes"): `Consent:Display_Testimonial`

---

**6. Support Ticket Form (`components/support-ticket-form.tsx`)**
*   **Purpose:** Allow users to request support.
*   **Mapped GHL Fields (in addition to Standard Fields):**
    *   `cf_support_issue_category`: (GHL Field Type: Dropdown Select - e.g., Billing, Technical, Service Issue)
    *   `cf_support_issue_description`: (GHL Field Type: Text - Large/Textarea)
    *   `cf_support_client_urgency`: (GHL Field Type: Dropdown Select - e.g., Low, Medium, High, Urgent)
    *   `cf_support_file_attachment_link`: (GHL Field Type: Text - URL to S3 link if applicable) - *Or use GHL's File Upload custom field type if a direct upload to GHL is preferred, though API might handle this differently by uploading to S3 and passing the link.*
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Support_Ticket`
    *   `Support_Ticket_Status:Open`
    *   `Urgency:URGENCY_LEVEL` (e.g. `Urgency:High` - set by workflow)

---

**7. Document Upload Form (`components/document-upload-form.tsx`)**
*   **Purpose:** Securely collect documents.
*   **Mapped GHL Fields (in addition to Standard Fields):**
    *   `cf_document_type_uploaded`: (GHL Field Type: Dropdown Select - e.g., ID, Signed Contract, Supporting Evidence)
    *   `cf_document_s3_link`: (GHL Field Type: Text - URL to the uploaded file in S3)
    *   `cf_document_upload_date`: (GHL Field Type: Date Picker - auto-filled)
    *   `cf_document_related_service_id`: (GHL Field Type: Text - If linking to a specific booking/service ID, optional)
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Document_Upload`
    *   `Document_Uploaded`
    *   `DocType:DOCUMENT_TYPE` (e.g., `DocType:ID_Uploaded` - set by workflow)

---

**8. Event Registration Form (`components/event-registration-form.tsx`)**
*   **Purpose:** Register for events/webinars.
*   **Mapped GHL Fields (in addition to Standard Fields):**
    *   `cf_event_registered_for_name`: (GHL Field Type: Text or Dropdown Select if you have a list of current events)
    *   `cf_event_attendees_count`: (GHL Field Type: Number)
    *   `cf_event_dietary_restrictions`: (GHL Field Type: Text - Large/Textarea, optional)
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Event_Registration`
    *   `Event_Registered:EVENT_NAME` (e.g. `Event_Registered:Notary_Workshop_May2025` - set by workflow or API)
    *   `Status:Event_Attendee`

---

**9. Payment Form (`components/payment-form.tsx`)**
*   **Purpose:** Accept payments/invoices online (This is more complex and usually involves a payment gateway integration like Stripe, with GHL storing payment status rather than processing payment directly).
*   **Mapped GHL Fields (in addition to Standard Fields):**
    *   `cf_payment_invoice_number`: (GHL Field Type: Text)
    *   `cf_payment_service_description`: (GHL Field Type: Text)
    *   `cf_payment_amount_paid`: (GHL Field Type: Number - Currency)
    *   `cf_payment_date`: (GHL Field Type: Date Picker)
    *   `cf_payment_status`: (GHL Field Type: Dropdown Select - e.g., Paid, Pending, Failed)
    *   `cf_payment_transaction_id`: (GHL Field Type: Text - From payment gateway)
*   **Recommended GHL Tags on Submission (or upon payment confirmation from gateway):**
    *   `Source:Website_Payment_Form` (or `Source:Payment_Gateway_Confirmation`)
    *   `Payment_Status:PAID` (or `Payment_Status:PENDING` - set by workflow based on `cf_payment_status`)
    *   `Invoice_Paid:INVOICE_NUMBER`

---

**10. Affiliate Partner Signup Form (`components/affiliate-signup-form.tsx`)**
*   **Purpose:** Apply to become an affiliate partner.
*   **Mapped GHL Fields (in addition to Standard Fields, some may be optional):**
    *   `cf_affiliate_business_name`: (GHL Field Type: Text, optional)
    *   `cf_affiliate_website_url`: (GHL Field Type: Text - URL, optional)
    *   `cf_affiliate_promotion_plan`: (GHL Field Type: Text - Large/Textarea - "How do you plan to promote us?")
    *   `cf_affiliate_payout_preference_notes`: (GHL Field Type: Text - Large/Textarea, optional - for PayPal email, bank details notes etc. Handle sensitive data carefully)
    *   `cf_affiliate_terms_accepted`: (GHL Field Type: Checkbox - "Yes, I accept the affiliate terms")
*   **Recommended GHL Tags on Submission:**
    *   `Source:Website_Affiliate_Signup`
    *   `Affiliate_Status:Applied`
    *   (If SMS consent given and `cf_sms_consent` is "Yes"): `Consent:SMS_Opt_In`

---

**11. Partner Referral Submission Form (`components/partner-referral-form.tsx`)**
*   **Purpose:** Active partners submit new leads.
*   **Information for the NEW LEAD being referred:**
    *   First Name (of referred person)
    *   Last Name (of referred person)
    *   Email (of referred person)
    *   Phone (of referred person, optional)
    *   `cf_partner_referral_services_of_interest`: (GHL Field Type: Text or Checkbox Group for referred person, optional)
    *   `cf_partner_referral_notes`: (GHL Field Type: Text - Large/Textarea, notes from partner about this lead)
*   **Information about the PARTNER submitting the referral:**
    *   `cf_referred_by_partner_id`: (GHL Custom Field on the NEW LEAD's contact record. GHL Field Type: Text - This field will store the GHL Contact ID or a unique identifier of the referring partner. Your API will need to look up the partner and populate this).
*   **Recommended GHL Tags on the NEW LEAD's Submission:**
    *   `Source:Partner_Referral`
    *   `Lead_Status:New_Referral`
    *   `Referred_By_Partner:PARTNER_NAME_OR_ID_TAG` (e.g., `Referred_By_Partner:JohnDoeAffiliates` - dynamically set)
    *   `Is_Partner_Referral` (This could be a tag, or a boolean custom field `cf_is_partner_referral` set to "Yes")

This detailed list should serve as a strong foundation for setting up your GHL Custom Fields and for your development team when they configure the API payloads. Remember to adjust GHL Field Types (e.g., Text vs. Dropdown) based on your specific data needs and reporting requirements.

---

## 2. GHL Custom Fields for Forms

Custom fields are essential for capturing all specific information Houston Mobile Notary Pros needs beyond the standard GHL contact fields (like First Name, Last Name, Email, Phone). A well-organized custom field structure ensures data integrity, facilitates targeted marketing, and enables detailed reporting.

- **To Create/Edit:** In GHL, navigate to **Settings > Custom Fields**. Click **+ Add Field** to create a new custom field.
- **Naming Convention Recommendation:** For clarity and to avoid conflicts with future GHL standard fields, use a prefix like `cf_` followed by a descriptive name (e.g., `cf_service_address`).
- **Group/Folder Organization:** Grouping custom fields into folders within GHL (e.g., "Booking Details," "Compliance Records") is highly recommended for easier management.

### **A. Comprehensive Custom Field Master List**

This list details the GHL custom fields to be **created new** in your GoHighLevel account. For a clean and accurate setup aligned with your codebase and automation, create each field exactly as specified below. Pay close attention to:
- **GHL Custom Field Name:** This will be the unique key for the field (e.g., `cf_contact_inquiry_subject`). Use this exact name.
- **GHL Field Type:** Select the precise field type in GHL as indicated.
- **GHL Group/Folder:** Create these folders in your GHL custom field settings (for Contact objects) and assign each new field to its respective folder.
- **Dropdown Options:** For 'Dropdown (Single)' fields, define the suggested options within GHL when creating the field.
- **Checkbox Fields:** GHL 'Checkbox' type fields represent a single true/false state. 
  - You do not define 'Yes' and 'No' as separate choices like radio buttons. 
  - If GHL prompts for an **'Option Name'** when creating a checkbox field, this refers to the **label text that will appear next to the checkbox itself** (e.g., on GHL forms or when viewing the field on a contact record). 
  - For this 'Option Name' (label), use a concise, affirmative statement derived from the 'Your Form Field / Data Point' column in the table below (e.g., for `cf_consent_terms_conditions`, the Option Name/Label could be "I accept the General Terms & Conditions").
  - A checked box implies a 'true' or 'yes' value is captured (as noted in the 'Purpose/Notes' column), and your web app should send this value to GHL.

This list is designed to capture data from your website forms (Contact, Booking, Lead/Newsletter, Feedback, Support, Referral, Document Upload, Event Registration, Payment) and support your operational processes.

| Your Form Field / Data Point             | GHL Custom Field Name             | GHL Field Type        | GHL Group/Folder      | Purpose/Notes                                                                    |
|------------------------------------------|-----------------------------------|----------------|-----------------------|----------------------------------------------------------------------------------|
| **General Contact & Lead Information**   |                                   |                |                       |                                                                                  |
| Subject (Contact Form)                   | `cf_contact_inquiry_subject`      | Single Line Text      | Contact - Inquiry     | Subject line from general contact form submissions.                              |
| Message/Details (Contact Form)           | `cf_contact_inquiry_message`      | Multi-Line Text     | Contact - Inquiry     | Detailed message from general contact form.                                      |
| Preferred Call Time                      | `cf_preferred_call_time`          | Single Line Text      | Contact - Preferences | Client's stated preferred time for a callback.                                   |
| Call Request Reason/Notes                | `cf_call_request_notes`           | Multi-Line Text     | Contact - Preferences | Specific reason or notes provided when requesting a call.                        |
| Service of Interest (Lead/General)       | `cf_service_interest_general`     | Dropdown (Single)   | Lead Details          | Initial service interest indicated on a lead form or general inquiry. **Suggested Options:** "Essential Notary Services", "Loan Signing - Purchase", "Loan Signing - Refinance", "Loan Signing - Seller", "Loan Signing - HELOC", "Apostille Services", "I-9 Verification", "Other/Unsure". |
| How Did You Hear About Us?               | `cf_referral_source_description`  | Multi-Line Text     | Marketing             | Open text field for clients to describe their referral source.                   |
| **Booking & Appointment Specifics**      |                                   |                |                       |                                                                                  |
| Service Type (Selected for Booking)      | `cf_booking_service_type`         | Dropdown (Single)   | Booking - Details     | Specific service booked. **Suggested Options:** "Essential Notary Services", "Loan Signing - Purchase", "Loan Signing - Refinance", "Loan Signing - Seller", "Loan Signing - HELOC", "Apostille Services", "I-9 Verification", "Other". (Ensure this list aligns with your actual service offerings). |
| Appointment Date & Time                  | `cf_booking_appointment_datetime` | Date & Time Picker  | Booking - Details     | Confirmed date and time for the service.                                         |
| Number of Signers                        | `cf_booking_number_of_signers`    | Number (Integer)    | Booking - Details     | Number of individuals whose signatures will be notarized.                        |
| Full Address for Mobile Service          | `cf_booking_service_address`      | Multi-Line Text     | Booking - Details     | Complete street address, city, state, ZIP for mobile notary appointments.        |
| Specific Location Details (Gate Code, etc.)| `cf_booking_location_details`     | Single Line Text    | Booking - Details     | E.g., Gate code, suite number, specific instructions for finding the location.   |
| Special Instructions for Notary          | `cf_booking_special_instructions` | Multi-Line Text     | Booking - Details     | Any other specific requests or information for the assigned notary.            |
| **Feedback & Testimonial Form**        |                                   |                |                       |                                                                                  |
| Overall Service Rating (e.g., 1-5 Stars) | `cf_feedback_service_rating`      | Number (Integer)    | Feedback & Reviews    | Numerical rating provided by the client (e.g., 1, 2, 3, 4, 5).                   |
| Testimonial/Comments                     | `cf_feedback_testimonial_text`    | Multi-Line Text     | Feedback & Reviews    | Client's detailed feedback or testimonial statement.                             |
| Consent to Display Testimonial           | `cf_feedback_consent_display`     | Checkbox       | Compliance - Consent  | Client explicitly agrees (checkbox = Yes/True) that their testimonial can be used publicly. |
| **Support Ticket Information**           |                                   |                |                       |                                                                                  |
| Support Issue Category                   | `cf_support_issue_category`       | Dropdown (Single)   | Support Tickets       | Type of issue. **Suggested Options:** "Booking/Scheduling Issue", "Payment/Billing Question", "Technical Problem (Website/Portal)", "Service Question/Clarification", "Feedback/Complaint", "Document Upload Issue", "Other". |
| Detailed Description of Issue            | `cf_support_issue_description`    | Multi-Line Text     | Support Tickets       | Full description of the problem or query from the client.                        |
| Urgency Level (Client Indicated)         | `cf_support_client_urgency`       | Dropdown (Single)   | Support Tickets       | How urgent the client perceives the issue. **Suggested Options:** "Low - General Inquiry", "Medium - Needs Attention Soon", "High - Urgent/Service Impacted". |
| File Upload for Support (Optional)       | `cf_support_attached_file`        | File Upload    | Support Tickets       | Document/screenshot uploaded by client to illustrate the issue.                  |
| **Client Referral Program**              |                                   |                |                       |                                                                                  |
| Referrer's Full Name                     | `cf_referrer_full_name`           | Single Line Text    | Referrals             | Full name of the person who made the referral.                                   |
| Referrer's Email or Phone                | `cf_referrer_contact_info`        | Single Line Text    | Referrals             | Contact details of the referrer for acknowledgment or reward (can be Email or Phone). |
| Referred Person's Full Name              | `cf_referred_person_full_name`    | Single Line Text    | Referrals             | Full name of the individual being referred.                                      |
| Referred Person's Email or Phone         | `cf_referred_person_contact_info` | Single Line Text    | Referrals             | Contact details of the person who was referred (can be Email or Phone).          |
| Notes/Context for Referral               | `cf_referral_additional_notes`    | Multi-Line Text     | Referrals             | Any additional information or context provided with the referral.                |
| Referrer Confirmed Consent from Referred | `cf_referrer_consent_from_referred`| Checkbox       | Compliance - Consent  | Referrer confirms (checkbox = Yes/True) they have permission to share referred person's details. |
| **Secure Document Upload**               |                                   |                |                       |                                                                                  |
| Type of Document Being Uploaded          | `cf_docupload_document_type`      | Dropdown (Single)   | Documents - Uploads   | Description of the document. **Suggested Options:** "Valid Photo ID (Driver's License)", "Valid Photo ID (Passport)", "Signed Contract/Agreement", "Loan Document Package", "Business Document (e.g., Articles of Inc)", "Personal Legal Document (e.g., Will, POA)", "Other". |
| Uploaded Document File                   | `cf_docupload_file_secure`        | File Upload    | Documents - Uploads   | The actual file uploaded by the client.                                          |
| Consent for Document Handling            | `cf_docupload_handling_consent`   | Checkbox       | Compliance - Consent  | Client acknowledges (checkbox = Yes/True) terms for uploading and HMNP handling the document. |
| **Event & Webinar Registrations**        |                                   |                |                       |                                                                                  |
| Registered Event Name/ID                 | `cf_event_registered_name_id`     | Single Line Text    | Events                | Identifier for the specific event or webinar.                                    |
| Number of Attendees                      | `cf_event_attendee_count`         | Number (Integer)    | Events                | How many individuals are covered by this registration.                           |
| Dietary Restrictions/Special Needs       | `cf_event_special_needs`          | Multi-Line Text     | Events                | Any dietary or accessibility needs for event attendees.                          |
| Consent for Event Communications         | `cf_event_communications_consent` | Checkbox       | Compliance - Consent  | Consent (checkbox = Yes/True) to receive emails specifically about the registered event. |
| **Payment & Billing Information**        |                                   |                |                       |                                                                                  |
| Invoice Number Being Paid                | `cf_payment_invoice_number`       | Single Line Text    | Billing - Payments    | Specific invoice number this payment applies to.                                 |
| Service Description for Payment          | `cf_payment_service_description`  | Single Line Text    | Billing - Payments    | Brief description of the service the payment is for.                             |
| Payment Amount                           | `cf_payment_amount_paid`          | Monetary          | Billing - Payments    | The monetary amount paid.                                                        |
| Billing Address (Street, City, State, Zip, Country) | Multiple (See Notes) | Single Line Text (for each component) | Billing - Payments    | **Create 5 separate 'Single Line Text' fields for the billing address components, all in the 'Billing - Payments' group:** <br> 1. **Street Address:** Field Name: `Billing Street`, Key: `cf_billing_address_street` <br> 2. **City:** Field Name: `Billing City`, Key: `cf_billing_address_city` <br> 3. **State/Province:** Field Name: `Billing State/Province`, Key: `cf_billing_address_state` <br> 4. **ZIP/Postal Code:** Field Name: `Billing ZIP Code`, Key: `cf_billing_address_zip` <br> 5. **Country:** Field Name: `Billing Country`, Key: `cf_billing_address_country` <br> Assign placeholder text as appropriate for each (e.g., 'Street address and P.O. box' for Street). |
| Consent to Payment & Refund Policy       | `cf_payment_terms_agree_policy`   | Checkbox       | Compliance - Consent  | Client confirms (checkbox = Yes/True) they have read and agreed to payment/refund policies. |
| **Marketing & Compliance (General)**     |                                   |                |                       |                                                                                  |
| General Terms & Conditions Accepted      | `cf_consent_terms_conditions`     | Checkbox       | Compliance - Consent  | General website/service T&Cs acceptance (checkbox = Yes/True).                   |
| SMS Communications Opt-In                | `cf_consent_sms_communications`   | Checkbox       | Compliance - Consent  | Explicit opt-in (checkbox = Yes/True) for SMS messages. Differentiate Marketing vs. Transactional use via tags/workflows. |
| Email Marketing Opt-In                   | `cf_consent_email_marketing`      | Checkbox       | Compliance - Consent  | Explicit opt-in (checkbox = Yes/True) for receiving marketing emails.            |
| UTM Source                               | `cf_utm_source`                   | Single Line Text    | Marketing - Tracking  | Marketing campaign source (e.g., google, facebook, newsletter).                  |
| UTM Medium                               | `cf_utm_medium`                   | Single Line Text    | Marketing - Tracking  | Marketing campaign medium (e.g., cpc, email, social_post).                       |
| UTM Campaign                             | `cf_utm_campaign`                 | Single Line Text    | Marketing - Tracking  | Specific marketing campaign name.                                                |
| UTM Term                                 | `cf_utm_term`                     | Single Line Text    | Marketing - Tracking  | Keywords used for paid search campaigns.                                         |
| UTM Content                              | `cf_utm_content`                  | Single Line Text    | Marketing - Tracking  | Ad content variation or specific link that drove the lead.                       |

*Standard GHL Fields:* Remember that GHL has built-in standard fields for First Name, Last Name, Email, Phone, Company Name, Address (a standard address block), Date of Birth, Website, etc. Utilize these first and only create custom fields for information not covered by standard GHL capabilities.

> **Best Practices for Custom Fields Implementation:**
> - **Thorough Planning:** Before creating fields in GHL, ensure this list comprehensively covers all data points from all your forms and required for your processes.
> - **Use GHL's Standard Fields First:** Don't duplicate standard GHL fields (e.g., 'Email') with a custom one unless absolutely necessary for a specific reason.
> - **Dropdown Options:** For all `Dropdown` type fields, define the list of options within GHL meticulously. This ensures data consistency for reporting and segmentation (e.g., for `cf_booking_service_type`, list all your distinct services).
> - **Required vs. Optional:** Mark fields as 'Required' in GHL if they are essential for a process to proceed or for basic data integrity.
> - **Placeholder Text (Optional but Recommended for GHL Forms/Manual Entry):** For `Single Line Text` and `Multi-Line Text` fields, consider setting informative placeholder text within GHL's custom field settings (e.g., for `cf_booking_service_address`, a placeholder like "Enter full service address including street, city, state, and ZIP"). While your website forms will have their own placeholders, defining them in GHL is beneficial if these fields are ever used on GHL-native forms or if your team manually enters data directly into contact records.
> - **Default/Prefill Values:** Generally, you do **not** need to set default or prefill values in GHL for custom fields that will be populated by your website forms, as the web app will send the specific data entered by the user. If a field needs a default value upon contact creation or form submission (e.g., setting an initial status), this is usually better and more flexibly managed through GHL Workflows.
> - **File Upload Fields:** For 'File Upload' type fields, note that GHL primarily acts as storage. Restrictions on file types (e.g., PDF, JPG), maximum file size, and the number of files allowed per submission instance should be managed and validated by your web application *before* the file is sent to GHL. Your web app is the first line of defense for ensuring appropriate files are uploaded.
> - **Regular Audits:** Periodically review your custom fields. Identify and archive (or carefully delete if no longer holding critical data) any fields that become obsolete due to process changes or form updates. This keeps your GHL environment organized and efficient.

---

## 3. GHL Tags for Forms

Tags in GoHighLevel are versatile labels that you can apply to contacts to segment, organize, trigger automations, and track interactions. A well-thought-out tagging strategy is crucial for maximizing GHL's capabilities.

- **To Create/Manage Tags:** In GHL, tags can often be created directly when applying them to a contact or within specific automation actions. You can also manage your master list of tags by navigating to **Settings > Tags**.
- **Naming Convention Recommendation:** Use a consistent naming convention to keep tags organized and understandable. A good practice is `Category:Specific_Descriptor` (e.g., `Source:Website_Contact_Form`, `Status:Deposit_Paid`, `Interest:Loan_Signing_Purchase`). Using underscores for spaces can improve readability in some GHL views.

### **A. Comprehensive Tag Master List**

This list provides a foundational set of tags. You will likely expand this list as your marketing and operational processes evolve. Tags should be applied automatically via workflows whenever possible, or manually when specific ad-hoc segmentation is needed.

**Important Note on Creating Tags in GoHighLevel:**

The "GHL Tag Name Suggestion" column below provides the exact string you should use when creating a tag in GoHighLevel. 

- **For tags with placeholders** (e.g., `[CampaignName]`, `[Platform]`, `[EventName]`, enclosed in square brackets `[]`): You will **not** create a tag with the literal square brackets and placeholder text. Instead, you will create **specific instances** of these tags by replacing the placeholder with the actual, relevant value. For example:
    - For `Source:Paid_Ads_[Platform]_[Campaign]`, you might create actual tags like `Source:Paid_Ads_Google_SummerPromo` or `Source:Paid_Ads_Facebook_LeadGenQ3`.
    - For `Interest:Event_[EventName]`, an actual tag could be `Interest:Event_FirstTimeHomebuyerWebinar`.
    - For `Consent:Contract_Signed_[ContractType]`, an actual tag could be `Consent:Contract_Signed_ServiceAgreement`.
- This placeholder approach allows for dynamic and precise tagging based on specific campaigns, events, or other variables. The "Purpose & Typical Application" column often provides examples or further clarifies what the placeholder represents.

| Tag Category                  | GHL Tag Name Suggestion                      | Purpose & Typical Application                                                                 |
|-------------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------|
| **1. Source/Acquisition**     |                                              | Tracking where leads and clients originate.                                                   |
|                               | `Source:Website_Contact_Form`                | Applied when a contact submits the general contact form.                                      |
|                               | `Source:Website_Booking_Form`                | Applied when a contact submits the booking/appointment form.                                  |
|                               | `Source:Website_Request_Call_Form`           | Applied when a contact submits the request a call form.                                       |
|                               | `Source:Website_Newsletter_Signup`           | Applied when a contact signs up for the newsletter via website form.                          |
|                               | `Source:Website_Feedback_Form`               | Applied when a contact submits the feedback form.                                             |
|                               | `Source:Website_Support_Ticket_Form`         | Applied when a contact submits a support ticket form.                                         |
|                               | `Source:Website_Referral_Form`               | Applied when a contact is submitted via the referral form.                                    |
|                               | `Source:Website_Doc_Upload_Form`             | Applied when a contact uses the document upload form.                                         |
|                               | `Source:Website_Event_Reg_Form`              | Applied when a contact registers for an event/webinar.                                        |
|                               | `Source:Website_Payment_Form`                | Applied when a contact makes a payment or initiates payment via the payment form.             |
|                               | `Source:GMB_Listing`                         | Lead originated from Google My Business profile.                                              |
|                               | `Source:Facebook_Lead`                       | Lead from Facebook (organic post, ad, or direct message).                                     |
|                               | `Source:Organic_Search`                      | Lead found HMNP via non-paid search engine results.                                           |
|                               | `Source:Paid_Ads_[Platform]_[Campaign]`      | E.g., `Source:Paid_Ads_Google_NotaryServices`, `Source:Paid_Ads_Meta_LoanSigningQ3`.          |
|                               | `Source:Referral_[ReferrerName/Program]`     | Applied when a referral is confirmed. Can also tag referrer with `ClientAttribute:Referrer`.  |
|                               | `Source:Direct_Inquiry_Phone`                | Contact made initial inquiry via phone call.                                                  |
|                               | `Source:Direct_Inquiry_Email`                | Contact made initial inquiry via direct email (not website form).                             |
|                               | `Source:Manual_Entry`                        | For contacts added manually by staff.                                                         |
|                               | `Source:Import_[Date/Campaign]`              | For contacts imported in bulk (e.g., `Source:Import_202408_Networking_Event`).                |
| **2. Lifecycle/Status**       |                                              | Tracking where a contact is in your engagement and sales funnel.                              |
|                               | `Status:New_Lead`                            | A new, uncontacted, or unqualified inquiry.                                                     |
|                               | `Status:Contact_Attempted`                   | Initial contact has been made or attempted.                                                   |
|                               | `Status:Follow_Up_Needed`                    | Actively needs a follow-up action.                                                            |
|                               | `Status:Needs_Assessment_Done`               | Qualification or needs assessment call/meeting completed.                                       |
|                               | `Status:Proposal_Sent`                       | A quote or proposal has been delivered.                                                       |
|                               | `Status:Awaiting_Deposit`                    | Service agreed, waiting for deposit payment.                                                  |
|                               | `Status:Deposit_Paid`                        | Deposit confirmed, booking secured.                                                           |
|                               | `Status:Service_Scheduled`                   | Service/appointment is officially on the calendar.                                            |
|                               | `Status:Service_In_Progress`                 | For longer services, indicates currently active.                                              |
|                               | `Status:Service_Completed`                   | The booked service has been successfully delivered.                                           |
|                               | `Status:Service_Cancelled_Client`            | Client cancelled the scheduled service.                                                         |
|                               | `Status:Service_Cancelled_HMNP`              | HMNP had to cancel/reschedule service.                                                        |
|                               | `Status:Payment_Complete`                    | Full payment for services rendered has been received.                                         |
|                               | `Status:Payment_Pending_Webhook`             | Payment initiated, waiting for confirmation from gateway.                                     |
|                               | `Status:Payment_Failed`                      | Payment attempt was unsuccessful.                                                             |
|                               | `Status:Active_Client`                       | Currently receiving ongoing services or in an active project.                                 |
|                               | `Status:Past_Client`                         | Completed all services and no current active engagement.                                      |
|                               | `Status:Lost_Lead`                           | Lead decided not to proceed.                                                                  |
|                               | `Status:Unresponsive`                        | Multiple contact attempts made with no response.                                              |
|                               | `Status:Support_Ticket_Open`                 | Client has an active, unresolved support ticket.                                              |
|                               | `Status:Support_Ticket_Resolved`             | Client's support issue has been addressed.                                                    |
|                               | `Status:Feedback_Request_Sent`               | A request for feedback has been sent post-service.                                            |
|                               | `Status:Newsletter_Subscriber_Active`        | Actively subscribed to and receiving the newsletter.                                          |
| **3. Service/Product Interest** |                                              | Segmenting contacts by specific services they've inquired about or purchased.                 |
|                               | `Interest:Essential_Notary`                  | General notary services.                                                                      |
|                               | `Interest:Loan_Signing_Purchase`             | Loan signings for property purchases.                                                         |
|                               | `Interest:Loan_Signing_Refinance`            | Loan signings for refinancing.                                                                |
|                               | `Interest:Loan_Signing_HELOC`                | Loan signings for Home Equity Lines of Credit.                                                |
|                               | `Interest:Remote_Online_Notarization`        | RON services.                                                                                 |
|                               | `Interest:Apostille_Services`                | Apostille and document authentication services.                                               |
|                               | `Interest:Mobile_Fingerprinting`             | (Add specific primary services as per your offerings)                                         |
|                               | `Interest:Specialty_Service_[Name]`          | E.g., `Interest:Specialty_Service_I9_Verification`.                                           |
|                               | `Interest:Event_[EventName]`                 | For registrants of specific events, e.g., `Interest:Event_FirstTimeHomebuyerWebinar`.         |
|                               | `Interest:Newsletter_Only`                   | Primarily interested in newsletter content, not immediate services.                           |
| **4. Engagement/Behavior**    |                                              | Tracking how contacts interact with your communications and content.                          |
|                               | `Engaged:Email_Opened_[CampaignName]`        | Opened a specific marketing or automated email.                                               |
|                               | `Engaged:Email_Clicked_[CampaignName]`       | Clicked a link in a specific email.                                                           |
|                               | `Engaged:SMS_Replied`                        | Replied to an SMS message.                                                                    |
|                               | `Engaged:Attended_Event_[EventName]`         | Marked as attended for a specific event.                                                      |
|                               | `Engaged:Missed_Event_[EventName]`           | Registered but did not attend.                                                                |
|                               | `Engaged:No_Show_Appointment`                | Contact did not show up for a scheduled appointment.                                          |
|                               | `Engaged:Submitted_Feedback`                 | Contact submitted a feedback form.                                                            |
|                               | `Engaged:Offer_Claimed_[OfferName]`          | Claimed a specific promotional offer.                                                         |
| **5. Automation/Workflow Control** |                                          | Tags used to manage workflow progression or exclusion.                                        |
|                               | `Workflow:In_New_Lead_Nurture`               | Actively in the new lead follow-up sequence.                                                  |
|                               | `Workflow:In_Booking_Reminder_Sequence`      | Receiving appointment reminders.                                                              |
|                               | `Workflow:In_Feedback_Request_Sequence`      | Part of the post-service feedback collection flow.                                            |
|                               | `Workflow:In_Payment_Followup_Sequence`      | Actively in a sequence for following up on unpaid deposits/invoices.                          |
|                               | `Workflow:STOP_ALL_MARKETING`                | A hard stop for all promotional communications (use with caution).                            |
|                               | `Workflow:STOP_Specific_Sequence_[Name]`     | Exclude from a particular workflow, e.g., `Workflow:STOP_Specific_Sequence_NurtureQ3`.        |
| **6. Compliance/Consent**     |                                              | Tracking consents and preferences.                                                            |
|                               | `Consent:SMS_Opt_In`                         | Explicitly opted-in for SMS communication.                                                    |
|                               | `Consent:Email_Marketing_Opt_In`             | Explicitly opted-in for marketing emails.                                                     |
|                               | `Consent:Terms_Agreed_General`               | Agreed to general terms and conditions.                                                       |
|                               | `Consent:Testimonial_Display_Approved`       | Consented to their testimonial being used publicly.                                           |
|                               | `Consent:Payment_Policy_Agreed`              | Agreed to payment and refund policy.                                                          |
|                               | `Consent:Contract_Signed_[ContractType]`     | E.g., `Consent:Contract_Signed_ServiceAgreement`.                                             |
|                               | `Compliance:Records_Archived_PerPolicy`      | Indicates records are archived according to retention policy.                                 |
| **7. Client Type/Attributes** |                                              | Describing the nature or specific attributes of a client.                                     |
|                               | `ClientType:Corporate`                       | Client is a business entity.                                                                  |
|                               | `ClientType:Individual`                      | Client is an individual person.                                                               |
|                               | `ClientAttribute:Repeat_Customer`            | Has used HMNP services multiple times.                                                        |
|                               | `ClientAttribute:VIP`                        | High-value or priority client.                                                                |
|                               | `ClientAttribute:Referrer`                   | This contact has referred new clients.                                                        |
|                               | `ClientAttribute:Service_Area_Primary`       | Typically requires service in your primary defined area.                                      |
|                               | `ClientAttribute:Service_Area_Extended`      | Typically requires service in your extended service area (may involve travel fees).           |
|                               | `ClientAttribute:Staff_At_Corporate_[ClientName]` | Identifies a contact as staff at a specific corporate client (use sparingly, can be verbose). |
| **8. Document/Verification Status** |                                        | Tracking status of important documents or verifications.                                      |
|                               | `DocStatus:EO_Insurance_Verified`            | Errors & Omissions insurance has been verified (e.g., for a partner or corporate client).   |
|                               | `DocStatus:TitleCompany_Relationship_Verified` | Relationship/verification with a title company is confirmed.                                |
|                               | `DocStatus:KYC_Docs_Received`                | Know Your Customer documents have been received.                                              |
|                               | `DocStatus:Document_Pending_Review_[DocType]`| A specific document type has been uploaded and awaits review.                               |
| **9. Service Modifiers/Preferences** |                                      | Client preferences or common service modifications (use if these define a client *segment*).  |
|                               | `ServicePreference:Weekend_Booking`          | Client typically requires or prefers weekend bookings.                                        |
|                               | `ServicePreference:After_Hours_Booking`      | Client typically requires or prefers after-hours bookings.                                    |
|                               | `ServicePreference:Emergency_Service_User`   | Client has previously used or often requests emergency/rush services.                       |
|                               | `ServicePreference:Multi_Signer_Deals`       | Client frequently has bookings with multiple signers.                                       |

> **Best Practices for Tagging:**
> - **Be Specific but Concise:** Tags should be descriptive enough to be useful but not overly long or complex.
> - **Automate Tagging:** Leverage GHL workflows to automatically add and remove tags based on triggers (e.g., form submissions, email opens, pipeline stage changes).
> - **Strategic Removal:** Just as important as adding tags is removing them when they are no longer relevant (e.g., remove `Status:Awaiting_Deposit` when `Status:Deposit_Paid` is added).
> - **Use for Segmentation:** Regularly use tags to create smart lists for targeted email campaigns, reporting, and audience analysis.
> - **Regular Audits:** Periodically review your tag list in **Settings > Tags**. Delete outdated or unused tags to keep your system clean. Merge redundant tags if necessary.
> - **Document Your Tags:** Keep this master list (or a similar internal document) updated so your team understands the purpose and application of each tag.
> - **Don't Over-Tag:** While tags are powerful, avoid applying an excessive number of slightly different tags to a single contact if a few, well-defined tags can achieve the same segmentation. Aim for clarity and utility.

---

## 4. API Integration Details for Each Form

*(This section will detail the specific Next.js API endpoints for each form, expected request payloads, and key GHL API interactions. Refer to the main GHL Setup Guide's section on "Integrate Your Website Forms" and individual API route files for specifics.)*
