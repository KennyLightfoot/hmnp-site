/**
 * Authentication Setup Script
 * Houston Mobile Notary Pros API
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');

console.log('🔐 Authentication System Setup');
console.log('=============================');

// Connect to the database
const prisma = new PrismaClient();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for user input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
});

// Default roles with permissions for our system
const DEFAULT_ROLES = [
  {
    name: 'ADMIN',
    description: 'Full system access',
    permissions: [
      // User management
      'users:manage',
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      
      // Booking permissions
      'bookings:manage',
      'bookings:create',
      'bookings:read',
      'bookings:update',
      'bookings:delete',
      
      // Calendar permissions
      'calendar:manage',
      'calendar:settings:manage',
      'calendar:view',
      'calendar:bookings:view',
      'calendar:bookings:manage',
      
      // General admin permissions
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
      // Limited user permissions
      'users:read',
      
      // Booking permissions
      'bookings:view',
      'bookings:update',
      
      // Calendar permissions
      'calendar:view',
      'calendar:update',
      'calendar:bookings:view',
      
      // Limited admin permissions
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

/**
 * Main function to set up the auth system with permissions
 */
async function setupAuth() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check if Role table exists
    let roleTableExists = false;
    try {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'roles'
        );
      `;
      roleTableExists = result[0].exists;
    } catch (error) {
      console.log('❌ Error checking for roles table:', error.message);
    }
    
    if (roleTableExists) {
      console.log('✅ Authentication tables already exist');
    } else {
      console.log('⚠️ Authentication tables don\'t exist in the database');
      console.log('ℹ️ Please ensure your Prisma schema includes the auth models and run migrations first');
    }
    
    // Set up the roles regardless
    await setupRoles();
    
    // Check if we need to create an admin
    await createAdminIfNeeded();
    
    console.log('\n✅ Auth setup complete!');
  } catch (error) {
    console.error('❌ Auth setup failed:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

/**
 * Create or update roles with the correct permissions
 */
async function setupRoles() {
  console.log('\n📝 Setting up roles with permissions...');
  
  for (const roleData of DEFAULT_ROLES) {
    try {
      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name }
      }).catch(() => null);
      
      if (existingRole) {
        console.log(`📄 Updating permissions for role "${roleData.name}"`);
        
        await prisma.role.update({
          where: { id: existingRole.id },
          data: {
            permissions: roleData.permissions
          }
        });
        
        console.log(`✅ Updated role "${roleData.name}"`);
        
      } else {
        console.log(`📄 Creating new role "${roleData.name}"`);
        
        await prisma.role.create({
          data: roleData
        });
        
        console.log(`✅ Created role "${roleData.name}"`);
      }
    } catch (error) {
      console.error(`❌ Failed to setup role "${roleData.name}":`, error.message);
      
      // Create special error log for missing tables
      if (error.message.includes('does not exist')) {
        console.error('⚠️ Database tables for authentication not found.');
        console.error('⚠️ Please check your Prisma schema and run migrations first.');
      }
    }
  }
}

/**
 * Check if admin user exists and create one if needed
 */
async function createAdminIfNeeded() {
  try {
    console.log('\n🔍 Checking for admin users...');
    
    // Get admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' }
    }).catch(() => null);
    
    if (!adminRole) {
      console.log('❌ Admin role not found in database');
      return;
    }
    
    // Check if any admin users exist
    const adminUsers = await prisma.userRole.findMany({
      where: { roleId: adminRole.id },
      include: { user: true }
    }).catch(() => []);
    
    if (adminUsers.length > 0) {
      console.log(`✅ Found ${adminUsers.length} admin user(s)`);
      return;
    }
    
    // Create admin user
    console.log('\n👤 No admin users found. Creating initial admin user...');
    
    const email = await prompt('Admin email: ');
    const firstName = await prompt('First name: ');
    const lastName = await prompt('Last name: ');
    const password = await prompt('Password (min 8 chars): ');
    
    // Validate input
    if (!email.includes('@') || password.length < 8) {
      console.error('❌ Invalid email or password too short');
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user with admin role
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        roles: {
          create: [
            { role: { connect: { id: adminRole.id } } }
          ]
        }
      }
    });
    
    console.log(`✅ Admin user "${email}" created successfully!`);
    
  } catch (error) {
    console.error('❌ Error checking/creating admin user:', error.message);
  }
}

// Run the setup
setupAuth().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
