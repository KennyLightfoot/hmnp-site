// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database-connection';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { getAvailableSlots } from '@/lib/ghl-calendar';
import { getCalendarSlots } from '@/lib/ghl/management';
import { isSlotAvailable } from '@/lib/slot-reservation';
import { getServiceDurationMinutes } from '@/lib/services/config';
import { withRateLimit } from '@/lib/security/rate-limiting';

const RequestSchema = z.object({
  serviceType: z.enum([
    'QUICK_STAMP_LOCAL',
    'STANDARD_NOTARY',
    'EXTENDED_HOURS',
    'LOAN_SIGNING',
    'RON_SERVICES',
    'BUSINESS_ESSENTIALS',
    'BUSINESS_GROWTH',
  ]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().default('America/Chicago'),
});

function generateMockSlots(dateIso: string) {
  const slots: any[] = [];
  const date = new Date(dateIso + 'T00:00:00');
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const start = new Date(date);
      start.setHours(h, m, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      slots.push({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration: 60,
        available: true,
        demand: 'low',
      });
    }
  }
  return slots;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('public', 'availability_v2')(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = RequestSchema.safeParse({
      serviceType: searchParams.get('serviceType') || 'STANDARD_NOTARY',
      date: searchParams.get('date'),
      timezone: searchParams.get('timezone') || 'America/Chicago',
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', issues: parsed.error.issues }, { status: 400 });
    }

    const { serviceType, date, timezone } = parsed.data;

    // Policy update: Allow same-day Standard Notary; surcharge handled in pricing

    let availableSlots: any[] = [];
    try {
      const calendarId = getCalendarIdForService(serviceType);
      const teamMemberId = process.env.GHL_DEFAULT_TEAM_MEMBER_ID || undefined;
      // Use management adapter with original YYYY-MM-DD (mirrors working setup paths)
      const slots = await getCalendarSlots(
        calendarId,
        date,
        date,
        teamMemberId
      );
      availableSlots = (slots || []).map((s: any) => ({
        startTime: s.startTime || s.start,
        endTime: s.endTime || s.end,
        duration: s.duration || getServiceDurationMinutes(serviceType),
        available: s.available !== false,
        demand: s.demand || 'low',
      }));
    } catch (e) {
      availableSlots = generateMockSlots(date);
    }

    // Optional: bypass DB/Redis filtering to surface raw GHL slots end-to-end (for diagnostics)
    const bypassFilters = (process.env.AVAILABILITY_BYPASS_FILTERS || '').toLowerCase() === 'true';
    if (bypassFilters) {
      return NextResponse.json({ availableSlots });
    }

    // Filter out slots overlapping existing bookings (with buffer)
    try {
      const dayStart = new Date(`${date}T00:00:00`);
      const dayEnd = new Date(`${date}T23:59:59`);
      const bookings = await prisma.booking.findMany({
        where: {
          scheduledDateTime: { gte: dayStart, lte: dayEnd },
          status: { notIn: ['CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF'] as any },
        },
        include: { service: true },
      });

      const bufferMinutes = Number(process.env.MIN_APPOINTMENT_GAP_MINUTES || '15');
      const filtered = availableSlots.filter((slot) => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        return !bookings.some((b) => {
          const existingStart = b.scheduledDateTime ? new Date(b.scheduledDateTime) : null;
          if (!existingStart) return false;
          const duration = (b as any)?.service?.durationMinutes || getServiceDurationMinutes(b.service?.serviceType || 'STANDARD_NOTARY');
          const existingEnd = new Date(existingStart.getTime() + (duration + bufferMinutes) * 60 * 1000);
          return slotStart < existingEnd && slotEnd > existingStart;
        });
      });
      // Also remove Redis-held slots (temporary holds during checkout)
      const filteredHeld: typeof availableSlots = [];
      for (const slot of filtered) {
        const ok = await isSlotAvailable(slot.startTime, serviceType);
        if (ok) filteredHeld.push(slot);
      }
      availableSlots = filteredHeld;
    } catch (err) {
      console.warn('Availability filter failed', err);
    }

    return NextResponse.json({ availableSlots });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

 