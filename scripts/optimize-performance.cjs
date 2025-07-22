#!/usr/bin/env node

/**
 * 🚀 PERFORMANCE OPTIMIZATION SCRIPT
 * Houston Mobile Notary Pros
 * 
 * Analyzes and optimizes application performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 PERFORMANCE OPTIMIZATION SCRIPT');
console.log('===================================\n');

// ============================================================================
// BUNDLE ANALYSIS
// ============================================================================

function analyzeBundle() {
  console.log('📦 Analyzing bundle size...');
  
  try {
    // Check if .next directory exists
    if (!fs.existsSync('.next')) {
      console.log('❌ .next directory not found. Run "pnpm build" first.');
      return;
    }

    // Analyze bundle size
    const bundleStats = execSync('pnpm build --debug', { encoding: 'utf8' });
    
    // Extract bundle size information
    const bundleSizeMatch = bundleStats.match(/First Load JS\s+(\d+\.?\d*)\s+(\w+)/);
    if (bundleSizeMatch) {
      const size = parseFloat(bundleSizeMatch[1]);
      const unit = bundleSizeMatch[2];
      console.log(`📊 Bundle size: ${size} ${unit}`);
      
      if (size > 1 && unit === 'MB') {
        console.log('⚠️  Bundle size is large. Consider code splitting.');
      } else {
        console.log('✅ Bundle size is acceptable.');
      }
    }

    // Check for large dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log('\n📋 Large dependencies:');
    Object.entries(dependencies).forEach(([name, version]) => {
      if (name.includes('@prisma') || name.includes('@sentry') || name.includes('@opentelemetry')) {
        console.log(`  ⚠️  ${name}@${version} - Consider lazy loading`);
      }
    });

  } catch (error) {
    console.log('❌ Bundle analysis failed:', error.message);
  }
}

// ============================================================================
// IMAGE OPTIMIZATION CHECK
// ============================================================================

function checkImageOptimization() {
  console.log('\n🖼️  Checking image optimization...');
  
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    console.log('❌ Public directory not found.');
    return;
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const largeImages = [];

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (imageExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
        const sizeInMB = stat.size / (1024 * 1024);
        if (sizeInMB > 1) {
          largeImages.push({
            path: filePath.replace(process.cwd(), ''),
            size: sizeInMB
          });
        }
      }
    });
  }

  scanDirectory(publicDir);

  if (largeImages.length > 0) {
    console.log('⚠️  Large images found:');
    largeImages.forEach(img => {
      console.log(`  ${img.path}: ${img.size.toFixed(2)}MB`);
    });
    console.log('💡 Consider using next/image for automatic optimization');
  } else {
    console.log('✅ No large images found.');
  }
}

// ============================================================================
// CODE SPLITTING ANALYSIS
// ============================================================================

function analyzeCodeSplitting() {
  console.log('\n🔀 Analyzing code splitting...');
  
  const appDir = path.join(process.cwd(), 'app');
  if (!fs.existsSync(appDir)) {
    console.log('❌ App directory not found.');
    return;
  }

  const largeFiles = [];
  const totalFiles = { count: 0, size: 0 };

  function scanAppDirectory(dir, depth = 0) {
    if (depth > 3) return; // Limit depth to avoid infinite recursion
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        scanAppDirectory(filePath, depth + 1);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        totalFiles.count++;
        totalFiles.size += stat.size;
        
        const sizeInKB = stat.size / 1024;
        if (sizeInKB > 50) { // Files larger than 50KB
          largeFiles.push({
            path: filePath.replace(process.cwd(), ''),
            size: sizeInKB
          });
        }
      }
    });
  }

  scanAppDirectory(appDir);

  console.log(`📊 Total files: ${totalFiles.count}`);
  console.log(`📊 Total size: ${(totalFiles.size / 1024 / 1024).toFixed(2)}MB`);

  if (largeFiles.length > 0) {
    console.log('⚠️  Large files that could benefit from code splitting:');
    largeFiles.forEach(file => {
      console.log(`  ${file.path}: ${file.size.toFixed(1)}KB`);
    });
  } else {
    console.log('✅ No large files found.');
  }
}

// ============================================================================
// CACHING ANALYSIS
// ============================================================================

function analyzeCaching() {
  console.log('\n💾 Analyzing caching strategy...');
  
  const cacheableRoutes = [
    '/',
    '/services',
    '/faq',
    '/contact',
    '/about'
  ];

  console.log('📋 Cacheable routes:');
  cacheableRoutes.forEach(route => {
    console.log(`  ✅ ${route} - Should be cached`);
  });

  // Check for cache headers in API routes
  const apiDir = path.join(process.cwd(), 'app', 'api');
  if (fs.existsSync(apiDir)) {
    console.log('\n🔍 API routes caching analysis:');
    
    const apiFiles = fs.readdirSync(apiDir, { recursive: true });
    const routeFiles = apiFiles.filter(file => file.endsWith('route.ts'));
    
    routeFiles.forEach(file => {
      const filePath = path.join(apiDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('Cache-Control') || content.includes('cache')) {
        console.log(`  ✅ ${file} - Has caching`);
      } else {
        console.log(`  ⚠️  ${file} - No caching detected`);
      }
    });
  }
}

// ============================================================================
// PERFORMANCE RECOMMENDATIONS
// ============================================================================

function generateRecommendations() {
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS');
  console.log('==============================\n');

  const recommendations = [
    {
      priority: '🔴 CRITICAL',
      items: [
        'Implement React.lazy() for route-based code splitting',
        'Add loading states to all async operations',
        'Optimize database queries with proper indexing',
        'Implement proper error boundaries'
      ]
    },
    {
      priority: '🟡 IMPORTANT',
      items: [
        'Add skeleton screens for better perceived performance',
        'Implement service worker for caching',
        'Optimize images with next/image',
        'Add preload hints for critical resources'
      ]
    },
    {
      priority: '🟢 NICE TO HAVE',
      items: [
        'Implement progressive loading for large lists',
        'Add performance monitoring with Web Vitals',
        'Optimize font loading with font-display: swap',
        'Implement virtual scrolling for large datasets'
      ]
    }
  ];

  recommendations.forEach(category => {
    console.log(`${category.priority}:`);
    category.items.forEach(item => {
      console.log(`  • ${item}`);
    });
    console.log('');
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    analyzeBundle();
    checkImageOptimization();
    analyzeCodeSplitting();
    analyzeCaching();
    generateRecommendations();
    
    console.log('✅ Performance analysis complete!');
    console.log('\n🚀 Next steps:');
    console.log('1. Implement the critical recommendations first');
    console.log('2. Run "pnpm build" to test optimizations');
    console.log('3. Use Lighthouse to measure improvements');
    console.log('4. Monitor Core Web Vitals in production');
    
  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundle,
  checkImageOptimization,
  analyzeCodeSplitting,
  analyzeCaching,
  generateRecommendations
}; 