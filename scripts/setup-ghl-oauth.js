#!/usr/bin/env node

/**
 * 🔐 GoHighLevel OAuth2 Setup Helper
 * Houston Mobile Notary Pros
 * 
 * Helps set up OAuth2 authentication for GHL Private Integration API V2
 */

import fetch from 'node-fetch';
import { createServer } from 'http';
import { URL } from 'url';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  CLIENT_ID: process.env.GHL_CLIENT_ID,
  CLIENT_SECRET: process.env.GHL_CLIENT_SECRET,
  REDIRECT_URI: process.env.GHL_REDIRECT_URI || 'http://localhost:8080/callback',
  SCOPES: ['calendars.readwrite', 'events.readwrite', 'locations.readonly'],
  BASE_URL: 'https://marketplace.leadconnectorhq.com',
  API_URL: 'https://services.leadconnectorhq.com'
};

class GHLOAuthSetup {
  constructor() {
    this.server = null;
    this.tokens = null;
  }

  generateAuthUrl() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CONFIG.CLIENT_ID,
      redirect_uri: CONFIG.REDIRECT_URI,
      scope: CONFIG.SCOPES.join(' '),
      state: Math.random().toString(36).substring(7) // CSRF protection
    });

    return `${CONFIG.BASE_URL}/oauth/chooselocation?${params}`;
  }

  async exchangeCodeForTokens(code) {
    console.log('🔄 Exchanging authorization code for tokens...');

    const response = await fetch(`${CONFIG.API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET,
        code: code,
        redirect_uri: CONFIG.REDIRECT_URI
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${error}`);
    }

    const tokenData = await response.json();
    
    this.tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000),
      scope: tokenData.scope,
      location_id: tokenData.locationId
    };

    return this.tokens;
  }

  async saveTokensToEnv() {
    const envPath = path.join(__dirname, '../.env.local');
    let envContent = '';

    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      console.log('📝 Creating new .env.local file');
    }

    // Update or add OAuth tokens
    const updates = {
      'GHL_ACCESS_TOKEN': this.tokens.access_token,
      'GHL_REFRESH_TOKEN': this.tokens.refresh_token,
      'GHL_LOCATION_ID': this.tokens.location_id
    };

    for (const [key, value] of Object.entries(updates)) {
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(
          new RegExp(`${key}=.*`, 'g'),
          `${key}=${value}`
        );
      } else {
        envContent += `\n${key}=${value}`;
      }
    }

    await fs.writeFile(envPath, envContent.trim() + '\n');
    console.log('✅ Tokens saved to .env.local');
  }

  async startCallbackServer() {
    return new Promise((resolve, reject) => {
      this.server = createServer(async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        if (url.pathname === '/callback') {
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body>
                  <h1>❌ OAuth Error</h1>
                  <p>Error: ${error}</p>
                  <p>Description: ${url.searchParams.get('error_description')}</p>
                </body>
              </html>
            `);
            reject(new Error(`OAuth error: ${error}`));
            return;
          }

          if (code) {
            try {
              await this.exchangeCodeForTokens(code);
              await this.saveTokensToEnv();

              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: green;">✅ OAuth Setup Complete!</h1>
                    <p>Your GHL integration has been successfully authenticated.</p>
                    <p><strong>Location ID:</strong> ${this.tokens.location_id}</p>
                    <p><strong>Scopes:</strong> ${this.tokens.scope}</p>
                    <p>You can now close this window and return to your terminal.</p>
                    <script>
                      setTimeout(() => window.close(), 3000);
                    </script>
                  </body>
                </html>
              `);

              resolve(this.tokens);
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body>
                    <h1>❌ Token Exchange Failed</h1>
                    <p>${error.message}</p>
                  </body>
                </html>
              `);
              reject(error);
            }
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });

      this.server.listen(8080, () => {
        console.log('🌐 OAuth callback server started on http://localhost:8080');
      });
    });
  }

  async cleanup() {
    if (this.server) {
      this.server.close();
      console.log('🔌 Callback server stopped');
    }
  }
}

// Main function
async function main() {
  console.log('🔐 GHL OAuth2 Setup - Houston Mobile Notary Pros');
  console.log('==============================================\n');

  // Validate configuration
  if (!CONFIG.CLIENT_ID || !CONFIG.CLIENT_SECRET) {
    console.error('❌ Missing required environment variables:');
    console.error('   GHL_CLIENT_ID - Your GHL app client ID');
    console.error('   GHL_CLIENT_SECRET - Your GHL app client secret');
    console.error('\nPlease add these to your .env.local file');
    process.exit(1);
  }

  const oauth = new GHLOAuthSetup();

  try {
    // Generate and display authorization URL
    const authUrl = oauth.generateAuthUrl();
    
    console.log('📋 Follow these steps:');
    console.log('1. Open the following URL in your browser:');
    console.log(`\n   ${authUrl}\n`);
    console.log('2. Log in to your GoHighLevel account');
    console.log('3. Choose the location you want to integrate');
    console.log('4. Authorize the application');
    console.log('5. Return to this terminal (the page will redirect automatically)\n');

    // Start callback server and wait for authorization
    console.log('⏳ Waiting for authorization...');
    const tokens = await oauth.startCallbackServer();

    console.log('\n✅ OAuth setup completed successfully!');
    console.log(`📍 Location ID: ${tokens.location_id}`);
    console.log(`🔑 Access token expires: ${new Date(tokens.expires_at).toLocaleString()}`);
    console.log('\n🚀 You can now run: pnpm setup-ghl-calendars');

  } catch (error) {
    console.error('\n❌ OAuth setup failed:', error.message);
    process.exit(1);
  } finally {
    await oauth.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { GHLOAuthSetup }; 