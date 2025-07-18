import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServiceId } from '@/lib/services/serviceIdMap';
import { createAppointment, createContact } from '@/lib/ghl/api';
import { bookingLogger, errorLogger } from '@/lib/logger';

export const BookingSchema = z.object({
  serviceType: z.enum(['RON', 'Mobile', 'LoanSigning']),
  meetingDate: z.string(),
  meetingTime: z.string(),
  clientName: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  address: z.string().optional()
});

export async function POST(req: NextRequest) {
  let data;
  try {
    data = BookingSchema.parse(await req.json());
  } catch (err: any) {
    errorLogger.error('Invalid booking payload', err instanceof Error ? err : undefined);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 400 });
  }

  const iso = new Date(`${data.meetingDate}T${data.meetingTime}`);

  let serviceId: string;
  try {
    serviceId = getServiceId(data.serviceType.toUpperCase());
  } catch {
    errorLogger.error('Invalid service type', { serviceType: data.serviceType });
    return new Response(JSON.stringify({
      ok: false,
      error: `Invalid service type: ${data.serviceType}`
    }), { status: 400 });
  }

  // Fetch service duration for appointment end time calculation
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { durationMinutes: true }
  });

  // Create or find GHL contact
  let contactId: string | undefined;
  try {
    const [firstName, ...last] = data.clientName.split(' ');
    const contact = await createContact({
      firstName,
      lastName: last.join(' '),
      name: data.clientName,
      email: data.email,
      phone: data.phone,
      source: 'Website Booking'
    });
    contactId = (contact as any).id || (contact as any).contact?.id;
  } catch (err: any) {
    errorLogger.error('Failed to create GHL contact', err);
  }

  const booking = await prisma.booking.create({
    data: {
      serviceId: serviceId,
      customerEmail: data.email,
      addressStreet: data.address,
      scheduledDateTime: iso,
      notes: '',
      priceAtBooking: 0,
      ghlContactId: contactId
    }
  });

  const endTime = new Date(iso.getTime() + ((service?.durationMinutes || 60) * 60000));

  try {
    await createAppointment({
      contactId: contactId || '',
      calendarId: process.env.GHLCAL_LOCATION_ID,
      title: data.serviceType,
      startTime: iso.toISOString(),
      endTime: endTime.toISOString()
    });
  } catch (e: any) {
    errorLogger.error('Failed to create GHL appointment', e);
  }

  bookingLogger.info(`created ${booking.id}`);
  return Response.json({ ok: true, bookingId: booking.id });
}
