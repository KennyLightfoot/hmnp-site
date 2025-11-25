/**
 * Review Request Automation System
 * Automatically requests reviews from customers after service completion
 * 
 * Goal: Increase reviews from 23 to 50+ to compete with top competitors
 */

import { NotificationService } from './notifications';
import { NotificationMethod, NotificationType } from './prisma-types';
import { logger } from './logger';
import { prisma } from './database-connection';

export interface ReviewRequestConfig {
  delayHours?: number; // Hours after service completion to send review request
  enableEmail?: boolean;
  enableSMS?: boolean;
  googleReviewLink?: string;
  yelpReviewLink?: string;
}

const DEFAULT_CONFIG: ReviewRequestConfig = {
  delayHours: 24, // Send review request 24 hours after service completion
  enableEmail: true,
  enableSMS: true,
  googleReviewLink: 'https://g.page/r/YOUR_GBP_REVIEW_LINK', // TODO: Replace with actual GBP review link
  yelpReviewLink: 'https://www.yelp.com/biz/houston-mobile-notary-pros-houston#reviews'
};

/**
 * Send review request to customer after service completion
 */
export async function sendReviewRequest(
  bookingId: string,
  customerEmail: string,
  customerName: string,
  customerPhone?: string,
  config: ReviewRequestConfig = {}
): Promise<{
  emailSent: boolean;
  smsSent: boolean;
  errors: string[];
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];
  let emailSent = false;
  let smsSent = false;

  const firstName = customerName.split(' ')[0] || customerName;

  // Email review request
  if (finalConfig.enableEmail && customerEmail) {
    try {
      const emailSubject = `⭐ How was your experience with Houston Mobile Notary Pros?`;
      const emailMessage = buildReviewRequestEmail(firstName, finalConfig);

      await NotificationService.sendNotification({
        bookingId,
        type: NotificationType.POST_SERVICE_FOLLOWUP,
        recipient: { email: customerEmail },
        content: {
          subject: emailSubject,
          message: emailMessage
        },
        methods: [NotificationMethod.EMAIL]
      });

      emailSent = true;
      logger.info('Review request email sent', 'REVIEW_AUTOMATION', {
        bookingId,
        customerEmail
      });
    } catch (error) {
      errors.push(`Email failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.error('Failed to send review request email', 'REVIEW_AUTOMATION', error as Error);
    }
  }

  // SMS review request
  if (finalConfig.enableSMS && customerPhone) {
    try {
      const smsMessage = buildReviewRequestSMS(firstName, finalConfig);

      await NotificationService.sendNotification({
        bookingId,
        type: NotificationType.POST_SERVICE_FOLLOWUP,
        recipient: { phone: customerPhone },
        content: {
          message: smsMessage
        },
        methods: [NotificationMethod.SMS]
      });

      smsSent = true;
      logger.info('Review request SMS sent', 'REVIEW_AUTOMATION', {
        bookingId,
        customerPhone
      });
    } catch (error) {
      errors.push(`SMS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.error('Failed to send review request SMS', 'REVIEW_AUTOMATION', error as Error);
    }
  }

  return { emailSent, smsSent, errors };
}

/**
 * Build HTML email for review request
 */
function buildReviewRequestEmail(firstName: string, config: ReviewRequestConfig): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Review Request</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .review-section { background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .button { background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; font-weight: bold; }
    .button-yelp { background: #d32323; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ Thank You, ${firstName}!</h1>
    </div>
    <div class="content">
      <p>We hope you had a great experience with Houston Mobile Notary Pros!</p>
      
      <div class="review-section">
        <h2 style="color: #1e40af; margin-top: 0;">Your Feedback Helps Us Serve You Better</h2>
        <p style="font-size: 16px; color: #1e3a8a; margin-bottom: 20px;">
          Reviews help us improve our services and help others find trusted notary services in Houston.
          Please take a moment to share your experience:
        </p>
        <div style="margin: 25px 0;">
          <a href="${config.googleReviewLink}" class="button">
            ⭐ Review on Google
          </a>
          <a href="${config.yelpReviewLink}" class="button button-yelp">
            ⭐ Review on Yelp
          </a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 15px; margin-bottom: 0;">
          It only takes a minute and means the world to us!
        </p>
      </div>

      <p>If you have any questions or concerns, please don't hesitate to contact us:</p>
      <ul>
        <li>📧 Email: <a href="mailto:contact@houstonmobilenotarypros.com">contact@houstonmobilenotarypros.com</a></li>
        <li>📱 Phone: <a href="tel:+18326174285">(832) 617-4285</a></li>
      </ul>

      <p>Thank you for choosing Houston Mobile Notary Pros!</p>
    </div>
    <div class="footer">
      <p>Houston Mobile Notary Pros</p>
      <p>Professional • Reliable • Convenient</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Build SMS message for review request
 */
function buildReviewRequestSMS(firstName: string, config: ReviewRequestConfig): string {
  return `Hi ${firstName}! We hope you had a great experience with Houston Mobile Notary Pros. Your feedback helps us serve you better! Please leave us a review: ${config.googleReviewLink} Thank you!`;
}

/**
 * Process review requests for completed bookings
 * Called by scheduler to send review requests after delay period
 */
export async function processReviewRequests(delayHours: number = 24): Promise<{
  processed: number;
  sent: number;
  errors: string[];
}> {
  const now = new Date();
  const delayMs = delayHours * 60 * 60 * 1000;
  const cutoffTime = new Date(now.getTime() - delayMs);

  // Find completed bookings that haven't received review requests yet
  // Use actualEndDateTime instead of completedAt (which doesn't exist in schema)
  // Check if review already exists instead of reviewRequestSentAt (which doesn't exist)
  const completedBookings = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
      actualEndDateTime: {
        lte: cutoffTime,
        not: null
      },
      reviews: {
        none: {} // No reviews exist yet for this booking
      }
    },
    include: {
      User_Booking_signerIdToUser: {
        select: {
          email: true,
          name: true
        }
      }
    },
    take: 50 // Process in batches
  });

  const errors: string[] = [];
  let sent = 0;

  for (const booking of completedBookings) {
    const customer = booking.User_Booking_signerIdToUser;
    if (!customer?.email) {
      continue;
    }

    try {
      const result = await sendReviewRequest(
        booking.id,
        customer.email,
        customer.name || 'Valued Customer'
      );

      if (result.emailSent || result.smsSent) {
        sent++;
      }

      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }
    } catch (error) {
      errors.push(`Booking ${booking.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.error('Failed to process review request', 'REVIEW_AUTOMATION', error as Error);
    }
  }

  logger.info('Review requests processed', 'REVIEW_AUTOMATION', {
    processed: completedBookings.length,
    sent,
    errors: errors.length
  });

  return {
    processed: completedBookings.length,
    sent,
    errors
  };
}

