import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BookingStatus, LocationType } from '@prisma/client';
import { z } from 'zod';

// Enhanced booking schema for Phase 1
const enhancedBookingSchema = z.object({
  // Service details
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledDateTime: z.string().datetime('Valid datetime is required'),
  
  // Location details
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'PUBLIC_PLACE']).default('CLIENT_SPECIFIED_ADDRESS'),
  addressStreet: z.string().min(1, 'Street address is required'),
  addressCity: z.string().min(1, 'City is required'),
  addressState: z.string().min(2, 'State is required'),
  addressZip: z.string().min(5, 'ZIP code is required'),
  locationNotes: z.string().optional(),
  
  // Multi-signer support
  signers: z.array(z.object({
    name: z.string().min(1, 'Signer name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    role: z.enum(['PRIMARY', 'SECONDARY', 'WITNESS']).default('PRIMARY'),
    notificationPreference: z.enum(['EMAIL', 'SMS', 'BOTH']).default('EMAIL'),
    specialInstructions: z.string().optional(),
  })).min(1, 'At least one signer is required'),
  
  // Additional details
  notes: z.string().optional(),
  promoCode: z.string().optional(),
  urgencyLevel: z.enum(['standard', 'same-day', 'emergency']).default('standard'),
  customInstructions: z.string().optional(),
  
  // Consent
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  smsNotifications: z.boolean().default(true),
  emailUpdates: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = enhancedBookingSchema.parse(body);
    
    // Validate that there's exactly one PRIMARY signer
    const primarySigners = validatedData.signers.filter(s => s.role === 'PRIMARY');
    if (primarySigners.length !== 1) {
      return NextResponse.json(
        { error: 'Exactly one primary signer is required' },
        { status: 400 }
      );
    }
    
    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });
    
    if (!service || !service.active) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      );
    }
    
    // Calculate pricing
    const basePrice = service.price;
    const finalPrice = Number(basePrice);
    
    // Determine booking status
    let bookingStatus: BookingStatus = BookingStatus.CONFIRMED;
    if (service.requiresDeposit) {
      bookingStatus = BookingStatus.PAYMENT_PENDING;
    }
    
    // Create booking with transaction
    const result = await prisma.$transaction(async (tx) => {
              // Create the main booking
        const booking = await tx.booking.create({
          data: {
            serviceId: validatedData.serviceId,
            scheduledDateTime: new Date(validatedData.scheduledDateTime),
            status: bookingStatus,
            
            // Location details
            locationType: validatedData.locationType as LocationType,
            addressStreet: validatedData.addressStreet,
            addressCity: validatedData.addressCity,
            addressState: validatedData.addressState,
            addressZip: validatedData.addressZip,
            locationNotes: validatedData.locationNotes,
            
            // Pricing
            priceAtBooking: basePrice,
            basePrice: Number(basePrice),
            finalPrice: finalPrice,
            promoDiscount: 0,
            depositAmount: service.requiresDeposit ? service.depositAmount : null,
            depositStatus: service.requiresDeposit ? 'PENDING' : 'COMPLETED',
            
            // Enhanced Phase 1 fields
            totalSigners: validatedData.signers.length,
            customInstructions: validatedData.customInstructions,
            notes: validatedData.notes,
            
            // Link to primary signer
            signerId: session?.user?.id,
            signerEmail: primarySigners[0].email,
            signerName: primarySigners[0].name,
            signerPhone: primarySigners[0].phone,
            
            // Tracking
            leadSource: 'Enhanced_Booking_Wizard',
            urgencyLevel: validatedData.urgencyLevel.toUpperCase(),
            
            // Required fields for Prisma
            ghlContactId: `temp-${Date.now()}`, // Will be updated by webhook
          },
        });
      
      // Create booking signers
      const signerPromises = validatedData.signers.map(signer => 
        tx.bookingSigner.create({
          data: {
            bookingId: booking.id,
            signerId: signer.email === session?.user?.email ? session.user.id : null,
            signerName: signer.name,
            signerEmail: signer.email,
            signerPhone: signer.phone,
            signerRole: signer.role,
            notificationPreference: signer.notificationPreference,
            specialInstructions: signer.specialInstructions,
          },
        })
      );
      
      const bookingSigners = await Promise.all(signerPromises);
      
      return { booking, bookingSigners };
    });
    
    return NextResponse.json({
      success: true,
      booking: {
        id: result.booking.id,
        reference: `HMNP-${result.booking.id.slice(-8).toUpperCase()}`,
        status: result.booking.status,
        scheduledDateTime: result.booking.scheduledDateTime,
        totalPrice: finalPrice,
        signers: result.bookingSigners.length,
      },
    });
    
  } catch (error) {
    console.error('Enhanced booking creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create enhanced booking' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve enhanced booking details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch booking with all Phase 1 relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Service: true,
        User_Booking_signerIdToUser: true,
        User_Booking_notaryIdToUser: true,
        PromoCode: true,
        bookingSigners: true,
        bookingDocuments: {
          include: {
            uploadedByUser: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        bookingAddons: {
          include: {
            addon: true
          }
        },
        Payment: true,
        NotificationLog: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
    });
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // TODO: Add authorization check - verify user has access to this booking
    
    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        reference: `HMNP-${booking.id.slice(-8).toUpperCase()}`,
        totalAddonsPrice: booking.bookingAddons.reduce((total, addon) => total + Number(addon.totalPrice), 0),
        primarySigner: booking.bookingSigners.find(s => s.signerRole === 'PRIMARY'),
      },
    });
    
  } catch (error) {
    console.error('Enhanced booking retrieval error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve booking details' },
      { status: 500 }
    );
  }
} 