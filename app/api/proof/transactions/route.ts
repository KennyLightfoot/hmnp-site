import { NextRequest, NextResponse } from 'next/server';
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
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, documents = [] } = body;

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

    // Check if Proof transaction already exists
    if (booking.proofTransactionId) {
      return NextResponse.json(
        { error: 'Proof transaction already exists for this booking' }, 
        { status: 409 }
      );
    }

    // Check payment status for paid services
    if (booking.finalPrice > 0 && booking.depositStatus !== 'COMPLETED') {
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
      signers: [{
        email: booking.signerEmail,
        first_name: booking.User_Booking_signerIdToUser?.name?.split(' ')[0] || 'Signer',
        last_name: booking.User_Booking_signerIdToUser?.name?.split(' ').slice(1).join(' ') || '',
        phone: booking.signerPhone ? {
          country_code: '1',
          number: booking.signerPhone.replace(/\D/g, '')
        } : undefined,
        address: booking.addressStreet ? {
          line1: booking.addressStreet,
          city: booking.addressCity || 'Houston',
          state: booking.addressState || 'TX',
          postal: booking.addressZip || '',
          country: 'US'
        } : undefined
      }],
      transaction_name: `HMNP RON - ${booking.service.name}`,
      transaction_type: 'notarization',
      message_to_User_Booking_signerIdToUser: `
Thank you for choosing Houston Mobile Notary Pros for your Remote Online Notarization!

Your notary will guide you through the process, including:
- Identity verification
- Document review and signing
- Notarization with electronic seal

If you have any questions, please contact us at (713) 936-4032.

Best regards,
Houston Mobile Notary Pros Team
      `.trim(),
      external_id: bookingId,
      suppress_email: false, // Let Proof send the invitation email
      documents: documents.length > 0 ? documents : undefined,
      redirect: {
        url: process.env.PROOF_REDIRECT_URL,
        message: process.env.PROOF_REDIRECT_MESSAGE,
        force: process.env.PROOF_FORCE_REDIRECT === 'true'
      }
    };

    // Create transaction with Proof
    const proofTransaction = await proofAPI.createTransaction(proofRequest);

    // Update booking with Proof transaction details
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        proofTransactionId: proofTransaction.id,
        proofAccessLink: proofTransaction.signer_info.transaction_access_link,
        proofStatus: proofTransaction.status,
        status: BookingStatus.READY_FOR_SERVICE,
      }
    });

    logger.info('Proof transaction created successfully', {
      bookingId,
      proofTransactionId: proofTransaction.id,
      userId: (session.user as any).id
    });

    return NextResponse.json({
      success: true,
      proofTransaction: {
        id: proofTransaction.id,
        status: proofTransaction.status,
        accessLink: proofTransaction.signer_info.transaction_access_link
      },
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        proofStatus: updatedBooking.proofStatus
      }
    });

  } catch (error) {
    logger.error('Failed to create Proof transaction:', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to create notarization transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/proof/transactions?bookingId=xxx
 * Get Proof transaction status for a booking
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

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
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' }, 
        { status: 404 }
      );
    }

    if (!booking.proofTransactionId) {
      return NextResponse.json(
        { error: 'No Proof transaction found for this booking' }, 
        { status: 404 }
      );
    }

    // Get latest status from Proof
    const proofTransaction = await proofAPI.getTransaction(booking.proofTransactionId);

    // Update our database with latest status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        proofStatus: proofTransaction.status,
        proofNotarizationRecordId: proofTransaction.notarization_record || booking.proofNotarizationRecordId
      }
    });

    return NextResponse.json({
      proofTransaction: {
        id: proofTransaction.id,
        status: proofTransaction.status,
        detailed_status: proofTransaction.detailed_status,
        accessLink: proofTransaction.signer_info.transaction_access_link,
        documents: proofTransaction.documents,
        notarizationRecord: proofTransaction.notarization_record
      }
    });

  } catch (error) {
    logger.error('Failed to get Proof transaction:', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to get transaction status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 