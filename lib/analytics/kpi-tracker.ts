/**
 * KPI Tracking and Business Intelligence for Houston Mobile Notary Pros
 * Implements comprehensive metrics tracking for business decision making
 */

import { logger } from '@/lib/logger';

export interface BookingKPI {
  bookingId: string;
  serviceType: string;
  bookingDate: Date;
  completionDate?: Date;
  totalValue: number;
  basePrice: number;
  travelFee: number;
  signerFees: number;
  discounts: number;
  distance: number;
  location: {
    city: string;
    state: string;
    zip: string;
  };
  customerSegment: 'new' | 'returning' | 'referred';
  bookingSource: 'website' | 'phone' | 'referral' | 'repeat';
  timeToBook: number; // minutes from start to completion
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface DailyKPIs {
  date: string;
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  conversionRate: number;
  newCustomers: number;
  returningCustomers: number;
  totalDistance: number;
  totalTravelFees: number;
  serviceBreakdown: {
    [serviceType: string]: {
      count: number;
      revenue: number;
    };
  };
  locationBreakdown: {
    [city: string]: {
      count: number;
      averageDistance: number;
      totalTravelFees: number;
    };
  };
  timeBreakdown: {
    [hour: string]: number;
  };
}

export interface BusinessMetrics {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  startDate: Date;
  endDate: Date;
  
  // Revenue Metrics
  totalRevenue: number;
  averageRevenuePerBooking: number;
  revenueGrowthRate: number;
  
  // Operational Metrics
  totalBookings: number;
  completedBookings: number;
  cancellationRate: number;
  averageBookingTime: number; // minutes
  
  // Customer Metrics
  newCustomerRate: number;
  customerRetentionRate: number;
  referralRate: number;
  
  // Service Metrics
  mostPopularService: string;
  leastPopularService: string;
  averageServiceDistance: number;
  
  // Pricing Metrics
  averageBasePrice: number;
  averageTravelFee: number;
  averageSignerFees: number;
  totalDiscountsGiven: number;
  
  // Geographic Metrics
  topLocations: Array<{
    city: string;
    bookings: number;
    revenue: number;
    averageDistance: number;
  }>;
  
  // Time-based Metrics
  peakHours: Array<{
    hour: number;
    bookings: number;
  }>;
  peakDays: Array<{
    dayOfWeek: string;
    bookings: number;
  }>;
}

export class KPITracker {
  private static instance: KPITracker;
  private kpiData: Map<string, BookingKPI> = new Map();
  private dailyMetrics: Map<string, DailyKPIs> = new Map();

  private constructor() {}

  static getInstance(): KPITracker {
    if (!KPITracker.instance) {
      KPITracker.instance = new KPITracker();
    }
    return KPITracker.instance;
  }

  /**
   * Track a new booking for KPI analysis
   */
  async trackBooking(booking: BookingKPI): Promise<void> {
    try {
      logger.info('[KPI] Tracking new booking', {
        bookingId: booking.bookingId,
        serviceType: booking.serviceType,
        totalValue: booking.totalValue,
        location: `${booking.location.city}, ${booking.location.state}`
      });

      this.kpiData.set(booking.bookingId, booking);
      await this.updateDailyMetrics(booking);
      
      // In production, this would also save to database
      // await this.persistKPI(booking);
      
    } catch (error) {
      logger.error('[KPI] Failed to track booking', {
        bookingId: booking.bookingId,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * Update booking status (e.g., completed, cancelled)
   */
  async updateBookingStatus(bookingId: string, status: BookingKPI['status'], completionDate?: Date): Promise<void> {
    try {
      const booking = this.kpiData.get(bookingId);
      if (!booking) {
        logger.warn('[KPI] Booking not found for status update', { bookingId });
        return;
      }

      booking.status = status;
      if (completionDate) {
        booking.completionDate = completionDate;
      }

      logger.info('[KPI] Updated booking status', {
        bookingId,
        status,
        completionDate: completionDate?.toISOString()
      });

      // Update daily metrics
      await this.updateDailyMetrics(booking);
      
    } catch (error) {
      logger.error('[KPI] Failed to update booking status', {
        bookingId,
        status,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * Generate business metrics for a given period
   */
  async generateBusinessMetrics(
    period: BusinessMetrics['period'],
    startDate: Date,
    endDate: Date
  ): Promise<BusinessMetrics> {
    try {
      logger.info('[KPI] Generating business metrics', {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const bookingsInPeriod = Array.from(this.kpiData.values()).filter(
        booking => booking.bookingDate >= startDate && booking.bookingDate <= endDate
      );

      const completedBookings = bookingsInPeriod.filter(b => b.status === 'completed');
      const cancelledBookings = bookingsInPeriod.filter(b => b.status === 'cancelled');

      // Revenue calculations
      const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalValue, 0);
      const averageRevenuePerBooking = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

      // Customer metrics
      const newCustomers = bookingsInPeriod.filter(b => b.customerSegment === 'new').length;
      const returningCustomers = bookingsInPeriod.filter(b => b.customerSegment === 'returning').length;
      const referredCustomers = bookingsInPeriod.filter(b => b.customerSegment === 'referred').length;

      // Service breakdown
      const serviceBreakdown = this.calculateServiceBreakdown(completedBookings);
      const locationBreakdown = this.calculateLocationBreakdown(completedBookings);
      const timeBreakdown = this.calculateTimeBreakdown(completedBookings);

      const metrics: BusinessMetrics = {
        period,
        startDate,
        endDate,
        
        // Revenue Metrics
        totalRevenue,
        averageRevenuePerBooking,
        revenueGrowthRate: 0, // Would calculate from previous period
        
        // Operational Metrics
        totalBookings: bookingsInPeriod.length,
        completedBookings: completedBookings.length,
        cancellationRate: (cancelledBookings.length / bookingsInPeriod.length) * 100,
        averageBookingTime: this.calculateAverageBookingTime(completedBookings),
        
        // Customer Metrics
        newCustomerRate: (newCustomers / bookingsInPeriod.length) * 100,
        customerRetentionRate: (returningCustomers / (newCustomers + returningCustomers)) * 100,
        referralRate: (referredCustomers / bookingsInPeriod.length) * 100,
        
        // Service Metrics
        mostPopularService: this.getMostPopularService(serviceBreakdown),
        leastPopularService: this.getLeastPopularService(serviceBreakdown),
        averageServiceDistance: this.calculateAverageDistance(completedBookings),
        
        // Pricing Metrics
        averageBasePrice: this.calculateAverageBasePrice(completedBookings),
        averageTravelFee: this.calculateAverageTravelFee(completedBookings),
        averageSignerFees: this.calculateAverageSignerFees(completedBookings),
        totalDiscountsGiven: completedBookings.reduce((sum, b) => sum + b.discounts, 0),
        
        // Geographic Metrics
        topLocations: this.getTopLocations(locationBreakdown),
        
        // Time-based Metrics
        peakHours: this.getPeakHours(timeBreakdown),
        peakDays: this.getPeakDays(completedBookings)
      };

      logger.info('[KPI] Business metrics generated successfully', {
        totalBookings: metrics.totalBookings,
        totalRevenue: metrics.totalRevenue,
        conversionRate: 100 - metrics.cancellationRate
      });

      return metrics;
      
    } catch (error) {
      logger.error('[KPI] Failed to generate business metrics', {
        period,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Get KPIs for a specific date
   */
  async getDailyKPIs(date: string): Promise<DailyKPIs | null> {
    return this.dailyMetrics.get(date) || null;
  }

  /**
   * Export KPI data for external analysis
   */
  async exportKPIData(startDate: Date, endDate: Date, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const bookingsInPeriod = Array.from(this.kpiData.values()).filter(
        booking => booking.bookingDate >= startDate && booking.bookingDate <= endDate
      );

      if (format === 'csv') {
        return this.convertToCSV(bookingsInPeriod);
      }

      return JSON.stringify(bookingsInPeriod, null, 2);
      
    } catch (error) {
      logger.error('[KPI] Failed to export KPI data', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  // Private helper methods

  private async updateDailyMetrics(booking: BookingKPI): Promise<void> {
    const dateKey = booking.bookingDate.toISOString().split('T')[0];
    const existing = this.dailyMetrics.get(dateKey) || this.createEmptyDailyKPIs(dateKey);

    // Update metrics based on booking
    existing.totalBookings++;
    if (booking.status === 'completed') {
      existing.totalRevenue += booking.totalValue;
      existing.totalDistance += booking.distance;
      existing.totalTravelFees += booking.travelFee;
    }

    // Update service breakdown
    if (!existing.serviceBreakdown[booking.serviceType]) {
      existing.serviceBreakdown[booking.serviceType] = { count: 0, revenue: 0 };
    }
    existing.serviceBreakdown[booking.serviceType].count++;
    if (booking.status === 'completed') {
      existing.serviceBreakdown[booking.serviceType].revenue += booking.totalValue;
    }

    // Update location breakdown
    const city = booking.location.city;
    if (!existing.locationBreakdown[city]) {
      existing.locationBreakdown[city] = { count: 0, averageDistance: 0, totalTravelFees: 0 };
    }
    existing.locationBreakdown[city].count++;
    existing.locationBreakdown[city].totalTravelFees += booking.travelFee;

    // Update other metrics
    existing.averageBookingValue = existing.totalRevenue / Math.max(existing.totalBookings, 1);
    
    this.dailyMetrics.set(dateKey, existing);
  }

  private createEmptyDailyKPIs(date: string): DailyKPIs {
    return {
      date,
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      conversionRate: 0,
      newCustomers: 0,
      returningCustomers: 0,
      totalDistance: 0,
      totalTravelFees: 0,
      serviceBreakdown: {},
      locationBreakdown: {},
      timeBreakdown: {}
    };
  }

  private calculateServiceBreakdown(bookings: BookingKPI[]): { [key: string]: { count: number; revenue: number } } {
    return bookings.reduce((breakdown, booking) => {
      if (!breakdown[booking.serviceType]) {
        breakdown[booking.serviceType] = { count: 0, revenue: 0 };
      }
      breakdown[booking.serviceType].count++;
      breakdown[booking.serviceType].revenue += booking.totalValue;
      return breakdown;
    }, {} as { [key: string]: { count: number; revenue: number } });
  }

  private calculateLocationBreakdown(bookings: BookingKPI[]): { [key: string]: { count: number; averageDistance: number; totalTravelFees: number } } {
    const breakdown: { [key: string]: { count: number; totalDistance: number; totalTravelFees: number } } = {};
    
    bookings.forEach(booking => {
      const city = booking.location.city;
      if (!breakdown[city]) {
        breakdown[city] = { count: 0, totalDistance: 0, totalTravelFees: 0 };
      }
      breakdown[city].count++;
      breakdown[city].totalDistance += booking.distance;
      breakdown[city].totalTravelFees += booking.travelFee;
    });

    // Convert to final format with average distance
    return Object.entries(breakdown).reduce((result, [city, data]) => {
      result[city] = {
        count: data.count,
        averageDistance: data.totalDistance / data.count,
        totalTravelFees: data.totalTravelFees
      };
      return result;
    }, {} as { [key: string]: { count: number; averageDistance: number; totalTravelFees: number } });
  }

  private calculateTimeBreakdown(bookings: BookingKPI[]): { [key: string]: number } {
    return bookings.reduce((breakdown, booking) => {
      const hour = booking.bookingDate.getHours().toString();
      breakdown[hour] = (breakdown[hour] || 0) + 1;
      return breakdown;
    }, {} as { [key: string]: number });
  }

  private calculateAverageBookingTime(bookings: BookingKPI[]): number {
    const bookingsWithTime = bookings.filter(b => b.timeToBook > 0);
    if (bookingsWithTime.length === 0) return 0;
    
    const totalTime = bookingsWithTime.reduce((sum, b) => sum + b.timeToBook, 0);
    return totalTime / bookingsWithTime.length;
  }

  private getMostPopularService(breakdown: { [key: string]: { count: number; revenue: number } }): string {
    return Object.entries(breakdown).reduce((max, [service, data]) => 
      data.count > (breakdown[max]?.count || 0) ? service : max, '');
  }

  private getLeastPopularService(breakdown: { [key: string]: { count: number; revenue: number } }): string {
    return Object.entries(breakdown).reduce((min, [service, data]) => 
      data.count < (breakdown[min]?.count || Infinity) ? service : min, '');
  }

  private calculateAverageDistance(bookings: BookingKPI[]): number {
    if (bookings.length === 0) return 0;
    return bookings.reduce((sum, b) => sum + b.distance, 0) / bookings.length;
  }

  private calculateAverageBasePrice(bookings: BookingKPI[]): number {
    if (bookings.length === 0) return 0;
    return bookings.reduce((sum, b) => sum + b.basePrice, 0) / bookings.length;
  }

  private calculateAverageTravelFee(bookings: BookingKPI[]): number {
    if (bookings.length === 0) return 0;
    return bookings.reduce((sum, b) => sum + b.travelFee, 0) / bookings.length;
  }

  private calculateAverageSignerFees(bookings: BookingKPI[]): number {
    if (bookings.length === 0) return 0;
    return bookings.reduce((sum, b) => sum + b.signerFees, 0) / bookings.length;
  }

  private getTopLocations(locationBreakdown: { [key: string]: { count: number; averageDistance: number; totalTravelFees: number } }): Array<{ city: string; bookings: number; revenue: number; averageDistance: number }> {
    return Object.entries(locationBreakdown)
      .map(([city, data]) => ({
        city,
        bookings: data.count,
        revenue: data.totalTravelFees, // Simplified - would include total revenue
        averageDistance: data.averageDistance
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);
  }

  private getPeakHours(timeBreakdown: { [key: string]: number }): Array<{ hour: number; bookings: number }> {
    return Object.entries(timeBreakdown)
      .map(([hour, bookings]) => ({ hour: parseInt(hour), bookings }))
      .sort((a, b) => b.bookings - a.bookings);
  }

  private getPeakDays(bookings: BookingKPI[]): Array<{ dayOfWeek: string; bookings: number }> {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayBreakdown = bookings.reduce((breakdown, booking) => {
      const dayOfWeek = booking.bookingDate.getDay();
      const dayName = dayNames[dayOfWeek];
      breakdown[dayName] = (breakdown[dayName] || 0) + 1;
      return breakdown;
    }, {} as { [key: string]: number });

    return Object.entries(dayBreakdown)
      .map(([dayOfWeek, bookings]) => ({ dayOfWeek, bookings }))
      .sort((a, b) => b.bookings - a.bookings);
  }

  private convertToCSV(bookings: BookingKPI[]): string {
    const headers = [
      'Booking ID', 'Service Type', 'Booking Date', 'Completion Date', 'Status',
      'Total Value', 'Base Price', 'Travel Fee', 'Signer Fees', 'Discounts',
      'Distance', 'City', 'State', 'ZIP', 'Customer Segment', 'Booking Source',
      'Time to Book (min)'
    ];

    const rows = bookings.map(booking => [
      booking.bookingId,
      booking.serviceType,
      booking.bookingDate.toISOString(),
      booking.completionDate?.toISOString() || '',
      booking.status,
      booking.totalValue,
      booking.basePrice,
      booking.travelFee,
      booking.signerFees,
      booking.discounts,
      booking.distance,
      booking.location.city,
      booking.location.state,
      booking.location.zip,
      booking.customerSegment,
      booking.bookingSource,
      booking.timeToBook
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// Export singleton instance
export const kpiTracker = KPITracker.getInstance();