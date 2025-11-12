import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { upsertContact, GhlContact, GhlCustomField } from '@/lib/ghl';
import { createOpportunity as createGhlOpportunity } from '@/lib/ghl/opportunities';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

// GHL Custom Field IDs - validate environment variables
const GHL_CUSTOM_FIELDS = {
  cf_ad_platform: process.env.GHL_CF_ID_AD_PLATFORM,
  cf_utm_source: process.env.GHL_CF_ID_UTM_SOURCE,
  cf_utm_medium: process.env.GHL_CF_ID_UTM_MEDIUM,
  cf_utm_campaign: process.env.GHL_CF_ID_UTM_CAMPAIGN,
  cf_utm_term: process.env.GHL_CF_ID_UTM_TERM,
  cf_utm_content: process.env.GHL_CF_ID_UTM_CONTENT,
  cf_ad_campaign_name: process.env.GHL_CF_ID_AD_CAMPAIGN_NAME,
  cf_ad_campaign_id: process.env.GHL_CF_ID_AD_CAMPAIGN_ID,
  cf_ad_group_id: process.env.GHL_CF_ID_AD_GROUP_ID,
  cf_ad_id: process.env.GHL_CF_ID_AD_ID,
  cf_landing_page_url: process.env.GHL_CF_ID_LANDING_PAGE_URL,
  cf_preferred_call_time: process.env.GHL_CF_ID_PREFERRED_CALL_TIME,
  cf_call_request_reason: process.env.GHL_CF_ID_CALL_REQUEST_REASON,
};

// Validate critical GHL fields are configured
const missingFields = Object.entries(GHL_CUSTOM_FIELDS)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingFields.length > 0) {
  console.warn(`⚠️ Missing GHL custom field IDs: ${missingFields.join(', ')}`);
  console.warn('Ad tracking may be incomplete without these environment variables');
}

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY;

async function verifyCaptcha(provider: 'turnstile' | 'hcaptcha', token: string, remoteIp?: string): Promise<boolean> {
  try {
    if (provider === 'turnstile' && TURNSTILE_SECRET) {
      const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: remoteIp || '' })
      });
      const data = await resp.json();
      return !!data.success;
    }
    if (provider === 'hcaptcha' && HCAPTCHA_SECRET) {
      const resp = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: HCAPTCHA_SECRET, response: token, remoteip: remoteIp || '' })
      });
      const data = await resp.json();
      return !!data.success;
    }
    // If no provider configured, treat as passed
    return true;
  } catch {
    return false;
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const leadSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  preferredCallTime: z.string().optional(),
  callRequestReason: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFieldsFromProps: z.record(z.any()).optional(),
  utmData: z.record(z.string()).optional(),
  landingPageUrl: z.string().url().optional(),
  campaignName: z.string().optional(),
  captchaProvider: z.enum(['turnstile','hcaptcha']).optional(),
  captchaToken: z.string().optional(),
});

export const POST = withRateLimit('public', 'submit_ad_lead')(async (request: NextRequest) => {
  try {
    const json = await request.json();
    const parsed = leadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
    }
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
      campaignName,
      captchaProvider,
      captchaToken,
    } = parsed.data;

    // 0. Optional CAPTCHA verification if configured
    if (captchaProvider && captchaToken) {
      const remoteIp = request.headers.get('x-forwarded-for') || undefined;
      const ok = await verifyCaptcha(captchaProvider, captchaToken, remoteIp);
      if (!ok) {
        return NextResponse.json({ success: false, message: 'Captcha verification failed' }, { status: 400 });
      }
    }

    // 1. Prepare Custom Fields for GHL
    const ghlCustomFields: GhlCustomField[] = [];

    // Process UTM data
    if (utmData) {
      if (utmData.utm_source && GHL_CUSTOM_FIELDS.cf_utm_source) ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_utm_source, value: utmData.utm_source });
      if (utmData.utm_medium && GHL_CUSTOM_FIELDS.cf_utm_medium) ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_utm_medium, value: utmData.utm_medium });
      if (utmData.utm_campaign && GHL_CUSTOM_FIELDS.cf_utm_campaign) ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_utm_campaign, value: utmData.utm_campaign });
      if (utmData.utm_term && GHL_CUSTOM_FIELDS.cf_utm_term) ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_utm_term, value: utmData.utm_term });
      if (utmData.utm_content && GHL_CUSTOM_FIELDS.cf_utm_content) ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_utm_content, value: utmData.utm_content });
    }

    // Process customFieldsFromProps
    if (customFieldsFromProps) {
      for (const key in customFieldsFromProps) {
        if (GHL_CUSTOM_FIELDS[key as keyof typeof GHL_CUSTOM_FIELDS]) {
          ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS[key as keyof typeof GHL_CUSTOM_FIELDS], value: customFieldsFromProps[key] });
        } else {
          console.warn(`No GHL Custom Field ID mapping found for prop: ${key}`);
        }
      }
    }
    
    // Add other fixed custom fields
    if (landingPageUrl && GHL_CUSTOM_FIELDS.cf_landing_page_url) {
      ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_landing_page_url, value: landingPageUrl });
    }
    if (campaignName && GHL_CUSTOM_FIELDS.cf_ad_campaign_name) {
      ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_ad_campaign_name, value: campaignName });
    }
    if (preferredCallTime && GHL_CUSTOM_FIELDS.cf_preferred_call_time) {
      ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_preferred_call_time, value: preferredCallTime });
    }
    if (callRequestReason && GHL_CUSTOM_FIELDS.cf_call_request_reason) {
      ghlCustomFields.push({ id: GHL_CUSTOM_FIELDS.cf_call_request_reason, value: callRequestReason });
    }

    // 2. Prepare Contact Data for GHL
    const contactData: GhlContact = {
      firstName,
      lastName,
      email,
      phone,
      locationId: process.env.GHL_LOCATION_ID, // Required for upsertContact
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
      const serviceInterestTag = Array.isArray(tags)
        ? tags.find(tag => tag.startsWith('ServiceInterest:'))
        : undefined;
      const normalizedServiceInterest = serviceInterestTag
        ? serviceInterestTag.split(':')[1]?.trim().toLowerCase()
        : undefined;

      let estimatedValue = 75;
      if (customFieldsFromProps?.estimated_value) {
        const parsed = Number(customFieldsFromProps.estimated_value);
        if (!Number.isNaN(parsed)) {
          estimatedValue = parsed;
        }
      } else if (normalizedServiceInterest === 'ron') {
        estimatedValue = 45;
      } else if (
        normalizedServiceInterest === 'loan signing' ||
        normalizedServiceInterest === 'loan_signing' ||
        normalizedServiceInterest === 'loansigning'
      ) {
        estimatedValue = 150;
      } else if (
        normalizedServiceInterest === 'mobile-notary' ||
        normalizedServiceInterest === 'mobilenotary'
      ) {
        estimatedValue = 95;
      }

      const opportunityData = {
        name: `${firstName || 'Lead'} ${lastName || ''} - ${campaignName || customFieldsFromProps?.cf_ad_platform || 'Ad Campaign'}`.trim(),
        pipelineId: adLeadsPipelineId,
        pipelineStageId: newAdLeadStageId,
        status: 'open',
        source: customFieldsFromProps?.cf_ad_platform || campaignName || 'Ad Campaign',
        monetaryValue: estimatedValue,
      };
      try {
        await createGhlOpportunity(contactId, opportunityData);
        console.log(`Opportunity created for contact ${contactId} in pipeline ${adLeadsPipelineId}`);
      } catch (oppError) {
        console.error(`Failed to create opportunity for contact ${contactId}:`, oppError);
      }
    } else {
      console.warn('Skipping opportunity creation: Pipeline ID or Stage ID for ad leads is not configured in environment variables.');
    }

    // 5. Send notification email (optional but recommended)
    try {
      const receiver = process.env.CONTACT_FORM_RECEIVER_EMAIL?.trim();
      const sender = process.env.CONTACT_FORM_SENDER_EMAIL?.trim();
      const apiKey = process.env.RESEND_API_KEY?.trim();

      if (receiver && sender && apiKey) {
        const resend = new Resend(apiKey);
        const leadName = `${firstName || ''} ${lastName || ''}`.trim() || 'New Lead';
        const subject = `New Quote Lead: ${leadName}${campaignName ? ` • ${campaignName}` : ''}`;
        const html = `
          <h1>New Quote Request</h1>
          <p><strong>Name:</strong> ${leadName}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          ${preferredCallTime ? `<p><strong>Preferred Call Time:</strong> ${preferredCallTime}</p>` : ''}
          ${callRequestReason ? `<p><strong>Reason:</strong> ${callRequestReason}</p>` : ''}
          ${campaignName ? `<p><strong>Campaign:</strong> ${campaignName}</p>` : ''}
          ${landingPageUrl ? `<p><strong>Landing Page:</strong> ${landingPageUrl}</p>` : ''}
        `;
        await resend.emails.send({ from: `Lead Alerts <${sender}>`, to: [receiver], subject, html });
      } else {
        console.warn('Email notification skipped for ad lead: missing env (receiver/sender/api key)');
      }
    } catch (notifyError) {
      console.error('Failed to send ad lead notification email:', notifyError);
    }

    return NextResponse.json({
      success: true,
      message: 'Lead processed successfully.',
      ghlContactId: contactId
    });

  } catch (error) {
    console.error('Error processing ad lead submission:', error);
    const message = error instanceof Error ? getErrorMessage(error) : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
});