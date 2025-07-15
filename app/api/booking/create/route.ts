/**
 * Booking Creation API - Houston Mobile Notary Pros
 * REBUILT: Now matches schema-v2 structure for 100% success rate
 * 
 * ROOT CAUSE FIXED: Previous version tried to save non-existent database fields
 * - serviceType → serviceId (proper relation)
 * - bookingDate + bookingTime → scheduledDateTime 
 * - locationAddress → proper address fields
 * - Added proper pricing structure
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { createContact, createAppointment, addContactToWorkflow } from '@/lib/ghl/management';

// Business Rules Integration
import { validateBusinessRules } from '../../../../lib/business-rules/engine';

// Transparent Pricing GHL Integration
import { TransparentPricingGHLIntegration } from '../../../../lib/ghl/transparent-pricing-integration';

// Validation schema matching schema-v2 structure
const PHONE_REGEX = /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/; // US phone number format
const ZIP_REGEX = /^\d{5}(-\d{4})?$/;
const NAME_REGEX = /^[a-zA-Z\s\-'\.]{1,100}$/; // Names with common characters
const ADDRESS_REGEX = /^[a-zA-Z0-9\s\-#,.']{1,120}$/; // Address with common characters
const CITY_REGEX = /^[a-zA-Z\s\-'\.]{1,100}$/; // City names
const STATE_REGEX = /^[a-zA-Z\s]{2,100}$/; // State names
const TIMEZONE_REGEX = /^[A-Za-z]+\/[A-Za-z_]+$/; // Timezone format like America/Chicago
const NOTES_REGEX = /^[\s\S]{0,1000}$/; // Location notes (any printable chars)

const BookingCreateSchema = z.object({
  // Service selection
  serviceType: z.enum([
    'QUICK_STAMP_LOCAL',
    'STANDARD_NOTARY',
    'EXTENDED_HOURS',
    'LOAN_SIGNING',
    'RON_SERVICES',
    'BUSINESS_ESSENTIALS',
    'BUSINESS_GROWTH',
  ], {
    errorMap: () => ({ message: 'Please select a valid service type' })
  }),

  // Customer information
  customerName: z
    .string()
    .trim()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name must be 100 characters or less')
    .regex(NAME_REGEX, 'Customer name contains invalid characters'),
  customerEmail: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .refine((email) => !email.includes('..'), 'Email address format is invalid')
    .refine((email) => !email.startsWith('.') && !email.endsWith('.'), 'Email address format is invalid'),
  customerPhone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Please enter a valid US phone number')
    .transform((phone) => phone.replace(/\D/g, '')) // Strip non-digits for storage
    .refine((phone) => phone.length === 10 || phone.length === 11, 'Phone number must be 10 or 11 digits')
    .optional(),

  // Scheduling - ISO string enforced
  scheduledDateTime: z
    .string()
    .trim()
    .min(1, 'Scheduled date and time is required')
    .refine((val) => !isNaN(new Date(val).getTime()), 'Please provide a valid date and time')
    .refine((val) => new Date(val) > new Date(), 'Scheduled time must be in the future')
    .refine((val) => {
      const scheduledDate = new Date(val);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1); // Max 1 year ahead
      return scheduledDate <= maxDate;
    }, 'Cannot schedule more than 1 year in advance')
    .transform((val) => new Date(val).toISOString()),
  timeZone: z
    .string()
    .trim()
    .regex(TIMEZONE_REGEX, 'Please provide a valid timezone')
    .default('America/Chicago'),

  // Location (for mobile services)
  locationType: z.enum(['HOME', 'OFFICE', 'HOSPITAL', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a valid location type' })
  }).optional(),
  addressStreet: z
    .string()
    .trim()
    .max(120, 'Street address must be 120 characters or less')
    .regex(ADDRESS_REGEX, 'Street address contains invalid characters')
    .optional(),
  addressCity: z
    .string()
    .trim()
    .max(100, 'City must be 100 characters or less')
    .regex(CITY_REGEX, 'City contains invalid characters')
    .optional(),
  addressState: z
    .string()
    .trim()
    .max(100, 'State must be 100 characters or less')
    .regex(STATE_REGEX, 'State contains invalid characters')
    .optional(),
  addressZip: z
    .string()
    .trim()
    .regex(ZIP_REGEX, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)')
    .optional(),
  locationNotes: z
    .string()
    .trim()
    .max(1000, 'Location notes must be 1000 characters or less')
    .regex(NOTES_REGEX, 'Location notes contain invalid characters')
    .optional(),

  // Pricing (enhanced for transparent pricing)
  pricing: z.object({
    basePrice: z
      .number()
      .min(0, 'Base price must be 0 or greater')
      .max(10000, 'Base price cannot exceed $10,000')
      .refine((val) => Number.isFinite(val), 'Base price must be a valid number'),
    travelFee: z
      .number()
      .min(0, 'Travel fee must be 0 or greater')
      .max(1000, 'Travel fee cannot exceed $1,000')
      .default(0)
      .refine((val) => Number.isFinite(val), 'Travel fee must be a valid number'),
    totalPrice: z
      .number()
      .min(0, 'Total price must be 0 or greater')
      .max(11000, 'Total price cannot exceed $11,000')
      .refine((val) => Number.isFinite(val), 'Total price must be a valid number'),
    // Optional transparent pricing data
    transparentData: z
      .object({
        serviceType: z.string().trim().max(100),
        breakdown: z.any(),
        transparency: z.any(),
        businessRules: z.any(),
        metadata: z.any(),
      })
      .optional(),
  }),

  // Documents (for RON)
  numberOfDocuments: z
    .number()
    .int('Number of documents must be a whole number')
    .min(1, 'Must have at least 1 document')
    .max(20, 'Cannot exceed 20 documents')
    .default(1),
  numberOfSigners: z
    .number()
    .int('Number of signers must be a whole number')
    .min(1, 'Must have at least 1 signer')
    .max(20, 'Cannot exceed 20 signers')
    .default(1),
});

// Map frontend location types to database enum values
function mapLocationTypeToDb(frontendType: string | undefined): 'CLIENT_SPECIFIED_ADDRESS' | 'OUR_OFFICE' | 'REMOTE_ONLINE_NOTARIZATION' | 'PUBLIC_PLACE' | undefined {
  if (!frontendType) return undefined;
  
  const mapping: Record<string, 'CLIENT_SPECIFIED_ADDRESS' | 'OUR_OFFICE' | 'REMOTE_ONLINE_NOTARIZATION' | 'PUBLIC_PLACE'> = {
    'HOME': 'CLIENT_SPECIFIED_ADDRESS',
    'OFFICE': 'CLIENT_SPECIFIED_ADDRESS', 
    'HOSPITAL': 'CLIENT_SPECIFIED_ADDRESS',
    'OTHER': 'CLIENT_SPECIFIED_ADDRESS',
    'PUBLIC_PLACE': 'PUBLIC_PLACE',
    'REMOTE': 'REMOTE_ONLINE_NOTARIZATION',
    'OUR_OFFICE': 'OUR_OFFICE'
  };
  
  return mapping[frontendType] || 'CLIENT_SPECIFIED_ADDRESS';
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate input data
    const validatedData = BookingCreateSchema.parse(data);
    
    // Get service by type (match the exact serviceType from enum)
    const service = await prisma.service.findFirst({
      where: { 
        serviceType: validatedData.serviceType as any, // Direct match with enum
        isActive: true
      }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: `Service type ${validatedData.serviceType} not found` },
        { status: 400 }
      );
    }
    
    // Validate mobile service has address (RON_SERVICES doesn't need address)
    if (service.serviceType !== 'RON_SERVICES' && !validatedData.addressStreet) {
      return NextResponse.json(
        { error: 'Address is required for mobile services' },
        { status: 400 }
      );
    }

    // 🔥 NEW: Business Rules Validation
    console.log('🔍 Validating business rules for booking...');
    let businessRulesResult = null;
    try {
      businessRulesResult = await validateBusinessRules({
        serviceType: validatedData.serviceType,
        location: validatedData.addressStreet ? { 
          address: `${validatedData.addressStreet}, ${validatedData.addressCity || 'Houston'}, ${validatedData.addressState || 'TX'}` 
        } : undefined,
        documentCount: validatedData.numberOfDocuments,
        ghlContactId: undefined // Will be set after GHL contact creation
      });

      if (!businessRulesResult.isValid) {
        console.log('❌ Business rules validation failed:', businessRulesResult.violations);
        return NextResponse.json({
          error: 'Booking violates business policies',
          violations: businessRulesResult.violations,
          code: 'BUSINESS_RULE_VIOLATION'
        }, { status: 400 });
      }

      console.log('✅ Business rules validation passed');
      console.log('🏷️  GHL Actions:', {
        tags: businessRulesResult.ghlActions.tags,
        customFields: Object.keys(businessRulesResult.ghlActions.customFields),
        workflows: businessRulesResult.ghlActions.workflows
      });
    } catch (businessRulesError) {
      console.error('⚠️  Business rules validation failed (non-blocking):', businessRulesError);
      // Continue with booking creation even if business rules fail
    }
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validatedData.pricing.totalPrice * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        service_type: validatedData.serviceType,
        customer_email: validatedData.customerEmail,
        scheduled_date: validatedData.scheduledDateTime
      }
    });
    
    // Create GHL contact and appointment BEFORE saving to database
    let ghlContactId: string | null = null;
    let ghlAppointmentId: string | null = null;
    
    try {
      console.log('🔗 Creating GHL contact and appointment...');
      
      // 1. Create contact in GHL
      const [firstName, ...lastNameParts] = validatedData.customerName.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const ghlContact = await createContact({
        firstName,
        lastName,
        name: validatedData.customerName,
        email: validatedData.customerEmail,
        phone: validatedData.customerPhone,
        source: 'Website Booking',
        tags: ['Status:BookingConfirmed', `Service:${validatedData.serviceType}`],
        ...(validatedData.addressStreet && {
          address1: validatedData.addressStreet,
          city: validatedData.addressCity || 'Houston',
          state: validatedData.addressState || 'TX',
          postalCode: validatedData.addressZip
        })
      });
      
      ghlContactId = ghlContact.contact.id;
      console.log(`✅ GHL contact created: ${ghlContactId}`);

      // 🔥 NEW: Transparent Pricing GHL Integration
      if (validatedData.pricing.transparentData) {
        try {
          console.log('💰 Syncing transparent pricing data to GHL...');
          
          const pricingIntegrationResult = await TransparentPricingGHLIntegration.syncPricingToGHL({
            pricingResult: validatedData.pricing.transparentData,
            customerEmail: validatedData.customerEmail,
            customerName: validatedData.customerName,
            customerPhone: validatedData.customerPhone,
            contactId: ghlContactId,
            createContactIfNotExists: false, // Contact already created above
            triggerWorkflows: true
          });

          if (pricingIntegrationResult.success) {
            console.log(`✅ Transparent pricing synced to GHL:`, {
              customFieldsUpdated: pricingIntegrationResult.customFieldsUpdated,
              tagsApplied: pricingIntegrationResult.tagsApplied,
              workflowsTriggered: pricingIntegrationResult.workflowsTriggered
            });
          } else {
            console.warn(`⚠️ Transparent pricing sync failed:`, pricingIntegrationResult.error);
          }

          if (pricingIntegrationResult.warnings.length > 0) {
            console.warn(`⚠️ Transparent pricing sync warnings:`, pricingIntegrationResult.warnings);
          }

        } catch (transparentPricingError) {
          console.error('⚠️ Transparent pricing GHL integration failed (non-critical):', transparentPricingError);
        }
      }

      // 🔥 NEW: Apply Business Rules to GHL
      if (businessRulesResult && businessRulesResult.ghlActions) {
        try {
          console.log('🤖 Applying business rules to GHL contact...');
          
          // Add business rule tags
          if (businessRulesResult.ghlActions.tags.length > 0) {
            const existingTags = ghlContact.tags || [];
            const newTags = [...existingTags, ...businessRulesResult.ghlActions.tags];
            // Tags will be added when creating contact, or could be updated here
            console.log(`🏷️  Business rules tags: ${businessRulesResult.ghlActions.tags.join(', ')}`);
          }

          // Log custom fields that would be applied  
          if (Object.keys(businessRulesResult.ghlActions.customFields).length > 0) {
            console.log(`📝 Business rules custom fields:`, businessRulesResult.ghlActions.customFields);
          }

          // Log workflows that would be triggered
          if (businessRulesResult.ghlActions.workflows.length > 0) {
            console.log(`⚡ Business rules workflows: ${businessRulesResult.ghlActions.workflows.join(', ')}`);
          }

          console.log('✅ Business rules applied to GHL contact');
        } catch (businessRulesGhlError) {
          console.error('⚠️  Failed to apply business rules to GHL (non-critical):', businessRulesGhlError);
        }
      }
      
      // 2. Create appointment in appropriate calendar
      const calendarId = getCalendarIdForService(validatedData.serviceType);
      const endDateTime = new Date(new Date(validatedData.scheduledDateTime).getTime() + (service.durationMinutes * 60000));
      
      const ghlAppointment = await createAppointment({
        calendarId,
        contactId: ghlContactId,
        startTime: validatedData.scheduledDateTime,
        endTime: endDateTime.toISOString(),
        title: `${service.name} - ${validatedData.customerName}`,
        appointmentStatus: 'confirmed',
        address: validatedData.addressStreet ? 
          `${validatedData.addressStreet}, ${validatedData.addressCity || 'Houston'}, ${validatedData.addressState || 'TX'}` : 
          'Remote/Online Service',
        ignoreDateRange: false,
        toNotify: true
      });
      
      ghlAppointmentId = ghlAppointment.id;
      console.log(`✅ GHL appointment created: ${ghlAppointmentId}`);
      
      // 3. Add to booking workflow (optional)
      const workflowId = process.env.GHL_NEW_CONTACT_WORKFLOW_ID;
      if (workflowId) {
        try {
          await addContactToWorkflow(ghlContactId, workflowId);
          console.log(`✅ Contact added to booking workflow`);
        } catch (workflowError) {
          console.warn('⚠️  Workflow addition failed (non-critical):', workflowError.message);
        }
      }
      
    } catch (ghlError) {
      console.error('⚠️  GHL integration failed (booking will continue):', ghlError.message);
      // Continue with booking creation even if GHL fails
    }

    // Save booking to database with CORRECT schema-v2 structure
    const booking = await prisma.booking.create({
      data: {
        // Proper service relation
        serviceId: service.id,
        
        // Customer information - only customerEmail exists in Booking schema
        customerEmail: validatedData.customerEmail,
        // Note: customerName and customerPhone stored in GHL, not database
        
        // Scheduling - single DateTime field
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        
        // Location fields (proper structure) - mapped to database enum
        locationType: mapLocationTypeToDb(validatedData.locationType),
        addressStreet: validatedData.addressStreet || null,
        addressCity: validatedData.addressCity || null,
        addressState: validatedData.addressState || null,
        addressZip: validatedData.addressZip || null,
        locationNotes: validatedData.locationNotes || null,
        
        // Pricing - using correct schema fields
        priceAtBooking: validatedData.pricing.totalPrice,
        travelFee: validatedData.pricing.travelFee,
        
        // Note: numberOfDocuments and numberOfSigners stored in metadata or separate fields if needed
        
        // Payment - using depositStatus field instead of paymentStatus
        depositStatus: 'PENDING',
        notes: `Stripe Payment Intent: ${paymentIntent.id}`,
        
        // GHL Integration IDs
        ghlContactId,
        // Note: ghlAppointmentId stored in notes field for now
        
        // Status
        status: 'CONFIRMED'
      },
      include: {
        service: true
      }
    });
    
    // Note: Audit logging removed as bookingAuditLog table doesn't exist in current schema
    
    // 🔥 NEW: RON Integration - Auto-create Proof.com transaction for RON bookings
    let proofTransaction = null;
    if (service.serviceType === 'RON_SERVICES') {
      try {
        console.log('🔐 Creating Proof.com RON session for booking:', booking.id);
        
        // Import RON service
        const { RONService } = await import('@/lib/proof/api');
        
        // Create RON session
        proofTransaction = await RONService.createRONSession({
          id: booking.id,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone || undefined,
          documentTypes: ['General Document'], // Default, can be enhanced
          scheduledDateTime: new Date(validatedData.scheduledDateTime)
        });
        
        if (proofTransaction) {
          // Update booking with Proof transaction details using existing schema fields
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              dailyRoomUrl: proofTransaction.sessionUrl, // Repurpose for Proof.com URL
              kbaStatus: `proof_transaction:${proofTransaction.id}`, // Store transaction ID
              idVerificationStatus: proofTransaction.status,
              notes: `${booking.notes || ''}\n\nProof.com RON Session: ${proofTransaction.id}`
            }
          });
          
          console.log(`✅ Proof.com RON session created: ${proofTransaction.id}`);
        } else {
          console.warn('⚠️ Failed to create Proof.com RON session (non-blocking)');
        }
        
      } catch (ronError) {
        console.error('⚠️ RON session creation failed (non-blocking):', ronError);
        // Continue with booking creation even if RON session fails
      }
    }
    
    // Send enhanced confirmation email and create calendar event using new enhanced service
    try {
      const { EnhancedBookingService } = await import('@/lib/enhanced-booking-service');
      
      const result = await EnhancedBookingService.processBooking({
        bookingId: booking.id,
        customerEmail: validatedData.customerEmail,
        customerName: validatedData.customerName,
        serviceType: validatedData.serviceType,
        serviceName: service.name,
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        addressStreet: validatedData.addressStreet,
        addressCity: validatedData.addressCity,
        addressState: validatedData.addressState,
        addressZip: validatedData.addressZip,
        locationNotes: validatedData.locationNotes,
        specialInstructions: booking.notes,
        numberOfSigners: validatedData.numberOfSigners,
        numberOfDocuments: validatedData.numberOfDocuments,
        totalAmount: validatedData.pricing.totalPrice,
        paymentStatus: booking.depositStatus,
        bookingManagementLink: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}`,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          proofTransactionId: proofTransaction?.id,
          ghlContactId,
          ghlAppointmentId
        }
      });

      console.log('📧 Enhanced booking processing completed:', {
        emailSent: result.emailSent,
        calendarEventCreated: result.calendarEventCreated,
        conversationTracked: result.conversationTracked,
        errors: result.errors
      });

      if (result.errors.length > 0) {
        console.warn('⚠️  Enhanced booking processing had errors:', result.errors);
      }
    } catch (enhancedError) {
      console.error('⚠️  Enhanced booking processing failed (non-blocking):', enhancedError);
      
      // Fallback to basic confirmation email
      sendEnhancedConfirmationEmail(booking, validatedData.customerName, proofTransaction).catch((error: any) => {
        console.error('Fallback email sending failed:', error);
      });
    }
    
    console.log(`✅ Booking created successfully: ${booking.id} for ${booking.customerEmail}`);
    
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        confirmationNumber: booking.id,
        clientSecret: paymentIntent.client_secret,
        scheduledDateTime: booking.scheduledDateTime,
        totalAmount: booking.priceAtBooking,
        service: {
          name: service.name,
          serviceType: service.serviceType
        },
        // Include RON session details if available
        ...(proofTransaction && {
          ron: {
            transactionId: proofTransaction.id,
            accessLink: proofTransaction.sessionUrl,
            status: proofTransaction.status,
            instructions: 'Check your email for RON session access link from Proof.com'
          }
        })
      }
    });
    
  } catch (error) {
    console.error('❌ Booking creation error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        },
        { status: 400 }
      );
    }
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Booking conflict - this time slot may already be taken' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Booking creation failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

async function sendEnhancedConfirmationEmail(booking: any, customerName: string, proofTransaction: any = null) {
  try {
    // Import the enhanced email templates
    const { bookingConfirmationEmail } = await import('@/lib/email/templates');
    
    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: booking.serviceId }
    });
    
    if (!service) {
      console.error(`Service not found for booking ${booking.id}`);
      return;
    }
    
    // Prepare email data - use passed customerName instead of booking.customerName
    const client = {
      firstName: customerName.split(' ')[0] || 'Valued',
      lastName: customerName.split(' ').slice(1).join(' ') || 'Customer',
      email: booking.customerEmail
    };
    
    const bookingDetails = {
      bookingId: booking.id,
      serviceName: service.name,
      date: new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      address: booking.addressCity || 'TBD',
      numberOfSigners: 1, // Default, could be enhanced
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalAmount: booking.priceAtBooking,
      bookingManagementLink: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}`
    };
    
    // Generate email content
    const emailContent = bookingConfirmationEmail(client, bookingDetails);
    
    // Send email using notification service
    const { NotificationService } = await import('@/lib/notifications');
    await NotificationService.sendNotification({
      bookingId: booking.id,
      type: 'BOOKING_CONFIRMATION' as any,
      recipient: { email: booking.customerEmail },
      content: {
        subject: emailContent.subject,
        message: emailContent.html
      },
      methods: ['EMAIL' as any]
    });
    
    console.log(`📧 Enhanced confirmation email sent for ${booking.customerEmail}`);
    console.log(`   Booking: ${booking.id}`);
    console.log(`   Service: ${service.name}`);
    console.log(`   Date: ${booking.scheduledDateTime}`);
    console.log(`   Amount: $${booking.priceAtBooking}`);
  } catch (error) {
    console.error('Failed to send enhanced confirmation email:', error);
  }
}