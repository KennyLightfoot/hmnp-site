import { NextResponse } from 'next/server';
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
    const autoResult = await BookingAutomationService.autoCompleteService(bookingId);
    
    if (autoResult.success && autoResult.completed) {
      return NextResponse.json({ 
        success: true, 
        message: `Service auto-completed: ${autoResult.reason}`,
        method: 'automatic'
      });
    }

    // If auto-completion didn't work, use manual completion
    const manualResult = await BookingAutomationService.manualCompleteService(
      bookingId, 
      session.user.name || 'Admin'
    );

    if (manualResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: manualResult.message,
        method: 'manual'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: manualResult.message 
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('Error completing booking:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to complete booking: ' + error.message 
    }, { status: 500 });
  }
}
