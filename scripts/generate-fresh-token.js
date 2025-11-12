#!/usr/bin/env node
/**
 * Generate fresh access token from refresh token
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read credentials from .env-gmb-temp
const envPath = path.join(__dirname, '.env-gmb-temp');
const envContent = fs.readFileSync(envPath, 'utf8');
const credentials = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) credentials[key.trim()] = value.trim();
});

const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = credentials;

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const tokenData = JSON.parse(data);
          resolve(tokenData.access_token);
        } else {
          reject(new Error(`Failed to get access token: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log('🔄 Generating fresh access token...');
    const accessToken = await getAccessToken();
    
    // Save to gmb-token.json
    const tokenPath = path.join(__dirname, 'gmb-token.json');
    fs.writeFileSync(tokenPath, JSON.stringify({ access_token: accessToken }, null, 2));
    
    console.log('✅ Access token saved to gmb-token.json');
    console.log(`Token: ${accessToken.substring(0, 30)}...`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();





