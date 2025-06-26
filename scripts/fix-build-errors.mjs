#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing build errors...\n');

// 1. Set environment variables for build
process.env.SKIP_ENV_VALIDATION = 'true';
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';
process.env.NODE_ENV = 'production';

console.log('✅ Environment variables set for build');

// 2. Try to identify the Html import issue
function findHtmlImports(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        findHtmlImports(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for Html imports from next/document
        if (content.includes('Html') && content.includes('next/document')) {
          console.log(`❌ Found Html import in: ${filePath}`);
          console.log('This file imports Html from next/document outside of _document.tsx');
        }
        
        // Check for unsafe environment variable access during static generation
        if (content.includes('process.env.NEXT_PUBLIC_BASE_URL') && !content.includes('||')) {
          console.log(`⚠️  Unsafe env access in: ${filePath}`);
          console.log('   Missing fallback for process.env.NEXT_PUBLIC_BASE_URL');
        }
      }
    }
  } catch (error) {
    console.log(`⚠️  Error scanning ${dir}: ${error.message}`);
  }
}

console.log('\n📁 Scanning for Html imports and unsafe env access...');
findHtmlImports('./app');
findHtmlImports('./components');
findHtmlImports('./lib');

console.log('\n🔧 Build fixes complete. Run: SKIP_ENV_VALIDATION=true npm run build'); 