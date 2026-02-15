#!/bin/bash

# Extract Vercel environment variable names
echo "📋 EXTRACTING VERCEL ENVIRONMENT VARIABLES"
echo "=========================================="

echo "🔍 Production variables:"
vercel env ls production | grep -E '^ [A-Z_]' | awk '{print $1}' | sort > vercel-production-vars.txt
cat vercel-production-vars.txt | wc -l | xargs echo "Total production vars:"

echo ""
echo "🔍 Preview variables:" 
vercel env ls preview | grep -E '^ [A-Z_]' | awk '{print $1}' | sort > vercel-preview-vars.txt
cat vercel-preview-vars.txt | wc -l | xargs echo "Total preview vars:"

echo ""
echo "🔍 Development variables:"
vercel env ls development | grep -E '^ [A-Z_]' | awk '{print $1}' | sort > vercel-development-vars.txt
cat vercel-development-vars.txt | wc -l | xargs echo "Total development vars:"

echo ""
echo "📁 Generated files:"
echo "  - vercel-production-vars.txt"
echo "  - vercel-preview-vars.txt" 
echo "  - vercel-development-vars.txt"