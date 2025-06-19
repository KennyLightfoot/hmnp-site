/**
 * Calendar Routes
 * Houston Mobile Notary Pros API
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
// Import permissionAdapter with development mode middlewares
import permissionAdapter from '../middleware/permissionAdapter.js';

const router = express.Router();
const prisma = new PrismaClient();

// Extract permission checking functions and constants
const { 
  checkPermission, 
  PERMISSIONS, 
  devAuthenticate: authenticate, 
  devOptionalAuthenticate: optionalAuthenticate,
  isDevelopment
} = permissionAdapter;

// Log development mode if enabled
if (isDevelopment) {
  console.warn('⚠️ CALENDAR ROUTES: Running in DEVELOPMENT mode with simulated ADMIN permissions');
}

/**
 * Validation middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * GET /api/calendar/available-slots
 * Returns open slots and existing bookings for a specific date range
 * Public endpoint with optional authentication for additional features
 */
router.get('/available-slots', [
  optionalAuthenticate, // Allow both authenticated and non-authenticated access
  query('serviceType').optional().isString(),
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  query('duration').optional().isInt({ min: 15, max: 240 }).withMessage('Duration must be between 15 and 240 minutes'),
  query('timezone').optional().isString(),
  query('calendarId').optional().isString(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      serviceType,
      duration = 60,
      timezone = 'America/Chicago',
      calendarId
    } = req.query;

    // Parse dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // Get business settings for max bookings per day
    const maxBookingsPerDaySetting = await prisma.businessSettings.findFirst({
      where: {
        key: 'maxBookingsPerDay',
        category: 'booking'
      }
    });
    
    const maxBookingsPerDay = maxBookingsPerDaySetting ? parseInt(maxBookingsPerDaySetting.value) : 10;
    
    // Get weekend availability settings
    const allowWeekendsSettings = await prisma.businessSettings.findFirst({
      where: {
        key: 'allowWeekendBookings',
        category: 'booking'
      }
    });
    
    const allowWeekends = allowWeekendsSettings ? allowWeekendsSettings.value === 'true' : true;

    // If weekends are not allowed, check if date falls on weekend
    const dayOfWeek = startDateTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
    
    if (!allowWeekends && isWeekend) {
      return res.json({
        success: false,
        message: 'Weekend bookings are not available',
        availableSlots: []
      });
    }

    // Get service-specific date range restrictions
    let service = null;
    if (serviceType || calendarId) {
      service = await prisma.service.findFirst({
        where: {
          ...(serviceType && { serviceType }),
          ...(calendarId && { id: calendarId }),
          isActive: true
        }
      });
    }

    // Find existing bookings for the date range
    const existingBookings = await prisma.booking.findMany({
      where: {
        scheduledDateTime: {
          gte: startDateTime,
          lte: endDateTime
        },
        status: {
          notIn: ['CANCELLED_BY_CLIENT', 'CANCELLED_BY_STAFF', 'ARCHIVED', 'NO_SHOW']
        }
      },
      select: {
        id: true,
        scheduledDateTime: true,
        serviceId: true,
        clientId: true, // Added to check ownership
        service: {
          select: {
            name: true,
            durationMinutes: true
          }
        },
        // Only provide client info if the user is authenticated and has proper permissions
        ...(req.user && (req.user.roles.some(role => ['ADMIN', 'STAFF'].includes(role.name))) ? {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        } : {})
      }
    });

    // Count bookings for the requested day
    const bookingsThisDay = existingBookings.length;
    
    // If max bookings reached, return no available slots
    if (bookingsThisDay >= maxBookingsPerDay) {
      return res.json({
        success: false,
        message: 'Maximum bookings reached for this day',
        availableSlots: []
      });
    }

    // Generate standard business hours time slots (30-minute intervals)
    const availableSlots = [];
    const slotDurationMinutes = 30; // Default slot size
    
    // Business hours: 8:00 AM to 6:00 PM (adjust based on settings)
    const businessStartHour = 8;
    const businessEndHour = 18;
    
    const slotsDate = new Date(startDateTime);
    slotsDate.setHours(businessStartHour, 0, 0, 0); // Start at 8:00 AM
    
    // Create slots until end of business day
    while (slotsDate.getHours() < businessEndHour) {
      const slotStart = new Date(slotsDate);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + (parseInt(duration) || slotDurationMinutes));
      
      // Check if this slot conflicts with any existing booking
      const isConflicted = existingBookings.some(booking => {
        const bookingStart = new Date(booking.scheduledDateTime);
        const bookingEnd = new Date(bookingStart);
        bookingEnd.setMinutes(bookingStart.getMinutes() + (booking.service.durationMinutes || 60));
        
        // Check for overlap
        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) || 
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });
      
      if (!isConflicted) {
        availableSlots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          duration: parseInt(duration) || slotDurationMinutes
        });
      }
      
      // Move to next slot
      slotsDate.setMinutes(slotsDate.getMinutes() + slotDurationMinutes);
    }

    res.json({
      success: true,
      message: 'Available slots retrieved successfully',
      serviceName: service?.name || 'Notary Service',
      availableSlots,
      existingBookings: existingBookings.map(booking => {
        // Basic booking information for anyone
        const bookingInfo = {
          id: booking.id,
          startTime: booking.scheduledDateTime.toISOString(),
          duration: booking.service?.durationMinutes || 60,
          serviceType: booking.service?.name || 'Booking'
        };
        
        // Add client information if authorized
        if (req.user && 
            (req.user.roles.some(role => ['ADMIN', 'STAFF'].includes(role.name)) || 
             (booking.clientId === req.user.id))) {
          bookingInfo.isUserOwned = booking.clientId === req.user.id;
          
          // Add client info for admin/staff
          if (req.user.roles.some(role => ['ADMIN', 'STAFF'].includes(role.name)) && booking.client) {
            bookingInfo.client = {
              id: booking.client.id,
              name: `${booking.client.firstName} ${booking.client.lastName}`,
              email: booking.client.email
            };
          }
        }
        
        return bookingInfo;
      }),
      metadata: {
        date: startDateTime.toISOString().split('T')[0],
        serviceType: serviceType || 'all',
        maxBookingsPerDay,
        currentBookingsCount: bookingsThisDay,
        timezone,
        isAuthenticated: !!req.user,
        userRoles: req.user ? req.user.roles.map(role => role.name) : []
      }
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve available slots'
    });
  }
}));

/**
 * GET /api/calendar/service-settings
 * Returns service-specific calendar settings and restrictions
 */
router.get('/service-settings', [
  optionalAuthenticate, // Allow public access with enhanced info for authenticated users
  query('serviceId').optional().isString(),
  query('serviceType').optional().isString(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { serviceId, serviceType } = req.query;
    
    // Get the service
    const service = serviceId || serviceType ? await prisma.service.findFirst({
      where: {
        ...(serviceId && { id: serviceId }),
        ...(serviceType && { serviceType }),
        isActive: true
      }
    }) : null;
    
    // Get global business settings related to calendar
    const businessSettings = await prisma.businessSettings.findMany({
      where: {
        category: 'booking'
      }
    });
    
    // Convert settings to a more usable format
    const settings = {};
    businessSettings.forEach(setting => {
      // Convert based on dataType
      let value = setting.value;
      if (setting.dataType === 'number') {
        value = parseFloat(setting.value);
      } else if (setting.dataType === 'boolean') {
        value = setting.value === 'true';
      } else if (setting.dataType === 'json') {
        try {
          value = JSON.parse(setting.value);
        } catch (e) {
          console.warn(`Failed to parse JSON setting ${setting.key}`, e);
        }
      }
      settings[setting.key] = value;
    });
    
    // Extract specific calendar settings
    const calendarSettings = {
      maxBookingsPerDay: parseInt(settings.maxBookingsPerDay || '10'),
      allowWeekendBookings: settings.allowWeekendBookings === true,
      minAdvanceBookingHours: parseInt(settings.minAdvanceBookingHours || '24'),
      maxAdvanceBookingDays: parseInt(settings.maxAdvanceBookingDays || '30'),
      businessStartHour: parseInt(settings.businessStartHour || '8'),
      businessEndHour: parseInt(settings.businessEndHour || '18'),
      businessTimeZone: settings.businessTimeZone || 'America/Chicago',
      blackoutDates: settings.blackoutDates || [],
      holidayRestrictions: settings.holidayRestrictions || 'allow',
      slotDurationMinutes: parseInt(settings.slotDurationMinutes || '30')
    };
    
    // Add service-specific restrictions if a service was found
    const serviceRestrictions = service ? {
      serviceName: service.name,
      serviceId: service.id,
      serviceType: service.serviceType,
      durationMinutes: service.durationMinutes,
      customRestrictions: service.restrictions || {},
      externalCalendarId: service.externalCalendarId
    } : null;
    
    res.json({
      success: true,
      message: 'Calendar settings retrieved successfully',
      settings: calendarSettings,
      serviceRestrictions,
      metadata: {
        requestedService: serviceId || serviceType || 'global',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting calendar settings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve calendar settings'
    });
  }
}));

/**
 * POST /api/calendar/settings
 * Creates or updates calendar settings
 * Protected: Requires ADMIN or STAFF role with calendar management permission
 */
router.post('/settings', [
  authenticate, // Must be authenticated
  checkPermission([CalendarPermissions.MANAGE_SETTINGS]), // Must have calendar settings management permission
  query('serviceId').optional().isString(),
  query('serviceType').optional().isString(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { serviceId, serviceType } = req.query;
    const settings = req.body;
    
    if (!settings || Object.keys(settings).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No settings provided'
      });
    }
    
    // Validate required fields
    const requiredFields = ['category'];
    const missingFields = requiredFields.filter(field => !settings[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Check if updating service-specific settings or global settings
    const isServiceSpecific = Boolean(serviceId || serviceType);
    let service = null;
    
    if (isServiceSpecific) {
      // Get the service first
      service = await prisma.service.findFirst({
        where: {
          ...(serviceId && { id: serviceId }),
          ...(serviceType && { serviceType })
        }
      });
      
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      
      // Update service-specific calendar settings
      const updatedService = await prisma.service.update({
        where: { id: service.id },
        data: {
          restrictions: {
            ...(service.restrictions || {}),
            calendar: {
              ...(service.restrictions?.calendar || {}),
              ...settings
            }
          }
        }
      });
      
      return res.json({
        success: true,
        message: 'Service calendar settings updated successfully',
        serviceId: updatedService.id,
        settings: updatedService.restrictions?.calendar || {}
      });
    }
    
    // Handle global business settings updates
    const settingsUpdates = Object.entries(settings)
      .filter(([key]) => key !== 'category') // Skip the category field itself
      .map(([key, value]) => {
        // Determine dataType based on the value
        let dataType = 'string';
        if (typeof value === 'number') {
          dataType = 'number';
          value = value.toString();
        } else if (typeof value === 'boolean') {
          dataType = 'boolean';
          value = value.toString();
        } else if (typeof value === 'object') {
          dataType = 'json';
          value = JSON.stringify(value);
        }
        
        return prisma.businessSettings.upsert({
          where: {
            key_category: {
              key,
              category: settings.category
            }
          },
          update: { value, dataType },
          create: {
            key,
            category: settings.category,
            value,
            dataType
          }
        });
      });
    
    // Execute all upserts in a single transaction
    await prisma.$transaction(settingsUpdates);
    
    // Return the updated settings
    const updatedSettings = await prisma.businessSettings.findMany({
      where: { category: settings.category }
    });
    
    res.json({
      success: true,
      message: 'Calendar settings updated successfully',
      settings: updatedSettings.reduce((acc, setting) => {
        // Parse values based on dataType
        let value = setting.value;
        
        if (setting.dataType === 'number') {
          value = parseFloat(value);
        } else if (setting.dataType === 'boolean') {
          value = value === 'true';
        } else if (setting.dataType === 'json') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn(`Failed to parse JSON setting ${setting.key}`, e);
          }
        }
        
        acc[setting.key] = value;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error updating calendar settings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update calendar settings'
    });
  }
}));

/**
 * DELETE /api/calendar/settings
 * Deletes a specific calendar setting
 * Protected: Requires ADMIN or STAFF role with calendar management permission
 */
router.delete('/settings', [
  authenticate, // Must be authenticated
  checkPermission([CalendarPermissions.MANAGE_SETTINGS]), // Must have calendar settings management permission
  query('key').isString().withMessage('Setting key is required'),
  query('category').isString().withMessage('Setting category is required'),
  query('serviceId').optional().isString(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { key, category, serviceId } = req.query;
    
    // Check if deleting service-specific setting or global setting
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });
      
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      
      // Update service by removing the specific calendar setting
      const restrictions = service.restrictions || {};
      const calendarSettings = restrictions.calendar || {};
      
      if (calendarSettings && calendarSettings[key] !== undefined) {
        delete calendarSettings[key];
        
        await prisma.service.update({
          where: { id: serviceId },
          data: {
            restrictions: {
              ...restrictions,
              calendar: calendarSettings
            }
          }
        });
        
        return res.json({
          success: true,
          message: `Service calendar setting '${key}' deleted successfully`,
          serviceId
        });
      }
      
      return res.status(404).json({
        success: false,
        message: `Setting '${key}' not found for this service`
      });
    }
    
    // Delete global business setting
    const deletedSetting = await prisma.businessSettings.deleteMany({
      where: {
        key,
        category
      }
    });
    
    if (deletedSetting.count > 0) {
      res.json({
        success: true,
        message: `Calendar setting '${key}' deleted successfully`,
        deletedCount: deletedSetting.count
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Setting '${key}' not found in category '${category}'`
      });
    }
  } catch (error) {
    console.error('Error deleting calendar setting:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete calendar setting'
    });
  }
}));

/**
 * GET /api/calendar/admin/overview
 * Admin endpoint to get calendar overview with extended booking information
 * Protected: Requires ADMIN or STAFF role
 */
router.get('/admin/overview', [
  authenticate, // Must be authenticated
  checkPermission([PERMISSIONS.CALENDAR.BOOKINGS_VIEW, PERMISSIONS.CALENDAR.SETTINGS_MANAGE]), // Admin permission check
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    // Default to current month if no dates provided
    const now = new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const limit = req.query.limit || 50;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;

    // Get all bookings within date range with extended details
    const bookings = await prisma.booking.findMany({
      where: {
        scheduledDateTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        service: true,
        location: true,
        documents: true
      },
      orderBy: {
        scheduledDateTime: 'asc'
      },
      skip,
      take: limit
    });

    // Count total bookings for pagination
    const totalBookings = await prisma.booking.count({
      where: {
        scheduledDateTime: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get calendar settings
    const calendarSettings = await prisma.businessSettings.findMany({
      where: {
        category: 'calendar'
      }
    });

    // Transform settings into a more usable format
    const settings = {};
    calendarSettings.forEach(setting => {
      let value = setting.value;
      
      if (setting.dataType === 'number') {
        value = parseFloat(value);
      } else if (setting.dataType === 'boolean') {
        value = value === 'true';
      } else if (setting.dataType === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.warn(`Failed to parse JSON setting ${setting.key}`, e);
        }
      }
      
      settings[setting.key] = value;
    });

    // Calculate some statistics
    const bookingsByStatus = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      message: 'Calendar overview retrieved successfully',
      bookings,
      pagination: {
        total: totalBookings,
        page,
        limit,
        pages: Math.ceil(totalBookings / limit)
      },
      settings,
      statistics: {
        totalBookings: totalBookings,
        bookingsByStatus,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving calendar overview:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve calendar overview'
    });
  }
}));

export default router;
