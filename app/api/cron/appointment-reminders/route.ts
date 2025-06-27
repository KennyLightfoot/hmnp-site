import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationService, sendAppointmentReminder } from '@/lib/notifications';
import { BookingStatus, NotificationType, NotificationMethod } from '@prisma/client';

// This endpoint will be called by a scheduler (e.g., cron-job.org, Upstash QStash, etc.)
// to send appointment reminders

export async function POST(request: Request) {
  try {
    // Verify the request is from our scheduler (add authorization if needed)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET; // Add this to your environment variables
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get reminder type from URL query parameters instead of request body
    const url = new URL(request.url);
    const reminderType = url.searchParams.get('type') || '24hr';
    
    console.log(`Running appointment reminders job: ${reminderType}`);
    
    // Calculate the time window for reminders
    let hoursFromNow: number;
    let checkField: string;
    
    switch (reminderType) {
      case '24hr':
        hoursFromNow = 24;
        checkField = 'reminder24hrSentAt';
        break;
      case '2hr':
        hoursFromNow = 2;
        checkField = 'reminder2hrSentAt';
        break;
      case '1hr':
        hoursFromNow = 1;
        checkField = 'reminder1hrSentAt';
        break;
      default:
        return NextResponse.json({ error: 'Invalid reminder type' }, { status: 400 });
    }

    const now = new Date();
    const targetTime = new Date(now.getTime() + (hoursFromNow * 60 * 60 * 1000));
    const windowStart = new Date(targetTime.getTime() - (30 * 60 * 1000)); // 30 minutes before
    const windowEnd = new Date(targetTime.getTime() + (30 * 60 * 1000)); // 30 minutes after

    // Find bookings that need reminders and haven't been sent yet
    const bookingsNeedingReminders = await prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.SCHEDULED]
        },
        scheduledDateTime: {
          gte: windowStart,
          lte: windowEnd,
        },
        // Check that the specific reminder hasn't been sent yet
        [checkField]: null,
      },
      include: {
        User_Booking_signerIdToUser: {
          select: { id: true, email: true, name: true },
        },
        Service: {
          select: { name: true },
        },
      },
    });

    console.log(`Found ${bookingsNeedingReminders.length} bookings needing ${reminderType} reminders`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ bookingId: string; error: string }>,
      skipped: 0,
    };

    for (const booking of bookingsNeedingReminders) {
      try {
        results.processed++;

        if (!booking.User_Booking_signerIdToUser?.email || !booking.User_Booking_signerIdToUser?.name) {
          results.failed++;
          results.errors.push({
            bookingId: booking.id,
            error: 'Missing user email or name'
          });
          continue;
        }

        // Use the new notification service to send reminder
        const notificationResult = await sendAppointmentReminder(
          booking.id,
          reminderType as '24hr' | '2hr' | '1hr'
        );

        if (notificationResult.success) {
          results.successful++;
          console.log(`${reminderType} reminder sent successfully for booking ${booking.id}`);
          
          // Log which methods were successful
          const successfulMethods = notificationResult.results
            .filter(r => r.success)
            .map(r => r.method)
            .join(', ');
          console.log(`Successful methods for booking ${booking.id}: ${successfulMethods}`);
        } else {
          results.failed++;
          const errorMessages = notificationResult.results
            .filter(r => !r.success && r.error)
            .map(r => `${r.method}: ${r.error}`)
            .join('; ');
          
          results.errors.push({
            bookingId: booking.id,
            error: errorMessages || 'Unknown notification error'
          });
          console.error(`Failed to send ${reminderType} reminder for booking ${booking.id}:`, errorMessages);
        }

      } catch (bookingError: any) {
        results.failed++;
        const errorMessage = `Processing error: ${bookingError.message}`;
        results.errors.push({
          bookingId: booking.id,
          error: errorMessage
        });
        console.error(`Error processing ${reminderType} reminder for booking ${booking.id}:`, bookingError);
      }
    }

    // Additional check for any bookings that might need no-show processing
    if (reminderType === '1hr') {
      await checkForNoShows();
    }

    console.log(`${reminderType} reminders job completed:`, {
      ...results,
      errors: results.errors.length // Don't log full error details in summary
    });

    return NextResponse.json({
      success: true,
      reminderType,
      summary: {
        processed: results.processed,
        successful: results.successful,
        failed: results.failed,
        skipped: results.skipped,
        errorCount: results.errors.length
      },
      errors: results.errors
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in appointment reminders job:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * Check for bookings that may be no-shows (30+ minutes past scheduled time)
 */
async function checkForNoShows() {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - (30 * 60 * 1000));

  try {
    const potentialNoShows = await prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.SCHEDULED, BookingStatus.READY_FOR_SERVICE]
        },
        scheduledDateTime: {
          lte: thirtyMinutesAgo
        },
        noShowCheckPerformedAt: null,
      },
      include: {
        User_Booking_signerIdToUser: {
          select: { email: true, name: true },
        },
        Service: {
          select: { name: true },
        },
      },
    });

    console.log(`Found ${potentialNoShows.length} potential no-shows to check`);

    for (const booking of potentialNoShows) {
      try {
        // Send no-show check notification
        const recipient = {
          email: booking.User_Booking_signerIdToUser?.email || undefined,
          phone: undefined, // Will be fetched from GHL
          firstName: booking.User_Booking_signerIdToUser?.name?.split(' ')[0]
        };

        const content = {
          subject: 'Are you on your way? - Houston Mobile Notary Pros',
          message: `Hi ${recipient.firstName}, we had you scheduled for a notary appointment that was supposed to start ${Math.round((now.getTime() - new Date(booking.scheduledDateTime!).getTime()) / (1000 * 60))} minutes ago. Are you on your way? Please call us to confirm.`,
          metadata: {
            minutesLate: Math.round((now.getTime() - new Date(booking.scheduledDateTime!).getTime()) / (1000 * 60))
          }
        };

        await NotificationService.sendNotification({
          bookingId: booking.id,
          type: NotificationType.NO_SHOW_CHECK,
          recipient,
          content,
          methods: [NotificationMethod.EMAIL, NotificationMethod.SMS]
        });

        console.log(`No-show check sent for booking ${booking.id}`);

      } catch (error: any) {
        console.error(`Error sending no-show check for booking ${booking.id}:`, error);
      }
    }

  } catch (error: any) {
    console.error('Error in no-show check process:', error);
  }
} 