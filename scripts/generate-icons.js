#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Create a simple SVG template for HMNP icons
const createIconSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0066cc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#004499;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#bg)"/>
  <text x="50%" y="30%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold">HMNP</text>
  <text x="50%" y="70%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.08}">Notary</text>
</svg>`;

// Generate icons
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Generate shortcut icons
const shortcutIcons = [
  { name: 'shortcut-book.svg', text: '📝', subtitle: 'Book' },
  { name: 'shortcut-bookings.svg', text: '📋', subtitle: 'History' }
];

shortcutIcons.forEach(({ name, text, subtitle }) => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="9.6" fill="#0066cc"/>
  <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="32">${text}</text>
  <text x="50%" y="75%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">${subtitle}</text>
</svg>`;
  
  fs.writeFileSync(path.join(iconsDir, name), svgContent);
  console.log(`Generated ${name}`);
});

console.log('All PWA icons generated successfully!');