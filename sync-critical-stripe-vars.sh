#!/bin/bash

# Sync Critical Stripe Variables to Fix Booking System
echo "🚀 SYNCING CRITICAL STRIPE VARIABLES"
echo "==================================="

# Source the .env.local file
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    exit 1
fi

# Function to safely extract value from .env.local
get_env_value() {
    local key=$1
    local value=$(grep "^$key=" .env.local | head -1 | cut -d'=' -f2- | sed 's/^"//' | sed 's/"$//')
    echo "$value"
}

# Critical Stripe variables
echo "🔑 Processing Critical Stripe Variables..."

# 1. STRIPE_SECRET_KEY
echo "📝 Setting STRIPE_SECRET_KEY..."
STRIPE_SECRET_KEY=$(get_env_value "STRIPE_SECRET_KEY")
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production --force
    echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY preview --force
    echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY development --force
    echo "✅ STRIPE_SECRET_KEY synced to all environments"
else
    echo "❌ STRIPE_SECRET_KEY not found in .env.local"
fi

# 2. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
echo "📝 Setting NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY..."
STRIPE_PUBLISHABLE_KEY=$(get_env_value "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
if [ -n "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo "$STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production --force
    echo "$STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview --force
    echo "$STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY development --force
    echo "✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY synced to all environments"
else
    echo "❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not found in .env.local"
fi

# 3. STRIPE_WEBHOOK_SECRET
echo "📝 Setting STRIPE_WEBHOOK_SECRET..."
STRIPE_WEBHOOK_SECRET=$(get_env_value "STRIPE_WEBHOOK_SECRET")
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production --force
    echo "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET preview --force
    echo "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET development --force
    echo "✅ STRIPE_WEBHOOK_SECRET synced to all environments"
else
    echo "❌ STRIPE_WEBHOOK_SECRET not found in .env.local"
fi

# Other critical variables for booking system
echo ""
echo "🔑 Processing Other Critical Variables..."

# DATABASE_URL
echo "📝 Setting DATABASE_URL..."
DATABASE_URL=$(get_env_value "DATABASE_URL")
if [ -n "$DATABASE_URL" ]; then
    echo "$DATABASE_URL" | vercel env add DATABASE_URL production --force
    echo "$DATABASE_URL" | vercel env add DATABASE_URL preview --force
    echo "$DATABASE_URL" | vercel env add DATABASE_URL development --force
    echo "✅ DATABASE_URL synced to all environments"
fi

# NEXTAUTH_SECRET
echo "📝 Setting NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(get_env_value "NEXTAUTH_SECRET")
if [ -n "$NEXTAUTH_SECRET" ]; then
    echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production --force
    echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET preview --force
    echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET development --force
    echo "✅ NEXTAUTH_SECRET synced to all environments"
fi

# NEXTAUTH_URL
echo "📝 Setting NEXTAUTH_URL..."
NEXTAUTH_URL=$(get_env_value "NEXTAUTH_URL")
if [ -n "$NEXTAUTH_URL" ]; then
    echo "$NEXTAUTH_URL" | vercel env add NEXTAUTH_URL production --force
    echo "$NEXTAUTH_URL" | vercel env add NEXTAUTH_URL preview --force
    echo "$NEXTAUTH_URL" | vercel env add NEXTAUTH_URL development --force
    echo "✅ NEXTAUTH_URL synced to all environments"
fi

echo ""
echo "🎉 CRITICAL VARIABLES SYNC COMPLETE"
echo "===================================="
echo "✅ All critical Stripe and authentication variables synced"
echo "✅ Booking system should now work correctly"
echo ""
echo "📋 Next: Run verification to test Stripe variables"