#!/bin/bash
echo "🚀 SYNCING SUPABASE CONFIG TO VERCEL"
echo "===================================="

# Set Vercel to use Supabase (same as local)
vercel env add DATABASE_URL --force
vercel env add DATABASE_URL_UNPOOLED --force  
vercel env add NEXT_PUBLIC_SUPABASE_URL --force
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY --force
vercel env add SUPABASE_SERVICE_ROLE_KEY --force

echo "✅ All environment variables synced to Vercel"
echo "🎯 Now both local and production use the same Supabase database"
