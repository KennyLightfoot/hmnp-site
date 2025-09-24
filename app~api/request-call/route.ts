import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from '@/lib/utils/error-utils';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL;
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_CALL_REQUEST_WORKFLOW_ID = process.env.GHL_CALL_REQUEST_WORKFLOW_ID; // Should be set in .env

// Replace these with your actual GHL custom field keys/IDs
const CUSTOM_FIELD_PREFERRED_CALL_TIME = "preferred_call_time";
const CUSTOM_FIELD_CALL_REQUEST_REASON = "call_request_reason";
const CUSTOM_FIELD_TERMS_ACCEPTED = "terms_and_conditions_accepted";

async function createOrUpdateContact({ name, email, phone, preferredCallTime, callRequestReason, termsAccepted }: any) {
  const customFields = [
    { fieldKey: CUSTOM_FIELD_PREFERRED_CALL_TIME, value: preferredCallTime },
    { fieldKey: CUSTOM_FIELD_CALL_REQUEST_REASON, value: callRequestReason },
    { fieldKey: CUSTOM_FIELD_TERMS_ACCEPTED, value: termsAccepted ? "Yes" : "No" },
  ];
  const payload = {
    locationId: GHL_LOCATION_ID,
    firstName: name,
    email,
    phone,
    customField: customFields,
  };
  const response = await fetch(`${GHL_API_BASE_URL}/contacts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create/update contact");
  }
  return data.contact?.id || data.id;
}

async function triggerWorkflow(contactId: string) {
  if (!GHL_CALL_REQUEST_WORKFLOW_ID) return;
  const response = await fetch(`${GHL_API_BASE_URL}/workflows/${GHL_CALL_REQUEST_WORKFLOW_ID}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GHL_API_KEY}`,
    },
    body: JSON.stringify({ contactId }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to trigger workflow");
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  preferredCallTime: z.string().min(1),
  callRequestReason: z.string().min(1),
  termsAccepted: z.boolean().optional(),
});

export const POST = withRateLimit('public', 'request_call')(async (req: NextRequest) => {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
    }
    const { name, email, phone, preferredCallTime, callRequestReason, termsAccepted } = parsed.data;
    // Create or update contact in GHL
    const contactId = await createOrUpdateContact({ name, email, phone, preferredCallTime, callRequestReason, termsAccepted });
    // Trigger workflow (optional)
    await triggerWorkflow(contactId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: getErrorMessage(error) || "Internal Server Error" }, { status: 500 });
  }
});
