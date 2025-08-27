/**
 * 🎯 Review Collection Automation - Phase 4 Enhancement
 * Houston Mobile Notary Pros - Automated Review Collection System
 * 
 * Increases review volume through targeted campaigns, optimal timing,
 * and multi-channel follow-up sequences.
 */

import { prisma } from '@/lib/prisma';
import { addTagsToContact } from '@/lib/ghl/contacts';

interface ReviewCampaignConfig {
  name: string;
  description: string;
  triggerDelay: number; // Hours after service completion
  maxFollowUps: number;
  followUpIntervals: number[]; // Hours between follow-ups
  channels: ('email' | 'sms' | 'phone')[];
  targetRating?: number; // Only request from customers likely to give this rating or higher
  serviceTypes?: string[]; // Specific service types to target
  isActive: boolean;
}

interface ReviewRequest {
  id: string;
  bookingId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  serviceType: string;
  campaignId: string;
  status: 'pending' | 'sent' | 'reminded' | 'completed' | 'opted_out';
  scheduledFor: Date;
  sentAt?: Date;
  followUpCount: number;
  nextFollowUp?: Date;
  reviewSubmitted?: boolean;
  reviewId?: string;
  ghlContactId?: string;
  metadata: any;
}

// Pre-configured review campaigns
const REVIEW_CAMPAIGNS: ReviewCampaignConfig[] = [
  {
    name: 'Standard Service Follow-up',
    description: 'Default review request for standard notary services',
    triggerDelay: 24, // 24 hours after service
    maxFollowUps: 2,
    followUpIntervals: [72, 168], // 3 days, then 1 week
    channels: ['email', 'sms'],
    serviceTypes: ['Standard Notary', 'Extended Hours Notary'],
    isActive: true
  },
  {
    name: 'Premium Service VIP Follow-up',
    description: 'Enhanced follow-up for loan signing and RON services',
    triggerDelay: 48, // 48 hours after service (longer for reflection)
    maxFollowUps: 3,
    followUpIntervals: [48, 120, 240], // 2 days, 5 days, 10 days
    channels: ['email', 'sms', 'phone'],
    targetRating: 4, // Only from satisfied customers
    serviceTypes: ['Loan Signing Specialist', 'Remote Online Notarization'],
    isActive: true
  },
  {
    name: 'Emergency Service Follow-up',
    description: 'Quick follow-up for emergency services',
    triggerDelay: 12, // 12 hours after service
    maxFollowUps: 1,
    followUpIntervals: [48], // One follow-up after 2 days
    channels: ['email'],
    serviceTypes: ['Emergency Notary'],
    isActive: true
  },
  {
    name: 'High-Value Client Retention',
    description: 'Special campaign for business and repeat clients',
    triggerDelay: 72, // 3 days for business reflection
    maxFollowUps: 2,
    followUpIntervals: [96, 168], // 4 days, then 1 week
    channels: ['email', 'phone'],
    targetRating: 5, // Only target for 5-star reviews
    serviceTypes: ['Business Solutions', 'Estate Planning'],
    isActive: true
  }
];

export class ReviewCollectionAutomation {
  
  /**
   * Trigger review collection after service completion
   */
  static async triggerReviewCollection(bookingId: string): Promise<void> {
    try {
      console.log(`🎯 Triggering review collection for booking: ${bookingId}`);

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          service: true
        }
      });

      if (!booking || !booking.customerEmail) {
        console.warn(`No valid booking or customer email found for booking: ${bookingId}`);
        return;
      }

      // Determine appropriate campaign
      const campaign = this.selectCampaign(booking.service.serviceType as string);
      if (!campaign) {
        console.warn(`No active campaign found for service type: ${booking.service.serviceType}`);
        return;
      }

      // Calculate when to send the first request
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + campaign.triggerDelay);

      // Check if we already have a review request for this booking
      const existingRequest = await this.findExistingRequest(bookingId);
      if (existingRequest) {
        console.log(`Review request already exists for booking: ${bookingId}`);
        return;
      }

      // Create review request record
      const reviewRequest = await this.createReviewRequest({
        bookingId,
        customerId: booking.signerId || 'guest',
        customerEmail: booking.customerEmail,
        customerName: booking.customerEmail, // We'll need to get this from GHL
        serviceType: booking.service.serviceType,
        campaignId: campaign.name,
        scheduledFor,
        ghlContactId: booking.ghlContactId || undefined,
        metadata: {
          serviceId: booking.serviceId,
          bookingDate: booking.scheduledDateTime,
          campaign: campaign.name
        }
      });

      // Schedule the review request
      await this.scheduleReviewRequest(reviewRequest.id);

      // Add GHL tags for tracking
      if (booking.ghlContactId) {
        await addTagsToContact(booking.ghlContactId, [
          'review:request_scheduled',
          `review:campaign_${campaign.name.replace(/\s+/g, '_').toLowerCase()}`,
          'follow_up:review_collection'
        ]);
      }

      console.log(`✅ Review collection scheduled for booking: ${bookingId}`);

    } catch (error) {
      console.error('Error triggering review collection:', error);
      throw error;
    }
  }

  /**
   * Select the appropriate campaign based on service type and other factors
   */
  private static selectCampaign(serviceType: string): ReviewCampaignConfig | null {
    return REVIEW_CAMPAIGNS.find(campaign => 
      campaign.isActive && 
      (!campaign.serviceTypes || campaign.serviceTypes.includes(serviceType))
    ) || REVIEW_CAMPAIGNS.find(campaign => 
      campaign.isActive && campaign.name === 'Standard Service Follow-up'
    ) || null;
  }

  /**
   * Check if a review request already exists for this booking
   */
  private static async findExistingRequest(bookingId: string): Promise<any> {
    // This would check your review_requests table (to be created)
    // For now, we'll just check if a review already exists
    const existingReview = await prisma.review.findFirst({
      where: { bookingId }
    });
    return existingReview;
  }

  /**
   * Create a new review request record
   */
  private static async createReviewRequest(data: Partial<ReviewRequest>): Promise<ReviewRequest> {
    // In a full implementation, this would create a record in a review_requests table
    // For now, we'll simulate this with a basic structure
    const reviewRequest: ReviewRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId: data.bookingId!,
      customerId: data.customerId!,
      customerEmail: data.customerEmail!,
      customerName: data.customerName!,
      serviceType: data.serviceType!,
      campaignId: data.campaignId!,
      status: 'pending',
      scheduledFor: data.scheduledFor!,
      followUpCount: 0,
      ghlContactId: data.ghlContactId,
      metadata: data.metadata || {}
    };

    // In production, save to database
    console.log('📝 Created review request:', reviewRequest.id);
    return reviewRequest;
  }

  /**
   * Schedule a review request for processing
   */
  private static async scheduleReviewRequest(requestId: string): Promise<void> {
    // In production, this would use a job queue like BullMQ or similar
    console.log(`⏰ Scheduled review request: ${requestId}`);
  }

  /**
   * Process scheduled review requests (called by cron job)
   */
  static async processScheduledRequests(): Promise<void> {
    try {
      console.log('🔄 Processing scheduled review requests...');

      // In production, this would:
      // 1. Query all pending review requests where scheduledFor <= now
      // 2. Send review request emails/SMS
      // 3. Update request status to 'sent'
      // 4. Schedule follow-ups if needed
      // 5. Update GHL contact tags

      console.log('✅ Processed scheduled review requests');

    } catch (error) {
      console.error('Error processing scheduled requests:', error);
      throw error;
    }
  }

  /**
   * Generate review request email content
   */
  static generateReviewRequestContent(
    customerName: string,
    serviceType: string,
    bookingDate: Date
  ): { subject: string; html: string; text: string } {
    const subject = `How was your ${serviceType} experience? ⭐`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #002147 0%, #1e40af 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Thank You, ${customerName}!</h1>
          <p style="margin: 10px 0 0; font-size: 18px; opacity: 0.9;">
            We hope you had a great experience with our ${serviceType} service
          </p>
        </div>
        
        <div style="padding: 40px 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hi ${customerName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for choosing Houston Mobile Notary Pros for your ${serviceType} needs on 
            ${bookingDate.toLocaleDateString()}. We hope everything went smoothly!
          </p>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
            <h2 style="color: #002147; margin: 0 0 15px;">How did we do?</h2>
            <p style="margin: 0 0 20px; color: #666;">
              Your feedback helps us improve and helps other customers find reliable notary services.
            </p>
            
            <a href="https://houstonmobilenotarypros.com/reviews?utm_source=email&utm_campaign=review_request" 
               style="display: inline-block; background: #A52A2A; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              ⭐ Leave a Review
            </a>
          </div>
          
          <div style="border-left: 4px solid #A52A2A; padding-left: 20px; margin: 30px 0;">
            <h3 style="color: #002147; margin: 0 0 10px;">Why Your Review Matters</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Helps us continue providing excellent service</li>
              <li>Assists other customers in making informed decisions</li>
              <li>Only takes 2 minutes of your time</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            If you experienced any issues during your service, please don't hesitate to reach out 
            directly at <a href="mailto:contact@houstonmobilenotarypros.com" style="color: #A52A2A;">
            contact@houstonmobilenotarypros.com</a> or call us at 
            <a href="tel:${process.env.BUSINESS_PHONE ? `+1${String(process.env.BUSINESS_PHONE).replace(/\D/g,'')}` : '+18326174285'}" style="color: #A52A2A;">${process.env.BUSINESS_PHONE || '(832) 617-4285'}</a>.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for your time and for choosing Houston Mobile Notary Pros!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Best regards,<br>
            <strong>The Houston Mobile Notary Pros Team</strong>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">
            Houston Mobile Notary Pros • Professional • Reliable • Convenient<br>
            <a href="tel:${process.env.BUSINESS_PHONE ? `+1${String(process.env.BUSINESS_PHONE).replace(/\D/g,'')}` : '+18326174285'}" style="color: #A52A2A;">${process.env.BUSINESS_PHONE || '(832) 617-4285'}</a> • 
            <a href="mailto:contact@houstonmobilenotarypros.com" style="color: #A52A2A;">
              contact@houstonmobilenotarypros.com
            </a>
          </p>
          <p style="margin: 10px 0 0; font-size: 12px;">
            <a href="#" style="color: #999;">Unsubscribe</a> from review requests
          </p>
        </div>
      </div>
    `;

    const text = `
Hi ${customerName},

Thank you for choosing Houston Mobile Notary Pros for your ${serviceType} needs on ${bookingDate.toLocaleDateString()}. We hope everything went smoothly!

How did we do?
Your feedback helps us improve and helps other customers find reliable notary services.

Please take a moment to leave a review:
https://houstonmobilenotarypros.com/reviews?utm_source=email&utm_campaign=review_request

Why Your Review Matters:
• Helps us continue providing excellent service
• Assists other customers in making informed decisions  
• Only takes 2 minutes of your time

If you experienced any issues during your service, please don't hesitate to reach out directly at contact@houstonmobilenotarypros.com or call us at (832) 617-4285.

Thank you for your time and for choosing Houston Mobile Notary Pros!

Best regards,
The Houston Mobile Notary Pros Team

Houston Mobile Notary Pros • Professional • Reliable • Convenient
(832) 617-4285 • contact@houstonmobilenotarypros.com
    `;

    return { subject, html, text };
  }

  /**
   * Mark a review as submitted and stop follow-ups
   */
  static async markReviewSubmitted(bookingId: string, reviewId: string): Promise<void> {
    try {
      // Update review request status
      console.log(`✅ Review submitted for booking: ${bookingId}, review: ${reviewId}`);
      
      // In production, update the review_requests table
      // Cancel any pending follow-ups
      
      // Add success tags to GHL contact
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (booking?.ghlContactId) {
        await addTagsToContact(booking.ghlContactId, [
          'review:submitted_success',
          'review:collection_complete'
        ]);
      }

    } catch (error) {
      console.error('Error marking review as submitted:', error);
    }
  }

  /**
   * Get campaign performance statistics
   */
  static async getCampaignStats(): Promise<any> {
    try {
      // In production, this would aggregate data from review_requests table
      const totalReviews = await prisma.review.count();
      const recentReviews = await prisma.review.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      const averageRating = await prisma.review.aggregate({
        _avg: { rating: true },
        where: { isApproved: true }
      });

      return {
        totalReviews,
        recentReviews,
        averageRating: averageRating._avg.rating,
        campaigns: REVIEW_CAMPAIGNS.map(campaign => ({
          name: campaign.name,
          isActive: campaign.isActive,
          triggerDelay: campaign.triggerDelay,
          maxFollowUps: campaign.maxFollowUps
        }))
      };

    } catch (error) {
      console.error('Error getting campaign stats:', error);
      return null;
    }
  }
} 