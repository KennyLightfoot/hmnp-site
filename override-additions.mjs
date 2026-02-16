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
