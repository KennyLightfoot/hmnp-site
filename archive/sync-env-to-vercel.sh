#!/bin/bash

# Sync Local Environment Variables TO Vercel
# Usage: ./sync-env-to-vercel.sh [production|preview|development|all]

set -e

ENV_FILE=".env.local"
ENVIRONMENT="${1:-production}"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE not found!"
    exit 1
fi

echo "🚀 Syncing environment variables TO Vercel..."
echo "📁 Source: $ENV_FILE"
echo "🎯 Target Environment: $ENVIRONMENT"

# Function to add variables to specific environment
sync_to_env() {
    local env_name=$1
    echo "🔄 Syncing to $env_name environment..."
    
    # Read .env.local and add each variable
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
            continue
        fi
        
        # Extract variable name and value
        if [[ $line =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
            var_name="${BASH_REMATCH[1]}"
            var_value="${BASH_REMATCH[2]}"
            
            echo "  📝 Adding: $var_name"
            
            # Use vercel env add with the variable
            echo "$var_value" | vercel env add "$var_name" "$env_name" --force
        fi
    done < "$ENV_FILE"
    
    echo "✅ Completed sync to $env_name"
}

case "$ENVIRONMENT" in
    "production")
        sync_to_env "production"
        ;;
    "preview")
        sync_to_env "preview"
        ;;
    "development")
        sync_to_env "development"
        ;;
    "all")
        sync_to_env "production"
        sync_to_env "preview"
        sync_to_env "development"
        ;;
    *)
        echo "❌ Invalid environment. Use: production, preview, development, or all"
        exit 1
        ;;
esac

echo "🎉 Environment sync completed!"
echo "🔄 You can now redeploy your Vercel project with updated environment variables." 