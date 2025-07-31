import { Prisma } from '@prisma/client';

/**
 * Central location for Prisma-derived TypeScript helpers so we stop hand-rolling
 * ad-hoc intersection types throughout the codebase.  Update these once when
 * you change relations and the rest of the app stays green.
 */

export type BookingWithService = Prisma.BookingGetPayload<{
  include: {
    service: true;
  };
}>;

export type BookingWithUserAndService = Prisma.BookingGetPayload<{
  include: {
    Service: true;
    User_Booking_signerIdToUser: true;
  };
}>;

export type PaymentWithBooking = Prisma.PaymentGetPayload<{
  include: {
    booking: true;
  };
}>;

// Add more helpers as needed across the codebase 