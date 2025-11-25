#!/usr/bin/env tsx
/**
 * Route Usage Verification Script
 * 
 * Scans all API routes and checks if they're actually used in the codebase.
 * Generates a report of unused routes that can potentially be removed.
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative as pathRelative, extname } from 'path';
import { existsSync } from 'fs';

interface RouteInfo {
  path: string;
  relativePath: string;
  methods: string[];
  isUsed: boolean;
  usageCount: number;
  usageLocations: string[];
  category: 'production' | 'debug' | 'test' | 'admin' | 'webhook' | 'unknown';
  securityStatus: 'public' | 'gated' | 'unknown';
}

const API_DIR = join(process.cwd(), 'app/api');
const SEARCH_DIRS = [
  join(process.cwd(), 'app'),
  join(process.cwd(), 'components'),
  join(process.cwd(), 'lib'),
  join(process.cwd(), 'hooks'),
];

// Routes that should be excluded from "unused" warnings
const EXCLUDED_ROUTES = [
  '/api/webhooks/', // Webhooks are called externally
  '/api/auth/[...nextauth]', // NextAuth special route
  '/api/health', // Health checks are called by monitoring
];

// Routes that are known to be debug/test routes
const DEBUG_TEST_ROUTES = [
  '/api/debug/',
  '/api/test-',
  '/api/diagnostics',
  '/api/cron-test',
  '/api/system-test',
  '/api/ai/test',
  '/api/auth/test',
];

async function getAllRouteFiles(dir: string, basePath: string = ''): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other ignored directories
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }
        const subFiles = await getAllRouteFiles(fullPath, relativePath);
        files.push(...subFiles);
      } else if (entry.isFile() && (entry.name === 'route.ts' || entry.name === 'route.js')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist or be inaccessible
    console.warn(`Warning: Could not read directory ${dir}:`, error);
  }
  
  return files;
}

function getRoutePath(filePath: string): string {
  // Convert file path to API route path
  // e.g., app/api/booking/create/route.ts -> /api/booking/create
  const relativePath = pathRelative(process.cwd(), filePath);
  const parts = relativePath.split(/[/\\]/);
  
  // Find 'api' in the path
  const apiIndex = parts.indexOf('api');
  if (apiIndex === -1) return '';
  
  const routeParts = parts.slice(apiIndex + 1, -1); // Exclude 'route.ts'
  return '/' + routeParts.join('/');
}

function categorizeRoute(routePath: string): RouteInfo['category'] {
  if (routePath.includes('/webhooks/')) return 'webhook';
  if (routePath.includes('/admin/')) return 'admin';
  if (routePath.includes('/debug/') || routePath.includes('/test-') || routePath.includes('/diagnostics')) return 'debug';
  if (routePath.includes('/test') || routePath.includes('/cron-test') || routePath.includes('/system-test')) return 'test';
  return 'production';
}

async function detectSecurityStatus(filePath: string): Promise<RouteInfo['securityStatus']> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Check for admin security
    if (content.includes('withAdminSecurity') || content.includes('getServerSession') && content.includes('ADMIN')) {
      return 'gated';
    }
    
    // Check for other security middleware
    if (content.includes('withAuthSecurity') || content.includes('withBookingSecurity') || content.includes('withPaymentSecurity')) {
      return 'gated';
    }
    
    // Check for public/ungated routes
    if (content.includes('withPublicSecurity') || content.includes('withRateLimit(\'public\'')) {
      return 'public';
    }
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

async function extractMethods(filePath: string): Promise<string[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const methods: string[] = [];
    
    // Look for exported HTTP methods
    if (content.includes('export const GET') || content.includes('export async function GET')) methods.push('GET');
    if (content.includes('export const POST') || content.includes('export async function POST')) methods.push('POST');
    if (content.includes('export const PUT') || content.includes('export async function PUT')) methods.push('PUT');
    if (content.includes('export const DELETE') || content.includes('export async function DELETE')) methods.push('DELETE');
    if (content.includes('export const PATCH') || content.includes('export async function PATCH')) methods.push('PATCH');
    
    return methods.length > 0 ? methods : ['GET']; // Default to GET if no methods found
  } catch (error) {
    return ['GET'];
  }
}

async function searchForRouteUsage(routePath: string): Promise<{ count: number; locations: string[] }> {
  const searchPatterns = [
    routePath, // Exact path
    routePath.replace(/\/$/, ''), // Without trailing slash
    `"${routePath}"`, // In quotes
    `'${routePath}'`, // In single quotes
    `\`${routePath}\``, // In template literals
    routePath.replace(/^\/api\//, '/api/'), // Ensure /api/ prefix
  ];
  
  let totalCount = 0;
  const locations: string[] = [];
  
  for (const searchDir of SEARCH_DIRS) {
    if (!existsSync(searchDir)) continue;
    
    try {
      const results = await searchInDirectory(searchDir, searchPatterns, routePath);
      totalCount += results.count;
      locations.push(...results.locations);
    } catch (error) {
      // Skip directories that can't be searched
    }
  }
  
  return { count: totalCount, locations: [...new Set(locations)] };
}

async function searchInDirectory(
  dir: string,
  patterns: string[],
  routePath: string
): Promise<{ count: number; locations: string[] }> {
  const locations: string[] = [];
  let count = 0;
  
  async function searchRecursive(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        
        // Skip certain directories
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.') || 
              entry.name === 'node_modules' || 
              entry.name === '.next' ||
              entry.name === 'coverage') {
            continue;
          }
          await searchRecursive(fullPath);
        } else if (entry.isFile()) {
          // Only search in relevant file types
          const ext = extname(entry.name);
          if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            continue;
          }
          
          try {
            const content = await readFile(fullPath, 'utf-8');
            
            for (const pattern of patterns) {
              if (content.includes(pattern)) {
                count++;
                const relativePath = relative(process.cwd(), fullPath);
                if (!locations.includes(relativePath)) {
                  locations.push(relativePath);
                }
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    } catch (error) {
      // Skip directories that can't be accessed
    }
  }
  
  await searchRecursive(dir);
  return { count, locations };
}

async function analyzeRoutes(): Promise<RouteInfo[]> {
  console.log('🔍 Scanning API routes...\n');
  
  const routeFiles = await getAllRouteFiles(API_DIR);
  const routes: RouteInfo[] = [];
  
  for (const filePath of routeFiles) {
    const routePath = getRoutePath(filePath);
    if (!routePath) continue;
    
    const methods = await extractMethods(filePath);
    const category = categorizeRoute(routePath);
    const securityStatus = await detectSecurityStatus(filePath);
    
    // Check if route is excluded
    const isExcluded = EXCLUDED_ROUTES.some(excluded => routePath.startsWith(excluded));
    
    // Search for usage (skip if excluded)
    const usage = isExcluded 
      ? { count: 999, locations: ['EXCLUDED'] } 
      : await searchForRouteUsage(routePath);
    
    routes.push({
      path: filePath,
      relativePath: routePath,
      methods,
      isUsed: usage.count > 0,
      usageCount: usage.count,
      usageLocations: usage.locations.slice(0, 10), // Limit to first 10 locations
      category,
      securityStatus,
    });
  }
  
  return routes;
}

function generateReport(routes: RouteInfo[]): string {
  const report: string[] = [];
  
  report.push('# API Route Usage Report\n');
  report.push(`Generated: ${new Date().toISOString()}\n`);
  report.push(`Total Routes: ${routes.length}\n\n`);
  
  // Summary
  const used = routes.filter(r => r.isUsed || r.usageCount > 0);
  const unused = routes.filter(r => !r.isUsed && r.usageCount === 0 && !EXCLUDED_ROUTES.some(e => r.relativePath.startsWith(e)));
  const debugTest = routes.filter(r => r.category === 'debug' || r.category === 'test');
  const publicRoutes = routes.filter(r => r.securityStatus === 'public');
  const gatedRoutes = routes.filter(r => r.securityStatus === 'gated');
  
  report.push('## Summary\n');
  report.push(`- **Used Routes:** ${used.length}`);
  report.push(`- **Unused Routes:** ${unused.length}`);
  report.push(`- **Debug/Test Routes:** ${debugTest.length}`);
  report.push(`- **Public Routes:** ${publicRoutes.length}`);
  report.push(`- **Gated Routes:** ${gatedRoutes.length}\n\n`);
  
  // Unused routes (potential cleanup candidates)
  if (unused.length > 0) {
    report.push('## ⚠️ Unused Routes (Potential Cleanup Candidates)\n');
    report.push('These routes have no references in the codebase:\n\n');
    
    for (const route of unused.sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
      report.push(`### ${route.relativePath}`);
      report.push(`- **Methods:** ${route.methods.join(', ')}`);
      report.push(`- **Category:** ${route.category}`);
      report.push(`- **Security:** ${route.securityStatus}`);
      report.push(`- **File:** \`${relative(process.cwd(), route.path)}\`\n`);
    }
    report.push('\n');
  }
  
  // Public routes (security concern)
  if (publicRoutes.length > 0) {
    report.push('## 🔒 Public Routes (Security Review)\n');
    report.push('These routes are publicly accessible without authentication:\n\n');
    
    for (const route of publicRoutes.sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
      report.push(`- **${route.relativePath}** (${route.methods.join(', ')})`);
      if (route.category === 'debug' || route.category === 'test') {
        report.push(`  ⚠️ **DEBUG/TEST ROUTE** - Should be gated!\n`);
      }
    }
    report.push('\n');
  }
  
  // Debug/Test routes
  if (debugTest.length > 0) {
    report.push('## 🧪 Debug/Test Routes\n');
    report.push('These routes are for debugging/testing purposes:\n\n');
    
    for (const route of debugTest.sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
      const statusIcon = route.securityStatus === 'gated' ? '✅' : '⚠️';
      report.push(`- ${statusIcon} **${route.relativePath}** (${route.methods.join(', ')})`);
      report.push(`  - Security: ${route.securityStatus}`);
      report.push(`  - Usage: ${route.usageCount} references\n`);
    }
    report.push('\n');
  }
  
  // All routes (detailed)
  report.push('## 📋 All Routes\n\n');
  report.push('| Route | Methods | Category | Security | Usage |\n');
  report.push('|-------|---------|----------|----------|-------|\n');
  
  for (const route of routes.sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
    const usageIcon = route.isUsed || route.usageCount > 0 ? '✅' : '❌';
    report.push(`| ${route.relativePath} | ${route.methods.join(', ')} | ${route.category} | ${route.securityStatus} | ${usageIcon} ${route.usageCount} |\n`);
  }
  
  return report.join('');
}

async function generateJSONReport(routes: RouteInfo[]): Promise<string> {
  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalRoutes: routes.length,
    summary: {
      used: routes.filter(r => r.isUsed || r.usageCount > 0).length,
      unused: routes.filter(r => !r.isUsed && r.usageCount === 0).length,
      debugTest: routes.filter(r => r.category === 'debug' || r.category === 'test').length,
      public: routes.filter(r => r.securityStatus === 'public').length,
      gated: routes.filter(r => r.securityStatus === 'gated').length,
    },
    routes: routes.map(r => ({
      path: r.relativePath,
      methods: r.methods,
      category: r.category,
      securityStatus: r.securityStatus,
      usageCount: r.usageCount,
      usageLocations: r.usageLocations,
      isUsed: r.isUsed,
    })),
  }, null, 2);
}

async function main() {
  console.log('🚀 Starting route usage verification...\n');
  
  const routes = await analyzeRoutes();
  
  // Generate reports
  const markdownReport = generateReport(routes);
  const jsonReport = await generateJSONReport(routes);
  
  // Write reports
  const reportPath = join(process.cwd(), 'route-usage-report.md');
  const jsonPath = join(process.cwd(), 'route-usage-report.json');
  
  await import('fs/promises').then(fs => {
    fs.writeFile(reportPath, markdownReport, 'utf-8');
    fs.writeFile(jsonPath, jsonReport, 'utf-8');
  });
  
  console.log('✅ Analysis complete!\n');
  console.log(`📄 Markdown report: ${reportPath}`);
  console.log(`📊 JSON report: ${jsonPath}\n`);
  
  // Print summary
  const unused = routes.filter(r => !r.isUsed && r.usageCount === 0 && !EXCLUDED_ROUTES.some(e => r.relativePath.startsWith(e)));
  const publicDebugTest = routes.filter(r => 
    (r.category === 'debug' || r.category === 'test') && r.securityStatus === 'public'
  );
  
  if (unused.length > 0) {
    console.log(`⚠️  Found ${unused.length} unused routes that could be removed`);
  }
  
  if (publicDebugTest.length > 0) {
    console.log(`🔒 Found ${publicDebugTest.length} public debug/test routes that should be gated`);
  }
  
  console.log('\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { analyzeRoutes, generateReport, generateJSONReport };

