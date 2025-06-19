#!/bin/bash

# Script to sync environment variables from .env.local to Vercel
# Usage: ./scripts/sync-env-to-vercel.sh

echo "Syncing environment variables to Vercel..."

# Read .env.local and add each variable to Vercel
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
        continue
    fi
    
    # Remove quotes from value
    value=$(echo "$value" | sed 's/^"//;s/"$//')
    
    echo "Adding $key to Vercel..."
    echo "$value" | vercel env add "$key" production
done < .env.local

echo "Environment variables synced successfully!" 