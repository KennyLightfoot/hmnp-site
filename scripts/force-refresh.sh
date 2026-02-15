#!/bin/bash

echo "🧹 FORCE REFRESH - Complete Cache Clear"
echo "======================================"

# 1. Stop any running processes
echo "1. Stopping any running dev servers..."
pkill -f "next dev" || echo "   No dev server running"
pkill -f "node.*next" || echo "   No node processes found"

# 2. Clear all caches
echo "2. Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# 3. Clear package manager cache
echo "3. Clearing pnpm cache..."
pnpm store prune || echo "   pnpm cache clear failed"

# 4. Reinstall dependencies fresh
echo "4. Reinstalling dependencies..."
rm -rf node_modules
pnpm install

# 5. Force rebuild
echo "5. Starting fresh development server..."
echo "   This will take a moment to compile everything fresh..."

# Set environment to force rebuild
export NODE_ENV=development
export NEXT_CACHE_DISABLED=1

pnpm run dev