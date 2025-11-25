import readline from 'readline';
import https from 'https';
import { URLSearchParams } from 'url';
import fs from 'fs';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local and .env files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load .env.local first (higher priority), then .env
dotenv.config({ path: join(projectRoot, '.env.local') });
dotenv.config({ path: join(projectRoot, '.env') });

// Your OAuth credentials (you'll need to fill these in)
const CLIENT_ID = process.env.GOOGLE_MY_BUSINESS_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';

// Use localhost callback server (works with all OAuth clients)
let PORT = 8080;
let REDIRECT_URI = `http://localhost:${PORT}/callback`;

const SCOPE = 'https://www.googleapis.com/auth/business.manage';

console.log('🚀 GMB Refresh Token Helper\n');

if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET_HERE') {
  console.log('❌ Please set your GOOGLE_MY_BUSINESS_CLIENT_ID and GOOGLE_MY_BUSINESS_CLIENT_SECRET environment variables first!');
  console.log('\nExample:');
  console.log('$env:GOOGLE_MY_BUSINESS_CLIENT_ID="your_client_id"');
  console.log('$env:GOOGLE_MY_BUSINESS_CLIENT_SECRET="your_client_secret"');
  console.log('node scripts/get-gmb-refresh-token.js');
  process.exit(1);
}

console.log('📋 IMPORTANT: Before proceeding, verify this redirect URI is in your Google OAuth client:');
console.log(`   http://localhost:8080/callback\n`);
console.log('Steps to verify:');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Make sure you\'re in the CORRECT project');
console.log('3. Click on your OAuth 2.0 Client ID (the one matching your CLIENT_ID)');
console.log('4. Under "Authorized redirect URIs", verify this EXACT URI exists:');
console.log('   http://localhost:8080/callback');
console.log('5. If it\'s missing, add it and click "SAVE"\n');
console.log(`📌 Your current CLIENT_ID: ${CLIENT_ID?.substring(0, 30)}...`);
console.log('   Make sure this matches the OAuth client you\'re checking!\n');

// Start local callback server
let callbackServer = null;
let authCode = null;
let serverError = null;

function startCallbackServer() {
  return new Promise((resolve, reject) => {
    callbackServer = createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      
      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>OAuth Error</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h1>❌ OAuth Error</h1>
                <p><strong>Error:</strong> ${error}</p>
                <p><strong>Description:</strong> ${url.searchParams.get('error_description') || 'No description'}</p>
                <p>Please close this window and try again.</p>
              </body>
            </html>
          `);
          serverError = error;
          callbackServer.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }
        
        if (code) {
          authCode = code;
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Authorization Successful</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                <h1>✅ Authorization Successful!</h1>
                <p>You can close this window now.</p>
                <p>The authorization code has been received.</p>
              </body>
            </html>
          `);
          callbackServer.close();
          resolve(code);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Error</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h1>❌ Error</h1>
                <p>No authorization code received.</p>
              </body>
            </html>
          `);
          callbackServer.close();
          reject(new Error('No authorization code received'));
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
    
    callbackServer.listen(PORT, () => {
      console.log(`✅ Local callback server started on http://localhost:${PORT}\n`);
      resolve();
    });
    
    callbackServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${PORT} is already in use. Trying port ${PORT + 1}...\n`);
        PORT = PORT + 1;
        REDIRECT_URI = `http://localhost:${PORT}/callback`;
        callbackServer.close();
        startCallbackServer().then(resolve).catch(reject);
      } else {
        reject(error);
      }
    });
  });
}

async function main() {
  try {
    // Start callback server first (this sets the correct PORT and REDIRECT_URI)
    await startCallbackServer();
    
    // Generate authorization URL AFTER server starts (so we have the correct redirect URI)
    const authParams = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
    
    console.log('📋 Step 1: Visit this URL to authorize the application:');
    console.log('\n' + authUrl + '\n');
    console.log(`📌 Using redirect URI: ${REDIRECT_URI}`);
    console.log('   Make sure this EXACT URI is in your Google Cloud Console!\n');
    console.log('⚠️  The browser will redirect to localhost after authorization.');
    console.log('   This is normal - the script will automatically capture the code.\n');
    console.log('⏳ Waiting for authorization...\n');
    
    // Wait for authorization code
    const code = await new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (authCode) {
          clearInterval(checkInterval);
          resolve(authCode);
        } else if (serverError) {
          clearInterval(checkInterval);
          reject(new Error(serverError));
        }
      }, 100);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        if (callbackServer) callbackServer.close();
        reject(new Error('Authorization timeout - please try again'));
      }, 300000);
    });
    
    console.log('✅ Authorization code received!\n');
    // Step 2: Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI
    });

  const tokenData = tokenParams.toString();

  const options = {
    hostname: 'oauth2.googleapis.com',
    port: 443,
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(tokenData)
    }
  };

    console.log('🔄 Exchanging authorization code for tokens...');

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            console.log('❌ Error:', response.error_description || response.error);
            console.log('Full error:', JSON.stringify(response, null, 2));
            process.exit(1);
            return;
          }

          console.log('\n✅ Success! Here are your tokens:');
          console.log('\n📋 Add this to your .env.local file:');
          console.log('─'.repeat(60));
          console.log(`GOOGLE_MY_BUSINESS_REFRESH_TOKEN="${response.refresh_token}"`);
          console.log('─'.repeat(60));
          
          if (response.access_token) {
            console.log('\n💡 Access token (expires in ' + response.expires_in + ' seconds):');
            console.log(response.access_token.substring(0, 50) + '...');
            
            // Save tokens to a temp file for the next script
            const tokenFile = {
              refresh_token: response.refresh_token,
              access_token: response.access_token,
              expires_in: response.expires_in,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET
            };
            
            try {
              fs.writeFileSync('/tmp/gmb-tokens.json', JSON.stringify(tokenFile, null, 2));
              console.log('\n💾 Tokens saved to /tmp/gmb-tokens.json for next script');
            } catch (err) {
              console.log('\n⚠️  Could not save to /tmp/gmb-tokens.json (this is okay on Windows)');
            }
          }
          
          console.log('\n✅ Done! You can now run: node scripts/verify-gmb-credentials.js');
          process.exit(0);
        } catch (error) {
          console.log('❌ Error parsing response:', error.message);
          console.log('Raw response:', data);
          process.exit(1);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      process.exit(1);
    });

    req.write(tokenData);
    req.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (callbackServer) callbackServer.close();
    process.exit(1);
  }
}

main(); 