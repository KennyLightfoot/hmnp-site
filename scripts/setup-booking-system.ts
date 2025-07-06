import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupBookingSystem() {
  console.log('🔧 Setting up booking system database records...')
  
  // Create default BusinessSettings if missing
  const businessSettings = await prisma.businessSettings.upsert({
    where: { id: process.env.BUSINESS_SETTINGS_ID || 'default' },
    update: {},
    create: {
      id: process.env.BUSINESS_SETTINGS_ID || 'default',
      businessName: 'Healthcare Mobile Nurse Practitioner',
      timezone: process.env.DEFAULT_TIMEZONE || 'America/Chicago',
      serviceAreaRadius: parseInt(process.env.SERVICE_AREA_RADIUS || '50'),
      businessHours: {
        monday: { open: '08:00', close: '17:00', isOpen: true },
        tuesday: { open: '08:00', close: '17:00', isOpen: true },
        wednesday: { open: '08:00', close: '17:00', isOpen: true },
        thursday: { open: '08:00', close: '17:00', isOpen: true },
        friday: { open: '08:00', close: '17:00', isOpen: true },
        saturday: { open: '09:00', close: '15:00', isOpen: true },
        sunday: { open: '10:00', close: '14:00', isOpen: false }
      },
      defaultBookingDuration: 60,
      bufferTimeBetweenBookings: 15,
      advanceBookingDays: 30,
      cancellationPolicy: '24 hours notice required',
      acceptsInsurance: true,
      requiresDeposit: true,
      depositAmount: 50.00
    }
  })
  
  console.log('✅ BusinessSettings configured:', businessSettings.id)
  
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
      update: service,
      create: service
    })
    console.log(`✅ Service configured: ${service.name}`)
  }
  
  console.log('🎉 Booking system setup complete!')
}

setupBookingSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect())