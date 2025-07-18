// @ts-nocheck
/**
 * Enhanced Booking Availability API - Houston Mobile Notary Pros
 * Phase 2: Real-time availability with urgency indicators and demand tracking
 * 
 * Returns available time slots for a specific service and date with enhanced metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCalendarIdForService } from '@/lib/ghl/calendar-mapping';
import { getCalendarSlots } from '@/lib/ghl/management';
import { prisma } from '@/lib/database-connection';

// Enhanced validation schema for availability request
const AvailabilityRequestSchema = z.object({
  serviceType: z.enum([
    'QUICK_STAMP_LOCAL',
    'STANDARD_NOTARY',
    'EXTENDED_HOURS',
    'LOAN_SIGNING',
    'RON_SERVICES',
    'BUSINESS_ESSENTIALS',
    'BUSINESS_GROWTH',
  ]),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timezone: z.string().trim().default('America/Chicago'),
  includeDemand: z.boolean().default(true),
  includeUrgency: z.boolean().default(true),
});

// Business hours configuration per service
const BUSINESS_HOURS = {
  'QUICK_STAMP_LOCAL': { start: 9, end: 17, days: [1, 2, 3, 4, 5] }, // Mon-Fri 9-5
  'STANDARD_NOTARY': { start: 9, end: 17, days: [1, 2, 3, 4, 5] }, // Mon-Fri 9-5
  'EXTENDED_HOURS': { start: 7, end: 21, days: [0, 1, 2, 3, 4, 5, 6] }, // 7 days 7-9
  'LOAN_SIGNING': { start: 8, end: 18, days: [1, 2, 3, 4, 5] }, // Mon-Fri 8-6
  'RON_SERVICES': { start: 0, end: 24, days: [0, 1, 2, 3, 4, 5, 6] }, // 24/7
  'BUSINESS_ESSENTIALS': { start: 9, end: 17, days: [1, 2, 3, 4, 5] }, // Mon-Fri 9-5
  'BUSINESS_GROWTH': { start: 9, end: 17, days: [1, 2, 3, 4, 5] } // Mon-Fri 9-5
};

// Urgency and demand calculation helpers
function calculateDemandLevel(bookingsCount: number, totalSlots: number): 'low' | 'medium' | 'high' {
  const utilizationRate = bookingsCount / totalSlots;
  if (utilizationRate < 0.3) return 'low';
  if (utilizationRate < 0.7) return 'medium';
  return 'high';
}

function calculateUrgency(date: string, time: string, serviceType: string): boolean {
  const slotDate = new Date(`${date}T${time}`);
  const now = new Date();
  const hoursUntilSlot = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Same-day urgency
  if (hoursUntilSlot < 4) return true;
  
  // Service-specific urgency rules
  if (serviceType === 'LOAN_SIGNING' && hoursUntilSlot < 24) return true;
  if (serviceType === 'EXTENDED_HOURS' && hoursUntilSlot < 2) return true;
  
  return false;
}

function isPopularTime(time: string): boolean {
  const hour = parseInt(time.split(':')[0]);
  // Popular times: 9-11 AM, 1-3 PM
  return (hour >= 9 && hour <= 11) || (hour >= 13 && hour <= 15);
}

export { GET } from '../../../api/v2/availability/route';