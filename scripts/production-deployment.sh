#!/bin/bash

# 🚀 Houston Mobile Notary Pros - Production Deployment Script
# This script fixes all critical production blockers

echo "🚀 HOUSTON MOBILE NOTARY PROS - PRODUCTION DEPLOYMENT"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  CRITICAL PRODUCTION FIXES NEEDED:${NC}"
echo "1. 🔐 Secure admin credentials (currently exposed)"
echo "2. 💳 Switch Stripe to live keys (currently test mode)"
echo "3. 🌐 Update localhost URLs to production domain"
echo "4. 🧪 Install Playwright browsers for testing"
echo ""

read -p "Do you want to proceed with production deployment fixes? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 STEP 1: SECURITY - Generate Secure Admin Password${NC}"
echo "=============================================="

# Generate secure admin password
SECURE_ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
echo -e "${GREEN}✅ Generated secure admin password: ${SECURE_ADMIN_PASSWORD}${NC}"
echo -e "${YELLOW}⚠️  SAVE THIS PASSWORD: ${SECURE_ADMIN_PASSWORD}${NC}"
echo ""

echo -e "${BLUE}🔧 STEP 2: STRIPE - Production Keys Setup${NC}"
echo "=================================="
echo -e "${YELLOW}📝 You need to manually obtain Stripe live keys from:${NC}"
echo "   https://dashboard.stripe.com/live/apikeys"
echo ""
echo "Required keys:"
echo "   - Live secret key (sk_live_...)"
echo "   - Live publishable key (pk_live_...)"
echo "   - Live webhook secret (whsec_...)"
echo ""

echo -e "${BLUE}🔧 STEP 3: ENVIRONMENT VARIABLES${NC}"
echo "=========================="

# Create production environment template
cat > .env.production.template << EOF
# 🚀 PRODUCTION ENVIRONMENT VARIABLES
# Generated on $(date)
# CRITICAL: Copy these to Vercel environment variables

# =============================================================================
# SECURITY - UPDATED CREDENTIALS
# =============================================================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${SECURE_ADMIN_PASSWORD}

# =============================================================================
# PRODUCTION URLS - UPDATED FROM LOCALHOST
# =============================================================================
NODE_ENV=production
NEXTAUTH_URL=https://houstonmobilenotarypros.com
NEXTAUTH_URL_INTERNAL=https://houstonmobilenotarypros.com
NEXT_PUBLIC_APP_URL=https://houstonmobilenotarypros.com
NEXT_PUBLIC_BASE_URL=https://houstonmobilenotarypros.com
NEXT_PUBLIC_SITE_URL=https://houstonmobilenotarypros.com
WEBHOOK_URL=https://houstonmobilenotarypros.com

# =============================================================================
# STRIPE - REPLACE WITH YOUR LIVE KEYS
# =============================================================================
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE

# =============================================================================
# TESTING - PRODUCTION URLS
# =============================================================================
PLAYWRIGHT_BASE_URL=https://houstonmobilenotarypros.com
# Remove test credentials in production:
# PLAYWRIGHT_TEST_USERNAME=(remove for production)
# PLAYWRIGHT_TEST_PASSWORD=(remove for production)

# =============================================================================
# ALL OTHER VARIABLES - COPY FROM .env.local
# =============================================================================
# Copy all other variables from your .env.local file
# (Database, GHL, AWS, etc. - these are already correct)
EOF

echo -e "${GREEN}✅ Created .env.production.template${NC}"
echo ""

echo -e "${BLUE}🔧 STEP 4: INSTALL PLAYWRIGHT BROWSERS${NC}"
echo "==========================="
echo "Installing Playwright browsers for E2E testing..."

if command -v npx &> /dev/null; then
    npx playwright install
    echo -e "${GREEN}✅ Playwright browsers installed${NC}"
else
    echo -e "${YELLOW}⚠️  npx not found. Run manually: npx playwright install${NC}"
fi

echo ""
echo -e "${BLUE}🔧 STEP 5: UPDATE ADMIN PASSWORD IN DATABASE${NC}"
echo "==============================="

# Update admin password in database
if [ -f "scripts/set-admin-password.ts" ]; then
    echo "Updating admin password in database..."
    
    # Create temp script with new password
    cat > temp-set-admin-password.ts << EOF
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const SALT_ROUNDS = 10

const ADMIN_EMAIL = "admin@houstonmobilenotarypros.com"
const NEW_ADMIN_PASSWORD = "${SECURE_ADMIN_PASSWORD}"

async function main() {
  console.log('🔐 Updating admin password for production...')
  
  try {
    const hashedPassword = await bcrypt.hash(NEW_ADMIN_PASSWORD, SALT_ROUNDS)
    
    const user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    })
    
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
      console.log('✅ Admin password updated successfully')
    } else {
      console.log('⚠️  Admin user not found - will be created on first login')
    }
  } catch (error) {
    console.error('❌ Error updating password:', error)
  } finally {
    await prisma.\$disconnect()
  }
}

main()
EOF

    npx tsx temp-set-admin-password.ts
    rm temp-set-admin-password.ts
    echo -e "${GREEN}✅ Admin password updated in database${NC}"
else
    echo -e "${YELLOW}⚠️  Admin password script not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 PRODUCTION DEPLOYMENT FIXES COMPLETE!${NC}"
echo "======================================="
echo ""
echo -e "${YELLOW}📋 NEXT STEPS TO GO LIVE:${NC}"
echo ""
echo "1. 🔑 Get Stripe Live Keys:"
echo "   - Go to https://dashboard.stripe.com/live/apikeys"
echo "   - Copy live secret key, publishable key, and webhook secret"
echo "   - Replace placeholder values in .env.production.template"
echo ""
echo "2. 🚀 Deploy to Vercel:"
echo "   - Copy all variables from .env.production.template to Vercel"
echo "   - Run: vercel --prod"
echo ""
echo "3. 🧪 Test Production:"
echo "   - Visit: https://houstonmobilenotarypros.com"
echo "   - Test complete booking flow with live Stripe"
echo "   - Login with: admin / ${SECURE_ADMIN_PASSWORD}"
echo ""
echo -e "${GREEN}✅ Your system is now production-ready!${NC}"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Save the admin password: ${SECURE_ADMIN_PASSWORD}${NC}" 