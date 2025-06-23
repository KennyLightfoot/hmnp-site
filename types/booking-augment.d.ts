import "@prisma/client";

declare module "@prisma/client" {
  interface Booking {
    /**
     * Total amount charged for the booking (price at booking minus discounts plus fees).
     * Not persisted in the DB – set by business logic when needed.
     */
    totalAmount?: number | null;
  }
} 