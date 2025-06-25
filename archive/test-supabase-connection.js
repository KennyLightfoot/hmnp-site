import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n📡 Testing basic connection...')
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1)
    
    if (error) {
      console.log('⚠️  No _prisma_migrations table yet (expected for new DB)')
      console.log('Error:', error.message)
    } else {
      console.log('✅ Database connection successful!')
      console.log('Found migrations:', data?.length || 0)
    }

    // Test auth
    console.log('\n🔐 Testing auth...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('⚠️  Auth error (expected - no session):', authError.message)
    } else {
      console.log('✅ Auth system accessible')
    }

    console.log('\n🎉 Supabase connection test complete!')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    process.exit(1)
  }
}

testConnection() 