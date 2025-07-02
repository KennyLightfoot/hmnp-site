const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Direct Connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('📍 Service Key:', supabaseServiceKey ? 'SET' : 'NOT SET');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase credentials not properly configured');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('⏱️  Testing Supabase connectivity...');
    const { data, error } = await supabase.from('User').select('count');
    
    if (error) {
      console.error('❌ Supabase connection failed:');
      console.error('Error:', error);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Data:', data);
    }
    
  } catch (error) {
    console.error('❌ Supabase connection failed:');
    console.error('Error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });
testSupabaseConnection();