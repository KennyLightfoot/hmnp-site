import { NextResponse } from 'next/server';
import { BookingAutomationService } from '@/lib/booking-automation';
import { prisma } from '@/lib/db';
import { BookingStatus } from '@prisma/client';

/**
 * Cron job to auto-complete services based on scheduled time + duration
 * Should run every 15-30 minutes during business hours
 */
export async function GET(request: Request) {
  try {
    // Verify this is being called by Vercel Cron or authorized source
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running auto-completion check...');

    // Find all bookings that are IN_PROGRESS
    const inProgressBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.IN_PROGRESS,
        scheduledDateTime: {
          not: null
        }
      },
      include: {
        Service: true,
        User_Booking_signerIdToUser: true
      },
      orderBy: {
        scheduledDateTime: 'asc'
      }
    });

    const results = [];
    let completedCount = 0;
    let checkedCount = 0;

    for (const booking of inProgressBookings) {
      checkedCount++;
      
      try {
        const result = await BookingAutomationService.autoCompleteService(booking.id);
        
        results.push({
          bookingId: booking.id,
          clientName: booking.User_Booking_signerIdToUser?.name || 'Unknown',
          scheduledTime: booking.scheduledDateTime,
          result: result
        });

        if (result.completed) {
          completedCount++;
          console.log(`✅ Auto-completed booking ${booking.id} for ${booking.User_Booking_signerIdToUser?.name}`);
        } else {
          console.log(`⏳ Booking ${booking.id} still in progress: ${result.reason}`);
        }

      } catch (error: any) {
        console.error(`Error checking booking ${booking.id}:`, error);
        results.push({
          bookingId: booking.id,
          clientName: booking.User_Booking_signerIdToUser?.name || 'Unknown',
          error: error.message
        });
      }
    }

    console.log(`Completion check complete: ${completedCount}/${checkedCount} bookings auto-completed`);

    return NextResponse.json({
      success: true,
      message: `Auto-completion check complete`,
      stats: {
        totalChecked: checkedCount,
        totalCompleted: completedCount,
        timestamp: new Date().toISOString()
      },
      results: results.length > 0 ? results : undefined
    });

  } catch (error: any) {
    console.error('Error in auto-completion cron job:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 