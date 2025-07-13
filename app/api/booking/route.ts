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
  fs.mkdirSync('logs', { recursive: true });
  fs.appendFileSync('logs/bookings.log', message + '\n');
}

export async function POST(req: NextRequest) {
  let data;
  try {
    data = BookingSchema.parse(await req.json());
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 400 });
  }

  const iso = new Date(`${data.meetingDate}T${data.meetingTime}`);

  const booking = await prisma.booking.create({
    data: {
      serviceId: data.serviceType,
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
      calendarId: process.env.GHL_LOCATION_ID,
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
