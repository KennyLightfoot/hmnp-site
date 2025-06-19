/**
 * Admin Routes
 * Houston Mobile Notary Pros API
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

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
 * POST /api/admin/business-settings
 * Save business settings including calendar settings
 */
router.post('/business-settings', [
  body('settings').isArray().withMessage('Settings must be an array'),
  body('settings.*.key').isString().withMessage('Setting key must be a string'),
  body('settings.*.value').isString().withMessage('Setting value must be a string'),
  body('settings.*.dataType').isIn(['string', 'number', 'boolean', 'json']).withMessage('Invalid data type'),
  body('settings.*.category').isString().withMessage('Category must be a string'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { settings } = req.body;
    
    // Get current user from session (admin check would be here in production)
    // In a real app with auth:
    // if (!req.user || req.user.role !== 'ADMIN') {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Forbidden',
    //     message: 'You do not have permission to update business settings'
    //   });
    // }

    // Process each setting
    const results = await Promise.all(settings.map(async (setting) => {
      const { key, value, dataType, category } = setting;

      // Check if setting already exists
      const existingSetting = await prisma.businessSettings.findFirst({
        where: { key }
      });

      if (existingSetting) {
        // Update existing setting
        return await prisma.businessSettings.update({
          where: { id: existingSetting.id },
          data: {
            value,
            dataType,
            category,
            updatedAt: new Date(),
            // updatedById: req.user.id // In a real app with auth
          }
        });
      } else {
        // Create new setting
        return await prisma.businessSettings.create({
          data: {
            key,
            value,
            dataType,
            category,
            // updatedById: req.user.id // In a real app with auth
          }
        });
      }
    }));

    res.json({
      success: true,
      message: 'Business settings updated successfully',
      updatedSettings: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating business settings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update business settings'
    });
  }
}));

/**
 * GET /api/admin/business-settings
 * Get business settings by category
 */
router.get('/business-settings', asyncHandler(async (req, res) => {
  try {
    const { category } = req.query;
    
    // Prepare filter
    const filter = category ? { where: { category } } : {};
    
    // Get settings
    const settings = await prisma.businessSettings.findMany({
      ...filter,
      orderBy: { key: 'asc' }
    });
    
    // Convert to structured format by category
    const structuredSettings = {};
    
    settings.forEach(setting => {
      const category = setting.category || 'general';
      
      if (!structuredSettings[category]) {
        structuredSettings[category] = {};
      }
      
      // Convert value based on dataType
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
      
      structuredSettings[category][setting.key] = value;
    });
    
    res.json({
      success: true,
      settings: structuredSettings,
      metadata: {
        timestamp: new Date().toISOString(),
        filter: category ? { category } : 'all'
      }
    });
    
  } catch (error) {
    console.error('Error getting business settings:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get business settings'
    });
  }
}));

export default router;
