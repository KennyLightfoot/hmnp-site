import readline from 'readline';
import https from 'https';
import { URLSearchParams } from 'url';
import fs from 'fs';

// Your OAuth credentials (you'll need to fill these in)
const CLIENT_ID = process.env.GOOGLE_MY_BUSINESS_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GOOGLE_MY_BUSINESS_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'https://houstonmobilenotarypros.com/api/auth/callback/google'; // Use your production callback

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

// Step 1: Generate authorization URL
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
console.log('⚠️  NOTE: After authorization, you will be redirected to your website.');
console.log('   The authorization code will be in the URL parameter "code".');
console.log('   Copy just the code value (after "code=") from the URL bar.\n');

// Step 2: Get authorization code from user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('📝 Step 2: Enter the authorization code from the URL (after "code="): ', (authCode) => {
  if (!authCode.trim()) {
    console.log('❌ No authorization code provided!');
    rl.close();
    return;
  }

  // Step 3: Exchange authorization code for tokens
  const tokenParams = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: authCode.trim(),
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

  console.log('\n🔄 Exchanging authorization code for tokens...');

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
          rl.close();
          return;
        }

        console.log('\n✅ Success! Here are your tokens:');
        console.log('\n📋 Add these to your environment variables:');
        console.log('─'.repeat(60));
        console.log(`GOOGLE_MY_BUSINESS_REFRESH_TOKEN="${response.refresh_token}"`);
        console.log('─'.repeat(60));
        
        if (response.access_token) {
          console.log('\n💡 Access token (expires in ' + response.expires_in + ' seconds):');
          console.log(response.access_token);
          
          // Save tokens to a temp file for the next script
          const tokenFile = {
            refresh_token: response.refresh_token,
            access_token: response.access_token,
            expires_in: response.expires_in,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
          };
          
          fs.writeFileSync('/tmp/gmb-tokens.json', JSON.stringify(tokenFile, null, 2));
          console.log('\n💾 Tokens saved to /tmp/gmb-tokens.json for next script');
        }
        
        rl.close();
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
        rl.close();
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
    rl.close();
  });

  req.write(tokenData);
  req.end();
}); 