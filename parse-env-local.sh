#!/bin/bash

# Parse .env.local file and extract all variables
echo "📋 PARSING .env.local FILE"
echo "========================="

# Extract all environment variables (ignore comments and empty lines)
grep -v '^#' .env.local | grep -v '^[[:space:]]*$' | while IFS='=' read -r key value; do
    if [[ -n "$key" && -n "$value" ]]; then
        echo "$key"
    fi
done | sort