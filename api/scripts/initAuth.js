/**
 * Authentication Initialization Script
 * Houston Mobile Notary Pros API
 * 
 * This script initializes the authentication system by:
 * 1. Creating the default roles (ADMIN, STAFF, USER)
 * 2. Creating an initial admin user if none exists
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug information
console.log('Current directory:', __dirname);
console.log('Process working directory:', process.cwd());

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
  errorFormat: 'pretty'
});

// Default roles with permissions
const DEFAULT_ROLES = [
  {
    name: 'ADMIN',
    description: 'Full system access',
    permissions: [
      'users:manage',
      'bookings:manage',
      'calendar:manage',
      'settings:manage',
      'reports:view',
      'admin:access',
      'webhooks:manage'
    ]
  },
  {
    name: 'STAFF',
    description: 'Staff member access',
    permissions: [
      'bookings:view',
      'bookings:update',
      'calendar:view',
      'calendar:update',
      'settings:view'
    ]
  },
  {
    name: 'USER',
    description: 'Basic user access',
    permissions: [
      'profile:manage',
      'bookings:view-own',
      'bookings:create'
    ]
  }
];

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for user input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
});

// Main initialization function
async function initializeAuth() {
  try {
    console.log('🔐 Initializing authentication system...');
    
    // Create default roles
    await createDefaultRoles();
    
    // Check if admin user exists
    const adminExists = await checkAdminExists();
    
    if (!adminExists) {
      // Create initial admin user
      await createAdminUser();
    } else {
      console.log('✅ Admin user already exists. Skipping admin creation.');
    }
    
    console.log('✅ Authentication system initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing authentication system:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Create default roles if they don't exist
async function createDefaultRoles() {
  console.log('Setting up default roles...');
  
  for (const role of DEFAULT_ROLES) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name }
    });
    
    if (existingRole) {
      console.log(`✓ Role "${role.name}" already exists`);
      
      // Update permissions if needed
      await prisma.role.update({
        where: { id: existingRole.id },
        data: {
          permissions: role.permissions
        }
      });
      
    } else {
      await prisma.role.create({
        data: {
          name: role.name,
          description: role.description,
          permissions: role.permissions
        }
      });
      console.log(`✓ Created role "${role.name}"`);
    }
  }
  
  console.log('✅ Default roles setup complete');
}

// Check if any admin user exists
async function checkAdminExists() {
  // Get admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' }
  });
  
  if (!adminRole) {
    return false;
  }
  
  // Check if any user has admin role
  const adminUsers = await prisma.userRole.findMany({
    where: { roleId: adminRole.id },
    include: { user: true }
  });
  
  return adminUsers.length > 0;
}

// Create initial admin user
async function createAdminUser() {
  console.log('\n📝 Creating initial admin user...');
  
  // Get user input
  const email = await prompt('Admin email: ');
  const firstName = await prompt('First name: ');
  const lastName = await prompt('Last name: ');
  const password = await prompt('Password (min 8 chars): ');
  
  // Validate input
  if (!email.includes('@') || password.length < 8) {
    console.error('❌ Invalid email or password too short');
    return;
  }
  
  try {
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Get admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' }
    });
    
    // Create user with admin role
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        roles: {
          create: [
            {
              role: { connect: { id: adminRole.id } }
            }
          ]
        }
      }
    });
    
    console.log(`✅ Admin user "${email}" created successfully!`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ A user with that email already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

// Run the initialization
initializeAuth().catch(console.error);
