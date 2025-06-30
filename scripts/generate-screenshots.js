#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const screenshotsDir = path.join(publicDir, 'screenshots');

// Create mobile screenshot SVG
const createMobileScreenshot = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="430" height="932" viewBox="0 0 430 932" xmlns="http://www.w3.org/2000/svg">
  <rect width="430" height="932" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect width="430" height="80" fill="#0066cc"/>
  <text x="215" y="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">HMNP Dashboard</text>
  
  <!-- Welcome Section -->
  <rect x="20" y="100" width="390" height="120" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="40" y="130" fill="#1e293b" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Welcome Back!</text>
  <text x="40" y="155" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Manage your notary services</text>
  
  <!-- Quick Actions -->
  <rect x="20" y="240" width="185" height="100" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="30" y="250" width="60" height="60" rx="8" fill="#0066cc"/>
  <text x="60" y="285" text-anchor="middle" fill="white" font-size="24">📝</text>
  <text x="100" y="270" fill="#1e293b" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Book Service</text>
  
  <rect x="225" y="240" width="185" height="100" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="235" y="250" width="60" height="60" rx="8" fill="#059669"/>
  <text x="265" y="285" text-anchor="middle" fill="white" font-size="24">📋</text>
  <text x="305" y="270" fill="#1e293b" font-family="Arial, sans-serif" font-size="14" font-weight="bold">My Bookings</text>
  
  <!-- Recent Activity -->
  <text x="20" y="380" fill="#1e293b" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Recent Activity</text>
  <rect x="20" y="400" width="390" height="200" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="40" y="430" fill="#64748b" font-family="Arial, sans-serif" font-size="14">• Document Notarization - Completed</text>
  <text x="40" y="460" fill="#64748b" font-family="Arial, sans-serif" font-size="14">• Power of Attorney - Scheduled</text>
  <text x="40" y="490" fill="#64748b" font-family="Arial, sans-serif" font-size="14">• Will Signing - In Progress</text>
</svg>`;

// Create desktop screenshot SVG
const createDesktopScreenshot = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="720" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect width="1280" height="80" fill="#0066cc"/>
  <text x="60" y="50" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Houston Mobile Notary Pros</text>
  <text x="1000" y="35" fill="white" font-family="Arial, sans-serif" font-size="14">Dashboard</text>
  <text x="1000" y="55" fill="white" font-family="Arial, sans-serif" font-size="14">Bookings</text>
  
  <!-- Main Content -->
  <rect x="60" y="120" width="560" height="300" rx="12" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="80" y="150" fill="#1e293b" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Service Overview</text>
  
  <!-- Stats Cards -->
  <rect x="100" y="180" width="120" height="80" rx="8" fill="#0066cc"/>
  <text x="160" y="205" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Total Services</text>
  <text x="160" y="230" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">42</text>
  
  <rect x="240" y="180" width="120" height="80" rx="8" fill="#059669"/>
  <text x="300" y="205" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Completed</text>
  <text x="300" y="230" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">38</text>
  
  <rect x="380" y="180" width="120" height="80" rx="8" fill="#dc2626"/>
  <text x="440" y="205" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Pending</text>
  <text x="440" y="230" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">4</text>
  
  <!-- Side Panel -->
  <rect x="660" y="120" width="560" height="500" rx="12" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="680" y="150" fill="#1e293b" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Quick Actions</text>
  
  <rect x="700" y="180" width="200" height="60" rx="8" fill="#0066cc"/>
  <text x="800" y="215" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Book New Service</text>
  
  <rect x="920" y="180" width="200" height="60" rx="8" fill="#059669"/>
  <text x="1020" y="215" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">View Calendar</text>
</svg>`;

// Create booking mobile screenshot
const createBookingMobileScreenshot = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="430" height="932" viewBox="0 0 430 932" xmlns="http://www.w3.org/2000/svg">
  <rect width="430" height="932" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect width="430" height="80" fill="#0066cc"/>
  <text x="215" y="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Book Service</text>
  
  <!-- Form -->
  <rect x="20" y="100" width="390" height="400" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1"/>
  <text x="40" y="130" fill="#1e293b" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Service Details</text>
  
  <!-- Service Type -->
  <text x="40" y="160" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Service Type</text>
  <rect x="40" y="170" width="350" height="40" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="50" y="195" fill="#1e293b" font-family="Arial, sans-serif" font-size="14">Document Notarization</text>
  
  <!-- Date -->
  <text x="40" y="235" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Preferred Date</text>
  <rect x="40" y="245" width="350" height="40" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="50" y="270" fill="#1e293b" font-family="Arial, sans-serif" font-size="14">Select date...</text>
  
  <!-- Location -->
  <text x="40" y="310" fill="#64748b" font-family="Arial, sans-serif" font-size="14">Location</text>
  <rect x="40" y="320" width="350" height="40" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
  <text x="50" y="345" fill="#1e293b" font-family="Arial, sans-serif" font-size="14">Enter address...</text>
  
  <!-- Submit Button -->
  <rect x="40" y="440" width="350" height="50" rx="8" fill="#0066cc"/>
  <text x="215" y="470" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Book Appointment</text>
</svg>`;

// Generate screenshots
fs.writeFileSync(path.join(screenshotsDir, 'dashboard-mobile.svg'), createMobileScreenshot());
fs.writeFileSync(path.join(screenshotsDir, 'dashboard-desktop.svg'), createDesktopScreenshot());
fs.writeFileSync(path.join(screenshotsDir, 'booking-mobile.svg'), createBookingMobileScreenshot());

console.log('Generated dashboard-mobile.svg');
console.log('Generated dashboard-desktop.svg');
console.log('Generated booking-mobile.svg');
console.log('All PWA screenshots generated successfully!');