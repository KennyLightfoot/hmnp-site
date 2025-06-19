/**
 * Authentication Initialization Script (Fixed)
 * Houston Mobile Notary Pros API
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Authentication System Setup');
console.log('==============================');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for user input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
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
      'webhooks:manage',
      'calendar:settings:manage',
      'calendar:bookings:view',
      'calendar:bookings:manage'
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
      'settings:view',
      'calendar:bookings:view'
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

async function createAuthSchema() {
  try {
    console.log('\n🔨 Creating authentication schema file...');
    
    const schemaPath = path.join(__dirname, '..', 'auth-schema.prisma');
    
    const authSchema = `
// Authentication Schema for Houston Mobile Notary Pros API

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String    @map("password_hash")
  firstName      String    @map("first_name")
  lastName       String?   @map("last_name")
  phoneNumber    String?   @map("phone_number")
  isActive       Boolean   @default(true) @map("is_active")
  lastLoginAt    DateTime? @map("last_login_at")
  profileImageUrl String?   @map("profile_image_url")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  
  // Relations
  roles          UserRole[]
  refreshTokens  RefreshToken[]
  loginAttempts  LoginAttempt[]
  
  @@map("api_users")
}

// Role model for authorization
model Role {
  id          String     @id @default(cuid())
  name        String     @unique
  description String?
  permissions Json?      // Stores an array of permission strings
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  
  // Relations
  users       UserRole[]
  
  @@map("api_roles")
}

// UserRole junction table
model UserRole {
  userId    String   @map("user_id")
  roleId    String   @map("role_id")
  assignedAt DateTime @default(now()) @map("assigned_at")
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@id([userId, roleId])
  @@map("api_user_roles")
}

// RefreshToken for JWT authentication
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  revokedAt DateTime? @map("revoked_at")
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("api_refresh_tokens")
  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}

// LoginAttempt for tracking authentication attempts
model LoginAttempt {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  success   Boolean  @default(false)
  ipAddress String   @map("ip_address")
  userAgent String?  @map("user_agent")
  timestamp DateTime @default(now())
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("api_login_attempts")
  @@index([userId])
  @@index([timestamp])
  @@index([ipAddress])
}

// API Keys for system-to-system integration
model ApiKey {
  id          String    @id @default(cuid())
  name        String
  key         String    @unique
  permissions Json?     // Array of permission strings
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  expiresAt   DateTime? @map("expires_at")
  lastUsedAt  DateTime? @map("last_used_at")
  description String?
  
  @@map("api_keys")
  @@index([key])
  @@index([active])
}
    `;
    
    fs.writeFileSync(schemaPath, authSchema);
    console.log(`✅ Auth schema created at ${schemaPath}`);
    
    return schemaPath;
  } catch (error) {
    console.error('❌ Error creating auth schema:', error);
    throw error;
  }
}

async function createRolesAndAdmin() {
  try {
    console.log('👤 Setting up roles and admin user...');
    
    // Initialize Prisma client
    const prisma = new PrismaClient({
      log: ['error'],
      errorFormat: 'pretty'
    });
    
    try {
      // Create default roles
      console.log('📝 Creating default roles...');
      
      for (const roleData of DEFAULT_ROLES) {
        // Check if role exists
        const existingRole = await prisma.role.findUnique({
          where: { name: roleData.name }
        }).catch(() => null);
        
        if (existingRole) {
          console.log(`✓ Role "${roleData.name}" already exists, updating permissions`);
          
          await prisma.role.update({
            where: { id: existingRole.id },
            data: { permissions: roleData.permissions }
          });
        } else {
          await prisma.role.create({
            data: roleData
          });
          console.log(`✓ Created role "${roleData.name}"`);
        }
      }
      
      // Check if admin exists
      const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' }
      });
      
      if (!adminRole) {
        console.log('❌ Failed to find or create ADMIN role');
        return;
      }
      
      // Check if any admin user exists
      const adminUsers = await prisma.userRole.findMany({
        where: { roleId: adminRole.id },
        include: { user: true }
      });
      
      if (adminUsers.length > 0) {
        console.log(`✅ Found ${adminUsers.length} admin user(s)`);
        return;
      }
      
      // Create admin user
      console.log('\n📝 Creating initial admin user...');
      
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
      
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('❌ Error setting up roles and admin:', error);
    throw error;
  }
}

// Main initialization function
async function initialize() {
  try {
    // Step 1: Create separate auth schema file
    const schemaPath = await createAuthSchema();
    
    // Step 2: Generate a migration based on the auth schema
    console.log('\n🔄 Generating database migration...');
    
    try {
      // Run prisma command to create a migration
      execSync(`npx prisma migrate dev --name add-auth-schema --schema ${schemaPath} --create-only`, { 
        stdio: 'inherit',
        encoding: 'utf-8'
      });
      console.log('✅ Migration file generated');
      
      // Apply the migration
      console.log('\n🔄 Applying migration to database...');
      execSync(`npx prisma migrate deploy --schema ${schemaPath}`, { 
        stdio: 'inherit',
        encoding: 'utf-8'
      });
      console.log('✅ Migration applied successfully');
      
      // Generate Prisma client
      console.log('\n🔄 Generating Prisma client...');
      execSync(`npx prisma generate --schema ${schemaPath}`, { 
        stdio: 'inherit',
        encoding: 'utf-8'
      });
      console.log('✅ Prisma client generated');
      
    } catch (error) {
      console.error('❌ Prisma command failed:', error.message);
      // Continue anyway - tables might already exist
    }
    
    // Step 3: Create roles and admin user
    await createRolesAndAdmin();
    
    console.log('\n✅ Authentication system setup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Authentication setup failed:', error);
  } finally {
    rl.close();
  }
}

// Run the initialization
initialize().catch(console.error);
