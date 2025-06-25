import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BookingStatus, LocationType } from '@prisma/client';
import { z } from 'zod';

// Enhanced RON booking schema for Phase 2-B
const ronBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  isRONService: z.boolean().default(false),
  scheduledDateTime: z.string().datetime('Valid datetime is required'),
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'PUBLIC_PLACE', 'REMOTE_ONLINE_NOTARIZATION']),
  
  // RON Identity Verification
  ronIdentityVerification: z.object({
    hasGovernmentId: z.boolean(),
    governmentIdType: z.string().optional(),
    kbaRequired: z.boolean(),
    idDocumentTypes: z.array(z.string()),
    isFirstTimeRON: z.boolean(),
    specialIdRequirements: z.string().optional(),
  }).optional(),
  
  // Location (optional for RON)
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  
  // Signers
  signers: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.enum(['PRIMARY', 'SECONDARY', 'WITNESS']).default('PRIMARY'),
    notificationPreference: z.enum(['EMAIL', 'SMS', 'BOTH']).default('EMAIL'),
  })).min(1),
  
  // Consent
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ronBookingSchema.parse(body);

    // Get service
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify RON requirements
    if (validatedData.isRONService && !validatedData.ronIdentityVerification) {
      return NextResponse.json(
        { error: 'Identity verification required for RON services' },
        { status: 400 }
      );
    }

    // Create booking with RON metadata
    const booking = await prisma.booking.create({
      data: {
        serviceId: validatedData.serviceId,
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        status: service.requiresDeposit ? BookingStatus.PAYMENT_PENDING : BookingStatus.REQUESTED,
        locationType: validatedData.locationType as LocationType,
        addressStreet: validatedData.addressStreet || '',
        addressCity: validatedData.addressCity || '',
        addressState: validatedData.addressState || 'TX',
        addressZip: validatedData.addressZip || '',
        priceAtBooking: service.price,
        finalPrice: service.price,
        totalSigners: validatedData.signers.length,
        signerId: (session.user as any).id,
        signerEmail: validatedData.signers[0].email,
        signerName: validatedData.signers[0].name,
        signerPhone: validatedData.signers[0].phone,
        notes: validatedData.notes,
        leadSource: 'Enhanced_RON_Wizard',
        ghlContactId: `temp-${Date.now()}`,
        depositAmount: service.requiresDeposit ? service.depositAmount : null,
        depositStatus: service.requiresDeposit ? 'PENDING' : 'COMPLETED',
        
        // RON-specific metadata (store as JSON in notes for now)
        ...(validatedData.isRONService && validatedData.ronIdentityVerification ? {
          customInstructions: JSON.stringify({
            isRONService: true,
            identityVerification: validatedData.ronIdentityVerification,
            requiresProofSession: true,
            readyForProof: false // Will be updated after payment
          })
        } : {})
      },
    });

    // Prepare next steps for RON
    let nextSteps = {};
    if (validatedData.isRONService) {
      nextSteps = {
        ronNextSteps: {
          identityVerificationRequired: !validatedData.ronIdentityVerification?.hasGovernmentId,
          kbaRequired: validatedData.ronIdentityVerification?.kbaRequired,
          proofSessionCreated: false,
          expectedFlow: [
            service.requiresDeposit ? 'Complete payment' : 'Payment confirmed',
            validatedData.ronIdentityVerification?.kbaRequired ? 'Complete KBA verification' : 'Prepare government ID',
            'Upload documents',
            'Receive Proof.co session invitation',
            'Join video session with notary'
          ]
        }
      };
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        isRON: validatedData.isRONService,
        finalPrice: booking.finalPrice,
        requiresDeposit: service.requiresDeposit,
        ...nextSteps
      },
    });

  } catch (error) {
    console.error('RON booking creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
