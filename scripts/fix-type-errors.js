#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing TypeScript errors...\n');

// 1. Install missing type declarations
console.log('📦 Installing missing type declarations...');
const typesToInstall = [
  '@types/formidable',
  '@types/supertest',
  '@sanity/icons',
  '@sanity/image-url'
];

try {
  execSync(`pnpm add -D ${typesToInstall.join(' ')}`, { stdio: 'inherit' });
  console.log('✅ Type declarations installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install some type declarations:', error.message);
  console.log('Continuing with other fixes...\n');
}

// 2. Fix global declaration conflicts
console.log('🔧 Fixing global declaration conflicts...');
const trackingFile = path.join(__dirname, '../lib/tracking.ts');

if (fs.existsSync(trackingFile)) {
  let content = fs.readFileSync(trackingFile, 'utf8');
  
  // Fix dataLayer declaration conflict
  if (content.includes('dataLayer: any[];')) {
    content = content.replace(
      'declare global {\n  interface Window {\n    dataLayer: any[];\n  }\n}',
      'declare global {\n  interface Window {\n    dataLayer?: any[];\n  }\n}'
    );
    fs.writeFileSync(trackingFile, content);
    console.log('✅ Fixed dataLayer declaration conflict');
  }
}

// 3. Fix security enhancements logger call
console.log('🔧 Fixing security enhancements...');
const securityFile = path.join(__dirname, '../lib/security-enhancements.ts');

if (fs.existsSync(securityFile)) {
  let content = fs.readFileSync(securityFile, 'utf8');
  
  // Fix logger call with ip property
  content = content.replace(
    "logger.error('IP blocked', 'SECURITY', { ip, reason });",
    "logger.error('IP blocked', 'SECURITY', new Error(`IP blocked: ${ip}, reason: ${reason}`), { ip, reason });"
  );
  
  fs.writeFileSync(securityFile, content);
  console.log('✅ Fixed security enhancements logger call');
}

// 4. Fix retry utility logger calls
console.log('🔧 Fixing retry utility...');
const retryFile = path.join(__dirname, '../lib/utils/retry.ts');

if (fs.existsSync(retryFile)) {
  let content = fs.readFileSync(retryFile, 'utf8');
  
  // Fix logger calls
  content = content.replace(
    /logger\.warn\(`Retry attempt \${attemptNumber} after error: \${error\.message}`\);/g,
    "logger.warn(`Retry attempt ${attemptNumber} after error: ${error instanceof Error ? error.message : String(error)}`, 'RETRY');"
  );
  
  content = content.replace(
    /logger\.error\(`Operation failed after \${attempt} attempts: \${error\.message}`, \{[\s\S]*?\}\);/g,
    "logger.error(`Operation failed after ${attempt} attempts: ${error instanceof Error ? error.message : String(error)}`, 'RETRY', error instanceof Error ? error : new Error(String(error)));"
  );
  
  content = content.replace(
    /logger\.info\(`Retrying operation \(\${attempt}\/\${config\.maxRetries}\) after \${delay}ms delay`\);/g,
    "logger.info(`Retrying operation (${attempt}/${config.maxRetries}) after ${delay}ms delay`, 'RETRY');"
  );
  
  fs.writeFileSync(retryFile, content);
  console.log('✅ Fixed retry utility logger calls');
}

// 5. Create a temporary fix for Sanity imports (if needed)
console.log('🔧 Creating temporary Sanity type fixes...');
const sanityTypesDir = path.join(__dirname, '../types');
if (!fs.existsSync(sanityTypesDir)) {
  fs.mkdirSync(sanityTypesDir, { recursive: true });
}

const sanityTypesFile = path.join(sanityTypesDir, 'sanity.d.ts');
if (!fs.existsSync(sanityTypesFile)) {
  const sanityTypes = `// Temporary type declarations for Sanity
declare module '@sanity/icons' {
  export const UserIcon: React.ComponentType<any>;
  export const ImageIcon: React.ComponentType<any>;
  export const TagIcon: React.ComponentType<any>;
  export const DocumentTextIcon: React.ComponentType<any>;
}

declare module '@sanity/image-url' {
  export default function createImageUrlBuilder(config: any): any;
}

declare module '@sanity/image-url/lib/types/types' {
  export interface SanityImageSource {
    [key: string]: any;
  }
}

declare module 'next-sanity' {
  export function defineLive(config: any): any;
  export * from 'next-sanity/studio';
}
`;
  
  fs.writeFileSync(sanityTypesFile, sanityTypes);
  console.log('✅ Created temporary Sanity type declarations');
}

console.log('\n🎉 Type error fixes completed!');
console.log('\nNext steps:');
console.log('1. Run `pnpm run type-check` to verify fixes');
console.log('2. Address any remaining null safety issues manually');
console.log('3. Consider upgrading Vite to resolve plugin conflicts'); 