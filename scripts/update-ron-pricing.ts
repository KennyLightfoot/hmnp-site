import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateRONPricing() {
  console.log('🔍 Checking existing RON services...');
  
  // Find existing RON services
  const existingRONServices = await prisma.service.findMany({
    where: {
      OR: [
        { name: { contains: 'RON', mode: 'insensitive' } },
        { name: { contains: 'Remote Online', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${existingRONServices.length} existing RON services:`);
  existingRONServices.forEach(service => {
    console.log(`- ${service.name}: $${service.price} (ID: ${service.id})`);
  });

  // Texas-compliant RON services
  const texasCompliantRONServices = [
    {
      id: 'ron_acknowledgment_tx',
      name: 'RON Acknowledgment (Texas Compliant)',
      serviceType: 'STANDARD_NOTARY',
      price: 35.00, // $25 RON + $10 acknowledgment
      depositAmount: 0.00,
      requiresDeposit: false,
      isActive: true,
      description: 'Texas-compliant Remote Online Notarization for acknowledgments. $25 RON service fee + $10 acknowledgment fee per TX Gov\'t Code §406.111 & §406.024. Additional signers: +$1 each.',
      duration: 45,
    },
    {
      id: 'ron_oath_tx',
      name: 'RON Oath/Affirmation (Texas Compliant)',
      serviceType: 'STANDARD_NOTARY',
      price: 35.00, // $25 RON + $10 oath
      depositAmount: 0.00,
      requiresDeposit: false,
      isActive: true,
      description: 'Texas-compliant Remote Online Notarization for oaths and affirmations. $25 RON service fee + $10 oath fee per TX Gov\'t Code §406.111 & §406.024.',
      duration: 30,
    },
    {
      id: 'ron_business_tx',
      name: 'RON Business Documents (Texas Compliant)',
      serviceType: 'BUSINESS_SOLUTIONS',
      price: 35.00, // Base Texas-compliant rate
      depositAmount: 0.00,
      requiresDeposit: false,
      isActive: true,
      description: 'Texas-compliant Remote Online Notarization for business documents. $25 RON service fee + applicable notarial act fees per TX Gov\'t Code §406.111 & §406.024.',
      duration: 60,
    }
  ];

  console.log('\n🔄 Updating/Creating Texas-compliant RON services...');

  for (const service of texasCompliantRONServices) {
    try {
      const upsertedService = await prisma.service.upsert({
        where: { id: service.id },
        update: {
          name: service.name,
          serviceType: service.serviceType as any,
          price: service.price,
          depositAmount: service.depositAmount,
          requiresDeposit: service.requiresDeposit,
          isActive: service.isActive,
          description: service.description,
          duration: service.duration,
          updatedAt: new Date(),
        },
        create: {
          ...service,
          serviceType: service.serviceType as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      console.log(`✅ Upserted: ${upsertedService.name} - $${upsertedService.price}`);
    } catch (error) {
      console.error(`❌ Error upserting ${service.name}:`, error);
    }
  }

  // Deactivate old non-compliant RON services
  console.log('\n🔄 Deactivating old non-compliant RON services...');
  
  for (const oldService of existingRONServices) {
    if (!texasCompliantRONServices.find(newService => newService.id === oldService.id)) {
      try {
        await prisma.service.update({
          where: { id: oldService.id },
          data: {
            isActive: false,
            name: `${oldService.name} (Deprecated - Non-TX Compliant)`,
            updatedAt: new Date(),
          }
        });
        console.log(`🔄 Deactivated: ${oldService.name}`);
      } catch (error) {
        console.error(`❌ Error deactivating ${oldService.name}:`, error);
      }
    }
  }

  console.log('\n✅ RON pricing update completed!');
  
  // Show final RON services
  const updatedRONServices = await prisma.service.findMany({
    where: {
      OR: [
        { name: { contains: 'RON', mode: 'insensitive' } },
        { name: { contains: 'Remote Online', mode: 'insensitive' } }
      ]
    },
    orderBy: { isActive: 'desc' }
  });

  console.log('\n📋 Final RON Services:');
  updatedRONServices.forEach(service => {
    const status = service.isActive ? '✅ Active' : '❌ Inactive';
    console.log(`${status} - ${service.name}: $${service.price}`);
  });
}

updateRONPricing()
  .catch((e) => {
    console.error('❌ Error updating RON pricing:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 