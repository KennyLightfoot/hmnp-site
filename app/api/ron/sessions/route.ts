import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Role, BookingStatus, LocationType } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Authorization Check
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  try {
    // 2. Parse Request Body (if needed for additional session parameters)
    const body = await request.json();
    const { serviceId, notes } = body;

    // 3. Find or create a RON service
    let ronService = await prisma.service.findFirst({
      where: { 
        serviceType: 'SPECIALTY_NOTARY',
        name: { contains: 'Remote Online Notarization' }
      }
    });

    if (!ronService) {
      ronService = await prisma.service.create({
        data: {
          name: 'Remote Online Notarization',
          serviceType: 'SPECIALTY_NOTARY',
          durationMinutes: 60,
          basePrice: 50.00,
          isActive: true,
          requiresDeposit: true,
          depositAmount: 25.00
        }
      });
    }

    // 4. Create New RON Booking (instead of NotarizationSession)
    const newRonBooking = await prisma.booking.create({
      data: {
        signerId: userId,
        serviceId: serviceId || ronService.id,
        status: BookingStatus.REQUESTED, // Maps from PENDING_CONFIRMATION
        locationType: LocationType.REMOTE_ONLINE_NOTARIZATION,
        priceAtBooking: ronService.basePrice,
        depositAmount: ronService.depositAmount,
        notes: notes || 'Remote Online Notarization session',
        // RON sessions don't have a specific scheduled time initially
        // scheduledDateTime will be set when notary is assigned
      },
      include: {
        service: true,
        NotarizationDocument: true
      }
    });

    return NextResponse.json(newRonBooking, { status: 201 });

  } catch (error) {
    console.error('Failed to create RON session:', error);
    return NextResponse.json({ error: 'Failed to create RON session.' }, { status: 500 });
  }
}
