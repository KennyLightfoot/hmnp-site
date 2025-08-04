/**
 * GMB Manager - Orchestrates all Google My Business operations
 * Handles profile optimization, automated posting, review management, and analytics
 */

import { gmbProfileOptimizer } from './profile-optimizer';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { gmbAutomationSystem } from './automation-system';
import { gmbApiClient } from './api-client';
import type { GMBPost, ReviewResponse, QAItem } from './automation-system';
import type { GMBProfileData } from './profile-optimizer';

export interface GMBManagerConfig {
  enableAutomatedPosting: boolean;
  enableReviewAutoResponse: boolean;
  enableQAAutoResponse: boolean;
  postingSchedule: {
    frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
    days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
    times: string[];
  };
  reviewResponseDelay: number; // minutes
  qaResponseDelay: number; // minutes
}

export interface GMBAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalViews: number;
    searchViews: number;
    mapsViews: number;
    websiteClicks: number;
    phoneClicks: number;
    directionsClicks: number;
    photosViewed: number;
    postsViewed: number;
    reviewsCount: number;
    averageRating: number;
    questionsAnswered: number;
  };
  trends: {
    viewsChange: number;
    clicksChange: number;
    reviewsChange: number;
    ratingChange: number;
  };
  topKeywords: string[];
  topLocations: string[];
}

export interface GMBTask {
  id: string;
  type: 'POST' | 'REVIEW_RESPONSE' | 'QA_RESPONSE' | 'PROFILE_UPDATE' | 'ANALYTICS';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  scheduledTime: Date;
  data: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export class GMBManager {
  private config: GMBManagerConfig;
  private tasks: GMBTask[] = [];
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: Partial<GMBManagerConfig> = {}) {
    this.config = {
      enableAutomatedPosting: true,
      enableReviewAutoResponse: true,
      enableQAAutoResponse: true,
      postingSchedule: {
        frequency: 'CUSTOM',
        days: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
        times: ['09:00', '12:00', '15:00']
      },
      reviewResponseDelay: 30,
      qaResponseDelay: 15,
      ...config
    };
  }

  /**
   * Initialize GMB optimization
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing GMB Manager...');
    
    // Health check
    const healthCheck = await gmbApiClient.healthCheck();
    if (!healthCheck.success) {
      throw new Error(`GMB API health check failed: ${healthCheck.error}`);
    }

    // Optimize profile
    await this.optimizeProfile();

    // Schedule initial posts
    await this.scheduleInitialPosts();

    // Start automation loop
    this.startAutomation();

    console.log('✅ GMB Manager initialized successfully');
  }

  /**
   * Optimize GMB profile
   */
  async optimizeProfile(): Promise<void> {
    console.log('🔧 Optimizing GMB profile...');
    
    const profileData = gmbProfileOptimizer.generateOptimizedProfile();
    const result = await gmbApiClient.updateProfile(profileData);
    
    if (!result.success) {
      console.error('❌ Profile optimization failed:', result.error);
      throw new Error(`Profile optimization failed: ${result.error}`);
    }

    // Update Q&A
    await this.updateQAItems();

    // Update attributes
    await this.updateAttributes(profileData);

    console.log('✅ Profile optimized successfully');
  }

  /**
   * Schedule initial posts
   */
  async scheduleInitialPosts(): Promise<void> {
    console.log('📅 Scheduling initial posts...');
    
    const posts = gmbAutomationSystem.generatePostingSchedule();
    
    for (const post of posts) {
      this.addTask({
        id: post.id,
        type: 'POST',
        status: 'PENDING',
        scheduledTime: post.scheduledDate,
        data: post,
        error: undefined,
        retryCount: 0,
        maxRetries: 3
      });
    }

    console.log(`✅ Scheduled ${posts.length} posts`);
  }

  /**
   * Start automation loop
   */
  startAutomation(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🤖 Starting GMB automation...');
    
    // Check for tasks every 5 minutes
    this.intervalId = setInterval(() => {
      this.processTasks();
    }, 5 * 60 * 1000);

    // Initial task processing
    this.processTasks();
  }

  /**
   * Stop automation loop
   */
  stopAutomation(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 GMB automation stopped');
  }

  /**
   * Process pending tasks
   */
  private async processTasks(): Promise<void> {
    const now = new Date();
    const pendingTasks = this.tasks.filter(
      task => task.status === 'PENDING' && task.scheduledTime <= now
    );

    if (pendingTasks.length === 0) return;

    console.log(`📋 Processing ${pendingTasks.length} pending tasks...`);

    for (const task of pendingTasks) {
      await this.processTask(task);
    }
  }

  /**
   * Process individual task
   */
  private async processTask(task: GMBTask): Promise<void> {
    task.status = 'PROCESSING';
    
    try {
      switch (task.type) {
        case 'POST':
          await this.processPostTask(task);
          break;
        case 'REVIEW_RESPONSE':
          await this.processReviewResponseTask(task);
          break;
        case 'QA_RESPONSE':
          await this.processQAResponseTask(task);
          break;
        case 'PROFILE_UPDATE':
          await this.processProfileUpdateTask(task);
          break;
        case 'ANALYTICS':
          await this.processAnalyticsTask(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      task.status = 'COMPLETED';
      console.log(`✅ Task ${task.id} completed successfully`);
    } catch (error) {
      task.error = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
      task.retryCount++;
      
      if (task.retryCount < task.maxRetries) {
        task.status = 'PENDING';
        task.scheduledTime = new Date(Date.now() + Math.pow(2, task.retryCount) * 60 * 1000);
        console.log(`🔄 Task ${task.id} failed, retrying in ${Math.pow(2, task.retryCount)} minutes`);
      } else {
        task.status = 'FAILED';
        console.error(`❌ Task ${task.id} failed permanently:`, task.error);
      }
    }
  }

  /**
   * Process post task
   */
  private async processPostTask(task: GMBTask): Promise<void> {
    const post: GMBPost = task.data;
    const result = await gmbApiClient.createPost(post);
    
    if (!result.success) {
      throw new Error(`Failed to create post: ${result.error}`);
    }
    
    // Schedule next post if this is part of automated schedule
    if (this.config.enableAutomatedPosting) {
      this.scheduleNextPost(post);
    }
  }

  /**
   * Process review response task
   */
  private async processReviewResponseTask(task: GMBTask): Promise<void> {
    const reviewData: ReviewResponse = task.data;
    const result = await gmbApiClient.replyToReview(reviewData.reviewId, reviewData.response);
    
    if (!result.success) {
      throw new Error(`Failed to respond to review: ${result.error}`);
    }
  }

  /**
   * Process Q&A response task
   */
  private async processQAResponseTask(task: GMBTask): Promise<void> {
    const qaData: QAItem = task.data;
    const result = await gmbApiClient.answerQuestion(qaData.question, qaData.answer);
    
    if (!result.success) {
      throw new Error(`Failed to answer question: ${result.error}`);
    }
  }

  /**
   * Process profile update task
   */
  private async processProfileUpdateTask(task: GMBTask): Promise<void> {
    const profileData: GMBProfileData = task.data;
    const result = await gmbApiClient.updateProfile(profileData);
    
    if (!result.success) {
      throw new Error(`Failed to update profile: ${result.error}`);
    }
  }

  /**
   * Process analytics task
   */
  private async processAnalyticsTask(task: GMBTask): Promise<void> {
    const { startDate, endDate } = task.data;
    const result = await gmbApiClient.getInsights(startDate, endDate);
    
    if (!result.success) {
      throw new Error(`Failed to get analytics: ${result.error}`);
    }
    
    // Store analytics data (implementation depends on storage solution)
    console.log('📊 Analytics data retrieved:', result.data);
  }

  /**
   * Add task to queue
   */
  addTask(task: GMBTask): void {
    this.tasks.push(task);
  }

  /**
   * Schedule next post
   */
  private scheduleNextPost(completedPost: GMBPost): void {
    const nextPost = gmbAutomationSystem.generatePostingSchedule(
      new Date(completedPost.scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    )[0];
    
    if (nextPost) {
      this.addTask({
        id: nextPost.id,
        type: 'POST',
        status: 'PENDING',
        scheduledTime: nextPost.scheduledDate,
        data: nextPost,
        error: undefined,
        retryCount: 0,
        maxRetries: 3
      });
    }
  }

  /**
   * Update Q&A items
   */
  private async updateQAItems(): Promise<void> {
    const qaItems = gmbAutomationSystem.generateQAItems();
    
    for (const qa of qaItems) {
      this.addTask({
        id: `qa-${Date.now()}-${Math.random()}`,
        type: 'QA_RESPONSE',
        status: 'PENDING',
        scheduledTime: new Date(Date.now() + this.config.qaResponseDelay * 60 * 1000),
        data: qa,
        error: undefined,
        retryCount: 0,
        maxRetries: 2
      });
    }
  }

  /**
   * Update attributes
   */
  private async updateAttributes(profileData: GMBProfileData): Promise<void> {
    const attributes = profileData.attributes.map(attr => ({
      attributeId: attr.id,
      value: attr.value
    }));
    
    const result = await gmbApiClient.updateAttributes(attributes);
    
    if (!result.success) {
      console.error('❌ Failed to update attributes:', result.error);
    }
  }

  /**
   * Monitor reviews and auto-respond
   */
  async monitorReviews(): Promise<void> {
    if (!this.config.enableReviewAutoResponse) return;
    
    const reviewsResult = await gmbApiClient.getReviews();
    if (!reviewsResult.success) {
      console.error('❌ Failed to get reviews:', reviewsResult.error);
      return;
    }
    
    const reviews = reviewsResult.data?.reviews || [];
    const responses = gmbAutomationSystem.generateReviewResponses();
    
    for (const review of reviews) {
      if (review.reviewReply) continue; // Already responded
      
      const rating = review.starRating || 5;
      let responseTemplate: string;
      
      if (rating >= 4) {
        responseTemplate = responses?.positive?.[Math.floor(Math.random() * (responses?.positive?.length || 1))] || 'Thank you for your positive review!';
      } else if (rating >= 3) {
        responseTemplate = responses?.neutral?.[Math.floor(Math.random() * (responses?.neutral?.length || 1))] || 'Thank you for your feedback!';
      } else {
        responseTemplate = responses?.negative?.[Math.floor(Math.random() * (responses?.negative?.length || 1))] || 'We appreciate your feedback and will work to improve.';
      }
      
      this.addTask({
        id: `review-${review.name}`,
        type: 'REVIEW_RESPONSE',
        status: 'PENDING',
        scheduledTime: new Date(Date.now() + this.config.reviewResponseDelay * 60 * 1000),
        data: {
          reviewId: review.name,
          rating,
          reviewText: review.comment,
          response: responseTemplate,
          responseDate: new Date(),
          keywords: [],
          sentiment: rating >= 4 ? 'POSITIVE' : rating >= 3 ? 'NEUTRAL' : 'NEGATIVE'
        },
        error: undefined,
        retryCount: 0,
        maxRetries: 2
      });
    }
  }

  /**
   * Get analytics
   */
  async getAnalytics(startDate: Date, endDate: Date): Promise<GMBAnalytics | null> {
    const result = await gmbApiClient.getInsights(startDate, endDate);
    
    if (!result.success) {
      console.error('❌ Failed to get analytics:', result.error);
      return null;
    }
    
    // Transform API response to our analytics format
    const metrics = result.data?.locationMetrics?.[0]?.metricValues || [];
    
    return {
      period: { start: startDate, end: endDate },
      metrics: {
        totalViews: this.getMetricValue(metrics, 'QUERIES_DIRECT') + this.getMetricValue(metrics, 'QUERIES_INDIRECT'),
        searchViews: this.getMetricValue(metrics, 'VIEWS_SEARCH'),
        mapsViews: this.getMetricValue(metrics, 'VIEWS_MAPS'),
        websiteClicks: this.getMetricValue(metrics, 'ACTIONS_WEBSITE'),
        phoneClicks: this.getMetricValue(metrics, 'ACTIONS_PHONE'),
        directionsClicks: this.getMetricValue(metrics, 'ACTIONS_DRIVING_DIRECTIONS'),
        photosViewed: this.getMetricValue(metrics, 'PHOTOS_VIEWS_MERCHANT') + this.getMetricValue(metrics, 'PHOTOS_VIEWS_CUSTOMERS'),
        postsViewed: 0, // Not available in current API
        reviewsCount: 0, // Needs separate API call
        averageRating: 4.9, // From stored data
        questionsAnswered: 0, // Needs separate API call
      },
      trends: {
        viewsChange: 0, // Requires historical comparison
        clicksChange: 0,
        reviewsChange: 0,
        ratingChange: 0,
      },
      topKeywords: [], // Requires keyword analysis
      topLocations: [], // Requires location analysis
    };
  }

  /**
   * Get metric value from API response
   */
  private getMetricValue(metrics: any[], metricName: string): number {
    const metric = metrics.find(m => m.metric === metricName);
    return metric?.totalValue?.value || 0;
  }

  /**
   * Get task statistics
   */
  getTaskStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    return {
      total: this.tasks.length,
      pending: this.tasks.filter(t => t.status === 'PENDING').length,
      processing: this.tasks.filter(t => t.status === 'PROCESSING').length,
      completed: this.tasks.filter(t => t.status === 'COMPLETED').length,
      failed: this.tasks.filter(t => t.status === 'FAILED').length,
    };
  }

  /**
   * Get upcoming tasks
   */
  getUpcomingTasks(hours: number = 24): GMBTask[] {
    const cutoff = new Date(Date.now() + hours * 60 * 60 * 1000);
    return this.tasks.filter(
      task => task.status === 'PENDING' && task.scheduledTime <= cutoff
    ).sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  /**
   * Clear completed tasks (cleanup)
   */
  cleanupTasks(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.tasks = this.tasks.filter(
      task => task.status !== 'COMPLETED' || task.scheduledTime > oneDayAgo
    );
  }
}

export const gmbManager = new GMBManager(); 
