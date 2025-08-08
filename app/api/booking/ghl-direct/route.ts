import { NextResponse } from 'next/server';
import {
  findContactByEmail,
  createContact,
  createOpportunity,
  createAppointment,
  getServiceValue,
} from '@/lib/ghl/api';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';

/**
 * POST /api/booking/ghl-direct
 *
 * Lightweight booking endpoint that:
 * 1. Finds (or creates) the contact in GHL
 * 2. Creates an appointment on the appropriate GHL calendar if possible
 *    – falls back to creating an Opportunity when calendar configuration is missing
 *
 * Required fields in JSON body:
 *   - serviceType          (e.g. "STANDARD_NOTARY")
 *   - customerName         (full name)
 *   - customerEmail
 *   - scheduledDateTime    (ISO string, America/Chicago timezone preferred)
 *
 * Optional fields:
 *   - customerPhone
 *   - numberOfSigners      (defaults to 1 – for getServiceValue)
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      serviceType,
      customerName,
      customerEmail,
      customerPhone,
      scheduledDateTime,
      numberOfSigners = 1,
    } = data;

    // Basic validation – keep it simple
    if (!serviceType || !customerName || !customerEmail || !scheduledDateTime) {
      return NextResponse.json(
        { success: false, message: 'Missing required booking fields' },
        { status: 400 },
      );
    }

    // Debug logging to see what we're getting
    console.log('⏰ scheduledDateTime raw:', scheduledDateTime);
    console.log('⏰ Date.parse result:', Date.parse(scheduledDateTime));

    // NOTE: This endpoint does not persist a local booking. Prefer /api/booking/create
    // Robust datetime parsing and validation
    let parsedDateTime: Date;
    try {
      if (typeof scheduledDateTime !== 'string') {
        throw new Error('scheduledDateTime must be a string');
      }

      // Try parsing as ISO first
      const isoParse = Date.parse(scheduledDateTime);
      if (isNaN(isoParse)) {
        throw new Error('Invalid ISO datetime format');
      }

      parsedDateTime = new Date(isoParse);
      
      // Validate the parsed date is reasonable
      if (parsedDateTime.getTime() <= Date.now()) {
        throw new Error('Scheduled time must be in the future');
      }

      // Check for reasonable future limit (1 year)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (parsedDateTime > maxDate) {
        throw new Error('Cannot schedule more than 1 year in advance');
      }

    } catch (dateError: any) {
      console.error('❌ DateTime parsing failed:', dateError.message);
      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid scheduled date/time: ${dateError.message}. Please select a valid future date and time.` 
        },
        { status: 400 },
      );
    }

    // Split name into first / last (very naive but fine for our use-case)
    const nameParts = String(customerName).trim().split(' ');
    const firstName = nameParts.shift() || customerName;
    const lastName = nameParts.join(' ') || '-';

    /* -----------------------------------------------------------
     * 1) Find (or create) the contact in GHL
     * ---------------------------------------------------------*/
    let contact: any = null;
    try {
      contact = await findContactByEmail(customerEmail);
    } catch (err) {
      // swallow – fall through to createContact
    }

    if (!contact) {
      contact = await createContact({
        firstName,
        lastName,
        email: customerEmail,
        phone: customerPhone,
        source: 'Website Booking',
      });
    }

    /* -----------------------------------------------------------
     * 2) Create an appointment on the relevant calendar (preferred)
     * ---------------------------------------------------------*/
    let appointment: any = null;
    try {
      const calendarId = getCalendarIdForService(serviceType);
      const startIso = parsedDateTime.toISOString();
      const endIso = new Date(parsedDateTime.getTime() + 60 * 60 * 1000).toISOString();

      appointment = await createAppointment({
        calendarId,
        contactId: contact.id,
        title: `${serviceType.replace(/_/g, ' ')} – ${customerName}`,
        startTime: startIso,
        endTime: endIso,
        locationId: process.env.GHL_LOCATION_ID,
      });
    } catch (err) {
      console.warn('📆 Appointment creation failed, falling back to Opportunity:', err);
    }

    /* -----------------------------------------------------------
     * 3) Fallback: create an Opportunity so workflows still fire
     * ---------------------------------------------------------*/
    let opportunity: any = null;
    if (!appointment) {
      try {
        opportunity = await createOpportunity(contact.id, {
          name: `${serviceType} – ${customerName}`,
          status: 'open',
          source: 'Website Booking',
          monetaryValue: getServiceValue(serviceType, numberOfSigners),
        });
      } catch (opErr: any) {
        console.error('❌ Opportunity creation failed:', opErr);
        // Do not fail the whole request – return success with contact only so frontend can proceed
        return NextResponse.json(
          {
            success: true,
            contactId: contact.id,
            appointmentId: null,
            opportunityId: null,
            note: 'GHL creation failed; contact recorded. We will finalize your booking shortly.'
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        contactId: contact.id,
        appointmentId: appointment?.id ?? null,
        opportunityId: opportunity?.id ?? null,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('❌ GHL-direct booking error:', error);
    // Surface useful details from wrapped GHL errors to help diagnose
    const status = (error?.ghlError?.statusCode as number) || 500;
    const message = error?.message || 'Internal server error';
    const details = error?.ghlError ? {
      category: error.ghlError.category,
      statusCode: error.ghlError.statusCode,
      isRetryable: error.ghlError.isRetryable
    } : undefined;
    return NextResponse.json(
      { success: false, message, details },
      { status },
    );
  }
} 