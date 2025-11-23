/**
 * 🎯 GMB Automation Service
 * Houston Mobile Notary Pros - Automated GMB Posting
 * 
 * Integrates with existing GHL webhook system to automatically create
 * GMB posts for service completions, reviews, and promotional content
 */

import { GMBAPIService } from './api-service';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

interface ServiceCompletionEvent {
  bookingId: string;
  serviceType: string;
  customerName: string;
  serviceLocation: string;
      // completedAt: new Date(), // Property does not exist on Booking model
  customerSatisfaction?: number;
  ghlContactId?: string;
}

interface ReviewReceivedEvent {
  platform: 'google' | 'yelp' | 'facebook' | 'internal';
  reviewerName: string;
  rating: number;
  reviewText: string;
  serviceType?: string;
  reviewId: string;
  ghlContactId?: string;
}

interface PromotionalPost {
  title: string;
  description: string;
  discountAmount?: string;
  validUntil?: Date;
  targetService?: string;
  imageUrl?: string;
}

export class GMBAutomationService {
  private static instance: GMBAutomationService;
  private postingEnabled: boolean;
  private lastPostTime: Date | null = null;
  private postCooldown: number = 60 * 60 * 1000; // 1 hour cooldown between posts
  private gmbService: GMBAPIService | null = null;

  constructor() {
    this.postingEnabled = process.env.GMB_POSTING_ENABLED === 'true';
    if (!this.postingEnabled) {
      logger.warn('GMB posting is disabled - set GMB_POSTING_ENABLED=true to enable');
    }
  }

  private getGMBService(): GMBAPIService {
    if (!this.gmbService) {
      this.gmbService = new GMBAPIService();
    }
    return this.gmbService;
  }

  static getInstance(): GMBAutomationService {
    if (!GMBAutomationService.instance) {
      GMBAutomationService.instance = new GMBAutomationService();
    }
    return GMBAutomationService.instance;
  }

  /**
   * 🎯 Main Automation Triggers
   */

  /**
   * Handle service completion (triggered from GHL post-service workflow)
   */
  async handleServiceCompletion(event: ServiceCompletionEvent): Promise<void> {
    if (!this.postingEnabled) {
      logger.info('GMB posting disabled, skipping service completion post');
      return;
    }

    try {
      // Check cooldown to prevent spam
      if (this.lastPostTime && Date.now() - this.lastPostTime.getTime() < this.postCooldown) {
        logger.info('GMB post cooldown active, skipping service completion post');
        return;
      }

      // Create location-specific post
      const locationName = this.extractLocationName(event.serviceLocation);
      const serviceDisplayName = this.getServiceDisplayName(event.serviceType);
      
      const satisfactionNote = event.customerSatisfaction && event.customerSatisfaction >= 4
        ? "Another satisfied customer! 🌟"
        : "Professional service delivered with precision!";

      await this.getGMBService().createServiceCompletionPost({
        serviceType: serviceDisplayName,
        location: locationName,
        satisfactionNote
      });

      // Update last post time
      this.lastPostTime = new Date();

      // Log the event
      await this.logGMBActivity({
        type: 'SERVICE_COMPLETION',
        bookingId: event.bookingId,
        serviceType: event.serviceType,
        location: locationName,
        ghlContactId: event.ghlContactId
      });

      logger.info('Service completion GMB post created successfully', {
        bookingId: event.bookingId,
        serviceType: event.serviceType,
        location: locationName
      });

    } catch (error) {
      logger.error('Failed to create service completion GMB post:', error instanceof Error ? error : new Error(String(error)));
      // Don't throw - we don't want to break the main workflow
    }
  }

  /**
   * Handle review received (integrates with existing review webhook)
   */
  async handleReviewReceived(event: ReviewReceivedEvent): Promise<void> {
    if (!this.postingEnabled) {
      logger.info('GMB posting disabled, skipping review thank you post');
      return;
    }

    try {
      // Only create posts for 4+ star reviews to maintain positive image
      if (event.rating < 4) {
        logger.info('Review rating below 4 stars, skipping GMB post', {
          rating: event.rating,
          platform: event.platform
        });
        return;
      }

      // Check cooldown
      if (this.lastPostTime && Date.now() - this.lastPostTime.getTime() < this.postCooldown) {
        logger.info('GMB post cooldown active, skipping review thank you post');
        return;
      }

      await this.getGMBService().createReviewThankYouPost({
        reviewerName: event.reviewerName,
        rating: event.rating,
        serviceType: event.serviceType,
        reviewText: event.reviewText
      });

      // Update last post time
      this.lastPostTime = new Date();

      // Log the event
      await this.logGMBActivity({
        type: 'REVIEW_THANK_YOU',
        reviewId: event.reviewId,
        rating: event.rating,
        platform: event.platform,
        ghlContactId: event.ghlContactId
      });

      logger.info('Review thank you GMB post created successfully', {
        reviewerName: event.reviewerName,
        rating: event.rating,
        platform: event.platform
      });

    } catch (error) {
      logger.error('Failed to create review thank you GMB post:', error instanceof Error ? error : new Error(String(error)));
      // Don't throw - we don't want to break the review workflow
    }
  }

  /**
   * Create promotional posts (manual trigger from admin)
   */
  async createPromotionalPost(promo: PromotionalPost): Promise<void> {
    if (!this.postingEnabled) {
      throw new Error('GMB posting is disabled');
    }

    try {
      await this.gmbService?.createOfferPost({
        offerTitle: promo.title,
        offerDescription: promo.description,
        discountAmount: promo.discountAmount,
        validUntil: promo.validUntil,
        ctaUrl: 'https://houstonmobilenotarypros.com/booking',
        imageUrl: promo.imageUrl
      });

      // Log the event
      await this.logGMBActivity({
        type: 'PROMOTIONAL_POST',
        promoTitle: promo.title,
        discountAmount: promo.discountAmount,
        targetService: promo.targetService
      });

      logger.info('Promotional GMB post created successfully', {
        title: promo.title,
        discountAmount: promo.discountAmount
      });

    } catch (error) {
      logger.error('Failed to create promotional GMB post:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  /**
   * 🎯 Scheduled Automation
   */

  /**
   * Create regular service announcement posts
   */
  async createRegularServiceAnnouncement(): Promise<void> {
    if (!this.postingEnabled) {
      logger.info('GMB posting disabled, skipping regular service announcement');
      return;
    }

    try {
      const announcements = [
        {
          serviceType: 'Mobile Notary',
          announcement: '📱 Need documents notarized? We come to you! Available throughout Houston area with same-day service.\n\n🎯 Flawless service guaranteed—or we pay the redraw fee.',
          ctaUrl: 'https://houstonmobilenotarypros.com/booking'
        },
        {
          serviceType: 'Loan Signing',
          announcement: '🏠 Real estate closing? Our certified loan signing agents ensure smooth transactions.\n\n⏰ Available 24/7 for urgent loan signings.\n\n🎯 Zero tolerance for errors—your funding is our priority.',
          ctaUrl: 'https://houstonmobilenotarypros.com/booking?service=loan-signing'
        },
        {
          serviceType: 'RON Services',
          announcement: '💻 Remote Online Notarization now available! Secure, convenient, and legally compliant.\n\n🔒 Texas-compliant RON services\n\n🎯 Complete your notarization from anywhere.',
          ctaUrl: 'https://houstonmobilenotarypros.com/ron'
        }
      ];

      // Rotate announcements based on day of week
      const dayOfWeek = new Date().getDay();
      const selectedAnnouncement = announcements[dayOfWeek % announcements.length];

      if (selectedAnnouncement) {
        await this.gmbService?.createServicePost(selectedAnnouncement);

        // Log the event
        await this.logGMBActivity({
          type: 'REGULAR_ANNOUNCEMENT',
          serviceType: selectedAnnouncement.serviceType,
          announcement: selectedAnnouncement.announcement.substring(0, 100)
        });

        logger.info('Regular service announcement GMB post created successfully', {
          serviceType: selectedAnnouncement.serviceType
        });
      }

    } catch (error) {
      logger.error('Failed to create regular service announcement:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  /**
   * 🎯 Analytics & Monitoring
   */

  /**
   * Get GMB posting analytics
   */
  async getPostingAnalytics(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activities = await prisma.gMBActivity.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const analytics = {
        totalPosts: activities.length,
        postTypes: this.groupBy(activities, 'type'),
        successRate: activities.length > 0 ? (activities.filter((a: (typeof activities)[number]) => a.status === 'SUCCESS').length / activities.length) * 100 : 0,
        averageEngagement: await this.calculateAverageEngagement(activities),
        topPerformingPosts: await this.getTopPerformingPosts(activities, 5),
        recentActivity: activities.slice(0, 10)
      };

      return analytics;
    } catch (error) {
      logger.error('Failed to get GMB posting analytics:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  /**
   * 🎯 Private Helper Methods
   */

  private extractLocationName(fullAddress: string): string {
    // Extract city/area from full address
    const parts = fullAddress.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return parts[1] || 'Houston area'; // Usually the city is the second part
    }
    return 'Houston area';
  }

  private getServiceDisplayName(serviceType: string): string {
    const serviceNames: Record<string, string> = {
      'STANDARD_NOTARY': 'Mobile Notary',
      'EXTENDED_HOURS': 'Priority Notary',
      'LOAN_SIGNING': 'Loan Signing',
      'RON_SERVICES': 'Remote Online Notarization',
      'QUICK_STAMP_LOCAL': 'Quick Notary',
      'BUSINESS_ESSENTIALS': 'Business Notary'
    };

    return serviceNames[serviceType] || 'Notary Service';
  }

  private async logGMBActivity(activity: any): Promise<void> {
    try {
      await prisma.gMBActivity.create({
        data: {
          type: activity.type,
          status: 'SUCCESS',
          data: activity,
          createdAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to log GMB activity:', error instanceof Error ? error : String(error));
      // Don't throw - logging failure shouldn't break the main process
    }
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }

  private async calculateAverageEngagement(activities: any[]): Promise<number> {
    // This would integrate with GMB insights API to get actual engagement metrics
    // For now, return a placeholder
    return 0;
  }

  private async getTopPerformingPosts(activities: any[], limit: number): Promise<any[]> {
    // This would integrate with GMB insights API to get actual performance metrics
    // For now, return recent activities
    return activities.slice(0, limit);
  }
}

// Export singleton instance
export const gmbAutomation = GMBAutomationService.getInstance();

/**
 * 🎯 Integration Functions for Existing Webhooks
 */

/**
 * Call this from your existing GHL post-service workflow
 */
export async function triggerServiceCompletionPost(bookingData: {
  bookingId: string;
  serviceType: string;
  customerName: string;
  serviceLocation: string;
  completedAt?: Date;
  customerSatisfaction?: number;
  ghlContactId?: string;
}): Promise<void> {
  const automation = GMBAutomationService.getInstance();
  
  await automation.handleServiceCompletion({
    bookingId: bookingData.bookingId,
    serviceType: bookingData.serviceType,
    customerName: bookingData.customerName,
    serviceLocation: bookingData.serviceLocation,
      // completedAt: new Date(), // Property does not exist on Booking model
    customerSatisfaction: bookingData.customerSatisfaction,
    ghlContactId: bookingData.ghlContactId
  });
}

/**
 * Call this from your existing review webhook
 */
export async function triggerReviewThankYouPost(reviewData: {
  platform: 'google' | 'yelp' | 'facebook' | 'internal';
  reviewerName: string;
  rating: number;
  reviewText: string;
  serviceType?: string;
  reviewId: string;
  ghlContactId?: string;
}): Promise<void> {
  const automation = GMBAutomationService.getInstance();
  
  await automation.handleReviewReceived(reviewData);
} 