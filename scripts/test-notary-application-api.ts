/**
 * Simple test script to verify the /api/notary/apply endpoint works
 * This can be run against staging/production to catch regression issues
 */

// Using built-in fetch (Node.js 18+)

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testNotaryApplicationAPI() {
  console.log('🧪 Testing /api/notary/apply endpoint...\n')
  console.log(`📍 Testing against: ${API_URL}\n`)

  const testData = {
    firstName: 'Test',
    lastName: 'Notary',
    email: `test-${Date.now()}@example.com`, // Unique email to avoid conflicts
    phone: '1234567890',
    commissionNumber: 'TEST123',
    commissionState: 'TX',
    commissionExpiry: '2025-12-31',
    statesLicensed: ['TX'],
    countiesServed: ['Harris'],
    yearsExperience: 5,
    serviceTypes: ['Standard Notary', 'Mobile Notary'],
    languagesSpoken: ['English'],
    specialCertifications: [],
    eoInsuranceProvider: 'Test Insurance',
    eoInsurancePolicy: 'POL123',
    eoInsuranceExpiry: '2025-12-31',
    baseAddress: '123 Test St',
    baseZip: '77001',
    serviceRadiusMiles: 25,
    availabilityNotes: 'Available weekdays',
    whyInterested: 'Test application',
    references: 'Test reference',
    resumeUrl: '',
    termsAccepted: true,
  }

  try {
    console.log('📤 Sending POST request to /api/notary/apply...')
    const response = await fetch(`${API_URL}/api/notary/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    const responseData = await response.json()

    console.log(`\n📥 Response Status: ${response.status}`)
    console.log(`📥 Response Body:`, JSON.stringify(responseData, null, 2))

    if (response.ok) {
      console.log('\n✅ SUCCESS: Application submitted successfully!')
      console.log(`   Application ID: ${responseData.applicationId}`)
      return true
    } else {
      console.log('\n❌ FAILED: Application submission failed')
      console.log(`   Error: ${responseData.error || 'Unknown error'}`)
      console.log(`   Message: ${responseData.message || 'No message provided'}`)
      
      // Check for schema-related errors
      if (response.status === 503 && responseData.error?.includes('Database configuration')) {
        console.log('\n⚠️  SCHEMA ERROR DETECTED:')
        console.log('   The database schema may be missing the NotaryApplication table or enums.')
        console.log('   Run: pnpm db:migrate')
      }
      
      return false
    }
  } catch (error) {
    console.error('\n💥 ERROR: Request failed:', error)
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`)
      
      // Check for connection errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.error('\n⚠️  CONNECTION ERROR:')
        console.error(`   Could not connect to ${API_URL}`)
        console.error('   Make sure the server is running:')
        console.error('   - For local: pnpm dev')
        console.error('   - For production: Set API_URL env var to production URL')
      }
      
      if (error.stack && process.env.NODE_ENV === 'development') {
        console.error(`   Stack: ${error.stack}`)
      }
    }
    return false
  }
}

// Run the test
testNotaryApplicationAPI()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

