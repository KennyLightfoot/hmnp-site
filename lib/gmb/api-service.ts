/**
 * 🎯 Google My Business API Service
 * Houston Mobile Notary Pros - GMB Integration
 * 
 * Automated posting system that leverages existing GMB credentials
 * and integrates with GHL review webhooks for maximum local SEO impact
 */

import { google } from 'googleapis';
import { logger } from '@/lib/logger';

// GMB API interfaces
interface GMBPost {
  type: 'OFFER' | 'PRODUCT' | 'SERVICE' | 'EVENT' | 'WHAT_IS_NEW';
  content: {
    summary: string;
    callToAction?: {
      actionType: 'BOOK' | 'CALL' | 'LEARN_MORE' | 'SIGN_UP';
      url?: string;
      phoneNumber?: string;
    };
    media?: {
      sourceUrl: string;
      mediaFormat: 'IMAGE' | 'VIDEO';
    }[];
  };
  topicType?: 'STANDARD' | 'COVID_19';
  languageCode?: string;
  alertType?: 'COVID_19';
}

interface GMBLocation {
  name: string;
  locationId: string;
  businessName: string;
  address: string;
  phoneNumber: string;
  websiteUrl: string;
}

interface GMBReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: number;
  comment: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export class GMBAPIService {
  private auth: any;
  private mybusiness: any;
  private locationId: string;
  private accountId: string;
  private initialized: boolean = false;

  private logError(message: string, error: unknown): void {
    logger.error(message, error instanceof Error ? error : String(error));
  }
  
  constructor() {
    // Remove initialization from constructor to prevent build-time errors
    this.locationId = '';
    this.accountId = '';
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.locationId = process.env.GOOGLE_MY_BUSINESS_LOCATION_ID || '';
    this.accountId = process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID || '';
    
    if (!this.locationId || !this.accountId) {
      throw new Error('GMB location ID or account ID not configured');
    }
    
    this.initializeAuth();
    this.initialized = true;
  }

  private initializeAuth() {
    try {
      // Use existing OAuth2 credentials
      this.auth = new google.auth.OAuth2(
        process.env.GOOGLE_MY_BUSINESS_CLIENT_ID,
        process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET,
        'https://houstonmobilenotarypros.com/api/auth/callback/google'
      );
      
      this.auth.setCredentials({
        refresh_token: process.env.GOOGLE_MY_BUSINESS_REFRESH_TOKEN,
        access_token: process.env.GOOGLE_MY_BUSINESS_ACCESS_TOKEN,
      });
      
      this.mybusiness = google.mybusinessbusinessinformation({
        version: 'v1',
        auth: this.auth,
      });
      
      logger.info('GMB API service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize GMB API service:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  /**
   * 🎯 Core GMB Posting Methods
   */

  /**
   * Create a service announcement post
   */
  async createServicePost(data: {
    serviceType: string;
    announcement: string;
    ctaUrl?: string;
    ctaPhone?: string;
    imageUrl?: string;
  }): Promise<any> {
    await this.ensureInitialized();
    
    const post: GMBPost = {
      type: 'SERVICE',
      content: {
        summary: data.announcement,
        callToAction: {
          actionType: data.ctaUrl ? 'BOOK' : 'CALL',
          url: data.ctaUrl,
          phoneNumber: data.ctaPhone || '(832) 617-4285'
        },
        media: data.imageUrl ? [{
          sourceUrl: data.imageUrl,
          mediaFormat: 'IMAGE'
        }] : undefined
      },
      languageCode: 'en-US'
    };

    try {
      const response = await this.createPost(post);
      logger.info('Service post created successfully', {
        serviceType: data.serviceType,
        postId: response.name
      });
      return response;
    } catch (error) {
      logger.error('Failed to create service post:', error instanceof Error ? error : String(error));
      throw error;
    }
  }

  /**
   * Create a promotional offer post
   */
  async createOfferPost(data: {
    offerTitle: string;
    offerDescription: string;
    discountAmount?: string;
    validUntil?: Date;
    ctaUrl?: string;
    imageUrl?: string;
  }): Promise<any> {
    await this.ensureInitialized();
    
    const post: GMBPost = {
      type: 'OFFER',
      content: {
        summary: `${data.offerTitle}\n\n${data.offerDescription}${data.discountAmount ? `\n\nSave ${data.discountAmount}!` : ''}${data.validUntil ? `\n\nValid until ${data.validUntil.toLocaleDateString()}` : ''}`,
        callToAction: {
          actionType: 'BOOK',
          url: data.ctaUrl || 'https://houstonmobilenotarypros.com/booking'
        },
        media: data.imageUrl ? [{
          sourceUrl: data.imageUrl,
          mediaFormat: 'IMAGE'
        }] : undefined
      },
      languageCode: 'en-US'
    };

    try {
      const response = await this.createPost(post);
      logger.info('Offer post created successfully', {
        offerTitle: data.offerTitle,
        postId: response.name
      });
      return response;
    } catch (error) {
      this.logError('Failed to create offer post:', error);
      throw error;
    }
  }

  /**
   * Create a service completion announcement (triggered by GHL webhook)
   */
  async createServiceCompletionPost(data: {
    serviceType: string;
    location: string;
    satisfactionNote?: string;
  }): Promise<any> {
    await this.ensureInitialized();
    
    const post: GMBPost = {
      type: 'WHAT_IS_NEW',
      content: {
        summary: `✅ Just completed a ${data.serviceType} service in ${data.location}! ${data.satisfactionNote || 'Another satisfied customer in the Houston area.'}\n\n📞 Need notary services? We come to you!\n\n🎯 Flawless service guaranteed—or we pay the redraw fee.`,
        callToAction: {
          actionType: 'BOOK',
          url: 'https://houstonmobilenotarypros.com/booking'
        }
      },
      languageCode: 'en-US'
    };

    try {
      const response = await this.createPost(post);
      logger.info('Service completion post created successfully', {
        serviceType: data.serviceType,
        location: data.location,
        postId: response.name
      });
      return response;
    } catch (error) {
      logger.error('Failed to create service completion post:', error);
      throw error;
    }
  }

  /**
   * Create a review thank you post
   */
  async createReviewThankYouPost(data: {
    reviewerName: string;
    rating: number;
    serviceType?: string;
    reviewText?: string;
  }): Promise<any> {
    await this.ensureInitialized();
    
    const stars = '⭐'.repeat(data.rating);
    const post: GMBPost = {
      type: 'WHAT_IS_NEW',
      content: {
        summary: `🙏 Thank you ${data.reviewerName} for the ${data.rating}-star review! ${stars}\n\n${data.reviewText ? `"${data.reviewText.substring(0, 100)}..."` : 'We appreciate your feedback!'}\n\n📞 Houston area residents: Experience the same professional service!\n\n🎯 Flawless notary service—or we pay the redraw fee.`,
        callToAction: {
          actionType: 'BOOK',
          url: 'https://houstonmobilenotarypros.com/booking'
        }
      },
      languageCode: 'en-US'
    };

    try {
      const response = await this.createPost(post);
      logger.info('Review thank you post created successfully', {
        reviewerName: data.reviewerName,
        rating: data.rating,
        postId: response.name
      });
      return response;
    } catch (error) {
      logger.error('Failed to create review thank you post:', error);
      throw error;
    }
  }

  /**
   * 🎯 GMB Analytics & Monitoring
   */

  /**
   * Get GMB insights and performance metrics
   */
  async getInsights(timeRange: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'WEEKLY'): Promise<any> {
    await this.ensureInitialized();
    try {
      const response = await this.mybusiness.locations.getGoogleUpdated({
        name: `accounts/${this.accountId}/locations/${this.locationId}`,
      });
      
      logger.info('GMB insights retrieved successfully');
      return response.data;
    } catch (error) {
      logger.error('Failed to get GMB insights:', error);
      throw error;
    }
  }

  /**
   * Get recent reviews from GMB
   */
  async getRecentReviews(limit: number = 10): Promise<GMBReview[]> {
    await this.ensureInitialized();
    try {
      const response = await this.mybusiness.accounts.locations.reviews.list({
        parent: `accounts/${this.accountId}/locations/${this.locationId}`,
        pageSize: limit,
        orderBy: 'updateTime desc'
      });
      
      logger.info('Recent GMB reviews retrieved successfully', {
        count: response.data.reviews?.length || 0
      });
      
      return response.data.reviews || [];
    } catch (error) {
      logger.error('Failed to get recent reviews:', error);
      throw error;
    }
  }

  /**
   * Reply to a GMB review
   */
  async replyToReview(reviewId: string, replyText: string): Promise<any> {
    await this.ensureInitialized();
    try {
      const response = await this.mybusiness.accounts.locations.reviews.updateReply({
        name: `accounts/${this.accountId}/locations/${this.locationId}/reviews/${reviewId}`,
        requestBody: {
          comment: replyText
        }
      });
      
      logger.info('Review reply posted successfully', {
        reviewId,
        replyLength: replyText.length
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to reply to review:', error);
      throw error;
    }
  }

  /**
   * 🎯 Private Helper Methods
   */

  private async createPost(post: GMBPost): Promise<any> {
    await this.ensureInitialized();
    try {
      const response = await this.mybusiness.accounts.locations.localPosts.create({
        parent: `accounts/${this.accountId}/locations/${this.locationId}`,
        requestBody: post
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create GMB post:', error);
      throw error;
    }
  }

  /**
   * Get location information
   */
  async getLocationInfo(): Promise<GMBLocation> {
    await this.ensureInitialized();
    try {
      const response = await this.mybusiness.accounts.locations.get({
        name: `accounts/${this.accountId}/locations/${this.locationId}`,
        readMask: 'name,title,phoneNumbers,websiteUri,regularHours,labels'
      });
      
      const location = response.data;
      return {
        name: location.name,
        locationId: this.locationId,
        businessName: location.title,
        address: location.storefrontAddress ? 
          `${location.storefrontAddress.addressLines?.join(', ')}, ${location.storefrontAddress.locality}, ${location.storefrontAddress.administrativeArea}` : 
          'Address not available',
        phoneNumber: location.phoneNumbers?.[0]?.number || 'Phone not available',
        websiteUrl: location.websiteUri || 'Website not available'
      };
    } catch (error) {
      logger.error('Failed to get location info:', error);
      throw error;
    }
  }

  /**
   * Check if GMB API is properly configured
   */
  async testConnection(): Promise<boolean> {
    await this.ensureInitialized();
    try {
      await this.getLocationInfo();
      logger.info('GMB API connection test successful');
      return true;
    } catch (error) {
      logger.error('GMB API connection test failed:', error);
      return false;
    }
  }
}

// Create a singleton instance that doesn't initialize during build
let _gmbServiceInstance: GMBAPIService | null = null;

export const gmbService = {
  async createServicePost(data: any) {
    if (!_gmbServiceInstance) {
      _gmbServiceInstance = new GMBAPIService();
    }
    return _gmbServiceInstance.createServicePost(data);
  },
  
  async createOfferPost(data: any) {
    if (!_gmbServiceInstance) {
      _gmbServiceInstance = new GMBAPIService();
    }
    return _gmbServiceInstance.createOfferPost(data);
  },
  
  async createServiceCompletionPost(data: any) {
    if (!_gmbServiceInstance) {
      _gmbServiceInstance = new GMBAPIService();
    }
    return _gmbServiceInstance.createServiceCompletionPost(data);
  },
  
  async createReviewThankYouPost(data: any) {
    if (!_gmbServiceInstance) {
      _gmbServiceInstance = new GMBAPIService();
    }
    return _gmbServiceInstance.createReviewThankYouPost(data);
  },
  
  async getLocationInfo() {
    if (!_gmbServiceInstance) {
      _gmbServiceInstance = new GMBAPIService();
    }
    return _gmbServiceInstance.getLocationInfo();
  },
  
  async getRecentReviews(limit: number) {
    if (!_gmbServiceInstance) {
      _gmbServiceInstance = new GMBAPIService();
    }
    return _gmbServiceInstance.getRecentReviews(limit);
  },
  
  async testConnection() {
    if (!_gmbServiceInstance) {
      _gmbServiceInstance = new GMBAPIService();
    }
    return _gmbServiceInstance.testConnection();
  },
  
  async replyToReview(reviewId: string, replyText: string) {
    if (!_gmbServiceInstance) {
      _gmbServiceInstance = new GMBAPIService();
    }
    return _gmbServiceInstance.replyToReview(reviewId, replyText);
  }
};

// Class already exported above 