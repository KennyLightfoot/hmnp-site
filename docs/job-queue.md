# Job Queue System

This document explains the background job queue system implemented for Houston Mobile Notary Pros.

## Overview

The job queue system uses [Upstash Queue](https://docs.upstash.com/queue) to handle background processing tasks like:

- Sending notifications (emails, SMS)
- Processing booking updates
- Handling payment processing tasks

The system is designed to be serverless-friendly, working seamlessly with Vercel's environment.

## Architecture

The job queue system consists of:

1. **Queue Configuration** (`lib/queue/config.ts`):
   - Configures separate queues for notifications, booking processing, and payments
   - Uses environment variables for Upstash connection details

2. **Queue Client** (`lib/queue/client.ts`):
   - Handles job enqueuing
   - Provides convenience methods for different job types

3. **Queue Worker** (`lib/queue/worker.ts`):
   - Processes jobs from each queue
   - Implements retry logic and error handling

4. **Queue Types** (`lib/queue/types.ts`):
   - Defines TypeScript interfaces for job data
   - Ensures type safety across the system

5. **Queue Scheduler** (`lib/schedulers/queueScheduler.ts`):
   - Periodically triggers job processing
   - Integrates with existing scheduler system

6. **Queue API** (`app/api/queue/route.ts`):
   - Provides HTTP endpoints to enqueue and process jobs
   - Secured with authentication

## Usage Examples

### Enqueuing a Notification Job

```typescript
import { getQueueClient } from '@/lib/queue';

// Get queue client singleton
const queueClient = getQueueClient();

// Enqueue a notification
await queueClient.enqueueNotification({
  bookingId: '123',
  templateId: 'booking_confirmation',
  notificationType: NotificationType.BOOKING_CONFIRMATION,
  recipientId: 'user@example.com'
});
```

### Enqueuing a Booking Processing Job

```typescript
import { getQueueClient } from '@/lib/queue';

const queueClient = getQueueClient();

// Process booking update
await queueClient.enqueueBookingProcessing({
  bookingId: '123',
  action: 'update',
  data: { status: BookingStatus.CONFIRMED }
});
```

### Manually Processing Jobs

```typescript
import { getQueueWorker } from '@/lib/queue';

const queueWorker = getQueueWorker();

// Process all pending jobs
const result = await queueWorker.processPendingJobs();
console.log(`Processed ${result.processed} jobs with ${result.errors} errors`);
```

## API Endpoints

The queue system exposes these API routes:

- `POST /api/queue?action=enqueue` - Add a new job to a queue
- `GET /api/queue?action=process` - Process all pending jobs
- `GET /api/queue?action=process&jobId=123` - Process a specific job

All endpoints require authentication:
- `Authorization: Bearer ${process.env.CRON_SECRET}`
- `Authorization: Bearer ${process.env.ADMIN_API_KEY}`

## Environment Variables

Required environment variables:

```
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
CRON_SECRET=your-secret-for-cron-jobs
ADMIN_API_KEY=your-admin-key
```

## Cron Jobs

The system is configured to run job processing every 2 minutes via Vercel cron jobs.
This can be adjusted in the `vercel.json` file.

## Extending the System

To add a new job type:

1. Update `types.ts` with the new job interface
2. Add queue creation in `config.ts`
3. Implement processing logic in `worker.ts`
4. Add convenience methods in `client.ts`

## Error Handling and Retries

Failed jobs are automatically retried with exponential backoff:
- First retry: 30 seconds
- Second retry: 2 minutes
- Third retry: 10 minutes
- Final retry: 30 minutes

After four failures, jobs are logged as permanently failed.

## Logging

All queue operations are logged using Winston logger. Check server logs for:
- Job enqueuing events
- Job processing results
- Processing errors and retry attempts
