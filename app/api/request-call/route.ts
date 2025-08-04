import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from '@/lib/utils/error-utils';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, preferredCallTime, callRequestReason, termsAccepted } = body;
    if (!name || !email || !phone || !preferredCallTime || !callRequestReason) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    // Create or update contact in GHL
    const contactId = await createOrUpdateContact({ name, email, phone, preferredCallTime, callRequestReason, termsAccepted });
    // Trigger workflow (optional)
    await triggerWorkflow(contactId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: getErrorMessage(error) || "Internal Server Error" }, { status: 500 });
  }
}
