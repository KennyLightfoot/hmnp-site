#!/bin/bash
# Script to generate Prisma client and push to git

set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Checking git status..."
git status

echo "Adding Prisma schema and migration files..."
git add prisma/schema.prisma
git add prisma/migrations/ 2>/dev/null || true

# Check if there are any changes to commit
if git diff --staged --quiet; then
    echo "No Prisma-related changes to commit"
else
    echo "Committing Prisma changes..."
    git commit -m "chore: update Prisma schema and generate client"
fi

echo "Pushing to remote..."
git push origin main

echo "Done! Prisma client has been generated and changes have been pushed."

