import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Input validation & minimal sanitization
// ---------------------------------------------------------------------------

const FeedbackRequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  rating: z.number().int().min(1).max(5),
  comments: z.string().min(1).max(10_000),
  consentToDisplay: z.boolean()
});

// Simple, no-dependency HTML escape to mitigate injection. For richer text we’ll
// introduce a full DOMPurify pass later.
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// GHL Custom Fields (from GHL_SETUP_GUIDE.md Section 4.C):
// - cf_feedback_rating (Number)
// - cf_feedback_comments (Text - Multi-line)
// - cf_consent_display_testimonial (Checkbox - Yes/No)

// GHL Tags (from GHL_SETUP_GUIDE.md Section 5.B):
// - Status: "Feedback Received"
// - Testimonial: "Testimonial Candidate - Approved" (if consentToDisplay is true)
// - Testimonial: "Testimonial Candidate - Pending Review" (if consentToDisplay is true, manual review needed)

// GHL Pipeline Updates (from GHL_SETUP_GUIDE.md Section 3):
// - Could move contact to a specific stage in "Client Support" or a dedicated "Marketing - Testimonials" pipeline.

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = FeedbackRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Sanitize free-text field
    const {
      name,
      email,
      rating,
      consentToDisplay
    } = parsed.data;

    const comments = escapeHtml(parsed.data.comments.trim());

    const body = { name, email, rating, comments, consentToDisplay } as const;

    console.log('Received feedback submission:', body);

    // --- Placeholder GHL Integration Logic ---
    // In a real scenario, you would make an API call to GoHighLevel here.

    // 1. Find or Create Contact in GHL
    //    - Use email if provided, or attempt to match by name (less reliable).
    //    - If new, create contact with name and email.
    console.log(`GHL ACTION (Placeholder): Find or create contact: Name: ${name}, Email: ${email || 'N/A'}`);

    // 2. Update Custom Fields
    //    const ghlCustomFieldsPayload = [
    //      { id: 'GHL_CUSTOM_FIELD_ID_FOR_RATING', value: rating },
    //      { id: 'GHL_CUSTOM_FIELD_ID_FOR_COMMENTS', value: comments },
    //      { id: 'GHL_CUSTOM_FIELD_ID_FOR_CONSENT', value: consentToDisplay ? 'Yes' : 'No' },
    //    ];
    console.log(`GHL ACTION (Placeholder): Update custom fields: Rating=${rating}, Comments=${comments.substring(0,50)}..., Consent=${consentToDisplay}`);

    // 3. Apply Tags
    //    const tagsToAdd = ['Feedback Received'];
    //    if (consentToDisplay) {
    //      tagsToAdd.push('Testimonial Candidate - Approved'); // Or 'Testimonial Candidate - Pending Review'
    //    }
    //    console.log('GHL ACTION (Placeholder): Apply tags:', tagsToAdd);
    console.log(`GHL ACTION (Placeholder): Apply tags: "Feedback Received"${consentToDisplay ? ', "Testimonial Candidate - Approved"' : ''}`);


    // 4. Add to Pipeline/Update Stage (Optional)
    //    - Example: Add to 'Testimonial Collection' pipeline, 'New Feedback' stage.
    console.log('GHL ACTION (Placeholder): Add to pipeline/update stage if applicable.');

    // 5. Potentially trigger a GHL Workflow
    //    - E.g., internal notification for new feedback, thank you email (if email provided).
    console.log('GHL ACTION (Placeholder): Trigger GHL workflow for new feedback.');

    // --- End Placeholder GHL Integration Logic ---

    return NextResponse.json({ message: 'Feedback submitted successfully!', data: body }, { status: 201 });

  } catch (error) {
    console.error('Error processing feedback submission:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = getErrorMessage(error);
    }
    return NextResponse.json({ message: 'Error submitting feedback.', error: errorMessage }, { status: 500 });
  }
}
