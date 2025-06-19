/**
 * Permission Checker Middleware
 * Houston Mobile Notary Pros API
 * 
 * This middleware provides granular permission checks for API endpoints
 * based on user roles and specific permissions.
 */

import { APIError } from './errorHandler.js';

/**
 * Check if user has the required permission
 * @param {Array} requiredPermissions - Array of permissions to check for
 * @returns {Function} Express middleware
 */
export const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    // Skip check if no permissions required
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return next();
    }
    
    // Must be authenticated to check permissions
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    // Get user permissions from roles
    const userPermissions = getUserPermissions(req.user);
    
    // Check if user has at least one of the required permissions (OR logic)
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission));
    
    // If user doesn't have required permissions
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Permission Denied',
        message: 'You do not have permission to perform this action'
      });
    }
    
    // User has permission, proceed
    next();
  };
};

/**
 * Check if specific resource belongs to user
 * @param {Function} resourceAccessor - Function to access resource owner ID from request
 * @param {Array} bypassRoles - Array of roles that bypass ownership check
 * @returns {Function} Express middleware
 */
export const checkResourceOwnership = (resourceAccessor, bypassRoles = ['ADMIN', 'STAFF']) => {
  return async (req, res, next) => {
    // Skip for non-authenticated users (will be caught by auth middleware)
    if (!req.user) {
      return next();
    }
    
    // Check if user has bypass roles
    const hasAdminRole = req.user.roles.some(role => 
      bypassRoles.includes(role.name));
    
    // Admin/Staff users bypass ownership check
    if (hasAdminRole) {
      return next();
    }
    
    try {
      // Get the owner ID of the resource (could be a Promise)
      const resourceOwnerId = await resourceAccessor(req);
      
      // If no owner ID, let it pass (might be a creation endpoint)
      if (!resourceOwnerId) {
        return next();
      }
      
      // Check if user is the owner
      if (resourceOwnerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied',
          message: 'You do not have permission to access this resource'
        });
      }
      
      // User is owner, proceed
      next();
    } catch (err) {
      next(new APIError(`Error checking resource ownership: ${err.message}`, 500));
    }
  };
};

/**
 * Get all permissions from user roles
 * @param {Object} user - User object with roles
 * @returns {Array} Array of permission strings
 */
const getUserPermissions = (user) => {
  if (!user || !user.roles) {
    return [];
  }
  
  // Flatten all permissions from all roles
  return user.roles.reduce((allPermissions, role) => {
    return [...allPermissions, ...(role.permissions || [])];
  }, []);
};

/**
 * Permission constants for calendar operations
 */
export const CalendarPermissions = {
  VIEW_SLOTS: 'calendar:view',
  VIEW_SETTINGS: 'calendar:settings:view',
  MANAGE_SETTINGS: 'calendar:settings:manage',
  VIEW_SERVICE_SETTINGS: 'calendar:service:view',
  MANAGE_SERVICE_SETTINGS: 'calendar:service:manage'
};

/**
 * Permission constants for booking operations
 */
export const BookingPermissions = {
  CREATE: 'bookings:create',
  VIEW_OWN: 'bookings:view-own',
  VIEW_ALL: 'bookings:view',
  UPDATE_OWN: 'bookings:update-own',
  UPDATE_ALL: 'bookings:update',
  CANCEL_OWN: 'bookings:cancel-own',
  CANCEL_ALL: 'bookings:cancel'
};

/**
 * Permission constants for admin operations
 */
export const AdminPermissions = {
  VIEW_DASHBOARD: 'admin:view',
  MANAGE_USERS: 'users:manage',
  MANAGE_SETTINGS: 'settings:manage',
  VIEW_REPORTS: 'reports:view'
};

// Create the export object
const permissionChecker = {
  checkPermission,
  checkResourceOwnership,
  CalendarPermissions,
  BookingPermissions,
  AdminPermissions
};

export default permissionChecker;
