import { NextRequest, NextResponse } from 'next/server';
import {
  upsertContact,
  GhlContact,
  GhlCustomField,
} from '@/lib/ghl';

// IMPORTANT: Define your GHL Custom Field IDs here or load from environment variables
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
  cf_preferred_call_time: process.env.GHL_CF_ID_PREFERRED_CALL_TIME || 'ID_FOR_PREFERRED_CALL_TIME',
  cf_call_request_reason: process.env.GHL_CF_ID_CALL_REQUEST_REASON || 'ID_FOR_CALL_REQUEST_REASON',
};

// Placeholder for opportunity creation
async function createOpportunity(opportunityData: Record<string, unknown>): Promise<Record<string, unknown>> {
  console.log("Placeholder: createOpportunity called with", opportunityData);
  if (!process.env.GHL_AD_LEADS_PIPELINE_ID || !process.env.GHL_NEW_AD_LEAD_STAGE_ID) {
    console.warn('Skipping opportunity creation: Pipeline/Stage IDs not configured in .env');
    return { id: 'mock_opportunity_id_skipped_env_config' };
  }
  return { id: 'mock_opportunity_id_created' }; 
}

export async function POST(request: NextRequest) {
  try {
    const { 
      firstName,
      lastName,
      email,
      phone,
      preferredCallTime,
      callRequestReason,
      tags,
      customFieldsFromProps,
      utmData,
      landingPageUrl,
      campaignName 
    } = await request.json();

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

    // Process customFieldsFromProps
    if (customFieldsFromProps) {
      for (const key in customFieldsFromProps) {
        if (GHL_CUSTOM_FIELD_IDS[key]) {
          ghlCustomFields.push({ id: GHL_CUSTOM_FIELD_IDS[key], value: customFieldsFromProps[key] });
        } else {
          console.warn(`No GHL Custom Field ID mapping found for prop: ${key}`);
        }
      }
    }
    
    // Add other fixed custom fields
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
    };

    // 3. Upsert Contact in GHL
    const ghlContactResponse = await upsertContact(contactData);
    const contactId = ghlContactResponse?.id || ghlContactResponse?.contact?.id;

    if (!contactId) {
      console.error('Failed to get contact ID from GHL upsert response:', ghlContactResponse);
      throw new Error('Failed to create or update contact in GHL.');
    }

    // 4. Create Opportunity in GHL (optional)
    const adLeadsPipelineId = process.env.GHL_AD_LEADS_PIPELINE_ID;
    const newAdLeadStageId = process.env.GHL_NEW_AD_LEAD_STAGE_ID;

    if (adLeadsPipelineId && newAdLeadStageId) {
      const opportunityData = {
        name: `${firstName || 'Lead'} ${lastName || ''} - ${campaignName || customFieldsFromProps?.cf_ad_platform || 'Ad Campaign'}`.trim(),
        pipelineId: adLeadsPipelineId,
        stageId: newAdLeadStageId,
        status: 'open',
        contactId: contactId,
      };
      try {
        await createOpportunity(opportunityData);
        console.log(`Opportunity created for contact ${contactId} in pipeline ${adLeadsPipelineId}`);
      } catch (oppError) {
        console.error(`Failed to create opportunity for contact ${contactId}:`, oppError);
      }
    } else {
      console.warn('Skipping opportunity creation: Pipeline ID or Stage ID for ad leads is not configured in environment variables.');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Lead processed successfully.', 
      ghlContactId: contactId 
    });

  } catch (error) {
    console.error('Error processing ad lead submission:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
} 