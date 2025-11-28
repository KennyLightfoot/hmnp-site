#!/bin/bash

# Install Gitleaks on WSL/Ubuntu
# This script downloads and installs the latest gitleaks binary

set -e

echo "🔧 Installing Gitleaks..."
echo ""

# Check if already installed
if command -v gitleaks >/dev/null 2>&1; then
    echo "✅ Gitleaks is already installed: $(gitleaks version)"
    exit 0
fi

# Detect architecture
ARCH=$(uname -m)
ARCH_ORIG=$ARCH
if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
    ARCH_ALT="x64"  # Some releases use x64
elif [ "$ARCH" = "aarch64" ]; then
    ARCH="arm64"
    ARCH_ALT="arm64"
else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
fi

# Get latest release URL
echo "📥 Fetching latest gitleaks release..."

# First, get the latest release tag
LATEST_TAG=$(curl -s https://api.github.com/repos/gitleaks/gitleaks/releases/latest | grep '"tag_name"' | cut -d '"' -f 4)

if [ -z "$LATEST_TAG" ]; then
    echo "❌ Failed to get latest release tag"
    exit 1
fi

echo "   Latest version: $LATEST_TAG"

# Remove 'v' prefix if present
VERSION=${LATEST_TAG#v}

# Construct download URL - gitleaks uses x64 for amd64
if [ "$ARCH" = "amd64" ]; then
    # Try x64 first (most common naming)
    LATEST_URL="https://github.com/gitleaks/gitleaks/releases/download/${LATEST_TAG}/gitleaks_${VERSION}_linux_x64.tar.gz"
    
    # Verify URL exists
    if ! curl -s --head "$LATEST_URL" | head -1 | grep -q "200\|302"; then
        # Try amd64 as fallback
        LATEST_URL="https://github.com/gitleaks/gitleaks/releases/download/${LATEST_TAG}/gitleaks_${VERSION}_linux_amd64.tar.gz"
        if ! curl -s --head "$LATEST_URL" | head -1 | grep -q "200\|302"; then
            echo "❌ Failed to find valid download URL"
            echo "   Tried: gitleaks_${VERSION}_linux_x64.tar.gz"
            echo "   Tried: gitleaks_${VERSION}_linux_amd64.tar.gz"
            echo "   Please check: https://github.com/gitleaks/gitleaks/releases/${LATEST_TAG}"
            exit 1
        fi
    fi
else
    LATEST_URL="https://github.com/gitleaks/gitleaks/releases/download/${LATEST_TAG}/gitleaks_${VERSION}_linux_${ARCH}.tar.gz"
    
    # Verify URL exists
    if ! curl -s --head "$LATEST_URL" | head -1 | grep -q "200\|302"; then
        echo "❌ Failed to find valid download URL"
        echo "   Architecture: $ARCH"
        echo "   Please check: https://github.com/gitleaks/gitleaks/releases/${LATEST_TAG}"
        exit 1
    fi
fi

echo "📦 Downloading from: $LATEST_URL"

# Create temp directory
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"

# Download and extract
curl -L "$LATEST_URL" -o gitleaks.tar.gz
tar -xzf gitleaks.tar.gz

# Install to /usr/local/bin (requires sudo) or ~/.local/bin
if [ -w /usr/local/bin ]; then
    INSTALL_DIR="/usr/local/bin"
    sudo cp gitleaks "$INSTALL_DIR/gitleaks"
    sudo chmod +x "$INSTALL_DIR/gitleaks"
else
    INSTALL_DIR="$HOME/.local/bin"
    mkdir -p "$INSTALL_DIR"
    cp gitleaks "$INSTALL_DIR/gitleaks"
    chmod +x "$INSTALL_DIR/gitleaks"
    
    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        echo ""
        echo "⚠️  Add to your ~/.bashrc or ~/.zshrc:"
        echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
        echo ""
    fi
fi

# Cleanup
cd -
rm -rf "$TMP_DIR"

# Verify installation
if command -v gitleaks >/dev/null 2>&1; then
    echo "✅ Gitleaks installed successfully!"
    echo "   Version: $(gitleaks version)"
    echo "   Location: $(which gitleaks)"
else
    echo "⚠️  Gitleaks installed but not in PATH"
    echo "   Installed to: $INSTALL_DIR/gitleaks"
    echo "   Run: export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo "   Or restart your terminal"
fi

