/**
 * Authentication Middleware
 * Houston Mobile Notary Pros API
 * 
 * This middleware provides authentication protection for API routes
 * using JWT tokens and role-based access control.
 */

import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verifies the JWT token in the Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No authentication token provided'
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Invalid token format'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user data to request object
      req.user = decoded;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: 'Token expired'
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: 'Invalid token'
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'Server error during authentication'
    });
  }
};

/**
 * Role-based access control middleware
 * @param {String[]} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export const authorize = (roles = []) => {
  // Convert string to array if single role provided
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authorization failed',
          message: 'User not authenticated'
        });
      }

      // If no specific roles required, any authenticated user can access
      if (roles.length === 0) {
        return next();
      }

      // Check if user exists and has the required role
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { roles: true }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authorization failed',
          message: 'User not found'
        });
      }

      // Check if user has any of the required roles
      const userRoles = user.roles.map(role => role.name);
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization error',
        message: 'Server error during authorization'
      });
    }
  };
};

/**
 * Special middleware for public routes that need authentication when available
 * but don't require it (e.g., getting public calendar slots)
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // If no token, continue as unauthenticated
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user data to request object
      req.user = decoded;
      next();
    } catch (err) {
      // If token is invalid, continue as unauthenticated
      console.debug('Invalid token in optional authentication:', err.message);
      req.user = null;
      next();
    }
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Continue as unauthenticated
    req.user = null;
    next();
  }
};

/**
 * API key authentication for system-to-system integrations
 */
export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'API key is required'
      });
    }

    // Check API key against stored keys
    const validApiKey = await prisma.apiKey.findFirst({
      where: { 
        key: apiKey,
        active: true,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!validApiKey) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid or expired API key'
      });
    }

    // Add API client info to request
    req.apiClient = {
      id: validApiKey.id,
      name: validApiKey.name,
      permissions: validApiKey.permissions || []
    };

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'Server error during API key authentication'
    });
  }
};
