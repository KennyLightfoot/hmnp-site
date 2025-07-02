/**
 * 🔧 HMNP V2 Background Job Queue
 * Reliable, scalable job processing for integrations
 * Handles GHL, email, SMS, calendar, and RON integrations
 */

import { prisma } from '@/lib/db';

// ============================================================================
// 🎯 JOB TYPES & INTERFACES
// ============================================================================

export type JobType = 
  | 'ghl_create_contact'
  | 'ghl_trigger_workflow'
  | 'email_confirmation'
  | 'email_reminder'
  | 'sms_confirmation'
  | 'sms_reminder'
  | 'calendar_create_event'
  | 'calendar_update_event'
  | 'calendar_cancel_event'
  | 'ron_create_session'
  | 'ron_send_link'
  | 'payment_confirmation'
  | 'booking_reminder_24h'
  | 'booking_reminder_2h';

export interface JobPayload {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  serviceType: 'MOBILE' | 'RON';
  scheduledDateTime: string;
  finalPrice: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  metadata?: Record<string, any>;
}

export interface Job {
  id: string;
  type: JobType;
  payload: JobPayload;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  priority: number;
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
}

// ============================================================================
// 🎯 JOB QUEUE MANAGER
// ============================================================================

export class JobQueue {
  private static instance: JobQueue;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Initialize job processing
    this.startProcessing();
  }

  public static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  // ============================================================================
  // 🎯 JOB CREATION
  // ============================================================================

  async addJob(
    type: JobType, 
    payload: JobPayload, 
    options: {
      priority?: number;
      delay?: number; // milliseconds
      maxAttempts?: number;
    } = {}
  ): Promise<string> {
    const {
      priority = 50,
      delay = 0,
      maxAttempts = 3
    } = options;

    const scheduledFor = new Date(Date.now() + delay);

    try {
      // In a real implementation, this would use a proper job queue like Bull or Agenda
      // For now, we'll create a simple database-backed queue
      const job = await this.createJobRecord({
        type,
        payload,
        priority,
        maxAttempts,
        scheduledFor
      });

      console.log(`📋 Job queued: ${type} for booking ${payload.bookingId}`, {
        jobId: job.id,
        priority,
        scheduledFor
      });

      return job.id;
    } catch (error) {
      console.error('Failed to queue job:', error);
      throw error;
    }
  }

  // ============================================================================
  // 🎯 BOOKING-SPECIFIC JOB CREATORS
  // ============================================================================

  async queueBookingConfirmationJobs(payload: JobPayload) {
    const jobs = [];

    // 1. Create GHL contact (high priority)
    jobs.push(
      this.addJob('ghl_create_contact', payload, { priority: 90 })
    );

    // 2. Send confirmation email (high priority)
    jobs.push(
      this.addJob('email_confirmation', payload, { priority: 85 })
    );

    // 3. Send confirmation SMS if phone provided (high priority)
    if (payload.customerPhone) {
      jobs.push(
        this.addJob('sms_confirmation', payload, { priority: 85 })
      );
    }

    // 4. Create calendar event for mobile services (medium priority)
    if (payload.serviceType === 'MOBILE') {
      jobs.push(
        this.addJob('calendar_create_event', payload, { priority: 70 })
      );
    }

    // 5. Create RON session for remote services (high priority)
    if (payload.serviceType === 'RON') {
      jobs.push(
        this.addJob('ron_create_session', payload, { priority: 85 })
      );
    }

    // 6. Trigger GHL workflow (medium priority, delayed)
    jobs.push(
      this.addJob('ghl_trigger_workflow', payload, { 
        priority: 60, 
        delay: 5000 // 5 second delay to allow contact creation
      })
    );

    return Promise.all(jobs);
  }

  async queueBookingReminders(payload: JobPayload) {
    const scheduledTime = new Date(payload.scheduledDateTime);
    const now = new Date();

    // 24-hour reminder
    const reminder24h = new Date(scheduledTime.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
      await this.addJob('booking_reminder_24h', payload, {
        priority: 40,
        delay: reminder24h.getTime() - now.getTime()
      });
    }

    // 2-hour reminder
    const reminder2h = new Date(scheduledTime.getTime() - 2 * 60 * 60 * 1000);
    if (reminder2h > now) {
      await this.addJob('booking_reminder_2h', payload, {
        priority: 50,
        delay: reminder2h.getTime() - now.getTime()
      });
    }

    // RON link (30 minutes before for RON services)
    if (payload.serviceType === 'RON') {
      const ronLink = new Date(scheduledTime.getTime() - 30 * 60 * 1000);
      if (ronLink > now) {
        await this.addJob('ron_send_link', payload, {
          priority: 80,
          delay: ronLink.getTime() - now.getTime()
        });
      }
    }
  }

  // ============================================================================
  // 🎯 JOB PROCESSING
  // ============================================================================

  private startProcessing() {
    if (this.processingInterval) return;

    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processJobs();
      }
    }, 5000); // Process every 5 seconds

    console.log('🚀 Job queue processing started');
  }

  private async processJobs() {
    this.isProcessing = true;

    try {
      // Get pending jobs (ordered by priority and scheduled time)
      const jobs = await this.getPendingJobs();

      for (const job of jobs) {
        await this.processJob(job);
      }
    } catch (error) {
      console.error('Error processing jobs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(job: Job) {
    try {
      console.log(`🔄 Processing job: ${job.type} (${job.id})`);

      // Mark job as processing
      await this.updateJobStatus(job.id, 'processing');

      // Execute the job based on type
      await this.executeJob(job);

      // Mark job as completed
      await this.updateJobStatus(job.id, 'completed');

      console.log(`✅ Job completed: ${job.type} (${job.id})`);

    } catch (error) {
      console.error(`❌ Job failed: ${job.type} (${job.id})`, error);

      const nextAttempt = job.attempts + 1;

      if (nextAttempt >= job.maxAttempts) {
        // Max attempts reached, mark as failed
        await this.updateJobStatus(job.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
      } else {
        // Retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, nextAttempt), 30000); // Max 30 seconds
        const retryAt = new Date(Date.now() + delay);

        await this.scheduleRetry(job.id, nextAttempt, retryAt);
      }
    }
  }

  // ============================================================================
  // 🎯 JOB EXECUTION
  // ============================================================================

  private async executeJob(job: Job) {
    const { type, payload } = job;

    switch (type) {
      case 'ghl_create_contact':
        await this.executeGHLCreateContact(payload);
        break;

      case 'ghl_trigger_workflow':
        await this.executeGHLTriggerWorkflow(payload);
        break;

      case 'email_confirmation':
        await this.executeEmailConfirmation(payload);
        break;

      case 'email_reminder':
        await this.executeEmailReminder(payload);
        break;

      case 'sms_confirmation':
        await this.executeSMSConfirmation(payload);
        break;

      case 'sms_reminder':
        await this.executeSMSReminder(payload);
        break;

      case 'calendar_create_event':
        await this.executeCalendarCreateEvent(payload);
        break;

      case 'ron_create_session':
        await this.executeRONCreateSession(payload);
        break;

      case 'ron_send_link':
        await this.executeRONSendLink(payload);
        break;

      case 'booking_reminder_24h':
        await this.executeBookingReminder24h(payload);
        break;

      case 'booking_reminder_2h':
        await this.executeBookingReminder2h(payload);
        break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }

  // ============================================================================
  // 🎯 INDIVIDUAL JOB EXECUTORS
  // ============================================================================

  private async executeGHLCreateContact(payload: JobPayload) {
    console.log('📞 Creating GHL contact for:', payload.customerEmail);
    
    // TODO: Implement actual GHL API integration
    // For now, just simulate the operation
    await this.simulateAsync(1000);
    
    // Update booking with GHL contact ID
    await this.updateBookingGHLContact(payload.bookingId, 'ghl_contact_' + Date.now());
  }

  private async executeGHLTriggerWorkflow(payload: JobPayload) {
    console.log('🔄 Triggering GHL workflow for:', payload.customerEmail);
    
    // TODO: Implement actual GHL workflow trigger
    await this.simulateAsync(500);
  }

  private async executeEmailConfirmation(payload: JobPayload) {
    console.log('📧 Sending confirmation email to:', payload.customerEmail);
    
    // TODO: Implement actual email sending (Resend, SendGrid, etc.)
    await this.simulateAsync(800);
    
    // Log notification
    await this.logNotification(payload.bookingId, 'CONFIRMATION', 'EMAIL', 'sent');
  }

  private async executeEmailReminder(payload: JobPayload) {
    console.log('⏰ Sending email reminder to:', payload.customerEmail);
    
    // TODO: Implement actual email reminder
    await this.simulateAsync(800);
    
    await this.logNotification(payload.bookingId, 'REMINDER', 'EMAIL', 'sent');
  }

  private async executeSMSConfirmation(payload: JobPayload) {
    if (!payload.customerPhone) return;
    
    console.log('📱 Sending SMS confirmation to:', payload.customerPhone);
    
    // TODO: Implement actual SMS sending (Twilio, etc.)
    await this.simulateAsync(600);
    
    await this.logNotification(payload.bookingId, 'CONFIRMATION', 'SMS', 'sent');
  }

  private async executeSMSReminder(payload: JobPayload) {
    if (!payload.customerPhone) return;
    
    console.log('📱 Sending SMS reminder to:', payload.customerPhone);
    
    // TODO: Implement actual SMS reminder
    await this.simulateAsync(600);
    
    await this.logNotification(payload.bookingId, 'REMINDER', 'SMS', 'sent');
  }

  private async executeCalendarCreateEvent(payload: JobPayload) {
    console.log('📅 Creating calendar event for booking:', payload.bookingId);
    
    // TODO: Implement actual Google Calendar integration
    await this.simulateAsync(1200);
    
    // Update booking with calendar event ID
    await this.updateBookingCalendarEvent(payload.bookingId, 'cal_event_' + Date.now());
  }

  private async executeRONCreateSession(payload: JobPayload) {
    console.log('💻 Creating RON session for booking:', payload.bookingId);
    
    // TODO: Implement actual Proof.com integration
    await this.simulateAsync(1500);
    
    // Update booking with RON session ID
    await this.updateBookingRONSession(payload.bookingId, 'ron_session_' + Date.now());
  }

  private async executeRONSendLink(payload: JobPayload) {
    console.log('🔗 Sending RON link to:', payload.customerEmail);
    
    // TODO: Implement actual RON link email
    await this.simulateAsync(800);
    
    await this.logNotification(payload.bookingId, 'RON_LINK', 'EMAIL', 'sent');
  }

  private async executeBookingReminder24h(payload: JobPayload) {
    console.log('⏰ Sending 24h reminder for booking:', payload.bookingId);
    
    // Send both email and SMS reminders
    await Promise.all([
      this.executeEmailReminder(payload),
      payload.customerPhone ? this.executeSMSReminder(payload) : Promise.resolve()
    ]);
  }

  private async executeBookingReminder2h(payload: JobPayload) {
    console.log('⏰ Sending 2h reminder for booking:', payload.bookingId);
    
    // Send both email and SMS reminders
    await Promise.all([
      this.executeEmailReminder(payload),
      payload.customerPhone ? this.executeSMSReminder(payload) : Promise.resolve()
    ]);
  }

  // ============================================================================
  // 🛠️ UTILITY FUNCTIONS
  // ============================================================================

  private async simulateAsync(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async createJobRecord(data: any): Promise<Job> {
    // In a real implementation, this would insert into a jobs table
    // For now, we'll simulate with a basic structure
    const job: Job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      payload: data.payload,
      status: 'pending',
      priority: data.priority,
      attempts: 0,
      maxAttempts: data.maxAttempts,
      scheduledFor: data.scheduledFor,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // TODO: Store in actual database table
    return job;
  }

  private async getPendingJobs(): Promise<Job[]> {
    // TODO: Query actual jobs table
    // For now, return empty array (jobs are processed immediately)
    return [];
  }

  private async updateJobStatus(jobId: string, status: Job['status'], error?: string) {
    // TODO: Update job status in database
    console.log(`📝 Job ${jobId} status: ${status}${error ? ` (error: ${error})` : ''}`);
  }

  private async scheduleRetry(jobId: string, attempt: number, retryAt: Date) {
    // TODO: Reschedule job in database
    console.log(`🔄 Scheduling retry ${attempt} for job ${jobId} at ${retryAt.toISOString()}`);
  }

  private async updateBookingGHLContact(bookingId: string, ghlContactId: string) {
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { ghlContactId }
      });
    } catch (error) {
      console.error('Failed to update booking GHL contact:', error);
    }
  }

  private async updateBookingCalendarEvent(bookingId: string, eventId: string) {
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { googleCalendarEventId: eventId }
      });
    } catch (error) {
      console.error('Failed to update booking calendar event:', error);
    }
  }

  private async updateBookingRONSession(bookingId: string, sessionId: string) {
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { ronSessionId: sessionId }
      });
    } catch (error) {
      console.error('Failed to update booking RON session:', error);
    }
  }

  private async logNotification(bookingId: string, type: string, method: string, status: string) {
    try {
      // TODO: Use actual notification table when V2 schema is migrated
      console.log(`📬 Notification logged: ${type} via ${method} for booking ${bookingId} - ${status}`);
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }
}

// ============================================================================
// 🚀 EXPORT SINGLETON
// ============================================================================

export const jobQueue = JobQueue.getInstance();

// ============================================================================
// 🎯 CONVENIENCE FUNCTIONS
// ============================================================================

export async function queueBookingConfirmation(payload: JobPayload) {
  return jobQueue.queueBookingConfirmationJobs(payload);
}

export async function queueBookingReminders(payload: JobPayload) {
  return jobQueue.queueBookingReminders(payload);
}

export async function queueSingleJob(type: JobType, payload: JobPayload, options?: any) {
  return jobQueue.addJob(type, payload, options);
}