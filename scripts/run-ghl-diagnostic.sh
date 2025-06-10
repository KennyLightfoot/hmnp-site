#!/bin/bash

echo "🔍 Running GHL 403 Error Diagnostic..."
echo "======================================="

cd "$(dirname "$0")/.."
node scripts/debug-ghl-403.js 