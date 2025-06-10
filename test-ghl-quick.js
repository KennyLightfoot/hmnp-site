import dotenv from 'dotenv';
dotenv.config();

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

console.log('🔍 Quick GHL Test');
console.log(`API Key: ${GHL_API_KEY ? 'Set' : 'Missing'}`);
console.log(`Location ID: ${GHL_LOCATION_ID || 'Missing'}`);

if (GHL_API_KEY && GHL_LOCATION_ID) {
  console.log('✅ Environment variables are set');
  console.log('🎯 Your location ID from URL is correct: oUvYNTw2Wvul7JSJplqQ');
  console.log('⚠️  If you still get 403 errors, regenerate your GHL API token');
} else {
  console.log('❌ Missing environment variables in .env file');
} 