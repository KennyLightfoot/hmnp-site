#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

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
    key: 'bookingBuffer',
    value: '60',
    dataType: 'number',
    description: 'Buffer time between appointments in minutes',
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
    key: 'slotInterval',
    value: '15',
    dataType: 'number',
    description: 'Time slot interval in minutes (15, 30, 60)',
    category: 'booking'
  },
  {
    key: 'holidays',
    value: JSON.stringify([
      '2025-01-01', // New Year's Day
      '2025-07-04', // Independence Day
      '2025-11-28', // Thanksgiving
      '2025-11-29', // Black Friday
      '2025-12-25'  // Christmas
    ]),
    dataType: 'json',
    description: 'Holiday dates (no availability)',
    category: 'booking'
  },
  {
    key: 'blackoutDates',
    value: JSON.stringify([]),
    dataType: 'json',
    description: 'Blackout dates for bookings',
    category: 'booking'
  },
  {
    key: 'emergencyMode',
    value: 'false',
    dataType: 'boolean',
    description: 'Emergency mode flag (disables normal booking)',
    category: 'booking'
  }
]

async function setupBusinessSettings() {
  console.log('🚀 Setting up Business Settings...\n')

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Set' : '❌ Missing')
    process.exit(1)
  }

  console.log('🔍 Environment Check:')
  console.log('   Supabase URL:', supabaseUrl)
  console.log('   Service Role Key:', serviceRoleKey.substring(0, 20) + '...')
  console.log()

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test connection
    console.log('🔍 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)

    // This will fail but tells us if we can connect
    if (testError && !testError.message.includes('does not exist')) {
      console.error('❌ Connection failed:', testError.message)
      process.exit(1)
    }
    console.log('✅ Supabase connection successful!\n')

    // Create BusinessSettings table if it doesn't exist
    console.log('🔧 Creating BusinessSettings table...')
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS "BusinessSettings" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          "dataType" TEXT DEFAULT 'string',
          description TEXT,
          category TEXT,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedById" TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_business_settings_key ON "BusinessSettings"(key);
        CREATE INDEX IF NOT EXISTS idx_business_settings_category ON "BusinessSettings"(category);
      `
    })

    if (createError) {
      console.error('❌ Failed to create table:', createError.message)
      // Try alternative approach with direct SQL
      console.log('🔄 Trying alternative table creation...')
      
      const { error: altError } = await supabase
        .from('BusinessSettings')
        .select('*')
        .limit(1)
        
      if (altError && altError.message.includes('does not exist')) {
        console.error('❌ BusinessSettings table does not exist and cannot be created automatically.')
        console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:')
        console.log('   https://supabase.com/dashboard/project/czxoxhokegnzfctgnhjo/sql\n')
        console.log(`CREATE TABLE IF NOT EXISTS "BusinessSettings" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  "dataType" TEXT DEFAULT 'string',
  description TEXT,
  category TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedById" TEXT
);`)
        console.log('\nThen run this script again.')
        process.exit(1)
      }
    } else {
      console.log('✅ BusinessSettings table ready!\n')
    }

    // Insert/update business settings
    console.log('📝 Inserting business settings...')
    
    for (const setting of BUSINESS_SETTINGS) {
      console.log(`   - Setting up: ${setting.key}`)
      
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
        })

      if (error) {
        console.error(`   ❌ Failed to set ${setting.key}:`, error.message)
      } else {
        console.log(`   ✅ ${setting.key} configured`)
      }
    }

    // Verify settings
    console.log('\n🔍 Verifying business settings...')
    const { data: settings, error: fetchError } = await supabase
      .from('BusinessSettings')
      .select('*')
      .eq('category', 'booking')
      .order('key')

    if (fetchError) {
      console.error('❌ Failed to fetch settings:', fetchError.message)
    } else {
      console.log(`✅ Found ${settings.length} booking settings:`)
      settings.forEach(setting => {
        console.log(`   - ${setting.key}: ${setting.dataType} (${setting.description})`)
      })
    }

    console.log('\n🎉 Business settings setup complete!')
    console.log('\n🔗 Next steps:')
    console.log('   1. Test time slot generation: npm run test:availability')
    console.log('   2. Deploy to Vercel: vercel --prod')
    console.log('   3. Test booking flow: https://houstonmobilenotarypros.com/book')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupBusinessSettings()
}

export { setupBusinessSettings }
