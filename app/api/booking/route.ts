import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createAppointment } from '@/lib/ghl/api';
import fs from 'fs';

export const BookingSchema = z.object({
  serviceType: z.enum(['RON', 'Mobile', 'LoanSigning']),
  meetingDate: z.string(),
  meetingTime: z.string(),
  clientName: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  address: z.string().optional()
});

function logBooking(message: string) {
  try {
    fs.mkdirSync('logs', { recursive: true });
    fs.appendFileSync('logs/bookings.log', `${new Date().toISOString()} - ${message}\n`);
  } catch (error) {
    console.error('Failed to write to booking log:', error);
  }
}

export async function POST(req: NextRequest) {
  let data;
  try {
    data = BookingSchema.parse(await req.json());
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 400 });
  }

  const iso = new Date(`${data.meetingDate}T${data.meetingTime}`);

  // Map service types to actual service IDs
  const serviceTypeMap = {
    'RON': 'ron-services-005',
    'Mobile': 'standard-notary-002',
    'LoanSigning': 'loan-signing-004'
  };
  
  const serviceId = serviceTypeMap[data.serviceType as keyof typeof serviceTypeMap];
  if (!serviceId) {
    return new Response(JSON.stringify({ 
      ok: false, 
      error: `Invalid service type: ${data.serviceType}` 
    }), { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      serviceId: serviceId,
      customerEmail: data.email,
      addressStreet: data.address,
      scheduledDateTime: iso,
      notes: '',
      priceAtBooking: 0
    }
  });

  try {
    await createAppointment({
      contactId: '',
      calendarId: process.env.GHLCAL_LOCATION_ID,
      title: data.serviceType,
      startTime: iso.toISOString(),
      endTime: iso.toISOString()
    });
  } catch (e) {
    // ignore
  }

  logBooking(`created ${booking.id}`);
  return Response.json({ ok: true, bookingId: booking.id });
}
