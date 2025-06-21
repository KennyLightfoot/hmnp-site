/**
 * Development Mode Configuration
 * 
 * This script sets up the API server to run in development mode
 * with simulated authentication for testing the permission system.
 */

// Set development mode environment variable
process.env.DEV_MODE = 'true';
// NOTE: NODE_ENV is automatically managed by Next.js - don't set it manually

console.log('🔧 Development mode enabled');
console.log('⚠️ Using simulated authentication (ADMIN role)');

// Import and run the server
import('../server.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
