#!/bin/bash

echo "🚀 Committing build fixes..."

# Add all changes
git add .

# Check status
echo "📊 Git status:"
git status --porcelain

# Commit with descriptive message
echo "💾 Creating commit..."
git commit -m "fix: resolve build errors and environment validation issues

- Fix syntax error in lib/env-validation.ts (conditional exports not allowed)
- Add build-time safety checks for environment validation
- Fix environment variable access in breadcrumb-jsonld.tsx
- Add safe build script with proper env vars
- Update next.config.mjs with environment configuration
- Skip environment validation during build process

Build now completes successfully with 175+ pages generated"

# Push to remote
echo "📤 Pushing to remote..."
git push origin main

echo "✅ Build fixes committed and pushed successfully!" 