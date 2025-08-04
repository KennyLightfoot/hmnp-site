import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getContactByEmail, addTagsToContact } from '@/lib/ghl';
import { createContact, searchContacts } from '@/lib/ghl/management';
import { triggerReviewThankYouPost } from '@/lib/gmb/automation-service';

/**
 * Review Monitoring Webhook for Workflow 20
 * Handles incoming review notifications from Zapier or review platforms
 * Triggers automatic review response workflows
 */

interface ReviewWebhookPayload {
  platform: 'google' | 'yelp' | 'facebook';
  rating: number;
  reviewer_name: string;
  reviewer_email?: string;
  review_text: string;
  review_id: string;
  review_url: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload
    const payload: ReviewWebhookPayload = await request.json();
    
    console.log('Review webhook received:', {
      platform: payload.platform,
      rating: payload.rating,
      reviewer: payload.reviewer_name,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!payload.platform || !payload.rating || !payload.reviewer_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to find contact by email first, then by name
    let ghlContact = null;
    
    if (payload.reviewer_email) {
      ghlContact = await getContactByEmail(payload.reviewer_email);
    }
    
    // If no contact found by email, try to find by name
    if (!ghlContact && payload.reviewer_name) {
      // Search contacts by name (this is approximate matching)
      const searchResults = await searchContacts(payload.reviewer_name);
      if (searchResults && searchResults.length > 0) {
        ghlContact = searchResults[0]; // Take first match
      }
    }

    // If no existing contact found, create a new one
    if (!ghlContact) {
      console.log('Creating new contact for reviewer:', payload.reviewer_name);
      
      const newContactData = {
        firstName: payload.reviewer_name.split(' ')[0] || payload.reviewer_name,
        lastName: payload.reviewer_name.split(' ').slice(1).join(' ') || '',
        email: payload.reviewer_email || `${payload.review_id}@reviews.placeholder`,
        source: `Review_${payload.platform}`,
        customFields: [
          {
            id: 'cf_review_platform',
            field_value: payload.platform
          },
          {
            id: 'cf_review_rating',
            field_value: payload.rating.toString()
          },
          {
            id: 'cf_review_text',
            field_value: payload.review_text
          },
          {
            id: 'cf_review_url',
            field_value: payload.review_url
          }
        ]
      };
      
      ghlContact = await createContact(newContactData);
    }

    if (!ghlContact || !ghlContact.id) {
      console.error('Failed to find or create contact for reviewer');
      return NextResponse.json(
        { success: false, error: 'Could not process reviewer contact' },
        { status: 500 }
      );
    }

    // Apply review-specific tags based on rating
    const tagsToAdd = [
      `review:platform_${payload.platform.toLowerCase()}`,
      `review:rating_${payload.rating}`
    ];

    // Determine if positive or negative review
    if (payload.rating >= 4) {
      tagsToAdd.push('review:positive_given');
    } else {
      tagsToAdd.push('review:negative_damage_control');
    }

    // Add source tag if this is a new contact
    if (!payload.reviewer_email) {
      tagsToAdd.push(`source:${payload.platform.toLowerCase()}_review`);
    }

    // Apply tags to trigger Workflow 20
    await addTagsToContact(ghlContact.id, tagsToAdd);
    
    // Add note with review details (simplified - no note function available)
    console.log('Review details logged:', {
      platform: payload.platform.toUpperCase(),
      rating: payload.rating,
      reviewText: payload.review_text,
      reviewUrl: payload.review_url,
      contactId: ghlContact.id
    });

    // 🎯 NEW: Trigger GMB automation for review thank you post
    try {
      await triggerReviewThankYouPost({
        platform: payload.platform,
        reviewerName: payload.reviewer_name,
        rating: payload.rating,
        reviewText: payload.review_text,
        reviewId: payload.review_id,
        ghlContactId: ghlContact.id
      });
      console.log('GMB review thank you post triggered successfully');
    } catch (gmbError) {
      console.error('Failed to trigger GMB review post:', gmbError);
      // Don't fail the main workflow if GMB posting fails
    }

    console.log(`Review processing complete for ${payload.reviewer_name} - ${payload.rating} stars on ${payload.platform}`);

    return NextResponse.json({
      success: true,
      message: 'Review processed successfully',
      contactId: ghlContact.id,
      rating: payload.rating,
      platform: payload.platform,
      workflowTriggered: true,
      gmbPostTriggered: true
    });

  } catch (error) {
    console.error('Review webhook error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process review webhook',
        message: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'Review monitoring webhook',
    workflow: 'Workflow 20: Review Response Automation',
    timestamp: new Date().toISOString()
  });
} 
