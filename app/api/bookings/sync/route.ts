import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';
import { BookingStatus, LocationType, Role } from '@prisma/client';
import { z } from 'zod';
import * as ghl from '@/lib/ghl';
import crypto from 'crypto';
import { GoogleCalendarService } from '../../../../lib/google-calendar';

// Webhook signature verification
function verifyGHLWebhook(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    new Uint8Array(Buffer.from(signature.replace('sha256=', ''))),
    new Uint8Array(Buffer.from(expectedSignature))
  );
}

// Input validation schema for GHL booking sync
const ghlBookingSchema = z.object({
  // Customer Information (from GHL contact)
  contactId: z.string().min(1, 'GHL Contact ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  
  // Service Details
  serviceName: z.string().min(1, 'Service name is required'),
  serviceId: z.string().optional(), // Can be derived from serviceName
  scheduledDateTime: z.string().datetime('Valid date/time is required'),
  
  // Location Information
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'OUR_OFFICE', 'REMOTE_ONLINE_NOTARIZATION', 'PUBLIC_PLACE']).default('CLIENT_SPECIFIED_ADDRESS'),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  locationNotes: z.string().optional(),
  
  // Additional Details
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
  numberOfSigners: z.number().min(1).default(1),
  
  // Pricing (optional - will be calculated if not provided)
  customPrice: z.number().optional(),
  promoCode: z.string().optional(),
  
  // GHL Workflow Data
  workflowId: z.string().optional(),
  triggerSource: z.string().optional(),
  
  // Lead Source Tracking
  leadSource: z.string().default('GHL_Workflow'),
  campaignName: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

// Service name to ID mapping
const SERVICE_NAME_MAP: Record<string, string> = {
  'Standard Mobile Notary': 'standard-mobile-notary',
  'Loan Signing Specialist': 'loan-signing-specialist', 
  'Extended Hours Notary': 'extended-hours-notary',
  'Emergency Notary Service': 'emergency-notary-service',
  'Remote Online Notarization': 'remote-online-notarization',
  'Witnessed Document Signing': 'witnessed-document-signing',
  'Apostille Services': 'apostille-services',
  'Power of Attorney': 'power-of-attorney',
  'Real Estate Closing': 'real-estate-closing',
  'Healthcare Directives': 'healthcare-directives',
};

function getServiceIdFromName(serviceName: string): string | null {
  return SERVICE_NAME_MAP[serviceName] || null;
}

// Request validation schema for phone booking creation
const phoneBookingSchema = z.object({
  contactId: z.string().min(1, 'GHL Contact ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required'),
  serviceName: z.string().min(1, 'Service name is required'),
  scheduledDateTime: z.string().datetime('Valid datetime is required'),
  locationType: z.enum(['CLIENT_SPECIFIED_ADDRESS', 'OUR_OFFICE', 'REMOTE_ONLINE_NOTARIZATION', 'PUBLIC_PLACE']).default('CLIENT_SPECIFIED_ADDRESS'),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  notes: z.string().optional(),
  leadSource: z.string().default('Phone_Call')
});

export async function POST(request: NextRequest) {
  console.log('📞 Creating booking from phone call');
  
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    let body: any;
    
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }, { status: 400 });
    }

    // Verify API key for security
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request data
    const validatedData = phoneBookingSchema.parse(body);
    console.log('✅ Phone booking data validated');

    // Check if service exists in our system
    const service = await prisma.service.findFirst({
      where: {
        name: {
          contains: validatedData.serviceName,
          mode: 'insensitive'
        }
      }
    });

    if (!service) {
      console.error(`❌ Service not found: ${validatedData.serviceName}`);
      return NextResponse.json({
        success: false,
        error: `Service '${validatedData.serviceName}' not found in system`
      }, { status: 404 });
    }

    // Check if user exists, create if needed
    let user = await prisma.user.findFirst({
      where: { email: validatedData.customerEmail }
    });

    if (!user) {
      console.log('Creating new user for phone booking');
      user = await prisma.user.create({
        data: {
          email: validatedData.customerEmail,
          name: validatedData.customerName,
          role: 'SIGNER'
        }
      });
    }

    // Build service address
    const serviceAddress = [
      validatedData.addressStreet,
      validatedData.addressCity,
      validatedData.addressState
    ].filter(Boolean).join(', ') || 'Address to be confirmed';

    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        signerId: user.id,
        serviceId: service.id,
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        ghlContactId: validatedData.contactId,
        status: service.requiresDeposit ? BookingStatus.PAYMENT_PENDING : BookingStatus.CONFIRMED,
        depositStatus: service.requiresDeposit ? 'PENDING' : 'COMPLETED',
        priceAtBooking: service.price,
        leadSource: validatedData.leadSource,
        notes: validatedData.notes ? `Phone booking: ${validatedData.notes}` : 'Booking created via phone call',
        locationType: validatedData.locationType,
        addressStreet: validatedData.addressStreet,
        addressCity: validatedData.addressCity,
        addressState: validatedData.addressState
      },
      include: {
        service: true,
        User_Booking_signerIdToUser: true
      }
    });

    console.log(`✅ Phone booking created: ${newBooking.id}`);

    // Generate payment URL if payment is required
    let paymentUrl = null;
    if (service.requiresDeposit) {
      paymentUrl = `${process.env.NEXTAUTH_URL}/checkout/${newBooking.id}`;
      
      // Note: Payment URL can be stored in notes or handled separately
      await prisma.booking.update({
        where: { id: newBooking.id },
        data: { 
          notes: newBooking.notes ? `${newBooking.notes}\nPayment URL: ${paymentUrl}` : `Payment URL: ${paymentUrl}`
        }
      });
    }

    // Update GHL contact with booking information
    try {
      const customFields: Record<string, any> = {
        cf_booking_id: newBooking.id,
        cf_booking_status: newBooking.status,
        cf_service_type: service.name,
        cf_appointment_date: new Date(validatedData.scheduledDateTime).toLocaleDateString('en-US'),
        cf_appointment_time: new Date(validatedData.scheduledDateTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        cf_service_address: serviceAddress,
                  cf_total_amount: service.price.toString(),
        cf_lead_source: validatedData.leadSource
      };

      if (paymentUrl) {
        customFields.cf_payment_url = paymentUrl;
      }

      await ghl.updateContact({
        id: validatedData.contactId,
        customField: customFields,
        locationId: process.env.GHL_LOCATION_ID || ""
      });

      // Add appropriate tags
      const tagsToAdd = [
        'status:booking_created_phone',
        'priority:high_touch',
        `service:${service.name.replace(/\s+/g, '')}`
      ];

      if (service.requiresDeposit) {
        tagsToAdd.push('status:booking_pendingpayment');
      } else {
        tagsToAdd.push('status:booking_confirmed');
      }

      await ghl.addTagsToContact(validatedData.contactId, tagsToAdd);
      
      // Remove the trigger tag
      await ghl.removeTagsFromContact(validatedData.contactId, ['lead:phone_qualified']);

      console.log('✅ GHL contact updated with booking details');
    } catch (ghlError) {
      console.error('❌ Failed to update GHL contact:', ghlError);
      // Don't fail the booking creation for GHL errors
    }

    // Prepare response data
    const responseData = {
      bookingId: newBooking.id,
      serviceName: service.name,
                servicePrice: service.price,
          totalAmount: service.price,
      scheduledDate: new Date(validatedData.scheduledDateTime).toLocaleDateString('en-US'),
      scheduledTime: new Date(validatedData.scheduledDateTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      serviceAddress: serviceAddress,
      status: newBooking.status,
      paymentRequired: service.requiresDeposit,
      paymentUrl: paymentUrl,
      customer: {
        name: user.name,
        email: user.email,
        phone: ''
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Booking created from phone call',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error creating phone booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create booking from phone call',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'GHL Booking Sync endpoint is active',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    availableServices: Object.keys(SERVICE_NAME_MAP)
  });
} 