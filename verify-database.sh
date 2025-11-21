#!/bin/bash
# Script to help verify which database is actually configured

echo "🔍 Checking which database is configured..."
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ Found .env.local file"
    if grep -q "DATABASE_URL" .env.local; then
        echo "📋 Current DATABASE_URL in .env.local:"
        grep "DATABASE_URL" .env.local | head -1
        echo ""
    else
        echo "⚠️  DATABASE_URL not found in .env.local"
        echo ""
    fi
else
    echo "❌ .env.local file not found"
    echo ""
fi

# Check Vercel (if vercel CLI is available)
if command -v vercel &> /dev/null; then
    echo "🔍 Checking Vercel environment variables..."
    echo "Run this command to see your Vercel DATABASE_URL:"
    echo "  vercel env pull .env.vercel"
    echo ""
fi

# Show both options
echo "📊 Found two database URLs in your codebase:"
echo ""
echo "1️⃣  SUPABASE (likely current):"
echo "   postgresql://postgres.czxoxhokegnzfctgnhjo:Hmnp128174Supa@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
echo ""
echo "2️⃣  NEON (old?):"
echo "   postgresql://neondb_owner:npg_clS0GqYNbh8d@ep-summer-mode-a4ocsti3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
echo ""
echo "💡 Based on your CHANGELOG, you migrated TO Supabase, so use option 1️⃣"
echo ""
echo "To test which one works, try:"
echo "  DATABASE_URL='<connection_string>' pnpm prisma migrate status"

