import { Role } from '@prisma/client';
import { AuthUser, GuestUser } from './unified-middleware';

/**
 * Comprehensive permission system for HMNP
 * Centralized permission logic for consistent access control
 */

export interface Permission {
  action: string;
  resource: string;
  condition?: (user: AuthUser, resourceData?: any) => boolean;
}

export enum Actions {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  ASSIGN = 'assign',
  APPROVE = 'approve',
  CANCEL = 'cancel',
  REFUND = 'refund',
}

export enum Resources {
  BOOKING = 'booking',
  USER = 'user',
  SERVICE = 'service',
  PROMO_CODE = 'promo_code',
  BUSINESS_SETTINGS = 'business_settings',
  CALENDAR = 'calendar',
  PAYMENT = 'payment',
  NOTIFICATION = 'notification',
  REPORT = 'report',
  ADMIN_PANEL = 'admin_panel',
  ASSIGNMENT = 'assignment',
  DOCUMENT = 'document',
}

/**
 * Role-based permission matrix
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin has full access to everything
    { action: Actions.MANAGE, resource: Resources.BOOKING },
    { action: Actions.MANAGE, resource: Resources.USER },
    { action: Actions.MANAGE, resource: Resources.SERVICE },
    { action: Actions.MANAGE, resource: Resources.PROMO_CODE },
    { action: Actions.MANAGE, resource: Resources.BUSINESS_SETTINGS },
    { action: Actions.MANAGE, resource: Resources.CALENDAR },
    { action: Actions.MANAGE, resource: Resources.PAYMENT },
    { action: Actions.MANAGE, resource: Resources.NOTIFICATION },
    { action: Actions.MANAGE, resource: Resources.REPORT },
    { action: Actions.MANAGE, resource: Resources.ADMIN_PANEL },
    { action: Actions.MANAGE, resource: Resources.ASSIGNMENT },
    { action: Actions.MANAGE, resource: Resources.DOCUMENT },
  ],

  [Role.STAFF]: [
    // Staff can manage bookings and users, but not business settings
    { action: Actions.MANAGE, resource: Resources.BOOKING },
    { 
      action: Actions.READ, 
      resource: Resources.USER,
      condition: (user) => true // Can read all users
    },
    { 
      action: Actions.UPDATE, 
      resource: Resources.USER,
      condition: (user, targetUser) => targetUser?.role !== Role.ADMIN // Can't modify admins
    },
    { action: Actions.READ, resource: Resources.SERVICE },
    { action: Actions.READ, resource: Resources.PROMO_CODE },
    { action: Actions.READ, resource: Resources.CALENDAR },
    { action: Actions.READ, resource: Resources.PAYMENT },
    { action: Actions.CREATE, resource: Resources.NOTIFICATION },
    { action: Actions.READ, resource: Resources.REPORT },
    { action: Actions.MANAGE, resource: Resources.ASSIGNMENT },
    { action: Actions.MANAGE, resource: Resources.DOCUMENT },
  ],

  [Role.NOTARY]: [
    // Notary can manage their assignments and bookings
    { 
      action: Actions.READ, 
      resource: Resources.BOOKING,
      condition: (user, booking) => booking?.assignedNotaryId === user.id || booking?.signerId === user.id
    },
    { 
      action: Actions.UPDATE, 
      resource: Resources.BOOKING,
      condition: (user, booking) => booking?.assignedNotaryId === user.id
    },
    { 
      action: Actions.READ, 
      resource: Resources.USER,
      condition: (user, targetUser) => targetUser?.id === user.id // Only own profile
    },
    { 
      action: Actions.UPDATE, 
      resource: Resources.USER,
      condition: (user, targetUser) => targetUser?.id === user.id // Only own profile
    },
    { action: Actions.READ, resource: Resources.SERVICE },
    { action: Actions.READ, resource: Resources.CALENDAR },
    { 
      action: Actions.READ, 
      resource: Resources.ASSIGNMENT,
      condition: (user, assignment) => assignment?.notaryId === user.id
    },
    { 
      action: Actions.UPDATE, 
      resource: Resources.ASSIGNMENT,
      condition: (user, assignment) => assignment?.notaryId === user.id
    },
    { 
      action: Actions.MANAGE, 
      resource: Resources.DOCUMENT,
      condition: (user, document) => document?.assignmentNotaryId === user.id
    },
  ],

  [Role.CLIENT]: [
    // Client can only manage their own bookings
    { 
      action: Actions.CREATE, 
      resource: Resources.BOOKING 
    },
    { 
      action: Actions.READ, 
      resource: Resources.BOOKING,
      condition: (user, booking) => booking?.signerId === user.id
    },
    { 
      action: Actions.UPDATE, 
      resource: Resources.BOOKING,
      condition: (user, booking) => 
        booking?.signerId === user.id && 
        ['DRAFT', 'PAYMENT_PENDING'].includes(booking?.status)
    },
    { 
      action: Actions.CANCEL, 
      resource: Resources.BOOKING,
      condition: (user, booking) => 
        booking?.signerId === user.id && 
        ['CONFIRMED', 'PAYMENT_PENDING'].includes(booking?.status)
    },
    { 
      action: Actions.READ, 
      resource: Resources.USER,
      condition: (user, targetUser) => targetUser?.id === user.id // Only own profile
    },
    { 
      action: Actions.UPDATE, 
      resource: Resources.USER,
      condition: (user, targetUser) => targetUser?.id === user.id // Only own profile
    },
    { action: Actions.READ, resource: Resources.SERVICE },
  ],
};

/**
 * Guest user permissions (for non-authenticated users)
 */
const GUEST_PERMISSIONS: Permission[] = [
  { action: Actions.CREATE, resource: Resources.BOOKING }, // Guest bookings allowed
  { action: Actions.READ, resource: Resources.SERVICE }, // Public service info
];

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: AuthUser | GuestUser,
  action: Actions,
  resource: Resources,
  resourceData?: any
): boolean {
  // Handle guest users
  if (!user.isAuthenticated) {
    return GUEST_PERMISSIONS.some(permission => 
      permission.action === action && 
      permission.resource === resource &&
      (!permission.condition || permission.condition(user as any, resourceData))
    );
  }

  const authUser = user as AuthUser;
  const userPermissions = ROLE_PERMISSIONS[authUser.role] || [];

  return userPermissions.some(permission => {
    // Check for exact match or MANAGE permission (which includes all actions)
    const actionMatch = permission.action === action || permission.action === Actions.MANAGE;
    const resourceMatch = permission.resource === resource;
    const conditionMatch = !permission.condition || permission.condition(authUser, resourceData);

    return actionMatch && resourceMatch && conditionMatch;
  });
}

/**
 * Require permission middleware wrapper
 */
export function requirePermission(
  action: Actions,
  resource: Resources,
  options: {
    getResourceData?: (request: any) => Promise<any> | any;
    customErrorMessage?: string;
  } = {}
) {
  return async (user: AuthUser | GuestUser, request?: any) => {
    let resourceData;
    
    if (options.getResourceData && request) {
      resourceData = await options.getResourceData(request);
    }

    const hasAccess = hasPermission(user, action, resource, resourceData);

    if (!hasAccess) {
      const errorMessage = options.customErrorMessage || 
        `Permission denied: Cannot ${action} ${resource}`;
      
      throw new Error(errorMessage);
    }

    return true;
  };
}

/**
 * Bulk permission checker for complex operations
 */
export function hasAnyPermission(
  user: AuthUser | GuestUser,
  permissions: Array<{ action: Actions; resource: Resources; resourceData?: any }>
): boolean {
  return permissions.some(({ action, resource, resourceData }) =>
    hasPermission(user, action, resource, resourceData)
  );
}

export function hasAllPermissions(
  user: AuthUser | GuestUser,
  permissions: Array<{ action: Actions; resource: Resources; resourceData?: any }>
): boolean {
  return permissions.every(({ action, resource, resourceData }) =>
    hasPermission(user, action, resource, resourceData)
  );
}

/**
 * Role hierarchy helpers
 */
export function isAdmin(user: AuthUser | GuestUser): boolean {
  return user.isAuthenticated && (user as AuthUser).role === Role.ADMIN;
}

export function isStaff(user: AuthUser | GuestUser): boolean {
  return user.isAuthenticated && (user as AuthUser).role === Role.STAFF;
}

export function isNotary(user: AuthUser | GuestUser): boolean {
  return user.isAuthenticated && (user as AuthUser).role === Role.NOTARY;
}

export function isClient(user: AuthUser | GuestUser): boolean {
  return user.isAuthenticated && (user as AuthUser).role === Role.CLIENT;
}

export function isStaffOrHigher(user: AuthUser | GuestUser): boolean {
  return user.isAuthenticated && 
    [(Role.ADMIN), (Role.STAFF)].includes((user as AuthUser).role);
}

export function isNotaryOrHigher(user: AuthUser | GuestUser): boolean {
  return user.isAuthenticated && 
    [Role.ADMIN, Role.STAFF, Role.NOTARY].includes((user as AuthUser).role);
}

/**
 * Common permission presets for route handlers
 */
export const PermissionPresets = {
  // Booking permissions
  createBooking: requirePermission(Actions.CREATE, Resources.BOOKING),
  viewOwnBookings: requirePermission(Actions.READ, Resources.BOOKING, {
    getResourceData: async (request: any) => {
      // This would typically fetch the booking and check ownership
      return { signerId: request.user?.id };
    }
  }),
  viewAllBookings: requirePermission(Actions.READ, Resources.BOOKING),
  manageBookings: requirePermission(Actions.MANAGE, Resources.BOOKING),
  
  // User management permissions
  viewUsers: requirePermission(Actions.READ, Resources.USER),
  manageUsers: requirePermission(Actions.MANAGE, Resources.USER),
  viewOwnProfile: requirePermission(Actions.READ, Resources.USER, {
    getResourceData: (request: any) => ({ id: request.user?.id })
  }),
  
  // Admin permissions
  accessAdminPanel: requirePermission(Actions.READ, Resources.ADMIN_PANEL),
  manageBusinessSettings: requirePermission(Actions.MANAGE, Resources.BUSINESS_SETTINGS),
  
  // Service permissions
  viewServices: requirePermission(Actions.READ, Resources.SERVICE), // Public
  manageServices: requirePermission(Actions.MANAGE, Resources.SERVICE),
  
  // Assignment permissions (for notary portal)
  viewOwnAssignments: requirePermission(Actions.READ, Resources.ASSIGNMENT, {
    getResourceData: (request: any) => ({ notaryId: request.user?.id })
  }),
  manageAssignments: requirePermission(Actions.MANAGE, Resources.ASSIGNMENT),
  
  // Document permissions
  viewOwnDocuments: requirePermission(Actions.READ, Resources.DOCUMENT, {
    getResourceData: (request: any) => ({ assignmentNotaryId: request.user?.id })
  }),
  manageDocuments: requirePermission(Actions.MANAGE, Resources.DOCUMENT),
};

/**
 * Helper for generating user-friendly permission summaries
 */
export function getUserPermissionSummary(user: AuthUser | GuestUser): {
  role: string;
  canCreateBookings: boolean;
  canViewAllBookings: boolean;
  canManageBookings: boolean;
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
} {
  if (!user.isAuthenticated) {
    return {
      role: 'Guest',
      canCreateBookings: true,
      canViewAllBookings: false,
      canManageBookings: false,
      canAccessAdmin: false,
      canManageUsers: false,
      canViewReports: false,
    };
  }

  const authUser = user as AuthUser;
  
  return {
    role: authUser.role,
    canCreateBookings: hasPermission(user, Actions.CREATE, Resources.BOOKING),
    canViewAllBookings: hasPermission(user, Actions.READ, Resources.BOOKING),
    canManageBookings: hasPermission(user, Actions.MANAGE, Resources.BOOKING),
    canAccessAdmin: hasPermission(user, Actions.READ, Resources.ADMIN_PANEL),
    canManageUsers: hasPermission(user, Actions.MANAGE, Resources.USER),
    canViewReports: hasPermission(user, Actions.READ, Resources.REPORT),
  };
} 