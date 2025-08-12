import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import * as ghl from '@/lib/ghl';
import type { GhlContact } from '@/lib/ghl';
import { withRateLimit } from '@/lib/security/rate-limiting';

interface CreditReferrerRequestBody {
  contactId: string; // Contact ID of the NEWLY REFERRED client
}

// Environment variable for a simple webhook security check (optional, but recommended)
const WEBHOOK_SECRET = process.env.GHL_CREDIT_REFERRER_WEBHOOK_SECRET;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withRateLimit('public', 'ghl_credit_referrer')(async (request: Request) => {
  // Optional: Basic security check if a secret is configured
  if (WEBHOOK_SECRET) {
    const providedSecret = request.headers.get('x-webhook-secret');
    if (providedSecret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized: Invalid webhook secret' }, { status: 401 });
    }
  }

  try {
    const body = await request.json() as CreditReferrerRequestBody;
    const newlyReferredClientContactId = body.contactId;

    if (!newlyReferredClientContactId) {
      return NextResponse.json({ error: 'Contact ID of the referred client is required' }, { status: 400 });
    }

    // 1. Fetch all GHL custom fields to map keys to IDs
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    if (!ghlLocationId) {
      return NextResponse.json({ error: 'GHL_LOCATION_ID environment variable is not configured' }, { status: 500 });
    }
    const ghlLocationCustomFields = await ghl.getLocationCustomFields(ghlLocationId);
    const ghlCustomFieldMap = new Map<string, string>();
    ghlLocationCustomFields.forEach(field => {
      if (field.key && field.id) {
        ghlCustomFieldMap.set(field.key, field.id as string);
      }
    });

    const referredByFieldKey = 'cf_referred_by_name_or_email'; // As per WORKFLOW_AUTOMATION_ROADMAP.md
    const referralCreditsEarnedFieldKey = 'cf_referral_credits_earned'; // As per WORKFLOW_AUTOMATION_ROADMAP.md

    const referredByFieldId = ghlCustomFieldMap.get(referredByFieldKey);
    const referralCreditsEarnedFieldId = ghlCustomFieldMap.get(referralCreditsEarnedFieldKey);

    if (!referredByFieldId) {
      console.error(`GHL Custom Field ID for key '${referredByFieldKey}' not found.`);
      return NextResponse.json({ error: `Configuration error: Custom field '${referredByFieldKey}' not found in GHL.` }, { status: 500 });
    }
    // Note: referralCreditsEarnedFieldId non-existence is handled later to allow tagging even if credit field isn't set up

    // 2. Fetch the newly referred client's details
    const newlyReferredClient = await ghl.getContactById(newlyReferredClientContactId);
    if (!newlyReferredClient) {
      return NextResponse.json({ error: `Referred client with ID ${newlyReferredClientContactId} not found in GHL.` }, { status: 404 });
    }

    // 3. Extract the referrer's email/name from the referred client's custom field
    let referrerIdentifier: string | undefined = "";
    // Ensure newlyReferredClient.customFields is an array before trying to find
    const customFieldsArray = newlyReferredClient.customFields || newlyReferredClient.custom_fields;
    if (Array.isArray(customFieldsArray)) {
      const referredByCustomField = customFieldsArray.find((cf: any) => cf.id === referredByFieldId || cf.key === referredByFieldKey);
      if (referredByCustomField && referredByCustomField.value && typeof referredByCustomField.value === 'string') {
        referrerIdentifier = referredByCustomField.value.trim();
      }
    }

    if (!referrerIdentifier) {
      return NextResponse.json({ message: `Referred client ${newlyReferredClientContactId} does not have referrer information in '${referredByFieldKey}'. No action taken.` }, { status: 200 });
    }

    // 4. Find the referrer contact in GHL (primarily by email)
    const referrerContact = await ghl.getContactByEmail(referrerIdentifier);
    if (!referrerContact || !referrerContact.id) {
      return NextResponse.json({ message: `Referrer contact with email/identifier '${referrerIdentifier}' not found. No credit applied.` }, { status: 200 });
    }

    // 5. Credit the referrer by applying a tag
    const tagsToApplyToReferrer = ['Referral:Credit_Due_To_Referrer'];
    await ghl.addTagsToContact(referrerContact.id, tagsToApplyToReferrer);
    console.log(`Tag '${tagsToApplyToReferrer.join(', ')}' applied to referrer ${referrerContact.id} (${referrerIdentifier}).`);

    // 6. Update 'cf_referral_credits_earned' custom field for the referrer
    if (referralCreditsEarnedFieldId) {
      let currentCredits = 0;
      const referrerCustomFieldsArray = referrerContact.customFields || referrerContact.custom_fields;
      if (Array.isArray(referrerCustomFieldsArray)) {
        const creditsField = referrerCustomFieldsArray.find((cf: any) => cf.id === referralCreditsEarnedFieldId || cf.key === referralCreditsEarnedFieldKey);
        if (creditsField && creditsField.value) {
          if (typeof creditsField.value === 'number') {
            currentCredits = creditsField.value;
          } else if (typeof creditsField.value === 'string' && !isNaN(parseInt(creditsField.value))) {
            currentCredits = parseInt(creditsField.value);
          }
        }
      }
      const newCredits = currentCredits + 1;
      
      const referrerUpdatePayload: Partial<GhlContact> = {
        email: referrerContact.email, // Important for upsert to identify the contact
        customFields: [{ id: referralCreditsEarnedFieldId, value: newCredits }]
      };
      await ghl.upsertContact(referrerUpdatePayload as GhlContact);
      console.log(`Custom field '${referralCreditsEarnedFieldKey}' updated to ${newCredits} for referrer ${referrerContact.id}.`);
    } else {
        console.warn(`Custom field key '${referralCreditsEarnedFieldKey}' not found or its ID not mapped. Skipping credit count update for referrer ${referrerContact.id}.`);
    }

    // For the response, try to fetch the latest credit count to confirm
    let finalCreditsValue: string | number = 'N/A (field not configured or fetch failed)';
    if (referralCreditsEarnedFieldId) {
        try {
            const updatedReferrerContact = await ghl.getContactById(referrerContact.id);
            if (updatedReferrerContact) {
                const updatedReferrerCustomFields = updatedReferrerContact.customFields || updatedReferrerContact.custom_fields;
                if (Array.isArray(updatedReferrerCustomFields)) {
                    const finalCreditsField = updatedReferrerCustomFields.find((cf: any) => cf.id === referralCreditsEarnedFieldId || cf.key === referralCreditsEarnedFieldKey);
                    if (finalCreditsField && finalCreditsField.value !== undefined) {
                        finalCreditsValue = finalCreditsField.value;
                    }
                }
            }
        } catch (fetchError) {
            console.warn(`Could not fetch updated referrer contact to confirm credit value: ${fetchError}`);
        }
    }

    return NextResponse.json({ 
      message: 'Referral credit processed successfully.', 
      referrerContactId: referrerContact.id, 
      newCreditsApplied: finalCreditsValue
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing referral credit:', error);
    let errorMessage = 'Failed to process referral credit.';
    if (getErrorMessage(error)) {
        errorMessage += ` ${getErrorMessage(error)}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
});
