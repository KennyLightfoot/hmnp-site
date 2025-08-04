import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';

interface ReferrerData {
  name: string;
  email?: string;
  phone?: string;
}

interface ReferralData {
  name: string;
  email?: string;
  phone?: string;
}

interface ReferralRequestBody {
  referrer: ReferrerData;
  referral: ReferralData;
  notes?: string;
  consent: boolean; // e.g., consent to referral program terms or for us to contact referral
}

// GHL Custom Fields (from GHL_SETUP_GUIDE.md Section 4.C):
// For Referrer Contact (if they exist in GHL):
// - cf_is_referrer (Checkbox - Yes/No or Text - "Yes")
// - cf_referrals_made_count (Number - increment)
// For Referred Contact (New Lead):
// - cf_lead_source (Dropdown/Text - "Referral")
// - cf_referred_by_name (Text)
// - cf_referred_by_email (Text)
// - cf_referred_by_phone (Text)
// - cf_referral_notes (Text - Multi-line)
// - cf_consent_referral_program_terms (Checkbox - Yes/No) - Could be on referrer or referral

// GHL Tags (from GHL_SETUP_GUIDE.md Section 5.B):
// For Referrer Contact:
// - "Referral Source"
// - "Client - Referrer"
// For Referred Contact (New Lead):
// - "Lead Source - Referral"
// - "Referred Lead"
// - "Referred by - [Referrer Name]"

// GHL Pipeline Updates (from GHL_SETUP_GUIDE.md Section 3):
// - Referred Contact: "Client Acquisition" pipeline, stage "New Lead - Referral" or "Initial Contact"

export async function POST(request: Request) {
  try {
    const body = await request.json() as ReferralRequestBody;
    const { referrer, referral, notes, consent } = body;

    // Basic validation
    if (!referrer.name || !referral.name || (!referral.email && !referral.phone) || !consent) {
      return NextResponse.json({ message: 'Missing required fields for referrer or referral, or consent not given.' }, { status: 400 });
    }

    console.log('Received referral submission:', body);

    // --- Placeholder GHL Integration Logic ---

    // 1. Process Referrer
    //    - Find or create contact for referrer.
    //    - Update custom fields (e.g., cf_is_referrer = 'Yes', increment cf_referrals_made_count).
    //    - Apply tags (e.g., "Referral Source").
    console.log(`GHL ACTION (Placeholder): Process Referrer: Name: ${referrer.name}, Email: ${referrer.email || 'N/A'}`);
    console.log(`GHL ACTION (Placeholder): Referrer - Update custom fields: cf_is_referrer=Yes, increment count.`);
    console.log(`GHL ACTION (Placeholder): Referrer - Apply tags: "Referral Source", "Client - Referrer".`);

    // 2. Process Referred Person (New Lead)
    //    - Create new contact for the referred person.
    //    - Populate custom fields (cf_lead_source="Referral", cf_referred_by_name, cf_referred_by_email, cf_referral_notes, cf_consent_referral_program_terms=consent).
    //    - Apply tags (e.g., "Lead Source - Referral", "Referred Lead", "Referred by - ${referrer.name}").
    //    - Add to "Client Acquisition" pipeline.
    console.log(`GHL ACTION (Placeholder): Process Referred Lead: Name: ${referral.name}, Email: ${referral.email || 'N/A'}, Phone: ${referral.phone || 'N/A'}`);
    console.log(`GHL ACTION (Placeholder): Referred Lead - Update custom fields: Lead Source=Referral, Referred By=${referrer.name}, Notes=${notes || ''}, Consent=${consent}`);
    console.log(`GHL ACTION (Placeholder): Referred Lead - Apply tags: "Lead Source - Referral", "Referred Lead", "Referred by - ${referrer.name}".`);
    console.log('GHL ACTION (Placeholder): Referred Lead - Add to "Client Acquisition" pipeline, stage "New Lead - Referral".');

    // 3. Potentially trigger GHL Workflows
    //    - Workflow for referrer (e.g., thank you email, add points if gamified).
    //    - Workflow for referred lead (e.g., welcome email series, task for sales to follow up).
    //    - Internal notification for new referral.
    console.log('GHL ACTION (Placeholder): Trigger GHL workflows for referrer and new referred lead.');

    // --- End Placeholder GHL Integration Logic ---

    return NextResponse.json({ message: 'Referral submitted successfully!', data: body }, { status: 201 });

  } catch (error) {
    console.error('Error processing referral submission:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = getErrorMessage(error);
    }
    return NextResponse.json({ message: 'Error submitting referral.', error: errorMessage }, { status: 500 });
  }
}
