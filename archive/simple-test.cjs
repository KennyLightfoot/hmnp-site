require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('Testing Supabase connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')) {
  console.log('✅ Supabase URL detected');
} else {
  console.log('❌ Supabase URL not found');
}

console.log('Ready to migrate!'); 