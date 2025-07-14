import { describe, it, expect } from 'vitest';
import { BookingSchema } from '../app/api/booking/route';

describe('Booking validation', () => {
  it('valid payload passes', () => {
    const data = {
      serviceType: 'RON',
      meetingDate: '2025-07-14',
      meetingTime: '10:00',
      clientName: 'Test User',
      phone: '555-1234'
    };
    expect(() => BookingSchema.parse(data)).not.toThrow();
  });

  it('missing phone fails', () => {
    const data: any = {
      serviceType: 'RON',
      meetingDate: '2025-07-14',
      meetingTime: '10:00',
      clientName: 'Test User'
    };
    expect(() => BookingSchema.parse(data)).toThrow();
  });
});
