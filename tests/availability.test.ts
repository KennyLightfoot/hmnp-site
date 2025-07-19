import { describe, it, expect, vi } from 'vitest';
import { DateTime } from 'luxon';
import { roundToQuarter } from '@/lib/utils/time';
import { generateAvailableSlots } from '@/lib/availability/generateSlots';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Availability Logic', () => {
  it('RON booking rounds to nearest 15 min', () => {
    const unrounded = DateTime.fromISO('2023-10-27T10:07:00.000-05:00', { zone: 'America/Chicago' });
    const rounded = roundToQuarter(unrounded);
    expect(rounded.minute).toBe(15);
  });

  // More tests for generateAvailableSlots...
}); 