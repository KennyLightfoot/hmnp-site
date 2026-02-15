import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read package.json
const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add the override for @sentry/webpack-plugin>webpack
if (!packageJson.overrides) {
  packageJson.overrides = {};
}

packageJson.overrides['@sentry/nextjs>@sentry/webpack-plugin>webpack'] = '>=5.104.1';

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Successfully added webpack override for @sentry/webpack-plugin.');