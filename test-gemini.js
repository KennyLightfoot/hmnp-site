// Test Gemini API connection
require('dotenv').config({path: '.env.local'});

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🤖 Testing Gemini AI API Connection...\n');

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    console.log('✅ Gemini API key found');

    // Initialize the model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('✅ Gemini model initialized');

    // Test a simple prompt
    console.log('🧪 Testing with a simple prompt...');
    const prompt = "Say 'Hello from HMNP!' in a friendly way.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS! Gemini API is working!');
    console.log(`🤖 Response: ${text}`);

    console.log('\n🎉 Gemini AI integration is ready!');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 This usually means:');
      console.log('1. The API key is invalid, or');
      console.log('2. The API key doesn\'t have the right permissions');
      console.log('\n🔧 To fix:');
      console.log('1. Go to https://makersuite.google.com/app/apikey');
      console.log('2. Create a new API key');
      console.log('3. Update your .env.local file');
    }
  }
}

testGemini(); 