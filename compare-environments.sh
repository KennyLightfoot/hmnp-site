#!/bin/bash

# Compare local vs Vercel environment variables
echo "🔍 ENVIRONMENT COMPARISON ANALYSIS"
echo "=================================="

# Get local variables
./parse-env-local.sh > local-vars.txt

echo "📊 SUMMARY:"
echo "Local variables: $(wc -l < local-vars.txt)"
echo "Vercel Production: $(wc -l < vercel-production-vars.txt)"
echo "Vercel Preview: $(wc -l < vercel-preview-vars.txt)"
echo "Vercel Development: $(wc -l < vercel-development-vars.txt)"

echo ""
echo "🔍 VARIABLES TO ADD TO VERCEL (in .env.local but NOT in Vercel):"
echo "================================================================="
comm -23 local-vars.txt vercel-production-vars.txt > vars-to-add.txt
cat vars-to-add.txt
echo "Total to add: $(wc -l < vars-to-add.txt)"

echo ""
echo "🧹 VARIABLES TO REMOVE FROM VERCEL (in Vercel but NOT in .env.local):"
echo "======================================================================"
comm -13 local-vars.txt vercel-production-vars.txt > vars-to-remove.txt
cat vars-to-remove.txt
echo "Total to remove: $(wc -l < vars-to-remove.txt)"

echo ""
echo "🎯 CRITICAL VARIABLES STATUS:"
echo "============================="
CRITICAL_VARS=(
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" 
    "STRIPE_WEBHOOK_SECRET"
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
)

for var in "${CRITICAL_VARS[@]}"; do
    if grep -q "^$var$" local-vars.txt; then
        local_status="✅"
    else
        local_status="❌"
    fi
    
    if grep -q "^$var$" vercel-production-vars.txt; then
        vercel_status="✅"
    else
        vercel_status="❌"
    fi
    
    printf "%-35s Local: %s  Vercel: %s\n" "$var" "$local_status" "$vercel_status"
done