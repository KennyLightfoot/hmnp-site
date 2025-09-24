import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookingAutomationService } from '@/lib/booking-automation';
import { Role } from '@prisma/client';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== Role.ADMIN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Await the params in Next.js 15
  const params = await context.params;
  const bookingId = params.id;

  try {
    // Try auto-completion first (this handles all the automation)
    const autoCompleted = await BookingAutomationService.autoCompleteService({
      bookingId: bookingId,
      trigger: 'payment_complete', // Using payment_complete as general completion trigger for admin
      metadata: {
        completedBy: 'admin',
        manual: true,
        adminUserId: session.user.id
      }
    });
    
    if (autoCompleted) {
      return NextResponse.json({ 
        success: true, 
        message: 'Service auto-completed successfully',
        method: 'automatic'
      });
    }

    // If auto-completion didn't work, use manual completion
    const manualCompleted = await BookingAutomationService.manualCompleteService({
      bookingId: bookingId,
      completedById: session.user.id || 'admin',
      manualNotes: 'Manually completed by admin'
    });

    if (manualCompleted) {
      return NextResponse.json({ 
        success: true, 
        message: 'Booking completed manually',
        method: 'manual'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to complete booking' 
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('Error completing booking:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to complete booking: ' + getErrorMessage(error) 
    }, { status: 500 });
  }
}
