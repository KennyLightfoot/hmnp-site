/**
 * Permission Adapter Middleware
 * Houston Mobile Notary Pros API
 * 
 * This middleware adapts the new permission-based system to work with
 * the existing role-based enum schema rather than requiring new database tables.
 * 
 * DEVELOPMENT MODE ENABLED: For testing purposes only
 */

// Define all permissions by role
const roleBasedPermissions = {
  ADMIN: [
    // Calendar permissions
    'calendar:view',
    'calendar:settings:view',
    'calendar:settings:manage',
    'calendar:service:view',
    'calendar:service:manage',
    'calendar:bookings:view',
    'calendar:bookings:manage',
    
    // Booking permissions
    'bookings:create',
    'bookings:view-own',
    'bookings:view',
    'bookings:update-own',
    'bookings:update',
    'bookings:cancel-own',
    'bookings:cancel',
    
    // Admin permissions
    'admin:view',
    'users:manage',
    'settings:manage',
    'reports:view'
  ],
  
  STAFF: [
    // Calendar permissions
    'calendar:view',
    'calendar:settings:view',
    'calendar:service:view',
    'calendar:service:manage',
    'calendar:bookings:view',
    
    // Booking permissions
    'bookings:create',
    'bookings:view-own',
    'bookings:view',
    'bookings:update-own',
    'bookings:update',
    'bookings:cancel-own',
    'bookings:cancel',
    
    // Limited admin permissions
    'admin:view',
    'reports:view'
  ],
  
  PARTNER: [
    // Limited calendar permissions
    'calendar:view',
    'calendar:service:view',
    
    // Limited booking permissions
    'bookings:view-own',
    'bookings:update-own'
  ],
  
  USER: [
    // Basic permissions
    'calendar:view',
    'calendar:service:view',
    'bookings:create',
    'bookings:view-own',
    'bookings:update-own',
    'bookings:cancel-own'
  ],
  
  SIGNER: [
    // Limited permissions
    'calendar:view',
    'calendar:service:view',
    'bookings:view-own'
  ],
  
  NOTARY: [
    // Notary permissions
    'calendar:view',
    'calendar:service:view',
    'bookings:view-own',
    'bookings:view-assigned',
    'bookings:update-assigned'
  ]
};

// Permission constants
const PERMISSIONS = {
  CALENDAR: {
    VIEW: 'calendar:view',
    SETTINGS_VIEW: 'calendar:settings:view',
    SETTINGS_MANAGE: 'calendar:settings:manage',
    SERVICE_VIEW: 'calendar:service:view',
    SERVICE_MANAGE: 'calendar:service:manage',
    BOOKINGS_VIEW: 'calendar:bookings:view',
    BOOKINGS_MANAGE: 'calendar:bookings:manage'
  },
  BOOKING: {
    CREATE: 'bookings:create',
    VIEW_OWN: 'bookings:view-own',
    VIEW: 'bookings:view',
    UPDATE_OWN: 'bookings:update-own',
    UPDATE: 'bookings:update',
    CANCEL_OWN: 'bookings:cancel-own',
    CANCEL: 'bookings:cancel'
  },
  ADMIN: {
    VIEW: 'admin:view',
    USERS_MANAGE: 'users:manage',
    SETTINGS_MANAGE: 'settings:manage',
    REPORTS_VIEW: 'reports:view'
  }
};

/**
 * Extract permissions for a given user based on their role
 * @param {Object} user - User object with role property
 * @returns {Array} Array of permission strings
 */
function getUserPermissions(user) {
  if (!user) return [];
  
  const role = user.role;
  return roleBasedPermissions[role] || [];
}

/**
 * Check if user has required permission
 * @param {string} requiredPermission - Permission to check for
 * @returns {Function} Express middleware function
 */
function checkPermission(requiredPermission) {
  return (req, res, next) => {
    // Skip check if no user is authenticated (should be caught by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    // Get user permissions based on their role
    const userPermissions = getUserPermissions(req.user);
    
    // Check if user has the required permission
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }
    
    // Return 403 Forbidden if user doesn't have permission
    return res.status(403).json({
      error: 'Permission denied',
      message: `You don't have permission: ${requiredPermission}`
    });
  };
}

/**
 * Check if user owns the resource or has admin/staff privileges
 * Admin and staff roles can access all resources
 * @param {Function} getResourceOwnerId - Function to extract resource owner ID from request
 * @returns {Function} Express middleware function
 */
function checkResourceOwnership(getResourceOwnerId) {
  return async (req, res, next) => {
    try {
      // Skip check if no user is authenticated
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        });
      }
      
      // Admin and staff can access all resources
      if (req.user.role === 'ADMIN' || req.user.role === 'STAFF') {
        return next();
      }
      
      // Get resource owner ID
      const resourceOwnerId = await getResourceOwnerId(req);
      
      // Check if user is the resource owner
      if (resourceOwnerId === req.user.id) {
        return next();
      }
      
      // Return 403 Forbidden if user doesn't own the resource
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      });
    } catch (error) {
      console.error('Error checking resource ownership:', error);
      return res.status(500).json({ 
        error: 'Server error',
        message: 'An error occurred while checking resource permissions'
      });
    }
  };
}

// Development mode for testing (development only)
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';

/**
 * Development mode authentication middleware
 * Automatically assigns ADMIN role for testing purposes
 */
const devAuthenticate = (req, res, next) => {
  if (isDevelopment) {
    console.warn('WARNING: Using development authentication mode - all users have ADMIN privileges');
    // Assign admin role for testing
    req.user = {
      id: 'dev-admin-user',
      email: 'admin@test.com',
      role: 'ADMIN',
      permissions: roleBasedPermissions.ADMIN
    };
  }
  next();
};

/**
 * Development mode optional authentication middleware
 * Same as devAuthenticate but for optional authentication routes
 */
const devOptionalAuthenticate = (req, res, next) => {
  if (isDevelopment) {
    console.warn('WARNING: Using development authentication mode - assigned ADMIN role');
    req.user = {
      id: 'dev-admin-user',
      email: 'admin@test.com',
      role: 'ADMIN',
      permissions: roleBasedPermissions.ADMIN
    };
  }
  next();
};

// Export middleware functions and constants
const permissionAdapter = {
  checkPermission,
  checkResourceOwnership,
  getUserPermissions,
  PERMISSIONS,
  // Development mode helpers
  devAuthenticate,
  devOptionalAuthenticate,
  isDevelopment
};

export default permissionAdapter;
