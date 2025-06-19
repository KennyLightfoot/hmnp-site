#!/usr/bin/env node

/**
 * Production Key Generator for Houston Mobile Notary Pros
 * Generates secure keys for production deployment
 */

import crypto from 'crypto';
import fs from 'fs';

console.log('🔐 Houston Mobile Notary Pros - Production Key Generator');
console.log('=' .repeat(60));
console.log('');

// Generate secure random keys
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateBase64Key(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

function generateAPIKey(prefix = 'hmnp', length = 32) {
  const randomPart = crypto.randomBytes(length).toString('hex');
  return `${prefix}_${randomPart}`;
}

console.log('🔑 NEXTAUTH & ENCRYPTION KEYS:');
console.log('-'.repeat(40));
console.log(`NEXTAUTH_SECRET="${generateSecureKey(32)}"`);
console.log(`ENCRYPTION_KEY="${generateSecureKey(32)}"`);
console.log('');

console.log('🔐 ADMIN & API KEYS:');
console.log('-'.repeat(40));
console.log(`ADMIN_API_KEY="${generateAPIKey('admin', 24)}"`);
console.log(`INTERNAL_API_KEY="${generateAPIKey('internal', 24)}"`);
console.log('');

console.log('🔒 WEBHOOK SECRETS:');
console.log('-'.repeat(40));
console.log(`GHL_WEBHOOK_SECRET="${generateSecureKey(24)}"`);
console.log('');

console.log('📊 ANALYTICS & TRACKING:');
console.log('-'.repeat(40));
console.log(`ANALYTICS_SECRET="${generateBase64Key(24)}"`);
console.log('');

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('-'.repeat(40));
console.log('1. Store these keys securely in your password manager');
console.log('2. Never commit these keys to version control');
console.log('3. Use different keys for staging and production');
console.log('4. Rotate keys regularly (every 90 days recommended)');
console.log('5. Set up monitoring alerts for key usage');
console.log('');

console.log('📝 NEXT STEPS:');
console.log('-'.repeat(40));
console.log('1. Copy the keys above to your Vercel environment variables');
console.log('2. Set up your database (Neon/Supabase recommended)');
console.log('3. Configure Redis (Upstash recommended)');
console.log('4. Set up your GHL Private Integration');
console.log('5. Configure Stripe live keys');
console.log('6. Test everything in staging first');
console.log('');

console.log('🚀 You\'re ready to launch your market-leading platform!');
console.log('');

// Optional: Create a .env.production.local template
const envTemplate = `# Generated on ${new Date().toISOString()}
# COPY THESE TO YOUR VERCEL ENVIRONMENT VARIABLES

# Core Authentication
NEXTAUTH_SECRET="${generateSecureKey(32)}"
ENCRYPTION_KEY="${generateSecureKey(32)}"

# API Keys
ADMIN_API_KEY="${generateAPIKey('admin', 24)}"
INTERNAL_API_KEY="${generateAPIKey('internal', 24)}"

# Webhook Security
GHL_WEBHOOK_SECRET="${generateSecureKey(24)}"

# Analytics
ANALYTICS_SECRET="${generateBase64Key(24)}"

# ⚠️  REMEMBER TO ALSO SET:
# - DATABASE_URL (from your database provider)
# - REDIS_URL (from Upstash or Redis Cloud)
# - GHL_PRIVATE_INTEGRATION_TOKEN (from GoHighLevel)
# - STRIPE_SECRET_KEY (from Stripe)
# - OPENAI_API_KEY (from OpenAI)
# - TWILIO credentials (if using SMS)
`;

// Write template file
try {
  fs.writeFileSync('.env.production.template', envTemplate);
  console.log('📁 Created .env.production.template file with your keys');
  console.log('   (Add additional service keys as needed)');
} catch {
  console.log('ℹ️  Could not create template file, but keys are displayed above');
}

console.log('');
console.log('🎯 Happy launching! Your platform will be amazing! 🚀'); 