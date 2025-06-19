#!/usr/bin/env node
/**
 * Notification Scheduler Trigger Script
 * 
 * This script is designed to be run via cron jobs to trigger 
 * notification checks without needing to keep the scheduler running.
 * 
 * Usage:
 *  node trigger-notifications.js --mode=check
 *  node trigger-notifications.js --mode=init
 */

const https = require('https');
const { parse } = require('url');

// Configuration
const CONFIG = {
  // Update this with your actual production URL when deployed
  baseUrl: process.env.APP_URL || 'https://yourdomain.com',
  apiPath: '/api/scheduler',
  secret: process.env.SCHEDULER_SECRET || 'your-secret-key',
  timeout: 60000 // 60 seconds
};

// Parse arguments
const args = process.argv.slice(2);
const modeArg = args.find(arg => arg.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1] : 'check';

// Valid modes
const MODES = {
  CHECK: 'check',
  INIT: 'init',
  STATUS: 'status'
};

// Validate mode
if (!Object.values(MODES).includes(mode)) {
  console.error(`Invalid mode: ${mode}. Valid modes are: ${Object.values(MODES).join(', ')}`);
  process.exit(1);
}

/**
 * Make an HTTP request to the scheduler API
 */
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const { hostname, pathname, protocol } = parse(`${CONFIG.baseUrl}${path}`);
    
    const options = {
      hostname,
      path: pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.secret}`
      },
      timeout: CONFIG.timeout
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(new Error(`API returned status code ${res.statusCode}: ${JSON.stringify(parsedData)}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}

/**
 * Run the script based on the specified mode
 */
async function run() {
  try {
    console.log(`Running notification scheduler in ${mode} mode...`);
    
    switch (mode) {
      case MODES.CHECK:
        // Trigger notification check
        const checkResult = await makeRequest(`${CONFIG.apiPath}/check`, 'POST');
        console.log('Notification check triggered successfully:', checkResult);
        break;
        
      case MODES.INIT:
        // Initialize the scheduler
        const initResult = await makeRequest(`${CONFIG.apiPath}/init`, 'POST');
        console.log('Scheduler initialized successfully:', initResult);
        break;
        
      case MODES.STATUS:
        // Check scheduler status
        const statusResult = await makeRequest(CONFIG.apiPath, 'GET');
        console.log('Scheduler status:', statusResult);
        break;
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Execute the script
run();
