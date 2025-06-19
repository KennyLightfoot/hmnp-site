/**
 * Initialize Role Permissions Script
 * Houston Mobile Notary Pros API
 * 
 * This script initializes specific permissions for each role
 * to be used with the permission-based access control system
 */

import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

// Define all permissions by category
const permissions = {
  // Calendar permissions
  calendar: [
    'calendar:view',             // View calendar and available slots
    'calendar:settings:view',    // View calendar settings
    'calendar:settings:manage',  // Manage calendar settings
    'calendar:service:view',     // View service calendar settings
    'calendar:service:manage'    // Manage service calendar settings
  ],
  
  // Booking permissions
  bookings: [
    'bookings:create',           // Create bookings
    'bookings:view-own',         // View own bookings
    'bookings:view',             // View all bookings  
    'bookings:update-own',       // Update own bookings
    'bookings:update',           // Update any booking
    'bookings:cancel-own',       // Cancel own bookings
    'bookings:cancel'            // Cancel any booking
  ],
  
  // Admin permissions
  admin: [
    'admin:view',                // View admin dashboard
    'users:manage',              // Manage users and roles
    'settings:manage',           // Manage global settings
    'reports:view'               // View analytics/reports
  ]
};

// Permission assignments per role
const rolePermissions = {
  'ADMIN': [
    // Admin has all permissions
    ...permissions.calendar,
    ...permissions.bookings,
    ...permissions.admin
  ],
  
  'STAFF': [
    // Staff has calendar and booking management permissions
    ...permissions.calendar,
    ...permissions.bookings,
    'admin:view',
    'reports:view'
  ],
  
  'USER': [
    // Regular users have limited permissions
    'calendar:view',
    'calendar:service:view',
    'bookings:create',
    'bookings:view-own',
    'bookings:update-own',
    'bookings:cancel-own'
  ]
};

/**
 * Main function to initialize permissions
 */
async function initializePermissions() {
  try {
    console.log('Starting permissions initialization...');
    
    // Get all roles
    const roles = await prisma.role.findMany();
    
    if (roles.length === 0) {
      console.log('No roles found. Please run initAuth.js first to create roles.');
      return;
    }
    
    console.log(`Found ${roles.length} roles.`);
    
    // For each role, update its permissions
    for (const role of roles) {
      const roleName = role.name;
      
      // Skip if role doesn't have predefined permissions
      if (!rolePermissions[roleName]) {
        console.log(`Skipping role "${roleName}" - no permissions defined.`);
        continue;
      }
      
      console.log(`Updating permissions for role "${roleName}"...`);
      
      // Update role with permissions
      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: rolePermissions[roleName]
        }
      });
      
      console.log(`✓ Updated ${rolePermissions[roleName].length} permissions for role "${roleName}".`);
    }
    
    console.log('\n✅ Permissions initialization completed successfully!');
    console.log(`Total permissions initialized: ${Object.values(permissions).flat().length}`);
    
  } catch (error) {
    console.error('Error initializing permissions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the initialization
initializePermissions().catch(console.error);
