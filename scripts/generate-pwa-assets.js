#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// PWA Icon sizes needed
const iconSizes = [
  16, 32, 48, 57, 60, 72, 76, 96, 114, 120, 128, 144, 152, 180, 192, 384, 512
];

// Splash screen sizes for different devices
const splashSizes = [
  { name: 'iphone5_splash', width: 640, height: 1136 },
  { name: 'iphone6_splash', width: 750, height: 1334 },
  { name: 'iphoneplus_splash', width: 1242, height: 2208 },
  { name: 'iphonex_splash', width: 1125, height: 2436 },
  { name: 'iphonexr_splash', width: 828, height: 1792 },
  { name: 'iphonexsmax_splash', width: 1242, height: 2688 },
  { name: 'ipad_splash', width: 1536, height: 2048 },
  { name: 'ipadpro1_splash', width: 1668, height: 2224 },
  { name: 'ipadpro2_splash', width: 2048, height: 2732 },
  { name: 'ipadpro3_splash', width: 1668, height: 2388 }
];

// Create a simple SVG icon as fallback
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#002147"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.3}" fill="#A52A2A"/>
  <text x="${size/2}" y="${size/2 + size*0.05}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size*0.15}" font-weight="bold">HM</text>
</svg>`;
}

// Create a simple splash screen SVG
function createSplashSVG(width, height) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#002147"/>
  <g transform="translate(${width/2}, ${height/2})">
    <circle r="${Math.min(width, height) * 0.1}" fill="#A52A2A"/>
    <text y="${Math.min(width, height) * 0.02}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.03}" font-weight="bold">HMNP</text>
    <text y="${Math.min(width, height) * 0.06}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.015}">Houston Mobile Notary Pros</text>
  </g>
</svg>`;
}

// Create favicon
function createFavicon() {
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#002147"/>
  <circle cx="16" cy="16" r="10" fill="#A52A2A"/>
  <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="8" font-weight="bold">HM</text>
</svg>`;
}

async function generatePWAAssets() {
  const publicDir = path.join(__dirname, '..', 'public');
  const iconsDir = path.join(publicDir, 'icons');
  const splashDir = path.join(publicDir, 'splash');
  
  // Ensure directories exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }

  console.log('🎨 Generating PWA assets...');

  // Generate icons
  console.log('📱 Creating PWA icons...');
  for (const size of iconSizes) {
    const svg = createSVGIcon(size);
    const filename = `icon-${size}x${size}.png`;
    
    // For now, save as SVG (in production you'd convert to PNG)
    const svgFilename = `icon-${size}x${size}.svg`;
    fs.writeFileSync(path.join(iconsDir, svgFilename), svg);
    
    // Create a simple text-based "icon" for immediate use
    const htmlIcon = `<!DOCTYPE html>
<html><head><style>
body{margin:0;width:${size}px;height:${size}px;background:#002147;display:flex;align-items:center;justify-content:center;color:white;font-family:Arial;font-size:${Math.floor(size/8)}px;font-weight:bold}
</style></head><body>HM</body></html>`;
    
    console.log(`  ✓ Generated icon-${size}x${size}.svg`);
  }

  // Generate splash screens
  console.log('🖼️  Creating splash screens...');
  for (const splash of splashSizes) {
    const svg = createSplashSVG(splash.width, splash.height);
    fs.writeFileSync(path.join(splashDir, `${splash.name}.svg`), svg);
    console.log(`  ✓ Generated ${splash.name}.svg`);
  }

  // Generate favicon
  console.log('🔖 Creating favicon...');
  const faviconSVG = createFavicon();
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
  
  // Create favicon.ico placeholder (you'd need a proper converter for production)
  const faviconHtml = `<!DOCTYPE html>
<html><head><style>
body{margin:0;width:32px;height:32px;background:#002147;display:flex;align-items:center;justify-content:center;color:white;font-family:Arial;font-size:8px;font-weight:bold}
</style></head><body>HM</body></html>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.html'), faviconHtml);

  // Generate shortcut icons
  console.log('⚡ Creating shortcut icons...');
  const shortcuts = ['book', 'bookings'];
  for (const shortcut of shortcuts) {
    const svg = createSVGIcon(96);
    fs.writeFileSync(path.join(iconsDir, `shortcut-${shortcut}.svg`), svg);
    console.log(`  ✓ Generated shortcut-${shortcut}.svg`);
  }

  // Generate action icons
  console.log('🎬 Creating action icons...');
  const actions = ['view', 'dismiss'];
  for (const action of actions) {
    const svg = createSVGIcon(48);
    fs.writeFileSync(path.join(iconsDir, `action-${action}.svg`), svg);
    console.log(`  ✓ Generated action-${action}.svg`);
  }

  // Generate badge icon
  const badgeSvg = createSVGIcon(72);
  fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeSvg);
  console.log('  ✓ Generated badge icon');

  console.log('✅ PWA assets generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Replace SVG placeholders with proper PNG icons (use tools like sharp, imagemagick)');
  console.log('2. Add screenshots to public/screenshots/');
  console.log('3. Set up VAPID keys for push notifications');
  console.log('4. Test PWA installation on mobile devices');
}

// Run the script
if (require.main === module) {
  generatePWAAssets().catch(console.error);
}

module.exports = { generatePWAAssets }; 