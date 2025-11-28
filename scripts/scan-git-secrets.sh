#!/bin/bash

# Git Secrets Scanner
# Scans entire git history for secrets using gitleaks
# Usage: ./scripts/scan-git-secrets.sh

set -e

echo "🔍 Scanning Git Repository for Secrets..."
echo "=========================================="
echo ""

# Check if gitleaks is installed
if ! command -v gitleaks >/dev/null 2>&1; then
    echo "❌ Gitleaks not found."
    echo ""
    echo "📦 Quick Install Options:"
    echo ""
    echo "Option 1: Use the install script (WSL/Ubuntu):"
    echo "  bash scripts/install-gitleaks.sh"
    echo ""
    echo "Option 2: Manual install (WSL/Ubuntu):"
    echo "  # Download latest release"
    echo "  curl -L https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_8.18.0_linux_x64.tar.gz -o gitleaks.tar.gz"
    echo "  tar -xzf gitleaks.tar.gz"
    echo "  sudo mv gitleaks /usr/local/bin/  # or mv gitleaks ~/.local/bin/"
    echo "  rm gitleaks.tar.gz"
    echo ""
    echo "Option 3: Use Docker (works everywhere):"
    echo "  docker run -v \$(pwd):/path zjhuang/gitleaks:latest detect --source /path --verbose --config-path=/path/gitleaks.toml"
    echo ""
    echo "Option 4: macOS:"
    echo "  brew install gitleaks"
    echo ""
    echo "For more options, see: https://github.com/gitleaks/gitleaks#installation"
    echo ""
    exit 1
fi

# Check if gitleaks.toml exists
if [ ! -f "gitleaks.toml" ]; then
    echo "⚠️  gitleaks.toml not found. Using default gitleaks rules."
    CONFIG_ARG=""
else
    # Try --config-path first (newer versions), fall back to -c (older versions)
    if gitleaks detect --help 2>&1 | grep -q "config-path"; then
        CONFIG_ARG="--config-path=gitleaks.toml"
    else
        CONFIG_ARG="-c gitleaks.toml"
    fi
    echo "✅ Using custom gitleaks.toml configuration"
fi

echo ""
echo "Scanning entire git history..."
echo ""

# Scan entire git history
if gitleaks detect --source . --verbose $CONFIG_ARG --report-format json --report-path gitleaks-report.json; then
    echo ""
    echo "✅ Scan complete! No secrets found in git history."
    echo ""
    echo "Report saved to: gitleaks-report.json"
    rm -f gitleaks-report.json
else
    EXIT_CODE=$?
    echo ""
    echo "🚨 SECURITY ALERT: Secrets found in git history!"
    echo ""
    echo "Review the output above for details."
    echo "Report saved to: gitleaks-report.json"
    echo ""
    echo "⚠️  ACTION REQUIRED:"
    echo "   1. Review gitleaks-report.json for all findings"
    echo "   2. Rotate all compromised keys immediately"
    echo "   3. See SECURITY_REMEDIATION.md for key rotation checklist"
    echo "   4. Consider using git-filter-repo to remove secrets from history (advanced)"
    echo ""
    exit $EXIT_CODE
fi

