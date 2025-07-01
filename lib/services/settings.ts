import { PrismaClient } from '@prisma/client';
import { cache } from '@/lib/cache';

const prisma = new PrismaClient();

export interface BusinessHours {
  monday: { open: string; close: string; enabled: boolean };
  tuesday: { open: string; close: string; enabled: boolean };
  wednesday: { open: string; close: string; enabled: boolean };
  thursday: { open: string; close: string; enabled: boolean };
  friday: { open: string; close: string; enabled: boolean };
  saturday: { open: string; close: string; enabled: boolean };
  sunday: { open: string; close: string; enabled: boolean };
}

export interface BookingSettings {
  bufferTimeMinutes: number;
  leadTimeHours: number;
  advanceBookingDays: number;
  businessHours: BusinessHours;
  holidays: string[]; // Array of dates in YYYY-MM-DD format
  timeSlotInterval: number; // Minutes between available time slots
}

class SettingsService {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private parseValue(value: string, dataType: string): any {
    switch (dataType) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? cached.expiry > Date.now() : false;
  }

  async getSetting<T = any>(key: string, defaultValue?: T): Promise<T> {
    // Check memory cache first
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.value;
    }

    // Check Redis cache
    const redisCacheKey = `settings:${key}`;
    const redisCached = await cache.get(redisCacheKey);
    if (redisCached !== null) {
      // Store in memory cache for faster access
      this.cache.set(key, {
        value: redisCached,
        expiry: Date.now() + this.CACHE_TTL
      });
      return redisCached;
    }

    try {
      const setting = await prisma.businessSettings.findUnique({
        where: { key }
      });

      if (!setting) {
        return defaultValue as T;
      }

      const parsedValue = this.parseValue(setting.value, setting.dataType);
      
      // Cache in memory
      this.cache.set(key, {
        value: parsedValue,
        expiry: Date.now() + this.CACHE_TTL
      });

      // Cache in Redis for longer persistence
      await cache.set(redisCacheKey, parsedValue, {
        ttl: 1800, // 30 minutes
        tags: ['settings', 'business-config']
      });

      return parsedValue;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return defaultValue as T;
    }
  }

  async setSetting(key: string, value: any, dataType: string = 'string', description?: string, category?: string, updatedById?: string): Promise<void> {
    try {
      const stringValue = dataType === 'json' ? JSON.stringify(value) : String(value);
      
      await prisma.businessSettings.upsert({
        where: { key },
        create: {
          key,
          value: stringValue,
          dataType,
          description,
          category,
          updatedById
        },
        update: {
          value: stringValue,
          dataType,
          description,
          category,
          updatedById
        }
      });

      // Clear both memory and Redis cache for this key
      this.cache.delete(key);
      await cache.delete(`settings:${key}`);
      
      // Also invalidate related cache tags
      await cache.invalidateByTags(['settings', 'business-config']);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  async getBookingSettings(): Promise<BookingSettings> {
    const [
      bufferTimeMinutes,
      leadTimeHours,
      advanceBookingDays,
      businessHours,
      holidays,
      timeSlotInterval
    ] = await Promise.all([
      this.getSetting('booking.bufferTimeMinutes', 15),
      this.getSetting('booking.leadTimeHours', 2),
      this.getSetting('booking.advanceBookingDays', 60),
      this.getSetting('booking.businessHours', this.getDefaultBusinessHours()),
      this.getSetting('booking.holidays', []),
      this.getSetting('booking.timeSlotInterval', 30)
    ]);

    return {
      bufferTimeMinutes,
      leadTimeHours,
      advanceBookingDays,
      businessHours,
      holidays,
      timeSlotInterval
    };
  }

  private getDefaultBusinessHours(): BusinessHours {
    return {
      monday: { open: '08:00', close: '18:00', enabled: true },
      tuesday: { open: '08:00', close: '18:00', enabled: true },
      wednesday: { open: '08:00', close: '18:00', enabled: true },
      thursday: { open: '08:00', close: '18:00', enabled: true },
      friday: { open: '08:00', close: '18:00', enabled: true },
      saturday: { open: '10:00', close: '16:00', enabled: true },
      sunday: { open: '12:00', close: '16:00', enabled: false }
    };
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: 'booking.bufferTimeMinutes',
        value: '15',
        dataType: 'number',
        description: 'Buffer time between appointments in minutes',
        category: 'booking'
      },
      {
        key: 'booking.leadTimeHours',
        value: '2',
        dataType: 'number',
        description: 'Minimum lead time required for bookings in hours',
        category: 'booking'
      },
      {
        key: 'booking.advanceBookingDays',
        value: '60',
        dataType: 'number',
        description: 'Maximum days in advance bookings can be made',
        category: 'booking'
      },
      {
        key: 'booking.businessHours',
        value: JSON.stringify(this.getDefaultBusinessHours()),
        dataType: 'json',
        description: 'Business operating hours by day of week',
        category: 'booking'
      },
      {
        key: 'booking.holidays',
        value: JSON.stringify([]),
        dataType: 'json',
        description: 'Array of holiday dates (YYYY-MM-DD format)',
        category: 'booking'
      },
      {
        key: 'booking.timeSlotInterval',
        value: '30',
        dataType: 'number',
        description: 'Time interval between available slots in minutes',
        category: 'booking'
      },
      {
        key: 'payment.depositRequired',
        value: 'true',
        dataType: 'boolean',
        description: 'Whether deposits are required for bookings',
        category: 'payment'
      },
      {
        key: 'payment.defaultDepositAmount',
        value: '25.00',
        dataType: 'number',
        description: 'Default deposit amount in dollars',
        category: 'payment'
      }
    ];

    for (const setting of defaultSettings) {
      const existing = await prisma.businessSettings.findUnique({
        where: { key: setting.key }
      });

      if (!existing) {
        await prisma.businessSettings.create({
          data: setting
        });
      }
    }
  }

  // Helper method to check if a given date/time is within business hours
  isWithinBusinessHours(date: Date, businessHours: BusinessHours): boolean {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof BusinessHours;
    const daySettings = businessHours[dayName];
    
    if (!daySettings.enabled) {
      return false;
    }

    const timeString = date.toTimeString().substring(0, 5); // HH:MM format
    return timeString >= daySettings.open && timeString <= daySettings.close;
  }

  // Helper method to check if a date is a holiday
  isHoliday(date: Date, holidays: string[]): boolean {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    return holidays.includes(dateString);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const settingsService = new SettingsService();
export default settingsService; 