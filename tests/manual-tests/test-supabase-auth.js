import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testAuth() {
  console.log('🔐 Testing Supabase Auth...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️  Auth error (expected - no session):', error.message)
    } else {
      console.log('✅ Auth system accessible')
    }
    
    // Test database access
    const { data: dbData, error: dbError } = await supabase
      .from('Service')
      .select('*')
      .limit(1)
    
    if (dbError) {
      console.log('⚠️  Database access error:', dbError.message)
    } else {
      console.log('✅ Database access working')
      console.log('Found services:', dbData?.length || 0)
    }
    
    console.log('\n🎉 Supabase integration test complete!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAuth() 