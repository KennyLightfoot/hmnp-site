import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBookingHealth() {
  console.log('🏥 Checking booking system health...\n')
  
  // Check database connection
  try {
    await prisma.$connect()
    console.log('✅ Database connection: OK')
  } catch (error) {
    console.log('❌ Database connection: FAILED')
    console.error(error)
    return
  }
  
  // Check BusinessSettings
  const businessSettings = await prisma.businessSettings.findFirst()
  if (businessSettings) {
    console.log('✅ BusinessSettings: OK')
  } else {
    console.log('❌ BusinessSettings: MISSING - Run setup script')
  }
  
  // Check Services
  const serviceCount = await prisma.service.count({ where: { isActive: true } })
  if (serviceCount > 0) {
    console.log(`✅ Active Services: ${serviceCount} found`)
  } else {
    console.log('❌ Active Services: NONE - Run setup script')
  }
  
  // Check Environment Variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY', 
    'STRIPE_PUBLISHABLE_KEY',
    'GHL_API_KEY',
    'GHL_LOCATION_ID',
    'BUSINESS_SETTINGS_ID'
  ]
  
  console.log('\n📋 Environment Variables:')
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Set`)
    } else {
      console.log(`❌ ${envVar}: MISSING`)
    }
  }
  
  await prisma.$disconnect()
}

checkBookingHealth()