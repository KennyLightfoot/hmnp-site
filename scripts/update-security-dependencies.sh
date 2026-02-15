#!/bin/bash
# =============================================================================
# HMNP Site - Security Update Script
# =============================================================================
# Run from the root of the hmnp-site repo
# Updates direct dependencies and overrides to address security vulnerabilities
# =============================================================================
set -e
echo "🔒 HMNP Site Security Update"
echo "============================"
echo ""

# Safety check
if [ ! -f "package.json" ] || [ ! -d "app" ]; then
  echo "❌ Must be run from the hmnp-site root directory!"
  exit 1
fi

# Backup package.json
echo "📦 Backing up package.json..."
cp package.json package.json.backup
echo " ✅ Backup created at package.json.backup"

# Update direct dependencies
echo "🔄 Updating direct dependencies..."
pnpm update next@^15.5.10 axios@^1.13.5 nodemailer@^7.0.11

# Update overrides in package.json
echo "🔄 Updating overrides in package.json..."

# Temporary file
TMP_FILE=$(mktemp)

# Process package.json to update overrides
node -e '
const fs = require("fs");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

// Ensure overrides exist
if (!packageJson.overrides) {
  packageJson.overrides = {};
}

// Add or update security overrides
const securityOverrides = {
  "tar": ">=7.5.7",
  "prismjs@<1.30.0": ">=1.30.0",
  "brace-expansion@>=1.0.0 <=1.1.11": ">=1.1.12",
  "ws": "8.17.1",
  "jws": ">=3.2.3",
  "lodash": ">=4.17.23",
  "lodash-es": ">=4.17.23",
  "undici": ">=6.23.0",
  "preact": ">=10.27.3",
  "@isaacs/brace-expansion": ">=5.0.1",
  "qs": ">=6.14.2",
  "fast-xml-parser": ">=5.3.4",
  "glob@>=10.2.0 <10.5.0": "10.5.0",
  "glob@>=11.0.0 <11.1.0": "11.1.0"
};

// Merge with existing overrides
Object.entries(securityOverrides).forEach(([key, value]) => {
  packageJson.overrides[key] = value;
});

fs.writeFileSync("'$TMP_FILE'", JSON.stringify(packageJson, null, 2));
'

# Replace package.json with updated version
mv "$TMP_FILE" package.json

echo " ✅ package.json overrides updated"

# Install dependencies
echo "📦 Installing updated dependencies..."
pnpm install --no-frozen-lockfile

# Run audit to check if issues are resolved
echo "🔍 Running security audit..."
pnpm audit

# Run tests to verify everything works
echo "🧪 Running tests to verify updates..."
pnpm test:unit

echo ""
echo "✅ Security update completed!"
echo ""
echo "📊 Next steps:"
echo " 1. Verify all tests pass: pnpm test:unit"
echo " 2. Build the project: pnpm build:safe"
echo " 3. Commit the changes: git add package.json pnpm-lock.yaml && git commit -m 'fix: security dependencies update'"
echo " 4. Push the changes: git push"
echo ""
echo "If you need to restore the original package.json, use: mv package.json.backup package.json && pnpm install"