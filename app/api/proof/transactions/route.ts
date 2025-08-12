import { NextRequest, NextResponse } from 'next/server';
import { withAPISectionSecurity } from '@/lib/security/comprehensive-security';
import { z } from 'zod';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/database-connection';
import { proofAPI, CreateTransactionRequest } from '@/lib/proof/api';
import { logger } from '@/lib/logger';
import { LocationType, BookingStatus } from '@prisma/client';

/**
 * POST /api/proof/transactions
 * Create a new Proof notarization transaction
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const postSchema = z.object({ bookingId: z.string().min(1), documents: z.array(z.any()).optional() });

export const POST = withAPISectionSecurity(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = postSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { bookingId, documents = [] } = parsed.data as any;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' }, 
        { status: 400 }
      );
    }

    // Get the booking and verify access
    const booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        signerId: (session.user as any).id
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: true,
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' }, 
        { status: 404 }
      );
    }

    // Check if booking is RON type
    if (booking.locationType !== LocationType.REMOTE_ONLINE_NOTARIZATION) {
      return NextResponse.json(
        { error: 'Booking is not a Remote Online Notarization' }, 
        { status: 400 }
      );
    }

    // Check if Proof session already exists
    if (booking.proofSessionUrl) {
      return NextResponse.json(
        { error: 'Proof session already exists for this booking' }, 
        { status: 409 }
      );
    }

    // Check payment status for paid services
    if (Number(booking.priceAtBooking) > 0 && booking.depositStatus !== 'COMPLETED') {
      return NextResponse.json(
        { 
          error: 'Payment required before starting RON session',
          paymentRequired: true,
          paymentUrl: booking.stripePaymentUrl
        }, 
        { status: 402 }
      );
    }

    // Create Proof transaction request
    const proofRequest: CreateTransactionRequest = {
      title: `RON Session - ${booking.service?.name || 'Notary Service'}`,
      signers: [{
        name: booking.User_Booking_signerIdToUser?.name || 'Signer',
        email: booking.User_Booking_signerIdToUser?.email || booking.customerEmail || '',
        phone: booking.customerEmail ? booking.customerEmail.replace(/\D/g, '') : undefined,
        role: 'signer' as const,
        // Note: address field not supported in ProofSigner interface
      }],
      // Remove the message_to_User_Booking_signerIdToUser property since it doesn't exist in the type
      // message_to_User_Booking_signerIdToUser: `Thank you for choosing Houston Mobile Notary Pros...`,
      // Remove the external_id property since it doesn't exist in the type
      suppress_email: false, // Let Proof send the invitation email
      documents: documents.length > 0 ? documents : undefined,
      // Remove the redirect property since it doesn't exist in the type
      // redirect: `${process.env.NEXT_PUBLIC_BASE_URL}/ron/session/${bookingId}`,
    };

    // Create transaction with Proof
    const proofTransaction = await proofAPI.createTransaction(proofRequest);

    // Update booking with Proof session details
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        proofSessionUrl: proofTransaction?.sessionUrl || proofTransaction?.id,
        status: BookingStatus.READY_FOR_SERVICE,
      }
    });

    logger.info('Proof session created successfully', {
      bookingId,
      proofSessionUrl: proofTransaction?.sessionUrl || proofTransaction?.id,
      userId: (session.user as any).id
    });

    return NextResponse.json({
      success: true,
      proofTransaction: {
        id: proofTransaction?.id,
        status: proofTransaction?.status,
        accessLink: proofTransaction?.sessionUrl || proofTransaction?.id
      },
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        proofSessionUrl: updatedBooking.proofSessionUrl
      }
    });

  } catch (error) {
    logger.error('Failed to create Proof transaction:', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to create notarization transaction',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
})

/**
 * GET /api/proof/transactions?bookingId=xxx
 * Get Proof transaction status for a booking
 */
const getSchema = z.object({ bookingId: z.string().min(1) });

export const GET = withAPISectionSecurity(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const parsed = getSchema.safeParse({ bookingId });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get the booking and verify access
    const booking = await prisma.booking.findUnique({
      where: { 
        id: bookingId,
        signerId: (session.user as any).id
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' }, 
        { status: 404 }
      );
    }

    if (!booking.proofSessionUrl) {
      return NextResponse.json(
        { error: 'No Proof session found for this booking' }, 
        { status: 404 }
      );
    }

    // Get latest status from Proof
    const proofTransaction = await proofAPI.getTransaction(booking.proofSessionUrl);

    // Update our database with latest status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        // Note: proofStatus and proofNotarizationRecordId don't exist on Booking model
        // We'll just update the session URL if needed
        proofSessionUrl: proofTransaction?.sessionUrl || booking.proofSessionUrl
      }
    });

    return NextResponse.json({
      proofTransaction: {
        id: proofTransaction?.id,
        status: proofTransaction?.status,
        accessLink: proofTransaction?.sessionUrl || proofTransaction?.id,
        documents: proofTransaction?.documents || []
      }
    });

  } catch (error) {
    logger.error('Failed to get Proof transaction:', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to get transaction status',
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}) 
