# GoHighLevel (GHL) Workflow for Estate Planning Leads

This guide outlines the necessary steps to create a new automated workflow in GoHighLevel to handle leads from the "Estate Planning" landing page.

---

## 1. New Tags & Custom Fields

The `estate-planning/page.tsx` landing page sends the following data to GHL. You don't need to create these in advance, but you should use them as triggers and in your pipeline.

*   **Tags:**
    *   `AdLead:EstatePlanning`
    *   `ServiceInterest:EstatePlanning`
    *   `AdCampaign:EstatePlanningQ3`
    *   `Status:New_Ad_Lead`
*   **Custom Fields:**
    *   `cf_ad_platform`: (e.g., "GoogleAds")
    *   `cf_ad_campaign_name`: "Estate Planning Q3"

---

## 2. Update Your Sales Pipeline

It's recommended to add a new pipeline specifically for these high-value leads or add a stage to your existing one.

**Instructions:**
1.  Go to **Sites** > **Pipelines**.
2.  Select the pipeline you use for new leads (e.g., "Sales Pipeline").
3.  Click **"Edit"**.
4.  Click **"+ Add Stage"**.
5.  Name the new stage: **"New Estate Planning Lead"**.
6.  Drag this stage to the beginning of your pipeline, or wherever is most appropriate.
7.  Click **"Save"**.

---

## 3. Create the New GHL Workflow

This workflow will automatically handle incoming leads, placing them in the correct pipeline and sending a confirmation email.

**Instructions:**
1.  Go to the **Automation** tab and click **"Create Workflow"**.
2.  Select **"Start from Scratch"**.
3.  Name the workflow: **"Estate Planning Lead Intake"**.

### **Workflow Trigger:**

1.  Click **"Add New Workflow Trigger"**.
2.  Choose **"Contact Tag"**.
3.  Click **"Add Filters"** and select **"Tag is"**.
4.  Choose the tag: `ServiceInterest:EstatePlanning`. This will be the primary trigger.

### **Workflow Actions:**

1.  **Create/Update Opportunity:**
    *   Click the **"+"** icon to add an action.
    *   Select **"Create/Update Opportunity"**.
    *   **Pipeline:** Select your main sales pipeline.
    *   **Pipeline Stage:** Choose the new **"New Estate Planning Lead"** stage.
    *   **Opportunity Name:** Use contact variables, e.g., `{{contact.name}} - Estate Planning`.
    *   **Opportunity Source:** `{{contact.custom.cf_ad_platform}}`.
    *   Set a **Lead Value** (e.g., $250, the price of the package).
    *   Click **"Save Action"**.

2.  **Send Confirmation Email:**
    *   Click the **"+"** icon.
    *   Select **"Send Email"**.
    *   **From Name:** Your Business Name (e.g., Houston Mobile Notary Pros).
    *   **From Email:** Your business email.
    *   **Subject:** `Confirmation: Your Estate Planning Notary Inquiry`
    *   **Use the email template below.**
    *   Click **"Save Action"**.

3.  **Internal Notification (Optional but Recommended):**
    *   Click the **"+"** icon.
    *   Select **"Send Internal Notification"**.
    *   **Type:** `SMS` or `Email`.
    *   **To:** `All Users` or a specific user.
    *   **Message:** `New estate planning lead for {{contact.name}} from {{contact.custom.cf_ad_platform}}. Please follow up.`
    *   Click **"Save Action"**.

4.  **Remember to Publish and Save your workflow!**

---

## 4. Auto-Responder Email Template

Use this template for the "Send Email" action in your workflow.

**Subject: Confirmation: Your Estate Planning Notary Inquiry**

Hi {{contact.first_name}},

Thank you for reaching out to Houston Mobile Notary Pros about our Estate Planning Notary Package.

We've received your information and will be in touch shortly to confirm your appointment details and answer any questions you may have.

Our goal is to make this crucial step in securing your legacy as simple and stress-free as possible.

**What to Expect:**
*   A team member will call you within the next 1-2 business hours.
*   We will confirm the time, location, and documents for your appointment.
*   We will arrive punctually, ready to handle everything with professionalism and care.

Thank you for trusting us with your important documents.

Best regards,

The Team at Houston Mobile Notary Pros
[Your Website]
[Your Phone Number] 