import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, LocationType } from '@prisma/client';
import { z } from 'zod';
import * as ghl from '@/lib/ghl';
import crypto from 'crypto';

// Webhook signature verification
function verifyGHLWebhook(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expectedSignature)
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

export async function POST(request: NextRequest) {
  console.log('🔄 GHL Booking Sync: Request received');
  
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any;
    
    if (contentType.includes('application/json')) {
      // Handle JSON payload
      const rawBody = await request.text();
      try {
        body = JSON.parse(rawBody);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON body:', parseError);
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid JSON payload' 
        }, { status: 400 });
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form-encoded data from GHL standard webhook
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
      
      // Convert form data to expected format
      body = {
        contactId: body.contactId,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        serviceName: body.serviceName,
        scheduledDateTime: body.scheduledDateTime,
        locationType: body.locationType || 'CLIENT_SPECIFIED_ADDRESS',
        addressStreet: body.addressStreet,
        addressCity: body.addressCity,
        addressState: body.addressState,
        addressZip: body.addressZip,
        locationNotes: body.locationNotes,
        notes: body.notes,
        specialInstructions: body.specialInstructions,
        numberOfSigners: body.numberOfSigners ? parseInt(body.numberOfSigners) : 1,
        leadSource: body.leadSource || 'GHL_Webhook',
        campaignName: body.campaignName,
        workflowId: body.workflowId,
        triggerSource: body.triggerSource
      };
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Unsupported content type. Use application/json or application/x-www-form-urlencoded' 
      }, { status: 400 });
    }

    // Verify webhook signature if secret is configured
    if (process.env.GHL_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-ghl-signature');
      if (!signature) {
        console.error('❌ Missing webhook signature');
        return NextResponse.json({ 
          success: false, 
          error: 'Missing webhook signature' 
        }, { status: 401 });
      }

      const isValid = verifyGHLWebhook(rawBody, signature, process.env.GHL_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid webhook signature' 
        }, { status: 401 });
      }
    }

    // Validate input data
    const validatedData = ghlBookingSchema.parse(body);
    console.log('✅ GHL Booking Sync: Data validated', {
      contactId: validatedData.contactId,
      serviceName: validatedData.serviceName,
      scheduledDateTime: validatedData.scheduledDateTime
    });

    // Determine service ID
    let serviceId = validatedData.serviceId;
    if (!serviceId) {
      serviceId = getServiceIdFromName(validatedData.serviceName);
      if (!serviceId) {
        console.error('❌ Unknown service name:', validatedData.serviceName);
        return NextResponse.json({ 
          success: false, 
          error: `Unknown service: ${validatedData.serviceName}. Available services: ${Object.keys(SERVICE_NAME_MAP).join(', ')}` 
        }, { status: 400 });
      }
    }

    // Verify service exists in database
    const service = await prisma.service.findUnique({
      where: { id: serviceId, isActive: true },
    });

    if (!service) {
      console.error('❌ Service not found in database:', serviceId);
      return NextResponse.json({ 
        success: false, 
        error: `Service not found: ${serviceId}` 
      }, { status: 404 });
    }

    // Check if booking already exists for this contact and time
    const existingBooking = await prisma.booking.findFirst({
      where: {
        ghlContactId: validatedData.contactId,
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PAYMENT_PENDING, BookingStatus.IN_PROGRESS]
        }
      }
    });

    if (existingBooking) {
      console.log('⚠️ Booking already exists:', existingBooking.id);
      return NextResponse.json({ 
        success: true, 
        bookingId: existingBooking.id,
        message: 'Booking already exists',
        status: 'existing'
      });
    }

    // Calculate pricing
    let finalPrice = validatedData.customPrice || service.basePrice.toNumber();
    let promoDiscount = 0;
    
    if (validatedData.promoCode) {
      // Apply promo code logic here if needed
      console.log('🎫 Promo code provided:', validatedData.promoCode);
    }

    // Determine initial status
    const requiresPayment = service.requiresDeposit && service.depositAmount && service.depositAmount.toNumber() > 0;
    const initialStatus = requiresPayment ? BookingStatus.PAYMENT_PENDING : BookingStatus.CONFIRMED;

    // Create booking
    const newBooking = await prisma.booking.create({
      data: {
        service: { connect: { id: service.id } },
        ghlContactId: validatedData.contactId,
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        status: initialStatus,
        locationType: validatedData.locationType as LocationType,
        addressStreet: validatedData.addressStreet,
        addressCity: validatedData.addressCity,
        addressState: validatedData.addressState,
        addressZip: validatedData.addressZip,
        locationNotes: validatedData.locationNotes,
        priceAtBooking: service.basePrice,
        notes: validatedData.notes,
        specialInstructions: validatedData.specialInstructions,
        numberOfSigners: validatedData.numberOfSigners,
        // Store GHL workflow metadata
        leadSource: validatedData.leadSource,
        campaignName: validatedData.campaignName,
        utmSource: validatedData.utmSource,
        utmMedium: validatedData.utmMedium,
        utmCampaign: validatedData.utmCampaign,
        workflowId: validatedData.workflowId,
        triggerSource: validatedData.triggerSource,
      },
      include: {
        service: true
      }
    });

    console.log('✅ Booking created successfully:', newBooking.id);

    // Update GHL contact with booking information
    try {
      const ghlUpdateTags = [`Status:Booking_${initialStatus}`, `Service:${service.name.replace(/\s+/g, '_')}`];
      
      if (initialStatus === BookingStatus.PAYMENT_PENDING) {
        ghlUpdateTags.push('Action:Payment_Required');
      }

      await ghl.addTagsToContact(validatedData.contactId, ghlUpdateTags);
      console.log('✅ GHL contact updated with tags:', ghlUpdateTags);

      // Update custom fields if available
      try {
        const customFieldsToUpdate = {
          'cf_booking_id': newBooking.id,
          'cf_booking_status': initialStatus,
          'cf_service_name': service.name,
          'cf_service_date': validatedData.scheduledDateTime,
          'cf_service_price': finalPrice.toString(),
          'cf_number_of_signers': validatedData.numberOfSigners.toString(),
        };

        const contactUpdatePayload = {
          locationId: process.env.GHL_LOCATION_ID!,
          customField: customFieldsToUpdate
        };

        await ghl.upsertContact({ 
          id: validatedData.contactId, 
          ...contactUpdatePayload 
        });
        console.log('✅ GHL contact custom fields updated');
      } catch (customFieldError) {
        console.warn('⚠️ Failed to update GHL custom fields:', customFieldError);
        // Don't fail the booking creation for this
      }

    } catch (ghlError) {
      console.error('❌ Failed to update GHL contact:', ghlError);
      // Don't fail the booking creation for GHL errors
    }

    // Return success response
    return NextResponse.json({
      success: true,
      bookingId: newBooking.id,
      status: initialStatus,
      message: 'Booking created successfully from GHL workflow',
      data: {
        bookingId: newBooking.id,
        serviceName: service.name,
        scheduledDateTime: newBooking.scheduledDateTime,
        status: newBooking.status,
        customerEmail: validatedData.customerEmail,
        customerName: validatedData.customerName,
        finalPrice: finalPrice,
        requiresPayment: requiresPayment,
        depositAmount: service.depositAmount?.toNumber() || 0,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ GHL Booking Sync error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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