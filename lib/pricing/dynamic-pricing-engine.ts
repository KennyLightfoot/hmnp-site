/**
 * Dynamic Pricing Engine
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Automated pricing adjustments based on demand, weather, urgency, and market conditions
 */

import { logger } from '../logger';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { prisma } from '../prisma';
import { redis } from '../redis';
import { z } from 'zod';

// Dynamic pricing configuration
const DYNAMIC_PRICING_CONFIG = {
  surge: {
    enabled: true,
    maxMultiplier: 2.5,           // Max 2.5x surge pricing
    minMultiplier: 0.8,           // Min 0.8x (20% discount for low demand)
    demandThreshold: 0.7,         // 70% booking capacity triggers surge
    lowDemandThreshold: 0.3       // 30% booking capacity triggers discount
  },
  weather: {
    enabled: true,
    severeSurcharge: 25.00,       // $25 for severe weather
    moderateSurcharge: 10.00,     // $10 for rain/snow
    extremeWeatherMax: 50.00      // Max $50 weather surcharge
  },
  urgency: {
    enabled: true,
    sameDay: 1.5,                 // 1.5x for same-day booking
    nextHour: 2.0,                // 2.0x for next-hour booking
    rush30Min: 3.0                // 3.0x for 30-min rush
  },
  time: {
    peakHours: {
      weekday: [9, 10, 11, 14, 15, 16], // 9-11am, 2-4pm
      multiplier: 1.2               // 20% peak hour surcharge
    },
    afterHours: {
      weekday: { start: 18, end: 8 }, // 6pm - 8am
      weekend: { start: 20, end: 9 }, // 8pm - 9am
      multiplier: 1.4               // 40% after-hours surcharge
    }
  },
  geographic: {
    enabled: true,
    zones: {
      'premium': { multiplier: 1.3, zipcodes: ['77019', '77024', '77056'] }, // River Oaks, Memorial
      'high_demand': { multiplier: 1.1, zipcodes: ['77002', '77010', '77025'] }, // Downtown, Med Center
      'standard': { multiplier: 1.0, zipcodes: [] }, // Default
      'low_demand': { multiplier: 0.9, zipcodes: ['77033', '77076', '77088'] } // Outer areas
    }
  }
} as const;

// Dynamic pricing request schema
const DynamicPricingRequestSchema = z.object({
  serviceType: z.enum(['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH']),
  scheduledDateTime: z.string().datetime(),
  location: z.object({
    zipCode: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }),
  urgency: z.enum(['standard', 'same_day', 'next_hour', 'rush_30min']).default('standard'),
  documentCount: z.number().min(1).default(1),
  signerCount: z.number().min(1).default(1),
  estimatedDuration: z.number().min(15).max(300).default(60),
  customerId: z.string().optional(),
  bookingId: z.string().optional()
});

// Market conditions interface
export interface CompetitorPricing {
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  competitorCount: number;
  lastUpdated: Date;
}

export interface MarketConditions {
  demandLevel: 'low' | 'normal' | 'high' | 'surge';
  demandScore: number; // 0-1 scale
  weatherConditions: WeatherConditions;
  timeMultipliers: TimeMultipliers;
  geographicMultiplier: number;
  competitorPricing?: CompetitorPricing;
}

export interface WeatherConditions {
  current: string; // 'clear', 'rain', 'storm', 'severe'
  severity: number; // 0-10 scale
  temperature: number;
  precipitation: number;
  alerts: string[];
}

export interface TimeMultipliers {
  urgencyMultiplier: number;
  peakHourMultiplier: number;
  afterHoursMultiplier: number;
  seasonalMultiplier: number;
}

export interface DynamicPriceResult {
  basePrice: number;
  adjustments: {
    demandAdjustment: number;
    weatherSurcharge: number;
    urgencyMultiplier: number;
    timeMultipliers: number;
    geographicMultiplier: number;
    totalAdjustment: number;
  };
  finalPrice: number;
  priceBreakdown: PriceBreakdown;
  marketConditions: MarketConditions;
  reasoning: string[];
  expires: Date; // Price quote expiration
}

export interface PriceBreakdown {
  baseService: number;
  demandAdjustment: number;
  weatherSurcharge: number;
  urgencySurcharge: number;
  peakHourSurcharge: number;
  afterHoursSurcharge: number;
  geographicAdjustment: number;
  totalBeforeTax: number;
  tax: number;
  finalTotal: number;
}

/**
 * Dynamic Pricing Engine
 */
export class DynamicPricingEngine {
  private readonly cachePrefix = 'dynamic_pricing:';
  private readonly cacheTTL = 300; // 5 minutes

  /**
   * Calculate dynamic price with all adjustments
   */
  async calculateDynamicPrice(request: z.infer<typeof DynamicPricingRequestSchema>): Promise<DynamicPriceResult> {
    try {
      const validatedRequest = DynamicPricingRequestSchema.parse(request);
      const { serviceType, scheduledDateTime, location, urgency, documentCount, signerCount, estimatedDuration } = validatedRequest;

      // Check cache first
      const cacheKey = this.generateCacheKey(validatedRequest);
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      logger.info('Calculating dynamic price', {
        serviceType,
        scheduledDateTime,
        zipCode: location.zipCode,
        urgency
      });

      // Get base price from existing pricing engine
      const basePrice = await this.getBasePrice(serviceType, documentCount, signerCount, estimatedDuration);

      // Analyze market conditions
      const marketConditions = await this.analyzeMarketConditions(
        new Date(scheduledDateTime),
        location,
        serviceType
      );

      // Calculate all adjustments
      const adjustments = await this.calculateAllAdjustments(
        basePrice,
        marketConditions,
        urgency,
        new Date(scheduledDateTime)
      );

      // Apply adjustments to base price
      const finalPrice = this.applyAdjustments(basePrice, adjustments);

      // Generate price breakdown
      const priceBreakdown = this.generatePriceBreakdown(basePrice, adjustments, finalPrice);

      // Generate reasoning
      const reasoning = this.generatePriceReasoning(adjustments, marketConditions);

      const result: DynamicPriceResult = {
        basePrice,
        adjustments: {
          demandAdjustment: adjustments.demandAdjustment,
          weatherSurcharge: adjustments.weatherSurcharge,
          urgencyMultiplier: adjustments.urgencyMultiplier,
          timeMultipliers: adjustments.timeMultipliers,
          geographicMultiplier: adjustments.geographicMultiplier,
          totalAdjustment: finalPrice - basePrice
        },
        finalPrice,
        priceBreakdown,
        marketConditions,
        reasoning,
        expires: new Date(Date.now() + (30 * 60 * 1000)) // 30-minute quote expiration
      };

      // Cache the result
      await this.cacheResult(cacheKey, result);

      // Log pricing calculation
      await this.logPricingCalculation(validatedRequest, result);

      logger.info('Dynamic price calculated', {
        serviceType,
        basePrice,
        finalPrice,
        totalAdjustment: finalPrice - basePrice,
        demandLevel: marketConditions.demandLevel
      });

      return result;

    } catch (error: any) {
      logger.error('Dynamic pricing calculation failed', {
        error: getErrorMessage(error),
        request: this.sanitizeRequest(request)
      });
      throw error;
    }
  }

  /**
   * Analyze current market conditions
   */
  private async analyzeMarketConditions(
    scheduledDateTime: Date,
    location: any,
    serviceType: string
  ): Promise<MarketConditions> {
    try {
      // Calculate demand level
      const demandData = await this.calculateDemandLevel(scheduledDateTime, location.zipCode, serviceType);
      
      // Get weather conditions
      const weatherConditions = await this.getWeatherConditions(location, scheduledDateTime);
      
      // Calculate time-based multipliers
      const timeMultipliers = this.calculateTimeMultipliers(scheduledDateTime);
      
      // Get geographic multiplier
      const geographicMultiplier = this.getGeographicMultiplier(location.zipCode);

      return {
        demandLevel: demandData.level,
        demandScore: demandData.score,
        weatherConditions,
        timeMultipliers,
        geographicMultiplier
      };

    } catch (error: any) {
      logger.error('Failed to analyze market conditions', { error: getErrorMessage(error) });
      
      // Return default conditions on error
      return {
        demandLevel: 'normal',
        demandScore: 0.5,
        weatherConditions: { current: 'clear', severity: 0, temperature: 75, precipitation: 0, alerts: [] },
        timeMultipliers: { urgencyMultiplier: 1, peakHourMultiplier: 1, afterHoursMultiplier: 1, seasonalMultiplier: 1 },
        geographicMultiplier: 1
      };
    }
  }

  /**
   * Calculate demand level for time slot
   */
  private async calculateDemandLevel(scheduledDateTime: Date, zipCode: string, serviceType: string): Promise<{level: any, score: number}> {
    try {
      // Get time window (±2 hours)
      const startTime = new Date(scheduledDateTime.getTime() - (2 * 60 * 60 * 1000));
      const endTime = new Date(scheduledDateTime.getTime() + (2 * 60 * 60 * 1000));

      // Count bookings in time window
      const bookingCount = await prisma.booking.count({
        where: {
          scheduledDateTime: {
            gte: startTime,
            lte: endTime
          },
          status: {
            in: ['CONFIRMED', 'SCHEDULED', 'IN_PROGRESS']
          }
        }
      });

      // Calculate available slots (assuming 4-hour service window, 1 booking per hour max)
      const availableSlots = 4;
      const demandScore = Math.min(bookingCount / availableSlots, 1);

      let demandLevel: 'low' | 'normal' | 'high' | 'surge';
      if (demandScore >= DYNAMIC_PRICING_CONFIG.surge.demandThreshold) {
        demandLevel = 'surge';
      } else if (demandScore >= 0.5) {
        demandLevel = 'high';
      } else if (demandScore >= DYNAMIC_PRICING_CONFIG.surge.lowDemandThreshold) {
        demandLevel = 'normal';
      } else {
        demandLevel = 'low';
      }

      logger.debug('Demand level calculated', {
        scheduledDateTime,
        zipCode,
        serviceType,
        bookingCount,
        availableSlots,
        demandScore,
        demandLevel
      });

      return { level: demandLevel, score: demandScore };

    } catch (error: any) {
      logger.error('Failed to calculate demand level', { error: getErrorMessage(error) });
      return { level: 'normal', score: 0.5 };
    }
  }

  /**
   * Get weather conditions (simulated for MVP)
   */
  private async getWeatherConditions(location: any, scheduledDateTime: Date): Promise<WeatherConditions> {
    try {
      // In production, this would integrate with OpenWeather or AccuWeather API
      // For MVP, we'll simulate weather based on time and location
      
      const hour = scheduledDateTime.getHours();
      const isEvening = hour >= 18 || hour <= 6;
      const isWinter = [11, 0, 1, 2].includes(scheduledDateTime.getMonth());
      
      // Simulate weather conditions
      let current = 'clear';
      let severity = 0;
      const alerts: string[] = [];
      
      // Simple weather simulation
      if (isWinter && Math.random() > 0.7) {
        current = 'rain';
        severity = Math.random() * 5;
        if (severity > 3) {
          alerts.push('Heavy rain warning');
        }
      } else if (isEvening && Math.random() > 0.9) {
        current = 'storm';
        severity = Math.random() * 3 + 5; // 5-8 severity
        alerts.push('Thunderstorm alert');
      }

      return {
        current,
        severity,
        temperature: isWinter ? 45 + Math.random() * 30 : 70 + Math.random() * 25,
        precipitation: current === 'clear' ? 0 : Math.random() * 100,
        alerts
      };

    } catch (error: any) {
      logger.error('Failed to get weather conditions', { error: getErrorMessage(error) });
      return { current: 'clear', severity: 0, temperature: 75, precipitation: 0, alerts: [] };
    }
  }

  /**
   * Calculate time-based multipliers
   */
  private calculateTimeMultipliers(scheduledDateTime: Date): TimeMultipliers {
    const hour = scheduledDateTime.getHours();
    const dayOfWeek = scheduledDateTime.getDay(); // 0 = Sunday
    const month = scheduledDateTime.getMonth();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isWeekend = !isWeekday;

    // Peak hours multiplier
    let peakHourMultiplier = 1;
    if (isWeekday && DYNAMIC_PRICING_CONFIG.time.peakHours.weekday.includes(hour as any)) {
      peakHourMultiplier = DYNAMIC_PRICING_CONFIG.time.peakHours.multiplier;
    }

    // After hours multiplier
    let afterHoursMultiplier = 1;
    const afterHours = DYNAMIC_PRICING_CONFIG.time.afterHours;
    
    if (isWeekday) {
      if (hour >= afterHours.weekday.start || hour < afterHours.weekday.end) {
        afterHoursMultiplier = afterHours.multiplier;
      }
    } else if (isWeekend) {
      if (hour >= afterHours.weekend.start || hour < afterHours.weekend.end) {
        afterHoursMultiplier = afterHours.multiplier;
      }
    }

    // Seasonal multiplier (higher demand in certain months)
    let seasonalMultiplier = 1;
    if ([11, 0, 3, 4].includes(month)) { // Nov, Dec, Apr, May (real estate season)
      seasonalMultiplier = 1.1;
    }

    return {
      urgencyMultiplier: 1, // Will be calculated separately
      peakHourMultiplier,
      afterHoursMultiplier,
      seasonalMultiplier
    };
  }

  /**
   * Get geographic pricing multiplier
   */
  private getGeographicMultiplier(zipCode: string): number {
    const zones = DYNAMIC_PRICING_CONFIG.geographic.zones;
    
    for (const [zoneName, zoneConfig] of Object.entries(zones)) {
      if ((zoneConfig.zipcodes as any).includes(zipCode)) {
        return zoneConfig.multiplier;
      }
    }
    
    return zones.standard.multiplier; // Default
  }

  /**
   * Calculate all pricing adjustments
   */
  private async calculateAllAdjustments(
    basePrice: number,
    marketConditions: MarketConditions,
    urgency: string,
    scheduledDateTime: Date
  ): Promise<any> {
    // Demand-based adjustment
    let demandAdjustment = 0;
    if (marketConditions.demandLevel === 'surge') {
      const multiplier = Math.min(
        1 + marketConditions.demandScore,
        DYNAMIC_PRICING_CONFIG.surge.maxMultiplier
      );
      demandAdjustment = basePrice * (multiplier - 1);
    } else if (marketConditions.demandLevel === 'low') {
      const multiplier = Math.max(
        DYNAMIC_PRICING_CONFIG.surge.minMultiplier,
        marketConditions.demandScore
      );
      demandAdjustment = basePrice * (multiplier - 1); // Will be negative
    }

    // Weather surcharge
    let weatherSurcharge = 0;
    if (DYNAMIC_PRICING_CONFIG.weather.enabled) {
      const weather = marketConditions.weatherConditions;
      if (weather.severity >= 7) {
        weatherSurcharge = Math.min(
          DYNAMIC_PRICING_CONFIG.weather.severeSurcharge + (weather.severity - 7) * 5,
          DYNAMIC_PRICING_CONFIG.weather.extremeWeatherMax
        );
      } else if (weather.severity >= 3) {
        weatherSurcharge = DYNAMIC_PRICING_CONFIG.weather.moderateSurcharge;
      }
    }

    // Urgency multiplier
    let urgencyMultiplier = 1;
    if (DYNAMIC_PRICING_CONFIG.urgency.enabled) {
      const urgencyConfig = DYNAMIC_PRICING_CONFIG.urgency;
      switch (urgency) {
        case 'same_day':
          urgencyMultiplier = urgencyConfig.sameDay;
          break;
        case 'next_hour':
          urgencyMultiplier = urgencyConfig.nextHour;
          break;
        case 'rush_30min':
          urgencyMultiplier = urgencyConfig.rush30Min;
          break;
      }
    }

    // Time-based multipliers
    const timeMultipliers = marketConditions.timeMultipliers.peakHourMultiplier * 
                           marketConditions.timeMultipliers.afterHoursMultiplier * 
                           marketConditions.timeMultipliers.seasonalMultiplier;

    // Geographic multiplier
    const geographicMultiplier = marketConditions.geographicMultiplier;

    return {
      demandAdjustment,
      weatherSurcharge,
      urgencyMultiplier,
      timeMultipliers,
      geographicMultiplier
    };
  }

  /**
   * Apply all adjustments to base price
   */
  private applyAdjustments(basePrice: number, adjustments: any): number {
    let finalPrice = basePrice;
    
    // Apply demand adjustment (additive)
    finalPrice += adjustments.demandAdjustment;
    
    // Apply weather surcharge (additive)
    finalPrice += adjustments.weatherSurcharge;
    
    // Apply multipliers (multiplicative)
    finalPrice *= adjustments.urgencyMultiplier;
    finalPrice *= adjustments.timeMultipliers;
    finalPrice *= adjustments.geographicMultiplier;
    
    // Ensure minimum price (never go below 50% of base)
    finalPrice = Math.max(finalPrice, basePrice * 0.5);
    
    // Round to nearest dollar
    return Math.round(finalPrice * 100) / 100;
  }

  // Helper methods continue in next part...
  private async getBasePrice(serviceType: string, documentCount: number, signerCount: number, estimatedDuration: number): Promise<number> {
    // Integration with existing pricing engine
    const basePrices = {
      'STANDARD_NOTARY': 75,
      'EXTENDED_HOURS': 100,
      'LOAN_SIGNING': 150,
      'RON_SERVICES': 125
    };
    
    let basePrice = basePrices[serviceType as keyof typeof basePrices] || 75;
    
    // Add document count surcharge
    if (documentCount > 1) {
      basePrice += (documentCount - 1) * 10;
    }
    
    // Add signer count surcharge
    if (signerCount > 1) {
      basePrice += (signerCount - 1) * 15;
    }
    
    // Add duration surcharge for long sessions
    if (estimatedDuration > 60) {
      basePrice += Math.ceil((estimatedDuration - 60) / 30) * 25;
    }
    
    return basePrice;
  }

  private generatePriceBreakdown(basePrice: number, adjustments: any, finalPrice: number): PriceBreakdown {
    const totalBeforeTax = finalPrice;
    const tax = totalBeforeTax * 0.0825; // 8.25% Texas sales tax
    const finalTotal = totalBeforeTax + tax;

    return {
      baseService: basePrice,
      demandAdjustment: adjustments.demandAdjustment,
      weatherSurcharge: adjustments.weatherSurcharge,
      urgencySurcharge: basePrice * (adjustments.urgencyMultiplier - 1),
      peakHourSurcharge: 0, // Included in time multipliers
      afterHoursSurcharge: 0, // Included in time multipliers
      geographicAdjustment: basePrice * (adjustments.geographicMultiplier - 1),
      totalBeforeTax,
      tax,
      finalTotal
    };
  }

  private generatePriceReasoning(adjustments: any, marketConditions: MarketConditions): string[] {
    const reasoning: string[] = [];

    if (adjustments.demandAdjustment > 0) {
      reasoning.push(`High demand surcharge: ${marketConditions.demandLevel} demand in time slot`);
    } else if (adjustments.demandAdjustment < 0) {
      reasoning.push(`Low demand discount: ${marketConditions.demandLevel} demand in time slot`);
    }

    if (adjustments.weatherSurcharge > 0) {
      reasoning.push(`Weather surcharge: ${marketConditions.weatherConditions.current} conditions`);
    }

    if (adjustments.urgencyMultiplier > 1) {
      reasoning.push(`Urgency surcharge: ${((adjustments.urgencyMultiplier - 1) * 100).toFixed(0)}% for short notice`);
    }

    if (adjustments.timeMultipliers > 1) {
      reasoning.push(`Time-based surcharge: Peak hours or after-hours service`);
    }

    if (adjustments.geographicMultiplier !== 1) {
      const change = ((adjustments.geographicMultiplier - 1) * 100).toFixed(0);
      reasoning.push(`Geographic adjustment: ${change}% for service area`);
    }

    if (reasoning.length === 0) {
      reasoning.push('Standard pricing applies');
    }

    return reasoning;
  }

  private generateCacheKey(request: any): string {
    const key = `${request.serviceType}:${request.scheduledDateTime}:${request.location.zipCode}:${request.urgency}`;
    return `${this.cachePrefix}${Buffer.from(key).toString('base64')}`;
  }

  private async getFromCache(key: string): Promise<DynamicPriceResult | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private async cacheResult(key: string, result: DynamicPriceResult): Promise<void> {
    try {
      await redis.setex(key, this.cacheTTL, JSON.stringify(result));
    } catch (error) {
      logger.error('Failed to cache pricing result', { error });
    }
  }

  private async logPricingCalculation(request: any, result: DynamicPriceResult): Promise<void> {
    try {
      // Note: dynamicPricingLog model doesn't exist in schema
      // In a real implementation, you'd create this model or use an alternative
      logger.info('Dynamic pricing calculation would be logged', {
        serviceType: request.serviceType,
        basePrice: result.basePrice,
        finalPrice: result.finalPrice,
        bookingId: request.bookingId
      });
    } catch (error) {
      logger.error('Failed to log pricing calculation', { error });
    }
  }

  private sanitizeRequest(request: any): any {
    return {
      ...request,
      customerId: request.customerId ? '***' : undefined
    };
  }
}

// Singleton instance
export const dynamicPricingEngine = new DynamicPricingEngine();
