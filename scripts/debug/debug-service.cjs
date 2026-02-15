const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testServiceQuery() {
  try {
    const serviceId = 'cmb8ovso10000ve9xwvtf0my0';
    
    console.log('Testing service query...');
    
    // Test the exact query from the API
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    
    if (!service) {
      console.log('❌ Service not found');
      return;
    }
    
    console.log('✅ Service found:');
    console.log('- ID:', service.id);
    console.log('- Name:', service.name);
    console.log('- Duration:', service.durationMinutes);
    console.log('- Active:', service.isActive);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

testServiceQuery();