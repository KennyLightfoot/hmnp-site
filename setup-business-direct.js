import { createClient } from '@supabase/supabase-js';

// Business settings configuration
const BUSINESS_SETTINGS = [
  {
    key: 'businessHours',
    value: JSON.stringify({
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '10:00', close: '15:00', isOpen: true },
      sunday: { open: '12:00', close: '16:00', isOpen: false }
    }),
    dataType: 'json',
    description: 'Business operating hours by day',
    category: 'booking'
  },
  {
    key: 'timeZone',
    value: 'America/Chicago',
    dataType: 'string',
    description: 'Business timezone (Houston, TX)',
    category: 'booking'
  },
  {
    key: 'slotInterval',
    value: '15',
    dataType: 'number',
    description: 'Time slot interval in minutes (15, 30, 60)',
    category: 'booking'
  },
  {
    key: 'minAdvanceBooking',
    value: '2',
    dataType: 'number',
    description: 'Minimum advance booking time in hours',
    category: 'booking'
  },
  {
    key: 'maxAdvanceBooking',
    value: '30',
    dataType: 'number',
    description: 'Maximum days in advance to allow booking',
    category: 'booking'
  },
  {
    key: 'defaultServiceDuration',
    value: '60',
    dataType: 'number',
    description: 'Default service duration in minutes',
    category: 'booking'
  },
  {
    key: 'bookingBuffer',
    value: '60',
    dataType: 'number',
    description: 'Buffer time between appointments in minutes',
    category: 'booking'
  }
];

async function setupBusinessSettings() {
  console.log('🚀 Setting up Business Settings for Houston Mobile Notary Pros...\n');

  const supabaseUrl = 'https://unnyhvuhobnmxnpffore.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubnlodnVob2JubXhucGZmb3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcyNzE3MiwiZXhwIjoyMDY2MzAzMTcyfQ.9zbdk4ZqmvSzRaO_a3WMpxcrHTdwpkxJ2JiYJRqO4o0';

  console.log('🔍 Environment Check:');
  console.log('   Supabase URL:', supabaseUrl);
  console.log('   Service Role Key:', serviceRoleKey.substring(0, 20) + '...');
  console.log();

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🔍 Testing Supabase connection...');

    // Check if BusinessSettings table exists
    console.log('🔍 Checking if BusinessSettings table exists...');
    const { data: existingSettings, error: checkError } = await supabase
      .from('BusinessSettings')
      .select('*')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('⚠️  BusinessSettings table does not exist.');
      console.log('📋 Please create it manually in Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/czxoxhokegnzfctgnhjo/sql\n');
      console.log(`CREATE TABLE IF NOT EXISTS "BusinessSettings" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  "dataType" TEXT DEFAULT 'string',
  description TEXT,
  category TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedById" TEXT
);`);
      console.log('\nThen run this script again!');
      return;
    }

    console.log('✅ BusinessSettings table exists!\n');

    // Insert/update business settings
    console.log('📝 Setting up business configuration...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const setting of BUSINESS_SETTINGS) {
      console.log(`   - Setting up: ${setting.key}`);
      
      const { error } = await supabase
        .from('BusinessSettings')
        .upsert({
          key: setting.key,
          value: setting.value,
          dataType: setting.dataType,
          description: setting.description,
          category: setting.category,
          updatedAt: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error(`   ❌ Failed to set ${setting.key}:`, error.message);
        errorCount++;
      } else {
        console.log(`   ✅ ${setting.key} configured`);
        successCount++;
      }
    }

    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} failed\n`);

    // Verify settings
    console.log('🔍 Verifying business settings...');
    const { data: settings, error: fetchError } = await supabase
      .from('BusinessSettings')
      .select('*')
      .eq('category', 'booking')
      .order('key');

    if (fetchError) {
      console.error('❌ Failed to fetch settings:', fetchError.message);
    } else {
      console.log(`✅ Found ${settings.length} booking settings:`);
      settings.forEach(setting => {
        console.log(`   - ${setting.key}: ${setting.dataType} (${setting.description})`);
      });
    }

    console.log('\n🎉 Business settings setup complete!');
    console.log('\n🔗 Next steps:');
    console.log('   1. Deploy to Vercel: vercel --prod');
    console.log('   2. Test booking flow: https://houstonmobilenotarypros.com/book');
    console.log('   3. Test time slots: curl "https://houstonmobilenotarypros.com/api/availability?date=2025-08-08&serviceType=STANDARD_NOTARY"');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupBusinessSettings();
