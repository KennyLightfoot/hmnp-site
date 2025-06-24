/**
 * PWA Icon Generation Script
 * 
 * This script helps generate the required PWA icons from a source image.
 * You'll need to install sharp: npm install sharp
 * 
 * Usage: node scripts/generate-pwa-icons.js path/to/source-image.png
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 57, name: 'icon-57x57.png' },
  { size: 60, name: 'icon-60x60.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 76, name: 'icon-76x76.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 114, name: 'icon-114x114.png' },
  { size: 120, name: 'icon-120x120.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'icon-180x180.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons(sourcePath) {
  try {
    // Ensure icons directory exists
    const iconsDir = path.join(process.cwd(), 'public', 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    console.log('Generating PWA icons...');

    for (const icon of iconSizes) {
      const outputPath = path.join(iconsDir, icon.name);
      
      await sharp(sourcePath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${icon.name}`);
    }

    // Generate favicon.ico
    await sharp(sourcePath)
      .resize(32, 32)
      .png()
      .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));
    
    console.log('✓ Generated favicon.ico');

    // Generate shortcut icons
    await sharp(sourcePath)
      .resize(96, 96)
      .png()
      .toFile(path.join(iconsDir, 'shortcut-book.png'));
    
    await sharp(sourcePath)
      .resize(96, 96)
      .png()
      .toFile(path.join(iconsDir, 'shortcut-bookings.png'));
    
    console.log('✓ Generated shortcut icons');

    // Generate badge icon for notifications
    await sharp(sourcePath)
      .resize(72, 72)
      .png()
      .toFile(path.join(iconsDir, 'badge-72x72.png'));
    
    console.log('✓ Generated badge icon');

    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated icons in public/icons/');
    console.log('2. Generate splash screens for iOS (optional)');
    console.log('3. Test PWA installation on various devices');

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Check if source image path is provided
const sourcePath = process.argv[2];
if (!sourcePath) {
  console.log('Usage: node scripts/generate-pwa-icons.js path/to/source-image.png');
  console.log('\nExample: node scripts/generate-pwa-icons.js public/logo.png');
  process.exit(1);
}

// Check if source file exists
if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Source file not found: ${sourcePath}`);
  process.exit(1);
}

generateIcons(sourcePath); 