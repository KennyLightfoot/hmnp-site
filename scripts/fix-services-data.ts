import { PrismaClient, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function fixServicesData() {
  try {
    console.log('🔍 Checking database connectivity...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Check current service count
    const serviceCount = await prisma.service.count();
    console.log(`📊 Current services in database: ${serviceCount}`);

    if (serviceCount === 0) {
      console.log('🚨 No services found - seeding database...');
      await seedRequiredServices();
    } else {
      console.log('✅ Services exist - checking if they match SOP requirements...');
      await validateAndFixServices();
    }

    // Test the services endpoint
    console.log('🧪 Testing services endpoint...');
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        serviceType: true,
        basePrice: true,
        isActive: true
      }
    });
    
    console.log('📋 Active services found:');
    services.forEach(service => {
      console.log(`  - ${service.name} (${service.serviceType}): $${service.basePrice}`);
    });

    if (services.length === 0) {
      throw new Error('No active services found after seeding attempt');
    }

    console.log('✅ Services endpoint should now work properly');
    
  } catch (error) {
    console.error('❌ Error fixing services data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedRequiredServices() {
  console.log('🌱 Seeding required services based on SOP_ENHANCED.md...');
  
  // Services based on SOP requirements
  const requiredServices = [
    {
      id: 'standard-notary-001',
      name: 'Standard Notary',
      description: '9am-5pm Mon-Fri, up to 2 documents, 1-2 signers, 15-mile travel included',
      serviceType: ServiceType.STANDARD_NOTARY,
      durationMinutes: 60,
      basePrice: 75.00,
      requiresDeposit: false,
      depositAmount: 0.00,
      isActive: true,
      externalCalendarId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'extended-hours-001',
      name: 'Extended Hours Notary',
      description: '7am-9pm Daily, up to 5 documents, 2 signers, 20-mile travel included',
      serviceType: ServiceType.EXTENDED_HOURS_NOTARY,
      durationMinutes: 90,
      basePrice: 100.00,
      requiresDeposit: false,
      depositAmount: 0.00,
      isActive: true,
      externalCalendarId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'loan-signing-001',
      name: 'Loan Signing Specialist',
      description: 'Flat fee service - unlimited documents for single session, up to 4 signers, 90-minute session',
      serviceType: ServiceType.LOAN_SIGNING_SPECIALIST,
      durationMinutes: 120,
      basePrice: 150.00,
      requiresDeposit: true,
      depositAmount: 50.00,
      isActive: true,
      externalCalendarId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  for (const service of requiredServices) {
    const created = await prisma.service.upsert({
      where: { id: service.id },
      update: {
        name: service.name,
        description: service.description,
        serviceType: service.serviceType,
        durationMinutes: service.durationMinutes,
        basePrice: service.basePrice,
        requiresDeposit: service.requiresDeposit,
        depositAmount: service.depositAmount,
        isActive: service.isActive,
        updatedAt: new Date(),
      },
      create: service,
    });
    
    console.log(`✅ Upserted service: ${service.name} (ID: ${service.id})`);
  }
}

async function validateAndFixServices() {
  console.log('🔧 Validating existing services against SOP requirements...');
  
  // Check for required service types
  const requiredTypes = [
    ServiceType.STANDARD_NOTARY,
    ServiceType.EXTENDED_HOURS_NOTARY,
    ServiceType.LOAN_SIGNING_SPECIALIST
  ];
  
  for (const type of requiredTypes) {
    const existing = await prisma.service.findFirst({
      where: { 
        serviceType: type,
        isActive: true 
      }
    });
    
    if (!existing) {
      console.log(`⚠️ Missing active service of type: ${type}`);
      // Create missing service based on type
      await createMissingService(type);
    } else {
      console.log(`✅ Found active service of type: ${type} - ${existing.name}`);
    }
  }
}

async function createMissingService(serviceType: ServiceType) {
  const serviceConfigs = {
    [ServiceType.STANDARD_NOTARY]: {
      name: 'Standard Notary',
      description: '9am-5pm Mon-Fri, up to 2 documents, 1-2 signers, 15-mile travel included',
      durationMinutes: 60,
      basePrice: 75.00,
      requiresDeposit: false,
      depositAmount: 0.00,
    },
    [ServiceType.EXTENDED_HOURS_NOTARY]: {
      name: 'Extended Hours Notary',
      description: '7am-9pm Daily, up to 5 documents, 2 signers, 20-mile travel included',
      durationMinutes: 90,
      basePrice: 100.00,
      requiresDeposit: false,
      depositAmount: 0.00,
    },
    [ServiceType.LOAN_SIGNING_SPECIALIST]: {
      name: 'Loan Signing Specialist',
      description: 'Flat fee service - unlimited documents for single session, up to 4 signers, 90-minute session',
      durationMinutes: 120,
      basePrice: 150.00,
      requiresDeposit: true,
      depositAmount: 50.00,
    }
  };
  
  const config = serviceConfigs[serviceType];
  if (!config) {
    console.log(`❌ No configuration found for service type: ${serviceType}`);
    return;
  }
  
  const service = await prisma.service.create({
    data: {
      id: `${serviceType.toLowerCase().replace('_', '-')}-${Date.now()}`,
      name: config.name,
      description: config.description,
      serviceType: serviceType,
      durationMinutes: config.durationMinutes,
      basePrice: config.basePrice,
      requiresDeposit: config.requiresDeposit,
      depositAmount: config.depositAmount,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  
  console.log(`✅ Created missing service: ${service.name} (${serviceType})`);
}

// Run the fix
fixServicesData()
  .then(() => {
    console.log('🎉 Services data fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Services data fix failed:', error);
    process.exit(1);
  });