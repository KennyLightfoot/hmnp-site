/// <reference types="@prisma/client" />

declare module "@prisma/client" {
  // Augment the Booking interface to include totalAmount
  // This uses TypeScript's interface merging to add the field without clobbering existing properties
  // The interface merge ensures all Prisma Booking fields are preserved
  interface Booking {
    /**
     * Total amount charged for the booking (price at booking minus discounts plus fees).
     * Not persisted in the DB – set by business logic when needed.
     */
    totalAmount?: number | null;
  }
} 