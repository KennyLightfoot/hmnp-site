#!/bin/bash
# Script to generate Prisma, add all changes, commit and push

set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Adding all modified and untracked files (respecting .gitignore)..."
# This will add all files except those in .gitignore (like .next/, node_modules/, etc.)
git add .

echo "Checking git status..."
git status

echo "Committing all changes..."
git commit -m "chore: update Prisma schema, generate client, and add all changes"

echo "Pushing to remote..."
git push origin main

echo "Done! All changes have been committed and pushed."

