import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupBookingSystem() {
  console.log('🔧 Setting up booking system database records...')
  
  // Create default BusinessSettings if missing
  // Note: BusinessSettings model uses key-value structure, not direct fields
  const businessSettingsData = [
    {
      key: 'business_name',
      value: 'Healthcare Mobile Nurse Practitioner',
      dataType: 'string',
      category: 'business',
      description: 'Business name'
    },
    {
      key: 'timezone',
      value: process.env.DEFAULT_TIMEZONE || 'America/Chicago',
      dataType: 'string',
      category: 'business',
      description: 'Default timezone'
    },
    {
      key: 'service_area_radius',
      value: process.env.SERVICE_AREA_RADIUS || '50',
      dataType: 'number',
      category: 'business',
      description: 'Service area radius in miles'
    }
  ]
  
  for (const setting of businessSettingsData) {
    await prisma.businessSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }
  
  console.log('✅ BusinessSettings configured')
  
  // Ensure required services exist
  const essentialServices = [
    {
      id: 'wellness-exam',
      name: 'Annual Wellness Exam',
      description: 'Comprehensive annual health check-up',
      basePrice: 200.00,
      duration: 60,
      isActive: true,
      serviceType: 'WELLNESS',
      locationTypes: ['HOME']
    },
    {
      id: 'urgent-care',
      name: 'Urgent Care Visit',
      description: 'Same-day urgent medical care',
      basePrice: 150.00,
      duration: 45,
      isActive: true,
      serviceType: 'URGENT_CARE',
      locationTypes: ['HOME']
    }
  ]
  
  for (const service of essentialServices) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        ...service,
        serviceType: service.serviceType as any,
        durationMinutes: service.duration,
      },
      create: {
        ...service,
        serviceType: service.serviceType as any,
        durationMinutes: service.duration,
      }
    })
    console.log(`✅ Service configured: ${service.name}`)
  }
  
  console.log('🎉 Booking system setup complete!')
}

setupBookingSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect())