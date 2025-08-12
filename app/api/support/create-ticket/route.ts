import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { z } from 'zod';

interface SupportTicketRequestBody {
  name: string;
  email: string;
  phone?: string;
  issueCategory: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  fileUpload?: any; // Placeholder for file handling logic
}

// GHL Custom Fields (from GHL_SETUP_GUIDE.md Section 4.C):
// - cf_support_issue_category (Dropdown/Text)
// - cf_support_issue_description (Text - Multi-line)
// - cf_support_client_urgency (Dropdown/Text)
// - cf_support_file_attachment_link (Text - URL) - Assuming file is uploaded to S3/other storage and link is saved

// GHL Tags (from GHL_SETUP_GUIDE.md Section 5.B):
// - Category: "Support Ticket"
// - Status: "Support Ticket - New"
// - Type: "Support - [Issue Category Value]" (e.g., "Support - Technical Issue")
// - Urgency: "Support Ticket - Urgent: [Urgency Value]" (e.g., "Support Ticket - Urgent: High")

// GHL Pipeline Updates (from GHL_SETUP_GUIDE.md Section 3):
// - "Client Support" pipeline, stage "New Ticket" or "Open"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  issueCategory: z.string().min(1),
  description: z.string().min(1),
  urgency: z.enum(['Low','Medium','High','Critical']),
  fileUpload: z.any().optional(),
});

export const POST = withRateLimit('public', 'support_create_ticket')(async (request: Request) => {
  try {
    // Note: Handling multipart/form-data for file uploads requires different parsing
    // For now, we'll assume JSON and a placeholder for fileUpload
    // In a real app, use a library like 'formidable' or Next.js specific handlers for FormData
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const body = parsed.data as SupportTicketRequestBody;

    const { name, email, phone, issueCategory, description, urgency, fileUpload } = body;

    // Basic validation
    if (!name || !email || !issueCategory || !description || !urgency) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    console.log('Received support ticket submission:', body);

    // --- Placeholder File Upload Logic ---
    let fileAttachmentLink = '';
    if (fileUpload) {
      // In a real scenario:
      // 1. Upload the file to a secure storage (e.g., AWS S3, Google Cloud Storage)
      // 2. Get the public (or signed) URL of the uploaded file
      // fileAttachmentLink = await uploadFileToStorage(fileUpload);
      fileAttachmentLink = 'https://placeholder.s3.amazonaws.com/uploaded_file_path.pdf'; // Example placeholder
      console.log('GHL ACTION (Placeholder): File uploaded, link:', fileAttachmentLink);
    }
    // --- End Placeholder File Upload Logic ---

    // --- Placeholder GHL Integration Logic ---
    console.log(`GHL ACTION (Placeholder): Find or create contact: Name: ${name}, Email: ${email}, Phone: ${phone || 'N/A'}`);

    // const ghlCustomFieldsPayload = [
    //   { id: 'GHL_CUSTOM_FIELD_ID_FOR_ISSUE_CATEGORY', value: issueCategory },
    //   { id: 'GHL_CUSTOM_FIELD_ID_FOR_DESCRIPTION', value: description },
    //   { id: 'GHL_CUSTOM_FIELD_ID_FOR_URGENCY', value: urgency },
    // ];
    // if (fileAttachmentLink) {
    //   ghlCustomFieldsPayload.push({ id: 'GHL_CUSTOM_FIELD_ID_FOR_FILE_LINK', value: fileAttachmentLink });
    // }
    console.log(`GHL ACTION (Placeholder): Update custom fields: Category=${issueCategory}, Urgency=${urgency}, FileLink=${fileAttachmentLink || 'N/A'}`);

    // const tagsToAdd = [
    //   'Support Ticket',
    //   'Support Ticket - New',
    //   `Support - ${issueCategory}`,
    //   `Support Ticket - Urgent: ${urgency}`
    // ];
    console.log(`GHL ACTION (Placeholder): Apply tags: "Support Ticket", "Support Ticket - New", "Support - ${issueCategory}", "Support Ticket - Urgent: ${urgency}"`);

    console.log('GHL ACTION (Placeholder): Add to "Client Support" pipeline, stage "New Ticket".');

    console.log('GHL ACTION (Placeholder): Trigger GHL workflow for new support ticket (e.g., internal notification, client auto-reply).');
    // --- End Placeholder GHL Integration Logic ---

    return NextResponse.json({ message: 'Support ticket submitted successfully!', data: { ...body, fileAttachmentLinkIfProcessed: fileAttachmentLink } }, { status: 201 });

  } catch (error) {
    console.error('Error processing support ticket submission:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errorMessage = getErrorMessage(error);
    }
    return NextResponse.json({ message: 'Error submitting support ticket.', error: errorMessage }, { status: 500 });
  }
});
