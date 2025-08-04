/**
 * GMB API Client - Google My Business API Integration
 * Handles posting, review management, and profile updates
 */

import type { GMBPost, ReviewResponse, QAItem } from './automation-system';
import { getErrorMessage } from '@/lib/utils/error-utils';
import type { GMBProfileData } from './profile-optimizer';

export interface GMBApiConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  locationId: string;
  accountId: string;
}

export interface GMBApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitRemaining?: number;
}

export class GMBApiClient {
  private config: GMBApiConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly baseUrl = 'https://mybusiness.googleapis.com/v4';
  private readonly authUrl = 'https://oauth2.googleapis.com/token';

  constructor() {
    this.config = {
      clientId: process.env.GOOGLE_MY_BUSINESS_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET!,
      refreshToken: process.env.GOOGLE_MY_BUSINESS_REFRESH_TOKEN!,
      locationId: process.env.GOOGLE_MY_BUSINESS_LOCATION_ID!,
      accountId: process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID!,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        console.error('Failed to refresh access token:', response.statusText);
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);
      
      return true;
    } catch (error) {
      console.error('Error refreshing access token:', getErrorMessage(error));
      return false;
    }
  }

  /**
   * Get valid access token
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
    }
    return this.accessToken;
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<GMBApiResponse<T>> {
    const token = await this.getAccessToken();
    if (!token) {
      return { success: false, error: 'Failed to get access token' };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || response.statusText,
          rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      };
    }
  }

  /**
   * Update business profile
   */
  async updateProfile(profileData: GMBProfileData): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    const gmbLocationData = {
      name: profileData.businessName,
      locationName: profileData.businessName,
      primaryCategory: {
        displayName: profileData.categories[0],
        categoryId: 'gcid:notary_public'
      },
      additionalCategories: profileData.categories.slice(1).map(cat => ({
        displayName: cat,
        categoryId: `gcid:${cat.toLowerCase().replace(/\s+/g, '_')}`
      })),
      websiteUrl: profileData.website,
      primaryPhone: profileData.phone,
      regularHours: {
        periods: this.convertHoursToGMBFormat(profileData.hours)
      },
      serviceArea: {
        businessType: 'SERVICE_AREA',
        places: profileData.serviceArea.cities.map(city => ({
          name: city,
          placeId: `${city.toLowerCase().replace(/\s+/g, '_')}_tx`
        }))
      },
      locationKey: {
        requestId: `update_${Date.now()}`
      }
    };

    return this.makeRequest(`/${locationResource}`, {
      method: 'PATCH',
      body: JSON.stringify(gmbLocationData),
    });
  }

  /**
   * Create a new post
   */
  async createPost(post: GMBPost): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    const gmbPostData = {
      languageCode: 'en-US',
      summary: post.content,
      callToAction: {
        actionType: this.mapCallToActionType(post.callToAction.type),
        url: post.callToAction.url,
      },
      media: post.media ? [{
        mediaFormat: post.media.type,
        sourceUrl: post.media.url,
        locationAssociation: {
          category: 'ADDITIONAL'
        }
      }] : undefined,
      topicType: this.mapPostTypeToTopic(post.type),
    };

    return this.makeRequest(`/${locationResource}/localPosts`, {
      method: 'POST',
      body: JSON.stringify(gmbPostData),
    });
  }

  /**
   * Get business reviews
   */
  async getReviews(pageSize: number = 50): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    return this.makeRequest(`/${locationResource}/reviews?pageSize=${pageSize}`);
  }

  /**
   * Reply to a review
   */
  async replyToReview(reviewName: string, reply: string): Promise<GMBApiResponse<any>> {
    return this.makeRequest(`/${reviewName}/reply`, {
      method: 'PUT',
      body: JSON.stringify({
        comment: reply
      }),
    });
  }

  /**
   * Get Q&A questions
   */
  async getQuestions(pageSize: number = 50): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    return this.makeRequest(`/${locationResource}/questions?pageSize=${pageSize}`);
  }

  /**
   * Answer a Q&A question
   */
  async answerQuestion(questionName: string, answer: string): Promise<GMBApiResponse<any>> {
    return this.makeRequest(`/${questionName}/answers`, {
      method: 'POST',
      body: JSON.stringify({
        text: answer,
        author: {
          type: 'MERCHANT'
        }
      }),
    });
  }

  /**
   * Get location insights/metrics
   */
  async getInsights(startDate: Date, endDate: Date): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    const params = new URLSearchParams({
      'basicRequest.timeRange.startTime': startDate.toISOString(),
      'basicRequest.timeRange.endTime': endDate.toISOString(),
      'basicRequest.metricRequests': JSON.stringify([
        { metric: 'QUERIES_DIRECT' },
        { metric: 'QUERIES_INDIRECT' },
        { metric: 'VIEWS_MAPS' },
        { metric: 'VIEWS_SEARCH' },
        { metric: 'ACTIONS_WEBSITE' },
        { metric: 'ACTIONS_PHONE' },
        { metric: 'ACTIONS_DRIVING_DIRECTIONS' },
        { metric: 'PHOTOS_VIEWS_MERCHANT' },
        { metric: 'PHOTOS_VIEWS_CUSTOMERS' },
        { metric: 'PHOTOS_COUNT_MERCHANT' },
        { metric: 'PHOTOS_COUNT_CUSTOMERS' }
      ])
    });

    return this.makeRequest(`/${locationResource}/reportInsights?${params}`);
  }

  /**
   * Upload media to GMB
   */
  async uploadMedia(mediaData: {
    type: 'PHOTO' | 'VIDEO';
    category: string;
    file: Buffer;
    mimeType: string;
    description?: string;
  }): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    // First, start the upload
    const uploadResponse = await this.makeRequest(`/${locationResource}/media`, {
      method: 'POST',
      body: JSON.stringify({
        mediaFormat: mediaData.type,
        locationAssociation: {
          category: mediaData.category
        },
        description: mediaData.description
      }),
    });

    if (!uploadResponse.success) {
      return uploadResponse;
    }

    // Then upload the actual file (implementation depends on upload URL format)
    // This is a simplified version - actual implementation may vary
    return uploadResponse;
  }

  /**
   * Get business attributes
   */
  async getAttributes(): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    return this.makeRequest(`/${locationResource}/attributes`);
  }

  /**
   * Update business attributes
   */
  async updateAttributes(attributes: Array<{ attributeId: string; value: any }>): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    return this.makeRequest(`/${locationResource}/attributes`, {
      method: 'PATCH',
      body: JSON.stringify({
        attributes: attributes.map(attr => ({
          attributeId: attr.attributeId,
          values: [attr.value]
        }))
      }),
    });
  }

  /**
   * Helper methods
   */
  private convertHoursToGMBFormat(hours: any) {
    const dayMap = {
      'monday': 'MONDAY',
      'tuesday': 'TUESDAY',
      'wednesday': 'WEDNESDAY',
      'thursday': 'THURSDAY',
      'friday': 'FRIDAY',
      'saturday': 'SATURDAY',
      'sunday': 'SUNDAY'
    };

    return Object.entries(hours).map(([day, time]) => {
      if (!time) return null;
      const { open, close } = time as { open: string; close: string };
      
      return {
        openDay: dayMap[day as keyof typeof dayMap],
        openTime: open,
        closeDay: dayMap[day as keyof typeof dayMap],
        closeTime: close
      };
    }).filter(Boolean);
  }

  private mapCallToActionType(type: string): string {
    const mapping = {
      'BOOK': 'BOOK',
      'CALL': 'CALL',
      'ORDER': 'ORDER',
      'SHOP': 'SHOP',
      'SIGN_UP': 'SIGN_UP',
      'WATCH': 'WATCH',
      'LEARN_MORE': 'LEARN_MORE'
    };
    return mapping[type as keyof typeof mapping] || 'LEARN_MORE';
  }

  private mapPostTypeToTopic(type: string): string {
    const mapping = {
      'STANDARD': 'STANDARD',
      'EVENT': 'EVENT',
      'OFFER': 'OFFER',
      'PRODUCT': 'PRODUCT'
    };
    return mapping[type as keyof typeof mapping] || 'STANDARD';
  }

  /**
   * Batch operations for efficiency
   */
  async batchCreatePosts(posts: GMBPost[]): Promise<GMBApiResponse<any[]>> {
    const results = [];
    
    for (const post of posts) {
      const result = await this.createPost(post);
      results.push(result);
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return {
      success: true,
      data: results
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<GMBApiResponse<any>> {
    const locationResource = `accounts/${this.config.accountId}/locations/${this.config.locationId}`;
    
    return this.makeRequest(`/${locationResource}`, {
      method: 'GET',
    });
  }
}

export const gmbApiClient = new GMBApiClient(); 
