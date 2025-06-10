import type { NextApiRequest, NextApiResponse } from 'next';
import {
  upsertContact,
  // addTagsToContact, // We might call this separately if upsert doesn't handle tags perfectly or if contact already exists
  GhlContact,
  GhlCustomField,
} from '@/lib/ghl'; // Adjust path based on your project structure
// You'll need a function to create opportunities in lib/ghl.ts
// import { createOpportunity } from '@/lib/ghl'; 

// IMPORTANT: Define your GHL Custom Field IDs here or load from environment variables
// This mapping is crucial for sending custom data correctly to GHL.
const GHL_CUSTOM_FIELD_IDS: Record<string, string> = {
  // Ad Tracking Fields
  cf_ad_platform: process.env.GHL_CF_ID_AD_PLATFORM || 'ID_FOR_AD_PLATFORM_FIELD',
  cf_utm_source: process.env.GHL_CF_ID_UTM_SOURCE || 'ID_FOR_UTM_SOURCE_FIELD',
  cf_utm_medium: process.env.GHL_CF_ID_UTM_MEDIUM || 'ID_FOR_UTM_MEDIUM_FIELD',
  cf_utm_campaign: process.env.GHL_CF_ID_UTM_CAMPAIGN || 'ID_FOR_UTM_CAMPAIGN_FIELD',
  cf_utm_term: process.env.GHL_CF_ID_UTM_TERM || 'ID_FOR_UTM_TERM_FIELD',
  cf_utm_content: process.env.GHL_CF_ID_UTM_CONTENT || 'ID_FOR_UTM_CONTENT_FIELD',
  cf_ad_campaign_name: process.env.GHL_CF_ID_AD_CAMPAIGN_NAME || 'ID_FOR_AD_CAMPAIGN_NAME_FIELD',
  cf_ad_campaign_id: process.env.GHL_CF_ID_AD_CAMPAIGN_ID || 'ID_FOR_AD_CAMPAIGN_ID_FIELD',
  cf_ad_group_id: process.env.GHL_CF_ID_AD_GROUP_ID || 'ID_FOR_AD_GROUP_ID_FIELD',
  cf_ad_id: process.env.GHL_CF_ID_AD_ID || 'ID_FOR_AD_ID_FIELD',
  cf_landing_page_url: process.env.GHL_CF_ID_LANDING_PAGE_URL || 'ID_FOR_LANDING_PAGE_URL_FIELD',
  
  // Standard Form Fields (if you want to map them to specific GHL CFs beyond standard fields)
  cf_preferred_call_time: process.env.GHL_CF_ID_PREFERRED_CALL_TIME || 'ID_FOR_PREFERRED_CALL_TIME',
  cf_call_request_reason: process.env.GHL_CF_ID_CALL_REQUEST_REASON || 'ID_FOR_CALL_REQUEST_REASON',
  // Add any other custom fields your form might send via the customFieldsFromProps object
};

// Placeholder for your actual function - you'll need to implement this in lib/ghl.ts
async function createOpportunity(opportunityData: Record<string, unknown>): Promise<Record<string, unknown>> {
  console.log("Placeholder: createOpportunity called with", opportunityData);
  // In a real implementation, this would call the GHL API to create an opportunity
  // Example: return await callGhlApi('/opportunities/', 'POST', opportunityData);
  if (!process.env.GHL_AD_LEADS_PIPELINE_ID || !process.env.GHL_NEW_AD_LEAD_STAGE_ID) {
    console.warn('Skipping opportunity creation: Pipeline/Stage IDs not configured in .env');
    return { id: 'mock_opportunity_id_skipped_env_config' };
  }
  return { id: 'mock_opportunity_id_created' }; 
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { 
      firstName,
      lastName,
      email,
      phone,
      // message, // Assigned but not used - consider if needed for GHL or logging
      preferredCallTime,
      callRequestReason,
      // termsAccepted, // Assigned but not used - consider if needed for GHL or logging
      // smsConsent, // Assigned but not used - consider if needed for GHL or logging
      tags, // Array of strings
      customFieldsFromProps, // Record<string, string>
      utmData, // Record<string, string>
      landingPageUrl,
      campaignName 
    } = req.body;

    // 1. Prepare Custom Fields for GHL
    const ghlCustomFields: GhlCustomField[] = [];

    // Process UTM data
    if (utmData) {
      if (utmData.utm_source && GHL_CUSTOM_FIELD_IDS.cf_utm_source) ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_utm_source, value: utmData.utm_source });
      if (utmData.utm_medium && GHL_CUSTOM_FIELD_IDS.cf_utm_medium) ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_utm_medium, value: utmData.utm_medium });
      if (utmData.utm_campaign && GHL_CUSTOM_FIELD_IDS.cf_utm_campaign) ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_utm_campaign, value: utmData.utm_campaign });
      if (utmData.utm_term && GHL_CUSTOM_FIELD_IDS.cf_utm_term) ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_utm_term, value: utmData.utm_term });
      if (utmData.utm_content && GHL_CUSTOM_FIELD_IDS.cf_utm_content) ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_utm_content, value: utmData.utm_content });
    }

    // Process customFieldsFromProps (these are ad-specific like ad_platform, ad_campaign_id, etc.)
    if (customFieldsFromProps) {
      for (const key in customFieldsFromProps) {
        if (GHL_CUSTOM_FIELD_IDS[key]) {
          ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS[key], value: customFieldsFromProps[key] });
        } else {
          console.warn(`No GHL Custom Field ID mapping found for prop: ${key}`);
        }
      }
    }
    
    // Add other fixed custom fields like landingPageUrl or campaignName if they have GHL CF IDs
    if (landingPageUrl && GHL_CUSTOM_FIELD_IDS.cf_landing_page_url) {
      ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_landing_page_url, value: landingPageUrl });
    }
    if (campaignName && GHL_CUSTOM_FIELD_IDS.cf_ad_campaign_name) {
      ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_ad_campaign_name, value: campaignName });
    }
    if (preferredCallTime && GHL_CUSTOM_FIELD_IDS.cf_preferred_call_time) {
      ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_preferred_call_time, value: preferredCallTime });
    }
    if (callRequestReason && GHL_CUSTOM_FIELD_IDS.cf_call_request_reason) {
      ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS.cf_call_request_reason, value: callRequestReason });
    }
    

    // 2. Prepare Contact Data for GHL
    const contactData: GhlContact = {
      firstName,
      lastName,
      email,
      phone,
      source: utmData?.utm_source || customFieldsFromProps?.cf_ad_platform || campaignName || 'Website Ad Lead',
      tags: Array.isArray(tags) ? tags : [], 
      customFields: ghlCustomFields,
      // Standard GHL fields can be added directly too if needed
      // e.g., dnd: smsConsent === false, (GHL often has specific dnd settings per channel)
    };
    
    // Add consent information if captured and mapped to a GHL standard/custom field
    // For example, if you have a custom field for sms_consent:
    // if (GHL_CUSTOM_FIELD_IDS.cf_sms_consent) {
    //   contactData.customFields?.push({ id: GHL_CUSTOM_FIELD_IDS.cf_sms_consent, value: smsConsent ? 'true' : 'false' });
    // }

    // 3. Upsert Contact in GHL
    const ghlContactResponse = await upsertContact(contactData);
    const contactId = ghlContactResponse?.id || ghlContactResponse?.contact?.id;

    if (!contactId) {
      console.error('Failed to get contact ID from GHL upsert response:', ghlContactResponse);
      throw new Error('Failed to create or update contact in GHL.');
    }

    // (Optional but Recommended) 4. Create Opportunity in GHL
    // Ensure GHL_AD_LEADS_PIPELINE_ID and GHL_NEW_AD_LEAD_STAGE_ID are in your .env
    const adLeadsPipelineId = process.env.GHL_AD_LEADS_PIPELINE_ID;
    const newAdLeadStageId = process.env.GHL_NEW_AD_LEAD_STAGE_ID;

    if (adLeadsPipelineId && newAdLeadStageId) {
      const opportunityData = {
        name: `${firstName || 'Lead'} ${lastName || ''} - ${campaignName || customFieldsFromProps?.cf_ad_platform || 'Ad Campaign'}`.trim(),
        pipelineId: adLeadsPipelineId,
        stageId: newAdLeadStageId,
        status: 'open',
        contactId: contactId,
        // monetaryValue: 0, // Optional: If you have a value for new leads
        // assignedTo: 'USER_ID_FOR_LEAD_ASSIGNMENT', // Optional
        // source: campaignName || utmData?.utm_source, // Optional, source is also on contact
      };
      try {
        await createOpportunity(opportunityData); // Implement this function in lib/ghl.ts
        console.log(`Opportunity created for contact ${contactId} in pipeline ${adLeadsPipelineId}`);
      } catch (oppError) {
        console.error(`Failed to create opportunity for contact ${contactId}:`, oppError);
        // Don't fail the whole request if opportunity creation fails, but log it.
      }
    } else {
      console.warn('Skipping opportunity creation: Pipeline ID or Stage ID for ad leads is not configured in environment variables.');
    }

    res.status(200).json({ 
      success: true, 
      message: 'Lead processed successfully.', 
      ghlContactId: contactId 
    });

  } catch (error) {
    console.error('Error processing ad lead submission:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, message });
  }
} 