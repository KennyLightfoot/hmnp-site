/**
 * Optimized Database Query Patterns
 * 
 * This module provides optimized query patterns to reduce N+1 queries
 * and improve database performance across the application.
 */

import { prisma } from '@/lib/database-connection';
import type { Prisma } from '@prisma/client';

// Optimized booking queries with selective loading
export const bookingQueries = {
  /**
   * Get booking by ID with minimal data for API responses
   */
  findById: (id: string) => 
    prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        scheduledDateTime: true,
        createdAt: true,
        updatedAt: true,
        basePrice: true,
        finalPrice: true,
        promoDiscount: true,
        depositAmount: true,
        signerEmail: true,
        signerName: true,
        signerPhone: true,
        locationType: true,
        addressStreet: true,
        addressCity: true,
        addressState: true,
        addressZip: true,
        locationNotes: true,
        notes: true,
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            durationMinutes: true,
            requiresDeposit: true,
            depositAmount: true,
          }
        },
        User_Booking_signerIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        promoCode: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
          }
        }
      }
    }),

  /**
   * Get bookings list with pagination and minimal data
   */
  findMany: ({ 
    page = 1, 
    limit = 10, 
    userId, 
    status,
    locationType
  }: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
    locationType?: string;
  }) => {
    const where: Prisma.BookingWhereInput = {};
    
    if (userId) where.signerId = userId;
    if (status) where.status = status as any;
    if (locationType) where.locationType = locationType as any;

    return prisma.booking.findMany({
      where,
      select: {
        id: true,
        status: true,
        scheduledDateTime: true,
        createdAt: true,
        finalPrice: true,
        signerName: true,
        signerEmail: true,
        locationType: true,
        addressCity: true,
        addressState: true,
        service: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            durationMinutes: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  /**
   * Get booking count for pagination
   */
  count: (where?: Prisma.BookingWhereInput) =>
    prisma.booking.count({ where }),

  /**
   * Get bookings for a specific date range (calendar view)
   */
  findByDateRange: (startDate: Date, endDate: Date) =>
    prisma.booking.findMany({
      where: {
        scheduledDateTime: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['CONFIRMED', 'SCHEDULED', 'PAYMENT_PENDING', 'READY_FOR_SERVICE', 'IN_PROGRESS']
        }
      },
      select: {
        id: true,
        scheduledDateTime: true,
        status: true,
        signerName: true,
        locationType: true,
        addressCity: true,
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
          }
        }
      },
      orderBy: { scheduledDateTime: 'asc' }
    })
};

// Optimized service queries
export const serviceQueries = {
  /**
   * Get all active services for booking form
   */
  findActive: () =>
    prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        durationMinutes: true,
        requiresDeposit: true,
        depositAmount: true,
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' }
    }),

  /**
   * Get service by ID with minimal data
   */
  findById: (id: string) =>
    prisma.service.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        durationMinutes: true,
        requiresDeposit: true,
        depositAmount: true,
        isActive: true,
      }
    }),

  /**
   * Get service stats (booking count, revenue)
   */
  getStats: () =>
    prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        basePrice: true,
        _count: {
          select: {
            Booking: {
              where: {
                status: {
                  in: ['CONFIRMED', 'COMPLETED']
                }
              }
            }
          }
        }
      }
    })
};

// Optimized user queries
export const userQueries = {
  /**
   * Get user profile with minimal data
   */
  findProfile: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    }),

  /**
   * Get user with booking stats
   */
  findWithBookingStats: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        _count: {
          select: {
            Booking_Booking_signerIdToUser: {
              where: {
                status: {
                  in: ['CONFIRMED', 'COMPLETED']
                }
              }
            }
          }
        }
      }
    }),

  /**
   * Find user by email with minimal data
   */
  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })
};

// Optimized promo code queries
export const promoCodeQueries = {
  /**
   * Get active promo codes
   */
  findActive: () =>
    prisma.promoCode.findMany({
      where: {
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        maxUses: true,
        currentUses: true,
        validFrom: true,
        validUntil: true,
      }
    }),

  /**
   * Validate promo code
   */
  validateCode: (code: string) =>
    prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        maxUses: true,
        currentUses: true,
        minimumOrderAmount: true,
        applicableServices: true,
      }
    })
};

// Optimized business settings queries
export const businessSettingsQueries = {
  /**
   * Get all booking-related settings
   */
  getBookingSettings: () =>
    prisma.businessSettings.findMany({
      where: { category: 'booking' },
      select: {
        key: true,
        value: true,
        dataType: true,
      }
    }),

  /**
   * Get setting by key
   */
  getSetting: (key: string) =>
    prisma.businessSettings.findUnique({
      where: { key },
      select: {
        key: true,
        value: true,
        dataType: true,
      }
    }),

  /**
   * Get multiple settings by keys
   */
  getSettings: (keys: string[]) =>
    prisma.businessSettings.findMany({
      where: { key: { in: keys } },
      select: {
        key: true,
        value: true,
        dataType: true,
      }
    })
};

// Optimized payment queries
export const paymentQueries = {
  /**
   * Get payment by booking ID
   */
  findByBookingId: (bookingId: string) =>
    prisma.payment.findFirst({
      where: { bookingId },
      select: {
        id: true,
        amount: true,
        status: true,
        provider: true,
        stripeSessionId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    }),

  /**
   * Get payment stats
   */
  getStats: (startDate?: Date, endDate?: Date) => {
    const where: Prisma.PaymentWhereInput = {
      status: 'COMPLETED'
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    return prisma.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });
  }
};

// Combined query patterns for complex operations
export const combinedQueries = {
  /**
   * Get dashboard data with minimal queries
   */
  getDashboardData: async () => {
    const [
      totalBookings,
      recentBookings,
      activeServices,
      paymentStats
    ] = await Promise.all([
      bookingQueries.count(),
      bookingQueries.findMany({ limit: 5 }),
      serviceQueries.findActive(),
      paymentQueries.getStats()
    ]);

    return {
      totalBookings,
      recentBookings,
      activeServices,
      paymentStats
    };
  },

  /**
   * Get booking with all related data for detailed view
   */
  getBookingDetails: async (id: string) => {
    const [booking, payments] = await Promise.all([
      bookingQueries.findById(id),
      paymentQueries.findByBookingId(id)
    ]);

    return { booking, payments };
  }
};

// Query result types for better TypeScript support
export type BookingListItem = Prisma.PromiseReturnType<typeof bookingQueries.findMany>[0];
export type ServiceItem = Prisma.PromiseReturnType<typeof serviceQueries.findActive>[0];
export type UserProfile = Prisma.PromiseReturnType<typeof userQueries.findProfile>;
export type PaymentItem = Prisma.PromiseReturnType<typeof paymentQueries.findByBookingId>;

export default {
  bookingQueries,
  serviceQueries,
  userQueries,
  promoCodeQueries,
  businessSettingsQueries,
  paymentQueries,
  combinedQueries,
};