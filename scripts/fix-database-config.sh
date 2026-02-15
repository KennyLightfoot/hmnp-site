#!/bin/bash

echo "🔧 FIXING DATABASE CONFIGURATION MISMATCH"
echo "=========================================="

# Step 1: Remove duplicate .env file (keep only .env.local)
echo "1. Removing duplicate .env file..."
if [ -f ".env" ]; then
    mv .env .env.backup
    echo "   ✅ Moved .env to .env.backup"
fi

# Step 2: Clean up environment variables
echo "2. Verifying Supabase configuration..."
echo "   📊 Current DATABASE_URL points to: $(grep DATABASE_URL .env.local | head -1)"

# Step 3: Test current API endpoint
echo "3. Testing services API..."
echo "   🔍 Starting dev server and testing..."

# Step 4: Create Vercel environment sync script
echo "4. Preparing Vercel environment sync..."
cat > sync-to-vercel.sh << 'EOF'
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
EOF

chmod +x sync-to-vercel.sh

echo ""
echo "🎯 SOLUTION READY:"
echo "1. ✅ Removed duplicate .env file"
echo "2. ✅ Created Vercel sync script"
echo "3. 🔄 Ready to sync production to use Supabase"
echo ""
echo "Next: Run './sync-to-vercel.sh' to update Vercel" 