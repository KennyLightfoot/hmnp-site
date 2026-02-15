#!/bin/bash
# security-fix.sh - Comprehensive script to fix remaining security vulnerabilities

echo "===== HMNP Site Security Update Script ====="
echo "This script will fix remaining security issues in the repository"
echo

# 1. Save the current working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# 2. Make sure we have the latest package.json with all overrides
echo "Step 1: Ensuring package.json overrides are correctly applied"
node webpack-fix.mjs

# 3. Make sure all overrides are properly added to package.json
echo "Step 2: Adding additional security overrides"
# Create a temporary file with all required overrides
cat > override-additions.mjs << 'EOF'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read package.json
const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add or update overrides with latest security fixes
if (!packageJson.overrides) {
  packageJson.overrides = {};
}

const securityOverrides = {
  "tar": ">=7.5.7",
  "jws": ">=3.2.3",
  "lodash": ">=4.17.23",
  "lodash-es": ">=4.17.23",
  "undici": ">=6.23.0",
  "preact": ">=10.27.3",
  "qs": ">=6.14.2",
  "fast-xml-parser": ">=5.3.4",
  "@sentry/nextjs>@sentry/webpack-plugin>webpack": ">=5.104.1"
};

// Add/update each security override
for (const [pkg, version] of Object.entries(securityOverrides)) {
  packageJson.overrides[pkg] = version;
}

// Update package.json dependencies with the latest security patches
if (packageJson.dependencies) {
  if (packageJson.dependencies.axios) {
    packageJson.dependencies.axios = "^1.13.5";
  }
  if (packageJson.dependencies.nodemailer) {
    packageJson.dependencies.nodemailer = "^7.0.13";
  }
  if (packageJson.dependencies.next) {
    packageJson.dependencies.next = "^15.5.12";
  }
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Successfully updated security overrides in package.json');
EOF

# Run the override additions script
node override-additions.mjs

# 4. Backup the pnpm-lock.yaml file
echo "Step 3: Backing up pnpm-lock.yaml"
cp pnpm-lock.yaml pnpm-lock.yaml.backup

# 5. Update and reinstall dependencies
echo "Step 4: Reinstalling dependencies with updated security fixes"
pnpm install --no-frozen-lockfile

# 6. Run security audit to check remaining issues
echo "Step 5: Running security audit to verify fixes"
pnpm audit

# 7. Run basic tests to ensure everything works
echo "Step 6: Running basic tests to ensure application still works"
pnpm test:unit --passWithNoTests

echo
echo "===== Security Update Complete ====="
echo "Check the output above to verify all issues have been resolved."
echo "If there are remaining vulnerabilities, they may require additional attention."
echo
echo "Next steps:"
echo "1. Commit these changes to the repository"
echo "2. Run a full test suite to ensure everything works"
echo "3. Update the documentation to reflect the security updates"