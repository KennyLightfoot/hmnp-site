#!/bin/bash

echo "🔧 Fixing HMNP Booking System..."
echo "================================"

echo "📦 Installing dependencies..."
pnpm install

echo "🗄️ Generating Prisma client..."
pnpm prisma generate

echo "⚙️ Seeding business settings for booking system..."
cd prisma/seeds
npx tsx business-settings.ts

echo "🌱 Running main seed (services, promo codes)..."
cd ../..
pnpm prisma db seed

echo "✅ Booking system setup complete!"
echo ""
echo "🎯 Your booking system should now work:"
echo "   • Business hours configured (Mon-Fri 9-5, Sat 10-3)"
echo "   • Booking slots every 30 minutes"
echo "   • 2-hour minimum lead time"
echo "   • 15-minute buffer between appointments"
echo ""
echo "🔍 Test by visiting: /booking"
echo "📊 Check logs in browser dev tools for debugging" 