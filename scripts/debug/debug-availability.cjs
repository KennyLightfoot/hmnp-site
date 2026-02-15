const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAvailability() {
  try {
    // Test the exact logic from the API
    const date = '2025-06-28';
    const serviceId = 'cmb8ovso10000ve9xwvtf0my0';
    
    console.log('🔍 Testing availability logic...');
    console.log('Date:', date);
    console.log('Service ID:', serviceId);
    
    // Get service
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      console.log('❌ Service not found');
      return;
    }
    console.log('✅ Service found:', service.name);
    
    // Get business settings
    const businessSettingsRecords = await prisma.businessSettings.findMany();
    const businessSettings = {};
    businessSettingsRecords.forEach(setting => {
      businessSettings[setting.key] = setting.value;
    });
    
    console.log('✅ Business settings loaded:', Object.keys(businessSettings).length, 'keys');
    
    // Check specific day (Friday = 5)
    const testDate = new Date(date + 'T12:00:00.000Z');
    const dayOfWeek = testDate.getDay();
    console.log('Day of week:', dayOfWeek);
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    const startTimeKey = `business_hours_${dayName}_start`;
    const endTimeKey = `business_hours_${dayName}_end`;
    
    console.log('Looking for keys:', startTimeKey, endTimeKey);
    console.log('Start time:', businessSettings[startTimeKey]);
    console.log('End time:', businessSettings[endTimeKey]);
    
    if (businessSettings[startTimeKey] && businessSettings[endTimeKey]) {
      console.log('✅ Business hours found for', dayName);
      
      // Test the business hours function
      const businessHours = {
        startTime: businessSettings[startTimeKey],
        endTime: businessSettings[endTimeKey],
        dayOfWeek: dayOfWeek
      };
      
      console.log('✅ Business hours object:', businessHours);
    } else {
      console.log('❌ Business hours not found for', dayName);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error(error.stack);
    await prisma.$disconnect();
  }
}

debugAvailability();