import type { Job, Worker } from 'bullmq';
import { prisma } from '../db';
import { logger } from '../logger';
import { ghl } from '../ghl';
import { RONService } from '../proof/api';
import { EnhancedBookingService } from '../enhanced-booking-service';
import { createRedisClient } from '../redis';

const QUEUE_NAME = 'booking-processing';

interface BookingJobData {
  bookingId: string;
}

let bookingProcessingQueue: import('bullmq').Queue<BookingJobData> | null = null;

async function getBookingQueue(): Promise<import('bullmq').Queue<BookingJobData> | null> {
  if (bookingProcessingQueue) return bookingProcessingQueue;
  const connection = createRedisClient();
  if (!connection) {
    logger?.warn('Redis (wire) not configured; BullMQ queue disabled');
    return null;
  }
  const { Queue } = await import('bullmq');
  bookingProcessingQueue = new Queue<BookingJobData>(QUEUE_NAME, { connection });
  logger?.info('✅ Booking processing queue initialized');
  return bookingProcessingQueue;
}

export const processBookingJob = async (bookingId: string) => {
  const queue = await getBookingQueue();
  if (!queue) return;
  await queue.add('process-booking', { bookingId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};

if (process?.env?.WORKER_MODE === 'true') {
  const { Worker } = await import('bullmq');
  const connection = createRedisClient();
  if (connection) {
    const worker = new Worker<BookingJobData>(
    QUEUE_NAME,
    async (job: Job<BookingJobData>) => {
      const { bookingId } = job?.data;
      logger?.info(`Processing booking: ${bookingId}`, { bookingId });

      try {
        const booking = await prisma?.booking?.findUnique({
          where: { id: bookingId },
          include: { service: true },
        });

        if (!booking) {
          throw new Error(`Booking not found: ${bookingId}`);
        }

        // 1. GHL Contact and Appointment
        let ghlContactId, ghlAppointmentId;
        try {
          const contact = await ghl?.createContact({
            firstName: booking?.customerName?.split(' ')[0] || '',
            lastName: booking?.customerName?.split(' ').slice(1).join(' ') || '',
            email: booking?.customerEmail || '',
            phone: '', // Phone field not available in booking model
            source: 'Website Booking',
          });
          ghlContactId = contact?.id;

          const appointment = await ghl?.createAppointment({
            calendarId: booking?.service?.externalCalendarId || '',
            contactId: ghlContactId || '',
            startTime: booking?.scheduledDateTime?.toISOString() || '',
            title: `${booking?.service?.name || ''} - ${booking?.customerName || ''}`,
          });
          ghlAppointmentId = appointment?.id;
        } catch (error) {
          logger?.error('GHL integration failed', { bookingId, error });
        }

        // 2. Proof?.com RON Session
        let proofTransaction;
        if (booking?.service?.serviceType === 'RON_SERVICES') {
          try {
            proofTransaction = await RONService?.createRONSession({
              id: booking?.id || '',
              customerName: booking?.customerName || '',
              customerEmail: booking?.customerEmail || '',
              customerPhone: '', // Phone field not available in booking model
              documentTypes: ['General Document'],
              scheduledDateTime: booking?.scheduledDateTime || new Date(),
            });

            if (proofTransaction?.id) {
              await prisma?.booking?.update({
                where: { id: booking?.id },
                data: {
                  proofSessionUrl: proofTransaction?.sessionUrl,
                  kbaStatus: `proof_transaction:${proofTransaction?.id}`,
                  idVerificationStatus: proofTransaction?.status,
                },
              });
            }
          } catch (error) {
            logger?.error('Proof?.com integration failed', { bookingId, error });
          }
        }

        // 3. Enhanced Booking Service (Email and Calendar)
        try {
          await EnhancedBookingService?.processBooking({
            bookingId: booking?.id || '',
            customerEmail: booking?.customerEmail || '',
            customerName: booking?.customerName || '',
            serviceType: booking?.service?.serviceType?.toString() || '',
            serviceName: booking?.service?.name || '',
            scheduledDateTime: booking?.scheduledDateTime || new Date(),
            addressStreet: booking?.addressStreet || '',
            addressCity: booking?.addressCity || '',
            addressState: booking?.addressState || '',
            addressZip: booking?.addressZip || '',
            numberOfSigners: 1, // Default value since property doesn't exist on booking model
            numberOfDocuments: 1, // Default value since property doesn't exist on booking model
            totalAmount: booking?.priceAtBooking?.toNumber() || 0,
            paymentStatus: booking?.depositStatus || '',
            bookingManagementLink: `${process?.env?.NEXT_PUBLIC_APP_URL}/booking/${booking?.id || ''}`,
            metadata: {
              ...(proofTransaction?.id && { proofTransactionId: proofTransaction?.id }),
              ...(ghlContactId && { ghlContactId }),
              ...(ghlAppointmentId && { ghlAppointmentId }),
            },
          });
        } catch (error) {
          logger?.error('Enhanced booking service failed', { bookingId, error });
        }

        logger?.info(`✅ Successfully processed booking: ${bookingId}`, { bookingId });
      } catch (error) {
        logger?.error(`❌ Failed to process booking: ${bookingId}`, { bookingId, error });
        throw error;
      }
    },
    { connection }
  );

    worker?.on('failed', (job, err) => {
      logger?.error(`Booking processing job ${job?.id} failed: ${err?.message}`, { jobId: job?.id, error: err });
    });
  } else {
    logger?.warn('WORKER_MODE enabled but no Redis (wire) configured; worker not started');
  }
} 