import { NextResponse } from 'next/server';
import { BookingAutomationService } from '@/lib/booking-automation';

// This endpoint will be called by a scheduler (e.g., cron-job.org)
// to process booking status automation

export async function POST(request: Request) {
  try {
    // Verify the request is from our scheduler
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running booking automation job...');
    const startTime = Date.now();

    // Process all booking status updates
    const results = await BookingAutomationService.processAllBookingStatusUpdates();
    
    const duration = Date.now() - startTime;
    
    console.log('Booking automation job completed:', {
      duration: `${duration}ms`,
      processed: results.processed,
      updated: results.updated,
      errorCount: results.errors.length
    });

    // Log errors if any
    if (results.errors.length > 0) {
      console.error('Booking automation errors:', results.errors);
    }

    return NextResponse.json({
      success: true,
      results: {
        processed: results.processed,
        updated: results.updated,
        errorCount: results.errors.length,
        duration: `${duration}ms`
      },
      errors: results.errors
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in booking automation job:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 