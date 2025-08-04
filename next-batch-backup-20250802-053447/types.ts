/**
 * Job type definitions for the queue system
 */

// Basic job interface that all job types extend
export interface Job {
  id?: string;        // Unique job ID (assigned by queue)
  type: string;       // Job type identifier
  priority?: number;  // Optional priority (higher = more priority)
  maxRetries?: number; // Maximum retry attempts
  retryCount?: number; // Current retry count
  createdAt?: Date;   // When the job was created
}

// Notification job for sending emails, SMS, etc.
export interface NotificationJob extends Job {
  type: 'notification';
  notificationType: string;
  recipientId?: string;
  bookingId?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  subject?: string;
  message?: string;
  scheduledFor?: Date;
}

// Booking processing job for handling booking state changes
export interface BookingProcessingJob extends Job {
  type: 'booking-processing';
  bookingId: string;
  action: 'confirm' | 'cancel' | 'reschedule' | 'reminder' | 'follow-up' | 'payment-check';
  metadata?: Record<string, any>;
}

// Payment processing job
export interface PaymentProcessingJob extends Job {
  type: 'payment-processing';
  paymentId?: string;
  bookingId?: string;
  action: 'create' | 'capture' | 'refund' | 'check-status';
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

// Union type of all job types
export type QueueJob = NotificationJob | BookingProcessingJob | PaymentProcessingJob;

// Job result interface
export interface JobResult {
  success: boolean;
  jobId: string;
  processedAt: Date;
  error?: string;
  result?: any;
}
