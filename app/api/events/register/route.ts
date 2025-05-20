import { NextResponse } from 'next/server';

interface EventRegistrationRequestBody {
  name: string;
  email: string;
  phone?: string;
  eventSelection: string; // Name or ID of the event
  dietaryRestrictions?: string;
  consent: boolean; // e.g., to event terms and communication
  numberOfAttendees?: number; // Optional, defaults to 1 if not provided
}

// GHL Custom Fields (from GHL_SETUP_GUIDE.md Section 4.C):
// - cf_event_registered_for_name (Text)
// - cf_event_attendees_count (Number)
// - cf_event_dietary_restrictions (Text - Multi-line)
// - cf_consent_event_communication (Checkbox - Yes/No)

// GHL Tags (from GHL_SETUP_GUIDE.md Section 5.B):
// - Category: "Event Registration"
// - Event Specific: "Event - [Event Selection Value]" (e.g., "Event - Notary Workshop Q3")
// - Status: "Registered - [Event Selection Value]"

// GHL Pipeline Updates (from GHL_SETUP_GUIDE.md Section 3):
// - "Event Registrations" pipeline, stage "Registered" or "New Registration"

export async function POST(request: Request) {
  try {
    const body = await request.json() as EventRegistrationRequestBody;
    const {
      name,
      email,
      phone,
      eventSelection,
      dietaryRestrictions,
      consent,
      numberOfAttendees = 1 // Default to 1 attendee if not specified
    } = body;

    // Basic validation
    if (!name || !email || !eventSelection || !consent) {
      return NextResponse.json({ message: 'Missing required fields or consent not given.' }, { status: 400 });
    }

    console.log('Received event registration submission:', body);

    // --- Placeholder GHL Integration Logic ---
    console.log(`GHL ACTION (Placeholder): Find or create contact: Name: ${name}, Email: ${email}, Phone: ${phone || 'N/A'}`);

    // const ghlCustomFieldsPayload = [
    //   { id: 'GHL_CUSTOM_FIELD_ID_FOR_EVENT_NAME', value: eventSelection },
    //   { id: 'GHL_CUSTOM_FIELD_ID_FOR_ATTENDEES', value: numberOfAttendees },
    //   { id: 'GHL_CUSTOM_FIELD_ID_FOR_DIETARY', value: dietaryRestrictions || '' },
    //   { id: 'GHL_CUSTOM_FIELD_ID_FOR_EVENT_CONSENT', value: consent ? 'Yes' : 'No' },
    // ];
    console.log(`GHL ACTION (Placeholder): Update custom fields: Event=${eventSelection}, Attendees=${numberOfAttendees}, Dietary=${dietaryRestrictions || 'N/A'}, Consent=${consent}`);

    // const tagsToAdd = [
    //   'Event Registration',
    //   `Event - ${eventSelection}`,
    //   `Registered - ${eventSelection}`,
    // ];
    console.log(`GHL ACTION (Placeholder): Apply tags: "Event Registration", "Event - ${eventSelection}", "Registered - ${eventSelection}"`);

    console.log(`GHL ACTION (Placeholder): Add to "Event Registrations" pipeline, stage "Registered".`);

    console.log('GHL ACTION (Placeholder): Trigger GHL workflow (e.g., confirmation email with event details, add to GHL calendar).');
    // --- End Placeholder GHL Integration Logic ---

    return NextResponse.json({ message: 'Event registration successful!', data: body }, { status: 201 });

  } catch (error) {
    console.error('Error processing event registration:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error submitting event registration.', error: errorMessage }, { status: 500 });
  }
}
